import { 
  AudioSample, 
  AudioPack, 
  User, 
  Playlist, 
  ApiResponse, 
  PaginatedResponse, 
  SearchFilters,
  UploadProgress 
} from '../types'

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'
const UPLOAD_BASE_URL = process.env.REACT_APP_UPLOAD_URL || 'http://localhost:3001/upload'

class ApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed')
      }
      
      return data
    } catch (error) {
      console.error('API request error:', error)
      throw error
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: {
    username: string
    email: string
    password: string
    displayName: string
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async logout(): Promise<ApiResponse<null>> {
    return this.request('/auth/logout', { method: 'POST' })
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request('/auth/me')
  }

  // Samples
  async getSamples(filters?: SearchFilters, page = 1, limit = 20): Promise<PaginatedResponse<AudioSample>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    })
    
    const response = await this.request<PaginatedResponse<AudioSample>>(`/samples?${params}`)
    return response.data
  }

  async getSample(id: string): Promise<ApiResponse<AudioSample>> {
    return this.request(`/samples/${id}`)
  }

  async uploadSample(
    file: File, 
    metadata: Partial<AudioSample>,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse<AudioSample>> {
    const formData = new FormData()
    formData.append('audio', file)
    formData.append('metadata', JSON.stringify(metadata))

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100
          onProgress({
            fileId: metadata.id || '',
            filename: file.name,
            progress,
            status: 'uploading'
          })
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          resolve(response)
        } else {
          reject(new Error('Upload failed'))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Upload error'))
      })

      xhr.open('POST', `${UPLOAD_BASE_URL}/sample`)
      xhr.setRequestHeader('Authorization', this.getAuthHeaders().Authorization || '')
      xhr.send(formData)
    })
  }

  async updateSample(id: string, updates: Partial<AudioSample>): Promise<ApiResponse<AudioSample>> {
    return this.request(`/samples/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteSample(id: string): Promise<ApiResponse<null>> {
    return this.request(`/samples/${id}`, { method: 'DELETE' })
  }

  async favoriteSample(id: string): Promise<ApiResponse<null>> {
    return this.request(`/samples/${id}/favorite`, { method: 'POST' })
  }

  async unfavoriteSample(id: string): Promise<ApiResponse<null>> {
    return this.request(`/samples/${id}/favorite`, { method: 'DELETE' })
  }

  async downloadSample(id: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/samples/${id}/download`, {
      headers: this.getAuthHeaders(),
    })
    
    if (!response.ok) {
      throw new Error('Download failed')
    }
    
    return response.blob()
  }

  // Packs
  async getPacks(filters?: SearchFilters, page = 1, limit = 20): Promise<PaginatedResponse<AudioPack>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    })
    
    const response = await this.request<PaginatedResponse<AudioPack>>(`/packs?${params}`)
    return response.data
  }

  async getPack(id: string): Promise<ApiResponse<AudioPack>> {
    return this.request(`/packs/${id}`)
  }

  async createPack(packData: Partial<AudioPack>): Promise<ApiResponse<AudioPack>> {
    return this.request('/packs', {
      method: 'POST',
      body: JSON.stringify(packData),
    })
  }

  async updatePack(id: string, updates: Partial<AudioPack>): Promise<ApiResponse<AudioPack>> {
    return this.request(`/packs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deletePack(id: string): Promise<ApiResponse<null>> {
    return this.request(`/packs/${id}`, { method: 'DELETE' })
  }

  // Playlists
  async getPlaylists(): Promise<ApiResponse<Playlist[]>> {
    return this.request('/playlists')
  }

  async getPlaylist(id: string): Promise<ApiResponse<Playlist>> {
    return this.request(`/playlists/${id}`)
  }

  async createPlaylist(playlistData: Partial<Playlist>): Promise<ApiResponse<Playlist>> {
    return this.request('/playlists', {
      method: 'POST',
      body: JSON.stringify(playlistData),
    })
  }

  async updatePlaylist(id: string, updates: Partial<Playlist>): Promise<ApiResponse<Playlist>> {
    return this.request(`/playlists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deletePlaylist(id: string): Promise<ApiResponse<null>> {
    return this.request(`/playlists/${id}`, { method: 'DELETE' })
  }

  async addToPlaylist(playlistId: string, sampleId: string): Promise<ApiResponse<Playlist>> {
    return this.request(`/playlists/${playlistId}/samples`, {
      method: 'POST',
      body: JSON.stringify({ sampleId }),
    })
  }

  async removeFromPlaylist(playlistId: string, sampleId: string): Promise<ApiResponse<Playlist>> {
    return this.request(`/playlists/${playlistId}/samples/${sampleId}`, {
      method: 'DELETE',
    })
  }

  // Search
  async search(query: string, filters?: SearchFilters): Promise<ApiResponse<{
    samples: AudioSample[]
    packs: AudioPack[]
    users: User[]
  }>> {
    const params = new URLSearchParams({
      q: query,
      ...filters,
    })
    
    return this.request(`/search?${params}`)
  }

  // Analytics
  async getAnalytics(): Promise<ApiResponse<{
    totalSamples: number
    totalDownloads: number
    totalFavorites: number
    recentActivity: any[]
  }>> {
    return this.request('/analytics')
  }
}

export const apiService = new ApiService()
export default apiService

