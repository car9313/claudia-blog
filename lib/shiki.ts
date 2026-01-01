import { createHighlighter } from 'shiki'

// Cache del highlighter
let highlighter: any = null

export async function getHighlighter() {
    if (!highlighter) {
        highlighter = await createHighlighter({
            themes: ['github-light', 'github-dark'],
            langs: [
                'javascript',
                'typescript',
                'jsx',
                'tsx',
                'python',
                'java',
                'cpp',
                'c',
                'csharp',
                'php',
                'ruby',
                'go',
                'rust',
                'swift',
                'html',
                'css',
                'scss',
                'sql',
                'json',
                'yaml',
                'markdown',
                'bash',
                'shell'
            ],
        })
    }
    return highlighter
}

export async function highlightCode(code: string, lang: string) {
    const highlighter = await getHighlighter()

    const light = highlighter.codeToHtml(code, {
        lang: lang,
        theme: 'github-light',
    })

    const dark = highlighter.codeToHtml(code, {
        lang: lang,
        theme: 'github-dark',
    })

    return { light, dark }
}