#!/usr/bin/env python3
"""
Test script to verify YouTube OAuth configuration
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv('contentvault/backend/.env')

client_id = os.getenv('YOUTUBE_CLIENT_ID')
client_secret = os.getenv('YOUTUBE_CLIENT_SECRET')
redirect_uri = os.getenv('YOUTUBE_REDIRECT_URI')

print("=" * 60)
print("YouTube OAuth Configuration Test")
print("=" * 60)
print()

print("Current Configuration:")
print(f"  Client ID: {client_id}")
print(f"  Client Secret: {client_secret[:20]}..." if client_secret else "  Client Secret: NOT SET")
print(f"  Redirect URI: {redirect_uri}")
print()

print("=" * 60)
print("ACTION REQUIRED: Add Redirect URI to Google Cloud Console")
print("=" * 60)
print()
print("Follow these steps:")
print()
print("1. Go to: https://console.cloud.google.com/apis/credentials")
print()
print("2. Find your OAuth 2.0 Client ID:")
print(f"   {client_id}")
print()
print("3. Click on the Client ID to edit it")
print()
print("4. Scroll down to 'Authorized redirect URIs' section")
print()
print("5. Click 'ADD URI' button")
print()
print("6. Add this EXACT URI (copy and paste):")
print(f"   {redirect_uri}")
print()
print("7. Click 'SAVE'")
print()
print("8. Wait 1-2 minutes for changes to propagate")
print()
print("9. Try connecting YouTube again")
print()
print("=" * 60)
print("Additional Checks:")
print("=" * 60)
print()
print("✓ Make sure YouTube Data API v3 is enabled:")
print("  https://console.cloud.google.com/apis/library/youtube.googleapis.com")
print()
print("✓ Make sure OAuth consent screen is configured:")
print("  https://console.cloud.google.com/apis/credentials/consent")
print()
print("✓ For testing, make sure 'Test users' includes your Google account")
print()

