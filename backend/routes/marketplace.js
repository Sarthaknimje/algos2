import express from 'express'
import { getItems, purchaseItem } from '../controllers/marketplaceController.js'
import authenticate from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/items', authenticate, getItems)
router.post('/spend', authenticate, purchaseItem)

export default router

