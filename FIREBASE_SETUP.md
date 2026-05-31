# Firebase Setup Guide

This guide will help you set up Firebase for syncing admin changes across browsers.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a new project" or "Add project"
3. Enter your project name (e.g., "valluru-admin")
4. Select a location
5. Create the project (may take a minute)

## Step 2: Get Your Firebase Config

1. In Firebase Console, click the gear icon (⚙) → Project Settings
2. Scroll down to "Your apps" section
3. Click on the web app (if none, click "Add app" → Web)
4. You'll see a config object with these fields:
   - apiKey
   - authDomain
   - projectId
   - storageBucket
   - messagingSenderId
   - appId

## Step 3: Set Up Firestore Database

1. In Firebase Console, go to "Firestore Database" (left sidebar)
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to you
5. Click "Create"

## Step 4: Configure Environment Variables

1. Create a `.env.local` file in your project root (copy from `.env.example`)
2. Fill in your Firebase config values:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Step 5: Restart Your Dev Server

```bash
npm run dev
```

## How It Works

- Changes made in the admin panel are saved to **both** localStorage and Firebase
- When you access the admin panel from a different browser:
  1. It first loads data from Firebase (if available)
  2. Falls back to localStorage
  3. Both users' changes sync in real-time

## Firestore Structure

Your Firestore database will have a `cms` collection with two documents:

```
cms/
  ├── content
  │   ├── data: {...site content...}
  │   └── updatedAt: timestamp
  └── theme
      ├── data: {...theme config...}
      └── updatedAt: timestamp
```

## Troubleshooting

### Changes not syncing?
- Make sure `.env.local` is filled with correct Firebase credentials
- Check browser console for errors
- Restart the dev server

### Firebase errors?
- Verify Firestore Database is created
- Check that you're using test mode or have proper security rules
- Go to Firestore → Rules and ensure they allow reads/writes in test mode

### .env.local not loading?
- Make sure you restart `npm run dev` after creating `.env.local`
- Don't commit `.env.local` to git (add to `.gitignore`)
