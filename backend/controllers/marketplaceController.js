import MarketplaceItem from '../models/MarketplaceItem.js'
import User from '../models/User.js'
import Transaction from '../models/Transaction.js'

export const getItems = async (req, res, next) => {
  try {
    const items = await MarketplaceItem.find({ available: true }).sort({
      createdAt: -1
    })

    res.json(items)
  } catch (error) {
    next(error)
  }
}

export const purchaseItem = async (req, res, next) => {
  try {
    const { itemId } = req.body
    const userId = req.user._id

    // Find the item
    const item = await MarketplaceItem.findById(itemId)

    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }

    if (!item.available) {
      return res.status(400).json({ message: 'Item is not available' })
    }

    // Check user balance
    const user = await User.findById(userId)

    if (user.totalTokens < item.price) {
      return res
        .status(400)
        .json({ message: 'Insufficient tokens' })
    }

    // Deduct tokens from user
    user.totalTokens -= item.price
    await user.save()

    // Create transaction
    await Transaction.create({
      user: userId,
      type: 'spent',
      amount: item.price,
      description: `Purchased ${item.name}`,
      marketplaceItem: item._id
    })

    res.json({
      success: true,
      message: `Successfully purchased ${item.name}!`,
      remainingTokens: user.totalTokens
    })
  } catch (error) {
    next(error)
  }
}

export default {
  getItems,
  purchaseItem
}

