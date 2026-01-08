'use client'

import { useState, useEffect, useRef, useCallback, startTransition } from 'react'
import { Search, X, Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type { Post } from '@/lib/posts.types'
import { useDebounce } from '@/hooks/use-debounce'
import { searchPostsServer } from '../lib/actions/searchPosts'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import Link from 'next/link'

export function SearchDialog() {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Post[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    const debouncedQuery = useDebounce(query, 500)
    const lastReqRef = useRef<number>(0)

    const performSearch = useCallback((searchQuery: string) => {
        const q = (searchQuery ?? '').toString().trim()
        if (!q) {
            setResults([])
            setHasSearched(false)
            return
        }

        setIsLoading(true)
        setHasSearched(true)

        const reqId = Date.now()
        lastReqRef.current = reqId
        // startTransition para bajar prioridad de la actualización
        startTransition(() => {
            // Llamada a Server Action; Next la ejecuta en el servidor
            searchPostsServer(q)
                .then((data) => {
                    // Ignorar respuestas antiguas
                    if (lastReqRef.current !== reqId) return
                    setResults(data ?? [])
                })
                .catch((err) => {
                    console.error('Search error:', err)
                    if (lastReqRef.current !== reqId) return
                    setResults([])
                })
                .finally(() => {
                    if (lastReqRef.current !== reqId) return
                    setIsLoading(false)
                })
        })
    }, [])

    // Auto-search cuando cambia el debouncedQuery
    useEffect(() => {
        if (!debouncedQuery) {
            setResults([])
            setHasSearched(false)
            setIsLoading(false)
            lastReqRef.current = 0
            return
        }
        performSearch(debouncedQuery)
    }, [debouncedQuery, performSearch])

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            setQuery('')
            setResults([])
            setHasSearched(false)
            lastReqRef.current = 0
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange} >
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-accent">
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Search posts</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Search Posts</DialogTitle>
                </DialogHeader>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search for posts..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-10 pr-10"
                        autoFocus
                    />
                    {query && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                            onClick={() => {
                                setQuery('')
                                setResults([])
                                setHasSearched(false)
                                lastReqRef.current = 0
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto mt-4 px-3">
                    {isLoading && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="ml-2 text-muted-foreground">Searching...</span>
                        </div>
                    )}

                    {!isLoading && hasSearched && results.length === 0 && (
                        <div className="text-center py-8">
                            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No posts found for "{query}"</p>
                            <p className="text-sm text-muted-foreground mt-2">Try searching with different keywords</p>
                        </div>
                    )}

                    {!isLoading && !hasSearched && (
                        <div className="text-center py-8">
                            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Start typing to search for posts</p>
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {results.map((post) => (
                                <Link key={post.slug} href={`/blog/${post.slug}`}
                                    onClick={() => setOpen(false)}
                                    className="group">
                                    <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                                        <CardHeader>
                                            <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-start justify-between gap-2">
                                                <span className="text-balance">{post.title}</span>
                                                <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground line-clamp-2 text-pretty">{post.excerpt}</p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
