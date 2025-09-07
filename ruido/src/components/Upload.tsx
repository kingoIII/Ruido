import React, { useState, useCallback } from 'react'
import { Upload as UploadIcon, X, Music, FileAudio, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import apiService from '@/services/api'

interface UploadFile {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  metadata?: {
    title: string
    artist: string
    genre: string
    bpm: string
    key: string
    tags: string
    description: string
  }
}

const Upload: React.FC = () => {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFiles = (fileList: File[]) => {
    const audioFiles = fileList.filter(file => file.type.startsWith('audio/'))
    const newFiles: UploadFile[] = audioFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'pending',
      metadata: {
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: '',
        genre: '',
        bpm: '',
        key: '',
        tags: '',
        description: ''
      }
    }))
    
    setFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }

  const updateMetadata = (id: string, field: keyof UploadFile['metadata'], value: string) => {
    setFiles(prev => prev.map(file => 
      file.id === id 
        ? { ...file, metadata: { ...file.metadata!, [field]: value } }
        : file
    ))
  }

  const uploadFile = async (id: string) => {
    const target = files.find(f => f.id === id)
    if (!target) return
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'uploading', progress: 0 } : f))
    try {
      await apiService.uploadSample(target.file, {
        title: target.metadata?.title || target.file.name,
        artist: target.metadata?.artist || '',
        genre: target.metadata?.genre || '',
        bpm: Number(target.metadata?.bpm) || undefined,
        key: target.metadata?.key,
        tags: target.metadata?.tags?.split(',').map(t => t.trim()).filter(Boolean),
        description: target.metadata?.description,
      }, (p) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: p.progress } : f))
      })
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'completed', progress: 100 } : f))
    } catch (err) {
      console.error('Upload failed', err)
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'error' } : f))
    }
  }

  const uploadAll = () => {
    files.forEach(file => {
      if (file.status === 'pending') {
        uploadFile(file.id)
      }
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Upload Samples</h1>
        {files.length > 0 && (
          <Button onClick={uploadAll} className="bg-purple-600 hover:bg-purple-700">
            <UploadIcon className="w-4 h-4 mr-2" />
            Upload All ({files.filter(f => f.status === 'pending').length})
          </Button>
        )}
      </div>

      {/* Upload Area */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-8">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive 
                ? 'border-purple-500 bg-purple-500/10' 
                : 'border-gray-700 hover:border-gray-600'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                <Music className="w-8 h-8 text-purple-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Drop your audio files here
                </h3>
                <p className="text-gray-400 mb-4">
                  Supports WAV, MP3, AIFF, and FLAC files up to 100MB each
                </p>
                <Button
                  variant="outline"
                  className="border-gray-700 text-gray-400 hover:text-white"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Choose Files
                </Button>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Files to Upload</h2>
          {files.map((fileItem) => (
            <Card key={fileItem.id} className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileAudio className="w-5 h-5 text-purple-500" />
                    <div>
                      <CardTitle className="text-lg text-white">{fileItem.file.name}</CardTitle>
                      <p className="text-sm text-gray-400">
                        {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {fileItem.status === 'completed' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {fileItem.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeFile(fileItem.id)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {fileItem.status === 'uploading' && (
                  <Progress value={fileItem.progress} className="mt-2" />
                )}
              </CardHeader>

              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`title-${fileItem.id}`} className="text-gray-400">Title</Label>
                      <Input
                        id={`title-${fileItem.id}`}
                        value={fileItem.metadata?.title || ''}
                        onChange={(e) => updateMetadata(fileItem.id, 'title', e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Sample title"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`artist-${fileItem.id}`} className="text-gray-400">Artist</Label>
                      <Input
                        id={`artist-${fileItem.id}`}
                        value={fileItem.metadata?.artist || ''}
                        onChange={(e) => updateMetadata(fileItem.id, 'artist', e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Artist name"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor={`bpm-${fileItem.id}`} className="text-gray-400">BPM</Label>
                        <Input
                          id={`bpm-${fileItem.id}`}
                          value={fileItem.metadata?.bpm || ''}
                          onChange={(e) => updateMetadata(fileItem.id, 'bpm', e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                          placeholder="120"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`key-${fileItem.id}`} className="text-gray-400">Key</Label>
                        <Input
                          id={`key-${fileItem.id}`}
                          value={fileItem.metadata?.key || ''}
                          onChange={(e) => updateMetadata(fileItem.id, 'key', e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                          placeholder="C"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`genre-${fileItem.id}`} className="text-gray-400">Genre</Label>
                      <Select value={fileItem.metadata?.genre} onValueChange={(value) => updateMetadata(fileItem.id, 'genre', value)}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Select genre" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="trap">Trap</SelectItem>
                          <SelectItem value="future-bass">Future Bass</SelectItem>
                          <SelectItem value="lo-fi">Lo-Fi</SelectItem>
                          <SelectItem value="dubstep">Dubstep</SelectItem>
                          <SelectItem value="ambient">Ambient</SelectItem>
                          <SelectItem value="house">House</SelectItem>
                          <SelectItem value="techno">Techno</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor={`tags-${fileItem.id}`} className="text-gray-400">Tags</Label>
                      <Input
                        id={`tags-${fileItem.id}`}
                        value={fileItem.metadata?.tags || ''}
                        onChange={(e) => updateMetadata(fileItem.id, 'tags', e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="kick, dark, heavy"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`description-${fileItem.id}`} className="text-gray-400">Description</Label>
                      <Textarea
                        id={`description-${fileItem.id}`}
                        value={fileItem.metadata?.description || ''}
                        onChange={(e) => updateMetadata(fileItem.id, 'description', e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white resize-none"
                        placeholder="Describe your sample..."
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {fileItem.status === 'pending' && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={() => uploadFile(fileItem.id)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <UploadIcon className="w-4 h-4 mr-2" />
                      Upload This File
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default Upload

