import React, { createContext, useContext, ReactNode } from 'react'
import { useAudioPlayer } from '../hooks/useAudioPlayer'
import { AudioPlayerState, AudioSample } from '../types'

interface AudioPlayerContextType {
  playerState: AudioPlayerState
  play: (sample?: AudioSample) => Promise<void>
  pause: () => void
  stop: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  toggleLoop: () => void
  togglePlayPause: () => void
  setPlaylist: (samples: AudioSample[], startIndex?: number) => void
  playNext: () => void
  playPrevious: () => void
  loadSample: (sample: AudioSample) => Promise<void>
  getFrequencyData: () => Uint8Array
  getWaveformData: () => Uint8Array
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined)

export const useAudioPlayerContext = () => {
  const context = useContext(AudioPlayerContext)
  if (context === undefined) {
    throw new Error('useAudioPlayerContext must be used within an AudioPlayerProvider')
  }
  return context
}

interface AudioPlayerProviderProps {
  children: ReactNode
}

export const AudioPlayerProvider: React.FC<AudioPlayerProviderProps> = ({ children }) => {
  const audioPlayer = useAudioPlayer()

  return (
    <AudioPlayerContext.Provider value={audioPlayer}>
      {children}
    </AudioPlayerContext.Provider>
  )
}

