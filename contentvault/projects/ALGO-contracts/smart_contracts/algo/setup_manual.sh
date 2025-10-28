#!/bin/bash

# Manual setup script for Python ASA Backend
# Use this if the automatic setup fails

echo "🔧 Manual Setup for Algorand ASA Backend"
echo "========================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

echo "✅ Python 3 is installed"

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

if [ $? -ne 0 ]; then
    echo "❌ Failed to create virtual environment."
    echo "💡 Try running: python3 -m venv venv"
    exit 1
fi

echo "✅ Virtual environment created"

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

echo "✅ Virtual environment activated"

# Install dependencies
echo "📦 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies."
    echo "💡 Try running manually:"
    echo "   source venv/bin/activate"
    echo "   pip install -r requirements.txt"
    exit 1
fi

echo "✅ Dependencies installed successfully"

echo ""
echo "🎉 Setup complete! To start the server:"
echo "   source venv/bin/activate"
echo "   python start_api.py"
echo ""
echo "Or run: ./run_backend.sh"
