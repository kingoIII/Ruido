import React from 'react'
import { Activity } from 'lucide-react'

const AudioVisualizer = ({ isPlaying = false, className = "" }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-purple-500 rounded-full opacity-30 ${
              isPlaying ? 'animate-ping' : 'animate-pulse'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Central visualizer */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center z-10">
          <div className={`w-32 h-32 mx-auto mb-4 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full flex items-center justify-center transition-all duration-300 ${
            isPlaying ? 'animate-pulse scale-110' : 'scale-100'
          }`}>
            <Activity className={`w-16 h-16 text-purple-400 transition-all duration-300 ${
              isPlaying ? 'animate-bounce' : ''
            }`} />
          </div>
          <p className="text-purple-300 text-lg font-semibold">3D Audio Visualizer</p>
          <p className="text-gray-400">Interactive sound visualization coming to life</p>
        </div>
      </div>
      
      {/* Waveform bars */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-end space-x-1">
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={i}
            className={`bg-gradient-to-t from-purple-500 to-pink-500 w-1 transition-all duration-300 ${
              isPlaying ? 'animate-pulse' : ''
            }`}
            style={{
              height: `${20 + Math.random() * 40}px`,
              animationDelay: `${i * 50}ms`
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default AudioVisualizer

