import { NavLink, Link } from 'react-router-dom'
import { Activity, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { cn } from '@/lib/utils.js'

const navItems = [
  { to: '/', label: 'Inicio' },
  { to: '/library', label: 'Biblioteca' },
  { to: '/upload', label: 'Subir' },
  { to: '/profile', label: 'Perfil' },
]

export default function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-purple-500/20 bg-black/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-sm text-gray-200">
        <NavLink to="/" className="flex items-center space-x-2 text-lg font-semibold">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
            <Activity className="h-5 w-5 text-white" />
          </span>
          <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">ruido</span>
        </NavLink>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 font-medium text-gray-300 transition-colors hover:bg-purple-600/10 hover:text-purple-200',
                  isActive && 'border border-purple-500/40 bg-purple-600/20 text-purple-100 shadow-sm shadow-purple-900/20',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Button asChild variant="ghost" className="text-purple-100 hover:bg-purple-600/10">
            <Link to="/upload">
              <Sparkles className="h-4 w-4" />
              Explorar beta
            </Link>
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
            Iniciar sesión
          </Button>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-1 text-xs font-medium text-gray-300 transition-colors hover:bg-purple-600/20 hover:text-purple-100',
                  isActive && 'border border-purple-500/40 bg-purple-600/30 text-purple-100',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  )
}
