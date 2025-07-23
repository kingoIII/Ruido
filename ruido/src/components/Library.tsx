import React, { useState } from 'react'
import { Play, Download, Heart, MoreHorizontal, Filter, Grid, List, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

const Library: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const samples = [
    {
      id: 1,
      name: 'Dark_Trap_Kick_01.wav',
      artist: 'Producer X',
      duration: '0:03',
      bpm: 140,
      key: 'Am',
      genre: 'Trap',
      tags: ['kick', 'dark', 'heavy'],
      waveform: '/api/placeholder/200/60'
    },
    {
      id: 2,
      name: 'Synth_Lead_Melody.wav',
      artist: 'Synth Master',
      duration: '0:08',
      bpm: 128,
      key: 'C',
      genre: 'Future Bass',
      tags: ['synth', 'lead', 'melody'],
      waveform: '/api/placeholder/200/60'
    },
    {
      id: 3,
      name: 'Lo_Fi_Drum_Loop.wav',
      artist: 'Chill Beats',
      duration: '0:04',
      bpm: 85,
      key: '-',
      genre: 'Lo-Fi',
      tags: ['drums', 'loop', 'chill'],
      waveform: '/api/placeholder/200/60'
    },
    {
      id: 4,
      name: 'Bass_Drop_Heavy.wav',
      artist: 'Bass King',
      duration: '0:05',
      bpm: 150,
      key: 'F#m',
      genre: 'Dubstep',
      tags: ['bass', 'drop', 'heavy'],
      waveform: '/api/placeholder/200/60'
    },
    {
      id: 5,
      name: 'Ambient_Pad_Warm.wav',
      artist: 'Atmosphere',
      duration: '0:12',
      bpm: 120,
      key: 'Dm',
      genre: 'Ambient',
      tags: ['pad', 'ambient', 'warm'],
      waveform: '/api/placeholder/200/60'
    },
    {
      id: 6,
      name: 'Vocal_Chop_Female.wav',
      artist: 'Voice Lab',
      duration: '0:02',
      bpm: 130,
      key: 'G',
      genre: 'Pop',
      tags: ['vocal', 'chop', 'female'],
      waveform: '/api/placeholder/200/60'
    }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Library</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search library..."
              className="pl-10 w-64 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            />
          </div>
          <Button variant="outline" className="border-gray-700 text-gray-400">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <div className="flex border border-gray-700 rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Select>
          <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all">All Genres</SelectItem>
            <SelectItem value="trap">Trap</SelectItem>
            <SelectItem value="future-bass">Future Bass</SelectItem>
            <SelectItem value="lo-fi">Lo-Fi</SelectItem>
            <SelectItem value="dubstep">Dubstep</SelectItem>
            <SelectItem value="ambient">Ambient</SelectItem>
          </SelectContent>
        </Select>
        
        <Select>
          <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="BPM" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all">All BPM</SelectItem>
            <SelectItem value="slow">60-100</SelectItem>
            <SelectItem value="medium">100-140</SelectItem>
            <SelectItem value="fast">140+</SelectItem>
          </SelectContent>
        </Select>
        
        <Select>
          <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Key" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all">All Keys</SelectItem>
            <SelectItem value="c">C</SelectItem>
            <SelectItem value="dm">Dm</SelectItem>
            <SelectItem value="am">Am</SelectItem>
            <SelectItem value="g">G</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sample Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {samples.map((sample) => (
            <Card key={sample.id} className="bg-gray-900 border-gray-800 overflow-hidden group hover:border-purple-500 transition-colors">
              <CardContent className="p-4">
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      size="icon"
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                    >
                      <Play className="w-6 h-6 text-white" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded opacity-60" />
                  </div>
                </div>
                
                <h3 className="font-semibold text-white mb-1 truncate">{sample.name}</h3>
                <p className="text-sm text-gray-400 mb-2">{sample.artist}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{sample.duration}</span>
                  <span>{sample.bpm} BPM</span>
                  <span>{sample.key}</span>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {sample.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-gray-800 text-xs text-gray-400 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <div className="flex space-x-2">
                    <Button size="icon" variant="ghost" className="text-gray-400 hover:text-red-500">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-0">
            <div className="divide-y divide-gray-800">
              {samples.map((sample) => (
                <div key={sample.id} className="flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center space-x-4 flex-1">
                    <Button size="icon" variant="ghost" className="text-purple-500 hover:text-purple-400">
                      <Play className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                      <p className="font-medium text-white">{sample.name}</p>
                      <p className="text-sm text-gray-400">{sample.artist} • {sample.genre}</p>
                    </div>
                    <div className="text-sm text-gray-400 w-20">{sample.duration}</div>
                    <div className="text-sm text-gray-400 w-16">{sample.bpm} BPM</div>
                    <div className="text-sm text-gray-400 w-12">{sample.key}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="icon" variant="ghost" className="text-gray-400 hover:text-red-500">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-gray-400 hover:text-green-500">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Library

