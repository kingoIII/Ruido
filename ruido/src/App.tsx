import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import { AudioPlayerProvider } from './contexts/AudioPlayerContext'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Library from './components/Library'
import Upload from './components/Upload'
import AudioVisualizer from './components/AudioVisualizer'
import Login from './components/Login'
import Register from './components/Register'

const AppLayout: React.FC = () => {
  const location = useLocation()
  const authRoutes = ['/login', '/register']
  if (authRoutes.includes(location.pathname)) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    )
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/library" element={<Library />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/visualizer" element={<AudioVisualizer />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AudioPlayerProvider>
        <div className="dark min-h-screen bg-black text-white">
          <Router>
            <AppLayout />
          </Router>
        </div>
      </AudioPlayerProvider>
    </AuthProvider>
  )
}

export default App

