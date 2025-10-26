import express from 'express'
import {
  startTracking,
  stopTracking,
  reportTraffic
} from '../controllers/trafficController.js'
import authenticate from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/start', authenticate, startTracking)
router.post('/stop', authenticate, stopTracking)
router.post('/report', authenticate, reportTraffic)

export default router

