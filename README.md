# DriveFi - Traffic-to-Earn Network

A MERN stack application that rewards users with tokens for contributing traffic data while stuck in traffic.

## 🚀 Features

- **Authentication**: Secure login/signup with JWT tokens
- **Traffic Tracking**: Real-time GPS tracking to detect traffic conditions
- **Reward System**: Earn tokens for contributing traffic data
- **Leaderboard**: Compete with other users for top rankings
- **Marketplace**: Spend earned tokens on exclusive rewards
- **Real-time Updates**: Live dashboard with traffic status
- **Modern UI**: Beautiful, responsive design with TailwindCSS

## 📁 Project Structure

```
DEFII/
├── frontend/          # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── pages/     # Login, Signup, Dashboard, Marketplace, Profile
│   │   ├── components/ # Navbar, Footer, RewardPopup, Leaderboard, etc.
│   │   ├── context/   # AuthContext for state management
│   │   └── services/  # API service with Axios
│   └── package.json
├── backend/           # Node.js + Express + MongoDB
│   ├── models/        # User, Reward, Transaction, MarketplaceItem
│   ├── routes/        # auth, traffic, rewards, marketplace
│   ├── controllers/   # Business logic
│   ├── middleware/    # Auth, error handling
│   └── server.js
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- TailwindCSS
- React Router
- Axios

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI

# Start backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend
npm install

# Start frontend dev server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 3. Database Setup

Make sure MongoDB is running. If you're using MongoDB Atlas, update the connection string in `.env`.

## 🎮 Usage

### Demo Credentials
After signup, you can create an account with any email and password.

### Key Features

1. **Login/Signup**: Create an account or login with existing credentials
2. **Dashboard**: View your token balance, traffic status, and recent rewards
3. **Traffic Tracking**: Click "Start Tracking" to begin earning rewards
4. **Leaderboard**: See your ranking among all users
5. **Marketplace**: Spend your earned tokens on exclusive items
6. **Profile**: View your statistics and achievements

### Reward System

- **Base Reward**: 50 tokens for being stuck in traffic 5+ minutes
- **Extended Bonus**: +25 tokens for 10+ minutes
- **Long Traffic**: +25 tokens for 15+ minutes
- **Prediction Bonus**: Random 0-20 bonus tokens for accurate predictions

## 🗄️ API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Traffic
- `POST /api/traffic/start` - Start tracking
- `POST /api/traffic/stop` - Stop tracking
- `POST /api/traffic/report` - Report traffic data

### Rewards
- `GET /api/rewards` - Get user rewards
- `GET /api/rewards/leaderboard` - Get leaderboard

### Marketplace
- `GET /api/marketplace/items` - Get available items
- `POST /api/marketplace/spend` - Purchase item

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/drivefi
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

## 🧪 Testing

1. Start both frontend and backend servers
2. Visit `http://localhost:5173`
3. Create a new account
4. Start tracking traffic to earn rewards
5. Check leaderboard and marketplace

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop
- Tablet
- Mobile devices

## 🚫 Important Notes

- **No Algorand integration yet** - This version focuses on core functionality
- **Demo Mode**: Traffic speed is simulated for demonstration
- **Production Ready**: All error handling and validation implemented

## 🐛 Troubleshooting

### Backend not connecting to database
- Ensure MongoDB is running
- Check your MONGODB_URI in .env
- Verify MongoDB connection string format

### Frontend not loading
- Check if backend is running on port 5000
- Verify API endpoints in browser console
- Check CORS settings in backend

## 📄 License

This project is part of the DriveFi Network ecosystem.

## 👥 Support

For issues or questions, please check the project documentation or create an issue.

---

**Built with ❤️ for the DriveFi Network**

