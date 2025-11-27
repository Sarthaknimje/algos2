# Multi-Platform OAuth Setup Guide

This guide will help you set up OAuth credentials for Instagram, Twitter/X, and LinkedIn to enable content tokenization.

## 📋 Prerequisites

1. Developer accounts on:
   - Instagram (Meta for Developers)
   - Twitter/X (Twitter Developer Portal)
   - LinkedIn (LinkedIn Developers)

## 🔵 Instagram Setup

### Step 1: Create Facebook App
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Select "Consumer" app type
4. Fill in app details

### Step 2: Add Instagram Basic Display Product
1. In your app dashboard, click "Add Product"
2. Find "Instagram Basic Display" and click "Set Up"
3. Add OAuth Redirect URI: `http://localhost:5175/auth/instagram/callback`

### Step 3: Create Instagram App
1. Go to "Instagram Basic Display" settings
2. Click "Create New App"
3. Add your redirect URI
4. Get your **App ID** and **App Secret**

### Step 4: Add to .env
```env
INSTAGRAM_CLIENT_ID=your-instagram-app-id
INSTAGRAM_CLIENT_SECRET=your-instagram-app-secret
INSTAGRAM_REDIRECT_URI=http://localhost:5175/auth/instagram/callback
```

## 🐦 Twitter/X Setup

### Step 1: Create Twitter Developer Account
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Apply for developer access (usually instant)
3. Create a new Project and App

### Step 2: Configure OAuth Settings
1. In your app settings, go to "User authentication settings"
2. Set App permissions: "Read" (minimum)
3. Add Callback URI: `http://localhost:5175/auth/twitter/callback`
4. Set App type: "Web App, Automated App or Bot"

### Step 3: Get Credentials
1. Go to "Keys and tokens" tab
2. Get your **API Key** and **API Secret Key**
3. Generate **Access Token** and **Access Token Secret** (for app-only auth)

### Step 4: Add to .env
```env
TWITTER_API_KEY=your-api-key
TWITTER_API_SECRET=your-api-secret
TWITTER_ACCESS_TOKEN=your-access-token
TWITTER_ACCESS_TOKEN_SECRET=your-access-token-secret
TWITTER_CALLBACK_URL=http://localhost:5175/auth/twitter/callback
```

## 💼 LinkedIn Setup

### Step 1: Create LinkedIn App
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click "Create app"
3. Fill in app details:
   - App name: CreatorVault
   - Company: Your company
   - Privacy policy URL: Your privacy policy
   - App logo: Upload logo

### Step 2: Configure Auth Settings
1. Go to "Auth" tab
2. Add Redirect URLs: `http://localhost:5175/auth/linkedin/callback`
3. Select OAuth 2.0 scopes:
   - `r_liteprofile` (or `r_basicprofile`)
   - `r_emailaddress`
   - `w_member_social` (for posting, optional)

### Step 3: Get Credentials
1. In "Auth" tab, find:
   - **Client ID**
   - **Client Secret**

### Step 4: Add to .env
```env
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_REDIRECT_URI=http://localhost:5175/auth/linkedin/callback
```

## 🔒 Security Notes

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Use environment variables** in production
3. **Rotate secrets regularly**
4. **Limit OAuth scopes** to minimum required
5. **Use HTTPS** in production (update redirect URIs)

## ✅ Verification

After setup, test each platform:
1. Start backend: `cd backend && python app.py`
2. Start frontend: `npm run dev`
3. Navigate to `/tokenize`
4. Click "Connect" for each platform
5. Complete OAuth flow
6. Verify content appears

## 🚀 Production Setup

For production:
1. Update all redirect URIs to your production domain
2. Use environment variables or secret management
3. Enable HTTPS
4. Update CORS origins in backend
5. Set `FLASK_ENV=production`

## 📝 Notes

- Instagram Basic Display API has rate limits
- Twitter API v2 requires elevated access for some features
- LinkedIn API requires approval for certain scopes
- All platforms require valid redirect URIs in their dashboards

