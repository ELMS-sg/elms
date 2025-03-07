'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

/**
 * React Query hook to fetch students by class ID
 * @param classId The ID of the class to fetch students for
 * @returns Query result containing students data, loading state, and error state
 */
export function useStudentsByClass(classId: string | undefined) {
    return useQuery({
        queryKey: ['students', 'class', classId],
        queryFn: async () => {
            if (!classId) {
                console.log('useStudentsByClass: No classId provided');
                return { students: [] };
            }

            console.log(`useStudentsByClass: Fetching students for class ${classId}`);
            try {
                const url = `/api/students/by-class?classId=${classId}`;
                console.log(`useStudentsByClass: Making request to ${url}`);

                const response = await axios.get(url);
                console.log(`useStudentsByClass: Response status: ${response.status}`);

                const data = response.data;
                console.log(`useStudentsByClass: Received data:`, data);
                console.log(`useStudentsByClass: Found ${data?.students?.length || 0} students`);

                return data;
            } catch (error: any) {
                console.error(`useStudentsByClass: Error fetching students for class ${classId}:`, error);
                console.error(`useStudentsByClass: Error response:`, error.response?.data);

                // Rethrow the error with a more descriptive message
                throw new Error(
                    error.response?.data?.error ||
                    error.response?.data?.details ||
                    error.message ||
                    'Failed to fetch students'
                );
            }
        },
        enabled: !!classId, // Only run the query if classId is provided
        retry: 2, // Retry failed requests up to 2 times
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    });
} 