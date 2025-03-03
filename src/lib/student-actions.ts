/**
 * Get all students enrolled in a specific class
 */
export async function getStudentsByClass(classId: string) {
    try {
        // Make an API call to fetch students by class ID
        const response = await fetch(`/api/students/by-class?classId=${classId}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch students: ${response.status}`);
        }

        const data = await response.json();
        return data.students || [];
    } catch (error) {
        console.error("Error getting students by class:", error);
        return [];
    }
} 