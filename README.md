# CreatorVault 🚀

**Tokenize your content. Build your empire. Reward your holders with premium access.**

CreatorVault is a revolutionary platform that allows content creators to tokenize their work and create investment opportunities for their audience. Built on the Algorand blockchain, it enables creators to launch their own tokens and monetize their content through a decentralized ecosystem.

## 🌟 Features

### For Creators
- **Creator Token Launchpad**: Launch your own cryptocurrency token
- **Content Tokenization**: Tokenize individual videos, posts, and content pieces
- **YouTube Integration**: Seamless OAuth integration with YouTube Data API
- **Premium Content Management**: Upload exclusive content for token holders
- **Real-time Analytics**: Track token performance and holder engagement
- **Professional Dashboard**: Comprehensive creator profile and metrics

### For Investors
- **Trading Marketplace**: Trade creator tokens with real-time charts
- **Investment Opportunities**: Invest in individual content pieces
- **Holder Benefits**: Access to premium content and exclusive perks
- **Portfolio Management**: Track your creator token investments
- **Dynamic Pricing**: Token prices based on content engagement metrics

### Technical Features
- **Algorand Blockchain**: Real ASA (Algorand Standard Asset) creation
- **Smart Contract Integration**: Automated token creation and trading
- **Pera Wallet Integration**: Seamless wallet connection and management
- **Real-time Data**: Live token prices and market data
- **Responsive Design**: Modern UI with animations and professional styling

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Recharts** for data visualization
- **Pera Wallet Connect** for blockchain integration

### Backend
- **Python Flask** for API server
- **Algorand SDK** for blockchain integration
- **SQLite** for data persistence
- **YouTube Data API v3** for content integration
- **Google OAuth 2.0** for authentication

### Blockchain
- **Algorand Testnet** for development
- **ASA (Algorand Standard Assets)** for token creation
- **Smart Contracts** for automated trading

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sarthaknimje/algos2.git
   cd algos2
   ```

2. **Frontend Setup**
   ```bash
   cd sarva
   npm install
   npm run dev
   ```

3. **Backend Setup**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install flask flask-cors py-algorand-sdk google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
   python app.py
   ```

4. **Environment Configuration**
   - Set up YouTube Data API credentials
   - Configure Algorand testnet settings
   - Set up Pera Wallet integration

### Usage

1. **Connect Wallet**: Connect your Pera Wallet to the platform
2. **YouTube Authentication**: Link your YouTube channel for content access
3. **Launch Token**: Create your creator token through the launchpad
4. **Tokenize Content**: Turn your videos into investment opportunities
5. **Trade Tokens**: Buy and sell creator tokens on the marketplace

## 📁 Project Structure

```
algos2/
├── sarva/                    # Frontend React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Main application pages
│   │   ├── contexts/        # React contexts (Wallet, etc.)
│   │   ├── services/        # API and blockchain services
│   │   └── assets/          # Icons and static assets
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # Python Flask backend
│   ├── app.py               # Main Flask application
│   ├── requirements.txt     # Python dependencies
│   └── venv/               # Virtual environment
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `GET /auth/youtube` - Initiate YouTube OAuth flow
- `POST /auth/youtube/callback` - Handle OAuth callback
- `GET /auth/youtube/status` - Check authentication status

### Token Management
- `POST /create-creator-token` - Create main creator token
- `POST /create-video-token` - Tokenize individual content
- `GET /tokens` - Fetch all created tokens
- `POST /trade-token` - Execute token trades

### Health & Status
- `GET /health` - Backend health check

## 🎯 Key Features Explained

### Creator Token Launchpad
Professional token launch platform with:
- Multi-stage launch process (Setup → Launching → Launched)
- Real-time progress tracking
- Confetti animations and success sounds
- Comprehensive token metrics display
- Action cards for next steps

### Content Tokenization
Transform content into investment opportunities:
- YouTube video integration
- Dynamic pricing based on engagement metrics
- Individual content tokenization
- Premium content management
- Holder benefit tiers

### Trading Marketplace
Professional trading interface featuring:
- Real-time price charts
- Order book simulation
- Buy/sell functionality
- Portfolio tracking
- Market data visualization

## 🔐 Security Features

- **YouTube OAuth 2.0**: Secure channel authentication
- **Wallet Integration**: Pera Wallet for secure transactions
- **Input Validation**: Comprehensive data validation
- **Error Handling**: Robust error management
- **CORS Configuration**: Secure cross-origin requests

## 🌐 Blockchain Integration

### Algorand Features
- **ASA Creation**: Real Algorand Standard Assets
- **Testnet Integration**: Development on Algorand testnet
- **Transaction Management**: Automated transaction handling
- **Asset Management**: Complete asset lifecycle management

### Pera Wallet Integration
- **Wallet Connection**: Seamless wallet integration
- **Transaction Signing**: Secure transaction approval
- **Balance Tracking**: Real-time balance updates
- **Explorer Integration**: Direct links to Pera Wallet explorer

## 📊 Analytics & Metrics

### Creator Analytics
- Token performance tracking
- Holder engagement metrics
- Content performance analysis
- Revenue tracking

### Investor Analytics
- Portfolio performance
- Investment tracking
- Market analysis
- Profit/loss calculations

## 🚀 Deployment

### Frontend Deployment
```bash
cd sarva
npm run build
# Deploy dist/ folder to your hosting service
```

### Backend Deployment
```bash
cd backend
pip install -r requirements.txt
python app.py
# Configure production settings
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Sarthak Nimje** - *Initial work* - [sarthaknimje@gmail.com](mailto:sarthaknimje@gmail.com)
- **Apurva Bardapurkar** - *Contributor* - [itsapurvasb343@gmail.com](mailto:itsapurvasb343@gmail.com)

## 🙏 Acknowledgments

- Algorand Foundation for blockchain infrastructure
- Pera Wallet for wallet integration
- YouTube Data API for content integration
- React and TypeScript communities
- Open source contributors

## 📞 Support

For support, email sarthaknimje@gmail.com or create an issue in the repository.

---

**Built with ❤️ by Sarthak Nimje and Apurva Bardapurkar**
