import { useEffect, useMemo, useState } from 'react'
import SiteNav from '../components/SiteNav.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.jsx'
import { Skeleton } from '@/components/ui/skeleton.jsx'
import { Music3, Search, Sparkles, Waves, AlertCircle, Play } from 'lucide-react'

const curatedCollections = [
  {
    title: 'Noches Neon',
    description: 'Synthwave y ritmos electrónicos brillantes listos para acompañar tus visuales futuristas.',
    color: 'from-purple-500/40 to-blue-500/20',
    tags: ['synthwave', 'retro', 'electro'],
  },
  {
    title: 'Sonidos de la Naturaleza',
    description: 'Colección inmersiva de ambientes, agua, viento y fauna para transportarte a cualquier lugar.',
    color: 'from-emerald-500/40 to-cyan-500/20',
    tags: ['ambiente', 'paisaje sonoro', 'relax'],
  },
  {
    title: 'Ritmos Urbanos',
    description: 'Beats crudos, percusiones granuladas y texturas glitch para proyectos con actitud.',
    color: 'from-pink-500/40 to-orange-500/20',
    tags: ['trap', 'hip-hop', 'glitch'],
  },
]

const trendingTags = [
  { label: 'lofi', count: 128 },
  { label: 'ambient', count: 96 },
  { label: 'cinemático', count: 82 },
  { label: 'field-recording', count: 64 },
  { label: 'drone', count: 51 },
  { label: 'modular', count: 47 },
]

export default function LibraryPage() {
  const [query, setQuery] = useState('')
  const [sounds, setSounds] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!query.trim()) {
      setSounds([])
      setError('')
      setIsLoading(false)
      return
    }

    const controller = new AbortController()
    let isActive = true

    const fetchSounds = async () => {
      setIsLoading(true)
      setError('')

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        })

        if (!res.ok) {
          throw new Error('No se pudo obtener la biblioteca. Inténtalo de nuevo más tarde.')
        }

        const data = await res.json()
        if (!isActive) return

        setSounds(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!isActive || err.name === 'AbortError') return
        setError(err.message || 'No pudimos completar la búsqueda.')
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    const timeout = setTimeout(fetchSounds, 300)

    return () => {
      isActive = false
      clearTimeout(timeout)
      controller.abort()
    }
  }, [query])

  const hasQuery = query.trim().length > 0

  const soundResults = useMemo(() => {
    if (!Array.isArray(sounds)) return []
    return sounds.slice(0, 12)
  }, [sounds])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-purple-950 text-gray-100">
      <SiteNav />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-20 pt-10">
        <section className="text-center space-y-4">
          <Badge variant="secondary" className="mx-auto w-fit bg-purple-500/20 text-purple-100">
            Biblioteca sonora
          </Badge>
          <h1 className="text-4xl font-bold text-white md:text-5xl">
            Descubre, organiza y reproduce tus sonidos
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-300">
            Explora tu colección personal o inspírate con nuestras selecciones curadas. Filtra por etiquetas, encuentra texturas
            únicas y disfruta de una experiencia envolvente pensada para creadores.
          </p>
        </section>

        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="mx-auto flex w-full max-w-md justify-center gap-2 border border-purple-500/30 bg-black/40 p-1">
            <TabsTrigger value="search" className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-200">
              Buscar
            </TabsTrigger>
            <TabsTrigger value="curated" className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-200">
              Colecciones
            </TabsTrigger>
            <TabsTrigger value="trending" className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-200">
              Tendencias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <Card className="border-purple-500/30 bg-black/50">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-white">Búsqueda inteligente</CardTitle>
                <CardDescription className="text-gray-400">
                  Escribe el nombre de un sonido, una etiqueta o un estado de ánimo para comenzar.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="flex flex-col gap-3 md:flex-row" onSubmit={(event) => event.preventDefault()}>
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-300" />
                    <Input
                      id="library-search"
                      type="text"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Busca por título, etiqueta o energía sonora…"
                      className="border-purple-500/30 bg-black/60 pl-10 text-base text-gray-100 placeholder:text-gray-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {hasQuery && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-purple-200 hover:text-white"
                        onClick={() => setQuery('')}
                      >
                        Limpiar
                      </Button>
                    )}
                    <Button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      Buscar
                    </Button>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2 text-xs text-purple-200/80">
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Consejos: intenta "textura granulada", "atmósfera nocturna" o "percusiones latinas".
                </span>
              </CardFooter>
            </Card>

            {error && (
              <Alert variant="destructive" className="border-red-500/40 bg-red-500/10 text-red-100">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error al buscar</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!hasQuery && !isLoading && !error && (
              <Card className="border-purple-500/20 bg-black/40">
                <CardContent className="flex flex-col items-center gap-4 py-10 text-center text-gray-300">
                  <Music3 className="h-12 w-12 text-purple-300" />
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-white">Tu biblioteca te espera</p>
                    <p className="text-sm text-gray-400">
                      Comienza a escribir para encontrar tus sonidos o descubre nuestras recomendaciones en las otras pestañas.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {isLoading && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="border-purple-500/10 bg-black/40">
                    <CardHeader>
                      <Skeleton className="h-5 w-2/3 bg-purple-500/20" />
                      <Skeleton className="mt-2 h-4 w-1/2 bg-purple-500/10" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Skeleton className="h-10 w-full rounded-lg bg-purple-500/10" />
                      <Skeleton className="h-10 w-full rounded-lg bg-purple-500/10" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!isLoading && hasQuery && !error && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {soundResults.length === 0 && (
                  <Card className="col-span-full border-purple-500/20 bg-black/40">
                    <CardContent className="flex flex-col items-center gap-3 py-10 text-center text-gray-300">
                      <Waves className="h-10 w-10 text-purple-300" />
                      <div>
                        <p className="text-lg font-semibold text-white">Sin resultados para “{query}”</p>
                        <p className="text-sm text-gray-400">Prueba con otros términos o combina distintas etiquetas.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {soundResults.map((sound) => {
                  const tags = Array.isArray(sound.tags)
                    ? sound.tags
                    : typeof sound.tags === 'string'
                      ? sound.tags.split(',').map((tag) => tag.trim())
                      : []

                  return (
                    <Card key={sound.id ?? sound.path} className="border-purple-500/20 bg-black/50">
                      <CardHeader className="space-y-2">
                        <CardTitle className="text-lg text-white">{sound.title || 'Sin título'}</CardTitle>
                        {tags.length > 0 && (
                          <CardDescription className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="bg-purple-500/20 text-purple-100">
                                #{tag}
                              </Badge>
                            ))}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {sound.description && (
                          <p className="text-sm text-gray-300 line-clamp-3">{sound.description}</p>
                        )}
                        {sound.path && (
                          <div className="rounded-lg border border-purple-500/20 bg-black/60 p-3">
                            <audio controls src={`/${sound.path}`} preload="none" className="w-full">
                              Tu navegador no soporta la reproducción de audio.
                            </audio>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="curated" className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {curatedCollections.map((collection) => (
              <Card
                key={collection.title}
                className={`border-purple-500/30 bg-gradient-to-br ${collection.color} backdrop-blur-xl shadow-xl shadow-purple-900/20`}
              >
                <CardHeader>
                  <CardTitle className="text-2xl text-white">{collection.title}</CardTitle>
                  <CardDescription className="text-gray-200/80 text-base">
                    {collection.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {collection.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="border-purple-200/40 text-purple-100">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="bg-black/30 hover:bg-black/50 border border-purple-300/40 text-purple-100">
                    <Play className="h-4 w-4" />
                    Reproducir mezcla
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <Card className="border-purple-500/20 bg-black/40">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Etiquetas en tendencia</CardTitle>
                <CardDescription className="text-gray-400">
                  Las búsquedas más populares de la comunidad ruido durante las últimas 24 horas.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {trendingTags.map((tag) => (
                  <div
                    key={tag.label}
                    className="flex flex-col gap-2 rounded-xl border border-purple-500/20 bg-black/50 p-4 text-sm text-gray-300"
                  >
                    <div className="flex items-center justify-between">
                      <Badge className="bg-purple-600/20 text-purple-100">#{tag.label}</Badge>
                      <span className="text-xs uppercase tracking-wide text-purple-200/80">{tag.count} búsquedas</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Añade esta etiqueta a tus uploads para que más creadores descubran tus sonidos.
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
