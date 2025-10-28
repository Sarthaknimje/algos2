import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'
import { useNavigate } from 'react-router-dom'
import { 
  Rocket,
  Sparkles,
  TrendingUp,
  Users, 
  DollarSign,
  BarChart3,
  Zap,
  Shield,
  Coins,
  CheckCircle,
  ArrowRight,
  Loader,
  Star,
  Award,
  Target,
  Activity,
  ExternalLink,
  TrendingDown,
  Eye,
  Heart,
  Share2,
  LineChart,
  Globe,
  Lock,
  Code,
  Layers,
  Package,
  Volume2,
  VolumeX,
  Youtube,
  AlertCircle
} from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'
import { PeraWalletIcon, YouTubeIcon, InstagramIcon, TwitterIcon, LinkedInIcon } from '../assets/icons'

interface LaunchedToken {
  asaId: number
  symbol: string
  name: string
  totalSupply: number
  price: number
  marketCap: number
  holders: number
  volume24h: number
  priceChange24h: number
  createdAt: string
  creatorAddress: string
  transactionId: string
  youtubeChannelTitle: string
  youtubeSubscribers: number
}

interface YouTubeAuth {
  isConnected: boolean
  channelId: string | null
  channelTitle: string | null
  authUrl: string | null
}

const BACKEND_URL = 'http://localhost:5001'

const VideoTokenization: React.FC = () => {
  const { isConnected, address, connectWallet, isLoading, balance } = useWallet()
  const navigate = useNavigate()
  
  const [step, setStep] = useState<'setup' | 'launching' | 'launched'>('setup')
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [tokenSupply, setTokenSupply] = useState('5000')  // Realistic supply: 5K tokens
  const [tokenPrice, setTokenPrice] = useState('0.02')   // Realistic price: $0.02
  const [tokenDescription, setTokenDescription] = useState('')
  const [isLaunching, setIsLaunching] = useState(false)
  const [launchedToken, setLaunchedToken] = useState<LaunchedToken | null>(null)
  const [launchProgress, setLaunchProgress] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight })
  
  // YouTube Authentication
  const [youtubeAuth, setYoutubeAuth] = useState<YouTubeAuth>({
    isConnected: false,
    channelId: null,
    channelTitle: null,
    authUrl: null
  })
  const [isConnectingYouTube, setIsConnectingYouTube] = useState(false)
  
  // Social links
  const [youtubeLink, setYoutubeLink] = useState('')
  const [instagramLink, setInstagramLink] = useState('')
  const [twitterLink, setTwitterLink] = useState('')
  const [linkedinLink, setLinkedinLink] = useState('')

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Check YouTube connection status on mount and periodically
  useEffect(() => {
    checkYouTubeConnection()
    
    // Check every 5 seconds to see if user has connected
    const interval = setInterval(() => {
      if (!youtubeAuth.isConnected) {
        checkYouTubeConnection()
      }
    }, 5000)
    
    return () => clearInterval(interval)
  }, [youtubeAuth.isConnected])

  const connectYouTube = async () => {
    setIsConnectingYouTube(true)
    try {
      const response = await fetch(`${BACKEND_URL}/auth/youtube`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Redirect to YouTube OAuth
        window.location.href = result.auth_url
    } else {
        alert(`Error: ${result.error}`)
        setIsConnectingYouTube(false)
      }
    } catch (error) {
      console.error('YouTube connection error:', error)
      alert('Failed to connect to YouTube')
      setIsConnectingYouTube(false)
    }
  }

  const checkYouTubeConnection = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/youtube/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Include cookies in the request
      })
      
      const result = await response.json()
      
      if (result.success && result.authenticated) {
        // User is authenticated
        setYoutubeAuth({
          isConnected: true,
          channelId: result.channel_id,
          channelTitle: result.channel_title,
          authUrl: null
        })
      } else {
        // User is not authenticated
        setYoutubeAuth({
          isConnected: false,
          channelId: null,
          channelTitle: null,
          authUrl: null
        })
      }
    } catch (error) {
      console.error('Error checking YouTube connection:', error)
      setYoutubeAuth({
        isConnected: false,
        channelId: null,
        channelTitle: null,
        authUrl: null
      })
    }
  }

  const playSuccessSound = () => {
    if (!audioEnabled) return
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // Success melody
    const notes = [523.25, 659.25, 783.99, 1046.50] // C, E, G, C
    notes.forEach((freq, i) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = freq
      oscillator.type = 'sine'
      
      const startTime = audioContext.currentTime + (i * 0.15)
      gainNode.gain.setValueAtTime(0.3, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3)
      
      oscillator.start(startTime)
      oscillator.stop(startTime + 0.3)
    })
  }

  const handleLaunchToken = async () => {
    if (!tokenName || !tokenSymbol || !tokenSupply || !tokenPrice) {
      alert('Please fill in all required fields')
      return
    }

    if (!isConnected || !address) {
      alert('Please connect your wallet first')
      return
    }

    if (!youtubeAuth.isConnected) {
      alert('Please connect your YouTube channel first')
      return
    }

    setIsLaunching(true)
    setStep('launching')
    setLaunchProgress(0)

    try {
      // Progress: Preparing smart contract
      setLaunchProgress(20)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Progress: Creating ASA via Python backend
      setLaunchProgress(40)
      
      console.log('🚀 Calling Python backend to create ASA...')
      const response = await fetch(`${BACKEND_URL}/create-creator-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token_name: tokenName,
          token_symbol: tokenSymbol.toUpperCase(),
          total_supply: parseInt(tokenSupply),
          token_price: parseFloat(tokenPrice),
          description: tokenDescription
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create token')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create token')
      }

      console.log('✅ Token created successfully:', result.data)
      
      // Progress: Minting tokens
      setLaunchProgress(60)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Progress: Deploying to blockchain
      setLaunchProgress(80)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Progress: Finalizing
      setLaunchProgress(100)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newToken: LaunchedToken = {
        asaId: result.data.asset_id,
        symbol: result.data.token_symbol,
        name: result.data.token_name,
        totalSupply: result.data.total_supply,
        price: result.data.current_price,
        marketCap: result.data.market_cap,
        holders: 1,
        volume24h: 0,
        priceChange24h: 0,
        createdAt: new Date().toISOString(),
        creatorAddress: result.data.creator,
        transactionId: result.data.transaction_id,
        youtubeChannelTitle: result.data.youtube_channel.title,
        youtubeSubscribers: result.data.youtube_channel.subscribers
      }
      
      setLaunchedToken(newToken)
      setStep('launched')
      setShowConfetti(true)
      playSuccessSound()
      
      // Stop confetti after 8 seconds
      setTimeout(() => setShowConfetti(false), 8000)
      
      // Don't redirect - stay on success page to show metrics
      
    } catch (error: any) {
      console.error('Token launch error:', error)
      alert(`Error launching token: ${error.message || 'Please make sure the Python backend is running on port 5001'}`)
      setStep('setup')
    } finally {
      setIsLaunching(false)
      setLaunchProgress(0)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
    return num.toLocaleString()
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
            className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tr from-orange-500 via-red-500 to-yellow-500 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              y: [0, -50, 0],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full blur-3xl"
          />
          </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center relative z-10 px-4"
        >
          <motion.div 
            className="w-40 h-40 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-orange-500/50 relative overflow-hidden"
            animate={{ 
              boxShadow: [
                '0 25px 50px -12px rgba(251, 146, 60, 0.5)',
                '0 25px 50px -12px rgba(251, 146, 60, 0.8)',
                '0 25px 50px -12px rgba(251, 146, 60, 0.5)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                y: [0, -10, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Rocket className="w-20 h-20 text-white" />
            </motion.div>
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          
          <motion.h2 
            className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-300 mb-6"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ backgroundSize: '200% auto' }}
          >
            Launch Your Creator Token
          </motion.h2>
          
          <p className="text-gray-300 mb-10 max-w-md mx-auto text-xl font-medium">
            Connect your wallet to create your own cryptocurrency and build your creator economy.
          </p>
          
          <motion.button 
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            whileTap={{ scale: 0.95 }}
            onClick={connectWallet}
            disabled={isLoading}
            className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl text-white font-bold text-lg shadow-2xl shadow-purple-500/50 overflow-hidden mx-auto inline-flex items-center space-x-3"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600"
              animate={{ x: ['0%', '100%', '0%'] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <PeraWalletIcon className="w-7 h-7 relative z-10" />
            <span className="relative z-10">{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
            <Sparkles className="w-7 h-7 relative z-10 group-hover:rotate-12 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    )
  }

  if (step === 'launching') {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-full blur-3xl opacity-30"
          />
          <motion.div 
            animate={{ 
              scale: [1.5, 1, 1.5],
              rotate: [360, 180, 0]
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500 rounded-full blur-3xl opacity-30"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10 max-w-2xl mx-auto px-4"
        >
          {/* Rocket Animation */}
          <motion.div
            animate={{ 
              y: [0, -30, 0],
              rotate: [0, 360]
            }}
            transition={{ 
              y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 3, repeat: Infinity, ease: "linear" }
            }}
            className="w-48 h-48 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-12 shadow-2xl shadow-orange-500/80 relative"
          >
            <Rocket className="w-24 h-24 text-white" />
            
            {/* Particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4 bg-yellow-400 rounded-full"
                animate={{
                  x: [0, Math.cos(i * 30 * Math.PI / 180) * 100],
                  y: [0, Math.sin(i * 30 * Math.PI / 180) * 100],
                  opacity: [1, 0],
                  scale: [1, 0]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              />
            ))}
          </motion.div>
          
          <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 mb-6">
            Launching Your Token...
          </h2>
          
          <p className="text-gray-300 text-xl mb-12 font-medium">
            Creating your Algorand Standard Asset on the blockchain
          </p>

          {/* Progress Bar */}
          <div className="mb-10">
            <div className="h-4 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border-2 border-white/20">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 shadow-lg shadow-orange-500/50 relative overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: `${launchProgress}%` }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
            </div>
            <p className="text-white font-black text-2xl mt-4">{launchProgress}%</p>
          </div>
          
          {/* Status Steps */}
          <div className="flex flex-col items-center space-y-4">
            <motion.div
              animate={{ opacity: launchProgress >= 20 ? 1 : 0.3, scale: launchProgress >= 20 ? 1 : 0.95 }}
              className="flex items-center space-x-3 text-blue-400 bg-blue-500/20 px-8 py-4 rounded-2xl backdrop-blur-sm w-full max-w-md border-2 border-blue-500/30"
            >
              {launchProgress >= 20 ? (
                <CheckCircle className="w-7 h-7" />
              ) : (
                <Loader className="w-7 h-7 animate-spin" />
              )}
              <span className="font-bold text-lg">Preparing smart contract...</span>
            </motion.div>
            
            <motion.div
              animate={{ opacity: launchProgress >= 60 ? 1 : 0.3, scale: launchProgress >= 60 ? 1 : 0.95 }}
              className="flex items-center space-x-3 text-purple-400 bg-purple-500/20 px-8 py-4 rounded-2xl backdrop-blur-sm w-full max-w-md border-2 border-purple-500/30"
            >
              {launchProgress >= 60 ? (
                <CheckCircle className="w-7 h-7" />
              ) : (
                <Loader className="w-7 h-7 animate-spin" />
              )}
              <span className="font-bold text-lg">Minting tokens...</span>
            </motion.div>
            
            <motion.div
              animate={{ opacity: launchProgress >= 80 ? 1 : 0.3, scale: launchProgress >= 80 ? 1 : 0.95 }}
              className="flex items-center space-x-3 text-pink-400 bg-pink-500/20 px-8 py-4 rounded-2xl backdrop-blur-sm w-full max-w-md border-2 border-pink-500/30"
            >
              {launchProgress >= 80 ? (
                <CheckCircle className="w-7 h-7" />
              ) : (
                <Loader className="w-7 h-7 animate-spin" />
              )}
              <span className="font-bold text-lg">Deploying to Algorand...</span>
            </motion.div>

            <motion.div
              animate={{ opacity: launchProgress >= 100 ? 1 : 0.3, scale: launchProgress >= 100 ? 1 : 0.95 }}
              className="flex items-center space-x-3 text-green-400 bg-green-500/20 px-8 py-4 rounded-2xl backdrop-blur-sm w-full max-w-md border-2 border-green-500/30"
            >
              {launchProgress >= 100 ? (
                <CheckCircle className="w-7 h-7" />
              ) : (
                <Loader className="w-7 h-7 animate-spin" />
              )}
              <span className="font-bold text-lg">Finalizing deployment...</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  if (step === 'launched' && launchedToken) {
    return (
      <>
        {showConfetti && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={true}
            numberOfPieces={500}
            gravity={0.3}
            colors={['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#9370DB', '#4169E1']}
          />
        )}
        
        <div className="min-h-screen py-12 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-green-500 to-emerald-500 rounded-full blur-3xl"
            />
            <motion.div 
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 8, repeat: Infinity, delay: 1 }}
              className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur-3xl"
            />
          </div>

          {/* Audio Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="fixed top-24 right-6 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 border-2 border-white/30 rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
          >
            {audioEnabled ? (
              <Volume2 className="w-6 h-6 text-white" />
            ) : (
              <VolumeX className="w-6 h-6 text-gray-400" />
            )}
          </motion.button>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Success Header */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 1, bounce: 0.6 }}
                className="w-32 h-32 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/50 relative"
              >
                <CheckCircle className="w-16 h-16 text-white" />
              </motion.div>
              
              <motion.h1 
                className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 mb-6"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{ backgroundSize: '200% auto' }}
              >
                🎉 Token Launched!
              </motion.h1>
              
              <p className="text-gray-300 text-2xl font-medium">Your creator token is now live on Algorand blockchain</p>
            </motion.div>

            {/* Token Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 mb-8 relative overflow-hidden shadow-2xl shadow-purple-500/30"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{ backgroundSize: '200% auto' }}
              />
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                <div className="flex items-center space-x-6">
                  <motion.div 
                    className="w-28 h-28 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-5xl font-black text-white shadow-xl shadow-orange-500/50"
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {launchedToken.symbol.substring(0, 2)}
                  </motion.div>
                  <div>
                    <h2 className="text-5xl font-black text-white mb-2">${launchedToken.symbol}</h2>
                    <p className="text-gray-300 text-2xl font-medium mb-2">{launchedToken.name}</p>
                    <p className="text-gray-400 text-lg mb-3">by {launchedToken.youtubeChannelTitle}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <motion.span 
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-bold shadow-lg"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        ● LIVE
                      </motion.span>
                      <span className="text-gray-400 text-sm font-mono bg-white/5 px-4 py-2 rounded-lg border border-white/20">
                        ASA: {launchedToken.asaId}
                      </span>
                      <a
                        href={`https://testnet.explorer.perawallet.app/asset/${launchedToken.asaId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm font-mono bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/30 hover:border-blue-500/50 transition-all"
                      >
                        View on Pera Explorer ↗
                      </a>
                    </div>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <motion.div 
                    className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-2"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    ${launchedToken.price.toFixed(4)}
                  </motion.div>
                  <div className="text-green-400 text-xl font-bold">+0.00% (24h)</div>
                </div>
              </div>
            </motion.div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              {[
                { icon: DollarSign, label: 'Market Cap', value: `$${formatNumber(launchedToken.marketCap)}`, color: 'from-green-500 to-emerald-600', delay: 0.4 },
                { icon: Users, label: 'Holders', value: formatNumber(launchedToken.holders), color: 'from-blue-500 to-cyan-600', delay: 0.5 },
                { icon: Activity, label: '24h Volume', value: `$${formatNumber(launchedToken.volume24h)}`, color: 'from-purple-500 to-pink-600', delay: 0.6 },
                { icon: Coins, label: 'Total Supply', value: formatNumber(launchedToken.totalSupply), color: 'from-yellow-500 to-orange-600', delay: 0.7 }
              ].map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: metric.delay }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="card bg-gradient-to-br from-white/5 to-white/10 border-2 border-white/20 text-center relative overflow-hidden group shadow-xl"
                >
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                  />
                  <div className={`w-12 h-12 mx-auto mb-4 bg-gradient-to-br ${metric.color} rounded-xl flex items-center justify-center`}>
                    <metric.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-4xl font-black text-white mb-2">{metric.value}</div>
                  <div className="text-gray-400 text-sm font-semibold uppercase tracking-wide">{metric.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
            >
              {[
                { 
                  icon: BarChart3, 
                  title: 'Trade Your Token', 
                  desc: 'Start trading on the marketplace',
                  gradient: 'from-blue-500 to-cyan-600',
                  link: `/trade/${launchedToken.symbol}`,
                  isExternal: false
                },
                { 
                  icon: ExternalLink, 
                  title: 'View on Explorer', 
                  desc: 'Check your token on Pera Wallet',
                  gradient: 'from-orange-500 to-red-600',
                  link: `https://testnet.explorer.perawallet.app/asset/${launchedToken.asaId}`,
                  isExternal: true
                },
                { 
                  icon: Lock, 
                  title: 'Upload Premium Content', 
                  desc: 'Add exclusive content for holders',
                  gradient: 'from-purple-500 to-pink-600',
                  link: '/content-tokenization',
                  isExternal: false
                },
                { 
                  icon: Target, 
                  title: 'Manage Profile', 
                  desc: 'Update your creator profile',
                  gradient: 'from-green-500 to-emerald-600',
                  link: '/profile',
                  isExternal: false
                }
              ].map((action, index) => (
                <motion.button
                  key={index}
                  onClick={() => action.isExternal ? window.open(action.link, '_blank') : navigate(action.link)}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="card bg-gradient-to-br from-white/5 to-white/10 border-2 border-white/20 hover:border-white/40 transition-all cursor-pointer group relative overflow-hidden shadow-xl"
                >
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-20 transition-opacity`}
                  />
                  <div className="flex items-center space-x-4 relative z-10">
                    <div className={`w-14 h-14 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                      <action.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-white font-bold text-lg mb-1">{action.title}</h3>
                      <p className="text-gray-400 text-sm">{action.desc}</p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.button>
              ))}
            </motion.div>

            {/* Launch Another Token */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center"
            >
              <motion.button
                onClick={() => {
                  setStep('setup')
                  setLaunchedToken(null)
                  setTokenName('')
                  setTokenSymbol('')
                  setTokenSupply('5000')
                  setTokenPrice('0.02')
                  setTokenDescription('')
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 border-2 border-white/30 rounded-xl text-white font-bold transition-all shadow-xl"
              >
                Launch Another Token
              </motion.button>
            </motion.div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen py-12 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ duration: 15, repeat: Infinity, delay: 2 }}
          className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-gradient-to-tr from-orange-500 via-red-500 to-yellow-500 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
          <motion.div
          initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-8">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                y: [0, -10, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-28 h-28 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/50 relative overflow-hidden"
            >
              <Rocket className="w-14 h-14 text-white relative z-10" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
          </motion.div>
        </div>

          <motion.h1 
            className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 mb-6"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ backgroundSize: '200% auto' }}
          >
            Launch Your Creator Token
          </motion.h1>
          
          <p className="text-gray-300 text-xl md:text-2xl max-w-3xl mx-auto font-medium">
            Create your own cryptocurrency on Algorand blockchain. Build your creator economy and reward your community.
          </p>
        </motion.div>

        {/* YouTube Authentication Required */}
        {!youtubeAuth.isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-gradient-to-br from-red-500/20 to-orange-500/20 border-2 border-red-500/50 mb-8 relative overflow-hidden shadow-2xl"
          >
            <div className="flex items-center space-x-4 p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black text-white mb-2">YouTube Authentication Required</h3>
                <p className="text-gray-300 text-lg mb-4">
                  You must connect and verify your YouTube channel to create a creator token. This ensures only genuine channel owners can launch tokens.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={connectYouTube}
                  disabled={isConnectingYouTube}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl text-white font-bold shadow-lg flex items-center space-x-2"
                >
                  <Youtube className="w-5 h-5" />
                  <span>{isConnectingYouTube ? 'Connecting...' : 'Connect YouTube Channel'}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* YouTube Connected Success */}
        {youtubeAuth.isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 mb-8 relative overflow-hidden shadow-2xl"
          >
            <div className="flex items-center space-x-4 p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black text-white mb-2">YouTube Channel Connected</h3>
                <p className="text-gray-300 text-lg">
                  ✅ <strong>{youtubeAuth.channelTitle}</strong> verified and ready for token creation
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 mb-8 relative overflow-hidden shadow-2xl"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 10, repeat: Infinity }}
            style={{ backgroundSize: '200% auto' }}
          />
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white">Token Information</h2>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-bold mb-3 text-lg">Token Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Sarthak Creator Token"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    className="w-full px-5 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all shadow-lg text-lg font-medium"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-bold mb-3 text-lg">Token Symbol *</label>
                  <input
                    type="text"
                    placeholder="e.g., SART"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                    maxLength={8}
                    className="w-full px-5 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white/20 transition-all shadow-lg text-lg font-medium uppercase"
                  />
                  </div>
                  </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-bold mb-3 text-lg">Total Supply *</label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={tokenSupply}
                    onChange={(e) => setTokenSupply(e.target.value)}
                    className="w-full px-5 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:bg-white/20 transition-all shadow-lg text-lg font-medium"
                  />
                  <p className="text-gray-400 text-sm mt-2 font-medium">Total number of tokens to create</p>
                </div>

                <div>
                  <label className="block text-white font-bold mb-3 text-lg">Initial Price (ALGO) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.02"
                    value={tokenPrice}
                    onChange={(e) => setTokenPrice(e.target.value)}
                    className="w-full px-5 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:bg-white/20 transition-all shadow-lg text-lg font-medium"
                  />
                  <p className="text-gray-400 text-sm mt-2 font-medium">Price per token in ALGO</p>
                </div>
              </div>

              <div>
                <label className="block text-white font-bold mb-3 text-lg">Description</label>
                <textarea
                  placeholder="Describe your creator token and what holders will receive..."
                  value={tokenDescription}
                  onChange={(e) => setTokenDescription(e.target.value)}
                  rows={4}
                  className="w-full px-5 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:bg-white/20 transition-all shadow-lg text-lg font-medium resize-none"
                />
              </div>
            </div>
            </div>
          </motion.div>

        {/* Preview */}
        <AnimatePresence>
          {tokenName && tokenSymbol && (
          <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: 0.4 }}
              className="card bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 border-2 border-purple-500/50 mb-10 relative overflow-hidden shadow-2xl"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{ backgroundSize: '200% auto' }}
              />
              
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-6">
                  <Sparkles className="w-8 h-8 text-yellow-400" />
                  <h3 className="text-2xl font-black text-white">Token Preview</h3>
                </div>
                <div className="flex items-center space-x-6">
                  <motion.div 
                    className="w-20 h-20 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-orange-500/50"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {tokenSymbol.substring(0, 2)}
                  </motion.div>
                  <div>
                    <div className="text-3xl font-black text-white mb-1">${tokenSymbol}</div>
                    <div className="text-gray-300 text-lg font-medium">{tokenName}</div>
                    <div className="text-sm text-gray-400 mt-2 font-semibold">
                      Supply: {formatNumber(parseInt(tokenSupply) || 0)} • Price: {tokenPrice} ALGO
                    </div>
                    <div className="text-sm text-gray-400 mt-1 font-semibold">
                      Market Cap: ${formatNumber((parseInt(tokenSupply) || 0) * (parseFloat(tokenPrice) || 0))}
                </div>
              </div>
            </div>
          </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Launch Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 25px 50px -12px rgba(251, 146, 60, 0.8)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLaunchToken}
            disabled={!tokenName || !tokenSymbol || !tokenSupply || !tokenPrice || isLaunching || !youtubeAuth.isConnected}
            className="group relative px-16 py-6 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 hover:from-yellow-400 hover:via-orange-400 hover:to-red-500 rounded-2xl text-white font-black text-2xl shadow-2xl shadow-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-4 overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <Rocket className="w-8 h-8 relative z-10 group-hover:rotate-12 transition-transform" />
            <span className="relative z-10">Launch Token</span>
            <Sparkles className="w-8 h-8 relative z-10 group-hover:-rotate-12 transition-transform" />
          </motion.button>
          <p className="text-gray-400 text-base mt-6 font-medium">
            Your token will be created as an Algorand Standard Asset (ASA) via Python backend
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default VideoTokenization
