#!/bin/bash

echo "🚀 Starting Python Backend for Real ASA Creation"
echo "================================================"

# Navigate to backend directory
cd backend

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python3 first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3 first."
    exit 1
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

# Start the Python backend
echo "🐍 Starting Python Flask backend on http://localhost:8000"
echo "📡 Algorand Testnet: https://testnet-api.algonode.cloud"
echo "🔑 Using mnemonic for creator account"
echo ""
echo "Press Ctrl+C to stop the backend"
echo ""

python3 app.py
