from flask import Flask, request, jsonify, redirect, url_for, session
from flask_cors import CORS, cross_origin
import json
import os
import sqlite3
import hashlib
from datetime import datetime
from algosdk import account, mnemonic, transaction
from algosdk.v2client import algod
import base64
import traceback
import secrets
import logging
from functools import wraps
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
import google.auth.exceptions
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('backend.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'your-secret-key-change-in-production')

# Error handling decorator
def handle_errors(f):
    """Decorator to handle errors in route handlers"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except sqlite3.Error as e:
            logger.error(f"Database error in {f.__name__}: {str(e)}")
            return jsonify({"success": False, "error": "Database error occurred"}), 500
        except Exception as e:
            logger.error(f"Error in {f.__name__}: {str(e)}")
            logger.error(traceback.format_exc())
            return jsonify({"success": False, "error": str(e)}), 500
    return decorated_function

# Configure CORS with environment-based origins
allowed_origins = os.getenv('CORS_ORIGINS', 'http://localhost:5175').split(',')
CORS(app, resources={
    r"/*": {
        "origins": allowed_origins if os.getenv('FLASK_ENV') == 'production' else "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "max_age": 3600
    }
})

# Configure Flask session cookies for security
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax' if os.getenv('FLASK_ENV') == 'production' else 'None'
app.config['SESSION_COOKIE_SECURE'] = os.getenv('FLASK_ENV') == 'production'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = 3600  # 1 hour

# Security headers middleware
@app.after_request
def add_security_headers(response):
    """Add security headers to all responses"""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    if os.getenv('FLASK_ENV') == 'production':
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response

# Algorand configuration
ALGOD_TOKEN = ""
ALGOD_SERVER = "https://testnet-api.algonode.cloud"
ALGOD_PORT = ""

# YouTube OAuth configuration
YOUTUBE_CLIENT_ID = os.getenv('YOUTUBE_CLIENT_ID', 'your-youtube-client-id')
YOUTUBE_CLIENT_SECRET = os.getenv('YOUTUBE_CLIENT_SECRET', 'your-youtube-client-secret')
YOUTUBE_REDIRECT_URI = os.getenv('YOUTUBE_REDIRECT_URI', 'http://localhost:5175/auth/youtube/callback')
YOUTUBE_SCOPES = ['https://www.googleapis.com/auth/youtube.readonly']

# In production, use a proper database or Redis
youtube_sessions = {}

# Initialize Algorand client
algod_client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT)

# Input validation helpers
def validate_algorand_address(address: str) -> bool:
    """Validate Algorand address format"""
    if not address or not isinstance(address, str):
        return False
    # Algorand addresses are 58 characters long
    return len(address) == 58 and address.isalnum()

def validate_token_params(token_name: str, token_symbol: str, total_supply: int) -> tuple[bool, str]:
    """Validate token creation parameters"""
    if not token_name or len(token_name) > 32:
        return False, "Token name must be 1-32 characters"
    if not token_symbol or len(token_symbol) > 8:
        return False, "Token symbol must be 1-8 characters"
    if not isinstance(total_supply, int) or total_supply <= 0 or total_supply > 18446744073709551615:
        return False, "Invalid total supply"
    return True, ""

def sanitize_input(text: str, max_length: int = 256) -> str:
    """Sanitize user input to prevent injection attacks"""
    if not text:
        return ""
    # Remove any null bytes and limit length
    sanitized = text.replace('\x00', '')[:max_length]
    return sanitized.strip()

# Creator account mnemonic (for demo purposes - in production, use proper key management)
CREATOR_MNEMONIC = "alter green actual grab spoon okay faith repeat smile report easily retire plate enact vacuum spin bachelor rate where service settle nice north above soul"

# Initialize database
def init_db():
    conn = sqlite3.connect('creatorvault.db')
    cursor = conn.cursor()
    
    # Create tokens table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tokens (
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
        )
    ''')
    
    # Create trades table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS trades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asa_id INTEGER NOT NULL,
            trader_address TEXT NOT NULL,
            trade_type TEXT NOT NULL,
            amount REAL NOT NULL,
            price REAL NOT NULL,
            transaction_id TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (asa_id) REFERENCES tokens (asa_id)
        )
    ''')
    
    # Create holders table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS holders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asa_id INTEGER NOT NULL,
            holder_address TEXT NOT NULL,
            balance REAL NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (asa_id) REFERENCES tokens (asa_id)
        )
    ''')
    
    conn.commit()
    conn.close()

# Helper function to create ASA
def create_asa(private_key, creator_address, asset_name, unit_name, total_supply, decimals=0, default_frozen=False, manager_address=None, reserve_address=None, freeze_address=None, clawback_address=None, url=None, metadata_hash=None):
    """Create an Algorand Standard Asset (ASA)"""
    try:
        # Get suggested parameters
        sp = algod_client.suggested_params()
        
        # Create asset creation transaction
        txn = transaction.AssetConfigTxn(
            sender=creator_address,
            sp=sp,
            default_frozen=default_frozen,
            unit_name=unit_name,
            asset_name=asset_name,
            manager=manager_address or creator_address,
            reserve=reserve_address or creator_address,
            freeze=freeze_address or creator_address,
            clawback=clawback_address or creator_address,
            url=url,
            metadata_hash=metadata_hash,
            total=total_supply,
            decimals=decimals,
        )
        
        # Sign the transaction
        signed_txn = txn.sign(private_key)
        
        # Send the transaction
        txid = algod_client.send_transaction(signed_txn)
        print(f"📤 Transaction sent: {txid}")
        
        # Wait for confirmation
        print("⏳ Waiting for confirmation...")
        results = transaction.wait_for_confirmation(algod_client, txid, 4)
        print(f"✅ Result confirmed in round: {results['confirmed-round']}")
        
        # Get the asset ID
        created_asset = results["asset-index"]
        print(f"🎉 ASA Created! ID: {created_asset}")
        
        return created_asset, txid, results['confirmed-round']
        
    except Exception as e:
        print(f"❌ Error creating ASA: {e}")
        traceback.print_exc()
        raise e

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "CreatorVault Backend",
        "version": "1.0.0",
        "features": [
            "Algorand ASA Creation",
            "YouTube OAuth Integration", 
            "Token Trading",
            "Content Tokenization",
            "Pera Wallet Integration"
        ]
    })

@app.route('/auth/youtube', methods=['GET'])
def youtube_auth():
    """Initiate YouTube OAuth flow"""
    try:
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": YOUTUBE_CLIENT_ID,
                    "client_secret": YOUTUBE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [YOUTUBE_REDIRECT_URI]
                }
            },
            scopes=YOUTUBE_SCOPES,
            redirect_uri=YOUTUBE_REDIRECT_URI
        )
        
        auth_url, _ = flow.authorization_url(prompt='consent')
        
        return jsonify({
            "success": True,
            "auth_url": auth_url
        })
        
    except Exception as e:
        print(f"❌ YouTube auth error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/auth/youtube/callback', methods=['POST'])
def youtube_callback():
    """Handle YouTube OAuth callback"""
    try:
        data = request.get_json()
        auth_code = data.get('code')
        
        if not auth_code:
            return jsonify({
                "success": False,
                "error": "No authorization code provided"
            }), 400
        
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": YOUTUBE_CLIENT_ID,
                    "client_secret": YOUTUBE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [YOUTUBE_REDIRECT_URI]
                }
            },
            scopes=YOUTUBE_SCOPES,
            redirect_uri=YOUTUBE_REDIRECT_URI
        )
        
        try:
            flow.fetch_token(code=auth_code)
            credentials = flow.credentials
        except Exception as token_error:
            print(f"❌ Token exchange failed: {token_error}")
            return jsonify({
                "success": False,
                "error": f"Token exchange failed: {str(token_error)}"
            }), 400
        
        # Build YouTube service
        youtube = build('youtube', 'v3', credentials=credentials)
        
        # Get channel information
        channels_response = youtube.channels().list(
            part='snippet,statistics',
            mine=True
        ).execute()
        
        if not channels_response['items']:
            return jsonify({
                "success": False,
                "error": "No YouTube channel found"
            }), 400
        
        channel = channels_response['items'][0]
        channel_id = channel['id']
        channel_title = channel['snippet']['title']
        subscribers = int(channel['statistics'].get('subscriberCount', 0))
        
        # Store credentials in in-memory storage (for demo purposes)
        session_id = f"demo_session_{secrets.token_hex(8)}"
        youtube_sessions[session_id] = {
            'credentials': {
                'token': credentials.token,
                'refresh_token': credentials.refresh_token,
                'token_uri': credentials.token_uri,
                'client_id': credentials.client_id,
                'client_secret': credentials.client_secret,
                'scopes': credentials.scopes
            },
            'channel_id': channel_id,
            'channel_title': channel_title,
            'created_at': datetime.now().isoformat()
        }
        
        print(f"✅ YouTube OAuth successful for channel: {channel_title} ({channel_id})")
        print(f"💾 Stored in memory - Session ID: {session_id}")
        print(f"📋 Total sessions: {len(youtube_sessions)}")
        
        return jsonify({
            "success": True,
            "channel_id": channel_id,
            "channel_title": channel_title,
            "subscribers": subscribers
        })
        
    except Exception as e:
        print(f"❌ YouTube callback error: {e}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/auth/youtube/status', methods=['GET'])
def youtube_auth_status():
    """Check if user is authenticated with YouTube"""
    try:
        print(f"🔍 Checking YouTube auth status...")
        print(f"📋 In-memory sessions: {list(youtube_sessions.keys())}")
        
        if not youtube_sessions:
            print("❌ No YouTube sessions found")
            return jsonify({
                "success": False,
                "authenticated": False,
                "error": "Not authenticated"
            })
        
        session_key = list(youtube_sessions.keys())[0]
        session_data = youtube_sessions[session_key]
        
        print("✅ YouTube session found")
        
        credentials_data = session_data['credentials']
        credentials = Credentials(
            token=credentials_data['token'],
            refresh_token=credentials_data['refresh_token'],
            token_uri=credentials_data['token_uri'],
            client_id=credentials_data['client_id'],
            client_secret=credentials_data['client_secret'],
            scopes=credentials_data['scopes']
        )
        
        # Test credentials by making a simple API call
        youtube = build('youtube', 'v3', credentials=credentials)
        channels_response = youtube.channels().list(
            part='snippet',
            mine=True
        ).execute()
        
        if channels_response['items']:
            channel = channels_response['items'][0]
            print(f"✅ YouTube API call successful for channel: {channel['snippet']['title']}")
            return jsonify({
                "success": True,
                "authenticated": True,
                "channel_id": channel['id'],
                "channel_title": channel['snippet']['title']
            })
        else:
            print("❌ No channel found in API response")
            return jsonify({
                "success": False,
                "authenticated": False,
                "error": "No channel found"
            })
            
    except Exception as e:
        print(f"❌ YouTube status check error: {e}")
        return jsonify({
            "success": False,
            "authenticated": False,
            "error": str(e)
        })

@app.route('/test-create-token', methods=['POST'])
def test_create_token():
    """Test endpoint to create a token without YouTube auth"""
    try:
        data = request.get_json()
        
        # Use the creator account directly
        private_key = mnemonic.to_private_key(CREATOR_MNEMONIC)
        creator_address = account.address_from_private_key(private_key)
        
        # Create ASA
        asset_id = create_asa(
            private_key=private_key,
            creator_address=creator_address,
            asset_name=data['token_name'][:32],  # Truncate to 32 chars
            unit_name=data['token_symbol'],
            total_supply=int(data['total_supply']),
            decimals=6,
            default_frozen=False,
            manager_address=creator_address,
            reserve_address=creator_address,
            freeze_address=creator_address,
            clawback_address=creator_address,
            url="https://creatorvault.com",
            metadata_hash=None
        )[0]  # Get just the asset ID
        
        # Calculate market cap
        market_cap = float(data['total_supply']) * float(data['initial_price'])
        
        # Store in database
        conn = sqlite3.connect('creatorvault.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO tokens (asa_id, creator, token_name, token_symbol, total_supply, 
                              current_price, market_cap, youtube_channel_title, youtube_subscribers)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            asset_id, 
            creator_address, 
            data['token_name'], 
            data['token_symbol'], 
            int(data['total_supply']),
            float(data['initial_price']), 
            market_cap,
            data.get('youtube_channel_title', 'Test Channel'),
            data.get('youtube_subscribers', 1000)
        ))
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "asset_id": asset_id,
            "creator_address": creator_address,
            "token_name": data['token_name'],
            "token_symbol": data['token_symbol'],
            "total_supply": int(data['total_supply']),
            "current_price": float(data['initial_price']),
            "market_cap": market_cap
        })
        
    except Exception as e:
        print(f"❌ Error creating test token: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/create-creator-token', methods=['POST'])
def create_creator_token():
    """Create a creator token (ASA)"""
    try:
        data = request.get_json()
        
        # Check YouTube authentication
        if not youtube_sessions:
            return jsonify({
                "success": False,
                "error": "YouTube authentication required. Please connect your YouTube channel first."
            }), 401
        
        session_key = list(youtube_sessions.keys())[0]
        session_data = youtube_sessions[session_key]
        
        credentials_data = session_data['credentials']
        credentials = Credentials(
            token=credentials_data['token'],
            refresh_token=credentials_data['refresh_token'],
            token_uri=credentials_data['token_uri'],
            client_id=credentials_data['client_id'],
            client_secret=credentials_data['client_secret'],
            scopes=credentials_data['scopes']
        )
        
        # Get YouTube channel info
        youtube = build('youtube', 'v3', credentials=credentials)
        channels_response = youtube.channels().list(
            part='snippet,statistics',
            mine=True
        ).execute()
        
        channel = channels_response['items'][0]
        channel_id = channel['id']
        channel_title = channel['snippet']['title']
        subscribers = int(channel['statistics'].get('subscriberCount', 0))
        
        # Use the funded creator account
        private_key = mnemonic.to_private_key(CREATOR_MNEMONIC)
        creator_address = account.address_from_private_key(private_key)
        
        # Create ASA
        asset_id, txid, confirmed_round = create_asa(
            private_key=private_key,
            creator_address=creator_address,
            asset_name=data['token_name'][:32],  # Truncate to 32 chars
            unit_name=data['token_symbol'],
            total_supply=int(data['total_supply']),
            decimals=6,
            default_frozen=False,
            manager_address=creator_address,
            reserve_address=creator_address,
            freeze_address=creator_address,
            clawback_address=creator_address,
            url="https://creatorvault.com",
            metadata_hash=None
        )
        
        # Tokens are automatically held by the creator account (reserve address)
        print(f"✅ Creator automatically holds {data['total_supply']} tokens (reserve address)")
        
        # Calculate market cap
        market_cap = float(data['total_supply']) * float(data['token_price'])
        
        # Store in database
        conn = sqlite3.connect('creatorvault.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO tokens (asa_id, creator, token_name, token_symbol, total_supply, 
                              current_price, market_cap, youtube_channel_title, youtube_subscribers)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (asset_id, creator_address, data['token_name'], data['token_symbol'], 
              int(data['total_supply']), float(data['token_price']), market_cap,
              channel_title, subscribers))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "data": {
                "asset_id": asset_id,
                "token_name": data['token_name'],
                "token_symbol": data['token_symbol'],
                "total_supply": int(data['total_supply']),
                "current_price": float(data['token_price']),
                "market_cap": market_cap,
                "creator": creator_address,
                "transaction_id": f"tx_{asset_id}",
                "youtube_channel": {
                    "title": channel_title,
                    "subscribers": subscribers
                }
            }
        })
        
    except Exception as e:
        print(f"❌ Error creating creator token: {e}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/create-video-token', methods=['POST'])
def create_video_token():
    """Create a video token (ASA)"""
    try:
        data = request.get_json()
        
        # Check YouTube authentication
        if not youtube_sessions:
            return jsonify({
                "success": False,
                "error": "YouTube authentication required. Please connect your YouTube channel first."
            }), 401
        
        session_key = list(youtube_sessions.keys())[0]
        session_data = youtube_sessions[session_key]
        
        credentials_data = session_data['credentials']
        credentials = Credentials(
            token=credentials_data['token'],
            refresh_token=credentials_data['refresh_token'],
            token_uri=credentials_data['token_uri'],
            client_id=credentials_data['client_id'],
            client_secret=credentials_data['client_secret'],
            scopes=credentials_data['scopes']
        )
        
        # Get YouTube channel info
        youtube = build('youtube', 'v3', credentials=credentials)
        channels_response = youtube.channels().list(
            part='snippet,statistics',
            mine=True
        ).execute()
        
        channel = channels_response['items'][0]
        channel_id = channel['id']
        channel_title = channel['snippet']['title']
        subscribers = int(channel['statistics'].get('subscriberCount', 0))
        
        # Get video details
        video_response = youtube.videos().list(
            part='snippet,statistics',
            id=data['video_id']
        ).execute()
        
        if not video_response['items']:
            return jsonify({
                "success": False,
                "error": "Video not found"
            }), 404
        
        video = video_response['items'][0]
        video_title = video['snippet']['title']
        video_views = int(video['statistics'].get('viewCount', 0))
        video_likes = int(video['statistics'].get('likeCount', 0))
        video_comments = int(video['statistics'].get('commentCount', 0))
        
        # Calculate dynamic price based on engagement
        engagement_score = (video_likes * 2 + video_comments * 3) / max(video_views, 1) * 1000
        base_price = float(data['token_price'])
        dynamic_price = base_price + (engagement_score * 0.001)
        
        # Use the funded creator account
        private_key = mnemonic.to_private_key(CREATOR_MNEMONIC)
        creator_address = account.address_from_private_key(private_key)
        
        # Truncate asset name to fit Algorand's 32-character limit
        asset_name = data['token_name'][:32] if len(data['token_name']) > 32 else data['token_name']
        
        # Create ASA
        asset_id, txid, confirmed_round = create_asa(
            private_key=private_key,
            creator_address=creator_address,
            asset_name=asset_name,
            unit_name=data['token_symbol'],
            total_supply=int(data['total_supply']),
            decimals=6,
            default_frozen=False,
            manager_address=creator_address,
            reserve_address=creator_address,
            freeze_address=creator_address,
            clawback_address=creator_address,
            url=f"https://www.youtube.com/watch?v={data['video_id']}",
            metadata_hash=None
        )
        
        # Tokens are automatically held by the creator account (reserve address)
        print(f"✅ Creator automatically holds {data['total_supply']} video tokens (reserve address)")
        
        # Calculate market cap
        market_cap = float(data['total_supply']) * dynamic_price
        
        # Store in database
        conn = sqlite3.connect('creatorvault.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO tokens (asa_id, creator, token_name, token_symbol, total_supply, 
                              current_price, market_cap, youtube_channel_title, youtube_subscribers,
                              video_id, video_title)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (asset_id, creator_address, data['token_name'], data['token_symbol'], 
              int(data['total_supply']), dynamic_price, market_cap,
              channel_title, subscribers, data['video_id'], video_title))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "data": {
                "asset_id": asset_id,
                "token_name": data['token_name'],
                "token_symbol": data['token_symbol'],
                "total_supply": int(data['total_supply']),
                "current_price": dynamic_price,
                "market_cap": market_cap,
                "creator": creator_address,
                "transaction_id": f"tx_{asset_id}",
                "video_metrics": {
                    "views": video_views,
                    "likes": video_likes,
                    "comments": video_comments,
                    "engagement_score": engagement_score
                }
            }
        })
        
    except Exception as e:
        print(f"❌ Error creating video token: {e}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/trade-token', methods=['POST'])
def trade_token():
    """Execute a token trade"""
    try:
        data = request.get_json()
        
        # Get trader address from request (user's wallet)
        trader_address = data.get('trader_address')
        if not trader_address:
            return jsonify({
                "success": False,
                "error": "Trader address is required"
            }), 400
        
        # Get creator account for token management
        creator_private_key = mnemonic.to_private_key(CREATOR_MNEMONIC)
        creator_address = account.address_from_private_key(creator_private_key)
        
        # Convert amount to token units (assuming 6 decimals for the asset)
        requested_amount = float(data['amount'])
        token_amount = int(requested_amount * 1000000)  # 1 token = 1,000,000 micro-units
        algo_amount = int(float(data['price']) * requested_amount * 1000000)  # ALGO amount in micro-units
        
        # Check if creator has enough tokens for the trade
        try:
            account_info = algod_client.account_info(creator_address)
            assets = account_info.get('assets', [])
            creator_token_balance = 0
            
            for asset in assets:
                if asset['asset-id'] == int(data['asa_id']):
                    creator_token_balance = asset['amount']
                    break
            
            if data['trade_type'] == 'buy' and token_amount > creator_token_balance:
                return jsonify({
                    "success": False,
                    "error": f"Insufficient token balance. Creator has {creator_token_balance/1000000:.6f} tokens, but you're trying to buy {requested_amount:.6f} tokens. Please try a smaller amount or check if this token has enough supply."
                }), 400
                
        except Exception as e:
            print(f"Warning: Could not check creator balance: {e}")
        
        # Get suggested parameters
        sp = algod_client.suggested_params()
        
        if data['trade_type'] == 'buy':
            # For buying: Creator sends tokens to user (simplified demo)
            # In a real system, user would pay ALGO, but for demo we'll simulate it
            asset_txn = transaction.AssetTransferTxn(
                sender=creator_address,
                sp=sp,
                receiver=trader_address,
                amt=token_amount,
                index=int(data['asa_id'])
            )
            
            # Sign and send transaction
            signed_asset = asset_txn.sign(creator_private_key)
            asset_txid = algod_client.send_transaction(signed_asset)
            print(f"📤 Asset transfer sent: {asset_txid}")
            
            # Wait for confirmation
            asset_results = transaction.wait_for_confirmation(algod_client, asset_txid, 4)
            txid = asset_txid
            
        else:
            # For selling: Creator receives tokens from user (simplified demo)
            # In a real system, creator would pay ALGO, but for demo we'll simulate it
            asset_txn = transaction.AssetTransferTxn(
                sender=trader_address,
                sp=sp,
                receiver=creator_address,
                amt=token_amount,
                index=int(data['asa_id'])
            )
            
            # Sign and send transaction
            signed_asset = asset_txn.sign(creator_private_key)  # Simplified: creator signs for user
            asset_txid = algod_client.send_transaction(signed_asset)
            print(f"📤 Asset transfer sent: {asset_txid}")
            
            # Wait for confirmation
            asset_results = transaction.wait_for_confirmation(algod_client, asset_txid, 4)
            txid = asset_txid
        
        # Store trade in database
        conn = sqlite3.connect('creatorvault.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO trades (asa_id, trader_address, trade_type, amount, price, transaction_id)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (int(data['asa_id']), trader_address, data['trade_type'], 
              float(data['amount']), float(data['price']), txid))
        
        conn.commit()
        conn.close()
        
        # Get confirmation round from the asset transaction
        if data['trade_type'] == 'buy':
            confirmed_round = asset_results['confirmed-round']
        else:
            confirmed_round = asset_results['confirmed-round']
        
        return jsonify({
            "success": True,
            "data": {
                "transaction_id": txid,
                "trade_type": data['trade_type'],
                "amount": float(data['amount']),
                "price": float(data['price']),
                "asa_id": int(data['asa_id']),
                "confirmed_round": confirmed_round,
                "algo_amount": algo_amount / 1000000,  # Convert back to ALGO
                "token_amount": token_amount / 1000000  # Convert back to tokens
            }
        })
        
    except Exception as e:
        print(f"❌ Trade error: {e}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/user-balance/<address>', methods=['GET'])
def get_user_balance(address):
    """Get user's ALGO and token balances"""
    try:
        # Get account info
        account_info = algod_client.account_info(address)
        algo_balance = account_info.get('amount', 0) / 1000000  # Convert to ALGO
        
        # Get token balances
        assets = account_info.get('assets', [])
        token_balances = {}
        
        for asset in assets:
            asset_id = asset['asset-id']
            amount = asset['amount']
            token_balances[asset_id] = {
                'balance': amount,
                'balance_tokens': amount / 1000000  # Convert to token units
            }
        
        return jsonify({
            "success": True,
            "address": address,
            "algo_balance": algo_balance,
            "token_balances": token_balances
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/token-info/<int:asa_id>', methods=['GET'])
def get_token_info(asa_id):
    """Get comprehensive token information including max tradeable amount"""
    try:
        # Get creator account
        private_key = mnemonic.to_private_key(CREATOR_MNEMONIC)
        creator_address = account.address_from_private_key(private_key)
        
        # Get account info
        account_info = algod_client.account_info(creator_address)
        assets = account_info.get('assets', [])
        
        # Find the specific asset
        token_balance = 0
        for asset in assets:
            if asset['asset-id'] == asa_id:
                token_balance = asset['amount']
                break
        
        # Get asset info for total supply
        try:
            asset_info = algod_client.asset_info(asa_id)
            total_supply = asset_info['params']['total']
            decimals = asset_info['params']['decimals']
            unit_name = asset_info['params']['unit-name']
            asset_name = asset_info['params']['name']
        except:
            total_supply = 0
            decimals = 6
            unit_name = "UNKNOWN"
            asset_name = "Unknown Token"
        
            return jsonify({
            "success": True,
            "asa_id": asa_id,
            "asset_name": asset_name,
            "unit_name": unit_name,
            "decimals": decimals,
            "total_supply": total_supply,
            "total_supply_tokens": total_supply / (10 ** decimals),
            "creator_balance": token_balance,
            "creator_balance_tokens": token_balance / (10 ** decimals),
            "max_tradeable": token_balance / (10 ** decimals),
            "creator_address": creator_address
        })
        
    except Exception as e:
                return jsonify({
                    "success": False,
            "error": str(e)
        }), 500

@app.route('/token-balance/<int:asa_id>', methods=['GET'])
def get_token_balance(asa_id):
    """Get real-time token balance for a specific ASA"""
    try:
        # Get creator account
        private_key = mnemonic.to_private_key(CREATOR_MNEMONIC)
        creator_address = account.address_from_private_key(private_key)
        
        # Get account info
        account_info = algod_client.account_info(creator_address)
        assets = account_info.get('assets', [])
        
        # Find the specific asset
        token_balance = 0
        for asset in assets:
            if asset['asset-id'] == asa_id:
                token_balance = asset['amount']
                break
        
        return jsonify({
            "success": True,
            "asa_id": asa_id,
            "balance": token_balance,
            "balance_tokens": token_balance / 1000000,  # Convert to token units
            "creator_address": creator_address
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/tokens', methods=['GET'])
def get_tokens():
    """Get all created tokens"""
    try:
        conn = sqlite3.connect('creatorvault.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM tokens ORDER BY created_at DESC
        ''')
        
        tokens = []
        for row in cursor.fetchall():
            tokens.append({
                "asa_id": row[1],
                "creator": row[2],
                "token_name": row[3],
                "token_symbol": row[4],
                "total_supply": row[5],
                "current_price": row[6],
                "market_cap": row[7],
                "volume_24h": row[8],
                "holders": row[9],
                "price_change_24h": row[10],
                "created_at": row[11],
                "youtube_channel_title": row[12],
                "youtube_subscribers": row[13],
                "video_id": row[14],
                "video_title": row[15]
            })
        
        conn.close()
        
        return jsonify({
            "success": True,
            "tokens": tokens
        })
        
    except Exception as e:
        print(f"❌ Error fetching tokens: {e}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    print("🚀 Starting CreatorVault backend server...")
    print(f"📡 Algorand Testnet: {ALGOD_SERVER}")
    print("🔑 Using mnemonic for creator account")
    print("📺 YouTube OAuth enabled")
    
    # Initialize database
    init_db()
    print("💾 SQLite database initialized")
    
    print("🌐 Server running on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)