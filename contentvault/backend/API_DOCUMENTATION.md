# CreatorVault API Documentation

This document provides comprehensive documentation for the CreatorVault backend API.

## Base URL

```
Development: http://localhost:5001
Production: [Your production URL]
```

## Authentication

The API uses YouTube OAuth 2.0 for authentication. Session-based authentication is used to maintain user state.

## API Endpoints

### Health Check

#### `GET /health`

Check if the backend server is running.

**Response:**
```json
{
  "status": "ok",
  "message": "CreatorVault backend is running"
}
```

---

### YouTube Authentication

#### `GET /auth/youtube`

Initiate YouTube OAuth flow.

**Query Parameters:**
- `session_id` (optional): Custom session identifier

**Response:**
- Redirects to Google OAuth consent screen

**Example:**
```
GET /auth/youtube?session_id=user123
```

---

#### `POST /auth/youtube/callback`

Handle YouTube OAuth callback.

**Request Body:**
```json
{
  "code": "oauth_authorization_code",
  "session_id": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "YouTube authentication successful",
  "channel": {
    "id": "UCxxxxxx",
    "title": "Channel Name",
    "description": "Channel description",
    "subscriberCount": 10000,
    "videoCount": 50,
    "viewCount": 500000
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

---

#### `GET /auth/youtube/status`

Check YouTube authentication status.

**Query Parameters:**
- `session_id`: Session identifier

**Response:**
```json
{
  "authenticated": true,
  "channel": {
    "id": "UCxxxxxx",
    "title": "Channel Name"
  }
}
```

---

### Token Management

#### `POST /create-creator-token`

Create a creator token (ASA) on Algorand blockchain.

**Request Body:**
```json
{
  "creator_address": "ALGORAND_ADDRESS_58_CHARS",
  "token_name": "MyToken",
  "token_symbol": "MTK",
  "total_supply": 1000000,
  "description": "Token description",
  "youtube_channel_title": "Channel Name",
  "youtube_subscribers": 10000
}
```

**Validation:**
- `creator_address`: Must be valid 58-character Algorand address
- `token_name`: 1-32 characters
- `token_symbol`: 1-8 characters
- `total_supply`: Integer between 1 and 18446744073709551615

**Response:**
```json
{
  "success": true,
  "asa_id": 123456789,
  "transaction_id": "TXID123...",
  "token_name": "MyToken",
  "token_symbol": "MTK",
  "total_supply": 1000000,
  "creator_address": "ALGORAND_ADDRESS",
  "explorer_url": "https://testnet.explorer.perawallet.app/asset/123456789"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

---

#### `POST /create-video-token`

Create a token for a specific YouTube video.

**Request Body:**
```json
{
  "video_id": "dQw4w9WgXcQ",
  "video_title": "Video Title",
  "video_url": "https://youtube.com/watch?v=dQw4w9WgXcQ",
  "total_supply": 100000,
  "session_id": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "asa_id": 987654321,
  "transaction_id": "TXID456...",
  "video_id": "dQw4w9WgXcQ",
  "video_title": "Video Title",
  "total_supply": 100000,
  "current_price": 0.1,
  "creator_address": "ALGORAND_ADDRESS",
  "explorer_url": "https://testnet.explorer.perawallet.app/asset/987654321"
}
```

---

#### `GET /tokens`

Retrieve all created tokens.

**Response:**
```json
{
  "success": true,
  "tokens": [
    {
      "asa_id": 123456789,
      "creator": "ALGORAND_ADDRESS",
      "token_name": "MyToken",
      "token_symbol": "MTK",
      "total_supply": 1000000,
      "current_price": 1.5,
      "market_cap": 1500000,
      "volume_24h": 50000,
      "holders": 150,
      "price_change_24h": 5.2,
      "created_at": "2025-10-29T12:00:00",
      "youtube_channel_title": "Channel Name",
      "youtube_subscribers": 10000,
      "video_id": null,
      "video_title": null
    }
  ]
}
```

---

#### `POST /trade-token`

Execute a token trade.

**Request Body:**
```json
{
  "asa_id": 123456789,
  "trade_type": "buy",
  "amount": 100,
  "trader_address": "ALGORAND_ADDRESS"
}
```

**Parameters:**
- `asa_id`: Asset ID to trade
- `trade_type`: Either "buy" or "sell"
- `amount`: Number of tokens to trade
- `trader_address`: Trader's Algorand address

**Response:**
```json
{
  "success": true,
  "trade": {
    "asa_id": 123456789,
    "trade_type": "buy",
    "amount": 100,
    "price": 1.5,
    "total_cost": 150,
    "transaction_id": "SIMULATED_TX_123",
    "trader_address": "ALGORAND_ADDRESS"
  },
  "updated_token": {
    "current_price": 1.52,
    "market_cap": 1520000,
    "volume_24h": 50150,
    "holders": 151
  }
}
```

---

### YouTube Data

#### `GET /youtube/videos`

Get videos from authenticated YouTube channel.

**Query Parameters:**
- `session_id`: Session identifier
- `max_results` (optional): Maximum number of results (default: 10)

**Response:**
```json
{
  "success": true,
  "videos": [
    {
      "id": "video_id",
      "title": "Video Title",
      "description": "Video description",
      "thumbnail": "https://i.ytimg.com/...",
      "viewCount": 10000,
      "likeCount": 500,
      "publishedAt": "2025-10-01T12:00:00Z"
    }
  ]
}
```

---

#### `GET /youtube/channel`

Get authenticated user's YouTube channel information.

**Query Parameters:**
- `session_id`: Session identifier

**Response:**
```json
{
  "success": true,
  "channel": {
    "id": "UCxxxxxx",
    "title": "Channel Name",
    "description": "Channel description",
    "customUrl": "youtube.com/@channelname",
    "subscriberCount": 10000,
    "videoCount": 50,
    "viewCount": 500000,
    "thumbnail": "https://yt3.ggpht.com/..."
  }
}
```

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

### HTTP Status Codes

- `200 OK`: Successful request
- `400 Bad Request`: Invalid input or validation error
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Rate Limiting

Currently, no rate limiting is implemented. In production:
- Implement rate limiting per IP address
- Use Redis for distributed rate limiting
- Recommended: 100 requests per minute per IP

---

## Security Considerations

### Development Environment
- CORS allows all origins
- Session cookies use `SameSite=None`
- HTTPS not required

### Production Environment
- Restrict CORS to specific origins via `CORS_ORIGINS` environment variable
- Session cookies use `SameSite=Lax`
- HTTPS required (`SESSION_COOKIE_SECURE=True`)
- HSTS header enabled
- Additional security headers applied

### Input Validation

All user inputs are validated:
- Algorand addresses: 58 alphanumeric characters
- Token names: 1-32 characters
- Token symbols: 1-8 characters
- Total supply: Valid integer range
- Inputs sanitized to prevent injection attacks

---

## Database Schema

### Tokens Table
```sql
CREATE TABLE tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asa_id INTEGER UNIQUE NOT NULL,
    creator TEXT NOT NULL,
    token_name TEXT NOT NULL,
    token_symbol TEXT NOT NULL,
    total_supply INTEGER NOT NULL,
    current_price REAL NOT NULL,
    market_cap REAL NOT NULL,
    volume_24h REAL DEFAULT 0,
    holders INTEGER DEFAULT 1,
    price_change_24h REAL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    youtube_channel_title TEXT,
    youtube_subscribers INTEGER,
    video_id TEXT,
    video_title TEXT
);
```

### Trades Table
```sql
CREATE TABLE trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asa_id INTEGER NOT NULL,
    trader_address TEXT NOT NULL,
    trade_type TEXT NOT NULL,
    amount REAL NOT NULL,
    price REAL NOT NULL,
    transaction_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asa_id) REFERENCES tokens (asa_id)
);
```

### Holders Table
```sql
CREATE TABLE holders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asa_id INTEGER NOT NULL,
    holder_address TEXT NOT NULL,
    balance REAL NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asa_id) REFERENCES tokens (asa_id)
);
```

---

## WebSocket Support

Currently not implemented. Future considerations:
- Real-time price updates
- Live trading notifications
- Token creation broadcasts

---

## Testing

### Health Check Test
```bash
curl http://localhost:5001/health
```

### Get Tokens Test
```bash
curl http://localhost:5001/tokens
```

### Create Token Test
```bash
curl -X POST http://localhost:5001/create-creator-token \
  -H "Content-Type: application/json" \
  -d '{
    "creator_address": "YOUR_ALGORAND_ADDRESS",
    "token_name": "TestToken",
    "token_symbol": "TEST",
    "total_supply": 1000000,
    "description": "Test token"
  }'
```

---

## Logging

Logs are written to:
- Console (stdout)
- `backend.log` file

Log format:
```
%(asctime)s - %(name)s - %(levelname)s - %(message)s
```

Log levels:
- `INFO`: General information
- `ERROR`: Error messages with stack traces
- `DEBUG`: Detailed debugging (enable via `FLASK_ENV=development`)

---

## Support

For API issues or questions:
- Email: sarthaknimje@gmail.com, itsapurvasb343@gmail.com
- GitHub Issues: [Repository Issues](https://github.com/Sarthaknimje/algos2/issues)

---

**Last Updated:** October 29, 2025  
**API Version:** 1.0  
**Maintained by:** Sarthak Nimje & Apurva Bardapurkar

