@echo off
echo ============================================
echo   DriveFi Setup Script
echo ============================================
echo.

echo Setting up Backend...
cd backend
call npm install
echo.

echo Creating .env file...
if not exist .env (
    echo PORT=5000 > .env
    echo MONGODB_URI=mongodb://localhost:27017/drivefi >> .env
    echo JWT_SECRET=drivefi_super_secret_jwt_key_change_in_production >> .env
    echo NODE_ENV=development >> .env
    echo Created .env file
)
echo.

echo Seeding marketplace data...
call node seed.js
echo.

cd ..

echo.
echo Setting up Frontend...
cd frontend
call npm install
echo.

cd ..

echo.
echo ============================================
echo   Setup Complete!
echo ============================================
echo.
echo To run the application:
echo   1. Start MongoDB
echo   2. Open terminal 1: cd backend && npm run dev
echo   3. Open terminal 2: cd frontend && npm run dev
echo.
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
echo.

