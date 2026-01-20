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
    const categoryFromUrl = searchParams.get("category") || "Todos";
    const [activeCategory, setActiveCategory] = useState(categoryFromUrl);

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


/* 
<Badge
                                key={tag}
                                variant="outline"
                                className="text-xs bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/50 dark:to-purple-900/50 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:scale-105 transition-transform duration-200"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {tag}
                            </Badge>
*/

            className="w-full max-w-4xl mx-auto mb-12">
            <div className="flex flex-wrap justify-center gap-2 p-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full border-b border-border/40 shadow-lg">
                {categories.map((category) => (
                    <Link
                        key={category}
                        href={`categorias/?${createQueryString("category", category)}`}
                        onClick={() => {
                            setActiveCategory(category)
                        }}
                        className={
                            `px-4 py-2 hover:scale-90 rounded-full transition-all duration-500 ${activeCategory === category
                                ? "bg-secondary  bg-linear-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700"
                                : "bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/50 dark:to-purple-900/50 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                            }`}
                    >
                        {category}
                    </Link>
                ))}
            </div>
        </motion.div>
    );
}