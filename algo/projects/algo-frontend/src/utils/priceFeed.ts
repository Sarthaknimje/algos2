/**
 * Price feed utilities for real-time cryptocurrency prices
 */

export interface PriceData {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  lastUpdated: number
}

export interface PriceFeedConfig {
  updateInterval: number
  fallbackPrices: { [key: string]: number }
}

class PriceFeedService {
  private prices: Map<string, PriceData> = new Map()
  private config: PriceFeedConfig
  private updateInterval: NodeJS.Timeout | null = null

  constructor(config: PriceFeedConfig) {
    this.config = config
    this.initializePrices()
  }

  private initializePrices() {
    // Initialize with fallback prices
    Object.entries(this.config.fallbackPrices).forEach(([symbol, price]) => {
      this.prices.set(symbol, {
        symbol,
        price,
        change24h: 0,
        volume24h: 0,
        marketCap: 0,
        lastUpdated: Date.now()
      })
    })
  }

  /**
   * Start the price feed service
   */
  start() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }

    this.updateInterval = setInterval(() => {
      this.updatePrices()
    }, this.config.updateInterval)
  }

  /**
   * Stop the price feed service
   */
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  /**
   * Update prices with simulated data
   */
  private updatePrices() {
    const symbols = Array.from(this.prices.keys())
    
    symbols.forEach(symbol => {
      const currentPrice = this.prices.get(symbol)?.price || 0
      const volatility = this.getVolatility(symbol)
      
      // Simulate price movement
      const changePercent = (Math.random() - 0.5) * volatility
      const newPrice = currentPrice * (1 + changePercent / 100)
      
      this.prices.set(symbol, {
        symbol,
        price: Math.max(newPrice, 0.01), // Prevent negative prices
        change24h: changePercent,
        volume24h: Math.random() * 1000000,
        marketCap: Math.random() * 1000000000,
        lastUpdated: Date.now()
      })
    })
  }

  /**
   * Get volatility for different assets
   */
  private getVolatility(symbol: string): number {
    const volatilities: { [key: string]: number } = {
      'BTC': 3.0,
      'ETH': 4.0,
      'ALGO': 2.0,
      'USDC': 0.1,
      'USDT': 0.1,
      'SOL': 5.0,
      'ADA': 3.5,
      'DOT': 4.5,
      'MATIC': 3.0,
      'AVAX': 4.0,
      'LINK': 3.5
    }
    
    return volatilities[symbol] || 2.0
  }

  /**
   * Get current price for a symbol
   */
  getPrice(symbol: string): PriceData | null {
    return this.prices.get(symbol) || null
  }

  /**
   * Get all prices
   */
  getAllPrices(): PriceData[] {
    return Array.from(this.prices.values())
  }

  /**
   * Get price change percentage
   */
  getPriceChange(symbol: string): number {
    const priceData = this.prices.get(symbol)
    return priceData?.change24h || 0
  }

  /**
   * Format price for display
   */
  formatPrice(price: number, symbol: string): string {
    if (symbol === 'BTC') {
      return `$${price.toFixed(2)}`
    } else if (symbol === 'ETH') {
      return `$${price.toFixed(2)}`
    } else if (symbol === 'ALGO') {
      return `$${price.toFixed(4)}`
    } else if (['USDC', 'USDT'].includes(symbol)) {
      return `$${price.toFixed(2)}`
    } else {
      return `$${price.toFixed(2)}`
    }
  }

  /**
   * Get price trend (up, down, neutral)
   */
  getPriceTrend(symbol: string): 'up' | 'down' | 'neutral' {
    const change = this.getPriceChange(symbol)
    
    if (change > 0.5) return 'up'
    if (change < -0.5) return 'down'
    return 'neutral'
  }
}

// Default configuration
const defaultConfig: PriceFeedConfig = {
  updateInterval: 5000, // 5 seconds
  fallbackPrices: {
    'BTC': 43250.00,
    'ETH': 2650.00,
    'ALGO': 0.18,
    'USDC': 1.00,
    'USDT': 1.00,
    'SOL': 98.50,
    'ADA': 0.45,
    'DOT': 6.80,
    'MATIC': 0.85,
    'AVAX': 35.20,
    'LINK': 14.30
  }
}

// Create singleton instance
export const priceFeed = new PriceFeedService(defaultConfig)

// Export types and service
export { PriceFeedService }
export default priceFeed
