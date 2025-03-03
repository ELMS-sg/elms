-- Enable RLS on meetings table
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Teachers can create meetings" ON meetings;
DROP POLICY IF EXISTS "Teachers can update their own meetings" ON meetings;
DROP POLICY IF EXISTS "Students can view their meetings" ON meetings;
DROP POLICY IF EXISTS "Everyone can read meetings" ON meetings;

-- Create policy for teachers to create meetings
CREATE POLICY "Teachers can create meetings"
ON meetings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IN (
    SELECT id FROM users WHERE role = 'TEACHER'
));

-- Create policy for teachers to update their own meetings
CREATE POLICY "Teachers can update their own meetings"
ON meetings
FOR UPDATE
TO authenticated
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

-- Create policy for students to view their meetings
CREATE POLICY "Students can view their meetings"
ON meetings
FOR SELECT
TO authenticated
USING (
    student_id = auth.uid() OR
    teacher_id = auth.uid() OR
    class_id IN (
        SELECT class_id FROM enrollments WHERE student_id = auth.uid()
    )
);

-- Create policy for everyone to read meetings
CREATE POLICY "Everyone can read meetings"
ON meetings
FOR SELECT
TO authenticated
USING (true);

-- Create policy for meeting participants
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can join meetings" ON meeting_participants;
DROP POLICY IF EXISTS "Teachers can view meeting participants" ON meeting_participants;

CREATE POLICY "Students can join meetings"
ON meeting_participants
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Teachers can view meeting participants"
ON meeting_participants
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR
    auth.uid() IN (
        SELECT teacher_id FROM meetings WHERE id = meeting_id
    )
); 