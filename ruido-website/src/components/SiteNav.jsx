import { NavLink } from 'react-router-dom'
import { Activity } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Inicio' },
  { to: '/library', label: 'Biblioteca' },
  { to: '/upload', label: 'Subir' },
  { to: '/profile', label: 'Perfil' },
]

export default function SiteNav() {
  return (
    <header className="sticky top-0 z-40 bg-black/60 backdrop-blur border-b border-purple-500/20">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 text-sm text-gray-200">
        <NavLink to="/" className="flex items-center space-x-2 text-lg font-semibold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
            <Activity className="h-5 w-5 text-white" />
          </span>
          <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">ruido</span>
        </NavLink>
        <nav className="flex items-center gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'rounded-md px-3 py-2 font-medium transition-colors',
                  isActive
                    ? 'bg-purple-600/20 text-purple-200 ring-1 ring-inset ring-purple-500/40'
                    : 'text-gray-300 hover:text-purple-200 hover:bg-purple-600/10',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
