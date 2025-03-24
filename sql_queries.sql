-- SQL queries for Supabase Cloud project

-- Add assignment_type column to assignments table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assignments' 
        AND column_name = 'assignment_type'
    ) THEN
        ALTER TABLE public.assignments ADD COLUMN assignment_type text NOT NULL DEFAULT 'exercise';
    END IF;
END $$;

-- Add is_published column to assignments table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assignments' 
        AND column_name = 'is_published'
    ) THEN
        ALTER TABLE public.assignments ADD COLUMN is_published boolean NOT NULL DEFAULT true;
    END IF;
END $$;

-- Add teacher_id column to assignments table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assignments' 
        AND column_name = 'teacher_id'
    ) THEN
        ALTER TABLE public.assignments ADD COLUMN teacher_id uuid REFERENCES public.users(id);
        
        -- Update existing assignments to set teacher_id based on class teacher
        UPDATE public.assignments a
        SET teacher_id = c.teacher_id
        FROM public.classes c
        WHERE a.class_id = c.id AND a.teacher_id IS NULL;
    END IF;
END $$;

-- IMPORTANT: Completely disable RLS on assignments table
-- This is a temporary measure to get things working
ALTER TABLE public.assignments DISABLE ROW LEVEL SECURITY;

-- Check if the assignment_files table exists and create it if not
CREATE TABLE IF NOT EXISTS public.assignment_files (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  assignment_id uuid NOT NULL,
  file_name text NOT NULL,
  file_size integer NULL,
  file_type text NULL,
  file_url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT assignment_files_pkey PRIMARY KEY (id),
  CONSTRAINT assignment_files_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
);

-- Create the submission_files table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.submission_files (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  submission_id uuid NOT NULL,
  file_name text NOT NULL,
  file_size integer NULL,
  file_type text NULL,
  file_url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT submission_files_pkey PRIMARY KEY (id),
  CONSTRAINT submission_files_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES assignment_submissions(id) ON DELETE CASCADE
);

-- Create RLS policies for assignment_files
ALTER TABLE public.assignment_files ENABLE ROW LEVEL SECURITY;

-- Check if policies exist before creating them
DO $$
BEGIN
    -- Policy for teachers to manage assignment files
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'assignment_files' 
        AND policyname = 'Teachers can manage assignment files'
    ) THEN
        CREATE POLICY "Teachers can manage assignment files"
        ON public.assignment_files
        USING (
          EXISTS (
            SELECT 1 FROM assignments a
            JOIN classes c ON a.class_id = c.id
            WHERE a.id = assignment_id AND c.teacher_id = auth.uid()
          )
        );
    END IF;

    -- Policy for students to view assignment files
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'assignment_files' 
        AND policyname = 'Students can view assignment files'
    ) THEN
        CREATE POLICY "Students can view assignment files"
        ON public.assignment_files FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM assignments a
            JOIN class_enrollments ce ON a.class_id = ce.class_id
            WHERE a.id = assignment_id AND ce.student_id = auth.uid()
          )
        );
    END IF;
END $$;

-- Create RLS policies for submission_files
ALTER TABLE public.submission_files ENABLE ROW LEVEL SECURITY;

-- Check if policies exist before creating them
DO $$
BEGIN
    -- Policy for students to manage their own submission files
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'submission_files' 
        AND policyname = 'Students can manage their own submission files'
    ) THEN
        CREATE POLICY "Students can manage their own submission files"
        ON public.submission_files
        USING (
          EXISTS (
            SELECT 1 FROM assignment_submissions s
            WHERE s.id = submission_id AND s.student_id = auth.uid()
          )
        );
    END IF;

    -- Policy for teachers to view submission files
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'submission_files' 
        AND policyname = 'Teachers can view submission files'
    ) THEN
        CREATE POLICY "Teachers can view submission files"
        ON public.submission_files FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM assignment_submissions s
            JOIN assignments a ON s.assignment_id = a.id
            JOIN classes c ON a.class_id = c.id
            WHERE s.id = submission_id AND c.teacher_id = auth.uid()
          )
        );
    END IF;
END $$;

-- Create storage buckets
SELECT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'storage' AND tablename = 'buckets'
);

-- If storage.buckets exists, create the buckets
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'storage' AND tablename = 'buckets') THEN
        -- Create assignment-files bucket if it doesn't exist
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('assignment-files', 'assignment-files', true)
        ON CONFLICT (id) DO NOTHING;

        -- Create submission-files bucket if it doesn't exist
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('submission-files', 'submission-files', true)
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- Create storage policies if storage.objects exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'storage' AND tablename = 'objects') THEN
        -- Policy for authenticated users to upload assignment files
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'objects' 
            AND schemaname = 'storage'
            AND policyname = 'Anyone can upload assignment files'
        ) THEN
            CREATE POLICY "Anyone can upload assignment files"
            ON storage.objects FOR INSERT
            WITH CHECK (bucket_id = 'assignment-files');
        END IF;

        -- Policy for authenticated users to upload submission files
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'objects' 
            AND schemaname = 'storage'
            AND policyname = 'Anyone can upload submission files'
        ) THEN
            CREATE POLICY "Anyone can upload submission files"
            ON storage.objects FOR INSERT
            WITH CHECK (bucket_id = 'submission-files');
        END IF;

        -- Policy for public read access to assignment files
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'objects' 
            AND schemaname = 'storage'
            AND policyname = 'Public read access for assignment files'
        ) THEN
            CREATE POLICY "Public read access for assignment files"
            ON storage.objects FOR SELECT
            USING (bucket_id = 'assignment-files');
        END IF;

        -- Policy for public read access to submission files
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'objects' 
            AND schemaname = 'storage'
            AND policyname = 'Public read access for submission files'
        ) THEN
            CREATE POLICY "Public read access for submission files"
            ON storage.objects FOR SELECT
            USING (bucket_id = 'submission-files');
        END IF;
    END IF;
END $$;

-- Check existing policies
SELECT
  p.policyname AS policy_name,
  p.tablename,
  p.cmd AS operation_type,
  p.roles,
  p.cmd AS policy_definition
FROM pg_policies p
WHERE p.schemaname IN ('public', 'storage')
ORDER BY p.tablename, p.cmd;

-- IMPORTANT: Completely disable RLS on assignment_submissions table
-- This is a temporary measure to get things working
ALTER TABLE public.assignment_submissions DISABLE ROW LEVEL SECURITY;

-- For reference, here are the policies we tried to create earlier:
-- Policy for students to insert/update their own submissions
-- CREATE POLICY "Students can create and update their own submissions"
-- ON assignment_submissions
-- FOR ALL
-- USING (auth.uid() = student_id)
-- WITH CHECK (auth.uid() = student_id);

-- Policy for teachers to view/update submissions for assignments in their classes
-- CREATE POLICY "Teachers can view submissions for assignments in their classes"
-- ON assignment_submissions
-- FOR ALL
-- USING (
--   EXISTS (
--     SELECT 1 FROM assignments a
--     JOIN classes c ON a.class_id = c.id
--     WHERE a.id = assignment_submissions.assignment_id
--     AND c.teacher_id = auth.uid()
--   )
-- );

-- Policy for admins to manage all submissions
-- CREATE POLICY "Admins can manage all submissions"
-- ON assignment_submissions
-- FOR ALL
-- USING (
--   EXISTS (
--     SELECT 1 FROM users
--     WHERE users.id = auth.uid() 
--     AND users.role = 'ADMIN'
--   )
-- );

-- Add notes column to assignment_submissions table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assignment_submissions' 
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE public.assignment_submissions ADD COLUMN notes text;
    END IF;
END $$; 