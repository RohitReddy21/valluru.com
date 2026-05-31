# Upstash Redis Setup

This project stores live admin content through a serverless API route:

```text
/api/site-content
```

The Upstash token must stay server-side. Do not use `VITE_` for these values.

## Environment Variables

Set these in Vercel Project Settings -> Environment Variables:

```env
UPSTASH_REDIS_REST_URL=https://your-upstash-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token
ADMIN_PASSWORD=choose-a-private-admin-password
```

For local testing of the API, create `.env.local` or `.env` with the same names.

## Admin Flow

1. Open `/admin`.
2. Enter the same password as `ADMIN_PASSWORD`.
3. Edit content, colors, design settings, images, or hero backgrounds.
4. Press `Ctrl+S` or click `Save changes`.

The site saves:

- a local browser copy for fast editing
- a live copy in Upstash for deployed visitors

## Important Security Note

Never commit real Upstash tokens. Never use `VITE_UPSTASH_REDIS_REST_TOKEN`.
`VITE_` variables are visible in the browser.
