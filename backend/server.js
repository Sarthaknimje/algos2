import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import mongoose from 'mongoose'
import { connectDB } from './utils/db.js'
import authRoutes from './routes/auth.js'
import trafficRoutes from './routes/traffic.js'
import rewardsRoutes from './routes/rewards.js'
import marketplaceRoutes from './routes/marketplace.js'
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'DriveFi API is running',
    timestamp: new Date().toISOString()
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/traffic', trafficRoutes)
app.use('/api/rewards', rewardsRoutes)
app.use('/api/marketplace', marketplaceRoutes)

// Error handling middleware
app.use(errorHandler)

// Connect to MongoDB and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📡 API available at http://localhost:${PORT}/api`)
    })
  })
  .catch((error) => {
    console.error('❌ Failed to connect to database:', error)
    process.exit(1)
  })

export default app

