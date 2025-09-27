import React, { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'

interface TradingInterfaceProps {
  onTrade: (asset: string, amount: number, type: 'BUY' | 'SELL') => void
}

const TradingInterface: React.FC<TradingInterfaceProps> = ({ onTrade }) => {
  const [selectedAsset, setSelectedAsset] = useState('ALGO')
  const [tradeAmount, setTradeAmount] = useState('')
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY')
  const { activeAddress } = useWallet()

  const cryptoAssets = [
    { symbol: 'BTC', name: 'Bitcoin', price: '$43,250' },
    { symbol: 'ETH', name: 'Ethereum', price: '$2,650' },
    { symbol: 'ALGO', name: 'Algorand', price: '$0.18' },
    { symbol: 'USDC', name: 'USD Coin', price: '$1.00' },
    { symbol: 'USDT', name: 'Tether', price: '$1.00' },
    { symbol: 'SOL', name: 'Solana', price: '$98.50' },
    { symbol: 'ADA', name: 'Cardano', price: '$0.45' },
    { symbol: 'DOT', name: 'Polkadot', price: '$6.80' },
    { symbol: 'MATIC', name: 'Polygon', price: '$0.85' },
    { symbol: 'AVAX', name: 'Avalanche', price: '$35.20' },
    { symbol: 'LINK', name: 'Chainlink', price: '$14.30' }
  ]

  const handleTrade = () => {
    if (!activeAddress) {
      alert('Please connect your wallet first')
      return
    }

    if (!tradeAmount || parseFloat(tradeAmount) <= 0) {
      alert('Please enter a valid trade amount')
      return
    }

    onTrade(selectedAsset, parseFloat(tradeAmount), tradeType)
    setTradeAmount('')
  }

  if (!activeAddress) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 text-center">
        <h3 className="text-xl font-bold text-white mb-4">Connect Wallet to Trade</h3>
        <p className="text-gray-300">Please connect your Algorand wallet to start trading</p>
      </div>
    )
  }

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8">
      <h3 className="text-2xl font-bold text-white mb-6 text-center">Trading Interface</h3>
      
      <div className="space-y-6">
        {/* Asset Selection */}
        <div>
          <label className="block text-white font-semibold mb-2">Select Asset</label>
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white border border-white border-opacity-30"
          >
            {cryptoAssets.map((asset) => (
              <option key={asset.symbol} value={asset.symbol} className="bg-gray-800">
                {asset.symbol} - {asset.name} ({asset.price})
              </option>
            ))}
          </select>
        </div>

        {/* Trade Type */}
        <div>
          <label className="block text-white font-semibold mb-2">Trade Type</label>
          <div className="flex space-x-4">
            <button
              onClick={() => setTradeType('BUY')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                tradeType === 'BUY'
                  ? 'bg-green-500 text-white'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              BUY
            </button>
            <button
              onClick={() => setTradeType('SELL')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                tradeType === 'SELL'
                  ? 'bg-red-500 text-white'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              SELL
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-white font-semibold mb-2">Amount (ALGO)</label>
          <input
            type="number"
            value={tradeAmount}
            onChange={(e) => setTradeAmount(e.target.value)}
            placeholder="Enter amount to trade"
            className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white border border-white border-opacity-30 placeholder-gray-300"
          />
        </div>

        {/* Trade Button */}
        <button
          onClick={handleTrade}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-4 rounded-lg font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"
        >
          Execute {tradeType} Trade
        </button>
      </div>
    </div>
  )
}

export default TradingInterface
