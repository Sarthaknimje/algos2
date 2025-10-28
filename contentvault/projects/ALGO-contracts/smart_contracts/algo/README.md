# Algorand Standard Assets (ASA) Python Service

This Python service provides a robust backend for creating and managing Algorand Standard Assets, following the official Algorand documentation patterns.

## Features

- ✅ **Asset Creation**: Create ASAs with proper parameters
- ✅ **Asset Transfer**: Transfer assets between accounts
- ✅ **Opt-in Management**: Handle asset opt-in transactions
- ✅ **Video Token Creation**: Specialized function for video tokens
- ✅ **REST API**: FastAPI-based REST endpoints
- ✅ **Error Handling**: Comprehensive error handling and logging
- ✅ **Official Patterns**: Follows Algorand documentation exactly

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Start the API server:
```bash
python start_api.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Create Video Token
```http
POST /create-video-token
Content-Type: application/json

{
  "creator_private_key": "your_private_key_here",
  "video_id": "LttPjGraLJU",
  "video_title": "Red Light Green Light",
  "total_supply": 1000000
}
```

### Transfer Assets
```http
POST /transfer-asset
Content-Type: application/json

{
  "sender_private_key": "sender_private_key",
  "receiver_address": "receiver_address",
  "asset_id": 123456,
  "amount": 100
}
```

### Opt-in to Asset
```http
POST /opt-in-asset
Content-Type: application/json

{
  "account_private_key": "account_private_key",
  "asset_id": 123456
}
```

### Get Asset Info
```http
GET /asset-info/{asset_id}
```

### Get Account Assets
```http
GET /account-assets/{account_address}
```

## Usage Examples

### Python Direct Usage

```python
from asa_service import ASAService

# Initialize service
asa_service = ASAService()

# Create a video token
token_info = asa_service.create_video_token(
    creator_private_key="your_private_key_here",
    video_id="LttPjGraLJU",
    video_title="Red Light Green Light",
    total_supply=1000000
)

print(f"Asset ID: {token_info['asset_id']}")
print(f"Transaction ID: {token_info['transaction_id']}")
```

### Frontend Integration

The frontend can use the Python backend through the `pythonAsaService`:

```typescript
import { pythonAsaService } from './services/pythonAsaService'

// Create a video token
const tokenInfo = await pythonAsaService.createVideoToken(
  video,
  creatorPrivateKey,
  1000000
)
```

## Key Benefits

1. **Reliable**: Uses official Algorand Python SDK
2. **Proper Minting**: Full supply is minted to creator upon creation
3. **Tradeable**: Assets can be transferred immediately
4. **Standards Compliant**: Follows Algorand documentation exactly
5. **Error Handling**: Comprehensive error handling and logging
6. **REST API**: Easy integration with frontend applications

## Configuration

Set environment variables for configuration:

- `API_HOST`: API host (default: 0.0.0.0)
- `API_PORT`: API port (default: 8000)
- `API_RELOAD`: Enable auto-reload (default: true)

## Security Notes

- **Private Keys**: Never expose private keys in production
- **CORS**: Configure CORS properly for production
- **HTTPS**: Use HTTPS in production
- **Authentication**: Add proper authentication for production use

## Troubleshooting

### Common Issues

1. **Connection Refused**: Make sure the Python API server is running
2. **Private Key Issues**: Ensure private keys are valid and properly formatted
3. **Network Issues**: Check Algorand network connectivity
4. **Insufficient Balance**: Ensure creator has enough ALGO for transaction fees

### Logs

Check the console output for detailed error messages and transaction status.

## Development

To run in development mode with auto-reload:

```bash
python start_api.py
```

The server will automatically reload when code changes are detected.
