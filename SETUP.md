# CreatorVault Environment Setup

This guide will help you set up and run CreatorVault locally for development.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation Steps](#installation-steps)
- [Getting API Credentials](#getting-api-credentials)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **Pera Wallet** (mobile or browser extension) - [Download](https://perawallet.app/)

## Environment Variables

Create a `.env` file in the `contentvault/backend/` directory with the following variables:

```bash
# YouTube OAuth Configuration
YOUTUBE_CLIENT_ID=your-youtube-client-id
YOUTUBE_CLIENT_SECRET=your-youtube-client-secret
YOUTUBE_REDIRECT_URI=http://localhost:5175/auth/youtube/callback

# Flask Configuration
FLASK_SECRET_KEY=your-secret-key-change-in-production
FLASK_ENV=development

# Algorand Configuration (Using public Algonode testnet)
ALGOD_TOKEN=
ALGOD_SERVER=https://testnet-api.algonode.cloud
ALGOD_PORT=

# Database Configuration
DATABASE_PATH=creatorvault.db
```

**Note:** A template file (`env.template`) is provided in the backend directory for reference.

## Getting YouTube API Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials
5. Add `http://localhost:5175/auth/youtube/callback` to authorized redirect URIs
6. Copy Client ID and Client Secret to your `.env` file

## Getting Algorand Credentials

1. Go to [Algorand Developer Portal](https://developer.algorand.org/)
2. Create a testnet account
3. Get API token from [AlgoNode](https://algonode.cloud/) or [PureStake](https://www.purestake.com/)
4. Add credentials to your `.env` file

## Installation Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/Sarthaknimje/algos2.git
cd algos2/techtrio
```

### Step 2: Backend Setup

1. Navigate to the backend directory:
```bash
cd contentvault/backend
```

2. Create a Python virtual environment:
```bash
python3 -m venv venv
```

3. Activate the virtual environment:
```bash
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

4. Install Python dependencies:
```bash
pip install -r requirements.txt
```

5. Create the `.env` file (see [Environment Variables](#environment-variables) section)

6. Initialize the database:
```bash
python app.py
```

The backend server will start on `http://localhost:5001`

### Step 3: Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd contentvault
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5175`

## Running the Application

### Using the Provided Script

You can use the provided start script to run both frontend and backend:

```bash
./start-backend.sh
```

Or run them separately:

**Backend:**
```bash
cd contentvault/backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```

**Frontend:**
```bash
cd contentvault
npm run dev
```

## Features

- ✅ Real Algorand ASA creation
- ✅ YouTube OAuth integration
- ✅ Token trading with smart contracts
- ✅ Content tokenization
- ✅ Pera Wallet integration
- ✅ Professional UI with animations
- ✅ Real-time data and charts
- ✅ Responsive design

## Troubleshooting

### Backend Issues

**Problem: `ModuleNotFoundError` when running Python**
- Solution: Ensure you've activated the virtual environment and installed all dependencies:
  ```bash
  source venv/bin/activate  # or venv\Scripts\activate on Windows
  pip install -r requirements.txt
  ```

**Problem: YouTube OAuth not working**
- Solution: Check that your redirect URI in Google Cloud Console exactly matches `http://localhost:5175/auth/youtube/callback`
- Ensure YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET are correctly set in `.env`

**Problem: Database errors**
- Solution: Delete the `creatorvault.db` file and restart the backend to reinitialize the database

**Problem: CORS errors**
- Solution: Ensure both frontend (port 5175) and backend (port 5001) are running
- Check that CORS_ORIGINS in `.env` includes your frontend URL

### Frontend Issues

**Problem: Module not found errors**
- Solution: Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

**Problem: Pera Wallet connection fails**
- Solution: Ensure you have Pera Wallet installed and are using testnet
- Try disconnecting and reconnecting the wallet

**Problem: Build errors**
- Solution: Ensure Node.js version is 18 or higher:
  ```bash
  node --version
  ```

### Algorand Issues

**Problem: Insufficient funds for transactions**
- Solution: Get testnet ALGO from the [Algorand Testnet Dispenser](https://bank.testnet.algorand.network/)

**Problem: Transaction timeout**
- Solution: The Algorand testnet might be slow. Wait a few seconds and try again
- Check your internet connection

## Security Notes

- ⚠️ Never commit API keys or `.env` files to version control
- 🔒 Use environment variables for all sensitive data
- 🌐 Enable HTTPS in production environments
- 🔑 Implement proper key management for production deployments
- 🛡️ Use secure session management and CSRF protection
- 📝 The provided mnemonic in app.py is for development only - never use in production

## Additional Resources

- [Algorand Developer Docs](https://developer.algorand.org/)
- [Pera Wallet Documentation](https://docs.perawallet.app/)
- [YouTube Data API Reference](https://developers.google.com/youtube/v3)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)

## Support

For issues or questions:
- 📧 Create an issue in the repository
- 💬 Contact the maintainers:
  - Sarthak Nimje: sarthaknimje@gmail.com
  - Apurva Bardapurkar: itsapurvasb343@gmail.com

---

**Happy Building! 🚀**

