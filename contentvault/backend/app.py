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

# Import bonding curve classes
try:
    from bonding_curve import BondingCurve, BondingCurveState
except ImportError:
    logger.warning("BondingCurve module not found. Some features may not work.")
    BondingCurve = None
    BondingCurveState = None

# Import web scraper
try:
    from web_scraper import WebScraper
except ImportError:
    logger.warning("WebScraper module not found. Content scraping may not work.")
    WebScraper = None

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
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "expose_headers": ["Content-Type"],
        "max_age": 3600
    }
}, supports_credentials=True)

# Configure Flask session cookies for security
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax' if os.getenv('FLASK_ENV') == 'production' else 'None'
app.config['SESSION_COOKIE_SECURE'] = os.getenv('FLASK_ENV') == 'production'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = 3600  # 1 hour

# Security headers middleware
@app.after_request
def add_security_headers(response):
    """Add security headers to all responses"""
    # CORS headers for credentials support
    origin = request.headers.get('Origin')
    if origin:
        if origin in allowed_origins or os.getenv('FLASK_ENV') != 'production':
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    
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

# YouTube sessions - will be loaded from database
youtube_sessions = {}

def load_youtube_session():
    """Load YouTube session from database"""
    global youtube_sessions
    try:
        conn = sqlite3.connect('creatorvault.db')
        cursor = conn.cursor()
        cursor.execute('SELECT session_key, credentials, channel_id, channel_title, created_at FROM youtube_sessions ORDER BY created_at DESC LIMIT 1')
        row = cursor.fetchone()
        conn.close()
        
        if row:
            session_key, credentials_json, channel_id, channel_title, created_at = row
            youtube_sessions[session_key] = {
                'credentials': json.loads(credentials_json),
                'channel_id': channel_id,
                'channel_title': channel_title
            }
            logger.info(f"✅ YouTube session loaded from database for channel: {channel_title}")
            return True
    except Exception as e:
        logger.error(f"Error loading YouTube session: {e}")
    return False

def save_youtube_session(session_key, credentials_data, channel_id, channel_title):
    """Save YouTube session to database"""
    global youtube_sessions
    try:
        conn = sqlite3.connect('creatorvault.db')
        cursor = conn.cursor()
        
        # Clear old sessions
        cursor.execute('DELETE FROM youtube_sessions')
        
        # Insert new session
        cursor.execute('''
            INSERT INTO youtube_sessions (session_key, credentials, channel_id, channel_title)
            VALUES (?, ?, ?, ?)
        ''', (session_key, json.dumps(credentials_data), channel_id, channel_title))
        
        conn.commit()
        conn.close()
        
        # Update in-memory cache
        youtube_sessions[session_key] = {
            'credentials': credentials_data,
            'channel_id': channel_id,
            'channel_title': channel_title
        }
        
        logger.info(f"✅ YouTube session saved to database for channel: {channel_title}")
        return True
    except Exception as e:
        logger.error(f"Error saving YouTube session: {e}")
        return False

def get_connected_channel_id():
    """Get the connected channel ID from session"""
    if youtube_sessions:
        session_key = list(youtube_sessions.keys())[0]
        return youtube_sessions[session_key].get('channel_id')
    return None

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
            creator_fee REAL DEFAULT 0,
            platform_fee REAL DEFAULT 0,
            total_value REAL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (asa_id) REFERENCES tokens (asa_id)
        )
    ''')
    
    # Add fee columns if they don't exist (for existing databases)
    try:
        cursor.execute('ALTER TABLE trades ADD COLUMN creator_fee REAL DEFAULT 0')
    except sqlite3.OperationalError:
        pass  # Column already exists
    try:
        cursor.execute('ALTER TABLE trades ADD COLUMN platform_fee REAL DEFAULT 0')
    except sqlite3.OperationalError:
        pass  # Column already exists
    try:
        cursor.execute('ALTER TABLE trades ADD COLUMN total_value REAL DEFAULT 0')
    except sqlite3.OperationalError:
        pass  # Column already exists
    
    # Add bonding curve columns if they don't exist
    try:
        cursor.execute('ALTER TABLE tokens ADD COLUMN bonding_curve_config TEXT')
    except sqlite3.OperationalError:
        pass  # Column already exists
    try:
        cursor.execute('ALTER TABLE tokens ADD COLUMN bonding_curve_state TEXT')
    except sqlite3.OperationalError:
        pass  # Column already exists
    try:
        cursor.execute('ALTER TABLE tokens ADD COLUMN liquidity_pool_config TEXT')
    except sqlite3.OperationalError:
        pass  # Column already exists
    try:
        cursor.execute('ALTER TABLE tokens ADD COLUMN is_amm_migrated INTEGER DEFAULT 0')
    except sqlite3.OperationalError:
        pass  # Column already exists
    try:
        cursor.execute('ALTER TABLE tokens ADD COLUMN migration_threshold REAL DEFAULT 0')
    except sqlite3.OperationalError:
        pass  # Column already exists
    try:
        cursor.execute('ALTER TABLE tokens ADD COLUMN platform TEXT')
    except sqlite3.OperationalError:
        pass  # Column already exists
    try:
        cursor.execute('ALTER TABLE tokens ADD COLUMN content_url TEXT')
    except sqlite3.OperationalError:
        pass  # Column already exists
    try:
        cursor.execute('ALTER TABLE tokens ADD COLUMN content_id TEXT')
    except sqlite3.OperationalError:
        pass  # Column already exists
    try:
        cursor.execute('ALTER TABLE tokens ADD COLUMN content_description TEXT')
    except sqlite3.OperationalError:
        pass  # Column already exists
    try:
        cursor.execute('ALTER TABLE tokens ADD COLUMN content_thumbnail TEXT')
    except sqlite3.OperationalError:
        pass  # Column already exists
    
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
    
    # Create YouTube sessions table for persistent auth
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS youtube_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_key TEXT UNIQUE NOT NULL,
            credentials TEXT NOT NULL,
            channel_id TEXT NOT NULL,
            channel_title TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    
    # Load YouTube session from database if exists
    load_youtube_session()
    
    # Initialize bonding curves for existing tokens that don't have them
    try:
        conn = sqlite3.connect('creatorvault.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT asa_id, total_supply, current_price 
            FROM tokens 
            WHERE bonding_curve_config IS NULL OR bonding_curve_config = ''
        ''')
        
        tokens_to_update = cursor.fetchall()
        
        if tokens_to_update and BondingCurve is not None:
            for asa_id, total_supply, current_price in tokens_to_update:
                initial_price = current_price if current_price > 0 else 0.001
                bonding_curve = BondingCurve(
                    initial_price=initial_price,
                    initial_supply=int(total_supply)
                )
                bonding_curve_state = BondingCurveState(
                    token_supply=0,
                    algo_reserve=0
                )
                bonding_curve_config_json = json.dumps(bonding_curve.to_dict())
                bonding_curve_state_json = json.dumps(bonding_curve_state.to_dict())
                
                cursor.execute('''
                    UPDATE tokens 
                    SET bonding_curve_config = ?, bonding_curve_state = ?
                    WHERE asa_id = ?
                ''', (bonding_curve_config_json, bonding_curve_state_json, asa_id))
            
            conn.commit()
            if tokens_to_update:
                logger.info(f"✅ Initialized bonding curves for {len(tokens_to_update)} existing tokens")
        
        conn.close()
    except Exception as e:
        logger.warning(f"Could not initialize bonding curves for existing tokens: {e}")

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
        
        # Store credentials in database for persistence across restarts
        session_id = f"yt_session_{secrets.token_hex(8)}"
        credentials_data = {
            'token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id,
            'client_secret': credentials.client_secret,
            'scopes': list(credentials.scopes) if credentials.scopes else []
        }
        
        # Save to database for persistence
        save_youtube_session(session_id, credentials_data, channel_id, channel_title)
        
        print(f"✅ YouTube OAuth successful for channel: {channel_title} ({channel_id})")
        print(f"💾 Stored in database - Session ID: {session_id}")
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
        }), 500

@app.route('/auth/youtube/channel', methods=['GET'])
def get_youtube_channel():
    """Get full YouTube channel information"""
    try:
        if not youtube_sessions:
            return jsonify({
                "success": False,
                "error": "Not authenticated",
                "channel": None
            }), 200  # Return 200 with success: false so frontend can handle gracefully
        
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
        
        # Refresh token if needed
        if credentials.expired:
            credentials.refresh(Request())
        
        youtube = build('youtube', 'v3', credentials=credentials)
        channels_response = youtube.channels().list(
            part='snippet,statistics',
            mine=True
        ).execute()
        
        if channels_response['items']:
            channel = channels_response['items'][0]
            snippet = channel['snippet']
            statistics = channel['statistics']
            
            return jsonify({
                "success": True,
                "channel": {
                    "id": channel['id'],
                    "title": snippet['title'],
                    "description": snippet.get('description', ''),
                    "thumbnail": snippet['thumbnails']['high']['url'],
                    "subscriberCount": int(statistics.get('subscriberCount', 0)),
                    "viewCount": int(statistics.get('viewCount', 0)),
                    "videoCount": int(statistics.get('videoCount', 0))
                }
            })
        else:
            return jsonify({
                "success": False,
                "error": "No channel found"
            }), 404
            
    except Exception as e:
        logger.error(f"Error fetching YouTube channel: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
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
    """Create a creator token (ASA) with bonding curve - token already created via Pera Wallet"""
    try:
        data = request.get_json()
        
        # Check if asset_id is provided (token already created via Pera Wallet)
        asset_id = data.get('asset_id')
        if not asset_id:
            return jsonify({
                "success": False,
                "error": "asset_id is required. Token must be created via Pera Wallet first."
            }), 400
        
        # Get creator address from request (token was created via Pera Wallet)
        creator_address = data.get('creator_address')
        if not creator_address:
            return jsonify({
                "success": False,
                "error": "creator_address is required"
            }), 400
        
        # YouTube authentication is optional for multi-platform tokens
        channel_title = data.get('youtube_channel_title', 'Creator')
        subscribers = data.get('youtube_subscribers', 0)
        
        if youtube_sessions:
            try:
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
                
                if channels_response['items']:
                    channel = channels_response['items'][0]
                    channel_title = channel['snippet']['title']
                    subscribers = int(channel['statistics'].get('subscriberCount', 0))
            except Exception as e:
                logger.warning(f"Could not fetch YouTube channel info: {e}")
                # Continue without YouTube data
        
        # Calculate market cap
        initial_price = float(data.get('initial_price', data.get('token_price', 0.001)))
        market_cap = float(data['total_supply']) * initial_price
        
        # Initialize bonding curve
        if BondingCurve is not None:
            bonding_curve = BondingCurve(
                initial_price=initial_price,
                initial_supply=int(data['total_supply'])
            )
            bonding_curve_state = BondingCurveState(
                token_supply=0,  # Start with 0 tokens in circulation
                algo_reserve=0   # Start with 0 ALGO in reserve
            )
            bonding_curve_config_json = json.dumps(bonding_curve.to_dict())
            bonding_curve_state_json = json.dumps(bonding_curve_state.to_dict())
        else:
            bonding_curve_config_json = None
            bonding_curve_state_json = None
        
        # Store in database
        conn = sqlite3.connect('creatorvault.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO tokens (asa_id, creator, token_name, token_symbol, total_supply, 
                              current_price, market_cap, youtube_channel_title, youtube_subscribers,
                              bonding_curve_config, bonding_curve_state, platform, content_url,
                              content_id, content_description, content_thumbnail)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            asset_id, 
            data.get('creator_address', creator_address),
            data['token_name'], 
            data['token_symbol'], 
            int(data['total_supply']), 
            initial_price, 
            market_cap,
            data.get('youtube_channel_title', channel_title),
            data.get('youtube_subscribers', subscribers),
            bonding_curve_config_json,
            bonding_curve_state_json,
            data.get('platform', 'youtube'),
            data.get('content_url', ''),
            data.get('content_id', ''),
            data.get('description', ''),
            data.get('content_thumbnail', '')
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "data": {
                "asset_id": asset_id,
                "token_name": data['token_name'],
                "token_symbol": data['token_symbol'],
                "total_supply": int(data['total_supply']),
                "current_price": initial_price,
                "market_cap": market_cap,
                "creator": creator_address,
                "transaction_id": f"tx_{asset_id}",
                "youtube_channel": {
                    "title": channel_title,
                    "subscribers": subscribers
                },
                "bonding_curve_initialized": bonding_curve_config_json is not None
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
        
        # Get column names
        columns = [description[0] for description in cursor.description]
        
        tokens = []
        for row in cursor.fetchall():
            token_dict = dict(zip(columns, row))
            tokens.append({
                "asa_id": token_dict.get('asa_id', 0),
                "creator": token_dict.get('creator', ''),
                "creator_address": token_dict.get('creator', ''),
                "token_name": token_dict.get('token_name', ''),
                "token_symbol": token_dict.get('token_symbol', ''),
                "total_supply": token_dict.get('total_supply', 0),
                "current_price": token_dict.get('current_price', 0),
                "market_cap": token_dict.get('market_cap', 0),
                "volume_24h": token_dict.get('volume_24h', 0),
                "holders": token_dict.get('holders', 0),
                "price_change_24h": token_dict.get('price_change_24h', 0),
                "created_at": token_dict.get('created_at', ''),
                "youtube_channel_title": token_dict.get('youtube_channel_title', ''),
                "youtube_subscribers": token_dict.get('youtube_subscribers', 0),
                "video_id": token_dict.get('video_id', ''),
                "video_title": token_dict.get('video_title', ''),
                "platform": token_dict.get('platform', ''),
                "content_url": token_dict.get('content_url', ''),
                "content_id": token_dict.get('content_id', ''),
                "content_description": token_dict.get('content_description', ''),
                "content_thumbnail": token_dict.get('content_thumbnail', '')
            })
        
        conn.close()
        
        return jsonify({
            "success": True,
            "tokens": tokens
        })
        
    except Exception as e:
        logger.error(f"❌ Error fetching tokens: {e}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/trades/<int:asa_id>', methods=['GET'])
@handle_errors
def get_trades(asa_id):
    """Get trade history for a specific token"""
    try:
        timeframe = request.args.get('timeframe', '24h')
        limit = int(request.args.get('limit', 100))
        
        conn = sqlite3.connect('creatorvault.db')
        cursor = conn.cursor()
        
        # Calculate time filter
        if timeframe == '1h':
            time_filter = "datetime('now', '-1 hour')"
        elif timeframe == '24h':
            time_filter = "datetime('now', '-24 hours')"
        elif timeframe == '7d':
            time_filter = "datetime('now', '-7 days')"
        elif timeframe == '30d':
            time_filter = "datetime('now', '-30 days')"
        else:
            time_filter = "datetime('now', '-1 year')"
        
        cursor.execute(f'''
            SELECT trade_type, amount, price, created_at, transaction_id, trader_address
            FROM trades
            WHERE asa_id = ? AND created_at >= {time_filter}
            ORDER BY created_at DESC
            LIMIT ?
        ''', (asa_id, limit))
        
        trades = []
        for row in cursor.fetchall():
            trades.append({
                'type': row[0],
                'amount': row[1],
                'price': row[2],
                'timestamp': row[3],
                'transaction_id': row[4],
                'trader_address': row[5]
            })
        
        conn.close()
        
        return jsonify({
            "success": True,
            "trades": trades,
            "count": len(trades)
        })
    except Exception as e:
        logger.error(f"Error fetching trades: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/token/<int:asa_id>', methods=['GET'])
@handle_errors
def get_token_details(asa_id):
    """Get detailed token information including bonding curve state"""
    try:
        conn = sqlite3.connect('creatorvault.db')
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM tokens WHERE asa_id = ?', (asa_id,))
        row = cursor.fetchone()
        
        if not row:
            return jsonify({"success": False, "error": "Token not found"}), 404
        
        # Get column names
        columns = [description[0] for description in cursor.description]
        token_dict = dict(zip(columns, row))
        
        # Parse bonding curve if available
        bonding_curve_config = None
        bonding_curve_state = None
        if token_dict.get('bonding_curve_config'):
            try:
                bonding_curve_config = json.loads(token_dict['bonding_curve_config'])
            except:
                pass
        if token_dict.get('bonding_curve_state'):
            try:
                bonding_curve_state = json.loads(token_dict['bonding_curve_state'])
            except:
                pass
        
        # Get recent trades count
        cursor.execute('SELECT COUNT(*) FROM trades WHERE asa_id = ?', (asa_id,))
        trade_count = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            "success": True,
            "token": {
                **token_dict,
                "bonding_curve_config": bonding_curve_config,
                "bonding_curve_state": bonding_curve_state,
                "trade_count": trade_count
            }
        })
    except Exception as e:
        logger.error(f"Error fetching token details: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/user-tokens/<address>', methods=['GET'])
@handle_errors
def get_user_tokens(address):
    """Get all tokens created by a specific wallet address"""
    try:
        conn = sqlite3.connect('creatorvault.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM tokens WHERE creator = ? ORDER BY created_at DESC
        ''', (address,))
        
        # Get column names
        columns = [description[0] for description in cursor.description]
        
        tokens = []
        for row in cursor.fetchall():
            token_dict = dict(zip(columns, row))
            tokens.append({
                "asa_id": token_dict.get('asa_id', 0),
                "token_name": token_dict.get('token_name', ''),
                "token_symbol": token_dict.get('token_symbol', ''),
                "total_supply": token_dict.get('total_supply', 0),
                "current_price": token_dict.get('current_price', 0),
                "market_cap": token_dict.get('market_cap', 0),
                "volume_24h": token_dict.get('volume_24h', 0),
                "holders": token_dict.get('holders', 0),
                "price_change_24h": token_dict.get('price_change_24h', 0),
                "created_at": token_dict.get('created_at', ''),
                "platform": token_dict.get('platform', ''),
                "content_url": token_dict.get('content_url', ''),
                "content_thumbnail": token_dict.get('content_thumbnail', ''),
                "youtube_channel_title": token_dict.get('youtube_channel_title', '')
            })
        
        conn.close()
        
        return jsonify({
            "success": True,
            "tokens": tokens
        })
    except Exception as e:
        logger.error(f"Error fetching user tokens: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/creator-earnings/<address>', methods=['GET'])
@handle_errors
def get_creator_earnings(address):
    """Get total earnings for a creator from trading fees"""
    try:
        conn = sqlite3.connect('creatorvault.db')
        cursor = conn.cursor()

        # Get all tokens created by this address
        cursor.execute('SELECT asa_id, token_name, token_symbol FROM tokens WHERE creator = ?', (address,))
        creator_tokens = cursor.fetchall()
        
        total_earnings = 0
        earnings_by_token = []

        for asa_id, token_name, token_symbol in creator_tokens:
            # Sum creator fees for this token
            cursor.execute('SELECT SUM(creator_fee) FROM trades WHERE asa_id = ?', (asa_id,))
            token_fee_sum = cursor.fetchone()[0] or 0
            total_earnings += token_fee_sum
            earnings_by_token.append({
                "asa_id": asa_id,
                "token_name": token_name,
                "token_symbol": token_symbol,
                "earned_algo": token_fee_sum
            })
        
        conn.close()

        return jsonify({
            "success": True,
            "total_earnings": total_earnings,
            "earnings_by_token": earnings_by_token,
            "creator_fee_rate": 0.05,  # 5%
            "platform_fee_rate": 0.02  # 2%
        })
    except Exception as e:
        logger.error(f"Error fetching creator earnings: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/bonding-curve/buy', methods=['POST'])
@handle_errors
def bonding_curve_buy():
    """Buy tokens using bonding curve"""
    if BondingCurve is None:
        return jsonify({"success": False, "error": "Bonding curve not available"}), 500
    
    try:
        data = request.get_json()
        asa_id = data.get('asa_id')
        token_amount = float(data.get('token_amount', 0))
        trader_address = data.get('trader_address')
        
        if not asa_id or not token_amount or not trader_address:
            return jsonify({"success": False, "error": "Missing required fields"}), 400
        
        conn = sqlite3.connect('creatorvault.db')
        cursor = conn.cursor()
        
        cursor.execute('SELECT bonding_curve_config, bonding_curve_state, current_price FROM tokens WHERE asa_id = ?', (asa_id,))
        row = cursor.fetchone()
        
        if not row:
            return jsonify({"success": False, "error": "Token not found"}), 404
        
        bonding_curve_config_json, bonding_curve_state_json, current_price = row
        
        if not bonding_curve_config_json or not bonding_curve_state_json:
            return jsonify({"success": False, "error": "Bonding curve not initialized"}), 400
        
        curve = BondingCurve.from_dict(json.loads(bonding_curve_config_json))
        state = BondingCurveState.from_dict(json.loads(bonding_curve_state_json))
        
        result = curve.calculate_buy_price(state.token_supply, state.algo_reserve, token_amount)
        new_state = BondingCurveState(token_supply=result['new_supply'], algo_reserve=result['new_algo_reserve'])
        
        # Calculate trading fees (5% creator fee, 2% platform fee)
        CREATOR_FEE_RATE = 0.05  # 5%
        PLATFORM_FEE_RATE = 0.02  # 2%
        total_value = result['algo_cost']
        creator_fee = total_value * CREATOR_FEE_RATE
        platform_fee = total_value * PLATFORM_FEE_RATE
        
        # Get creator address from token
        cursor.execute('SELECT creator FROM tokens WHERE asa_id = ?', (asa_id,))
        creator_row = cursor.fetchone()
        creator_address = creator_row[0] if creator_row else None
        
        # Transfer tokens from creator to buyer
        # NOTE: This only works if the token creator is the backend wallet
        # For user-created tokens, the creator needs to manually transfer or use a smart contract
        token_transfer_txid = None
        if creator_address:
            try:
                # Use creator's private key to transfer tokens
                creator_private_key = mnemonic.to_private_key(CREATOR_MNEMONIC)
                creator_wallet_address = account.address_from_private_key(creator_private_key)
                
                # Only transfer if creator wallet matches token creator
                if creator_wallet_address == creator_address:
                    sp = algod_client.suggested_params()
                    # Convert token amount to integer (no decimals)
                    token_amount_int = int(token_amount)
                    
                    # Create asset transfer transaction
                    asset_txn = transaction.AssetTransferTxn(
                        sender=creator_address,
                        sp=sp,
                        receiver=trader_address,
                        amt=token_amount_int,
                        index=int(asa_id)
                    )
                    
                    # Sign and send
                    signed_asset = asset_txn.sign(creator_private_key)
                    token_transfer_txid = algod_client.send_transaction(signed_asset)
                    logger.info(f"✅ Token transfer sent: {token_transfer_txid} (ASA {asa_id}, {token_amount_int} tokens to {trader_address})")
                else:
                    logger.warning(f"⚠️ Token creator ({creator_address}) doesn't match backend wallet ({creator_wallet_address}). Creator must manually transfer tokens or use smart contract.")
            except Exception as e:
                logger.error(f"Error transferring tokens: {e}")
                # Continue even if transfer fails - user already paid ALGO
        
        cursor.execute('UPDATE tokens SET bonding_curve_state = ?, current_price = ?, market_cap = ? WHERE asa_id = ?',
                      (json.dumps(new_state.to_dict()), result['new_price'], result['new_supply'] * result['new_price'], asa_id))
        cursor.execute('INSERT INTO trades (asa_id, trader_address, trade_type, amount, price, transaction_id, creator_fee, platform_fee, total_value) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                      (asa_id, trader_address, 'buy', token_amount, result['new_price'], data.get('transaction_id', ''), creator_fee, platform_fee, total_value))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "algo_cost": result['algo_cost'],
            "token_amount": token_amount,
            "new_price": result['new_price'],
            "price_impact": ((result['new_price'] - current_price) / current_price) * 100 if current_price > 0 else 0,
            "token_transfer_txid": token_transfer_txid
        })
    except Exception as e:
        logger.error(f"Error in bonding curve buy: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/bonding-curve/sell', methods=['POST'])
@handle_errors
def bonding_curve_sell():
    """Sell tokens using bonding curve"""
    if BondingCurve is None:
        return jsonify({"success": False, "error": "Bonding curve not available"}), 500
    
    try:
        data = request.get_json()
        asa_id = data.get('asa_id')
        token_amount = float(data.get('token_amount', 0))
        trader_address = data.get('trader_address')
        
        if not asa_id or not token_amount or not trader_address:
            return jsonify({"success": False, "error": "Missing required fields"}), 400
        
        conn = sqlite3.connect('creatorvault.db')
        cursor = conn.cursor()
        
        cursor.execute('SELECT bonding_curve_config, bonding_curve_state, current_price FROM tokens WHERE asa_id = ?', (asa_id,))
        row = cursor.fetchone()
        
        if not row:
            return jsonify({"success": False, "error": "Token not found"}), 404
        
        bonding_curve_config_json, bonding_curve_state_json, current_price = row
        
        if not bonding_curve_config_json or not bonding_curve_state_json:
            return jsonify({"success": False, "error": "Bonding curve not initialized"}), 400
        
        curve = BondingCurve.from_dict(json.loads(bonding_curve_config_json))
        state = BondingCurveState.from_dict(json.loads(bonding_curve_state_json))
        
        result = curve.calculate_sell_price(state.token_supply, state.algo_reserve, token_amount)
        new_state = BondingCurveState(token_supply=result['new_supply'], algo_reserve=result['new_algo_reserve'])
        
        # Calculate trading fees (5% creator fee, 2% platform fee)
        CREATOR_FEE_RATE = 0.05  # 5%
        PLATFORM_FEE_RATE = 0.02  # 2%
        total_value = result['algo_received']
        creator_fee = total_value * CREATOR_FEE_RATE
        platform_fee = total_value * PLATFORM_FEE_RATE
        
        cursor.execute('UPDATE tokens SET bonding_curve_state = ?, current_price = ?, market_cap = ? WHERE asa_id = ?',
                      (json.dumps(new_state.to_dict()), result['new_price'], result['new_supply'] * result['new_price'], asa_id))
        cursor.execute('INSERT INTO trades (asa_id, trader_address, trade_type, amount, price, transaction_id, creator_fee, platform_fee, total_value) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                      (asa_id, trader_address, 'sell', token_amount, result['new_price'], data.get('transaction_id', ''), creator_fee, platform_fee, total_value))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "algo_received": result['algo_received'],
            "token_amount": token_amount,
            "new_price": result['new_price'],
            "price_impact": ((current_price - result['new_price']) / current_price) * 100 if current_price > 0 else 0
        })
    except Exception as e:
        logger.error(f"Error in bonding curve sell: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/bonding-curve/estimate', methods=['POST'])
@handle_errors
def bonding_curve_estimate():
    """Estimate trade without executing"""
    if BondingCurve is None:
        return jsonify({"success": False, "error": "Bonding curve not available"}), 500
    
    try:
        data = request.get_json()
        asa_id = data.get('asa_id')
        token_amount = float(data.get('token_amount', 0))
        trade_type = data.get('trade_type', 'buy')
        
        if not asa_id:
            return jsonify({"success": False, "error": "Missing asa_id"}), 400
        
        conn = sqlite3.connect('creatorvault.db')
        cursor = conn.cursor()
        
        cursor.execute('SELECT bonding_curve_config, bonding_curve_state, current_price, total_supply FROM tokens WHERE asa_id = ?', (asa_id,))
        row = cursor.fetchone()
        
        if not row:
            conn.close()
            return jsonify({"success": False, "error": "Token not found"}), 404
        
        bonding_curve_config_json, bonding_curve_state_json, current_price, total_supply = row
        
        # Initialize bonding curve if missing or empty
        if (not bonding_curve_config_json or not bonding_curve_state_json or 
            (isinstance(bonding_curve_config_json, str) and bonding_curve_config_json.strip() == '') or
            (isinstance(bonding_curve_state_json, str) and bonding_curve_state_json.strip() == '')):
            logger.warning(f"Bonding curve not initialized for token {asa_id}, initializing now...")
            initial_price = current_price if current_price and current_price > 0 else 0.001
            bonding_curve = BondingCurve(
                initial_price=initial_price,
                initial_supply=int(total_supply) if total_supply else 1000000
            )
            bonding_curve_state = BondingCurveState(
                token_supply=0,
                algo_reserve=0
            )
            bonding_curve_config_json = json.dumps(bonding_curve.to_dict())
            bonding_curve_state_json = json.dumps(bonding_curve_state.to_dict())
            
            # Update database
            cursor.execute('''
                UPDATE tokens 
                SET bonding_curve_config = ?, bonding_curve_state = ?
                WHERE asa_id = ?
            ''', (bonding_curve_config_json, bonding_curve_state_json, asa_id))
            conn.commit()
            logger.info(f"✅ Initialized bonding curve for token {asa_id}")
        
        curve = BondingCurve.from_dict(json.loads(bonding_curve_config_json))
        state = BondingCurveState.from_dict(json.loads(bonding_curve_state_json))
        
        if trade_type == 'buy':
            result = curve.calculate_buy_price(state.token_supply, state.algo_reserve, token_amount)
            return jsonify({
                "success": True,
                "algo_cost": result['algo_cost'],
                "new_price": result['new_price'],
                "price_impact": ((result['new_price'] - current_price) / current_price) * 100 if current_price > 0 else 0
            })
        else:
            result = curve.calculate_sell_price(state.token_supply, state.algo_reserve, token_amount)
            return jsonify({
                "success": True,
                "algo_received": result['algo_received'],
                "new_price": result['new_price'],
                "price_impact": ((current_price - result['new_price']) / current_price) * 100 if current_price > 0 else 0
            })
    except Exception as e:
        logger.error(f"Error in bonding curve estimate: {e}")
        try:
            conn.close()
        except:
            pass
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        try:
            conn.close()
        except:
            pass

@app.route('/api/scrape-content', methods=['POST', 'OPTIONS'])
@cross_origin(supports_credentials=True)
@handle_errors
def scrape_content():
    """Scrape content from Instagram, Twitter, or LinkedIn URLs"""
    if WebScraper is None:
        return jsonify({"success": False, "error": "Web scraper not available"}), 500
    
    try:
        data = request.get_json()
        url = data.get('url', '').strip()
        platform = data.get('platform', '').lower()
        username = data.get('username', '').strip()
        
        if not url:
            return jsonify({"success": False, "error": "URL is required"}), 400
        
        # Detect platform from URL if not provided
        if not platform:
            if 'instagram.com' in url or 'instagr.am' in url:
                platform = 'instagram'
            elif 'twitter.com' in url or 'x.com' in url:
                platform = 'twitter'
            elif 'linkedin.com' in url:
                platform = 'linkedin'
            else:
                return jsonify({"success": False, "error": "Unsupported platform. Use Instagram, Twitter/X, or LinkedIn."}), 400
        
        scraper = WebScraper()
        result = None
        
        if platform == 'instagram':
            result = scraper.scrape_instagram_reel(url)
        elif platform == 'twitter':
            result = scraper.scrape_twitter_tweet(url)
        elif platform == 'linkedin':
            result = scraper.scrape_linkedin_post(url)
        else:
            return jsonify({"success": False, "error": f"Unsupported platform: {platform}"}), 400
        
        if result:
            return jsonify({
                "success": True,
                "content": result,
                "platform": platform
            })
        else:
            return jsonify({
                "success": False,
                "error": "Could not scrape content. Please check the URL and try again."
            }), 404
            
    except Exception as e:
        logger.error(f"Error scraping content: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/verify-ownership', methods=['POST', 'OPTIONS'])
@cross_origin(supports_credentials=True)
def verify_ownership():
    """Verify ownership of a URL for Instagram, Twitter, or LinkedIn"""
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', request.headers.get('Origin', '*'))
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        return response, 200
    
    try:
        if WebScraper is None:
            return jsonify({"success": False, "error": "Web scraper not available"}), 500
        
        data = request.get_json()
        url = data.get('url', '').strip()
        platform = data.get('platform', '').lower()
        username = data.get('username', '').strip()
        
        if not url:
            return jsonify({"success": False, "error": "URL is required"}), 400
        
        if not platform:
            # Auto-detect platform
            if 'instagram.com' in url or 'instagr.am' in url:
                platform = 'instagram'
            elif 'twitter.com' in url or 'x.com' in url:
                platform = 'twitter'
            elif 'linkedin.com' in url:
                platform = 'linkedin'
            elif 'youtube.com' in url or 'youtu.be' in url:
                # YouTube doesn't need ownership verification (uses API)
                return jsonify({
                    "success": True,
                    "verified": True,
                    "message": "YouTube content is already verified via API"
                })
            else:
                return jsonify({"success": False, "error": "Unsupported platform"}), 400
        
        # YouTube doesn't need ownership verification
        if platform == 'youtube':
            return jsonify({
                "success": True,
                "verified": True,
                "message": "YouTube content is already verified via API"
            })
        
        # Get additional verification parameters
        wallet_address = data.get('wallet_address', '').strip()
        verification_code = data.get('verification_code', '').strip()
        
        scraper = WebScraper()
        verification_result = scraper.verify_url_ownership(
            url=url, 
            platform=platform, 
            claimed_username=username,
            wallet_address=wallet_address,
            verification_code=verification_code
        )
        
        return jsonify({
            "success": True,
            "verified": verification_result.get('verified', False),
            "message": verification_result.get('message', 'Verification completed'),
            "requires_bio_verification": verification_result.get('requires_bio_verification', False),
            "verification_code": verification_result.get('verification_code', ''),
            "url_username": verification_result.get('url_username', ''),
            "verified_username": verification_result.get('verified_username', '')
        })
        
    except Exception as e:
        logger.error(f"Error verifying ownership: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/youtube/videos', methods=['GET'])
@handle_errors
def get_youtube_videos():
    """Get all YouTube videos with tokenization status"""
    try:
        if not youtube_sessions:
            return jsonify({
                "success": False,
                "error": "YouTube authentication required"
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
        
        # Get YouTube channel and videos
        youtube = build('youtube', 'v3', credentials=credentials)
        
        # Get channel info
        channels_response = youtube.channels().list(
            part='snippet,statistics',
            mine=True
        ).execute()
        
        if not channels_response['items']:
            return jsonify({"success": False, "error": "No channel found"}), 404
        
        channel = channels_response['items'][0]
        channel_id = channel['id']
        
        # Get all videos
        videos_response = youtube.search().list(
            part='snippet',
            channelId=channel_id,
            type='video',
            maxResults=50,
            order='date'
        ).execute()
        
        # Get tokenized videos from database
        conn = sqlite3.connect('creatorvault.db')
        cursor = conn.cursor()
        # Check both content_id and content_url for YouTube videos
        cursor.execute('''
            SELECT content_id, content_url, asa_id, token_name, token_symbol 
            FROM tokens 
            WHERE platform = ? AND (content_id IS NOT NULL OR content_url IS NOT NULL)
        ''', ('youtube',))
        
        tokenized_videos = {}
        for row in cursor.fetchall():
            content_id, content_url, asa_id, token_name, token_symbol = row
            # Extract video ID from content_id or content_url
            video_id = None
            if content_id:
                video_id = content_id
            elif content_url:
                # Extract video ID from YouTube URL
                import re
                match = re.search(r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})', content_url)
                if match:
                    video_id = match.group(1)
            
            if video_id:
                tokenized_videos[video_id] = {
                    'asa_id': asa_id,
                    'token_name': token_name,
                    'token_symbol': token_symbol
                }
        conn.close()
        
        # Format videos with tokenization status
        videos = []
        for item in videos_response.get('items', []):
            video_id = item['id']['videoId']
            video_data = {
                'id': video_id,
                'title': item['snippet']['title'],
                'description': item['snippet']['description'],
                'thumbnail': item['snippet']['thumbnails']['high']['url'],
                'publishedAt': item['snippet']['publishedAt'],
                'url': f"https://www.youtube.com/watch?v={video_id}",
                'isTokenized': video_id in tokenized_videos,
                'tokenInfo': tokenized_videos.get(video_id)
            }
            videos.append(video_data)
        
        return jsonify({
            "success": True,
            "videos": videos,
            "channel": {
                "id": channel_id,
                "title": channel['snippet']['title'],
                "subscriberCount": int(channel['statistics'].get('subscriberCount', 0))
            }
        })
        
    except Exception as e:
        logger.error(f"Error fetching YouTube videos: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/youtube/video-info', methods=['POST', 'OPTIONS'])
@cross_origin(supports_credentials=True)
def get_youtube_video_info():
    """Get YouTube video info directly from API (no scraping needed)"""
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', request.headers.get('Origin', '*'))
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        return response, 200
    
    # Use handle_errors only for POST requests
    try:
        if not youtube_sessions:
            return jsonify({
                "success": False,
                "error": "YouTube authentication required"
            }), 401
        
        data = request.get_json()
        video_url = data.get('url', '').strip()
        
        if not video_url:
            return jsonify({"success": False, "error": "Video URL is required"}), 400
        
        # Extract video ID from URL
        import re
        video_id_match = re.search(r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})', video_url)
        if not video_id_match:
            return jsonify({"success": False, "error": "Invalid YouTube URL"}), 400
        
        video_id = video_id_match.group(1)
        
        session_key = list(youtube_sessions.keys())[0]
        session_data = youtube_sessions[session_key]
        
        # Get connected channel ID for ownership verification
        connected_channel_id = session_data.get('channel_id')
        
        credentials_data = session_data['credentials']
        credentials = Credentials(
            token=credentials_data['token'],
            refresh_token=credentials_data['refresh_token'],
            token_uri=credentials_data['token_uri'],
            client_id=credentials_data['client_id'],
            client_secret=credentials_data['client_secret'],
            scopes=credentials_data['scopes']
        )
        
        # Get video info from YouTube API
        youtube = build('youtube', 'v3', credentials=credentials)
        video_response = youtube.videos().list(
            part='snippet,statistics,contentDetails',
            id=video_id
        ).execute()
        
        if not video_response.get('items'):
            return jsonify({"success": False, "error": "Video not found or not accessible"}), 404
        
        video = video_response['items'][0]
        video_channel_id = video['snippet']['channelId']
        
        # CRITICAL: Verify the video belongs to the connected channel
        is_owned = (video_channel_id == connected_channel_id)
        
        if not is_owned:
            logger.warning(f"⚠️ User tried to tokenize video from another channel. Video channel: {video_channel_id}, Connected channel: {connected_channel_id}")
        
        # Check if already tokenized
        conn = sqlite3.connect('creatorvault.db')
        cursor = conn.cursor()
        cursor.execute('SELECT asa_id, token_name, token_symbol FROM tokens WHERE content_id = ? OR content_url LIKE ?', 
                      (video_id, f'%{video_id}%'))
        existing_token = cursor.fetchone()
        conn.close()
        
        video_data = {
            'id': video_id,
            'title': video['snippet']['title'],
            'description': video['snippet']['description'],
            'thumbnail': video['snippet']['thumbnails']['high']['url'],
            'publishedAt': video['snippet']['publishedAt'],
            'viewCount': int(video['statistics'].get('viewCount', 0)),
            'likeCount': int(video['statistics'].get('likeCount', 0)),
            'commentCount': int(video['statistics'].get('commentCount', 0)),
            'channelId': video_channel_id,
            'channelTitle': video['snippet']['channelTitle'],
            'url': f"https://www.youtube.com/watch?v={video_id}",
            'platform': 'youtube',
            'isTokenized': existing_token is not None,
            'tokenInfo': {
                'asa_id': existing_token[0],
                'token_name': existing_token[1],
                'token_symbol': existing_token[2]
            } if existing_token else None,
            # NEW: Add ownership verification
            'isOwned': is_owned,
            'connectedChannelId': connected_channel_id,
            'ownershipMessage': 'You own this video and can tokenize it.' if is_owned else 'This video belongs to another channel. You can only tokenize your own content.'
        }
        
        return jsonify({
            "success": True,
            "content": video_data,
            "verified": is_owned
        })
        
    except Exception as e:
        logger.error(f"Error fetching YouTube video info: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

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