'use client'

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from 'framer-motion';
import { useState } from "react";

interface CategoryTabsProps {
    categories: string[];
}

export function CategoryTabs({
    categories
}: CategoryTabsProps) {
    const searchParams = useSearchParams();
    const [activeCategory, setActiveCategory] = useState("Todos");

    const createQueryString = (name: string, value: string) => {

        const params = new URLSearchParams(searchParams.toString());
        params.set(name, value);
        return params.toString();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}

            className="w-full max-w-4xl mx-auto mb-12">
            <div className="flex flex-wrap justify-center gap-2 p-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
                {categories.map((category) => (
                    <Link
                        key={category}
                        href={`/?${createQueryString("category", category)}`}
                        onClick={() => {
                            setActiveCategory(category)
                        }}
                        className={
                            `px-4 py-2 rounded-full transition-all duration-500 ${activeCategory === category
                                ? "bg-blue-600 text-white shadow-lg"
                                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                    >
                        {category}
                    </Link>
                ))}
            </div>
        </motion.div>
    );
}