# 🚀 Vercel Deployment Guide for CTF-ISE

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Firebase Project**: Keep your Firebase credentials ready

## 📋 Step-by-Step Deployment

### 1. Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

### 2. Prepare Your Repository

Make sure your repository includes:
- ✅ `vercel.json` (configuration file)
- ✅ Modified `app.js` (exports app for serverless)
- ✅ Updated `package.json` (includes build scripts)

### 3. Deploy to Vercel

#### Option A: GitHub Integration (Recommended)

1. **Connect Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Project**:
   - Framework Preset: **Other**
   - Root Directory: `./` (keep default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: Leave empty
   - Install Command: `npm install` (auto-detected)

#### Option B: Vercel CLI

```bash
# In your project directory
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: ctf-ise
# - Directory: ./
# - Framework: None
```

### 4. Configure Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables, add:

```
NODE_ENV=production
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Firebase Configuration
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=sample-22862
FIREBASE_PRIVATE_KEY_ID=f056515130dfc5600c59e10f13b5f1c71033858d
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDd7O9jFD4Gz32/
nC4GW34tpsAs+48sZIwIK6Jekg9CaNwr/r8xI/MHB8dmFEbUGJyti6HnHra0296O
y7mTp2BKeH2DgIvThh13LeD4Rhi3dVulC5QOa1v7puoCyd/19LGBlY4Mtw/5pDuA
/5m5Xv2lyMZRy9MJEE4iWiyKW+aJMx6KxOXw4ru6vHm5VxB0jUfnBxuB0pQWTczN
r6LVhkuyRwrqo636sFE5pqVS729lFJyC7W8WBT041Bu2waus1ZJCe7GyHd07927G
Nzzz1n5kP4OS0Dnt35cb/eHWB+TpLesqLWhc9zGGOJhHzo10NnHioybi3jhq1+R/
Qyi/8Y+pAgMBAAECggEAIub3gyqU0rdhPHhQmLlc78sQ4EIz8zRg/Yv3Pk5UTgp1
zgmDgjP4LbvgdUJtHUA9q+GQ9etTqsAFkYmixwEE2NF4U+0skHjAO5Ugk4taqcew
QRXAFEB4N+y5UvTy3xi7rfiaXY+Q2J8mqJQKVigFVkRsREL9Dqjc0PRDmwL3D86K
P9mZ2TZNP1+FZLpj326ibegMTH2B2nm74ht3Opm9Ib27+L2AKtt35WCeU5Yd4U40
b6OpwlMWGgbGje+cXrnanEgZj8RyrqWjgdb3TjflTFGVcSEterKGZj+CHDC6N1Mi
+5zpjtC2l7p3J48nUJJMpfCSVXtT8BEmjRDIiJvVsQKBgQD8U7p5Yp7ZsM2aqQv2
GvGCsPx6F861mrnsGSihwIu2shRTb0UUbBDPJ4RDNBubZnhv9tfzXiNXsdJJ5y7/
JfN8/r3NYqMcjfw3AlJ6CbfKJ8AzLeOfawxmzWXR6X2fzhrD3+ULQtxRDOJh8tGF
7bgIa2xoLXbbtd93ZpYdPEqPLQKBgQDhJ+sciLKlkU2beYKmQ5cBR5CfqYEqaU64
pXE8/QLvH8UXV8QDeulBuIID1QyR905D5ffkVYegZt7VfnMZDu/1eCGX6eTY5NCE
syqNFk0DXPzZQYPytknCrhJUCS6I9eJjzO4zCLZGXwhMyNKiiv+8PjsvHyuRYJ6/
WlApqEDv7QKBgDR+LrMGA0oCcCOWu3hNjqTDsSKtRUGemMM3UK6l4er2DSh2Y4am
HLEb5XYdpwijPrb8QVzN3shlo/vf7nUCLi94x3+s34YXO7st7n6Y+vVBY8jB6TLH
EGNqo54R1yKhvAu3zmyTUkZCSe5al6AnHjwSLRFXM/ztTzoFy4D1hAVZAoGATaoF
UWxdovrB+FUrmcpKtihHXKuNYGG+w7Zdnxnu/yjIRUsC0+h7uS25uzSsB1V067rR
jTNrewrA5oedkBE0+Ekd3VbSl3Yl7wAWN2Bv5C8ZEJ+msfvq6Xo93DrmkFuwYZh4
uaXRqehx5nqHHYYwvHAC3jg0QQtA9uRiLlxZOekCgYEAuDjjxgnxGekXcVMF3V8b
vKjxpsY+9wDzmnYIA3nnmaleJGssUpWUVFdvvuuRpu5Hg6LgN5IQBrkqo93f1VRQ
OA3XmLBbOjS7SjbQ2TRW6jwfLNixX00QZFGENr0WrqozeN+l77fnTyqFMC5+iw9F
ZmIbZCp4i+4LnVKe+7NeJW8=
-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@sample-22862.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=101238467238414592160
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40sample-22862.iam.gserviceaccount.com
```

**Important Notes for Environment Variables:**
- Add each variable one by one in Vercel dashboard
- For `FIREBASE_PRIVATE_KEY`, copy the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Make sure to preserve line breaks in the private key

### 5. Deploy Challenges Collection

After deployment, you need to populate the challenges collection:

1. **Create a setup script** (optional):
```bash
# Add this script to run after deployment
node setup-challenges.js
```

2. **Or manually add via Firebase Console**:
   - Go to Firestore Database
   - Create `challenges` collection
   - Add documents with correct flags

## 🔧 Vercel Configuration

The `vercel.json` file includes:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/app.js"
    }
  ]
}
```

## 🚀 Testing Your Deployment

1. **Check Deployment**: 
   - Vercel will provide a URL like `https://your-project.vercel.app`

2. **Test Features**:
   - User registration/login
   - Challenge viewing
   - Flag submission
   - Leaderboard functionality

3. **Monitor Logs**:
   - Go to Vercel Dashboard → Functions tab
   - Check for any runtime errors

## 🔍 Troubleshooting

### Common Issues:

1. **Environment Variables Not Set**:
   - Double-check all variables in Vercel dashboard
   - Redeploy after adding variables

2. **Firebase Connection Issues**:
   - Verify private key format (preserve line breaks)
   - Check project ID matches your Firebase project

3. **Session Issues**:
   - Sessions work differently in serverless
   - Consider using Firebase Auth for production

4. **Static Files Not Loading**:
   - Ensure `public` folder structure is correct
   - Check file paths in your code

### Debug Commands:

```bash
# Test locally before deploying
npm start

# Check Vercel logs
vercel logs

# Force redeploy
vercel --force
```

## 🎯 Production Considerations

1. **Security**:
   - Use strong session secrets
   - Enable HTTPS-only cookies
   - Configure Firebase security rules

2. **Performance**:
   - Consider caching strategies
   - Optimize Firebase queries
   - Monitor function execution times

3. **Scaling**:
   - Vercel automatically scales
   - Monitor Firebase usage limits
   - Consider upgrading Firebase plan if needed

## 📱 Custom Domain (Optional)

1. **Add Domain in Vercel**:
   - Go to Project Settings → Domains
   - Add your custom domain

2. **Configure DNS**:
   - Add CNAME record pointing to Vercel

Your CTF platform is now ready for production on Vercel! 🎉
