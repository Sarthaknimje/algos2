import React from 'react'
import { motion } from 'framer-motion'
import { Loader, Sparkles, Zap } from 'lucide-react'

interface MintingLoaderProps {
  isVisible: boolean
  message?: string
}

const MintingLoader: React.FC<MintingLoaderProps> = ({ 
  isVisible, 
  message = "Minting your video token..." 
}) => {
  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full text-center"
      >
        {/* Animated Icon */}
        <div className="relative mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto"
          >
            <Loader className="w-10 h-10 text-white" />
          </motion.div>
          
          {/* Floating sparkles */}
          <motion.div
            animate={{ 
              y: [-10, 10, -10],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </motion.div>
          
          <motion.div
            animate={{ 
              y: [10, -10, 10],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute -bottom-2 -left-2"
          >
            <Zap className="w-5 h-5 text-blue-400" />
          </motion.div>
        </div>

        {/* Loading Message */}
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white mb-4"
        >
          Creating Your Token
        </motion.h3>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-300 mb-6"
        >
          {message}
        </motion.p>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <div className="flex items-center space-x-3 text-sm">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
            <span className="text-gray-300">Connecting to Algorand network</span>
          </div>
          
          <div className="flex items-center space-x-3 text-sm">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
              className="w-2 h-2 bg-blue-500 rounded-full"
            />
            <span className="text-gray-300">Creating asset transaction</span>
          </div>
          
          <div className="flex items-center space-x-3 text-sm">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 1 }}
              className="w-2 h-2 bg-purple-500 rounded-full"
            />
            <span className="text-gray-300">Minting tokens to creator</span>
          </div>
        </motion.div>

        {/* Animated Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default MintingLoader
