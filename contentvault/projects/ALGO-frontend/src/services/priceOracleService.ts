/**
 * Price Oracle Service
 * Updates token prices based on YouTube video metrics and market conditions
 */

import { youtubeApi, YouTubeVideo } from './youtubeApi'
import { pricingAlgorithm, TokenMetrics } from './pricingAlgorithm'
import { marketplaceService } from './marketplaceService'
import { algorandService } from './algorandService'

export interface PriceUpdate {
  assetId: number
  videoId: string
  oldPrice: number
  newPrice: number
  priceChange: number
  priceChangePercent: number
  marketCap: number
  volume24h: number
  updatedAt: Date
  factors: {
    viewImpact: number
    likeImpact: number
    subscriberImpact: number
    timeImpact: number
    supplyImpact: number
    demandImpact: number
  }
}

export interface TokenPriceData {
  assetId: number
  videoId: string
  currentPrice: number
  priceChange24h: number
  priceChangePercent: number
  marketCap: number
  volume24h: number
  high24h: number
  low24h: number
  lastUpdated: Date
  nextUpdate: Date
  metrics: {
    views: number
    likes: number
    subscribers: number
    daysSincePublished: number
  }
  // Enhanced fields for better display
  videoTitle?: string
  videoUrl?: string
  displayName?: string
}

class PriceOracleService {
  private updateInterval: number | null = null
  private subscribers: Set<(update: PriceUpdate) => void> = new Set()
  private tokenPrices: Map<number, TokenPriceData> = new Map()
  private updateQueue: Set<number> = new Set()

  /**
   * Start price updates for all tokens
   */
  startPriceUpdates(updateIntervalMs: number = 5 * 60 * 1000): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }

    this.updateInterval = setInterval(async () => {
      await this.updateAllPrices()
    }, updateIntervalMs)

    console.log('Price oracle started with', updateIntervalMs / 1000, 'second intervals')
  }

  /**
   * Stop price updates
   */
  stopPriceUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
    console.log('Price oracle stopped')
  }

  /**
   * Update prices for all tracked tokens
   */
  async updateAllPrices(): Promise<void> {
    try {
      console.log('Updating prices for all tokens...')
      
      // Get all tokens that need price updates
      const tokensToUpdate = Array.from(this.updateQueue)
      
      if (tokensToUpdate.length === 0) {
        console.log('No tokens to update')
        return
      }

      // Update prices in parallel
      const updatePromises = tokensToUpdate.map(assetId => this.updateTokenPrice(assetId))
      await Promise.all(updatePromises)

      // Clear the update queue
      this.updateQueue.clear()

    } catch (error) {
      console.error('Error updating prices:', error)
    }
  }

  /**
   * Update price for a specific token
   */
  async updateTokenPrice(assetId: number): Promise<PriceUpdate | null> {
    try {
      const currentData = this.tokenPrices.get(assetId)
      if (!currentData) {
        console.warn(`No price data found for asset ${assetId}`)
        return null
      }

      // Get fresh video data
      const video = await youtubeApi.getVideoInfo(currentData.videoId)
      
      // Get current token metrics
      const tokenMetrics: TokenMetrics = {
        videoId: video.id,
        views: video.viewCount,
        likes: video.likeCount,
        subscribers: 0, // Would need to fetch channel info
        publishedAt: video.publishedAt,
        totalSupply: 1000000, // Would get from blockchain
        circulatingSupply: 1000000, // Would get from blockchain
        tradingVolume24h: currentData.volume24h,
        holders: 0 // Would get from blockchain
      }

      // Calculate new price
      const priceCalculation = pricingAlgorithm.calculatePrice(tokenMetrics)
      
      const oldPrice = currentData.currentPrice
      const newPrice = priceCalculation.currentPrice
      const priceChange = newPrice - oldPrice
      const priceChangePercent = (priceChange / oldPrice) * 100

      // Create price update
      const priceUpdate: PriceUpdate = {
        assetId,
        videoId: currentData.videoId,
        oldPrice,
        newPrice,
        priceChange,
        priceChangePercent,
        marketCap: priceCalculation.marketCap,
        volume24h: priceCalculation.volume24h,
        updatedAt: new Date(),
        factors: priceCalculation.factors
      }

      // Update stored price data
      this.tokenPrices.set(assetId, {
        ...currentData,
        currentPrice: newPrice,
        priceChange24h: priceChange,
        priceChangePercent,
        marketCap: priceCalculation.marketCap,
        volume24h: priceCalculation.volume24h,
        lastUpdated: new Date(),
        nextUpdate: new Date(Date.now() + 5 * 60 * 1000), // Next update in 5 minutes
        metrics: {
          views: video.viewCount,
          likes: video.likeCount,
          subscribers: 0,
          daysSincePublished: this.getDaysSincePublished(video.publishedAt)
        }
      })

      // Notify subscribers
      this.notifySubscribers(priceUpdate)

      console.log(`Updated price for asset ${assetId}: ${oldPrice} -> ${newPrice} (${priceChangePercent.toFixed(2)}%)`)
      return priceUpdate

    } catch (error) {
      console.error(`Error updating price for asset ${assetId}:`, error)
      return null
    }
  }

  /**
   * Add a token to price tracking
   */
  async addToken(assetId: number, videoId: string): Promise<void> {
    try {
      // Check if token already exists
      if (this.tokenPrices.has(assetId)) {
        console.log(`Token ${assetId} already exists, skipping...`)
        return
      }

      let video
      let tokenMetrics: TokenMetrics

      try {
        // Validate video ID format
        if (!videoId || videoId === 'unknown' || videoId.length < 10) {
          throw new Error(`Invalid video ID: ${videoId}`)
        }
        
        console.log(`Attempting to fetch YouTube data for video ID: ${videoId}`)
        
        // Try to get video data from YouTube
        video = await youtubeApi.getVideoInfo(videoId)
        
        tokenMetrics = {
          videoId: video.id,
          views: video.viewCount,
          likes: video.likeCount,
          subscribers: 0,
          publishedAt: video.publishedAt,
          totalSupply: 1000000,
          circulatingSupply: 1000000,
          tradingVolume24h: 0,
          holders: 0
        }
        
        console.log(`✅ Successfully fetched real YouTube data for ${videoId}:`, {
          views: video.viewCount,
          likes: video.likeCount,
          title: video.title
        })
      } catch (youtubeError) {
        console.error(`❌ Could not fetch YouTube data for video ${videoId}:`, youtubeError)
        
        // Use more realistic default values instead of random ones
        tokenMetrics = {
          videoId: videoId,
          views: 100, // Small default instead of random
          likes: 5,   // Small default instead of random
          subscribers: 0,
          publishedAt: new Date().toISOString(),
          totalSupply: 1000000,
          circulatingSupply: 1000000,
          tradingVolume24h: 0,
          holders: 0
        }
        
        console.log(`Using fallback values for ${videoId}:`, {
          views: tokenMetrics.views,
          likes: tokenMetrics.likes
        })
      }

      const priceCalculation = pricingAlgorithm.calculatePrice(tokenMetrics)

      // Store initial price data
      const priceData: TokenPriceData = {
        assetId,
        videoId,
        currentPrice: priceCalculation.currentPrice,
        priceChange24h: 0,
        priceChangePercent: 0,
        marketCap: priceCalculation.marketCap,
        volume24h: 0,
        high24h: priceCalculation.currentPrice,
        low24h: priceCalculation.currentPrice,
        lastUpdated: new Date(),
        nextUpdate: new Date(Date.now() + 5 * 60 * 1000),
        metrics: {
          views: tokenMetrics.views,
          likes: tokenMetrics.likes,
          subscribers: tokenMetrics.subscribers,
          daysSincePublished: this.getDaysSincePublished(tokenMetrics.publishedAt)
        }
      }

      this.tokenPrices.set(assetId, priceData)
      this.updateQueue.add(assetId)

      console.log(`Added token ${assetId} to price tracking with real data:`, {
        views: tokenMetrics.views,
        likes: tokenMetrics.likes,
        price: priceCalculation.currentPrice
      })

    } catch (error) {
      console.error(`Error adding token ${assetId} to price tracking:`, error)
    }
  }

  /**
   * Remove a token from price tracking
   */
  removeToken(assetId: number): void {
    this.tokenPrices.delete(assetId)
    this.updateQueue.delete(assetId)
    console.log(`Removed token ${assetId} from price tracking`)
  }

  /**
   * Clear all tokens from price tracking
   */
  clearAllTokens(): void {
    this.tokenPrices.clear()
    this.updateQueue.clear()
    console.log('Cleared all tokens from price tracking')
  }

  /**
   * Get current price data for a token
   */
  getTokenPrice(assetId: number): TokenPriceData | null {
    return this.tokenPrices.get(assetId) || null
  }

  /**
   * Get all tracked token prices
   */
  getAllTokenPrices(): TokenPriceData[] {
    return Array.from(this.tokenPrices.values())
  }

  /**
   * Subscribe to price updates
   */
  subscribe(callback: (update: PriceUpdate) => void): () => void {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  /**
   * Notify all subscribers of price updates
   */
  private notifySubscribers(update: PriceUpdate): void {
    this.subscribers.forEach(callback => {
      try {
        callback(update)
      } catch (error) {
        console.error('Error in price update subscriber:', error)
      }
    })
  }

  /**
   * Get days since video was published
   */
  private getDaysSincePublished(publishedAt: string): number {
    const published = new Date(publishedAt)
    const now = new Date()
    return (now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24)
  }

  /**
   * Get price history for a token
   */
  getPriceHistory(assetId: number, days: number = 30): Array<{ date: Date; price: number; volume: number }> {
    return pricingAlgorithm.getPriceHistory(assetId, days)
  }

  /**
   * Force update for a specific token
   */
  async forceUpdate(assetId: number): Promise<PriceUpdate | null> {
    this.updateQueue.add(assetId)
    return await this.updateTokenPrice(assetId)
  }

  /**
   * Get price statistics
   */
  getPriceStatistics(): {
    totalTokens: number
    averagePrice: number
    totalMarketCap: number
    topGainer: TokenPriceData | null
    topLoser: TokenPriceData | null
  } {
    const allPrices = this.getAllTokenPrices()
    
    if (allPrices.length === 0) {
      return {
        totalTokens: 0,
        averagePrice: 0,
        totalMarketCap: 0,
        topGainer: null,
        topLoser: null
      }
    }

    const averagePrice = allPrices.reduce((sum, token) => sum + token.currentPrice, 0) / allPrices.length
    const totalMarketCap = allPrices.reduce((sum, token) => sum + token.marketCap, 0)
    
    const sortedByChange = [...allPrices].sort((a, b) => b.priceChangePercent - a.priceChangePercent)
    const topGainer = sortedByChange[0]
    const topLoser = sortedByChange[sortedByChange.length - 1]

    return {
      totalTokens: allPrices.length,
      averagePrice: Math.round(averagePrice),
      totalMarketCap: Math.round(totalMarketCap),
      topGainer,
      topLoser
    }
  }
}

export const priceOracleService = new PriceOracleService()
