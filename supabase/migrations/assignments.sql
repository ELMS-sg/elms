-- Complete database rebuild script
-- This script drops and recreates all tables to ensure type consistency

-- Drop all existing tables and types
DROP TABLE IF EXISTS submission_files CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS assignment_files CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS submission_status CASCADE;
DROP TYPE IF EXISTS assignment_type CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user role enum
CREATE TYPE user_role AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');

-- Create assignment types enum
CREATE TYPE assignment_type AS ENUM ('essay', 'exercise', 'quiz', 'recording', 'other');

-- Create submission status enum
CREATE TYPE submission_status AS ENUM ('draft', 'submitted', 'graded');

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create classes table
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    teacher_id UUID NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT classes_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create enrollments table
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    class_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT enrollments_class_id_fkey FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE(student_id, class_id)
);

-- Create assignments table
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    class_id UUID NOT NULL,
    teacher_id UUID NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    points INTEGER NOT NULL,
    assignment_type assignment_type NOT NULL DEFAULT 'other',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT assignments_class_id_fkey FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT assignments_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create assignment_files table
CREATE TABLE assignment_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT assignment_files_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
);

-- Create submissions table
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL,
    student_id UUID NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    grade INTEGER,
    feedback TEXT,
    status submission_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT submissions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    CONSTRAINT submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(assignment_id, student_id)
);

-- Create submission_files table
CREATE TABLE submission_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT submission_files_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
);

-- Create storage buckets for files
DO $$
BEGIN
    -- Check if the bucket already exists
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'assignment-files') THEN
        INSERT INTO storage.buckets (id, name, public) 
        VALUES ('assignment-files', 'assignment-files', true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'submission-files') THEN
        INSERT INTO storage.buckets (id, name, public) 
        VALUES ('submission-files', 'submission-files', true);
    END IF;
END $$;

-- Set up RLS (Row Level Security) policies
-- Users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Teachers can read student data" ON users;
DROP POLICY IF EXISTS "Admin access" ON users;

-- Allow users to read their own data
CREATE POLICY "Users can read their own data"
ON users FOR SELECT
TO authenticated
USING (auth.uid()::text = id::text);

-- Allow all authenticated users to read all user data
-- This avoids the infinite recursion when checking roles
CREATE POLICY "All users can read user data"
ON users FOR SELECT
TO authenticated
USING (true);

-- Classes table
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can create classes" ON classes;
DROP POLICY IF EXISTS "Teachers can update their own classes" ON classes;
DROP POLICY IF EXISTS "Everyone can read classes" ON classes;

CREATE POLICY "Teachers can create classes"
ON classes FOR INSERT
TO authenticated
WITH CHECK ((SELECT role FROM users WHERE id::text = auth.uid()::text) = 'TEACHER');

CREATE POLICY "Teachers can update their own classes"
ON classes FOR UPDATE
TO authenticated
USING (teacher_id::text = auth.uid()::text)
WITH CHECK (teacher_id::text = auth.uid()::text);

CREATE POLICY "Everyone can read classes"
ON classes FOR SELECT
TO authenticated
USING (true);

-- Enrollments table
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can see their enrollments" ON enrollments;
DROP POLICY IF EXISTS "Teachers can see class enrollments" ON enrollments;

CREATE POLICY "Students can see their enrollments"
ON enrollments FOR SELECT
TO authenticated
USING (student_id::text = auth.uid()::text);

CREATE POLICY "Teachers can see class enrollments"
ON enrollments FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM classes 
    WHERE classes.id = enrollments.class_id 
    AND classes.teacher_id::text = auth.uid()::text
));

-- Assignments table
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can create assignments" ON assignments;
DROP POLICY IF EXISTS "Teachers can update their own assignments" ON assignments;
DROP POLICY IF EXISTS "Everyone can read assignments" ON assignments;

CREATE POLICY "Teachers can create assignments"
ON assignments FOR INSERT
TO authenticated
WITH CHECK (teacher_id::text = auth.uid()::text);

CREATE POLICY "Teachers can update their own assignments"
ON assignments FOR UPDATE
TO authenticated
USING (teacher_id::text = auth.uid()::text)
WITH CHECK (teacher_id::text = auth.uid()::text);

CREATE POLICY "Everyone can read assignments"
ON assignments FOR SELECT
TO authenticated
USING (true);

-- Assignment Files table
ALTER TABLE assignment_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can read assignment files" ON assignment_files;

CREATE POLICY "Everyone can read assignment files"
ON assignment_files FOR SELECT
TO authenticated
USING (true);

-- Submissions table
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can create their own submissions" ON submissions;
DROP POLICY IF EXISTS "Students can update their own submissions" ON submissions;
DROP POLICY IF EXISTS "Students can read their own submissions" ON submissions;

CREATE POLICY "Students can create their own submissions"
ON submissions FOR INSERT
TO authenticated
WITH CHECK (student_id::text = auth.uid()::text);

CREATE POLICY "Students can update their own submissions"
ON submissions FOR UPDATE
TO authenticated
USING (student_id::text = auth.uid()::text)
WITH CHECK (student_id::text = auth.uid()::text);

CREATE POLICY "Students can read their own submissions"
ON submissions FOR SELECT
TO authenticated
USING (student_id::text = auth.uid()::text OR 
       EXISTS (
           SELECT 1 FROM assignments 
           WHERE assignments.id = submissions.assignment_id 
           AND assignments.teacher_id::text = auth.uid()::text
       ));

-- Submission Files table
ALTER TABLE submission_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can read their own submission files" ON submission_files;

CREATE POLICY "Students can read their own submission files"
ON submission_files FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM submissions
    WHERE submissions.id = submission_files.submission_id
    AND (submissions.student_id::text = auth.uid()::text OR 
         EXISTS (
             SELECT 1 FROM assignments 
             WHERE assignments.id = submissions.assignment_id 
             AND assignments.teacher_id::text = auth.uid()::text
         ))
));

-- Create functions to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_classes_updated_at ON classes;
DROP TRIGGER IF EXISTS update_enrollments_updated_at ON enrollments;
DROP TRIGGER IF EXISTS update_assignments_updated_at ON assignments;
DROP TRIGGER IF EXISTS update_assignment_files_updated_at ON assignment_files;
DROP TRIGGER IF EXISTS update_submissions_updated_at ON submissions;
DROP TRIGGER IF EXISTS update_submission_files_updated_at ON submission_files;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
BEFORE UPDATE ON classes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at
BEFORE UPDATE ON enrollments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
BEFORE UPDATE ON assignments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignment_files_updated_at
BEFORE UPDATE ON assignment_files
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
BEFORE UPDATE ON submissions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submission_files_updated_at
BEFORE UPDATE ON submission_files
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 