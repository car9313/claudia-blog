import Link from "next/link";
import Image from "next/image";
import HeaderButtons from "./header-button";
import { SearchDialog } from "./SearchDialog";
import { ModeToggle } from "./ModeToggle";

export default function Navbar() {
    return (
        <header className="headerNavContainer">
            <nav>
                <Link href="/" className="logo">
                    <Image src="/icons/logo.png" alt="logo" width={24} height={24} />
                </Link>
                <ul>
                    <Link href="/">Home</Link>
                    <SearchDialog />
                    <ModeToggle
                    />
                </ul>
            </nav>
        </header>
    )
}
