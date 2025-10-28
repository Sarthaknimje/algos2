import React from 'react'
import { motion } from 'framer-motion'
import { VideoTokenInfo } from '../services/algorandService'
import ConfettiAnimation from './ConfettiAnimation'

interface TokenSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  tokenInfo: VideoTokenInfo | null
}

export const TokenSuccessModal: React.FC<TokenSuccessModalProps> = ({
  isOpen,
  onClose,
  tokenInfo
}) => {
  if (!isOpen || !tokenInfo) return null

  return (
    <>
      <ConfettiAnimation isActive={isOpen} />
      
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-3xl p-8 max-w-md w-full relative overflow-hidden"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-yellow-400 rounded-full translate-x-12 translate-y-12"></div>
            <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-pink-400 rounded-full -translate-x-8 -translate-y-8"></div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Success Icon */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h2
            className="text-3xl font-bold text-center text-white mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            🎉 Token Created!
          </motion.h2>

          <motion.p
            className="text-center text-white/80 mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Your video token has been successfully minted on Algorand
          </motion.p>

          {/* Token Details */}
          <motion.div
            className="space-y-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {/* Video Title */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-sm text-white/60 mb-1">Video Title</div>
              <div className="text-white font-medium truncate">{tokenInfo.videoTitle}</div>
            </div>

            {/* ASA ID */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-sm text-white/60 mb-1">ASA ID</div>
              <div className="text-white font-mono text-lg">{tokenInfo.assetId}</div>
            </div>

            {/* Creator Address */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-sm text-white/60 mb-1">Creator Address</div>
              <div className="text-white font-mono text-sm break-all">{tokenInfo.creator}</div>
            </div>

            {/* Transaction ID */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-sm text-white/60 mb-1">Transaction ID</div>
              <div className="text-white font-mono text-sm break-all">{tokenInfo.transactionId}</div>
            </div>

            {/* Asset Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-sm text-white/60 mb-1">Asset Name</div>
                <div className="text-white font-medium">{tokenInfo.assetName}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-sm text-white/60 mb-1">Unit Name</div>
                <div className="text-white font-medium">{tokenInfo.unitName}</div>
              </div>
            </div>

            {/* Token Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-sm text-white/60 mb-1">Total Supply</div>
                <div className="text-white font-bold text-xl">{tokenInfo.totalSupply.toLocaleString()}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-sm text-white/60 mb-1">Current Price</div>
                <div className="text-white font-bold text-xl">${tokenInfo.currentPrice}</div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex gap-3 mt-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={() => window.open(`https://testnet.algoexplorer.io/asset/${tokenInfo.assetId}`, '_blank')}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              View on Explorer
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-white/20 text-white py-3 px-6 rounded-xl font-medium hover:bg-white/30 transition-all duration-200"
            >
              Close
            </button>
          </motion.div>

          {/* Success Message */}
          <motion.div
            className="text-center mt-6 text-green-400 text-sm"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            ✨ Your token is now live on the Algorand blockchain!
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  )
}

export default TokenSuccessModal
