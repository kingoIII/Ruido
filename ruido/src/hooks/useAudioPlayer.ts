import { useState, useRef, useEffect, useCallback } from 'react'
import { AudioSample, AudioPlayerState } from '../types'

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playerState, setPlayerState] = useState<AudioPlayerState>({
    currentSample: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.75,
    isLooping: false,
    playlist: [],
    currentIndex: -1,
  })

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio()
    audioRef.current.preload = 'metadata'
    
    const audio = audioRef.current

    const handleLoadedMetadata = () => {
      setPlayerState(prev => ({
        ...prev,
        duration: audio.duration || 0,
      }))
    }

    const handleTimeUpdate = () => {
      setPlayerState(prev => ({
        ...prev,
        currentTime: audio.currentTime || 0,
      }))
    }

    const handleEnded = () => {
      setPlayerState(prev => ({
        ...prev,
        isPlaying: false,
      }))
      
      // Auto-play next track if in playlist
      if (playerState.playlist.length > 0 && playerState.currentIndex < playerState.playlist.length - 1) {
        playNext()
      }
    }

    const handleError = (error: Event) => {
      console.error('Audio playback error:', error)
      setPlayerState(prev => ({
        ...prev,
        isPlaying: false,
      }))
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.pause()
    }
  }, [])

  // Update audio properties when state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = playerState.volume
      audioRef.current.loop = playerState.isLooping
    }
  }, [playerState.volume, playerState.isLooping])

  const loadSample = useCallback(async (sample: AudioSample) => {
    if (!audioRef.current) return

    try {
      audioRef.current.src = sample.audioUrl
      await audioRef.current.load()
      
      setPlayerState(prev => ({
        ...prev,
        currentSample: sample,
        currentTime: 0,
        isPlaying: false,
      }))
    } catch (error) {
      console.error('Error loading sample:', error)
    }
  }, [])

  const play = useCallback(async (sample?: AudioSample) => {
    if (!audioRef.current) return

    try {
      if (sample && sample.id !== playerState.currentSample?.id) {
        await loadSample(sample)
      }

      if (audioRef.current.src) {
        await audioRef.current.play()
        setPlayerState(prev => ({
          ...prev,
          isPlaying: true,
        }))
      }
    } catch (error) {
      console.error('Error playing audio:', error)
    }
  }, [playerState.currentSample, loadSample])

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setPlayerState(prev => ({
        ...prev,
        isPlaying: false,
      }))
    }
  }, [])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setPlayerState(prev => ({
        ...prev,
        isPlaying: false,
        currentTime: 0,
      }))
    }
  }, [])

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setPlayerState(prev => ({
        ...prev,
        currentTime: time,
      }))
    }
  }, [])

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume))
    setPlayerState(prev => ({
      ...prev,
      volume: clampedVolume,
    }))
  }, [])

  const toggleLoop = useCallback(() => {
    setPlayerState(prev => ({
      ...prev,
      isLooping: !prev.isLooping,
    }))
  }, [])

  const setPlaylist = useCallback((samples: AudioSample[], startIndex = 0) => {
    setPlayerState(prev => ({
      ...prev,
      playlist: samples,
      currentIndex: startIndex,
    }))
    
    if (samples.length > 0 && startIndex >= 0 && startIndex < samples.length) {
      loadSample(samples[startIndex])
    }
  }, [loadSample])

  const playNext = useCallback(() => {
    if (playerState.playlist.length === 0) return

    const nextIndex = (playerState.currentIndex + 1) % playerState.playlist.length
    const nextSample = playerState.playlist[nextIndex]
    
    setPlayerState(prev => ({
      ...prev,
      currentIndex: nextIndex,
    }))
    
    play(nextSample)
  }, [playerState.playlist, playerState.currentIndex, play])

  const playPrevious = useCallback(() => {
    if (playerState.playlist.length === 0) return

    const prevIndex = playerState.currentIndex === 0 
      ? playerState.playlist.length - 1 
      : playerState.currentIndex - 1
    const prevSample = playerState.playlist[prevIndex]
    
    setPlayerState(prev => ({
      ...prev,
      currentIndex: prevIndex,
    }))
    
    play(prevSample)
  }, [playerState.playlist, playerState.currentIndex, play])

  const togglePlayPause = useCallback(() => {
    if (playerState.isPlaying) {
      pause()
    } else {
      play()
    }
  }, [playerState.isPlaying, play, pause])

  // Audio analysis for visualizer
  const getAudioContext = useCallback(() => {
    if (!audioRef.current) return null

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = audioContext.createMediaElementSource(audioRef.current)
      const analyser = audioContext.createAnalyser()
      
      source.connect(analyser)
      analyser.connect(audioContext.destination)
      
      analyser.fftSize = 256
      
      return { audioContext, analyser }
    } catch (error) {
      console.error('Error creating audio context:', error)
      return null
    }
  }, [])

  const getFrequencyData = useCallback(() => {
    const context = getAudioContext()
    if (!context) return new Uint8Array(0)

    const { analyser } = context
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.getByteFrequencyData(dataArray)
    
    return dataArray
  }, [getAudioContext])

  const getWaveformData = useCallback(() => {
    const context = getAudioContext()
    if (!context) return new Uint8Array(0)

    const { analyser } = context
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.getByteTimeDomainData(dataArray)
    
    return dataArray
  }, [getAudioContext])

  return {
    playerState,
    play,
    pause,
    stop,
    seek,
    setVolume,
    toggleLoop,
    togglePlayPause,
    setPlaylist,
    playNext,
    playPrevious,
    loadSample,
    getFrequencyData,
    getWaveformData,
  }
}

