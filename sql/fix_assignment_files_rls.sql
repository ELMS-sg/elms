-- Temporarily disable RLS on assignment_files table
ALTER TABLE public.assignment_files DISABLE ROW LEVEL SECURITY;

-- Create a helper function to safely insert assignment files
CREATE OR REPLACE FUNCTION public.insert_assignment_file(
    assignment_id UUID,
    file_name TEXT,
    file_size INTEGER,
    file_type TEXT,
    file_url TEXT
) RETURNS UUID AS $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO public.assignment_files (
        assignment_id,
        file_name,
        file_size,
        file_type,
        file_url
    ) VALUES (
        assignment_id,
        file_name,
        file_size,
        file_type,
        file_url
    )
    RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to temporarily disable RLS for assignment files operations
CREATE OR REPLACE FUNCTION public.temporarily_disable_rls_for_assignment_files() RETURNS VOID AS $$
BEGIN
    -- Disable RLS for the assignment_files table
    ALTER TABLE public.assignment_files DISABLE ROW LEVEL SECURITY;
    
    -- You can add more statements here if needed
    
    -- Note: This function can be used by administrators to temporarily
    -- disable RLS when troubleshooting issues with file uploads
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 