# DriveFi Setup Instructions

## Quick Start

### Option 1: Automated Setup (Windows)

Run the setup script:
```bash
setup.bat
```

### Option 2: Manual Setup

Follow these steps:

## 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend directory:
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

Start the backend:
```bash
npm run dev
```

Backend will be available at `http://localhost:5000`

## 2. Frontend Setup

Open a new terminal:
```bash
cd frontend
npm install
```

Start the frontend:
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 3. Database

Make sure MongoDB is installed and running:

### Windows
- Download and install from [mongodb.com](https://www.mongodb.com/try/download/community)
- MongoDB will start automatically as a service

### Mac
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Or use MongoDB Atlas (Cloud)
- Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Get connection string and update `.env` file

## 4. Running the Application

1. Ensure MongoDB is running
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `cd frontend && npm run dev`
4. Open browser: `http://localhost:5173`

## 5. Testing

1. Create a new account at the signup page
2. Login with your credentials
3. Click "Start Tracking" on the dashboard
4. Simulate traffic (demo mode)
5. Earn rewards and view leaderboard
6. Visit marketplace to spend tokens

## Troubleshooting

### Port 5000 already in use
Change PORT in backend/.env file

### Port 5173 already in use
Vite will automatically use the next available port

### MongoDB connection error
- Check if MongoDB is running
- Verify MongoDB URI in .env
- For Atlas, whitelist your IP address

### CORS errors
Backend has CORS enabled, should work automatically

## Demo Credentials

Create your own account through the signup page.

## File Structure

```
DEFII/
├── frontend/
│   ├── src/
│   │   ├── pages/          # All page components
│   │   ├── components/     # Reusable components
│   │   ├── context/        # Auth context
│   │   ├── services/       # API service
│   │   └── App.jsx
│   └── package.json
├── backend/
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth, error handling
│   ├── utils/              # Utilities
│   ├── server.js
│   ├── seed.js
│   └── package.json
└── README.md
```

