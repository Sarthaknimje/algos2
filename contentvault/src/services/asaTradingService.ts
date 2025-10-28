/**
 * ASA Trading Service
 * Handles real ASA data fetching and trading operations
 */

import { algorandService } from './algorandService'
import { pythonBackendService } from './pythonBackendService'

export interface ASAToken {
  assetId: number
  name: string
  unitName: string
  decimals: number
  totalSupply: number
  creator: string
  url: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  balance?: number
  isUserCreated?: boolean
}

export interface TradingPair {
  base: ASAToken
  quote: ASAToken
  price: number
  change24h: number
  volume24h: number
}

export interface OrderBookEntry {
  price: number
  amount: number
  total: number
}

export interface OrderBook {
  bids: OrderBookEntry[]
  asks: OrderBookEntry[]
}

class ASATradingService {
  private cache: Map<number, ASAToken> = new Map()
  private priceCache: Map<number, { price: number; timestamp: number }> = new Map()
  private CACHE_DURATION = 30000 // 30 seconds

  /**
   * Get all ASAs from user's account and popular tokens
   */
  async getAllASAs(userAddress?: string): Promise<ASAToken[]> {
    try {
      const asas: ASAToken[] = []
      
      // Get user's ASAs if address provided
      if (userAddress) {
        try {
          const userAssets = await algorandService.getAssetBalances(userAddress)
          for (const asset of userAssets) {
            if (asset.assetId > 0) { // Skip ALGO (assetId 0)
              const asa = await this.getASADetails(asset.assetId, asset.amount, true)
              asas.push(asa)
            }
          }
        } catch (error) {
          console.warn('Failed to fetch user assets:', error)
        }
      }

      // Add popular ASAs (you can expand this list)
      const popularASAs = [
        31566704, // USDC
        312769,   // USDT
        27165954, // PLANET
        27165955, // ALGO
      ]

      for (const assetId of popularASAs) {
        if (!asas.find(asa => asa.assetId === assetId)) {
          try {
            const asa = await this.getASADetails(assetId, 0, false)
            asas.push(asa)
          } catch (error) {
            console.warn(`Failed to fetch ASA ${assetId}:`, error)
          }
        }
      }

      // If no ASAs found, return sample data for demonstration
      if (asas.length === 0) {
        return this.getSampleASAs()
      }

      return asas
    } catch (error) {
      console.error('Error fetching ASAs:', error)
      // Return sample data as fallback
      return this.getSampleASAs()
    }
  }

  /**
   * Get sample ASAs for demonstration when backend is not available
   */
  private getSampleASAs(): ASAToken[] {
    return [
      {
        assetId: 123456789,
        name: 'Gaming Video Token',
        unitName: 'GAME',
        decimals: 6,
        totalSupply: 1000000,
        creator: 'YA3D4DV63WMLPR4NUGHI7MTD2LHELEXLLIMNH2PUKCJNGCGVXH7KZC3TYM',
        url: 'https://socialcoin.app/video/sample1',
        price: 1.25,
        change24h: 5.2,
        volume24h: 1200000,
        marketCap: 15600000,
        balance: 0,
        isUserCreated: false
      },
      {
        assetId: 987654321,
        name: 'Tech Tutorial Token',
        unitName: 'TECH',
        decimals: 6,
        totalSupply: 500000,
        creator: 'YA3D4DV63WMLPR4NUGHI7MTD2LHELEXLLIMNH2PUKCJNGCGVXH7KZC3TYM',
        url: 'https://socialcoin.app/video/sample2',
        price: 0.85,
        change24h: -2.1,
        volume24h: 890000,
        marketCap: 8900000,
        balance: 1500,
        isUserCreated: true
      },
      {
        assetId: 456789123,
        name: 'Music Video Token',
        unitName: 'MUSIC',
        decimals: 6,
        totalSupply: 2000000,
        creator: 'YA3D4DV63WMLPR4NUGHI7MTD2LHELEXLLIMNH2PUKCJNGCGVXH7KZC3TYM',
        url: 'https://socialcoin.app/video/sample3',
        price: 2.15,
        change24h: 12.5,
        volume24h: 2100000,
        marketCap: 32100000,
        balance: 750,
        isUserCreated: true
      },
      {
        assetId: 0,
        name: 'Algorand',
        unitName: 'ALGO',
        decimals: 6,
        totalSupply: 10000000000,
        creator: 'Algorand Foundation',
        url: 'https://algorand.com',
        price: 0.18,
        change24h: 3.2,
        volume24h: 45200000,
        marketCap: 1200000000,
        balance: 100,
        isUserCreated: false
      },
      {
        assetId: 789123456,
        name: 'Digital Art Token',
        unitName: 'ART',
        decimals: 6,
        totalSupply: 1000000,
        creator: 'YA3D4DV63WMLPR4NUGHI7MTD2LHELEXLLIMNH2PUKCJNGCGVXH7KZC3TYM',
        url: 'https://socialcoin.app/video/sample4',
        price: 0.45,
        change24h: -8.3,
        volume24h: 340000,
        marketCap: 2100000,
        balance: 0,
        isUserCreated: false
      },
      {
        assetId: 321654987,
        name: 'Education Token',
        unitName: 'EDU',
        decimals: 6,
        totalSupply: 5000000,
        creator: 'YA3D4DV63WMLPR4NUGHI7MTD2LHELEXLLIMNH2PUKCJNGCGVXH7KZC3TYM',
        url: 'https://socialcoin.app/video/sample5',
        price: 3.20,
        change24h: 15.7,
        volume24h: 1800000,
        marketCap: 25400000,
        balance: 0,
        isUserCreated: false
      }
    ]
  }

  /**
   * Get detailed ASA information
   */
  async getASADetails(assetId: number, balance: number = 0, isUserCreated: boolean = false): Promise<ASAToken> {
    try {
      // Check cache first
      if (this.cache.has(assetId)) {
        const cached = this.cache.get(assetId)!
        return { ...cached, balance, isUserCreated }
      }

      // Get asset info from Algorand
      const assetInfo = await algorandService.getAssetInfo(assetId)
      
      // Get price data (mock for now - integrate with real price feeds)
      const priceData = await this.getPriceData(assetId)
      
      const asa: ASAToken = {
        assetId,
        name: assetInfo.params.name || 'Unknown',
        unitName: assetInfo.params.unitName || 'UNK',
        decimals: assetInfo.params.decimals || 0,
        totalSupply: Number(assetInfo.params.total) || 0,
        creator: assetInfo.params.creator,
        url: assetInfo.params.url || '',
        price: priceData.price,
        change24h: priceData.change24h,
        volume24h: priceData.volume24h,
        marketCap: priceData.marketCap,
        balance,
        isUserCreated
      }

      // Cache the result
      this.cache.set(assetId, asa)
      
      return asa
    } catch (error) {
      console.error(`Error fetching ASA details for ${assetId}:`, error)
      
      // Return a fallback ASA with basic info
      const fallbackASA: ASAToken = {
        assetId,
        name: `ASA ${assetId}`,
        unitName: 'UNK',
        decimals: 6,
        totalSupply: 1000000,
        creator: 'Unknown',
        url: '',
        price: Math.random() * 10 + 0.01,
        change24h: (Math.random() - 0.5) * 20,
        volume24h: Math.random() * 1000000,
        marketCap: Math.random() * 10000000,
        balance,
        isUserCreated
      }
      
      return fallbackASA
    }
  }

  /**
   * Get price data for an ASA (mock implementation - replace with real price feeds)
   */
  private async getPriceData(assetId: number): Promise<{
    price: number
    change24h: number
    volume24h: number
    marketCap: number
  }> {
    // Check price cache
    const cached = this.priceCache.get(assetId)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return {
        price: cached.price,
        change24h: (Math.random() - 0.5) * 20, // Mock change
        volume24h: Math.random() * 1000000,
        marketCap: cached.price * 1000000
      }
    }

    // Mock price data (replace with real price feeds like CoinGecko, etc.)
    const basePrice = Math.random() * 10 + 0.01
    const price = parseFloat(basePrice.toFixed(6))
    
    // Cache the price
    this.priceCache.set(assetId, { price, timestamp: Date.now() })

    return {
      price,
      change24h: (Math.random() - 0.5) * 20,
      volume24h: Math.random() * 1000000,
      marketCap: price * 1000000
    }
  }

  /**
   * Get order book for a trading pair (mock implementation)
   */
  async getOrderBook(baseAssetId: number, quoteAssetId: number): Promise<OrderBook> {
    // Mock order book data - replace with real order book from DEX
    const basePrice = this.priceCache.get(baseAssetId)?.price || 1
    const spread = basePrice * 0.01 // 1% spread
    
    const bids: OrderBookEntry[] = []
    const asks: OrderBookEntry[] = []
    
    // Generate mock order book
    for (let i = 0; i < 10; i++) {
      const bidPrice = basePrice - (spread * (i + 1))
      const askPrice = basePrice + (spread * (i + 1))
      const amount = Math.random() * 1000
      
      bids.push({
        price: parseFloat(bidPrice.toFixed(6)),
        amount: parseFloat(amount.toFixed(2)),
        total: parseFloat((bidPrice * amount).toFixed(2))
      })
      
      asks.push({
        price: parseFloat(askPrice.toFixed(6)),
        amount: parseFloat(amount.toFixed(2)),
        total: parseFloat((askPrice * amount).toFixed(2))
      })
    }
    
    return { bids, asks }
  }

  /**
   * Get trading pairs
   */
  async getTradingPairs(): Promise<TradingPair[]> {
    try {
      const asas = await this.getAllASAs()
      const algo = asas.find(asa => asa.assetId === 0) || {
        assetId: 0,
        name: 'Algorand',
        unitName: 'ALGO',
        decimals: 6,
        totalSupply: 10000000000,
        creator: 'Algorand Foundation',
        url: '',
        price: 0.18,
        change24h: 0,
        volume24h: 0,
        marketCap: 0
      }

      const pairs: TradingPair[] = []
      
      for (const asa of asas) {
        if (asa.assetId !== 0) {
          pairs.push({
            base: asa,
            quote: algo,
            price: asa.price,
            change24h: asa.change24h,
            volume24h: asa.volume24h
          })
        }
      }
      
      return pairs
    } catch (error) {
      console.error('Error fetching trading pairs:', error)
      return []
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
    this.priceCache.clear()
  }
}

export const asaTradingService = new ASATradingService()
export default asaTradingService
