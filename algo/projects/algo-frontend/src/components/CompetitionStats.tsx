import React, { useState, useEffect } from 'react'

interface CompetitionData {
  totalPlayers: number
  totalPool: number
  timeRemaining: string
  activeTrades: number
  topPerformer: string
}

const CompetitionStats: React.FC = () => {
  const [stats, setStats] = useState<CompetitionData>({
    totalPlayers: 0,
    totalPool: 0,
    timeRemaining: '00:00:00',
    activeTrades: 0,
    topPerformer: ''
  })

  useEffect(() => {
    // Simulate real-time stats updates
    const interval = setInterval(() => {
      setStats({
        totalPlayers: Math.floor(Math.random() * 50) + 20,
        totalPool: Math.floor(Math.random() * 100) + 50,
        timeRemaining: '02:15:30',
        activeTrades: Math.floor(Math.random() * 200) + 50,
        topPerformer: 'CryptoKing'
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4 text-center">📊 Competition Stats</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.totalPlayers}</div>
          <div className="text-gray-300 text-sm">Active Players</div>
        </div>
        
        <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{stats.totalPool} ALGO</div>
          <div className="text-gray-300 text-sm">Total Pool</div>
        </div>
        
        <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.timeRemaining}</div>
          <div className="text-gray-300 text-sm">Time Remaining</div>
        </div>
        
        <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{stats.activeTrades}</div>
          <div className="text-gray-300 text-sm">Active Trades</div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <div className="text-white font-semibold">🏆 Top Performer: {stats.topPerformer}</div>
      </div>
    </div>
  )
}

export default CompetitionStats
