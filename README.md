# Algo Premier League 🏆

**The Ultimate Crypto Trading Competition on Algorand**

Welcome to Algo Premier League - the most exciting crypto trading competition built on the Algorand blockchain! Compete with other traders, maximize your returns, and win 2x rewards in this transparent and fair trading league.

## 🚀 Features

- **11 Premium Cryptocurrencies**: Trade BTC, ETH, ALGO, USDC, USDT, SOL, ADA, DOT, MATIC, AVAX, and LINK
- **Player vs Player Competition**: Compete against other traders in real-time
- **2x Winner Rewards**: Highest returns win double the rewards
- **Transparent & Fair**: Smart contracts ensure tamper-proof competition
- **Lightning Fast**: Built on Algorand's high-speed blockchain
- **Testnet Ready**: Deployed on Algorand Testnet for safe testing

## 🎯 How It Works

1. **Connect Wallet**: Connect your Algorand wallet to participate
2. **Join Competition**: Pay the entry fee (1 ALGO) to join the league
3. **Start Trading**: Trade any of the 11 supported cryptocurrencies
4. **Maximize Returns**: Use your trading skills to achieve the highest returns
5. **Win Rewards**: The player with the highest returns wins 2x the total pool

## 🛠️ Technical Stack

- **Frontend**: React + TypeScript + Vite
- **Smart Contract**: Python with AlgoPy
- **Blockchain**: Algorand Testnet
- **Development**: AlgoKit
- **Styling**: Custom CSS with modern design

## 📁 Project Structure

```
algos2/
├── algo/
│   ├── projects/
│   │   ├── algo-frontend/     # React frontend application
│   │   └── algo-contracts/    # Python smart contracts
│   └── README.md
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- Docker
- AlgoKit CLI

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sarthaknimje/algos2.git
   cd algos2
   ```

2. **Start LocalNet**
   ```bash
   algokit localnet start
   ```

3. **Bootstrap the project**
   ```bash
   cd algo
   algokit project bootstrap
   ```

4. **Deploy the smart contract**
   ```bash
   algokit project deploy localnet
   ```

5. **Start the frontend**
   ```bash
   cd projects/algo-frontend
   npm run dev
   ```

## 🎮 Smart Contract Features

### Core Functions

- `initialize_competition()`: Initialize the trading competition
- `join_competition()`: Join the competition with entry fee
- `execute_trade()`: Execute buy/sell trades on supported assets
- `get_player_stats()`: Get current player statistics
- `end_competition()`: End competition and determine winner
- `claim_rewards()`: Claim 2x rewards for the winner
- `get_competition_info()`: Get competition details

### Supported Assets

The competition supports trading of 11 major cryptocurrencies:
- Bitcoin (BTC)
- Ethereum (ETH)
- Algorand (ALGO)
- USD Coin (USDC)
- Tether (USDT)
- Solana (SOL)
- Cardano (ADA)
- Polkadot (DOT)
- Polygon (MATIC)
- Avalanche (AVAX)
- Chainlink (LINK)

## 🎨 Frontend Features

- **Modern UI**: Beautiful gradient design with glassmorphism effects
- **Responsive**: Works perfectly on desktop and mobile
- **Wallet Integration**: Connect with Algorand wallets
- **Real-time Updates**: Live competition status and player stats
- **Interactive Trading**: Easy-to-use trading interface

## 🔧 Development

### Building the Smart Contract

```bash
cd projects/algo-contracts
algokit project run build
```

### Running Tests

```bash
algokit project run test
```

### Frontend Development

```bash
cd projects/algo-frontend
npm run dev
```

## 🌐 Deployment

### Testnet Deployment

1. Configure your testnet credentials
2. Deploy the smart contract:
   ```bash
   algokit project deploy testnet
   ```
3. Update frontend configuration
4. Deploy frontend to your preferred hosting service

## 📊 Competition Rules

- **Entry Fee**: 1 ALGO minimum
- **Duration**: Configurable (default 1 hour)
- **Winner**: Player with highest total returns
- **Rewards**: Winner receives 2x the total competition pool
- **Fair Play**: All trades are recorded on-chain for transparency

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Sarthak Nimje**
- GitHub: [@Sarthaknimje](https://github.com/Sarthaknimje)
- Built with ❤️ on Algorand

## 🙏 Acknowledgments

- Algorand Foundation for the amazing blockchain platform
- AlgoKit team for the excellent development tools
- The Algorand community for inspiration and support

---

**Ready to compete? Join the Algo Premier League and prove your trading skills! 🏆**
