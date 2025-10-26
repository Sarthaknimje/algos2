# 🚀 DriveFi - Quick Start Guide

## ✅ What's Been Built

Your DriveFi Traffic-to-Earn application is complete with:

### Frontend ✅
- **Pages**: Login, Signup, Dashboard, Marketplace, Profile
- **Components**: Navbar, Footer, TokenBalance, TrafficMap, Leaderboard, RewardPopup
- **Features**: Form validation, responsive design, modern UI/UX
- **Tech**: React 18, Vite, TailwindCSS

### Backend ✅
- **Models**: User, Reward, Transaction, MarketplaceItem
- **Controllers**: Auth, Traffic, Rewards, Marketplace
- **Routes**: Complete API endpoints
- **Features**: JWT auth, Traffic-to-Earn logic, reward system
- **Tech**: Node.js, Express, MongoDB

## 🎯 How to Run

### Step 1: Install MongoDB

**Windows/Mac**: Download from [mongodb.com](https://www.mongodb.com/try/download/community)

**Or use MongoDB Atlas** (cloud):
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string

### Step 2: Setup Backend

```bash
cd backend
npm install
```

If MongoDB is local, create `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/drivefi
JWT_SECRET=drivefi_super_secret_jwt_key_change_in_production
NODE_ENV=development
```

Seed the marketplace:
```bash
node seed.js
```

Start backend:
```bash
npm run dev
```
✅ Backend runs on: http://localhost:5000

### Step 3: Setup Frontend

Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
✅ Frontend runs on: http://localhost:5173

### Step 4: Use the App

1. Open browser: http://localhost:5173
2. Click "Sign up" to create account
3. Login
4. Click "Start Tracking" on dashboard
5. Earn rewards when stuck in traffic
6. Check leaderboard
7. Visit marketplace

## 📋 API Endpoints

Backend provides these endpoints:

### Auth
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get user info

### Traffic
- `POST /api/traffic/start` - Start tracking
- `POST /api/traffic/stop` - Stop tracking  
- `POST /api/traffic/report` - Report traffic (auto-called)

### Rewards
- `GET /api/rewards` - Get user rewards
- `GET /api/rewards/leaderboard` - Leaderboard

### Marketplace
- `GET /api/marketplace/items` - Get items
- `POST /api/marketplace/spend` - Purchase item

## 💡 Key Features

### Reward System
- 50 tokens for 5+ minutes in traffic
- 25 bonus tokens for 10+ minutes
- 25 bonus tokens for 15+ minutes
- Random prediction bonus (0-20 tokens)

### Traffic Detection
- Simulated GPS tracking (demo mode)
- Speed detection (< 10 km/h = traffic)
- Duration tracking
- Automatic reward on 5+ minutes

### Leaderboard
- Real-time rankings
- Top 10 users displayed
- Your position highlighted

### Marketplace
- Pre-seeded items
- Token purchases
- Transaction history

## 🔧 Troubleshooting

### Port already in use
- Backend: Change PORT in `.env`
- Frontend: Vite auto-uses next port

### MongoDB connection error
1. Check MongoDB is running
2. Verify URI in `.env`
3. For Atlas: whitelist IP

### CORS errors
Already configured, should work automatically

## 📱 Pages

1. **Login** - Secure authentication
2. **Signup** - Create new account  
3. **Dashboard** - Traffic tracking, rewards, balance
4. **Marketplace** - Spend tokens
5. **Profile** - Account info, statistics

## 🎨 UI Features

- Responsive design (mobile-first)
- Modern TailwindCSS styling
- Smooth animations
- Reward popups
- Loading states
- Error handling
- Form validation

## 📊 Database Collections

- **users** - User accounts
- **rewards** - Reward history
- **transactions** - Token transactions
- **marketplaceitems** - Marketplace catalog

## ⚠️ Important Notes

- No Algorand wallet yet (as requested)
- Traffic speed is simulated for demo
- All validation and error handling in place
- Production-ready code structure

## 🎉 You're All Set!

The application is ready to run. Start both servers and visit http://localhost:5173

