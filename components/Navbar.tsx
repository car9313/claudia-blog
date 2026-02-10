'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
/* import { SearchDialog } from "./SearchDialog";
import { ModeToggle } from "./ModeToggle";
 */import { Code2, FolderOpen, Home } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { SearchDialog } from "./search-dialog";

export default function Navbar() {
    const pathname = usePathname()

    const isActive = (href: string) => {
        if (href === '/') {
            return pathname === '/'
        }
        return pathname.startsWith(href)
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60 shadow-sm">
           <div className="flex justify-between items-center px-4 mx-auto h-15 ">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="p-2 bg-linear-to-br from-primary via-secondary to-accent rounded-xl group-hover:scale-110 transition-transform">
            <Code2 className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-2xl bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              DevBlog
            </span>
            <span className="text-xs text-muted-foreground">Programación moderna</span>
          </div>
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/"
            className={`flex items-center gap-2 text-sm font-medium transition-all hover:text-primary hover:scale-105 group relative ${
              isActive('/') ? 'text-primary' : 'text-foreground'
            }`}
          >
            <Home className={`h-5 w-5 transition-colors ${
              isActive('/') ? 'text-primary' : 'group-hover:text-primary'
            }`} />
            <span className="hidden sm:inline">Inicio</span>
           </Link>
          <Link
            href="/categorias"
            className={`flex items-center gap-2 text-sm font-medium transition-all hover:text-secondary hover:scale-105 group relative ${
              isActive('/categorias') ? 'text-secondary' : 'text-foreground'
            }`}
          >
            <FolderOpen className={`h-5 w-5 transition-colors ${
              isActive('/categorias') ? 'text-secondary' : 'group-hover:text-secondary'
            }`} />
            <span className="hidden sm:inline">Categorías</span>
           </Link>
          
          <SearchDialog/>
          <ThemeToggle/>
       </nav>
      </div>
        </header>
    )
}
