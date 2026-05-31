# Upstash Redis Setup Guide (FREE!)

This project uses **Upstash Redis** to sync admin changes across browsers in real-time. It's completely FREE and requires no credit card!

## What is Upstash?

Upstash is a managed Redis database service with a generous FREE tier:
- **10,000 commands/day** (way more than you'll ever need)
- **No credit card** required
- **Works instantly** after setup
- **Perfect for small teams**

## Setup Instructions (5 Minutes)

### Step 1: Create Upstash Account
1. Go to https://upstash.com
2. Click **"Sign Up"** (completely free, no credit card)
3. Verify your email

### Step 2: Create a Redis Database
1. Go to https://upstash.com/console
2. Click **"Create Database"**
3. Name: `valluru`
4. Select **"Free"** plan
5. Select your region (closest to you)
6. Click **"Create"**

### Step 3: Get Your Credentials
1. Click on your new database
2. Scroll down to **"REST API"** section
3. Copy:
   - **UPSTASH_REDIS_REST_URL** (the full URL)
   - **UPSTASH_REDIS_REST_TOKEN** (the token)

### Step 4: Add to Environment Variables

**For Local Development:**
Create a `.env.local` file in your project root:
```
VITE_UPSTASH_REDIS_REST_URL=https://your-url.upstash.io
VITE_UPSTASH_REDIS_REST_TOKEN=your_token_here
```

**For Production (Vercel):**
1. Go to your Vercel project settings
2. Go to **Environment Variables**
3. Add:
   - Name: `VITE_UPSTASH_REDIS_REST_URL`
   - Value: (paste your URL)
4. Add:
   - Name: `VITE_UPSTASH_REDIS_REST_TOKEN`
   - Value: (paste your token)
5. Click **Save**

### Step 5: Restart & Deploy
```bash
npm run dev  # Local development
```

Then push to GitHub - Vercel will auto-deploy!

## How It Works

**When you edit the admin panel:**
1. Changes save to browser localStorage instantly (fast feedback)
2. Changes sync to Upstash Redis in background
3. When another browser loads the page, it fetches data from Upstash
4. **Result:** All browsers see the same content in real-time! 🎉

## Testing It Works

1. Open admin panel in **Browser A**
2. Make a change (e.g., edit text or color)
3. Open admin panel in **Browser B** (different browser/incognito)
4. You should see the changes immediately! ✅

## Viewing Your Data

In Upstash Console:
1. Click your database
2. Go to the **"Data Browser"** tab
3. See all stored keys:
   - `cms:content` - Your website content
   - `cms:theme` - Your design theme

## Free Tier Limits

- **10,000 commands/day** - Very generous
- **1 DB included** - More than enough
- **No expiration** - Keeps working forever
- **Unlimited users** - All your team members can use it

With your admin panel, you'll probably use 10-50 commands/day, so you're well within the free tier!

## Upgrade (if needed)

If you ever exceed 10,000 commands/day:
- You'll get a warning
- Upgrade to paid plan ($0.20 per 100,000 commands)
- But for small teams, you'll probably never need to!

## Troubleshooting

### Changes not syncing?
- Make sure `.env.local` is created with correct credentials
- Restart `npm run dev`
- Check browser console (F12) for errors

### Can't find REST API URL?
- Go to Upstash console
- Click your database
- Scroll down - REST API section is at the bottom

### Token not working?
- Make sure you copied the **full** REST Token (not just the URL)
- Try creating a new token in database settings

## Questions?

Check Upstash docs: https://docs.upstash.com

## Done! 🎉

Your admin panel now syncs across all browsers completely free!
