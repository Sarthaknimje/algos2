import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Info } from 'lucide-react'
import { BondingCurveService, BondingCurveConfig } from '../services/bondingCurveService'

interface BondingCurveChartProps {
  config: BondingCurveConfig
  currentSupply: number
  currentPrice: number
  marketCap: number
  height?: number
}

const BondingCurveChart: React.FC<BondingCurveChartProps> = ({
  config,
  currentSupply,
  currentPrice,
  marketCap,
  height = 300
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const chartHeight = height - 60
    const padding = 60

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Generate curve data
    const maxSupply = config.virtualTokenReserve
    const curveData = BondingCurveService.generatePriceCurve(config, maxSupply, 200)

    // Find min/max for scaling
    const maxPrice = Math.max(...curveData.map(d => d.price))
    const minPrice = Math.min(...curveData.map(d => d.price))
    const priceRange = maxPrice - minPrice || 1

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Draw bonding curve
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 3
    ctx.beginPath()

    curveData.forEach((point, index) => {
      const x = padding + ((width - padding * 2) / (curveData.length - 1)) * index
      const y = padding + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Fill area under curve
    const gradient = ctx.createLinearGradient(0, padding, 0, padding + chartHeight)
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)')
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    curveData.forEach((point, index) => {
      const x = padding + ((width - padding * 2) / (curveData.length - 1)) * index
      const y = padding + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, padding + chartHeight)
        ctx.lineTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.lineTo(width - padding, padding + chartHeight)
    ctx.closePath()
    ctx.fill()

    // Draw current position marker
    const currentX = padding + ((width - padding * 2) / maxSupply) * currentSupply
    const currentY = padding + chartHeight - ((currentPrice - minPrice) / priceRange) * chartHeight

    // Draw vertical line at current position
    ctx.strokeStyle = '#10b981'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(currentX, padding)
    ctx.lineTo(currentX, padding + chartHeight)
    ctx.stroke()
    ctx.setLineDash([])

    // Draw current position dot
    ctx.fillStyle = '#10b981'
    ctx.beginPath()
    ctx.arc(currentX, currentY, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.font = '11px Inter'
    ctx.textAlign = 'right'

    // Y-axis labels (prices)
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (priceRange / 5) * (5 - i)
      const y = padding + (chartHeight / 5) * i
      ctx.fillText(`${price.toFixed(6)} ALGO`, padding - 10, y + 4)
    }

    // X-axis labels (supply)
    ctx.textAlign = 'center'
    for (let i = 0; i <= 5; i++) {
      const supply = (maxSupply / 5) * i
      const x = padding + ((width - padding * 2) / 5) * i
      ctx.fillText(`${(supply / 1000).toFixed(0)}K`, x, height - 20)
    }

    // Current position label
    ctx.fillStyle = '#10b981'
    ctx.font = 'bold 12px Inter'
    ctx.textAlign = 'center'
    ctx.fillText('Current', currentX, currentY - 15)
  }, [config, currentSupply, currentPrice, marketCap, height])

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Bonding Curve</h3>
          <p className="text-gray-400 text-sm">Price increases as tokens are bought</p>
        </div>
        <div className="flex items-center space-x-2 text-green-400">
          <TrendingUp className="w-5 h-5" />
          <span className="font-semibold">Active</span>
        </div>
      </div>

      <div className="mb-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-gray-400 text-xs mb-1">Current Price</p>
            <p className="text-white font-bold">{currentPrice.toFixed(6)} ALGO</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Supply</p>
            <p className="text-white font-bold">{(currentSupply / 1000).toFixed(1)}K</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Market Cap</p>
            <p className="text-white font-bold">${(marketCap / 1000).toFixed(1)}K</p>
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={height}
        className="w-full rounded-lg"
      />

      <div className="mt-4 flex items-start space-x-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
        <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-300">
          <p className="font-semibold text-yellow-400 mb-1">How Bonding Curves Work</p>
          <p>As more tokens are purchased, the price increases automatically. When tokens are sold, the price decreases. This creates a fair, automated market without needing order books.</p>
        </div>
      </div>
    </div>
  )
}

export default BondingCurveChart

