export default function Header() {
    return (
        <div className="text-center flex-1 mb-16">
            <h1
                className="text-5xl md:text-7xl font-bold tracking-tight text-balance leading-tight bg-linear-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent mb-4"
            >
                DevWeb Blog
            </h1>
            <p
                className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto"
            >
                Tu fuente de conocimiento sobre programación web moderna.
                Tutoriales, tips y las últimas tendencias en desarrollo frontend y
                backend.
            </p>
        </div>
    )
}