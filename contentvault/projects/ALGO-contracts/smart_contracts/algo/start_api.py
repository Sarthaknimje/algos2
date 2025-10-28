#!/usr/bin/env python3
"""
Startup script for the Python ASA API server
"""

import uvicorn
import os
from api_server import app

if __name__ == "__main__":
    # Get configuration from environment variables
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    reload = os.getenv("API_RELOAD", "true").lower() == "true"
    
    print(f"Starting ASA API server on {host}:{port}")
    print(f"Reload mode: {reload}")
    
    uvicorn.run(
        "api_server:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )
