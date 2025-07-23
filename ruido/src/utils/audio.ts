import { AudioAnalysis } from '../types'

export class AudioUtils {
  /**
   * Format duration from seconds to MM:SS format
   */
  static formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  /**
   * Format file size to human readable format
   */
  static formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  /**
   * Validate audio file type
   */
  static isValidAudioFile(file: File): boolean {
    const validTypes = [
      'audio/wav',
      'audio/wave',
      'audio/x-wav',
      'audio/mpeg',
      'audio/mp3',
      'audio/aiff',
      'audio/x-aiff',
      'audio/flac',
      'audio/x-flac',
      'audio/ogg',
      'audio/webm',
    ]
    return validTypes.includes(file.type)
  }

  /**
   * Get audio file metadata
   */
  static async getAudioMetadata(file: File): Promise<{
    duration: number
    sampleRate?: number
    channels?: number
  }> {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      const url = URL.createObjectURL(file)
      
      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url)
        resolve({
          duration: audio.duration,
          // Note: sampleRate and channels are not available through HTML5 Audio API
          // These would need to be extracted using Web Audio API or server-side processing
        })
      })
      
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to load audio metadata'))
      })
      
      audio.src = url
    })
  }

  /**
   * Generate waveform data from audio file
   */
  static async generateWaveform(file: File, samples = 1000): Promise<number[]> {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const reader = new FileReader()
      
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
          
          const channelData = audioBuffer.getChannelData(0) // Use first channel
          const blockSize = Math.floor(channelData.length / samples)
          const waveform: number[] = []
          
          for (let i = 0; i < samples; i++) {
            const start = i * blockSize
            const end = start + blockSize
            let sum = 0
            
            for (let j = start; j < end; j++) {
              sum += Math.abs(channelData[j])
            }
            
            waveform.push(sum / blockSize)
          }
          
          resolve(waveform)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read audio file'))
      reader.readAsArrayBuffer(file)
    })
  }

  /**
   * Analyze audio file for tempo, key, etc.
   * Note: This is a simplified implementation. Real-world applications would use
   * more sophisticated algorithms or server-side processing.
   */
  static async analyzeAudio(file: File): Promise<Partial<AudioAnalysis>> {
    try {
      const waveform = await this.generateWaveform(file, 500)
      const metadata = await this.getAudioMetadata(file)
      
      // Simple peak detection for tempo estimation
      const peaks = this.detectPeaks(waveform, 0.3)
      const estimatedTempo = this.estimateTempo(peaks, metadata.duration)
      
      // Calculate RMS (Root Mean Square) for loudness
      const rms = Math.sqrt(waveform.reduce((sum, val) => sum + val * val, 0) / waveform.length)
      
      return {
        waveform,
        peaks,
        tempo: estimatedTempo,
        rms,
        loudness: rms * 100, // Convert to percentage
      }
    } catch (error) {
      console.error('Audio analysis failed:', error)
      return {}
    }
  }

  /**
   * Detect peaks in waveform data
   */
  private static detectPeaks(data: number[], threshold: number): number[] {
    const peaks: number[] = []
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > threshold && data[i] > data[i - 1] && data[i] > data[i + 1]) {
        peaks.push(i)
      }
    }
    
    return peaks
  }

  /**
   * Estimate tempo from peak data
   */
  private static estimateTempo(peaks: number[], duration: number): number {
    if (peaks.length < 2) return 120 // Default BPM
    
    const intervals: number[] = []
    for (let i = 1; i < peaks.length; i++) {
      intervals.push(peaks[i] - peaks[i - 1])
    }
    
    // Find most common interval
    const intervalCounts = new Map<number, number>()
    intervals.forEach(interval => {
      const rounded = Math.round(interval)
      intervalCounts.set(rounded, (intervalCounts.get(rounded) || 0) + 1)
    })
    
    let mostCommonInterval = 0
    let maxCount = 0
    intervalCounts.forEach((count, interval) => {
      if (count > maxCount) {
        maxCount = count
        mostCommonInterval = interval
      }
    })
    
    // Convert to BPM (rough estimation)
    const samplesPerSecond = peaks.length / duration
    const beatsPerSecond = samplesPerSecond / mostCommonInterval
    const bpm = Math.round(beatsPerSecond * 60)
    
    // Clamp to reasonable range
    return Math.max(60, Math.min(200, bpm))
  }

  /**
   * Generate audio spectrum data for visualization
   */
  static getSpectrumData(analyser: AnalyserNode): number[] {
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.getByteFrequencyData(dataArray)
    
    // Normalize to 0-1 range
    return Array.from(dataArray).map(value => value / 255)
  }

  /**
   * Generate waveform data for visualization
   */
  static getWaveformData(analyser: AnalyserNode): number[] {
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.getByteTimeDomainData(dataArray)
    
    // Normalize to -1 to 1 range
    return Array.from(dataArray).map(value => (value - 128) / 128)
  }

  /**
   * Create audio context with proper browser compatibility
   */
  static createAudioContext(): AudioContext | null {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      return new AudioContextClass()
    } catch (error) {
      console.error('Failed to create audio context:', error)
      return null
    }
  }

  /**
   * Download audio file
   */
  static downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * Convert audio file to different format (client-side, limited support)
   */
  static async convertAudioFormat(
    file: File, 
    targetFormat: 'wav' | 'mp3' | 'ogg'
  ): Promise<Blob> {
    // Note: Client-side audio conversion is limited and complex
    // This is a placeholder for server-side conversion
    throw new Error('Audio conversion should be handled server-side')
  }

  /**
   * Validate audio quality parameters
   */
  static validateAudioQuality(file: File): {
    isValid: boolean
    issues: string[]
  } {
    const issues: string[] = []
    
    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      issues.push('File size exceeds 100MB limit')
    }
    
    // Check file type
    if (!this.isValidAudioFile(file)) {
      issues.push('Unsupported audio format')
    }
    
    return {
      isValid: issues.length === 0,
      issues
    }
  }
}

