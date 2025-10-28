#!/bin/bash

# CreatorVault Project Runner
# This script starts both the backend Flask server and frontend React development server

echo "🚀 Starting CreatorVault Project..."
echo "=================================="

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if we're in the right directory
if [ ! -d "contentvault" ]; then
    echo "❌ Error: contentvault directory not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Start Backend Server
echo "🐍 Starting Python Flask backend server..."
cd contentvault/backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies if needed
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt > /dev/null 2>&1

# Start Flask server in background
echo "🌐 Starting Flask server on http://localhost:5001..."
python3 app.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Go back to project root and start frontend
cd ../..

# Start Frontend Server
echo "⚛️  Starting React frontend development server..."
cd contentvault

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Start React development server in background
echo "🌐 Starting React dev server on http://localhost:5175..."
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

echo ""
echo "✅ Both servers are running!"
echo "=================================="
echo "🌐 Frontend: http://localhost:5175"
echo "🐍 Backend:  http://localhost:5001"
echo "📊 Health:   http://localhost:5001/health"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "=================================="

# Wait for user to stop
wait

