import React from 'react'

interface Trade {
  id: string
  asset: string
  type: 'BUY' | 'SELL'
  amount: number
  timestamp: number
  return: number
  profit: number
}

interface TradeHistoryProps {
  trades: Trade[]
}

const TradeHistory: React.FC<TradeHistoryProps> = ({ trades }) => {
  const formatAlgo = (microAlgos: number) => {
    return (microAlgos / 1000000).toFixed(2)
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  const getAssetIcon = (asset: string) => {
    const icons: { [key: string]: string } = {
      'BTC': '₿',
      'ETH': 'Ξ',
      'ALGO': '🔷',
      'USDC': '💵',
      'USDT': '💵',
      'SOL': '☀️',
      'ADA': '🔵',
      'DOT': '🔴',
      'MATIC': '🟣',
      'AVAX': '🔺',
      'LINK': '🔗'
    }
    return icons[asset] || '💰'
  }

  if (trades.length === 0) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 text-center">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-xl font-bold text-white mb-2">No Trades Yet</h3>
        <p className="text-gray-300">Start trading to see your history here</p>
      </div>
    )
  }

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">📈 Trade History</h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className="bg-white bg-opacity-20 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{getAssetIcon(trade.asset)}</div>
              <div>
                <div className="text-white font-semibold">
                  {trade.type} {trade.asset}
                </div>
                <div className="text-gray-300 text-sm">
                  {formatTime(trade.timestamp)}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-white font-semibold">
                {formatAlgo(trade.amount)} ALGO
              </div>
              <div className={`text-sm font-medium ${
                trade.profit > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {trade.profit > 0 ? '+' : ''}{formatAlgo(trade.profit)}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-white border-opacity-20">
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">Total Trades:</span>
          <span className="text-white font-semibold">{trades.length}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">Total Profit:</span>
          <span className={`font-semibold ${
            trades.reduce((sum, trade) => sum + trade.profit, 0) > 0 
              ? 'text-green-400' 
              : 'text-red-400'
          }`}>
            {formatAlgo(trades.reduce((sum, trade) => sum + trade.profit, 0))} ALGO
          </span>
        </div>
      </div>
    </div>
  )
}

export default TradeHistory
