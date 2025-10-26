import Reward from '../models/Reward.js'
import User from '../models/User.js'
import Transaction from '../models/Transaction.js'

export const startTracking = async (req, res, next) => {
  try {
    // In a real app, you would store the tracking session
    res.json({
      success: true,
      message: 'Tracking started'
    })
  } catch (error) {
    next(error)
  }
}

export const stopTracking = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Tracking stopped'
    })
  } catch (error) {
    next(error)
  }
}

export const reportTraffic = async (req, res, next) => {
  try {
    const { location, speed, duration } = req.body
    const userId = req.user._id

    // Calculate reward based on traffic conditions
    let tokens = 0
    let reason = ''

    // Base reward: 50 tokens for being in traffic 5+ minutes
    if (duration >= 5) {
      tokens = 50
      reason = 'Traffic contribution (5+ minutes)'

      // Bonus for longer duration
      if (duration >= 10) {
        tokens += 25
        reason = 'Extended traffic contribution (10+ minutes)'
      }
      if (duration >= 15) {
        tokens += 25
        reason = 'Long traffic contribution (15+ minutes)'
      }

      // Prediction bonus: if speed was accurately reported
      const predictionBonus = Math.floor(Math.random() * 20) // Random 0-20 bonus
      if (predictionBonus > 10) {
        tokens += predictionBonus
        reason += ' + Prediction bonus'
      }
    }

    if (tokens > 0) {
      // Create reward record
      const reward = await Reward.create({
        user: userId,
        tokens,
        reason,
        type: 'traffic',
        metadata: {
          speed,
          duration,
          location
        }
      })

      // Update user tokens
      const user = await User.findById(userId)
      user.totalTokens += tokens
      user.totalRewards += 1
      user.trafficReports += 1
      user.lastActive = new Date()
      await user.save()

      // Create transaction
      await Transaction.create({
        user: userId,
        type: 'earned',
        amount: tokens,
        description: reason,
        relatedReward: reward._id
      })

      res.json({
        success: true,
        reward: {
          tokens,
          reason,
          type: 'traffic'
        }
      })
    } else {
      res.json({
        success: true,
        message: 'No reward earned. Stay in traffic for at least 5 minutes.'
      })
    }
  } catch (error) {
    next(error)
  }
}

export default {
  startTracking,
  stopTracking,
  reportTraffic
}

