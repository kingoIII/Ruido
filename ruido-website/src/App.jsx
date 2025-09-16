import React from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Play, Pause, Volume2, Search, Menu, X, Headphones, Activity, Zap, Globe } from 'lucide-react'
import AudioVisualizer from './components/AudioVisualizer.jsx'
import './App.css'

function App() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isPlaying, setIsPlaying] = React.useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const togglePlay = () => setIsPlaying(!isPlaying)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                ruido
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-purple-400 transition-colors">Features</a>
              <a href="#library" className="text-gray-300 hover:text-purple-400 transition-colors">Library</a>
              <a href="#about" className="text-gray-300 hover:text-purple-400 transition-colors">About</a>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Get Started
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={toggleMenu}>
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/90 backdrop-blur-md border-t border-purple-500/20">
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block text-gray-300 hover:text-purple-400 transition-colors">Features</a>
              <a href="#library" className="block text-gray-300 hover:text-purple-400 transition-colors">Library</a>
              <a href="#about" className="block text-gray-300 hover:text-purple-400 transition-colors">About</a>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Get Started
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                The Future of
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
                Sound is Here
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Discover a universe of high-quality, royalty-free sounds with our revolutionary platform 
              for music producers, sound designers, and artists.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-3">
                <Play className="w-5 h-5 mr-2" />
                Start Creating
              </Button>
              <Button size="lg" variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10 text-lg px-8 py-3">
                <Headphones className="w-5 h-5 mr-2" />
                Listen to Samples
              </Button>
            </div>
          </div>

          {/* 3D Visualizer */}
          <div className="mt-16 relative">
            <AudioVisualizer 
              isPlaying={isPlaying}
              className="w-full h-64 md:h-96 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/30"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Revolutionary Features
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experience the power of ruido with our cutting-edge tools designed for modern creators
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-gray-800/50 to-purple-900/20 p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sleek, Modern Interface</h3>
              <p className="text-gray-300">
                Our stunning dark theme with vibrant purple accents provides a focused, immersive environment for your best work.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-gray-800/50 to-purple-900/20 p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">3D Audio Visualization</h3>
              <p className="text-gray-300">
                See your sounds come to life with our real-time, 3D audio visualizer. It's not just a tool, it's an experience.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-gray-800/50 to-purple-900/20 p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Vast Library of Sounds</h3>
              <p className="text-gray-300">
                Browse our extensive library with powerful filters and lightning-fast search. Find the perfect sound in seconds.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-gray-800/50 to-purple-900/20 p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Seamless Audio Playback</h3>
              <p className="text-gray-300">
                Audition sounds with our built-in player. Create playlists, loop sections, and keep your creative flow going.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-gray-800/50 to-purple-900/20 p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sample Management</h3>
              <p className="text-gray-300">
                Upload, organize, and manage your personal sound library with ease. Intuitive tools for perfect organization.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-gray-800/50 to-purple-900/20 p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Responsive Design</h3>
              <p className="text-gray-300">
                Whether in the studio or on the go, ruido is ready when inspiration strikes. Perfect on all devices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Audio Player Demo Section */}
      <section id="library" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Experience the Player
              </span>
            </h2>
            <p className="text-xl text-gray-300">
              Get a taste of our immersive audio experience
            </p>
          </div>

          {/* Audio Player Interface */}
          <div className="bg-gradient-to-br from-gray-800/50 to-purple-900/20 p-8 rounded-2xl border border-purple-500/30">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Deep House Vibes</h3>
                <p className="text-gray-400">Electronic • 128 BPM • 4:32</p>
              </div>
              <Button
                size="lg"
                onClick={togglePlay}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full w-16 h-16"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>
            </div>

            {/* Waveform Visualization */}
            <div className="h-24 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg mb-6 flex items-center justify-center overflow-hidden">
              <div className="flex items-end space-x-1 h-16">
                {Array.from({ length: 50 }, (_, i) => (
                  <div
                    key={i}
                    className={`bg-gradient-to-t from-purple-500 to-pink-500 w-1 transition-all duration-300 ${
                      isPlaying ? 'animate-pulse' : ''
                    }`}
                    style={{
                      height: `${Math.random() * 100}%`,
                      animationDelay: `${i * 50}ms`
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">1:23</span>
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              </div>
              <span className="text-sm text-gray-400">4:32</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Join the ruido Revolution
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Ready to transform your music production experience? Start your journey with ruido today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-3">
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10 text-lg px-8 py-3">
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                ruido
              </span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 ruido. The Future of Sound is Here.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

