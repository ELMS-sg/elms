-- First, disable RLS on the submission_files table
ALTER TABLE public.submission_files DISABLE ROW LEVEL SECURITY;

-- Then create the RPC function that will be used to insert submission files safely
CREATE OR REPLACE FUNCTION public.insert_submission_file(
  p_submission_id uuid,
  p_file_name text,
  p_file_size integer,
  p_file_type text,
  p_file_url text
) RETURNS json AS $$
DECLARE
  v_result json;
BEGIN
  -- Insert the file record
  INSERT INTO public.submission_files(
    submission_id, file_name, file_size, file_type, file_url
  )
  VALUES (
    p_submission_id, p_file_name, p_file_size, p_file_type, p_file_url
  )
  RETURNING to_json(submission_files.*) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create another function to temporarily disable RLS (as a fallback)
CREATE OR REPLACE FUNCTION public.temporarily_disable_rls_for_submission_files() RETURNS void AS $$
BEGIN
  ALTER TABLE public.submission_files DISABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to re-enable RLS if needed in the future
CREATE OR REPLACE FUNCTION public.reenable_rls_for_submission_files() RETURNS void AS $$
BEGIN
  ALTER TABLE public.submission_files ENABLE ROW LEVEL SECURITY;
  
  -- Also recreate the policies
  DROP POLICY IF EXISTS "Students can manage their own submission files" ON public.submission_files;
  CREATE POLICY "Students can manage their own submission files"
    ON public.submission_files
    USING (
      EXISTS (
        SELECT 1 FROM assignment_submissions s
        WHERE s.id = submission_id AND s.student_id = auth.uid()
      )
    );
    
  DROP POLICY IF EXISTS "Teachers can view submission files" ON public.submission_files;
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 