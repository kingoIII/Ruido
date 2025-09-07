import React, { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, Box } from '@react-three/drei'
import * as THREE from 'three'
import { Play, Pause, SkipBack, SkipForward, Volume2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Audio Visualizer Scene Components
const WaveformBars: React.FC<{ audioData: number[]; visualizerType: string }> = ({ audioData, visualizerType }) => {
  const meshRefs = useRef<THREE.Mesh[]>([])
  const { viewport } = useThree()

  useFrame(() => {
    if (meshRefs.current) {
      meshRefs.current.forEach((mesh, i) => {
        if (mesh && audioData[i] !== undefined) {
          const height = audioData[i] * 5 + 0.1
          mesh.scale.y = height
          mesh.position.y = height / 2
          
          // Color based on frequency
          const hue = (i / audioData.length) * 360
          const color = new THREE.Color().setHSL(hue / 360, 0.8, 0.6)
          ;(mesh.material as THREE.MeshBasicMaterial).color = color
        }
      })
    }
  })

  const bars = useMemo(() => {
    const barCount = visualizerType === 'spectrum' ? 64 : 32
    const barWidth = viewport.width / barCount
    
    return Array.from({ length: barCount }, (_, i) => (
      <Box
        key={i}
        ref={(el) => {
          if (el) meshRefs.current[i] = el
        }}
        args={[barWidth * 0.8, 1, 0.5]}
        position={[i * barWidth - viewport.width / 2 + barWidth / 2, 0, 0]}
      >
        <meshBasicMaterial color="#8b5cf6" />
      </Box>
    ))
  }, [viewport.width, visualizerType])

  return <>{bars}</>
}

const CircularVisualizer: React.FC<{ audioData: number[] }> = ({ audioData }) => {
  const meshRefs = useRef<THREE.Mesh[]>([])
  
  useFrame((state) => {
    if (meshRefs.current) {
      meshRefs.current.forEach((mesh, i) => {
        if (mesh && audioData[i] !== undefined) {
          const radius = 3 + audioData[i] * 2
          const angle = (i / audioData.length) * Math.PI * 2
          
          mesh.position.x = Math.cos(angle) * radius
          mesh.position.z = Math.sin(angle) * radius
          mesh.scale.y = audioData[i] * 3 + 0.1
          
          // Rotate the entire visualization
          mesh.rotation.y = state.clock.elapsedTime * 0.5
          
          const hue = (i / audioData.length) * 360
          const color = new THREE.Color().setHSL(hue / 360, 0.9, 0.7)
          ;(mesh.material as THREE.MeshBasicMaterial).color = color
        }
      })
    }
  })

  const bars = useMemo(() => {
    return Array.from({ length: 32 }, (_, i) => (
      <Box
        key={i}
        ref={(el) => {
          if (el) meshRefs.current[i] = el
        }}
        args={[0.1, 1, 0.1]}
        position={[0, 0, 0]}
      >
        <meshBasicMaterial color="#8b5cf6" />
      </Box>
    ))
  }, [])

  return <>{bars}</>
}

const ParticleField: React.FC<{ audioData: number[] }> = ({ audioData }) => {
  const pointsRef = useRef<THREE.Points>(null)
  const particleCount = 1000
  
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
      
      colors[i * 3] = Math.random()
      colors[i * 3 + 1] = Math.random()
      colors[i * 3 + 2] = Math.random()
    }
    
    return { positions, colors }
  }, [])

  useFrame((state) => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array
      const avgAudio = audioData.reduce((sum, val) => sum + val, 0) / audioData.length
      
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i * 0.01) * avgAudio * 0.1
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors />
    </points>
  )
}

const AudioVisualizer: React.FC = () => {
  const { playerState, togglePlayPause, playNext, playPrevious, seek, setVolume: setPlayerVolume, getFrequencyData } = useAudioPlayerContext()
  const [visualizerType, setVisualizerType] = useState('spectrum')
  const [audioData, setAudioData] = useState<number[]>(Array(64).fill(0))
  const [volume, setVolume] = useState([playerState.volume * 100])

  useEffect(() => setVolume([playerState.volume * 100]), [playerState.volume])

  useEffect(() => {
    let animationId: number
    const animate = () => {
      const data = getFrequencyData()
      if (data.length) {
        setAudioData(Array.from(data).slice(0, 64).map(v => v / 255))
      }
      animationId = requestAnimationFrame(animate)
    }
    if (playerState.isPlaying) {
      animate()
    }
    return () => cancelAnimationFrame(animationId)
  }, [playerState.isPlaying, getFrequencyData])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const renderVisualizer = () => {
    switch (visualizerType) {
      case 'circular':
        return <CircularVisualizer audioData={audioData} />
      case 'particles':
        return <ParticleField audioData={audioData} />
      default:
        return <WaveformBars audioData={audioData} visualizerType={visualizerType} />
    }
  }

  return (
    <div className="h-full flex flex-col bg-black">
      {/* 3D Visualizer */}
      <div className="flex-1 relative">
        <Canvas
          camera={{ position: [0, 5, 10], fov: 60 }}
          style={{ background: 'linear-gradient(to bottom, #1a1a2e, #16213e, #0f3460)' }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          
          {renderVisualizer()}
          
          <Text
            position={[0, 6, 0]}
            fontSize={1}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            ruido visualizer
          </Text>
          
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
            minDistance={5}
            maxDistance={20}
          />
        </Canvas>
        
        {/* Visualizer Controls */}
        <div className="absolute top-4 right-4">
          <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Visualizer Type</label>
                  <Select value={visualizerType} onValueChange={setVisualizerType}>
                    <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="spectrum">Spectrum</SelectItem>
                      <SelectItem value="waveform">Waveform</SelectItem>
                      <SelectItem value="circular">Circular</SelectItem>
                      <SelectItem value="particles">Particles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button variant="outline" size="sm" className="w-full border-gray-700 text-gray-400">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Audio Controls */}
      <div className="bg-gray-900 border-t border-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Track Info */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">{playerState.currentSample?.filename || 'No Track'}</h3>
              {playerState.currentSample && (
                <p className="text-sm text-gray-400">{playerState.currentSample.artist} • {playerState.currentSample.bpm} BPM • {playerState.currentSample.key}</p>
              )}
            </div>
            <div className="text-sm text-gray-400">
              {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <Slider
              value={[playerState.currentTime]}
              max={playerState.duration}
              step={0.1}
              className="w-full"
              onValueChange={(value) => seek(value[0])}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white" onClick={playPrevious}>
                <SkipBack className="w-5 h-5" />
              </Button>

              <Button
                size="icon"
                className="bg-purple-600 hover:bg-purple-700 w-12 h-12"
                onClick={togglePlayPause}
              >
                {playerState.isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </Button>

              <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white" onClick={playNext}>
                <SkipForward className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              <Volume2 className="w-5 h-5 text-gray-400" />
              <Slider
                value={volume}
                max={100}
                step={1}
                className="w-24"
                onValueChange={(v) => { setVolume(v); setPlayerVolume(v[0] / 100) }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AudioVisualizer

