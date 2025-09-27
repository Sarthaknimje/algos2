// src/components/Home.tsx
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import Transact from './components/Transact'
import AppCalls from './components/AppCalls'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [openDemoModal, setOpenDemoModal] = useState<boolean>(false)
  const [appCallsDemoModal, setAppCallsDemoModal] = useState<boolean>(false)
  const { activeAddress } = useWallet()

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  const toggleDemoModal = () => {
    setOpenDemoModal(!openDemoModal)
  }

  const toggleAppCallsModal = () => {
    setAppCallsDemoModal(!appCallsDemoModal)
  }

  const cryptoList = [
    'BTC', 'ETH', 'ALGO', 'USDC', 'USDT', 'SOL', 'ADA', 'DOT', 'MATIC', 'AVAX', 'LINK'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">⚽</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Algo Premier League</h1>
          </div>
          <button 
            onClick={toggleWalletModal}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg"
          >
            {activeAddress ? 'Connected' : 'Connect Wallet'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
              The Ultimate
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"> Crypto Trading</span>
              <br />Competition
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Compete with other traders in the most exciting crypto trading league on Algorand. 
              Trade 11 cryptocurrencies, maximize your returns, and win 2x rewards!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button 
                onClick={toggleWalletModal}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-full font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-xl transform hover:scale-105"
              >
                🚀 Start Trading Now
              </button>
              <button 
                onClick={toggleAppCallsModal}
                className="bg-white bg-opacity-20 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-opacity-30 transition-all duration-300 backdrop-blur-sm"
              >
                📊 View Leaderboard
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-opacity-20 transition-all duration-300">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-3">Lightning Fast</h3>
              <p className="text-gray-300">Trade on Algorand's high-speed blockchain with instant settlements</p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-opacity-20 transition-all duration-300">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-white mb-3">2x Rewards</h3>
              <p className="text-gray-300">Winner takes all with double the returns on successful trades</p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-opacity-20 transition-all duration-300">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-white mb-3">Secure & Fair</h3>
              <p className="text-gray-300">Smart contracts ensure transparent and tamper-proof competition</p>
            </div>
          </div>

          {/* Crypto Assets */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Trade 11 Premium Cryptocurrencies</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {cryptoList.map((crypto, index) => (
                <div key={index} className="bg-white bg-opacity-20 rounded-xl p-4 text-center hover:bg-opacity-30 transition-all duration-300">
                  <div className="text-2xl mb-2">💰</div>
                  <div className="text-white font-bold">{crypto}</div>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8">
                <div className="text-4xl mb-4">1️⃣</div>
                <h3 className="text-xl font-bold text-white mb-3">Connect Wallet</h3>
                <p className="text-gray-300">Connect your Algorand wallet to participate in the competition</p>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8">
                <div className="text-4xl mb-4">2️⃣</div>
                <h3 className="text-xl font-bold text-white mb-3">Start Trading</h3>
                <p className="text-gray-300">Trade any of the 11 cryptocurrencies and maximize your returns</p>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8">
                <div className="text-4xl mb-4">3️⃣</div>
                <h3 className="text-xl font-bold text-white mb-3">Win Rewards</h3>
                <p className="text-gray-300">Highest returns win 2x rewards at the end of the competition</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-black bg-opacity-30 backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            Built by <span className="text-white font-semibold">Sarthak Nimje</span> on Algorand Testnet
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Powered by AlgoKit • Secure • Transparent • Decentralized
          </p>
        </div>
      </footer>

      {/* Modals */}
      <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      <Transact openModal={openDemoModal} setModalState={setOpenDemoModal} />
      <AppCalls openModal={appCallsDemoModal} setModalState={setAppCallsDemoModal} />
    </div>
  )
}

export default Home
