import mongoose from 'mongoose'

const rewardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tokens: {
      type: Number,
      required: true,
      default: 0
    },
    reason: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['traffic', 'prediction', 'eco-route', 'bonus'],
      default: 'traffic'
    },
    metadata: {
      speed: Number,
      duration: Number,
      location: {
        lat: Number,
        lng: Number
      }
    }
  },
  {
    timestamps: true
  }
)

const Reward = mongoose.model('Reward', rewardSchema)

export default Reward

