import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  ArrowUpDown, 
  Filter, 
  BarChart3, 
  Activity,
  Search,
  Star,
  Eye,
  EyeOff,
  Settings,
  Wallet,
  Plus,
  Minus
} from 'lucide-react'
import { usePeraWallet } from '../hooks/usePeraWallet'
import { asaTradingService, ASAToken, TradingPair, OrderBook } from '../services/asaTradingService'

const Trading: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState<ASAToken | null>(null)
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([])
  const [userASAs, setUserASAs] = useState<ASAToken[]>([])
  const [allASAs, setAllASAs] = useState<ASAToken[]>([])
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null)
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy')
  const [tradeType, setTradeType] = useState<'market' | 'limit'>('market')
  const [amount, setAmount] = useState('')
  const [price, setPrice] = useState('')
  const [activeTab, setActiveTab] = useState<'trade' | 'tokens' | 'orders'>('trade')
  const [sortBy, setSortBy] = useState<'change' | 'volume' | 'marketCap' | 'price'>('change')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')
  const [showChart, setShowChart] = useState(true)
  const [showFavorites, setShowFavorites] = useState(false)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const { isConnected, address } = usePeraWallet()

  // Load data on component mount
  useEffect(() => {
    loadTradingData()
  }, [address, isConnected])

  // Load order book when selected token changes
  useEffect(() => {
    if (selectedToken) {
      loadOrderBook()
    }
  }, [selectedToken])

  const loadTradingData = async () => {
    try {
      setIsLoading(true)
      
      // Load all ASAs
      const asas = await asaTradingService.getAllASAs(address)
      setAllASAs(asas)
      
      // Separate user ASAs
      const userTokens = asas.filter(asa => asa.isUserCreated)
      setUserASAs(userTokens)
      
      // Load trading pairs
      const pairs = await asaTradingService.getTradingPairs()
      setTradingPairs(pairs)
      
      // Set first token as selected
      if (pairs.length > 0) {
        setSelectedToken(pairs[0].base)
      }
      
    } catch (error) {
      console.error('Error loading trading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadOrderBook = async () => {
    if (!selectedToken) return
    
    try {
      const book = await asaTradingService.getOrderBook(selectedToken.assetId, 0) // ALGO as quote
      setOrderBook(book)
    } catch (error) {
      console.error('Error loading order book:', error)
    }
  }

  const handleTrade = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    if (tradeType === 'limit' && (!price || parseFloat(price) <= 0)) {
      alert('Please enter a valid price for limit order')
      return
    }

    setIsProcessing(true)

    try {
      const tradePrice = tradeType === 'market' ? selectedToken.price : parseFloat(price)
      const tradeAmount = parseFloat(amount)
      
      // Call backend to execute real smart contract trade
      const response = await fetch('http://localhost:5001/trade-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          asa_id: selectedToken.assetId,
          trade_type: orderType, // 'buy' or 'sell'
          amount: Math.floor(tradeAmount), // Convert to integer tokens
          price: tradePrice,
          trader_address: address // Add the user's wallet address
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setAmount('')
        setPrice('')
        
        // Success message with transaction details
        alert(`🎉 ${orderType.toUpperCase()} order executed successfully!\n\n📊 Details:\n• Amount: ${tradeAmount} ${selectedToken.unitName} tokens\n• Price: $${tradePrice.toFixed(4)} ALGO\n• Total: $${(tradePrice * tradeAmount).toFixed(4)} ALGO\n• Transaction ID: ${result.data.transaction_id}\n• Confirmed in round: ${result.data.confirmed_round}\n\n✅ Transaction confirmed on Algorand blockchain!`)
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

  const toggleFavorite = (assetId: number) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(assetId)) {
      newFavorites.delete(assetId)
    } else {
      newFavorites.add(assetId)
    }
    setFavorites(newFavorites)
  }

  // Sort and filter ASAs
  const sortedASAs = [...allASAs].sort((a, b) => {
    let aValue, bValue
    switch (sortBy) {
      case 'change':
        aValue = a.change24h
        bValue = b.change24h
        break
      case 'volume':
        aValue = a.volume24h
        bValue = b.volume24h
        break
      case 'marketCap':
        aValue = a.marketCap
        bValue = b.marketCap
        break
      case 'price':
        aValue = a.price
        bValue = b.price
        break
      default:
        return 0
    }
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
  })

  const filteredASAs = sortedASAs.filter(asa => {
    const matchesSearch = asa.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asa.unitName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFavorites = !showFavorites || favorites.has(asa.assetId)
    return matchesSearch && matchesFavorites
  })

  // Left Sidebar - Token List
  const TokenListSidebar: React.FC = () => (
    <div className="w-80 bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Markets</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`p-2 rounded-lg transition-colors ${
                showFavorites ? 'bg-primary-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Star className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary-500 focus:outline-none"
          >
            <option value="change">24h Change</option>
            <option value="volume">Volume</option>
            <option value="marketCap">Market Cap</option>
            <option value="price">Price</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowUpDown className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Token List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-400">Loading tokens...</div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredASAs.map((asa) => (
              <motion.button
                key={asa.assetId}
                onClick={() => setSelectedToken(asa)}
                className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                  selectedToken?.assetId === asa.assetId
                    ? 'bg-primary-500/20 border border-primary-500/50'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs">{asa.unitName.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white text-sm">{asa.unitName}</span>
                        {asa.isUserCreated && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Yours</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">ASA #{asa.assetId}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">${asa.price.toFixed(6)}</div>
                    <div className={`text-xs ${asa.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {asa.change24h >= 0 ? '+' : ''}{asa.change24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // Trading Chart Component
  const TradingChart: React.FC = () => {
    if (!selectedToken) return null

    const chartData = [
      { time: '00:00', price: selectedToken.price * 0.95 },
      { time: '04:00', price: selectedToken.price * 0.98 },
      { time: '08:00', price: selectedToken.price * 1.02 },
      { time: '12:00', price: selectedToken.price * 1.05 },
      { time: '16:00', price: selectedToken.price * 1.03 },
      { time: '20:00', price: selectedToken.price * 1.01 },
      { time: '24:00', price: selectedToken.price },
    ]

    return (
      <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">{selectedToken.unitName.charAt(0)}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{selectedToken.unitName}</h3>
              <p className="text-gray-400">{selectedToken.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowChart(!showChart)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <BarChart3 className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={loadTradingData}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {showChart && (
          <div className="h-64 bg-white/5 rounded-lg p-4 mb-6">
            <div className="h-full flex items-end justify-between space-x-1">
              {chartData.map((point, index) => {
                const height = (point.price / Math.max(...chartData.map(d => d.price))) * 100
                return (
                  <div key={index} className="flex flex-col items-center space-y-2">
                    <div
                      className="bg-gradient-to-t from-primary-500 to-secondary-500 rounded-t w-8 transition-all duration-500"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-gray-400">{point.time}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Price</div>
            <div className="text-2xl font-bold text-white">${selectedToken.price.toFixed(6)}</div>
            <div className={`flex items-center space-x-1 text-sm ${
              selectedToken.change24h >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {selectedToken.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{selectedToken.change24h >= 0 ? '+' : ''}{selectedToken.change24h.toFixed(2)}%</span>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">24h Volume</div>
            <div className="text-xl font-semibold text-white">${selectedToken.volume24h.toLocaleString()}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Market Cap</div>
            <div className="text-xl font-semibold text-white">${selectedToken.marketCap.toLocaleString()}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">ASA ID</div>
            <div className="text-lg font-semibold text-white">#{selectedToken.assetId}</div>
          </div>
        </div>
      </div>
    )
  }

  // Order Book Component
  const OrderBookComponent: React.FC = () => {
    if (!orderBook) return null

    return (
      <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Order Book</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-green-400 text-sm font-medium mb-2">Bids</div>
            <div className="space-y-1">
              {orderBook.bids.slice(0, 5).map((bid, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-green-400">{bid.price.toFixed(6)}</span>
                  <span className="text-white">{bid.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-red-400 text-sm font-medium mb-2">Asks</div>
            <div className="space-y-1">
              {orderBook.asks.slice(0, 5).map((ask, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-red-400">{ask.price.toFixed(6)}</span>
                  <span className="text-white">{ask.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Trading Interface
  const TradingInterface: React.FC = () => {
    if (!selectedToken) return null

    return (
      <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setOrderType('buy')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              orderType === 'buy'
                ? 'bg-green-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setOrderType('sell')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              orderType === 'sell'
                ? 'bg-red-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Sell
          </button>
        </div>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setTradeType('market')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tradeType === 'market'
                ? 'bg-primary-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Market Order
          </button>
          <button
            onClick={() => setTradeType('limit')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tradeType === 'limit'
                ? 'bg-primary-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Limit Order
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Amount ({selectedToken.unitName})</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
              placeholder="0.00"
            />
          </div>

          {tradeType === 'limit' && (
            <div>
              <label className="block text-gray-400 text-sm mb-2">Price (ALGO)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                placeholder={selectedToken.price.toString()}
              />
            </div>
          )}

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Estimated Total:</span>
              <span className="text-white">
                ${amount && !isNaN(Number(amount)) 
                  ? (Number(amount) * (tradeType === 'limit' && price ? Number(price) : selectedToken.price)).toFixed(6)
                  : '0.000000'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Fee (0.1%):</span>
              <span className="text-white">
                ${amount && !isNaN(Number(amount))
                  ? ((Number(amount) * (tradeType === 'limit' && price ? Number(price) : selectedToken.price)) * 0.001).toFixed(6)
                  : '0.000000'}
              </span>
            </div>
          </div>

          <button
            onClick={handleTrade}
            disabled={!isConnected || !amount || isProcessing}
            className={`w-full py-3 rounded-lg font-semibold transition-all ${
              orderType === 'buy'
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {!isConnected ? 'Connect Wallet' : 
             isProcessing ? 'Processing...' : 
             `${orderType.toUpperCase()} ${selectedToken.unitName}`}
          </button>
        </div>
      </div>
    )
  }

  // My Tokens Component
  const MyTokens: React.FC = () => (
    <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">My Minted Tokens</h3>
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-primary-400" />
          <span className="text-sm text-gray-400">{userASAs.length} tokens</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {userASAs.map((asa) => (
          <div key={asa.assetId} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{asa.unitName.charAt(0)}</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white">{asa.unitName}</span>
                    <span className="text-xs text-gray-400">ASA #{asa.assetId}</span>
                  </div>
                  <div className="text-gray-400 text-sm">{asa.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Creator: {asa.creator.slice(0, 8)}...{asa.creator.slice(-8)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-white">{asa.balance?.toLocaleString() || '0'}</div>
                <div className="text-gray-400 text-sm">${((asa.balance || 0) * asa.price).toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">
                  ${asa.price.toFixed(6)} per token
                </div>
              </div>
            </div>
          </div>
        ))}
        {userASAs.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8" />
            </div>
            <p className="text-lg font-medium mb-2">No tokens found</p>
            <p className="text-sm">Start by minting your first token on the Launchpad!</p>
          </div>
        )}
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading trading data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex">
      {/* Left Sidebar */}
      <TokenListSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Trading Center</h1>
              <p className="text-gray-400">Trade Algorand Standard Assets (ASAs)</p>
            </div>
            <div className="flex items-center space-x-4">
              {isConnected && (
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Wallet className="w-4 h-4" />
                  <span>{address?.slice(0, 8)}...{address?.slice(-8)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trading Content */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Left Column - Chart and Order Book */}
            <div className="lg:col-span-2 space-y-6">
              <TradingChart />
              <OrderBookComponent />
            </div>

            {/* Right Column - Trading Interface and My Tokens */}
            <div className="space-y-6">
              <TradingInterface />
              <MyTokens />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Trading