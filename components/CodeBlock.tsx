import { highlightCode } from "../lib/shiki"
import { CopyButton } from "./CopyButton"


interface CodeBlockProps {
    code: string
    language: string
    fileName?: string
}

export async function CodeBlock({ code, language, fileName }: CodeBlockProps) {
    const { light, dark } = await highlightCode(code, language)

    return (
        <div className="relative my-6 rounded-lg border bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2">
                    {fileName && (
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">{fileName}</span>
                    )}
                    <span className="text-xs px-2 py-1 bg-zinc-200 dark:bg-zinc-800 rounded text-zinc-700 dark:text-zinc-300">
                        {language}
                    </span>
                </div>
                <CopyButton code={code} />
            </div>

            <div className="relative">
                <div
                    className="dark:hidden [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:m-0 [&_pre]:bg-transparent"
                    dangerouslySetInnerHTML={{ __html: light }}
                />
                <div
                    className="hidden dark:block [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:m-0 [&_pre]:bg-transparent"
                    dangerouslySetInnerHTML={{ __html: dark }}
                />
            </div>
        </div>
    )
}