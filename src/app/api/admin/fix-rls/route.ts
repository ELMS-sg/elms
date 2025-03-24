import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireServerAuth } from '@/lib/actions';

export async function POST(request: NextRequest) {
    try {
        // Only allow admin users
        const user = await requireServerAuth();
        if (user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Only administrators can access this endpoint' },
                { status: 403 }
            );
        }

        // Parse the request body
        const body = await request.json();
        const { table } = body;

        if (!table) {
            return NextResponse.json(
                { error: 'Table name is required' },
                { status: 400 }
            );
        }

        // Only allow fixing specific tables
        const allowedTables = ['submission_files', 'assignment_submissions'];
        if (!allowedTables.includes(table)) {
            return NextResponse.json(
                { error: `Cannot fix RLS for table: ${table}. Only the following tables are allowed: ${allowedTables.join(', ')}` },
                { status: 400 }
            );
        }

        // Create Supabase admin client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    persistSession: false
                }
            }
        );

        // Disable RLS for the table
        const { error: disableRlsError } = await supabase.rpc(
            'admin_disable_rls',
            { table_name: table }
        );

        if (disableRlsError) {
            // If the RPC doesn't exist, execute raw SQL
            console.log('RPC function not found, trying direct SQL...');

            const { error: sqlError } = await supabase.from('_manual_sql').select(`
                sql_result:execute_sql($$
                    ALTER TABLE public.${table} DISABLE ROW LEVEL SECURITY;
                $$)
            `);

            if (sqlError) {
                console.error('Error executing SQL:', sqlError);
                return NextResponse.json(
                    {
                        success: false,
                        error: `Failed to disable RLS: ${sqlError.message}`,
                        message: 'You may need to run the SQL manually in the Supabase SQL Editor'
                    },
                    { status: 500 }
                );
            }
        }

        // For submission_files, also create the helper functions
        if (table === 'submission_files') {
            // Create insert_submission_file function
            const insertFunctionSql = `
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
            `;

            const { error: insertFunctionError } = await supabase.from('_manual_sql').select(`
                sql_result:execute_sql($$
                    ${insertFunctionSql}
                $$)
            `);

            if (insertFunctionError) {
                console.error('Error creating insert function:', insertFunctionError);
            }

            // Create temporary_disable_rls function
            const disableRlsFunctionSql = `
            CREATE OR REPLACE FUNCTION public.temporarily_disable_rls_for_submission_files() RETURNS void AS $$
            BEGIN
                ALTER TABLE public.submission_files DISABLE ROW LEVEL SECURITY;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
            `;

            const { error: disableFunctionError } = await supabase.from('_manual_sql').select(`
                sql_result:execute_sql($$
                    ${disableRlsFunctionSql}
                $$)
            `);

            if (disableFunctionError) {
                console.error('Error creating disable RLS function:', disableFunctionError);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Successfully disabled RLS for ${table} table`,
            table
        });
    } catch (error) {
        console.error('Error in fix-rls API:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error',
                stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
            },
            { status: 500 }
        );
    }
} 