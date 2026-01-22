import { Sparkles, Star } from "lucide-react";

export default function Header() {
    return (
<section className="max-w-3xl  min-h-screen md:text-2xl  flex flex-col justify-center items-center mx-auto text-center">
<div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-linear-to-r from-primary/20 via-secondary/20 to-accent/20 border border-primary/20 text-primary text-sm font-medium mb-4 hover:scale-105 transition-transform">
          <Sparkles className="h-4 w-4" />
          <span>Bienvenido al blog</span>
          <Star className="h-4 w-4 text-accent" />
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance leading-tight">
          <span className="bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Aprende Desarrollo
          </span>
          <br />
          <span className="text-foreground">Web Moderno</span>
        </h1>

        <p className="text-xl text-muted-foreground  text-pretty leading-relaxed">
          Tutoriales, guías y artículos sobre <span className="text-primary font-semibold">React</span>,{" "}
          <span className="text-secondary font-semibold">TypeScript</span>,{" "}
          <span className="text-accent font-semibold">Next.js</span> y las últimas tecnologías web
        </p>
      </section>
)
}