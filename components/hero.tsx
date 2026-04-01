import { Sparkles, Star } from "lucide-react";

export default function Hero() {
  return (
      <section className="text-center space-y-2 relative min-h-screen flex flex-col justify-center items-center">
 {/* Efectos de fondo decorativos centrados */}
        <div className="absolute inset-0 -z-10 overflow-hidden h-full">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse delay-500" />
        </div>
<div className="inline-flex mt-6 items-center gap-2 px-5 py-2.5 rounded-full bg-linear-to-r from-primary/20 via-secondary/20 to-accent/20 border border-primary/20 text-primary text-sm font-medium mb-4 hover:scale-105 transition-transform">
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
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
          Tutoriales, guías y artículos sobre{" "}
          <span className="text-primary font-semibold">React</span>,{" "}
          <span className="text-secondary font-semibold">TypeScript</span>,{" "}
          <span className="text-accent font-semibold">Next.js</span> y las
          últimas tecnologías web
        </p>

    </section>
  )
}