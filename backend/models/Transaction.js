import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['earned', 'spent'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    relatedReward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reward'
    },
    marketplaceItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MarketplaceItem'
    }
  },
  {
    timestamps: true
  }
)

const Transaction = mongoose.model('Transaction', transactionSchema)

export default Transaction

