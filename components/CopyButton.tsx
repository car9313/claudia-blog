'use client'

import { Button } from '@/components/ui/button'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

interface CopyButtonProps {
    code: string
}

export function CopyButton({ code }: CopyButtonProps) {
    const [copied, setCopied] = useState(false)

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Error al copiar:', err)
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-8 px-3 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all duration-200 flex items-center gap-2"
        >
            {copied ? (
                <>
                    <Check className="h-4 w-4" />
                    <span className="text-xs">Copiado!</span>
                </>
            ) : (
                <>
                    <Copy className="h-4 w-4" />
                    <span className="text-xs">Copiar</span>
                </>
            )}
        </Button>
    )
}