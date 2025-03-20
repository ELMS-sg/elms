'use client'

type AttendanceSelectProps = {
    defaultValue: string;
    onSubmit: (status: 'present' | 'absent') => Promise<void>;
}

export function AttendanceSelect({ defaultValue, onSubmit }: AttendanceSelectProps) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 min-w-[200px]">
                <select
                    name="status"
                    defaultValue={defaultValue}
                    onChange={(e) => {
                        onSubmit(e.target.value as 'present' | 'absent')
                    }}
                    className="select select-bordered w-full py-2 bg-white text-sm font-medium"
                >
                    <option value="present" className="text-green-400">✓ Present</option>
                    <option value="absent" className="text-red-400">✗ Absent</option>
                </select>
                <span className="text-xs text-gray-500 whitespace-nowrap">Today</span>
            </div>
        </div>
    )
} 