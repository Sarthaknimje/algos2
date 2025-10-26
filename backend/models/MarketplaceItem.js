import mongoose from 'mongoose'

const marketplaceItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    icon: {
      type: String,
      default: '🎁'
    },
    available: {
      type: Boolean,
      default: true
    },
    category: {
      type: String,
      enum: ['digital', 'physical', 'service', 'bonus'],
      default: 'digital'
    }
  },
  {
    timestamps: true
  }
)

const MarketplaceItem = mongoose.model('MarketplaceItem', marketplaceItemSchema)

export default MarketplaceItem

