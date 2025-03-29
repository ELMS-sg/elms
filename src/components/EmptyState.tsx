import React, { ReactNode } from 'react'

interface EmptyStateProps {
    title: string
    description: string
    icon?: ReactNode
    action?: ReactNode
}

export default function EmptyState({ title, description, icon, action }: EmptyStateProps) {
    return (
        <div className="text-center py-12 px-4 bg-white rounded-lg shadow-card flex flex-col items-center">
            {icon && (
                <div className="mb-4">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">{description}</p>
            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    )
} 