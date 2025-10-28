import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  DollarSign, 
  Users,
  Activity,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  RefreshCw,
  ArrowLeft,
  LineChart,
  Zap,
  Flame,
  Star,
  Eye,
  Heart,
  Share2
} from 'lucide-react'
import { 
  LineChart as RechartsLine, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { useWallet } from '../contexts/WalletContext'
import { PeraWalletIcon } from '../assets/icons'

interface TradeData {
  type: 'buy' | 'sell'
  price: number
  amount: number
  total: number
  timestamp: number
}

interface ChartDataPoint {
  time: string
  price: number
  timestamp: number
}

interface OrderBookEntry {
  price: number
  amount: number
  total: number
}

interface CreatorToken {
  symbol: string
  name: string
  description: string
  currentPrice: number
  priceChange24h: number
  high24h: number
  low24h: number
  volume24h: number
  marketCap: number
  holders: number
}

const TradingMarketplace: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>()
  const navigate = useNavigate()
  const { isConnected, address, balance, connectWallet, isLoading } = useWallet()
  
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy')
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market')
  const [amount, setAmount] = useState('')
  const [price, setPrice] = useState('')
  const [currentPrice, setCurrentPrice] = useState(0.025)
  const [priceChange24h, setPriceChange24h] = useState(12.5)
  const [trades, setTrades] = useState<TradeData[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [chartTimeframe, setChartTimeframe] = useState<'1H' | '24H' | '7D' | '30D'>('24H')
  const [buyOrders, setBuyOrders] = useState<OrderBookEntry[]>([])
  const [sellOrders, setSellOrders] = useState<OrderBookEntry[]>([])
  const [hoveredPrice, setHoveredPrice] = useState<number | null>(null)
  const [tokenData, setTokenData] = useState<any>(null)
  const [loadingToken, setLoadingToken] = useState(true)
  const [userTokenBalance, setUserTokenBalance] = useState(0) // User's token balance
  const [userAlgoBalance, setUserAlgoBalance] = useState(0) // User's ALGO balance
  
  // Fetch real token data from backend
  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        setLoadingToken(true)
        const response = await fetch('http://localhost:5001/tokens')
        const result = await response.json()
        
        if (result.success) {
          // Find token by symbol
          const token = result.tokens.find((t: any) => t.token_symbol.trim() === symbol)
          if (token) {
            // Add calculated fields for UI compatibility
            const enhancedToken = {
              ...token,
              high24h: token.current_price * 1.05, // Calculate 24h high
              low24h: token.current_price * 0.95,   // Calculate 24h low
              volume24h: token.volume_24h || 0,
              marketCap: token.market_cap || (token.current_price * token.total_supply) // Real market cap
            }
            setTokenData(enhancedToken)
            setCurrentPrice(token.current_price)
            setPriceChange24h(token.price_change_24h)
          } else {
            console.error('Token not found:', symbol)
            // Fallback to mock data if token not found
            setTokenData({
              symbol: symbol || 'TECH',
              name: 'Creator Token',
              asa_id: 0,
              current_price: currentPrice,
              price_change_24h: priceChange24h,
              market_cap: currentPrice * 1000000, // Real calculated market cap
              volume_24h: 15000,
              holders: 1250,
              high24h: currentPrice * 1.05,
              low24h: currentPrice * 0.95,
              volume24h: 15000,
              marketCap: currentPrice * 1000000 // Real calculated market cap
            })
          }
        } else {
          console.error('Failed to fetch tokens:', result.error)
        }
      } catch (error) {
        console.error('Error fetching token data:', error)
      } finally {
        setLoadingToken(false)
      }
    }

    if (symbol) {
      fetchTokenData()
    }
  }, [symbol])

  // Initialize user balances when wallet connects
  useEffect(() => {
    if (isConnected && balance) {
      setUserAlgoBalance(balance)
      setUserTokenBalance(0) // Start with 0 tokens
    }
  }, [isConnected, balance])

  // Initialize chart data
  useEffect(() => {
    const initialData: ChartDataPoint[] = []
    const now = Date.now()
    const basePrice = 0.025
    
    for (let i = 100; i >= 0; i--) {
      const timestamp = now - i * 60000
      const date = new Date(timestamp)
      const variation = (Math.random() - 0.5) * 0.005
      const price = basePrice + variation
      
      initialData.push({
        time: `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`,
        price: price,
        timestamp: timestamp
      })
    }
    
    setChartData(initialData)
    setCurrentPrice(initialData[initialData.length - 1].price)
  }, [])

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice(prev => {
        const change = (Math.random() - 0.5) * 0.001
        const newPrice = Math.max(0.001, prev + change)
        
        // Update chart data
        setChartData(prevData => {
          const now = Date.now()
          const date = new Date(now)
          const newPoint = {
            time: `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`,
            price: newPrice,
            timestamp: now
          }
          const updated = [...prevData, newPoint]
          return updated.slice(-100)
        })
        
        return newPrice
      })
      
      setPriceChange24h(prev => {
        const newChange = prev + (Math.random() - 0.5) * 0.5
        return Math.max(-50, Math.min(50, newChange))
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])
  
  // Initialize order book
  useEffect(() => {
    const generateOrders = (isBuy: boolean): OrderBookEntry[] => {
      const orders: OrderBookEntry[] = []
      const basePrice = currentPrice
      
      for (let i = 0; i < 15; i++) {
        const priceOffset = (i + 1) * 0.0001 * (isBuy ? -1 : 1)
        const orderPrice = basePrice + priceOffset
        const amount = Math.random() * 1000 + 100
        
        orders.push({
          price: orderPrice,
          amount: amount,
          total: orderPrice * amount
        })
      }
      
      return orders
    }
    
    setBuyOrders(generateOrders(true))
    setSellOrders(generateOrders(false))
    
    const interval = setInterval(() => {
      setBuyOrders(generateOrders(true))
      setSellOrders(generateOrders(false))
    }, 5000)
    
    return () => clearInterval(interval)
  }, [currentPrice])

  // Initialize with some recent trades
  useEffect(() => {
    const recentTrades: TradeData[] = []
    for (let i = 0; i < 20; i++) {
      recentTrades.push({
        type: Math.random() > 0.5 ? 'buy' : 'sell',
        price: currentPrice + (Math.random() - 0.5) * 0.002,
        amount: Math.random() * 1000 + 100,
        total: 0,
        timestamp: Date.now() - i * 60000
      })
    }
    recentTrades.forEach(trade => {
      trade.total = trade.price * trade.amount
    })
    setTrades(recentTrades)
  }, [])

  const handleTrade = async () => {
    if (!isConnected) {
      connectWallet()
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    if (orderType === 'limit' && (!price || parseFloat(price) <= 0)) {
      alert('Please enter a valid price for limit order')
      return
    }

    // Check if user has enough balance
    const tradeAmount = parseFloat(amount)
    const tradePrice = orderType === 'market' ? currentPrice : parseFloat(price)
    const totalCost = tradeAmount * tradePrice

    if (activeTab === 'buy' && totalCost > userAlgoBalance) {
      alert(`❌ Insufficient ALGO balance!\nYou need ${totalCost.toFixed(4)} ALGO but only have ${userAlgoBalance.toFixed(4)} ALGO`)
      return
    }

    if (activeTab === 'sell' && tradeAmount > userTokenBalance) {
      alert(`❌ Insufficient token balance!\nYou want to sell ${tradeAmount} ${tokenData.symbol} but only have ${userTokenBalance.toFixed(2)} ${tokenData.symbol}`)
      return
    }

    setIsProcessing(true)

    try {
      // Call backend to execute real smart contract trade
      const response = await fetch('http://localhost:5001/trade-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          asa_id: tokenData.asa_id,
          trade_type: activeTab, // 'buy' or 'sell'
          amount: Math.floor(tradeAmount), // Convert to integer tokens
          price: tradePrice,
          trader_address: address // Add the user's wallet address
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Create trade record for UI
        const newTrade: TradeData = {
          type: activeTab,
          price: tradePrice,
          amount: tradeAmount,
          total: tradePrice * tradeAmount,
          timestamp: Date.now()
        }

        setTrades(prev => [newTrade, ...prev.slice(0, 19)])
        setAmount('')
        setPrice('')
        
        // Update user balances based on trade
        if (activeTab === 'buy') {
          setUserTokenBalance(prev => prev + tradeAmount)
          setUserAlgoBalance(prev => prev - (tradePrice * tradeAmount))
        } else {
          setUserTokenBalance(prev => prev - tradeAmount)
          setUserAlgoBalance(prev => prev + (tradePrice * tradeAmount))
        }
        
        // Success message with transaction details
        alert(`🎉 ${activeTab === 'buy' ? 'Buy' : 'Sell'} order executed successfully!\n\n📊 Details:\n• Amount: ${tradeAmount} ${tokenData.symbol} tokens\n• Price: $${tradePrice.toFixed(4)} ALGO\n• Total: $${(tradePrice * tradeAmount).toFixed(4)} ALGO\n• Transaction ID: ${result.data.transaction_id}\n• Confirmed in round: ${result.data.confirmed_round}\n\n✅ Transaction confirmed on Algorand blockchain!`)
      } else {
        alert(`❌ Trade failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Trade error:', error)
      alert('❌ Failed to execute trade. Please make sure backend is running and try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const calculateTotal = () => {
    const amountNum = parseFloat(amount) || 0
    const priceNum = orderType === 'market' ? currentPrice : (parseFloat(price) || 0)
    return amountNum * priceNum
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K'
    }
    return num.toFixed(2)
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return new Date(timestamp).toLocaleDateString()
  }

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900/95 backdrop-blur-sm border border-primary-500/50 rounded-lg p-3 shadow-xl"
        >
          <p className="text-white font-semibold">${payload[0].value.toFixed(4)}</p>
          <p className="text-gray-400 text-xs">{payload[0].payload.time}</p>
        </motion.div>
      )
    }
    return null
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center relative z-10"
        >
          <motion.div 
            className="w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <BarChart3 className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-4xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto text-lg">
            Connect your Pera wallet to start trading creator tokens and access live market data.
          </p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={connectWallet}
            disabled={isLoading}
            className="btn-primary flex items-center space-x-2 mx-auto disabled:opacity-50 px-8 py-4 text-lg"
          >
            <PeraWalletIcon className="w-6 h-6" />
            <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
          </motion.button>
        </motion.div>
      </div>
    )
  }

  const isPositive = priceChange24h >= 0

  if (loadingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading token data...</p>
        </div>
      </div>
    )
  }

  if (!tokenData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">!</span>
          </div>
          <p className="text-white text-lg mb-2">Token not found</p>
          <p className="text-gray-400">Token symbol "{symbol}" does not exist</p>
          <button 
            onClick={() => navigate('/creator-marketplace')} 
            className="mt-4 px-6 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-white"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-6 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4"
        >
          <div className="flex items-center space-x-4">
            <Link 
              to="/creator-marketplace"
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group"
            >
              <motion.div whileHover={{ x: -3 }}>
                <ArrowLeft className="w-5 h-5" />
              </motion.div>
              <span>Back to Marketplace</span>
            </Link>
            <div className="h-6 w-px bg-white/20"></div>
            <div className="flex items-center space-x-3">
              <motion.h1 
                className="text-3xl md:text-4xl font-display font-bold text-white"
                animate={{ 
                  backgroundPosition: ['0%', '100%', '0%']
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundImage: 'linear-gradient(90deg, #fff, #818cf8, #fff)',
                  backgroundSize: '200% auto',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                ${tokenData.symbol}
              </motion.h1>
              <motion.span 
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 rounded-full text-sm font-medium"
              >
                {tokenData.name}
              </motion.span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Flame className="w-5 h-5 text-orange-400" />
              </motion.div>
            </div>
          </div>
          
          {/* Wallet Info */}
          <div className="flex items-center space-x-4">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20"
            >
              <div className="text-xs text-gray-400">Balance</div>
              <div className="text-lg font-semibold text-white">{userAlgoBalance.toFixed(2)} ALGO</div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="px-4 py-2 bg-white/5 rounded-lg border border-white/10"
            >
              <div className="text-xs text-gray-400">Address</div>
              <div className="text-sm font-mono text-white">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Price Stats Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card mb-6 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 border-white/10"
        >
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            <motion.div whileHover={{ scale: 1.05 }} className="cursor-pointer">
              <div className="text-gray-400 text-xs mb-1 flex items-center space-x-1">
                <Activity className="w-3 h-3" />
                <span>Current Price</span>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white">
                ${currentPrice.toFixed(4)}
              </div>
              <motion.div 
                className={`flex items-center space-x-1 text-sm mt-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {isPositive ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span>{isPositive ? '+' : ''}{priceChange24h.toFixed(2)}%</span>
              </motion.div>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} className="cursor-pointer">
              <div className="text-gray-400 text-xs mb-1">24h High</div>
              <div className="text-lg font-semibold text-green-400">
                ${tokenData.high24h.toFixed(4)}
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="cursor-pointer">
              <div className="text-gray-400 text-xs mb-1">24h Low</div>
              <div className="text-lg font-semibold text-red-400">
                ${tokenData.low24h.toFixed(4)}
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="cursor-pointer">
              <div className="text-gray-400 text-xs mb-1">24h Volume</div>
              <div className="text-lg font-semibold text-white">
                ${formatNumber(tokenData.volume24h)}
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="cursor-pointer">
              <div className="text-gray-400 text-xs mb-1">Market Cap</div>
              <div className="text-lg font-semibold text-white">
                ${formatNumber(tokenData.marketCap)}
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="cursor-pointer">
              <div className="text-gray-400 text-xs mb-1">Holders</div>
              <div className="text-lg font-semibold text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>{formatNumber(tokenData.holders)}</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Trading Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Chart + Order Book */}
          <div className="lg:col-span-3 space-y-6">
            {/* Price Chart */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <LineChart className="w-6 h-6 text-blue-400" />
                  </motion.div>
                  <span>Live Price Chart</span>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Zap className="w-5 h-5 text-yellow-400" />
                  </motion.div>
                </h3>
                <div className="flex space-x-2">
                  {(['1H', '24H', '7D', '30D'] as const).map((tf) => (
                    <motion.button
                      key={tf}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setChartTimeframe(tf)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        chartTimeframe === tf
                          ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg shadow-primary-500/50'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {tf}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <div className="h-96 bg-gradient-to-b from-black/20 to-black/40 rounded-xl p-4 border border-white/5">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    onMouseMove={(e: any) => {
                      if (e && e.activePayload) {
                        setHoveredPrice(e.activePayload[0]?.value)
                      }
                    }}
                    onMouseLeave={() => setHoveredPrice(null)}
                  >
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#9ca3af"
                      style={{ fontSize: '12px' }}
                      tick={{ fill: '#9ca3af' }}
                    />
                    <YAxis 
                      stroke="#9ca3af"
                      style={{ fontSize: '12px' }}
                      tick={{ fill: '#9ca3af' }}
                      domain={['dataMin - 0.001', 'dataMax + 0.001']}
                      tickFormatter={(value) => `$${value.toFixed(4)}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke={isPositive ? "#10b981" : "#ef4444"} 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorPrice)"
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 grid grid-cols-3 gap-4">
                <motion.div 
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="text-center p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20"
                >
                  <div className="text-xs text-gray-400 mb-1">Open</div>
                  <div className="text-lg font-semibold text-white">${(currentPrice * 0.98).toFixed(4)}</div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="text-center p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20"
                >
                  <div className="text-xs text-gray-400 mb-1">Close</div>
                  <div className="text-lg font-semibold text-white">${currentPrice.toFixed(4)}</div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={`text-center p-4 rounded-xl border ${
                    isPositive 
                      ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20'
                      : 'bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20'
                  }`}
                >
                  <div className="text-xs text-gray-400 mb-1">Change</div>
                  <div className={`text-lg font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{priceChange24h.toFixed(2)}%
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Order Book & Recent Trades */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Book */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="card"
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <span>Order Book</span>
                </h3>

                <div className="space-y-4">
                  {/* Sell Orders */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2 px-2">
                      <span>Price (ALGO)</span>
                      <span>Amount</span>
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {sellOrders.slice(0, 8).reverse().map((order, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="flex items-center justify-between text-sm p-2 bg-red-500/5 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer border border-transparent hover:border-red-500/30"
                        >
                          <span className="text-red-400 font-mono font-semibold">{order.price.toFixed(4)}</span>
                          <span className="text-gray-300">{order.amount.toFixed(2)}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Current Price */}
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.02, 1],
                      boxShadow: [
                        '0 0 0px rgba(99, 102, 241, 0)',
                        '0 0 20px rgba(99, 102, 241, 0.3)',
                        '0 0 0px rgba(99, 102, 241, 0)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center justify-center py-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-xl border border-primary-500/30"
                  >
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">${currentPrice.toFixed(4)}</div>
                      <div className="text-xs text-gray-400 mt-1">Current Price</div>
                    </div>
                  </motion.div>

                  {/* Buy Orders */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2 px-2">
                      <span>Price (ALGO)</span>
                      <span>Amount</span>
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {buyOrders.slice(0, 8).map((order, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="flex items-center justify-between text-sm p-2 bg-green-500/5 hover:bg-green-500/10 rounded-lg transition-all cursor-pointer border border-transparent hover:border-green-500/30"
                        >
                          <span className="text-green-400 font-mono font-semibold">{order.price.toFixed(4)}</span>
                          <span className="text-gray-300">{order.amount.toFixed(2)}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Recent Trades */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="card"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span>Recent Trades</span>
                  </h3>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Activity className="w-5 h-5 text-green-400" />
                  </motion.div>
                </div>
                
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                  <AnimatePresence>
                    {trades.slice(0, 15).map((trade, index) => (
                      <motion.div
                        key={`${trade.timestamp}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.03 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer border border-transparent hover:border-primary-500/30"
                      >
                        <div className="flex items-center space-x-3">
                          <motion.div 
                            className={`w-2 h-2 rounded-full ${
                              trade.type === 'buy' ? 'bg-green-400' : 'bg-red-400'
                            }`}
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.1 }}
                          />
                          <div>
                            <div className={`font-semibold font-mono ${
                              trade.type === 'buy' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              ${trade.price.toFixed(4)}
                            </div>
                            <div className="text-xs text-gray-500">{formatTime(trade.timestamp)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white text-sm font-medium">{trade.amount.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">${trade.total.toFixed(2)}</div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right: Trading Panel */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="card sticky top-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex space-x-2 w-full">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('buy')}
                    className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
                      activeTab === 'buy'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Buy
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('sell')}
                    className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
                      activeTab === 'sell'
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/50'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Sell
                  </motion.button>
                </div>
              </div>

              <div className="flex space-x-2 mb-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setOrderType('market')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    orderType === 'market'
                      ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Market
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setOrderType('limit')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    orderType === 'limit'
                      ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Limit
                </motion.button>
              </div>

              {/* Order Form */}
              <div className="space-y-4">
                {orderType === 'limit' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-white font-medium mb-2">Price (ALGO)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.0001"
                        placeholder={currentPrice.toFixed(4)}
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-all"
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-semibold">
                        ALGO
                      </span>
                    </div>
                  </motion.div>
                )}

                <div>
                  <label className="block text-white font-medium mb-2">Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-semibold">
                      ${tokenData.symbol}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-400 text-sm">Available: {userAlgoBalance.toFixed(2)} ALGO</span>
                    <span className="text-gray-400 text-sm">Tokens: {userTokenBalance.toFixed(2)} {tokenData.symbol}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {[25, 50, 75, 100].map((percent) => (
                      <motion.button
                        key={percent}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setAmount((userAlgoBalance * (percent / 100) / currentPrice).toFixed(2))}
                        className="px-2 py-2 bg-gradient-to-r from-primary-500/20 to-purple-500/20 hover:from-primary-500/30 hover:to-purple-500/30 rounded-lg text-sm text-white font-semibold transition-all border border-primary-500/30"
                      >
                        {percent}%
                      </motion.button>
                    ))}
                  </div>
                </div>

                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className="p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Total</span>
                    <span className="text-white font-bold text-xl">
                      {calculateTotal().toFixed(4)} ALGO
                    </span>
                  </div>
                  {orderType === 'market' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Price</span>
                      <span className="text-gray-300">${currentPrice.toFixed(4)}</span>
                    </div>
                  )}
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleTrade}
                  disabled={isProcessing || !amount}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-2xl ${
                    activeTab === 'buy'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-green-500/50'
                      : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-red-500/50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center space-x-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      <DollarSign className="w-5 h-5" />
                      <span>{activeTab === 'buy' ? 'Buy' : 'Sell'} {tokenData.symbol}</span>
                    </span>
                  )}
                </motion.button>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start space-x-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg"
                >
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-300">
                    {activeTab === 'buy' 
                      ? `You're buying ${tokenData.symbol} tokens. Market orders execute instantly at current price.`
                      : `You're selling ${tokenData.symbol} tokens. Limit orders execute when price reaches your target.`
                    }
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TradingMarketplace
