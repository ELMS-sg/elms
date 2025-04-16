"use client";

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function ClassSearch({ defaultValue = '' }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(defaultValue);

    // Handle search term change
    const handleSearch = (value) => {
        setSearchTerm(value);

        // Create new URLSearchParams object
        const params = new URLSearchParams(searchParams);

        // Set or remove search parameter
        if (value) {
            params.set('search', value);
        } else {
            params.delete('search');
        }

        // Update URL with the new params
        router.replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="mb-6">
            <div className="max-w-md">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="input pl-10 w-full"
                        placeholder="Search by class name..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
} 