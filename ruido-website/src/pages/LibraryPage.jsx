import { useEffect, useState } from 'react'
import SiteNav from '../components/SiteNav.jsx'

export default function LibraryPage() {
  const [query, setQuery] = useState('')
  const [sounds, setSounds] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!query.trim()) {
      setSounds([])
      setError('')
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

    const timeout = setTimeout(fetchSounds, 250)

    return () => {
      isActive = false
      clearTimeout(timeout)
      controller.abort()
    }
  }, [query])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-purple-950 text-gray-100">
      <SiteNav />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pb-16 pt-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-white md:text-5xl">Biblioteca</h1>
          <p className="mt-3 text-base text-gray-300 md:text-lg">
            Busca por título o etiquetas para encontrar sonidos dentro de tu colección.
          </p>
        </header>

        <form className="relative" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="library-search" className="sr-only">
            Buscar sonidos
          </label>
          <input
            id="library-search"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Busca por título o etiquetas…"
            className="w-full rounded-xl border border-purple-500/40 bg-black/60 px-4 py-3 text-base text-gray-100 placeholder:text-gray-500 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-3 my-auto text-sm text-purple-300 hover:text-purple-100"
            >
              Limpiar
            </button>
          )}
        </form>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {!query.trim() && !isLoading && !error && (
          <div className="rounded-xl border border-purple-500/20 bg-black/40 px-4 py-6 text-center text-sm text-gray-300">
            Escribe una consulta para comenzar a explorar tu biblioteca de sonidos.
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-xl border border-purple-500/10 bg-black/40 p-4"
              >
                <div className="h-5 w-2/3 rounded bg-purple-500/20" />
                <div className="mt-2 h-4 w-1/2 rounded bg-purple-500/10" />
                <div className="mt-6 h-10 w-full rounded bg-purple-500/10" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && query.trim() && !error && (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sounds.length === 0 && (
              <li className="col-span-full rounded-xl border border-purple-500/20 bg-black/40 p-6 text-center text-gray-300">
                No encontramos resultados para “{query}”. Prueba con otros términos.
              </li>
            )}

            {sounds.map((sound) => {
              const tags = Array.isArray(sound.tags) ? sound.tags.join(', ') : sound.tags

              return (
                <li
                  key={sound.id ?? sound.path}
                  className="flex h-full flex-col justify-between rounded-2xl border border-purple-500/20 bg-black/50 p-4 shadow-lg shadow-purple-900/20"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-white">{sound.title || '(sin título)'}</h2>
                    {tags && <p className="mt-1 text-sm text-gray-400">{tags}</p>}
                  </div>
                  {sound.path && (
                    <audio
                      controls
                      src={`/${sound.path}`}
                      preload="none"
                      className="mt-4 w-full"
                    >
                      Tu navegador no soporta la reproducción de audio.
                    </audio>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}
