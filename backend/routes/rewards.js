import express from 'express'
import { getUserRewards, getLeaderboard } from '../controllers/rewardController.js'
import authenticate from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', authenticate, getUserRewards)
router.get('/leaderboard', getLeaderboard)

export default router

