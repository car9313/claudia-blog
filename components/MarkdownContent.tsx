// components/MarkdownContent.tsx
import ReactMarkdown from 'react-markdown';
import { CodeBlock } from './CodeBlock';
import {MarkdownImageWrapper} from "@/components/markdown-image-wrapper";

interface MarkdownContentProps {
    content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
    return (
        <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown
                components={{
                    // Usar componente dinámico para imágenes
                    img: ({ src, alt }) => {
                        if (!src) return null;
                        return <MarkdownImageWrapper src={src as string} alt={alt} />;
                    }, 

                    // Tu código existente para bloques de código
                    code(props) {
                        const { children, className, node, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || '');
                        const code = String(children).replace(/\n$/, '');

                        const isInline = !className || !match;

                        if (!isInline && match) {
                            return (
                                <CodeBlock
                                    code={code}
                                    language={match[1]}
                                    {...rest}
                                />
                            );
                        }

                        return (
                            <code className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded text-sm" {...rest}>
                                {children}
                            </code>
                        );
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}