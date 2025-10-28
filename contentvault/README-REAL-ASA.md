# Real ASA Creation with Python Backend

This setup creates **REAL** Algorand Standard Assets (ASAs) on the Algorand Testnet using a Python Flask backend.

## 🚀 Quick Start

### 1. Start the Python Backend

```bash
# Make the script executable (if not already done)
chmod +x start-backend.sh

# Start the Python backend
./start-backend.sh
```

The backend will:
- Install Python dependencies automatically
- Start Flask server on `http://localhost:8000`
- Connect to Algorand Testnet
- Use the provided mnemonic for creator account

### 2. Start the Frontend

```bash
# In a new terminal, navigate to the project root
cd /Users/sarthakchandrashekharnimje/ALGOKIT/ALGO

# Install frontend dependencies
npm install

# Start the frontend development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🔧 How It Works

### Python Backend (`/backend/app.py`)
- **Flask API** with CORS enabled
- **Real ASA Creation** using `algosdk`
- **Mnemonic Management** for creator account
- **Algorand Testnet** integration

### Frontend Integration
- **Real API Calls** to Python backend
- **Beautiful Confetti Animation** on success
- **Success Modal** showing real ASA details
- **AlgoExplorer Links** to view created assets

### Real ASA Details Shown
- ✅ **ASA ID** - Real asset ID from Algorand
- ✅ **Transaction ID** - Real transaction hash
- ✅ **Asset Name** - Generated from video title
- ✅ **Unit Name** - Generated from video ID
- ✅ **Creator Address** - Real Algorand address
- ✅ **Total Supply** - As specified
- ✅ **Metadata URL** - Links to video

## 📡 API Endpoints

### `POST /convert-mnemonic`
Converts mnemonic phrase to private key and address

### `POST /create-video-token`
Creates a real ASA for a video
- **Input**: `video_id`, `video_title`, `total_supply`
- **Output**: Complete ASA information with transaction details

### `GET /get-token-info/<video_id>`
Gets token information for a video

### `GET /health`
Health check endpoint

## 🔑 Security Notes

- **Mnemonic Phrase** is hardcoded for demo purposes
- **In Production**: Store mnemonic securely (environment variables, key management)
- **Private Keys** are never exposed to frontend
- **All Signing** happens on the backend

## 🌐 Algorand Testnet

- **Network**: Algorand Testnet
- **Explorer**: https://testnet.algoexplorer.io/
- **API**: https://testnet-api.algonode.cloud
- **Test Algos**: Get from https://testnet.algoexplorer.io/dispenser

## 🎯 Features

### Real ASA Creation
- ✅ Creates actual ASAs on Algorand Testnet
- ✅ Uses proper asset parameters
- ✅ Generates unique asset names and unit names
- ✅ Sets metadata URLs
- ✅ Configures asset permissions

### Beautiful UI
- ✅ Confetti animation on success
- ✅ Professional success modal
- ✅ Real-time loading indicators
- ✅ Direct links to AlgoExplorer

### Error Handling
- ✅ Backend health checks
- ✅ Proper error messages
- ✅ Fallback mechanisms

## 🚨 Troubleshooting

### Backend Not Starting
```bash
# Check Python installation
python3 --version

# Check pip installation
pip3 --version

# Install dependencies manually
cd backend
pip3 install -r requirements.txt
python3 app.py
```

### Frontend Connection Issues
- Ensure backend is running on `http://localhost:8000`
- Check browser console for CORS errors
- Verify network connectivity

### ASA Creation Fails
- Check Algorand Testnet connectivity
- Verify mnemonic phrase is valid
- Ensure creator account has sufficient ALGOs for fees

## 📊 What You'll See

1. **Video Tokenization Page**: Search and select YouTube videos
2. **Mint Token Button**: Click to create real ASA
3. **Loading Screen**: Shows creation progress
4. **Confetti Animation**: Celebrates successful creation
5. **Success Modal**: Displays real ASA details
6. **AlgoExplorer Link**: View asset on blockchain

## 🎉 Success!

Your video tokens are now **REAL** Algorand Standard Assets on the Testnet! You can:
- View them on AlgoExplorer
- Transfer them between accounts
- Use them in other dApps
- Trade them on DEXs

The assets are permanently recorded on the Algorand blockchain! 🚀
