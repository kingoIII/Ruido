import { useState } from 'react'
import SiteNav from '../components/SiteNav.jsx'

export default function UploadForm() {
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 pb-16 pt-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-white md:text-5xl">Sube un sonido</h1>
          <p className="mt-3 text-base text-gray-300 md:text-lg">
            Completa el formulario y comparte tus sonidos con la comunidad. Recuerda iniciar sesión para obtener tu token.
          </p>
        </header>

        <section className="rounded-2xl border border-purple-500/20 bg-black/50 p-6 shadow-xl shadow-purple-900/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-gray-200">
                Título
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Introduce un título descriptivo"
                className="w-full rounded-lg border border-purple-500/40 bg-black/60 px-4 py-3 text-gray-100 placeholder:text-gray-500 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="tags" className="text-sm font-medium text-gray-200">
                Etiquetas
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="separadas,por,comas"
                className="w-full rounded-lg border border-purple-500/40 bg-black/60 px-4 py-3 text-gray-100 placeholder:text-gray-500 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500">
                Usa comas para separar etiquetas. Ejemplo: ambient, paisaje sonoro, naturaleza.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="file" className="text-sm font-medium text-gray-200">
                Archivo de audio
              </label>
              <input
                id="file"
                type="file"
                accept="audio/*"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="w-full cursor-pointer rounded-lg border border-dashed border-purple-500/40 bg-black/60 px-4 py-3 text-gray-100 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {file && (
                <p className="text-xs text-purple-200">
                  Archivo seleccionado: <span className="font-medium">{file.name}</span>
                </p>
              )}
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {status && (
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {status}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-base font-semibold text-white transition hover:from-purple-700 hover:to-pink-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Subiendo…' : 'Subir sonido'}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-purple-500/10 bg-black/40 p-6 text-sm text-gray-400">
          <h2 className="text-lg font-semibold text-white">¿Dónde se guarda el token?</h2>
          <p className="mt-2">
            Guarda tu <strong>ruidoToken</strong> y el identificador de usuario <strong>ruidoUserId</strong> en el
            <code className="mx-1 rounded bg-purple-500/20 px-1.5 py-0.5">localStorage</code> después de iniciar sesión.
            El formulario utiliza automáticamente esos valores para autenticar la subida.
          </p>
        </section>
      </main>
    </div>
  )
}
