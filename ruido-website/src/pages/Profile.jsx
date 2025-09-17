import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteNav from '../components/SiteNav.jsx'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userId = window.localStorage.getItem('ruidoUserId')
    if (!userId) {
      setError('No se encontró el identificador de usuario. Guarda ruidoUserId después de iniciar sesión.')
      setIsLoading(false)
      return
    }

    const token = window.localStorage.getItem('ruidoToken')
    if (!token) {
      setError('No se encontró el token de autenticación. Guarda ruidoToken después de iniciar sesión.')
      setIsLoading(false)
      return
    }

    const controller = new AbortController()
    let isActive = true

    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          const message = payload?.message || 'No pudimos recuperar tu perfil.'
          throw new Error(message)
        }

        const data = await response.json()
        if (!isActive) return

        setProfile(data)
        setError('')
      } catch (err) {
        if (!isActive || err.name === 'AbortError') return
        setError(err.message || 'Sucedió un problema al cargar el perfil.')
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    fetchProfile()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [])

  const soundCount = useMemo(() => {
    if (!profile) return 0
    if (Array.isArray(profile.sounds)) return profile.sounds.length
    if (Array.isArray(profile.uploads)) return profile.uploads.length
    return profile.soundsCount ?? profile.uploadsCount ?? 0
  }, [profile])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-purple-950 text-gray-100">
      <SiteNav />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 pb-16 pt-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-white md:text-5xl">Tu perfil</h1>
          <p className="mt-3 text-base text-gray-300 md:text-lg">
            Gestiona tu cuenta y consulta el resumen de tus sonidos subidos.
          </p>
        </header>

        {isLoading && (
          <div className="rounded-2xl border border-purple-500/20 bg-black/40 p-6 text-center text-sm text-gray-300">
            Cargando información de tu perfil…
          </div>
        )}

        {error && !isLoading && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-200">
            {error}
          </div>
        )}

        {!isLoading && !error && profile && (
          <section className="space-y-6 rounded-2xl border border-purple-500/20 bg-black/50 p-6 shadow-xl shadow-purple-900/20">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                {profile.displayName || profile.username || 'Creador anónimo'}
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                {profile.email || 'Actualiza tu perfil para añadir un correo.'}
              </p>
            </div>

            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-purple-500/10 bg-black/40 p-4">
                <dt className="text-sm uppercase tracking-wide text-gray-400">Sonidos subidos</dt>
                <dd className="mt-2 text-3xl font-bold text-white">{soundCount}</dd>
              </div>

              {'followers' in profile && (
                <div className="rounded-xl border border-purple-500/10 bg-black/40 p-4">
                  <dt className="text-sm uppercase tracking-wide text-gray-400">Seguidores</dt>
                  <dd className="mt-2 text-3xl font-bold text-white">{profile.followers}</dd>
                </div>
              )}

              {'following' in profile && (
                <div className="rounded-xl border border-purple-500/10 bg-black/40 p-4">
                  <dt className="text-sm uppercase tracking-wide text-gray-400">Siguiendo</dt>
                  <dd className="mt-2 text-3xl font-bold text-white">{profile.following}</dd>
                </div>
              )}
            </dl>

            {Array.isArray(profile.sounds) && profile.sounds.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Últimos sonidos</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  {profile.sounds.slice(0, 5).map((sound) => (
                    <li
                      key={sound.id ?? sound.path}
                      className="rounded-lg border border-purple-500/10 bg-black/40 px-3 py-2"
                    >
                      <span className="font-medium text-white">{sound.title || 'Sin título'}</span>
                      {sound.tags && (
                        <span className="ml-2 text-gray-400">
                          {Array.isArray(sound.tags) ? sound.tags.join(', ') : sound.tags}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Link
                to="/upload"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white transition hover:from-purple-700 hover:to-pink-700"
              >
                Subir nuevo sonido
              </Link>
              <Link
                to="/library"
                className="inline-flex items-center justify-center rounded-lg border border-purple-500/40 bg-black/40 px-4 py-2 text-sm font-semibold text-purple-200 transition hover:border-purple-400 hover:text-purple-100"
              >
                Ir a la biblioteca
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
