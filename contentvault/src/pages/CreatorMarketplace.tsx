import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  BarChart3,
  Star, 
  Award,
  Eye,
  Heart,
  Share2,
  ExternalLink,
  Loader,
  AlertCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWallet } from '../contexts/WalletContext'
import { PeraWalletIcon, YouTubeIcon } from '../assets/icons'

interface CreatorToken {
  asa_id: number
  token_name: string
  token_symbol: string
  total_supply: number
  current_price: number
  market_cap: number
  holders: number
  volume_24h: number
  price_change_24h: number
  creator_address: string
  youtube_channel_title: string
  youtube_subscribers: number
  created_at: string
}

const BACKEND_URL = 'http://localhost:5001'

const CreatorMarketplace: React.FC = () => {
  const { isConnected, address, connectWallet, isLoading } = useWallet()
  
  const [tokens, setTokens] = useState<CreatorToken[]>([])
  const [filteredTokens, setFilteredTokens] = useState<CreatorToken[]>([])
  const [isLoadingTokens, setIsLoadingTokens] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'market_cap' | 'price_change' | 'holders' | 'created_at'>('market_cap')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTokens()
  }, [])

  useEffect(() => {
    filterAndSortTokens()
  }, [tokens, searchQuery, sortBy, sortOrder])

  const fetchTokens = async () => {
    try {
      setIsLoadingTokens(true)
      setError(null)
      
      const response = await fetch(`${BACKEND_URL}/tokens`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch tokens')
      }

      const result = await response.json()
      
      if (result.success) {
        setTokens(result.tokens)
        console.log('✅ Fetched tokens:', result.tokens.length)
      } else {
        throw new Error(result.error || 'Failed to fetch tokens')
      }
    } catch (error: any) {
      console.error('Error fetching tokens:', error)
      setError(error.message)
    } finally {
      setIsLoadingTokens(false)
    }
  }

  const filterAndSortTokens = () => {
    let filtered = [...tokens]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(token => 
        token.token_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.token_symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.youtube_channel_title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort tokens
    filtered.sort((a, b) => {
      let aValue: number
      let bValue: number

    switch (sortBy) {
        case 'market_cap':
          aValue = a.market_cap
          bValue = b.market_cap
        break
        case 'price_change':
          aValue = a.price_change_24h
          bValue = b.price_change_24h
        break
        case 'holders':
          aValue = a.holders
          bValue = b.holders
        break
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
        break
      default:
          aValue = a.market_cap
          bValue = b.market_cap
    }

    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
  })

    setFilteredTokens(filtered)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
    return num.toLocaleString()
  }

  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6)
    if (price < 1) return price.toFixed(4)
    return price.toFixed(2)
  }

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400'
    if (change < 0) return 'text-red-400'
    return 'text-gray-400'
  }

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />
    if (change < 0) return <TrendingDown className="w-4 h-4" />
    return null
  }

  if (isLoadingTokens) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Loader className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Creator Tokens...</h2>
          <p className="text-gray-400">Fetching real tokens from the blockchain</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Tokens</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchTokens}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-bold"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-4">
            Creator Marketplace
              </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            Discover and trade tokens from verified YouTube creators. All tokens are backed by real creator channels.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="card text-center">
            <BarChart3 className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-1">{tokens.length}</div>
            <div className="text-gray-400 text-sm">Active Tokens</div>
        </div>

          <div className="card text-center">
            <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-1">
              ${formatNumber(tokens.reduce((sum, token) => sum + token.market_cap, 0))}
            </div>
            <div className="text-gray-400 text-sm">Total Market Cap</div>
          </div>
          
          <div className="card text-center">
            <Users className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-1">
              {formatNumber(tokens.reduce((sum, token) => sum + token.holders, 0))}
          </div>
            <div className="text-gray-400 text-sm">Total Holders</div>
          </div>
          
          <div className="card text-center">
            <TrendingUp className="w-8 h-8 text-orange-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-1">
              ${formatNumber(tokens.reduce((sum, token) => sum + token.volume_24h, 0))}
            </div>
            <div className="text-gray-400 text-sm">24h Volume</div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tokens, creators, or channels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-primary-500"
              >
                <option value="market_cap">Market Cap</option>
                <option value="price_change">Price Change</option>
                <option value="holders">Holders</option>
                <option value="created_at">Newest</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-colors"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tokens Grid */}
        {filteredTokens.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-12 h-12 text-white" />
        </div>
            <h3 className="text-2xl font-bold text-white mb-4">No Tokens Found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery 
                ? `No tokens match "${searchQuery}". Try a different search term.`
                : "No creator tokens have been launched yet. Be the first to create one!"
              }
            </p>
            {!searchQuery && (
              <Link
                to="/launchpad"
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Star className="w-5 h-5" />
                <span>Launch Your Token</span>
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTokens.map((token, index) => (
              <motion.div
                key={token.asa_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="card hover:border-primary-500/50 transition-all cursor-pointer group"
                    >
                {/* Token Header */}
                <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {token.token_symbol.substring(0, 2)}
                          </div>
                          <div>
                      <h3 className="text-xl font-bold text-white">${token.token_symbol}</h3>
                      <p className="text-gray-400 text-sm">{token.token_name}</p>
        </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">${formatPrice(token.current_price)}</div>
                    <div className={`text-sm flex items-center justify-end space-x-1 ${getPriceChangeColor(token.price_change_24h)}`}>
                      {getPriceChangeIcon(token.price_change_24h)}
                      <span>{token.price_change_24h > 0 ? '+' : ''}{token.price_change_24h.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                {/* Creator Info */}
                <div className="flex items-center space-x-3 mb-4 p-3 bg-white/5 rounded-lg">
                  <YouTubeIcon className="w-5 h-5 text-red-500" />
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{token.youtube_channel_title}</p>
                    <p className="text-gray-400 text-xs">{formatNumber(token.youtube_subscribers)} subscribers</p>
                </div>
              </div>

              {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-lg font-bold text-white">${formatNumber(token.market_cap)}</div>
                    <div className="text-gray-400 text-xs">Market Cap</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-lg font-bold text-white">{formatNumber(token.holders)}</div>
                    <div className="text-gray-400 text-xs">Holders</div>
                  </div>
                  </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Link 
                    to={`/creator/${token.asa_id}`} 
                    className="btn-secondary flex-1 text-sm text-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Link>
                  <Link 
                    to={`/trade/${token.token_symbol}`} 
                    className="btn-primary flex-1 text-sm"
                  >
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Trade
                  </Link>
                  </div>

                {/* ASA ID */}
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>ASA: {token.asa_id}</span>
                    <a 
                      href={`https://testnet.algoexplorer.io/asset/${token.asa_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-400 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
              </div>
            </motion.div>
            ))}
          </div>
        )}

        {/* Launch Token CTA */}
        {tokens.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <div className="card bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Launch Your Token?</h3>
              <p className="text-gray-400 mb-6">
                Connect your YouTube channel and create your own creator token
              </p>
              <Link
                to="/launchpad"
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Star className="w-5 h-5" />
                <span>Launch Your Token</span>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default CreatorMarketplace
