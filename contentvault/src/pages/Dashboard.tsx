import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  BarChart3,
  Rocket,
  Eye,
  Heart,
  Share2,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Award,
  Trophy,
  Activity,
  Clock,
  Target,
  Wallet,
  Coins,
  LineChart,
  PieChart,
  TrendingUp as TrendingUpIcon,
  Bell,
  Search,
  Filter,
  Star,
  Flame,
  Crown
} from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'
import { InstagramIcon, TwitterIcon, LinkedInIcon, YouTubeIcon } from '../assets/icons'
import SVGBackground from '../components/SVGBackground'
import PremiumBackground from '../components/PremiumBackground'

interface Token {
  asa_id: number
  token_name: string
  token_symbol: string
  current_price: number
  price_change_24h: number
  market_cap: number
  volume_24h: number
  holders: number
  platform?: string
  content_thumbnail?: string
  content_url?: string
}

interface PortfolioStats {
  totalValue: number
  totalProfit: number
  profitPercentage: number
  tokensOwned: number
  totalInvested: number
}

const Dashboard: React.FC = () => {
  const { isConnected, address, balance } = useWallet()
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'trending' | 'activity'>('overview')
  const [tokens, setTokens] = useState<Token[]>([])
  const [trendingTokens, setTrendingTokens] = useState<Token[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioStats>({
    totalValue: 0,
    totalProfit: 0,
    profitPercentage: 0,
    tokensOwned: 0,
    totalInvested: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | 'all'>('24h')

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [address, isConnected])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch all tokens
      const tokensResponse = await fetch('http://localhost:5001/tokens')
      
      if (!tokensResponse.ok) {
        throw new Error(`HTTP error! status: ${tokensResponse.status}`)
      }
      
      const tokensData = await tokensResponse.json()
      
      if (tokensData.success) {
        const allTokens = tokensData.tokens || []
        setTokens(allTokens)
        
        // Get trending tokens (top gainers)
        const trending = [...allTokens]
          .sort((a, b) => (b.price_change_24h || 0) - (a.price_change_24h || 0))
          .slice(0, 10)
        setTrendingTokens(trending)
        
        // Fetch real analytics for each token
        const tokensWithAnalytics = await Promise.all(
          allTokens.map(async (token: Token) => {
            try {
              // Fetch trade history for volume calculation
              const tradesResponse = await fetch(`http://localhost:5001/api/trades/${token.asa_id}?timeframe=24h&limit=100`)
              if (tradesResponse.ok) {
                const tradesData = await tradesResponse.json()
                if (tradesData.success && tradesData.trades) {
                  // Calculate real 24h volume
                  const volume24h = tradesData.trades.reduce((sum: number, trade: any) => {
                    return sum + (trade.amount * trade.price)
                  }, 0)
                  
                  return {
                    ...token,
                    volume_24h: volume24h || token.volume_24h || 0,
                    trade_count_24h: tradesData.trades.length
                  }
                }
              }
            } catch (error) {
              console.warn(`Failed to fetch analytics for token ${token.asa_id}:`, error)
            }
            return token
          })
        )
        
        setTokens(tokensWithAnalytics)
        
        // Calculate portfolio if wallet connected
        if (isConnected && address) {
          calculatePortfolio(tokensWithAnalytics)
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculatePortfolio = async (allTokens: Token[]) => {
    try {
      // This would fetch user's token balances from Algorand
      // For now, using mock data
      let totalValue = 0
      let totalInvested = 0
      let tokensOwned = 0
      
      // In real implementation, fetch balances from Algorand
      allTokens.forEach(token => {
        // Mock: user owns some tokens
        const mockBalance = Math.random() > 0.7 ? Math.floor(Math.random() * 1000) : 0
        if (mockBalance > 0) {
          tokensOwned++
          const value = mockBalance * token.current_price
          totalValue += value
          totalInvested += mockBalance * (token.current_price * 0.9) // Assume bought at 10% lower
        }
      })
      
      const totalProfit = totalValue - totalInvested
      const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0
      
      setPortfolio({
        totalValue,
        totalProfit,
        profitPercentage,
        tokensOwned,
        totalInvested
      })
    } catch (error) {
      console.error('Error calculating portfolio:', error)
    }
  }

  const filteredTokens = tokens.filter(token =>
    token.token_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.token_symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const topGainers = [...filteredTokens]
    .sort((a, b) => (b.price_change_24h || 0) - (a.price_change_24h || 0))
    .slice(0, 5)

  const topLosers = [...filteredTokens]
    .sort((a, b) => (a.price_change_24h || 0) - (b.price_change_24h || 0))
    .slice(0, 5)

  const topVolume = [...filteredTokens]
    .sort((a, b) => (b.volume_24h || 0) - (a.volume_24h || 0))
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8 relative overflow-hidden">
      <PremiumBackground variant="purple" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-4">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-gray-300">Analytics Dashboard</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Your <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Dashboard</span>
              </h1>
              <p className="text-gray-400 text-lg">Your content tokenization command center</p>
            </div>
            <Link to="/tokenize">
              <motion.button
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white font-semibold flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Rocket className="w-5 h-5" />
                <span>Tokenize Content</span>
              </motion.button>
            </Link>
          </div>

          {/* Quick Stats */}
          {isConnected && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border-blue-500/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Portfolio Value</p>
                    <p className="text-2xl font-bold text-white">
                      ${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <Wallet className="w-8 h-8 text-blue-400" />
                </div>
                <div className={`mt-2 text-sm flex items-center space-x-1 ${
                  portfolio.profitPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {portfolio.profitPercentage >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span>{portfolio.profitPercentage.toFixed(2)}%</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="card bg-gradient-to-br from-purple-500/20 to-pink-500/10 border-purple-500/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Tokens Owned</p>
                    <p className="text-2xl font-bold text-white">{portfolio.tokensOwned}</p>
                  </div>
                  <Coins className="w-8 h-8 text-purple-400" />
                </div>
                <p className="mt-2 text-sm text-gray-400">Active positions</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="card bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-green-500/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Total Profit</p>
                    <p className={`text-2xl font-bold ${
                      portfolio.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      ${portfolio.totalProfit >= 0 ? '+' : ''}{portfolio.totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <TrendingUpIcon className="w-8 h-8 text-green-400" />
                </div>
                <p className="mt-2 text-sm text-gray-400">All time</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="card bg-gradient-to-br from-violet-500/20 to-purple-500/10 border-violet-500/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Wallet Balance</p>
                    <p className="text-2xl font-bold text-white">{balance.toFixed(2)} ALGO</p>
                  </div>
                  <Wallet className="w-8 h-8 text-violet-400" />
                </div>
                <p className="mt-2 text-sm text-gray-400">Available</p>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center space-x-2 mb-6 border-b border-white/10">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'portfolio', label: 'My Portfolio', icon: Wallet },
            { id: 'trending', label: 'Trending', icon: Flame },
            { id: 'activity', label: 'Activity', icon: Activity }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Search and Filters */}
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tokens..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value as any)}
                  className="px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="24h">24h</option>
                  <option value="7d">7d</option>
                  <option value="30d">30d</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              {/* Top Gainers & Losers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Gainers */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                      <TrendingUp className="w-6 h-6 text-green-400" />
                      <span>Top Gainers</span>
                    </h3>
                    <Flame className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="space-y-3">
                    {topGainers.map((token, index) => (
                      <Link
                        key={token.asa_id}
                        to={`/trade/${token.token_symbol}`}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-semibold">{token.token_symbol}</p>
                            <p className="text-gray-400 text-sm truncate max-w-[120px]" title={token.token_name}>{token.token_name}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-green-400 font-bold">+{token.price_change_24h?.toFixed(2)}%</p>
                          <p className="text-gray-400 text-sm">${token.current_price.toFixed(4)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Top Losers */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                      <TrendingDown className="w-6 h-6 text-red-400" />
                      <span>Top Losers</span>
                    </h3>
                    <Activity className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="space-y-3">
                    {topLosers.map((token, index) => (
                      <Link
                        key={token.asa_id}
                        to={`/trade/${token.token_symbol}`}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-semibold">{token.token_symbol}</p>
                            <p className="text-gray-400 text-sm truncate max-w-[120px]" title={token.token_name}>{token.token_name}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-red-400 font-bold">{token.price_change_24h?.toFixed(2)}%</p>
                          <p className="text-gray-400 text-sm">${token.current_price.toFixed(4)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* All Tokens Grid */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">All Tokens</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm">{filteredTokens.length} tokens</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTokens.map((token) => (
                    <Link
                      key={token.asa_id}
                      to={`/trade/${token.token_symbol?.trim() || token.token_symbol}`}
                      className="card hover:scale-105 transition-all group"
                    >
                      {token.content_thumbnail && (
                        <div className="relative h-32 mb-4 rounded-lg overflow-hidden">
                          <img
                            src={token.content_thumbnail}
                            alt={token.token_name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute top-2 right-2">
                            {token.platform === 'youtube' && <YouTubeIcon className="w-5 h-5 text-red-500 bg-white rounded p-1" />}
                            {token.platform === 'instagram' && <InstagramIcon className="w-5 h-5 text-pink-500 bg-white rounded p-1" />}
                            {token.platform === 'twitter' && <TwitterIcon className="w-5 h-5 text-blue-400 bg-white rounded p-1" />}
                            {token.platform === 'linkedin' && <LinkedInIcon className="w-5 h-5 text-blue-600 bg-white rounded p-1" />}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-white font-bold">{token.token_symbol}</h4>
                          <p className="text-gray-400 text-sm truncate" title={token.token_name}>{token.token_name}</p>
                        </div>
                        <div className={`text-right ${
                          (token.price_change_24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          <p className="font-bold">
                            {(token.price_change_24h || 0) >= 0 ? '+' : ''}{token.price_change_24h?.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Price</span>
                        <span className="text-white font-semibold">${token.current_price.toFixed(4)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-400">Market Cap</span>
                        <span className="text-white">${(token.market_cap / 1000).toFixed(1)}K</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'portfolio' && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {!isConnected ? (
                <div className="card text-center py-20">
                  <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h3>
                  <p className="text-gray-400 mb-6">Connect your Pera Wallet to view your portfolio</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card bg-gradient-to-br from-blue-500/20 to-cyan-500/10">
                      <p className="text-gray-400 text-sm mb-2">Total Value</p>
                      <p className="text-3xl font-bold text-white">${portfolio.totalValue.toLocaleString()}</p>
                    </div>
                    <div className="card bg-gradient-to-br from-green-500/20 to-emerald-500/10">
                      <p className="text-gray-400 text-sm mb-2">Total Profit</p>
                      <p className={`text-3xl font-bold ${
                        portfolio.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ${portfolio.totalProfit >= 0 ? '+' : ''}{portfolio.totalProfit.toLocaleString()}
                      </p>
                    </div>
                    <div className="card bg-gradient-to-br from-purple-500/20 to-pink-500/10">
                      <p className="text-gray-400 text-sm mb-2">Tokens Owned</p>
                      <p className="text-3xl font-bold text-white">{portfolio.tokensOwned}</p>
                    </div>
                  </div>
                  <div className="card">
                    <h3 className="text-xl font-bold text-white mb-4">Your Holdings</h3>
                    <p className="text-gray-400 text-center py-10">Portfolio tracking coming soon...</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'trending' && (
            <motion.div
              key="trending"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingTokens.map((token, index) => (
                  <Link
                    key={token.asa_id}
                    to={`/trade/${token.token_symbol}`}
                    className="card hover:scale-105 transition-all relative overflow-hidden group"
                  >
                    <div className="absolute top-2 right-2">
                      {index < 3 && (
                        <div className="w-8 h-8 bg-gradient-to-r from-violet-400 to-fuchsia-500 rounded-full flex items-center justify-center">
                          <Crown className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    {token.content_thumbnail && (
                      <div className="h-40 mb-4 rounded-lg overflow-hidden">
                        <img
                          src={token.content_thumbnail}
                          alt={token.token_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-white font-bold text-lg">{token.token_symbol}</h4>
                        <p className="text-gray-400 text-sm">{token.token_name}</p>
                      </div>
                      <div className={`text-right ${
                        (token.price_change_24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        <p className="font-bold text-lg">
                          {(token.price_change_24h || 0) >= 0 ? '+' : ''}{token.price_change_24h?.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Price</span>
                      <span className="text-white font-semibold">${token.current_price.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-gray-400">Volume 24h</span>
                      <span className="text-white">${(token.volume_24h / 1000).toFixed(1)}K</span>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="card">
                <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                <p className="text-gray-400 text-center py-10">Activity feed coming soon...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Dashboard

