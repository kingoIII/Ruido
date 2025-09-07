import React, { useEffect, useState } from 'react'
import { Play, Download, Heart, MoreHorizontal, TrendingUp, Clock, Music } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import apiService from '@/services/api'
import { AudioPack, AudioSample } from '@/types'
import { useAudioPlayerContext } from '@/contexts/AudioPlayerContext'

const Dashboard: React.FC = () => {
  const [featuredPacks, setFeaturedPacks] = useState<AudioPack[]>([])
  const [recentSamples, setRecentSamples] = useState<AudioSample[]>([])
  const [stats, setStats] = useState({ totalSamples: 0, totalDownloads: 0, totalFavorites: 0 })
  const { play } = useAudioPlayerContext()

  useEffect(() => {
    const loadData = async () => {
      try {
        const packsRes = await apiService.getPacks({}, 1, 3)
        setFeaturedPacks(packsRes.data)

        const samplesRes = await apiService.getSamples({}, 1, 4)
        setRecentSamples(samplesRes.data)

        const analytics = await apiService.getAnalytics()
        if (analytics.success) {
          setStats({
            totalSamples: analytics.data.totalSamples,
            totalDownloads: analytics.data.totalDownloads,
            totalFavorites: analytics.data.totalFavorites,
          })
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err)
      }
    }
    loadData()
  }, [])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="p-6 space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Samples</CardTitle>
            <Music className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalSamples}</div>
            <p className="text-xs text-gray-500">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Downloads</CardTitle>
            <Download className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalDownloads}</div>
            <p className="text-xs text-gray-500">+8% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Favorites</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalFavorites}</div>
            <p className="text-xs text-gray-500">+23% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Featured Packs */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Featured Packs</h2>
          <Button variant="outline" className="border-gray-700 text-gray-400 hover:text-white">
            View All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPacks.map((pack) => (
            <Card key={pack.id} className="bg-gray-900 border-gray-800 overflow-hidden group hover:border-purple-500 transition-colors">
              <div className="aspect-video bg-gradient-to-br from-purple-600 to-pink-600 relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <Button
                  size="icon"
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                >
                  <Play className="w-6 h-6 text-white" />
                </Button>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-white mb-1">{pack.title}</h3>
                <p className="text-sm text-gray-400 mb-2">{pack.artist}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{pack.samples?.length || 0} samples</span>
                  <span>{pack.genre} • {pack.bpm} BPM</span>
                </div>
                <div className="flex items-center justify-between mt-3">
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
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-0">
            <div className="divide-y divide-gray-800">
              {recentSamples.map((sample) => (
                <div key={sample.id} className="flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <Button size="icon" variant="ghost" className="text-purple-500 hover:text-purple-400" onClick={() => play(sample)}>
                      <Play className="w-4 h-4" />
                    </Button>
                    <div>
                      <p className="font-medium text-white">{sample.filename}</p>
                      <p className="text-sm text-gray-400">{formatDuration(sample.duration)} • {sample.bpm} BPM • {sample.key}</p>
                    </div>
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
      </div>
    </div>
  )
}

export default Dashboard

