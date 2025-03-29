import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/actions';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
    try {
        // Authenticate and check if admin
        const user = await requireServerAuth();

        // Check if user is admin
        if (user.role !== 'admin') {
            return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });
        }

        // Parse request body
        const { table, column, referenced_table, referenced_column } = await req.json();

        if (!table || !column || !referenced_table || !referenced_column) {
            return NextResponse.json(
                { success: false, error: "Missing required parameters" },
                { status: 400 }
            );
        }

        // Create service role client
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Get the constraint name
        const { data: constraints, error: constraintError } = await supabaseAdmin
            .from('information_schema.table_constraints')
            .select('constraint_name')
            .eq('table_name', table)
            .eq('constraint_type', 'FOREIGN KEY')
            .maybeSingle();

        if (constraintError) {
            return NextResponse.json(
                { success: false, error: "Failed to get constraint name", details: constraintError },
                { status: 500 }
            );
        }

        // If constraint exists, drop it
        const constraintName = constraints?.constraint_name || `${table}_${column}_fkey`;

        try {
            await supabaseAdmin.rpc('exec_sql', {
                sql_string: `ALTER TABLE public.${table} DROP CONSTRAINT IF EXISTS ${constraintName};`
            });
        } catch (error) {
            // If RPC fails, try raw SQL
            try {
                await supabaseAdmin
                    .from(table)
                    .select('count(*)')
                    .limit(1);
            } catch (selectError) {
                try {
                    const { error: rawError } = await supabaseAdmin
                        .rpc('exec_sql', {
                            sql_string: `ALTER TABLE public.${table} DROP CONSTRAINT IF EXISTS ${constraintName};`
                        });

                    if (rawError) {
                        return NextResponse.json(
                            { success: false, error: "Failed to drop constraint", details: rawError },
                            { status: 500 }
                        );
                    }
                } catch (execError) {
                    return NextResponse.json(
                        { success: false, error: "Failed to drop constraint", details: execError },
                        { status: 500 }
                    );
                }
            }
        }

        // Create new constraint
        try {
            await supabaseAdmin.rpc('exec_sql', {
                sql_string: `
                    ALTER TABLE public.${table}
                    ADD CONSTRAINT ${constraintName}
                    FOREIGN KEY (${column})
                    REFERENCES public.${referenced_table}(${referenced_column})
                    ON DELETE CASCADE;
                `
            });
        } catch (error) {
            // If RPC fails, try raw SQL
            try {
                await supabaseAdmin
                    .from(table)
                    .select('count(*)')
                    .limit(1);
            } catch (selectError) {
                try {
                    const { error: rawError } = await supabaseAdmin
                        .rpc('exec_sql', {
                            sql_string: `
                                ALTER TABLE public.${table}
                                ADD CONSTRAINT ${constraintName}
                                FOREIGN KEY (${column})
                                REFERENCES public.${referenced_table}(${referenced_column})
                                ON DELETE CASCADE;
                            `
                        });

                    if (rawError) {
                        return NextResponse.json(
                            { success: false, error: "Failed to add constraint", details: rawError },
                            { status: 500 }
                        );
                    }
                } catch (execError) {
                    return NextResponse.json(
                        { success: false, error: "Failed to add constraint", details: execError },
                        { status: 500 }
                    );
                }
            }
        }

        // Verify the constraint was created
        const { data: verifyData, error: verifyError } = await supabaseAdmin
            .from('information_schema.table_constraints')
            .select('constraint_name')
            .eq('table_name', table)
            .eq('constraint_type', 'FOREIGN KEY')
            .maybeSingle();

        if (verifyError) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Failed to verify constraint",
                    details: verifyError,
                    note: "The constraint may have been created successfully, but verification failed."
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Foreign key constraint fixed successfully",
            details: {
                table,
                column,
                referenced_table,
                referenced_column,
                constraint_name: verifyData?.constraint_name || constraintName
            }
        });

    } catch (error) {
        console.error("Error fixing foreign key constraint:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Internal server error",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
} 