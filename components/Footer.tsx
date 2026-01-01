'use client'
import { motion } from 'framer-motion';
export default function Footer() {
  return (
    <motion.footer
      className="mt-20 text-center text-slate-500 dark:text-slate-400"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.8 }}
    >
      <p>
        &copy; 2024 DevWeb Blog. Compartiendo conocimiento sobre
        programación web.
      </p>
    </motion.footer>
  )
}