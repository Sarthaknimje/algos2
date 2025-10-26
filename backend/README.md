# DriveFi Backend

Node.js + Express + MongoDB backend for the DriveFi Traffic-to-Earn application.

## Getting Started

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/drivefi
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

### Database Setup

Make sure MongoDB is installed and running on your system. You can download it from [mongodb.com](https://www.mongodb.com/try/download/community)

Or use a cloud service like MongoDB Atlas.

### Development

```bash
npm run dev
```

The API will be available at `http://localhost:5000/api`

### API Endpoints

#### Authentication
- POST `/api/auth/signup` - Create new account
- POST `/api/auth/login` - Login
- GET `/api/auth/me` - Get current user

#### Traffic
- POST `/api/traffic/start` - Start tracking traffic
- POST `/api/traffic/stop` - Stop tracking
- POST `/api/traffic/report` - Report traffic data

#### Rewards
- GET `/api/rewards` - Get user rewards
- GET `/api/rewards/leaderboard` - Get leaderboard

#### Marketplace
- GET `/api/marketplace/items` - Get available items
- POST `/api/marketplace/spend` - Purchase item

## Features

- 🔐 JWT Authentication
- 💾 MongoDB database
- 📊 Traffic-to-Earn logic
- 🎁 Marketplace system
- 🏆 Leaderboard rankings
- ⚡ Real-time rewards

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

