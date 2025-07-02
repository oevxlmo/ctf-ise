# Local Development Setup

## Quick Start

1. **Run the setup script:**
   ```bash
   ./setup.sh
   ```

2. **Configure Firebase:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication and Firestore Database
   - Download service account credentials (JSON file)
   - Update `.env` file with your credentials

3. **Start the application:**
   ```bash
   npm start
   ```

## Detailed Firebase Setup

### 1. Create Firebase Project
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Follow the setup wizard

### 2. Enable Required Services

#### Authentication
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider

#### Firestore Database
1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for development
4. Select a location for your database

### 3. Get Service Account Credentials
1. Go to Project Settings (gear icon)
2. Click "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file
5. Copy values to your `.env` file:

```env
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-project-id-from-json
FIREBASE_PRIVATE_KEY_ID=your-private-key-id-from-json
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key-from-json\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-client-email-from-json
FIREBASE_CLIENT_ID=your-client-id-from-json
```

### 4. Database URL Configuration
Update the `databaseURL` in `app.js` if needed:
```javascript
databaseURL: "https://your-project-id-default-rtdb.firebaseio.com"
```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-restart
- `./setup.sh` - Run setup guide

## Project Structure

```
ctf-ise/
├── app.js              # Main application file
├── package.json        # Dependencies and scripts
├── .env               # Environment variables (create from .env.example)
├── .env.example       # Environment variables template
├── setup.sh           # Setup script
├── public/            # Static files
│   ├── files/         # Challenge files
│   └── styles/        # CSS stylesheets
└── views/             # EJS templates
    ├── *.ejs          # Page templates
    └── partials/      # Reusable template components
```

## Troubleshooting

### Common Issues

1. **Firebase initialization errors**
   - Check that all environment variables are set correctly
   - Ensure private key is properly formatted with newlines
   - Verify Firebase project ID matches your project

2. **Port already in use**
   - Change the PORT in `.env` file
   - Or kill the process using the port: `lsof -ti:5000 | xargs kill`

3. **Module not found errors**
   - Run `npm install` to ensure all dependencies are installed

### Getting Help

1. Check the console output for specific error messages
2. Verify Firebase console for service configuration
3. Ensure all required environment variables are set

## Features

Once running, the application provides:
- User registration and authentication
- CTF challenge management
- Real-time leaderboard
- Challenge file downloads
- Responsive web interface

Access the application at: http://localhost:5000
