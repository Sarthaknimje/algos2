import Reward from '../models/Reward.js'
import User from '../models/User.js'

export const getUserRewards = async (req, res, next) => {
  try {
    const userId = req.user._id

    const user = await User.findById(userId)

    // Get recent rewards
    const recentRewards = await Reward.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('tokens reason createdAt')

    res.json({
      success: true,
      totalTokens: user.totalTokens,
      totalRewards: user.totalRewards,
      trafficReports: user.trafficReports,
      recentRewards
    })
  } catch (error) {
    next(error)
  }
}

export const getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('name totalTokens totalRewards')
      .sort({ totalTokens: -1 })
      .limit(10)

    res.json(users)
  } catch (error) {
    next(error)
  }
}

export default {
  getUserRewards,
  getLeaderboard
}

