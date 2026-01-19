import Link from "next/link";
import Image from "next/image";
import { SearchDialog } from "./SearchDialog";
import { ModeToggle } from "./ModeToggle";
import { Code2, Home } from "lucide-react";

export default function Navbar() {
    return (
        <header className="headerNavContainer">
            <nav>
                <Link href="/" className="logo">
            <div className="p-2 bg-linear-to-br from-primary via-secondary to-accent rounded-xl group-hover:scale-110 transition-transform">
            <Code2 className="h-4 w-4 text-white" />
          </div>

            {/*         <Image src="/icons/logo.png" alt="logo" width={24} height={24} />
             */}    </Link>
                <ul>
                  <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium transition-all hover:text-primary hover:scale-105 group"
          >
            <Home className="h-4 w-4 group-hover:text-primary transition-colors" />
            <span className="hidden sm:inline">Inicio</span>
          </Link> 
                    <SearchDialog />
                    <ModeToggle
                    />
                </ul>
            </nav>
        </header>
    )
}
