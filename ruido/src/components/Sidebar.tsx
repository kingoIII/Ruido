import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Music, Upload, Activity, Folder, Heart, Clock, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/library', icon: Music, label: 'Library' },
    { to: '/upload', icon: Upload, label: 'Upload' },
    { to: '/visualizer', icon: Activity, label: 'Visualizer' },
  ]

  const libraryItems = [
    { icon: Folder, label: 'My Samples' },
    { icon: Heart, label: 'Favorites' },
    { icon: Clock, label: 'Recent' },
    { icon: TrendingUp, label: 'Trending' },
  ]

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-6">
        <div className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-800">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Library
        </h3>
        <div className="space-y-2">
          {libraryItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <item.icon className="w-4 h-4 mr-3" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-auto p-6 border-t border-gray-800">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-lg">
          <h4 className="font-semibold text-white mb-2">Go Pro</h4>
          <p className="text-sm text-purple-100 mb-3">
            Unlimited downloads and premium features
          </p>
          <Button className="w-full bg-white text-purple-600 hover:bg-gray-100">
            Upgrade Now
          </Button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

