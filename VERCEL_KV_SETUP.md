# Vercel KV Setup Guide

This project uses **Vercel KV** (Redis) to sync admin panel changes across browsers in real-time.

## What is Vercel KV?

Vercel KV is a managed Redis database that integrates seamlessly with Vercel deployments. It allows your app to store and retrieve data instantly across all users and browsers.

## Setup Instructions (Super Easy!)

### Step 1: Open Your Vercel Dashboard
- Go to [vercel.com/dashboard](https://vercel.com/dashboard)
- Select your project (valluru.com)

### Step 2: Create a KV Database
1. Click on the **Storage** tab
2. Click **Create Database**
3. Select **KV** (if you see options, choose Redis)
4. Give it a name (e.g., "valluru-kv")
5. Select a region close to you
6. Click **Create**

### Step 3: That's It!
- Vercel automatically sets up environment variables
- Your app will start using KV when you redeploy

## How It Works

**When you edit the admin panel:**
1. Changes are saved to your browser's localStorage (instant feedback)
2. Changes are also saved to Vercel KV in the background
3. When another browser loads the page, it fetches the latest data from KV
4. Result: **All browsers see the same content in real-time!**

## Local Development

During local development (`npm run dev`):
- Changes still save to localStorage
- When deployed to Vercel, they automatically sync to KV
- No special setup needed locally

## Deployment

When you push to GitHub:
1. Vercel automatically deploys
2. The app connects to your KV database
3. Admin changes sync across all browsers

## How Your Data is Stored

```
KV Database:
├── cms:content  → Your website content
└── cms:theme    → Your design theme
```

Each entry includes:
- The data itself
- Timestamp of last update
- Easy to view/edit in Vercel dashboard

## Viewing/Managing Your Data

In Vercel Dashboard:
1. Go to **Storage** → **KV** tab
2. Click your database name
3. View all stored keys and values
4. Can manually edit if needed

## Testing It Works

1. Open the admin panel in one browser
2. Make a change (e.g., update a color)
3. Open a **different browser** or **incognito window**
4. Navigate to the same page
5. You should see your changes! ✅

## Troubleshooting

### Changes not syncing?
- Make sure your database is created in Vercel
- Check that you've redeployed after creating the database
- Check browser console for errors (F12)

### Can't create database?
- Make sure you're in the right project
- Check you have the right permissions in Vercel

### Running out of KV requests?
- Vercel KV free tier is generous
- If needed, upgrade your Vercel plan

## Next Steps

1. Create your Vercel KV database (5 minutes)
2. Push your code to GitHub
3. Vercel will auto-deploy
4. Test it by editing in two browsers!

That's it! Your admin panel now syncs across all browsers. 🎉
