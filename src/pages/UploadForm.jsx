import { useState } from 'react'
import SiteNav from '../components/SiteNav.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { UploadCloud, Sparkles, AlertCircle, Check, Info, Lock, Waves } from 'lucide-react'

const licenses = [
  {
    value: 'royalty-free',
    label: 'Royalty Free (Uso comercial)',
    description: 'Permite usarlo en proyectos comerciales sin pagar regalías adicionales.',
  },
  {
    value: 'cc-by',
    label: 'Creative Commons BY',
    description: 'Requiere atribución, ideal para proyectos colaborativos y educativos.',
  },
  {
    value: 'cc0',
    label: 'Creative Commons 0',
    description: 'Domino público. Perfecto si quieres regalar tus sonidos al mundo.',
  },
]

export default function UploadForm() {
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [license, setLicense] = useState('royalty-free')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedLicense = licenses.find((item) => item.value === license)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setStatus('')

    if (!file) {
      setError('Selecciona un archivo de audio para subir.')
      return
    }

    const token = window.localStorage.getItem('ruidoToken')
    if (!token) {
      setError('No encontramos tu token de autenticación. Inicia sesión antes de subir.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('license', license)

    if (title.trim()) {
      formData.append('title', title.trim())
    }

    if (tags.trim()) {
      formData.append(
        'tags',
        tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
          .join(','),
      )
    }

    if (description.trim()) {
      formData.append('description', description.trim())
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        const message = payload?.message || 'No pudimos completar la subida.'
        throw new Error(message)
      }

      setStatus('Archivo subido correctamente. ¡Gracias por compartir tu sonido!')
      setTitle('')
      setTags('')
      setDescription('')
      setFile(null)
    } catch (err) {
      setError(err.message || 'Sucedió un error inesperado. Inténtalo nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-purple-950 text-gray-100">
      <SiteNav />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 pb-20 pt-10">
        <section className="flex flex-col gap-4 text-center">
          <Badge variant="secondary" className="mx-auto w-fit bg-purple-500/20 text-purple-100">
            Comparte tu sonido con el mundo
          </Badge>
          <h1 className="text-4xl font-bold text-white md:text-5xl">Sube un nuevo sample</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-300">
            Sube tus creaciones, añade metadatos atractivos y permite que otros creadores descubran tus texturas únicas.
            Configura la licencia adecuada y deja que ruido se encargue del resto.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="border-purple-500/20 bg-black/50 shadow-xl shadow-purple-900/20">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-3 text-2xl text-white">
                <UploadCloud className="h-6 w-6 text-purple-300" />
                Datos del sonido
              </CardTitle>
              <CardDescription className="text-gray-400">
                Completa la información para que tu sample sea fácil de encontrar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Introduce un título descriptivo"
                      className="border-purple-500/30 bg-black/60 text-gray-100 placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Etiquetas</Label>
                    <Input
                      id="tags"
                      type="text"
                      value={tags}
                      onChange={(event) => setTags(event.target.value)}
                      placeholder="lofi, texturas, modular"
                      className="border-purple-500/30 bg-black/60 text-gray-100 placeholder:text-gray-500"
                    />
                    <p className="text-xs text-gray-500">Usa comas para separar etiquetas.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Cuenta la historia detrás del sonido, el equipo que usaste o el ambiente que capturaste."
                    className="border-purple-500/30 bg-black/60 text-gray-100 placeholder:text-gray-500"
                    rows={4}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                  <div className="space-y-2">
                    <Label htmlFor="file">Archivo de audio</Label>
                    <Input
                      id="file"
                      type="file"
                      accept="audio/*"
                      onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                      className="border-purple-500/30 bg-black/60 text-gray-100"
                    />
                    {file && (
                      <p className="flex items-center gap-2 text-xs text-purple-200">
                        <Check className="h-4 w-4" /> Archivo seleccionado: <span className="font-medium">{file.name}</span>
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Licencia</Label>
                    <Select value={license} onValueChange={setLicense}>
                      <SelectTrigger className="w-full border-purple-500/30 bg-black/60 text-gray-100">
                        <SelectValue placeholder="Selecciona una licencia" />
                      </SelectTrigger>
                      <SelectContent className="border-purple-500/30 bg-black/80 text-gray-100">
                        {licenses.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedLicense && (
                      <p className="text-xs text-gray-500">{selectedLicense.description}</p>
                    )}
                  </div>
                </div>

                <Separator className="bg-purple-500/20" />

                {error && (
                  <Alert variant="destructive" className="border-red-500/40 bg-red-500/10 text-red-100">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No pudimos subir tu sonido</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {status && (
                  <Alert className="border-emerald-500/40 bg-emerald-500/10 text-emerald-100">
                    <Check className="h-4 w-4" />
                    <AlertTitle>¡Listo!</AlertTitle>
                    <AlertDescription>{status}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                >
                  {isSubmitting ? 'Subiendo…' : 'Publicar sonido'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-purple-500/20 bg-black/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Info className="h-5 w-5 text-purple-300" />
                  Buenas prácticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-4 w-4 text-purple-300" />
                  <p>
                    Sube archivos WAV, AIFF o FLAC para conservar la máxima calidad. Mantén el volumen entre -12 dB y -6 dB.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Waves className="mt-0.5 h-4 w-4 text-purple-300" />
                  <p>
                    Añade etiquetas específicas (ej. <span className="text-purple-200">atmósfera nocturna</span>) para aparecer en
                    las búsquedas relevantes.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="mt-0.5 h-4 w-4 text-purple-300" />
                  <p>
                    Respeta los derechos de autor y asegúrate de tener permisos para todo el material que subes.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-500/10 bg-black/30">
              <CardHeader>
                <CardTitle className="text-white">Tu token y usuario</CardTitle>
                <CardDescription className="text-gray-400">
                  Guarda estos datos en tu navegador para que el formulario funcione automáticamente.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-300">
                <p>
                  Guarda <code className="rounded bg-purple-500/20 px-1.5 py-0.5 text-purple-100">ruidoToken</code> y
                  <code className="ml-2 rounded bg-purple-500/20 px-1.5 py-0.5 text-purple-100">ruidoUserId</code> en el
                  <span className="ml-1 font-semibold text-purple-100">localStorage</span> tras iniciar sesión.
                </p>
                <p>
                  Puedes administrar tus sonidos desde el panel de <span className="text-purple-100">Perfil</span> una vez que la
                  subida haya finalizado.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="border-purple-500/40 text-purple-100 hover:bg-purple-500/20">
                  <a href="/profile">Ir al perfil</a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
