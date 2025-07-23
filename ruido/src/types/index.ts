export interface AudioSample {
  id: string
  title: string
  artist: string
  filename: string
  duration: number
  bpm: number
  key: string
  genre: string
  tags: string[]
  description?: string
  waveformUrl?: string
  audioUrl: string
  createdAt: Date
  updatedAt: Date
  downloadCount: number
  favoriteCount: number
  isPublic: boolean
  userId: string
}

export interface AudioPack {
  id: string
  title: string
  artist: string
  description: string
  coverImageUrl?: string
  samples: AudioSample[]
  genre: string
  bpm: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  downloadCount: number
  favoriteCount: number
  isPublic: boolean
  userId: string
}

export interface User {
  id: string
  username: string
  email: string
  displayName: string
  avatarUrl?: string
  bio?: string
  website?: string
  isPro: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PlaylistItem {
  id: string
  sampleId: string
  sample: AudioSample
  order: number
}

export interface Playlist {
  id: string
  title: string
  description?: string
  items: PlaylistItem[]
  userId: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AudioPlayerState {
  currentSample: AudioSample | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isLooping: boolean
  playlist: AudioSample[]
  currentIndex: number
}

export interface UploadProgress {
  fileId: string
  filename: string
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
}

export interface SearchFilters {
  query?: string
  genre?: string
  bpmMin?: number
  bpmMax?: number
  key?: string
  tags?: string[]
  duration?: {
    min: number
    max: number
  }
  sortBy?: 'newest' | 'oldest' | 'popular' | 'downloads' | 'favorites'
  sortOrder?: 'asc' | 'desc'
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface AudioAnalysis {
  waveform: number[]
  spectrum: number[]
  peaks: number[]
  rms: number
  tempo: number
  key: string
  loudness: number
}

