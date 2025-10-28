/**
 * Trading Marketplace Component
 * Public marketplace for buying and selling video tokens
 */

import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  DollarSign,
  Users,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Filter,
  Search,
  Star,
  Eye,
  Heart,
  Play,
  ExternalLink,
  Zap,
  Target,
  TrendingUp as TrendingUpIcon,
  Volume2,
  Percent,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Sparkles,
  Globe
} from 'lucide-react'
import { marketplaceService, MarketData, TradingOrder } from '../services/marketplaceService'
import { priceOracleService, TokenPriceData } from '../services/priceOracleService'
import { tokenStorageService } from '../services/tokenStorageService'
import { usePeraWallet } from '../hooks/usePeraWallet'
import TradingChart from './TradingChart'

interface TradingMarketplaceProps {
  className?: string
}

const TradingMarketplace: React.FC<TradingMarketplaceProps> = ({ className = '' }) => {
  const { isConnected, address } = usePeraWallet()
  const [tokens, setTokens] = useState<TokenPriceData[]>([])
  const [selectedToken, setSelectedToken] = useState<TokenPriceData | null>(null)
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'price' | 'change' | 'volume' | 'marketCap'>('marketCap')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Trading form state
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy')
  const [orderPrice, setOrderPrice] = useState('')
  const [orderQuantity, setOrderQuantity] = useState('')
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)

  useEffect(() => {
    loadTradingTokens()
    startPriceUpdates()
  }, [])

  useEffect(() => {
    if (selectedToken) {
      loadMarketData(selectedToken.assetId)
    }
  }, [selectedToken])

  const loadTradingTokens = async () => {
    try {
      setIsLoading(true)
      
      // Clear all existing tokens to avoid duplicates
      priceOracleService.clearAllTokens()
      
      // Get all actually minted tokens from the platform
      const allMintedTokens = tokenStorageService.getStoredTokens()
      console.log('Found minted tokens:', allMintedTokens.length)
      console.log('Stored token details:', allMintedTokens.map(token => ({
        assetId: token.assetId,
        videoId: token.videoId,
        videoTitle: token.videoTitle,
        videoUrl: token.videoUrl
      })))
      
      if (allMintedTokens.length === 0) {
        console.log('No minted tokens found on the platform')
        setTokens([])
        return
      }
      
      // Create enhanced token data with video titles
      const enhancedTokens: TokenPriceData[] = []
      
      // Add all minted tokens to price oracle with real YouTube data
      for (const storedToken of allMintedTokens) {
        try {
          // Extract video ID from the stored token data with better parsing
          let videoId: string | null = storedToken.videoId
          
          // If videoId is not available, try to extract from videoUrl
          if (!videoId && storedToken.videoUrl) {
            const urlMatch = storedToken.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
            videoId = urlMatch ? urlMatch[1] : null
          }
          
          // If still no videoId, skip this token
          if (!videoId || videoId === 'unknown') {
            console.warn(`Skipping token ${storedToken.assetId} - no valid video ID found:`, {
              videoId: storedToken.videoId,
              videoUrl: storedToken.videoUrl
            })
            continue
          }
          
          console.log(`Adding token ${storedToken.assetId} with video ID: ${videoId}`)
          
          await priceOracleService.addToken(storedToken.assetId, videoId)
          // Force update to get fresh YouTube data
          await priceOracleService.forceUpdate(storedToken.assetId)
          
          console.log(`✅ Successfully added token ${storedToken.assetId} for video ${videoId}`)
        } catch (error) {
          console.error(`❌ Could not add token ${storedToken.assetId}:`, error)
        }
      }
      
      // Get all tracked token prices and enhance with stored token data
      const tokenPrices = priceOracleService.getAllTokenPrices()
      
      // Track unique video IDs to prevent duplicates
      const seenVideoIds = new Set<string>()
      const seenAssetIds = new Set<number>()
      
      for (const tokenPrice of tokenPrices) {
        // Skip if we've already processed this asset ID
        if (seenAssetIds.has(tokenPrice.assetId)) {
          console.log(`Skipping duplicate asset ID: ${tokenPrice.assetId}`)
          continue
        }
        
        // Find the corresponding stored token data
        const storedToken = allMintedTokens.find(st => st.assetId === tokenPrice.assetId)
        
        if (storedToken) {
          // Check for duplicate video IDs
          const videoId = storedToken.videoId || tokenPrice.videoId
          if (seenVideoIds.has(videoId)) {
            console.log(`Skipping duplicate video ID: ${videoId} for asset ${tokenPrice.assetId}`)
            continue
          }
          
          seenVideoIds.add(videoId)
          seenAssetIds.add(tokenPrice.assetId)
          
          // Create enhanced token with video title and use stored YouTube metrics
          const enhancedToken: TokenPriceData = {
            ...tokenPrice,
            videoTitle: storedToken.videoTitle || 'Unknown Video',
            videoUrl: storedToken.videoUrl || `https://youtube.com/watch?v=${tokenPrice.videoId}`,
            // Override the videoId display with title for better UX
            displayName: storedToken.videoTitle || tokenPrice.videoId,
            // Use stored YouTube metrics from when token was created (real data)
            metrics: {
              views: storedToken.views || tokenPrice.metrics.views,
              likes: storedToken.likes || tokenPrice.metrics.likes,
              subscribers: storedToken.subscribers || tokenPrice.metrics.subscribers,
              daysSincePublished: storedToken.publishedAt ? 
                Math.floor((Date.now() - new Date(storedToken.publishedAt).getTime()) / (1000 * 60 * 60 * 24)) : 
                tokenPrice.metrics.daysSincePublished
            }
          }
          enhancedTokens.push(enhancedToken)
        } else {
          // Fallback to original token data
          seenAssetIds.add(tokenPrice.assetId)
          enhancedTokens.push(tokenPrice)
        }
      }
      
      setTokens(enhancedTokens)
      
      if (enhancedTokens.length > 0) {
        setSelectedToken(enhancedTokens[0])
      }
    } catch (error) {
      console.error('Error loading trading tokens:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMarketData = async (assetId: number) => {
    try {
      const data = await marketplaceService.getMarketData(assetId)
      setMarketData(data)
    } catch (error) {
      console.error('Error loading market data:', error)
    }
  }

  const startPriceUpdates = () => {
    // Subscribe to price updates
    const unsubscribe = priceOracleService.subscribe((update) => {
      setTokens(prevTokens => 
        prevTokens.map(token => 
          token.assetId === update.assetId 
            ? { ...token, currentPrice: update.newPrice, priceChange24h: update.priceChange, priceChangePercent: update.priceChangePercent }
            : token
        )
      )
    })

    // Start price oracle
    priceOracleService.startPriceUpdates()

    return unsubscribe
  }

  const handleSubmitOrder = async () => {
    if (!selectedToken || !address) return

    try {
      setIsSubmittingOrder(true)
      
      const price = parseFloat(orderPrice)
      const quantity = parseFloat(orderQuantity)

      if (isNaN(price) || isNaN(quantity) || price <= 0 || quantity <= 0) {
        alert('Please enter valid price and quantity')
        return
      }

      if (orderType === 'buy') {
        await marketplaceService.createBuyOrder(selectedToken.assetId, price, quantity, address)
      } else {
        await marketplaceService.createSellOrder(selectedToken.assetId, price, quantity, address)
      }

      // Reset form
      setOrderPrice('')
      setOrderQuantity('')
      
      // Reload market data
      await loadMarketData(selectedToken.assetId)
      
      alert(`${orderType === 'buy' ? 'Buy' : 'Sell'} order created successfully!`)
    } catch (error) {
      console.error('Error submitting order:', error)
      alert(`Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  const filteredTokens = tokens
    .filter(token => 
      (token.displayName || token.videoTitle || token.videoId).toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.assetId.toString().includes(searchQuery)
    )
    .sort((a, b) => {
      let aValue: number, bValue: number
      
      switch (sortBy) {
        case 'price':
          aValue = a.currentPrice
          bValue = b.currentPrice
          break
        case 'change':
          aValue = a.priceChangePercent
          bValue = b.priceChangePercent
          break
        case 'volume':
          aValue = a.volume24h
          bValue = b.volume24h
          break
        case 'marketCap':
          aValue = a.marketCap
          bValue = b.marketCap
          break
        default:
          aValue = a.marketCap
          bValue = b.marketCap
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading trading data...</p>
        </div>
      </div>
    )
  }

  if (tokens.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Tokens Minted Yet</h3>
          <p className="text-gray-400 mb-4">No video tokens have been minted on the platform yet. Mint some videos to see them here!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={loadTradingTokens}
              className="btn-primary"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <a 
              href="/launchpad"
              className="btn-secondary"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Mint Videos
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-900 ${className}`}>
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-pink-500/20 blur-3xl"></div>
        <div className="relative bg-gradient-to-r from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-yellow-400/20 mx-4 mt-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                  <TrendingUpIcon className="w-6 h-6 text-black" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                  Trading Marketplace
                </h1>
              </div>
              <p className="text-gray-300 text-base md:text-lg mb-6 max-w-2xl">
                Trade video tokens that have been minted on the platform. Prices update based on real YouTube data - views, likes, and engagement metrics.
              </p>
              <div className="flex flex-wrap gap-3 md:gap-4">
                <div className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-xs md:text-sm font-medium">Live Trading</span>
                </div>
                <div className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-xs md:text-sm font-medium">Real YouTube Data</span>
                </div>
                <div className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full">
                  <Target className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 text-xs md:text-sm font-medium">{tokens.length} Tokens Available</span>
                </div>
              </div>
            </div>
            <div className="mt-6 lg:mt-0 flex space-x-3">
              <button 
                onClick={loadTradingTokens}
                className="group relative px-4 md:px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25"
              >
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-4 md:w-5 h-4 md:h-5 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="text-sm md:text-base">Refresh Data</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Token List */}
            <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-2xl">
            <div className="flex flex-col space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Available Tokens</h3>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                <div className="relative group flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search tokens..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  />
                </div>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder]
                    setSortBy(newSortBy)
                    setSortOrder(newSortOrder)
                  }}
                  className="px-4 py-2.5 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                >
                  <option value="marketCap-desc">Market Cap ↓</option>
                  <option value="marketCap-asc">Market Cap ↑</option>
                  <option value="price-desc">Price ↓</option>
                  <option value="price-asc">Price ↑</option>
                  <option value="change-desc">Change ↓</option>
                  <option value="change-asc">Change ↑</option>
                  <option value="volume-desc">Volume ↓</option>
                  <option value="volume-asc">Volume ↑</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#4B5563 #1F2937'
            }}>
              {filteredTokens.map((token, index) => (
                <div
                  key={token.assetId}
                  onClick={() => setSelectedToken(token)}
                  className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                    selectedToken?.assetId === token.assetId
                      ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/50 shadow-lg shadow-blue-500/10'
                      : 'bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30 hover:border-gray-500/50'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-xs">#{token.assetId.toString().slice(-2)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-white truncate">ASA #{token.assetId}</p>
                          <div className="flex items-center space-x-1">
                            <Play className="w-3 h-3 text-gray-400" />
                            <a 
                              href={token.videoUrl || `https://youtube.com/watch?v=${token.videoId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-gray-400 hover:text-blue-400 transition-colors truncate"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {token.displayName || token.videoTitle || token.videoId}
                            </a>
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{token.metrics.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{token.metrics.likes.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-white text-lg">
                        ${(token.currentPrice / 1000000).toFixed(6)}
                      </p>
                      <div className="flex items-center space-x-1">
                        {token.priceChangePercent >= 0 ? (
                          <ArrowUp className="w-3 h-3 text-green-400" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-red-400" />
                        )}
                        <span className={`text-sm font-medium ${
                          token.priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {token.priceChangePercent >= 0 ? '+' : ''}{token.priceChangePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

            {/* Trading Interface */}
            <div className="lg:col-span-3 space-y-6 lg:space-y-8">
          {selectedToken && (
            <>
              {/* Token Details */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 blur-2xl"></div>
                <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-2xl">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                          <span className="text-white font-bold text-xl">#{selectedToken.assetId.toString().slice(-2)}</span>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-1">ASA #{selectedToken.assetId}</h3>
                          <div className="flex items-center space-x-2">
                            <Play className="w-4 h-4 text-gray-400" />
                            <a 
                              href={selectedToken.videoUrl || `https://youtube.com/watch?v=${selectedToken.videoId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-blue-400 transition-colors flex items-center space-x-1"
                            >
                              <span>{selectedToken.displayName || selectedToken.videoTitle || selectedToken.videoId}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-2">
                        ${(selectedToken.currentPrice / 1000000).toFixed(6)}
                      </p>
                      <div className="flex items-center space-x-2">
                        {selectedToken.priceChangePercent >= 0 ? (
                          <div className="flex items-center space-x-1 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                            <ArrowUp className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 font-semibold">
                              +{selectedToken.priceChangePercent.toFixed(2)}%
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                            <ArrowDown className="w-4 h-4 text-red-400" />
                            <span className="text-red-400 font-semibold">
                              {selectedToken.priceChangePercent.toFixed(2)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="group p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-blue-500/50 transition-all duration-300">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <DollarSign className="w-4 h-4 text-blue-400" />
                        </div>
                        <p className="text-sm text-gray-400">Market Cap</p>
                      </div>
                      <p className="text-xl font-bold text-white">
                        ${(selectedToken.marketCap / 1000).toFixed(2)}K
                      </p>
                    </div>
                    <div className="group p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-purple-500/50 transition-all duration-300">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                          <Volume2 className="w-4 h-4 text-purple-400" />
                        </div>
                        <p className="text-sm text-gray-400">24h Volume</p>
                      </div>
                      <p className="text-xl font-bold text-white">
                        ${(selectedToken.volume24h / 1000).toFixed(2)}K
                      </p>
                    </div>
                    <div className="group p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-green-500/50 transition-all duration-300">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <Eye className="w-4 h-4 text-green-400" />
                        </div>
                        <p className="text-sm text-gray-400">Views</p>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {selectedToken.metrics.views.toLocaleString()}
                      </p>
                    </div>
                    <div className="group p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-pink-500/50 transition-all duration-300">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-pink-500/10 rounded-lg">
                          <Heart className="w-4 h-4 text-pink-400" />
                        </div>
                        <p className="text-sm text-gray-400">Likes</p>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {selectedToken.metrics.likes.toLocaleString()}
                      </p>
                    </div>
                   </div>
                 </div>
               </div>

               {/* Trading Chart */}
               <TradingChart
                 tokenId={selectedToken.assetId}
                 currentPrice={selectedToken.currentPrice}
                 priceChange24h={selectedToken.priceChange24h}
                 priceChangePercent={selectedToken.priceChangePercent}
                 className="mb-8"
               />

               {/* Trading Form */}
               {isConnected && (
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 via-blue-600/5 to-purple-600/5 blur-xl"></div>
                  <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-2xl">
                    <div className="flex items-center space-x-3 mb-8">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">Place Order</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Order Type */}
                      <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-300 mb-3">
                          Order Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setOrderType('buy')}
                            className={`group relative p-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                              orderType === 'buy'
                                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/25'
                                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600/50'
                            }`}
                          >
                            <div className="flex items-center justify-center space-x-2">
                              <ArrowUp className="w-5 h-5" />
                              <span>Buy</span>
                            </div>
                            {orderType === 'buy' && (
                              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 rounded-xl blur opacity-20"></div>
                            )}
                          </button>
                          <button
                            onClick={() => setOrderType('sell')}
                            className={`group relative p-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                              orderType === 'sell'
                                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25'
                                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600/50'
                            }`}
                          >
                            <div className="flex items-center justify-center space-x-2">
                              <ArrowDown className="w-5 h-5" />
                              <span>Sell</span>
                            </div>
                            {orderType === 'sell' && (
                              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-xl blur opacity-20"></div>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Price Input */}
                      <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-300 mb-3">
                          Price (microAlgos)
                        </label>
                        <div className="relative group">
                          <DollarSign className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                          <input
                            type="number"
                            value={orderPrice}
                            onChange={(e) => setOrderPrice(e.target.value)}
                            placeholder="Enter price..."
                            className="w-full pl-12 pr-4 py-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                          />
                        </div>
                      </div>

                      {/* Quantity Input */}
                      <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-300 mb-3">
                          Quantity
                        </label>
                        <div className="relative group">
                          <Percent className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                          <input
                            type="number"
                            value={orderQuantity}
                            onChange={(e) => setOrderQuantity(e.target.value)}
                            placeholder="Enter quantity..."
                            className="w-full pl-12 pr-4 py-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-300 mb-3">
                          Execute Order
                        </label>
                        <button
                          onClick={handleSubmitOrder}
                          disabled={isSubmittingOrder || !orderPrice || !orderQuantity}
                          className={`group relative w-full px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed ${
                            orderType === 'buy'
                              ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg shadow-green-500/25'
                              : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/25'
                          } disabled:bg-gray-600 disabled:shadow-none`}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            {isSubmittingOrder ? (
                              <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                              <>
                                <Sparkles className="w-5 h-5" />
                                <span>Place {orderType === 'buy' ? 'Buy' : 'Sell'} Order</span>
                              </>
                            )}
                          </div>
                          {!isSubmittingOrder && (
                            <div className={`absolute inset-0 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${
                              orderType === 'buy' ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-red-600 to-red-700'
                            }`}></div>
                          )}
                        </button>
                      </div>
                    </div>

                    {orderPrice && orderQuantity && (
                      <div className="mt-8 p-6 bg-gradient-to-r from-gray-700/30 to-gray-800/30 rounded-xl border border-gray-600/30">
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                          <BarChart3 className="w-5 h-5" />
                          <span>Order Summary</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-gray-800/50 rounded-lg">
                            <p className="text-sm text-gray-400 mb-1">Total Value</p>
                            <p className="text-xl font-bold text-white">
                              ${((parseFloat(orderPrice) * parseFloat(orderQuantity)) / 1000000).toFixed(6)}
                            </p>
                          </div>
                          <div className="p-4 bg-gray-800/50 rounded-lg">
                            <p className="text-sm text-gray-400 mb-1">Trading Fee</p>
                            <p className="text-xl font-bold text-white">
                              ${(marketplaceService.calculateTradingFees(parseFloat(orderPrice) * parseFloat(orderQuantity), orderType === 'buy') / 1000000).toFixed(6)}
                            </p>
                          </div>
                          <div className="p-4 bg-gray-800/50 rounded-lg">
                            <p className="text-sm text-gray-400 mb-1">Total Cost</p>
                            <p className="text-xl font-bold text-white">
                              ${(((parseFloat(orderPrice) * parseFloat(orderQuantity)) + marketplaceService.calculateTradingFees(parseFloat(orderPrice) * parseFloat(orderQuantity), orderType === 'buy')) / 1000000).toFixed(6)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!isConnected && (
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 blur-xl"></div>
                  <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-12 border border-white/10 shadow-2xl text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Globe className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h3>
                    <p className="text-gray-300 mb-8 max-w-md mx-auto">
                      Connect your wallet to start trading video tokens and access the full marketplace experience.
                    </p>
                    <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5" />
                        <span>Connect Wallet</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TradingMarketplace
