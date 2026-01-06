
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { ModeToggle } from './ModeToggle';
import { SearchDialog } from './SearchDialog';

export default function HeaderButtons() {

    return (
        <div
            className="flex justify-end"
        >
            <Suspense fallback={<div>Cargando...</div>}>
                <div className="flex items-center gap-3 animate-fade-in-delay-2">
                    {/*  <HeaderAuthButton /> */}

                </div>
            </Suspense>
        </div>
    );
}