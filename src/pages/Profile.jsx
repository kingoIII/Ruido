import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteNav from '../components/SiteNav.jsx'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.jsx'
import { Skeleton } from '@/components/ui/skeleton.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.jsx'
import { Sparkles, Music4, Users, Clock3, Upload, ArrowUpRight } from 'lucide-react'

const formatDate = (value) => {
  if (!value) return 'Fecha desconocida'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Fecha desconocida'
  }

  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

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

  const displayName = useMemo(() => {
    if (!profile) return 'Creador anónimo'
    return profile.displayName || profile.username || 'Creador anónimo'
  }, [profile])

  const initials = useMemo(() => {
    return displayName
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2)
  }, [displayName])

  const soundCount = useMemo(() => {
    if (!profile) return 0
    if (Array.isArray(profile.sounds)) return profile.sounds.length
    if (Array.isArray(profile.uploads)) return profile.uploads.length
    return profile.soundsCount ?? profile.uploadsCount ?? 0
  }, [profile])

  const followers = profile?.followers ?? 0
  const following = profile?.following ?? 0
  const membership = profile?.plan || profile?.subscription || profile?.tier || 'Creador'

  const latestSounds = useMemo(() => {
    if (!profile) return []
    if (Array.isArray(profile.sounds)) return profile.sounds.slice(0, 5)
    if (Array.isArray(profile.uploads)) return profile.uploads.slice(0, 5)
    return []
  }, [profile])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-purple-950 text-gray-100">
      <SiteNav />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-20 pt-10">
        <section className="space-y-4 text-center">
          <Badge variant="secondary" className="mx-auto w-fit bg-purple-500/20 text-purple-100">
            Tu universo creativo
          </Badge>
          <h1 className="text-4xl font-bold text-white md:text-5xl">Gestiona tu perfil y comunidad</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-300">
            Visualiza tus métricas, consulta tus últimos sonidos y mantente conectado con la comunidad ruido.
          </p>
        </section>

        {isLoading && (
          <Card className="border-purple-500/20 bg-black/40">
            <CardHeader className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full bg-purple-500/20" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-1/3 bg-purple-500/20" />
                <Skeleton className="h-4 w-1/2 bg-purple-500/10" />
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-24 rounded-xl bg-purple-500/10" />
              ))}
            </CardContent>
          </Card>
        )}

        {error && !isLoading && (
          <Alert variant="destructive" className="border-red-500/40 bg-red-500/10 text-red-100">
            <AlertTitle>No pudimos cargar tu perfil</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && profile && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="mx-auto flex w-full max-w-md justify-center gap-2 border border-purple-500/30 bg-black/40 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-200">
                Resumen
              </TabsTrigger>
              <TabsTrigger value="sounds" className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-200">
                Sonidos
              </TabsTrigger>
              <TabsTrigger value="community" className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-200">
                Comunidad
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="border-purple-500/20 bg-black/50 shadow-xl shadow-purple-900/20">
                <CardHeader className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border border-purple-500/40">
                      <AvatarImage src={profile.avatarUrl || profile.avatar} alt={displayName} />
                      <AvatarFallback className="bg-purple-600/20 text-lg font-semibold text-purple-100">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-2xl text-white">{displayName}</CardTitle>
                      <CardDescription className="text-gray-300">
                        {profile.email || 'Añade un correo para recibir notificaciones personalizadas.'}
                      </CardDescription>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge className="bg-purple-600/30 text-purple-100">{membership}</Badge>
                        <Badge variant="outline" className="border-purple-500/40 text-purple-100">
                          Creando desde {formatDate(profile.createdAt || profile.joinedAt)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
                      <Link to="/upload">
                        <Upload className="h-4 w-4" /> Subir sonido
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="border-purple-500/40 text-purple-100 hover:bg-purple-500/20">
                      <Link to="/library">
                        <Music4 className="h-4 w-4" /> Ir a biblioteca
                      </Link>
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-purple-500/20 bg-black/60 p-4">
                    <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-purple-200/80">
                      <Music4 className="h-4 w-4" /> Sonidos subidos
                    </p>
                    <p className="mt-2 text-3xl font-bold text-white">{soundCount}</p>
                  </div>
                  <div className="rounded-2xl border border-purple-500/20 bg-black/60 p-4">
                    <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-purple-200/80">
                      <Users className="h-4 w-4" /> Seguidores
                    </p>
                    <p className="mt-2 text-3xl font-bold text-white">{followers}</p>
                  </div>
                  <div className="rounded-2xl border border-purple-500/20 bg-black/60 p-4">
                    <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-purple-200/80">
                      <ArrowUpRight className="h-4 w-4" /> Siguiendo
                    </p>
                    <p className="mt-2 text-3xl font-bold text-white">{following}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-500/10 bg-black/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Sparkles className="h-5 w-5 text-purple-300" /> Recomendaciones personalizadas
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Consejos rápidos para potenciar tu presencia en la comunidad ruido.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-purple-500/20 bg-black/50 p-4 text-sm text-gray-300">
                    Publica un nuevo paquete de sonidos cada semana para mantener tu perfil activo.
                  </div>
                  <div className="rounded-xl border border-purple-500/20 bg-black/50 p-4 text-sm text-gray-300">
                    Añade descripciones detalladas y etiquetas específicas para que otros creadores encuentren tus samples.
                  </div>
                  <div className="rounded-xl border border-purple-500/20 bg-black/50 p-4 text-sm text-gray-300">
                    Colabora con la comunidad dejando reseñas y compartiendo playlists inspiradoras.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sounds" className="space-y-6">
              <Card className="border-purple-500/20 bg-black/50">
                <CardHeader>
                  <CardTitle className="text-white">Tus últimos sonidos</CardTitle>
                  <CardDescription className="text-gray-400">
                    Revisa la actividad reciente y verifica que todo esté correcto.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {latestSounds.length === 0 ? (
                    <div className="rounded-xl border border-purple-500/20 bg-black/40 p-6 text-center text-sm text-gray-300">
                      Aún no has subido sonidos. ¡Comparte tu primer sample y comienza a inspirar a otros!
                    </div>
                  ) : (
                    <Table className="text-gray-200">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Etiquetas</TableHead>
                          <TableHead>Fecha</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {latestSounds.map((sound) => (
                          <TableRow key={sound.id ?? sound.path}>
                            <TableCell className="font-medium text-white">{sound.title || 'Sin título'}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-2">
                                {Array.isArray(sound.tags)
                                  ? sound.tags.map((tag) => (
                                      <Badge key={tag} variant="outline" className="border-purple-500/40 text-purple-100">
                                        #{tag}
                                      </Badge>
                                    ))
                                  : sound.tags}
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(sound.createdAt || sound.uploadedAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableCaption>Últimas 5 cargas</TableCaption>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="community" className="space-y-6">
              <Card className="border-purple-500/20 bg-black/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Clock3 className="h-5 w-5 text-purple-300" /> Actividad comunitaria
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Próximamente podrás descubrir estadísticas de tus colaboraciones y seguidores.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-300">
                  <p>
                    Estamos construyendo un panel para mostrar reseñas recibidas, playlists donde apareces y conexiones con otros
                    artistas.
                  </p>
                  <p>
                    Mientras tanto, mantente activo subiendo sonidos y participando en la comunidad para desbloquear futuras
                    funciones.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="border-purple-500/40 text-purple-100 hover:bg-purple-500/20">
                    <Link to="/library">Explorar biblioteca</Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
