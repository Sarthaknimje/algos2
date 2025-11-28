import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown,
  Clock,
  Target,
  DollarSign,
  Users,
  BarChart3,
  Plus,
  CheckCircle,
  XCircle,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Sparkles,
  Zap,
  Trophy,
  AlertCircle,
  Loader,
  ExternalLink,
  RefreshCw,
  Play,
  Calendar,
  Activity,
  Globe,
  Coins,
  ArrowRight
} from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'
import { sendAlgoPaymentWithPera } from '../services/peraWalletService'
import PremiumBackground from '../components/PremiumBackground'
import { YouTubeIcon, InstagramIcon, TwitterIcon, LinkedInIcon } from '../assets/icons'

interface Prediction {
  prediction_id: string
  creator_address: string
  content_url: string
  platform: string
  metric_type: string
  target_value: number
  timeframe_hours: number
  end_time: string
  yes_pool: number
  no_pool: number
  status: string
  outcome?: string
  initial_value: number
  final_value?: number
  created_at: string
  current_value?: number
  yes_odds?: number
  no_odds?: number
  time_remaining_hours?: number
}

const BACKEND_URL = 'http://localhost:5001'

const PredictionMarket: React.FC = () => {
  const { isConnected, address, connectWallet, peraWallet } = useWallet()
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null)
  const [showTradeModal, setShowTradeModal] = useState(false)
  const [tradeSide, setTradeSide] = useState<'YES' | 'NO'>('YES')
  const [tradeAmount, setTradeAmount] = useState('')
  const [trading, setTrading] = useState(false)
  const [tradeSuccess, setTradeSuccess] = useState<{show: boolean, message: string, txId?: string} | null>(null)
  const [tradeError, setTradeError] = useState<string | null>(null)
  
  // Create prediction form
  const [createForm, setCreateForm] = useState({
    content_url: '',
    platform: 'youtube' as 'youtube' | 'instagram' | 'twitter' | 'linkedin',
    metric_type: 'likes' as 'likes' | 'comments' | 'views' | 'shares' | 'reposts',
    target_value: '',
    timeframe_hours: '24'
  })
  const [creating, setCreating] = useState(false)
  const [createSuccess, setCreateSuccess] = useState<{show: boolean, message: string} | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [userTokens, setUserTokens] = useState<any[]>([])
  const [showTokenSelectModal, setShowTokenSelectModal] = useState(false)
  const [createFromToken, setCreateFromToken] = useState(false)

  useEffect(() => {
    fetchPredictions()
    if (isConnected && address) {
      fetchUserTokens()
    }
    // Refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchPredictions, 10000)
    return () => clearInterval(interval)
  }, [isConnected, address])

  const fetchUserTokens = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/user-tokens/${address}`)
      const data = await response.json()
      if (data.success) {
        setUserTokens(data.tokens || [])
      }
    } catch (error) {
      console.error('Error fetching user tokens:', error)
    }
  }

  const fetchPredictions = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/predictions?status=active`)
      const data = await response.json()
      if (data.success) {
        // Fetch detailed data for each prediction with real-time metrics
        const detailed = await Promise.all(
          data.predictions.map(async (p: Prediction) => {
            try {
              const detailRes = await fetch(`${BACKEND_URL}/api/predictions/${p.prediction_id}`)
              const detailData = await detailRes.json()
              if (detailData.success) {
                const pred = detailData.prediction
                
                // Check if target is met - auto-resolve
                if (pred.current_value >= pred.target_value && (pred.status === 'active' || pred.status === 'resolving')) {
                  // Auto-resolve if target reached
                  try {
                    const resolveRes = await fetch(`${BACKEND_URL}/api/predictions/${p.prediction_id}/resolve`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' }
                    })
                    const resolveData = await resolveRes.json()
                    if (resolveData.success) {
                      // Refresh after resolution to show outcome
                      setTimeout(fetchPredictions, 2000)
                    }
                  } catch (e) {
                    console.error('Auto-resolve error:', e)
                  }
                }
                
                return pred
              }
              return p
            } catch {
              return p
            }
          })
        )
        setPredictions(detailed)
      }
    } catch (error) {
      console.error('Error fetching predictions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePrediction = async () => {
    if (!isConnected || !address) {
      setCreateError('Please connect your wallet first')
      return
    }

    if (!createForm.content_url || !createForm.target_value) {
      setCreateError('Please fill all required fields')
      return
    }

    setCreating(true)
    setCreateError(null)
    try {
      const response = await fetch(`${BACKEND_URL}/api/predictions/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_address: address,
          content_url: createForm.content_url,
          platform: createForm.platform,
          metric_type: createForm.metric_type,
          target_value: parseFloat(createForm.target_value),
          timeframe_hours: parseInt(createForm.timeframe_hours)
        })
      })

      const data = await response.json()
      if (data.success) {
        setCreateSuccess({
          show: true,
          message: `✅ Prediction market created! ID: ${data.prediction.prediction_id}`
        })
        setShowCreateModal(false)
        setCreateForm({
          content_url: '',
          platform: 'youtube',
          metric_type: 'likes',
          target_value: '',
          timeframe_hours: '24'
        })
        setTimeout(() => {
          setCreateSuccess(null)
          fetchPredictions()
        }, 3000)
      } else {
        setCreateError(data.error || 'Failed to create prediction')
      }
    } catch (error: any) {
      setCreateError(`Error: ${error.message}`)
    } finally {
      setCreating(false)
    }
  }

  const handleTrade = async () => {
    if (!isConnected || !address || !selectedPrediction || !peraWallet) {
      setTradeError('Please connect your wallet first')
      return
    }

    const amount = parseFloat(tradeAmount)
    if (isNaN(amount) || amount <= 0) {
      setTradeError('Please enter a valid amount greater than 0')
      return
    }

    setTrading(true)
    setTradeError(null)
    try {
      // First, create the trade record
      const response = await fetch(`${BACKEND_URL}/api/predictions/${selectedPrediction.prediction_id}/trade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trader_address: address,
          side: tradeSide,
          amount: amount
        })
      })

      const data = await response.json()
      if (data.success) {
        // Now send ALGO payment via Pera Wallet
        try {
          const txId = await sendAlgoPaymentWithPera({
            sender: address,
            peraWallet: peraWallet,
            receiver: selectedPrediction.creator_address, // Send to creator (pool)
            amount: amount
          })

          setTradeSuccess({
            show: true,
            message: `✅ Trade placed! ${tradeSide} ${amount} ALGO at ${data.trade.odds}x odds`,
            txId: txId
          })
          setShowTradeModal(false)
          setTradeAmount('')
          setTimeout(() => {
            setTradeSuccess(null)
            fetchPredictions()
          }, 3000)
        } catch (walletError: any) {
          setTradeError(`Wallet error: ${walletError.message}`)
        }
      } else {
        setTradeError(data.error || 'Failed to place trade')
      }
    } catch (error: any) {
      setTradeError(`Trade failed: ${error.message}`)
    } finally {
      setTrading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
    return num.toLocaleString()
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube': return <YouTubeIcon className="w-5 h-5 text-red-500" />
      case 'instagram': return <InstagramIcon className="w-5 h-5 text-pink-500" />
      case 'twitter': return <TwitterIcon className="w-5 h-5 text-blue-400" />
      case 'linkedin': return <LinkedInIcon className="w-5 h-5 text-blue-600" />
      default: return <Globe className="w-5 h-5 text-gray-400" />
    }
  }

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'likes': return <Heart className="w-4 h-4" />
      case 'comments': return <MessageCircle className="w-4 h-4" />
      case 'views': return <Eye className="w-4 h-4" />
      case 'shares': case 'reposts': return <Share2 className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative">
        <PremiumBackground variant="purple" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <Loader className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">Loading Prediction Markets...</h2>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-12 relative">
      <PremiumBackground variant="purple" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-gray-300">Prediction Markets</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Predict <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Social Metrics</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-6">
            Trade on whether content will reach target metrics. Real-time odds, automatic payouts.
          </p>
          {!isConnected && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={connectWallet}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white font-semibold"
            >
              Connect Wallet to Trade
            </motion.button>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="card text-center">
            <BarChart3 className="w-8 h-8 text-violet-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-1">{predictions.length}</div>
            <div className="text-gray-400 text-sm">Active Markets</div>
          </div>
          <div className="card text-center">
            <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-1">
              {formatNumber(predictions.reduce((sum, p) => sum + (p.yes_pool || 0) + (p.no_pool || 0), 0))}
            </div>
            <div className="text-gray-400 text-sm">Total Pool</div>
          </div>
          <div className="card text-center">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-1">
              {predictions.filter(p => p.status === 'active').length}
            </div>
            <div className="text-gray-400 text-sm">Active Predictions</div>
          </div>
          <div className="card text-center">
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-1">
              {predictions.filter(p => p.status === 'resolved').length}
            </div>
            <div className="text-gray-400 text-sm">Resolved</div>
          </div>
        </motion.div>

        {/* Create Buttons */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 flex flex-wrap justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCreateFromToken(false)
                setShowCreateModal(true)
              }}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white font-semibold flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create from URL</span>
            </motion.button>
            {userTokens.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTokenSelectModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-semibold flex items-center gap-2"
              >
                <Coins className="w-5 h-5" />
                <span>Create from My Tokens ({userTokens.length})</span>
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Predictions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {predictions.map((prediction, index) => (
            <motion.div
              key={prediction.prediction_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="card hover:border-violet-500/50 transition-all"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getPlatformIcon(prediction.platform)}
                  <div>
                    <h3 className="text-white font-bold capitalize">{prediction.platform}</h3>
                    <p className="text-gray-400 text-xs">{prediction.metric_type}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  prediction.status === 'active' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {prediction.status}
                </div>
              </div>

              {/* Real-Time Metrics Display */}
              <div className="mb-4 p-4 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 rounded-xl border border-violet-500/20">
                <p className="text-white font-semibold mb-4 text-center">
                  Will reach{' '}
                  <span className="text-violet-400 font-bold">{formatNumber(prediction.target_value)}</span>{' '}
                  {prediction.metric_type} in{' '}
                  <span className="text-fuchsia-400 font-bold">{prediction.timeframe_hours}h</span>?
                </p>
                
                {/* Current Metric - Large Display */}
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {getMetricIcon(prediction.metric_type)}
                    <span className="text-gray-400 text-sm">Current {prediction.metric_type}</span>
                  </div>
                  <div className="text-4xl font-bold text-white mb-1">
                    {formatNumber(prediction.current_value || prediction.initial_value)}
                  </div>
                  <div className="text-sm text-gray-400">
                    Target: <span className="text-violet-400 font-semibold">{formatNumber(prediction.target_value)}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>
                      {Math.min(100, ((prediction.current_value || prediction.initial_value) / prediction.target_value) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${Math.min(100, ((prediction.current_value || prediction.initial_value) / prediction.target_value) * 100)}%` 
                      }}
                      transition={{ duration: 0.5 }}
                      className={`h-full rounded-full ${
                        (prediction.current_value || prediction.initial_value) >= prediction.target_value
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Completion Status */}
                {(prediction.current_value || prediction.initial_value) >= prediction.target_value && prediction.status === 'active' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg mb-2"
                  >
                    <div className="flex items-center gap-2 justify-center">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-semibold">Target Reached! Resolving...</span>
                    </div>
                  </motion.div>
                )}

                {/* Metric Change */}
                <div className="flex items-center justify-center gap-4 text-xs">
                  <div className="flex items-center gap-1 text-gray-400">
                    <span>Started:</span>
                    <span className="text-white">{formatNumber(prediction.initial_value)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-violet-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>
                      +{formatNumber((prediction.current_value || prediction.initial_value) - prediction.initial_value)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pools & Odds */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className={`p-4 rounded-xl border-2 ${
                  prediction.outcome === 'YES' 
                    ? 'bg-green-500/20 border-green-500/50' 
                    : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400 font-semibold">YES</span>
                    <span className="text-white font-bold">{prediction.yes_odds?.toFixed(2)}x</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {formatNumber(prediction.yes_pool || 0)} ALGO
                  </div>
                  <div className="text-xs text-gray-400">
                    {prediction.yes_pool && prediction.no_pool 
                      ? `${((prediction.yes_pool / (prediction.yes_pool + prediction.no_pool)) * 100).toFixed(1)}%` 
                      : '0%'} pool
                  </div>
                </div>
                <div className={`p-4 rounded-xl border-2 ${
                  prediction.outcome === 'NO' 
                    ? 'bg-red-500/20 border-red-500/50' 
                    : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-red-400 font-semibold">NO</span>
                    <span className="text-white font-bold">{prediction.no_odds?.toFixed(2)}x</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {formatNumber(prediction.no_pool || 0)} ALGO
                  </div>
                  <div className="text-xs text-gray-400">
                    {prediction.yes_pool && prediction.no_pool 
                      ? `${((prediction.no_pool / (prediction.yes_pool + prediction.no_pool)) * 100).toFixed(1)}%` 
                      : '0%'} pool
                  </div>
                </div>
              </div>

              {/* Time Remaining */}
              {prediction.status === 'active' && (
                <div className="flex items-center justify-between mb-4 p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                      {prediction.time_remaining_hours 
                        ? `${Math.floor(prediction.time_remaining_hours)}h ${Math.floor((prediction.time_remaining_hours % 1) * 60)}m left`
                        : 'Expired'}
                    </span>
                  </div>
                  <a
                    href={prediction.content_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1"
                  >
                    <span>View Content</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {/* Outcome */}
              {prediction.status === 'resolved' && (
                <div className={`mb-4 p-3 rounded-lg ${
                  prediction.outcome === 'YES' 
                    ? 'bg-green-500/20 border border-green-500/50' 
                    : 'bg-red-500/20 border border-red-500/50'
                }`}>
                  <div className="flex items-center gap-2">
                    {prediction.outcome === 'YES' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-white font-semibold">
                      {prediction.outcome === 'YES' ? 'YES' : 'NO'} won! 
                      Final: {formatNumber(prediction.final_value || 0)}
                    </span>
                  </div>
                </div>
              )}

              {/* Trade Button */}
              {prediction.status === 'active' && isConnected && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedPrediction(prediction)
                    setShowTradeModal(true)
                  }}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white font-semibold"
                >
                  Trade Now
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>

        {predictions.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No Active Predictions</h3>
            <p className="text-gray-400 mb-6">Be the first to create a prediction market!</p>
            {isConnected && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white font-semibold"
              >
                Create Prediction Market
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Token Selection Modal */}
      <AnimatePresence>
        {showTokenSelectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTokenSelectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a2e] rounded-2xl p-6 max-w-2xl w-full border border-white/10 max-h-[80vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Select Token to Create Prediction</h2>
              
              {userTokens.length === 0 ? (
                <div className="text-center py-12">
                  <Coins className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">You haven't created any tokens yet.</p>
                  <p className="text-gray-500 text-sm mt-2">Tokenize content first to create predictions.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {userTokens.map((token) => (
                    <motion.button
                      key={token.asa_id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setCreateForm({
                          content_url: token.content_url || '',
                          platform: (token.platform || 'youtube') as any,
                          metric_type: 'likes' as any,
                          target_value: '',
                          timeframe_hours: '24'
                        })
                        setShowTokenSelectModal(false)
                        setShowCreateModal(true)
                        setCreateFromToken(true)
                      }}
                      className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all"
                    >
                      <div className="flex items-center gap-4">
                        {token.content_thumbnail && (
                          <img 
                            src={token.content_thumbnail} 
                            alt={token.token_name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">{token.token_name}</h3>
                          <p className="text-gray-400 text-sm">${token.token_symbol}</p>
                          <p className="text-gray-500 text-xs mt-1 capitalize">{token.platform || 'youtube'}</p>
                        </div>
                        <div className="text-violet-400">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
              
              <div className="mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowTokenSelectModal(false)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white font-semibold"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowCreateModal(false)
              setCreateError(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a2e] rounded-2xl p-6 max-w-2xl w-full border border-white/10"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Create Prediction Market</h2>
              
              {createError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 text-sm">{createError}</span>
                  </div>
                </motion.div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Content URL</label>
                  <input
                    type="text"
                    value={createForm.content_url}
                    onChange={(e) => setCreateForm({...createForm, content_url: e.target.value})}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">Platform</label>
                    <select
                      value={createForm.platform}
                      onChange={(e) => setCreateForm({...createForm, platform: e.target.value as any})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-violet-500"
                    >
                      <option value="youtube">YouTube</option>
                      <option value="instagram">Instagram</option>
                      <option value="twitter">Twitter/X</option>
                      <option value="linkedin">LinkedIn</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">Metric</label>
                    <select
                      value={createForm.metric_type}
                      onChange={(e) => setCreateForm({...createForm, metric_type: e.target.value as any})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-violet-500"
                    >
                      <option value="likes">Likes</option>
                      <option value="comments">Comments</option>
                      <option value="views">Views</option>
                      <option value="shares">Shares</option>
                      <option value="reposts">Reposts</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">Target Value</label>
                    <input
                      type="number"
                      value={createForm.target_value}
                      onChange={(e) => setCreateForm({...createForm, target_value: e.target.value})}
                      placeholder="100"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">Timeframe (hours)</label>
                    <input
                      type="number"
                      value={createForm.timeframe_hours}
                      onChange={(e) => setCreateForm({...createForm, timeframe_hours: e.target.value})}
                      placeholder="24"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowCreateModal(false)
                    setCreateError(null)
                  }}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white font-semibold"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreatePrediction}
                  disabled={creating}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white font-semibold disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Market'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trade Modal */}
      <AnimatePresence>
        {showTradeModal && selectedPrediction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowTradeModal(false)
              setTradeError(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a2e] rounded-2xl p-6 max-w-md w-full border border-white/10"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Trade Prediction</h2>
              
              {tradeError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 text-sm">{tradeError}</span>
                  </div>
                </motion.div>
              )}
              
              <div className="mb-4 p-4 bg-white/5 rounded-xl">
                <p className="text-white text-sm mb-2">
                  Will reach {formatNumber(selectedPrediction.target_value)} {selectedPrediction.metric_type}?
                </p>
                <p className="text-gray-400 text-xs">
                  Current: {formatNumber(selectedPrediction.current_value || selectedPrediction.initial_value)}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTradeSide('YES')}
                  className={`p-4 rounded-xl border-2 font-semibold ${
                    tradeSide === 'YES'
                      ? 'bg-green-500/20 border-green-500 text-green-400'
                      : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  YES
                  <div className="text-xs mt-1">{selectedPrediction.yes_odds?.toFixed(2)}x</div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTradeSide('NO')}
                  className={`p-4 rounded-xl border-2 font-semibold ${
                    tradeSide === 'NO'
                      ? 'bg-red-500/20 border-red-500 text-red-400'
                      : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  NO
                  <div className="text-xs mt-1">{selectedPrediction.no_odds?.toFixed(2)}x</div>
                </motion.button>
              </div>
              
              <div className="mb-6">
                <label className="text-gray-300 text-sm mb-2 block">Amount (ALGO)</label>
                <input
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  placeholder="1.0"
                  step="0.1"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
                />
                {tradeAmount && !isNaN(parseFloat(tradeAmount)) && (
                  <p className="text-gray-400 text-xs mt-2">
                    Potential payout: {(parseFloat(tradeAmount) * (tradeSide === 'YES' ? selectedPrediction.yes_odds! : selectedPrediction.no_odds!)).toFixed(2)} ALGO
                  </p>
                )}
              </div>
              
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowTradeModal(false)
                    setTradeError(null)
                  }}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white font-semibold"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleTrade}
                  disabled={trading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white font-semibold disabled:opacity-50"
                >
                  {trading ? 'Trading...' : 'Place Trade'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal - Trade */}
      <AnimatePresence>
        {tradeSuccess?.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setTradeSuccess(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a2e] rounded-2xl p-6 max-w-md w-full border border-green-500/50"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">Trade Successful!</h3>
                <p className="text-gray-300 mb-4">{tradeSuccess.message}</p>
                {tradeSuccess.txId && (
                  <a
                    href={`https://testnet.algoexplorer.io/tx/${tradeSuccess.txId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-400 hover:text-violet-300 text-sm flex items-center justify-center gap-1"
                  >
                    <span>View Transaction</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal - Create */}
      <AnimatePresence>
        {createSuccess?.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setCreateSuccess(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a2e] rounded-2xl p-6 max-w-md w-full border border-green-500/50"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">Prediction Created!</h3>
                <p className="text-gray-300">{createSuccess.message}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PredictionMarket

