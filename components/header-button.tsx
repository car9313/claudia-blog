'use client'
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { ModeToggle } from './ModeToggle';

export default function HeaderButtons() {
    return (
        <motion.div
            className="flex justify-end"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
        >
            <Suspense fallback={<div>Cargando...</div>}>
                <div className="flex items-center gap-3 animate-fade-in-delay-2">
                    {/*  <HeaderAuthButton /> */}
                    <ModeToggle
                    />
                </div>
            </Suspense>
        </motion.div>
    );
}