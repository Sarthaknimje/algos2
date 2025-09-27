import React, { useState, useEffect } from 'react'

interface Player {
  address: string
  name: string
  balance: number
  returns: number
  totalValue: number
  trades: number
  rank: number
}

const Leaderboard: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading leaderboard data
    const mockPlayers: Player[] = [
      {
        address: 'ALGO...1234',
        name: 'CryptoKing',
        balance: 1500000,
        returns: 2500000,
        totalValue: 4000000,
        trades: 15,
        rank: 1
      },
      {
        address: 'ALGO...5678',
        name: 'TradingMaster',
        balance: 1200000,
        returns: 1800000,
        totalValue: 3000000,
        trades: 12,
        rank: 2
      },
      {
        address: 'ALGO...9012',
        name: 'AlgoTrader',
        balance: 1000000,
        returns: 1200000,
        totalValue: 2200000,
        trades: 8,
        rank: 3
      },
      {
        address: 'ALGO...3456',
        name: 'DeFiPro',
        balance: 800000,
        returns: 900000,
        totalValue: 1700000,
        trades: 6,
        rank: 4
      },
      {
        address: 'ALGO...7890',
        name: 'BlockchainBull',
        balance: 600000,
        returns: 700000,
        totalValue: 1300000,
        trades: 4,
        rank: 5
      }
    ]

    setTimeout(() => {
      setPlayers(mockPlayers)
      setLoading(false)
    }, 1000)
  }, [])

  const formatAlgo = (microAlgos: number) => {
    return (microAlgos / 1000000).toFixed(2)
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  if (loading) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white">Loading leaderboard...</p>
      </div>
    )
  }

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8">
      <h3 className="text-2xl font-bold text-white mb-6 text-center">🏆 Leaderboard</h3>
      
      <div className="space-y-4">
        {players.map((player) => (
          <div
            key={player.address}
            className={`bg-white bg-opacity-20 rounded-xl p-4 flex items-center justify-between ${
              player.rank <= 3 ? 'border-2 border-yellow-400' : ''
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold">
                {getRankIcon(player.rank)}
              </div>
              <div>
                <h4 className="text-white font-semibold">{player.name}</h4>
                <p className="text-gray-300 text-sm">{player.address}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-white font-bold">
                {formatAlgo(player.totalValue)} ALGO
              </div>
              <div className="text-gray-300 text-sm">
                +{formatAlgo(player.returns)} returns
              </div>
              <div className="text-gray-400 text-xs">
                {player.trades} trades
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-300 text-sm">
          Competition ends in 2 hours 15 minutes
        </p>
        <p className="text-yellow-400 font-semibold">
          Winner gets 2x rewards! 🎉
        </p>
      </div>
    </div>
  )
}

export default Leaderboard
