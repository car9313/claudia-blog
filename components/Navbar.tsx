import Link from "next/link";
import Image from "next/image";
import { SearchDialog } from "./SearchDialog";
import { ModeToggle } from "./ModeToggle";
import { CassetteTapeIcon, Code2, FolderOpen, Home } from "lucide-react";

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60 shadow-sm">
           <div className="container mx-auto flex h-15 items-center justify-between">
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
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium transition-all hover:text-primary hover:scale-105 group"
          >
            <Home className="h-5 w-5 group-hover:text-primary transition-colors" />
            <span className="hidden sm:inline">Inicio</span>
          </Link>
          <Link
            href="/categorias"
            className="flex items-center gap-2 text-sm font-medium transition-all hover:text-secondary hover:scale-105 group"
          >
            <FolderOpen className="h-5 w-5 group-hover:text-secondary transition-colors" />
            <span className="hidden sm:inline">Categorías</span>
          </Link>
          <SearchDialog />
          <ModeToggle/>
        </nav>
      </div>
        </header>
    )
}
