import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  Users, 
  Eye, 
  ThumbsUp, 
  Clock,
  ExternalLink,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Loader,
  Sparkles,
  Zap
} from 'lucide-react'
import { usePeraWallet } from '../hooks/usePeraWallet'
import { PeraWalletConnect } from '@perawallet/connect'
import { useYouTubeData } from '../hooks/useYouTubeData'
import { YouTubeIcon, TokenIcon } from '../assets/icons'
import { YouTubeVideo } from '../services/youtubeApi'
import { VideoTokenInfo } from '../services/mnemonicAsaService'
import TokenSuccessModal from '../components/TokenSuccessModal'
import MintingLoader from '../components/MintingLoader'

const VideoTokenization: React.FC = () => {
  const { isConnected, address, connectWallet, isLoading: walletLoading } = usePeraWallet()
  
  // Create peraWallet instance for direct access
  const peraWallet = new PeraWalletConnect({
    chainId: 416002, // Algorand Testnet
    shouldShowSignTxnToast: true
  })
  const { 
    channel, 
    videos, 
    isLoading, 
    error, 
    isAuthenticated,
    authenticateWithYouTube,
    disconnectChannel,
    searchVideos, 
    createVideoToken,
    clearError 
  } = useYouTubeData()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null)
  const [isCreatingToken, setIsCreatingToken] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdTokenInfo, setCreatedTokenInfo] = useState<VideoTokenInfo | null>(null)
  const [mintingMessage, setMintingMessage] = useState('')
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatDuration = (duration: string) => {
    // Parse ISO 8601 duration (PT4M13S)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return duration

    const hours = parseInt(match[1] || '0')
    const minutes = parseInt(match[2] || '0')
    const seconds = parseInt(match[3] || '0')

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
  }

  const getValidWalletAddress = async (): Promise<string | null> => {
    // First try to get address from wallet state
    if (address && typeof address === 'string' && address.length === 58) {
      const base32Regex = /^[A-Z2-7]+$/
      if (base32Regex.test(address)) {
        console.log('Using address from wallet state:', address)
        return address
      }
    }

    // If not available, try to reconnect
    console.log('Address not available in state, trying to reconnect...')
    try {
      const accounts = await peraWallet.reconnectSession()
      if (accounts && accounts.length > 0) {
        const reconnectedAddress = accounts[0]
        console.log('Got address from reconnect:', reconnectedAddress)
        
        // Validate reconnected address
        if (reconnectedAddress && typeof reconnectedAddress === 'string' && reconnectedAddress.length === 58) {
          const base32Regex = /^[A-Z2-7]+$/
          if (base32Regex.test(reconnectedAddress)) {
            return reconnectedAddress
          }
        }
      }
    } catch (error) {
      console.error('Failed to reconnect wallet:', error)
    }

    return null
  }

  const handleYouTubeAuth = async () => {
    try {
      await authenticateWithYouTube()
    } catch (error) {
      console.error('Failed to authenticate with YouTube:', error)
    }
  }

  const handleVideoSearch = async () => {
    if (!searchQuery.trim()) return
    
    try {
      await searchVideos(searchQuery.trim())
    } catch (error) {
      console.error('Failed to search videos:', error)
    }
  }

  const handleCreateToken = async (video: YouTubeVideo) => {
    console.log('Creating token for video:', video.title)
    console.log('Wallet state:', { isConnected, address, walletLoading })
    
    if (!isConnected) {
      console.error('Wallet not connected')
      alert('Please connect your wallet first')
      return
    }
    
    // Get valid wallet address using helper function
    const currentAddress = await getValidWalletAddress()
    
    if (!currentAddress) {
      console.error('Could not get valid wallet address')
      alert('Could not get valid wallet address. Please reconnect your wallet.')
      return
    }
    
    console.log('Using validated address:', currentAddress)
    
    setIsCreatingToken(true)
    setMintingMessage('Connecting to Algorand network...')
    
    try {
      // Update message during different stages
      setMintingMessage('Creating asset transaction...')
      
      console.log('Calling createVideoToken with address:', currentAddress)
      const result = await createVideoToken(video, currentAddress, 1000000, peraWallet)
      console.log('Token created successfully:', result)
      
      // Update message for final stage
      setMintingMessage('Minting tokens to creator...')
      
      // Wait a moment for the final message to show
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Set the created token info and show success modal
      setCreatedTokenInfo(result as VideoTokenInfo)
      setShowSuccessModal(true)
      
    } catch (error) {
      console.error('Failed to create token:', error)
      alert(`Failed to create token: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsCreatingToken(false)
      setMintingMessage('')
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <TokenIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Connect your Pera wallet to start tokenizing your YouTube videos.
          </p>
          <button 
            onClick={connectWallet}
            disabled={walletLoading}
            className="btn-primary flex items-center space-x-2 mx-auto disabled:opacity-50"
          >
            <TokenIcon className="w-5 h-5" />
            <span>{walletLoading ? 'Connecting...' : 'Connect Wallet'}</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Tokenize Your <span className="gradient-text">YouTube Videos</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Convert your YouTube videos into tradeable Algorand Standard Assets and earn from trading fees.
            </p>
          </motion.div>
        </div>

        {/* YouTube Authentication */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card mb-8"
          >
            <div className="text-center">
              <YouTubeIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">Connect Your YouTube Channel</h3>
              <p className="text-gray-400 mb-6">
                Authenticate with YouTube to access your own videos and create tokens
              </p>
              
              <button
                onClick={handleYouTubeAuth}
                disabled={isLoading}
                className="btn-primary disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <YouTubeIcon className="w-5 h-5 mr-2" />
                )}
                {isLoading ? 'Connecting...' : 'Connect with YouTube'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Channel Info */}
        {isAuthenticated && channel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <img
                  src={channel.thumbnail}
                  alt={channel.title}
                  className="w-20 h-20 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">{channel.title}</h3>
                  <p className="text-gray-400 mb-4">{channel.description.substring(0, 200)}...</p>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{formatNumber(channel.subscriberCount)} subscribers</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Play className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{formatNumber(channel.videoCount)} videos</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{formatNumber(channel.viewCount)} views</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={disconnectChannel}
                className="btn-secondary text-sm"
              >
                Disconnect
              </button>
            </div>
          </motion.div>
        )}

        {/* Search Videos */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card mb-8"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your videos to tokenize..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleVideoSearch()}
                />
              </div>
              <button
                onClick={handleVideoSearch}
                disabled={isLoading || !searchQuery.trim()}
                className="btn-primary disabled:opacity-50"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Videos Grid */}
        {videos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {videos.map((video) => (
              <div key={video.id} className="card group hover:scale-105 transition-transform">
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover rounded-xl mb-4"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(video.duration)}
                  </div>
                </div>
                
                <h4 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                  {video.title}
                </h4>
                
                <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{formatNumber(video.viewCount)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{formatNumber(video.likeCount)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedVideo(video)}
                    className="btn-secondary flex-1 text-sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                  <motion.button
                    onClick={() => handleCreateToken(video)}
                    disabled={isCreatingToken || !address}
                    className="btn-primary flex-1 text-sm disabled:opacity-50 relative overflow-hidden"
                    title={!address ? "Wallet address not available" : ""}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isCreatingToken ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Minting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Mint Token</span>
                      </div>
                    )}
                    
                    {/* Animated background effect */}
                    {isCreatingToken && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                  </motion.button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card border-red-500/20 bg-red-500/10"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
              <button
                onClick={clearError}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && videos.length === 0 && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <YouTubeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Videos Found</h3>
            <p className="text-gray-400 mb-6">
              Search for videos in your channel or try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Refresh Videos
            </button>
          </motion.div>
        )}

        {/* Minting Loader Modal */}
        <MintingLoader 
          isVisible={isCreatingToken} 
          message={mintingMessage}
        />

        {/* Success Modal */}
        <TokenSuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false)
            setCreatedTokenInfo(null)
          }}
          tokenInfo={createdTokenInfo}
        />
      </div>
    </div>
  )
}

export default VideoTokenization
