import React, { useState, useEffect, useRef } from 'react'
import { priceFeed, PriceData } from '../utils/priceFeed'

interface PriceChartProps {
  symbol: string
  timeRange: '1h' | '4h' | '24h' | '7d'
}

const PriceChart: React.FC<PriceChartProps> = ({ symbol, timeRange }) => {
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [chartData, setChartData] = useState<number[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Get initial price data
    const data = priceFeed.getPrice(symbol)
    setPriceData(data)

    // Generate mock chart data
    generateChartData()

    // Subscribe to price updates
    const interval = setInterval(() => {
      const updatedData = priceFeed.getPrice(symbol)
      setPriceData(updatedData)
      generateChartData()
    }, 5000)

    return () => clearInterval(interval)
  }, [symbol, timeRange])

  const generateChartData = () => {
    // Generate mock historical data
    const dataPoints = timeRange === '1h' ? 12 : timeRange === '4h' ? 24 : timeRange === '24h' ? 24 : 7
    const basePrice = priceData?.price || 100
    const data: number[] = []

    for (let i = 0; i < dataPoints; i++) {
      const variation = (Math.random() - 0.5) * 0.1 // ±5% variation
      const price = basePrice * (1 + variation)
      data.push(Math.max(price, basePrice * 0.5)) // Prevent negative prices
    }

    setChartData(data)
  }

  const drawChart = () => {
    const canvas = canvasRef.current
    if (!canvas || chartData.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Set up chart dimensions
    const padding = 20
    const chartWidth = width - 2 * padding
    const chartHeight = height - 2 * padding

    // Find min and max values
    const minPrice = Math.min(...chartData)
    const maxPrice = Math.max(...chartData)
    const priceRange = maxPrice - minPrice

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Draw price line
    ctx.strokeStyle = priceData?.change24h && priceData.change24h >= 0 ? '#10b981' : '#ef4444'
    ctx.lineWidth = 2
    ctx.beginPath()

    chartData.forEach((price, index) => {
      const x = padding + (chartWidth / (chartData.length - 1)) * index
      const y = height - padding - ((price - minPrice) / priceRange) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw price points
    ctx.fillStyle = priceData?.change24h && priceData.change24h >= 0 ? '#10b981' : '#ef4444'
    chartData.forEach((price, index) => {
      const x = padding + (chartWidth / (chartData.length - 1)) * index
      const y = height - padding - ((price - minPrice) / priceRange) * chartHeight

      ctx.beginPath()
      ctx.arc(x, y, 3, 0, 2 * Math.PI)
      ctx.fill()
    })

    // Draw price labels
    ctx.fillStyle = '#ffffff'
    ctx.font = '12px Arial'
    ctx.textAlign = 'right'
    ctx.fillText(maxPrice.toFixed(2), padding - 5, padding + 15)
    ctx.fillText(minPrice.toFixed(2), padding - 5, height - padding + 15)
  }

  useEffect(() => {
    drawChart()
  }, [chartData, priceData])

  if (!priceData) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white">Loading chart...</p>
      </div>
    )
  }

  const getTrendIcon = () => {
    if (priceData.change24h > 0) return '📈'
    if (priceData.change24h < 0) return '📉'
    return '➡️'
  }

  const getTrendColor = () => {
    if (priceData.change24h > 0) return 'text-green-400'
    if (priceData.change24h < 0) return 'text-red-400'
    return 'text-gray-400'
  }

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">{symbol} Price Chart</h3>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getTrendIcon()}</span>
          <span className={`font-semibold ${getTrendColor()}`}>
            {priceData.change24h > 0 ? '+' : ''}{priceData.change24h.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-3xl font-bold text-white">
          ${priceData.price.toFixed(2)}
        </div>
        <div className="text-gray-300 text-sm">
          Volume: ${priceData.volume24h.toLocaleString()}
        </div>
      </div>

      <div className="mb-4">
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          className="w-full h-48 bg-white bg-opacity-5 rounded-lg"
        />
      </div>

      <div className="flex justify-center space-x-2">
        {['1h', '4h', '24h', '7d'].map((range) => (
          <button
            key={range}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
              timeRange === range
                ? 'bg-yellow-400 text-black'
                : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
            }`}
          >
            {range}
          </button>
        ))}
      </div>
    </div>
  )
}

export default PriceChart
