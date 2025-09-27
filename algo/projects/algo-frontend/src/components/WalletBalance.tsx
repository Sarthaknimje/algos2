import React, { useState, useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'

interface BalanceInfo {
  algo: number
  usdc: number
  usdt: number
  btc: number
  eth: number
}

const WalletBalance: React.FC = () => {
  const { activeAddress } = useWallet()
  const [balance, setBalance] = useState<BalanceInfo>({
    algo: 0,
    usdc: 0,
    usdt: 0,
    btc: 0,
    eth: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (activeAddress) {
      // Simulate fetching wallet balance
      setTimeout(() => {
        setBalance({
          algo: 125.50,
          usdc: 250.00,
          usdt: 100.00,
          btc: 0.025,
          eth: 0.5
        })
        setLoading(false)
      }, 1000)
    } else {
      setLoading(false)
    }
  }, [activeAddress])

  const formatBalance = (amount: number, decimals: number = 2) => {
    return amount.toFixed(decimals)
  }

  if (!activeAddress) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 text-center">
        <div className="text-4xl mb-4">💼</div>
        <h3 className="text-xl font-bold text-white mb-2">Connect Wallet</h3>
        <p className="text-gray-300">Connect your wallet to view balance</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white">Loading balance...</p>
      </div>
    )
  }

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">💰 Wallet Balance</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center bg-white bg-opacity-20 rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🔷</div>
            <span className="text-white font-semibold">ALGO</span>
          </div>
          <span className="text-white font-bold">{formatBalance(balance.algo)}</span>
        </div>
        
        <div className="flex justify-between items-center bg-white bg-opacity-20 rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">💵</div>
            <span className="text-white font-semibold">USDC</span>
          </div>
          <span className="text-white font-bold">{formatBalance(balance.usdc)}</span>
        </div>
        
        <div className="flex justify-between items-center bg-white bg-opacity-20 rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">💵</div>
            <span className="text-white font-semibold">USDT</span>
          </div>
          <span className="text-white font-bold">{formatBalance(balance.usdt)}</span>
        </div>
        
        <div className="flex justify-between items-center bg-white bg-opacity-20 rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">₿</div>
            <span className="text-white font-semibold">BTC</span>
          </div>
          <span className="text-white font-bold">{formatBalance(balance.btc, 6)}</span>
        </div>
        
        <div className="flex justify-between items-center bg-white bg-opacity-20 rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">Ξ</div>
            <span className="text-white font-semibold">ETH</span>
          </div>
          <span className="text-white font-bold">{formatBalance(balance.eth, 4)}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-white border-opacity-20">
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">Total Value (USD):</span>
          <span className="text-white font-semibold">$1,250.75</span>
        </div>
      </div>
    </div>
  )
}

export default WalletBalance
