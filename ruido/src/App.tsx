import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import { AudioPlayerProvider } from './contexts/AudioPlayerContext'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Library from './components/Library'
import Upload from './components/Upload'
import AudioVisualizer from './components/AudioVisualizer'

function App() {
  return (
    <AuthProvider>
      <AudioPlayerProvider>
        <div className="dark min-h-screen bg-black text-white">
          <Router>
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
          </Router>
        </div>
      </AudioPlayerProvider>
    </AuthProvider>
  )
}

export default App

