#!/bin/bash

echo "🚀 CTF-ISE Setup Guide"
echo "======================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm install has been run
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Check if .env file exists and has been configured
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please configure your Firebase credentials in .env file"
else
    echo "✅ .env file exists"
    
    # Check if .env has placeholder values
    if grep -q "your-firebase-project-id" .env; then
        echo "⚠️  .env file contains placeholder values. Please update with your Firebase credentials."
    else
        echo "✅ .env file appears to be configured"
    fi
fi

echo ""
echo "🔧 Firebase Setup Instructions:"
echo "1. Go to https://console.firebase.google.com/"
echo "2. Create a new project or select existing one"
echo "3. Enable Authentication and Firestore Database"
echo "4. Go to Project Settings > Service Accounts"
echo "5. Click 'Generate new private key' and download the JSON file"
echo "6. Copy the values from the JSON file to your .env file"
echo ""
echo "📚 Required Firebase services:"
echo "   - Authentication (for user login/registration)"
echo "   - Firestore Database (for storing challenges and user data)"
echo ""
echo "🏃 To start the application:"
echo "   npm start        # Production mode"
echo "   npm run dev      # Development mode with auto-restart"
echo ""
echo "🌐 The application will be available at: http://localhost:5000"
