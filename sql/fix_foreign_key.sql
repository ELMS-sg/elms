-- First, identify the name of the foreign key constraint
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name = 'submission_files' 
AND constraint_type = 'FOREIGN KEY';

-- Then drop the existing constraint
ALTER TABLE public.submission_files 
DROP CONSTRAINT submission_files_submission_id_fkey;

-- Finally, recreate the constraint to point to the correct table
ALTER TABLE public.submission_files
ADD CONSTRAINT submission_files_submission_id_fkey
FOREIGN KEY (submission_id)
REFERENCES public.assignment_submissions(id)
ON DELETE CASCADE;

-- Confirm the constraint was created correctly (with qualified column names)
SELECT 
    rc.constraint_name, 
    kcu.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name, 
    ccu.column_name AS foreign_column_name
FROM information_schema.constraint_column_usage ccu
JOIN information_schema.referential_constraints rc 
    ON ccu.constraint_name = rc.constraint_name
JOIN information_schema.key_column_usage kcu
    ON kcu.constraint_name = rc.constraint_name
WHERE kcu.table_name = 'submission_files'; 