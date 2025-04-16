"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter } from "lucide-react";

export function ClientSearchFilter({ categories, pendingAssignments, completedAssignments, assignmentsToGrade, isTeacher }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [searchText, setSearchText] = useState("");
    const [activeCategory, setActiveCategory] = useState("All Assignments");

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        if (searchText) {
            params.set("search", searchText);
        } else {
            params.delete("search");
        }

        if (activeCategory !== "All Assignments") {
            params.set("category", activeCategory);
        } else {
            params.delete("category");
        }

        router.replace(`/dashboard/assignments?${params.toString()}`);
    }, [searchText, activeCategory, router, searchParams]);

    // Initialize from URL params
    useEffect(() => {
        const search = searchParams.get("search");
        const category = searchParams.get("category");

        if (search) setSearchText(search);
        if (category) setActiveCategory(category);
    }, [searchParams]);

    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };

    const handleCategoryClick = (category) => {
        setActiveCategory(category);
    };

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex flex-wrap gap-2">
                {categories.map((category, index) => (
                    <button
                        key={index}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${category.name === activeCategory
                            ? "bg-primary-100 text-primary-700"
                            : "bg-white text-gray-600 hover:bg-gray-50"
                            }`}
                        onClick={() => handleCategoryClick(category.name)}
                    >
                        {category.name}
                        <span className="ml-1 text-xs rounded-full px-2 py-0.5 bg-white text-gray-500">
                            {category.count}
                        </span>
                    </button>
                ))}
            </div>
            <div className="flex w-full md:w-auto gap-2">
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="input pl-10 w-full"
                        placeholder="Search assignments..."
                        value={searchText}
                        onChange={handleSearch}
                    />
                </div>
                <button className="btn btn-outline flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                </button>
            </div>
        </div>
    );
} 