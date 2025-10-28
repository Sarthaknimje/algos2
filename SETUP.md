# CreatorVault Environment Setup

## Required Environment Variables

Create a `.env` file in the `contentvault/backend/` directory with the following variables:

```bash
# YouTube OAuth Configuration
YOUTUBE_CLIENT_ID=your-youtube-client-id
YOUTUBE_CLIENT_SECRET=your-youtube-client-secret
YOUTUBE_REDIRECT_URI=http://localhost:5175/auth/youtube/callback

# Algorand Configuration (Optional - defaults to testnet)
ALGOD_TOKEN=your-algod-token
ALGOD_SERVER=https://testnet-api.algonode.cloud
ALGOD_PORT=443
```

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

## Installation Instructions

### Backend Setup
```bash
cd contentvault/backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend Setup
```bash
cd contentvault
npm install
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

## Security Notes

- Never commit API keys to version control
- Use environment variables for sensitive data
- Enable HTTPS in production
- Implement proper key management for production
- Use secure session management

## Support

For issues or questions, please create an issue in the repository or contact:
- Sarthak Nimje: sarthaknimje@gmail.com
- Apurva Bardapurkar: itsapurvasb343@gmail.com
