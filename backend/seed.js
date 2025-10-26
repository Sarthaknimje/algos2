import mongoose from 'mongoose'
import { connectDB } from './utils/db.js'
import MarketplaceItem from './models/MarketplaceItem.js'

const seedMarketplace = async () => {
  try {
    await connectDB()

    // Clear existing items
    await MarketplaceItem.deleteMany({})

    // Add marketplace items
    const items = [
      {
        name: 'Amazon Gift Card $10',
        description: 'Get a $10 Amazon gift card delivered to your email',
        price: 500,
        icon: '🛒',
        category: 'digital',
        available: true
      },
      {
        name: 'Netflix Subscription 1 Month',
        description: 'Free Netflix subscription for one month',
        price: 1000,
        icon: '🎬',
        category: 'service',
        available: true
      },
      {
        name: 'Coffee Voucher',
        description: 'Redeem at any coffee shop near you',
        price: 200,
        icon: '☕',
        category: 'physical',
        available: true
      },
      {
        name: 'Premium Badge',
        description: 'Show off your premium status in the app',
        price: 300,
        icon: '⭐',
        category: 'digital',
        available: true
      },
      {
        name: 'Weather API Access',
        description: 'Premium weather data access for 3 months',
        price: 800,
        icon: '🌤️',
        category: 'service',
        available: true
      },
      {
        name: 'Traffic Prediction Tool',
        description: 'Advanced traffic prediction tool for 6 months',
        price: 1500,
        icon: '🚦',
        category: 'digital',
        available: true
      }
    ]

    await MarketplaceItem.insertMany(items)
    console.log('✅ Marketplace items seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding marketplace:', error)
    process.exit(1)
  }
}

seedMarketplace()

