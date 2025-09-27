import { useState, useEffect } from 'react'

interface CompetitionState {
  isActive: boolean
  startTime: number
  endTime: number
  entryFee: number
  totalPlayers: number
  totalPool: number
}

interface TradeHistory {
  id: string
  asset: string
  type: 'BUY' | 'SELL'
  amount: number
  timestamp: number
  return: number
}

export const useCompetition = () => {
  const [competition, setCompetition] = useState<CompetitionState>({
    isActive: false,
    startTime: 0,
    endTime: 0,
    entryFee: 1000000, // 1 ALGO in microALGOs
    totalPlayers: 0,
    totalPool: 0
  })

  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching competition data
    const fetchCompetitionData = async () => {
      setLoading(true)
      
      // Mock API call
      setTimeout(() => {
        setCompetition({
          isActive: true,
          startTime: Date.now() - 1800000, // Started 30 minutes ago
          endTime: Date.now() + 3600000,   // Ends in 1 hour
          entryFee: 1000000,
          totalPlayers: 25,
          totalPool: 25000000 // 25 ALGOs
        })
        
        setTradeHistory([
          {
            id: '1',
            asset: 'BTC',
            type: 'BUY',
            amount: 1000000,
            timestamp: Date.now() - 300000,
            return: 1080000
          },
          {
            id: '2',
            asset: 'ETH',
            type: 'SELL',
            amount: 500000,
            timestamp: Date.now() - 600000,
            return: 515000
          }
        ])
        
        setLoading(false)
      }, 1000)
    }

    fetchCompetitionData()
  }, [])

  const joinCompetition = async (entryFee: number) => {
    try {
      // Simulate joining competition
      setCompetition(prev => ({
        ...prev,
        totalPlayers: prev.totalPlayers + 1,
        totalPool: prev.totalPool + entryFee
      }))
      
      return { success: true, message: 'Successfully joined competition!' }
    } catch (error) {
      return { success: false, message: 'Failed to join competition' }
    }
  }

  const executeTrade = async (asset: string, amount: number, type: 'BUY' | 'SELL') => {
    try {
      // Simulate trade execution
      const newTrade: TradeHistory = {
        id: Date.now().toString(),
        asset,
        type,
        amount,
        timestamp: Date.now(),
        return: amount * (type === 'BUY' ? 1.05 : 1.03) // Simulate returns
      }
      
      setTradeHistory(prev => [newTrade, ...prev])
      
      return { success: true, trade: newTrade }
    } catch (error) {
      return { success: false, message: 'Trade execution failed' }
    }
  }

  const getTimeRemaining = () => {
    const now = Date.now()
    const remaining = competition.endTime - now
    
    if (remaining <= 0) {
      return '00:00:00'
    }
    
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000)
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const getPlayerStats = () => {
    const totalTrades = tradeHistory.length
    const totalInvested = tradeHistory.reduce((sum, trade) => sum + trade.amount, 0)
    const totalReturns = tradeHistory.reduce((sum, trade) => sum + trade.return, 0)
    const netProfit = totalReturns - totalInvested
    
    return {
      totalTrades,
      totalInvested,
      totalReturns,
      netProfit,
      winRate: totalTrades > 0 ? (tradeHistory.filter(t => t.return > t.amount).length / totalTrades) * 100 : 0
    }
  }

  return {
    competition,
    tradeHistory,
    loading,
    joinCompetition,
    executeTrade,
    getTimeRemaining,
    getPlayerStats
  }
}
