import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Copy, ExternalLink, Star, Sparkles, Trophy } from 'lucide-react'
import confetti from 'canvas-confetti'
import { VideoTokenInfo } from '../services/smartContractService'

interface MintingSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  tokenInfo: VideoTokenInfo | null
  videoTitle: string
}

const MintingSuccessModal: React.FC<MintingSuccessModalProps> = ({
  isOpen,
  onClose,
  tokenInfo,
  videoTitle
}) => {
  // Trigger confetti animation when modal opens
  useEffect(() => {
    if (isOpen && tokenInfo) {
      // Create a burst of confetti
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        
        // Launch confetti from the left edge
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
        
        // Launch confetti from the right edge
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
      }, 250)

      // Cleanup interval on unmount
      return () => clearInterval(interval)
    }
  }, [isOpen, tokenInfo])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const openInExplorer = (assetId: number) => {
    // Try AlgoExplorer first, fallback to Pera Explorer
    const algoExplorerUrl = `https://testnet.algoexplorer.io/asset/${assetId}`
    const peraExplorerUrl = `https://testnet.explorer.perawallet.app/asset/${assetId}`
    
    // Open AlgoExplorer
    window.open(algoExplorerUrl, '_blank')
    
    // Also show the Pera Explorer URL in console for reference
    console.log('Asset URLs:', {
      algoExplorer: algoExplorerUrl,
      peraExplorer: peraExplorerUrl
    })
  }

  if (!isOpen || !tokenInfo) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Success Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2"
            >
              🎉 Token Minted Successfully!
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-300 text-lg"
            >
              Your video is now a tradeable Algorand Standard Asset
            </motion.p>
          </div>

          {/* Video Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 rounded-xl p-6 mb-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
              Video Details
            </h3>
            <p className="text-gray-300 line-clamp-2 mb-4">{videoTitle}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>📹 YouTube Video</span>
              <span>•</span>
              <span>🎬 Tokenized Content</span>
            </div>
          </motion.div>

          {/* Token Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4 mb-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
              Token Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Asset ID</div>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-mono text-lg">{tokenInfo.assetId}</span>
                  <button
                    onClick={() => copyToClipboard(tokenInfo.assetId.toString())}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Total Supply</div>
                <div className="text-white font-semibold text-lg">
                  {tokenInfo.totalSupply.toLocaleString()} tokens
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Current Price</div>
                <div className="text-white font-semibold text-lg">
                  {tokenInfo.currentPrice} microAlgos
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Creator</div>
                <div className="text-white font-mono text-sm truncate">
                  {tokenInfo.creator}
                </div>
              </div>
            </div>
            
            {/* Asset Explorer Links */}
            <div className="bg-white/5 rounded-lg p-4 mt-4">
              <div className="text-sm text-gray-400 mb-2">Explorer Links</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">AlgoExplorer:</span>
                  <button
                    onClick={() => window.open(`https://testnet.algoexplorer.io/asset/${tokenInfo.assetId}`, '_blank')}
                    className="text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    View Asset
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">Pera Explorer:</span>
                  <button
                    onClick={() => window.open(`https://testnet.explorer.perawallet.app/asset/${tokenInfo.assetId}`, '_blank')}
                    className="text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    View Asset
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={() => openInExplorer(tokenInfo.assetId)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <ExternalLink className="w-5 h-5" />
              <span>View on AlgoExplorer</span>
            </button>
            
            <button
              onClick={() => copyToClipboard(tokenInfo.assetId.toString())}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Copy className="w-5 h-5" />
              <span>Copy Asset ID</span>
            </button>
          </motion.div>

          {/* Close Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            onClick={onClose}
            className="w-full mt-6 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
          >
            Continue
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default MintingSuccessModal
