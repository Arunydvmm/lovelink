# Render Environment Variables Setup

## CRITICAL: Must Be Set Before Deployment

### ✅ Required Variables for Blank Page Fix

Go to **Render Dashboard** → Your Service → **Environment**

**Copy and paste these exact keys:**

```
ALLOWED_ORIGINS
https://lovelinkkk.onrender.com

VITE_API_URL
https://lovelinkkk.onrender.com

VITE_APP_URL
https://lovelinkkk.onrender.com

DATABASE_URL
[FROM POSTGRESQL DATABASE SERVICE - SHOULD AUTO-POPULATE]

NODE_ENV
production
```

### Step-by-Step Setup

1. **Go to Render Dashboard**
   - https://dashboard.render.com

2. **Select your service: `lovelink`**

3. **Click "Environment" tab**

4. **Add these variables one by one:**

   | Key | Value |
   |-----|-------|
   | `ALLOWED_ORIGINS` | `https://lovelinkkk.onrender.com` |
   | `VITE_API_URL` | `https://lovelinkkk.onrender.com` |
   | `VITE_APP_URL` | `https://lovelinkkk.onrender.com` |
   | `DATABASE_URL` | *Should auto-populate from PostgreSQL add-on* |
   | `NODE_ENV` | `production` |
   | `JWT_SECRET` | *Generate with: `openssl rand -base64 48`* |
   | `JWT_REFRESH_SECRET` | *Generate with: `openssl rand -base64 48`* |
   | `SESSION_SECRET` | *Generate with: `openssl rand -base64 48`* |
   | `GOOGLE_CLIENT_ID` | *Your Google OAuth Client ID* |
   | `GOOGLE_CLIENT_SECRET` | *Your Google OAuth Client Secret* |
   | `RAZORPAY_KEY_ID` | *Your Razorpay Key ID* |
   | `RAZORPAY_KEY_SECRET` | *Your Razorpay Secret* |
   | `RAZORPAY_WEBHOOK_SECRET` | *Your Razorpay Webhook Secret* |
   | `SMTP_USER` | *Your DNSExit username* |
   | `SMTP_PASSWORD` | *Your DNSExit password* |
   | `EMAIL_FROM` | `noreply@yourdomain.com` |
   | `CLOUDINARY_CLOUD_NAME` | *Your Cloudinary Cloud Name* |
   | `CLOUDINARY_API_KEY` | *Your Cloudinary API Key* |
   | `CLOUDINARY_API_SECRET` | *Your Cloudinary API Secret* |

5. **Click "Save Changes"**

6. **Manual Deploy:**
   - Click the three dots ⋯ menu
   - Select "Manual Deploy"
   - Choose "Deploy latest commit"

## Troubleshooting

### Blank Page Still Shows?

**Check 1: Verify DATABASE_URL is set**
```bash
# In Render dashboard, go to: Services → lovelink-db → Info
# Copy the "Internal Database URL"
# Paste into: Services → lovelink → Environment → DATABASE_URL
```

**Check 2: Test if server is running**
Open browser console and run:
```javascript
fetch('/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Server OK:', d))
  .catch(e => console.error('❌ Server Error:', e))
```

**Check 3: Check browser console for errors**
- Press `F12` to open DevTools
- Click "Console" tab
- Look for any red error messages
- Screenshot and share the errors

**Check 4: Check Network tab**
- In DevTools, click "Network" tab
- Reload page
- Look for failed requests (red status codes)
- Check `/api/templates` call - what status code?

### Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| 500 errors on /api/templates | DATABASE_URL not set in Render dashboard |
| CORS error in console | ALLOWED_ORIGINS doesn't match your Render URL |
| Blank white page | Check browser console (F12) for errors |
| Assets return JSON | Static files served before API routes (already fixed) |

## After Setup Verification

Once page loads, verify these work:

1. **Homepage loads** ✅
2. **Click "Explore Templates"** ✅
3. **Templates load from database** ✅
4. **Can select a template** ✅
5. **Admin panel login works** ✅

## Need Help?

Run this diagnostic in browser console:
```javascript
async function diagnose() {
  console.log('🔍 Diagnostic Report');
  
  // Test health endpoint
  try {
    const health = await fetch('/api/health').then(r => r.json());
    console.log('✅ Server:', health.status);
  } catch(e) {
    console.error('❌ Server:', e.message);
  }
  
  // Test templates endpoint
  try {
    const templates = await fetch('/api/templates').then(r => r.json());
    console.log('✅ Templates:', templates.length, 'found');
  } catch(e) {
    console.error('❌ Templates:', e.message);
  }
  
  // Test CORS
  try {
    const test = await fetch('/api/test').then(r => r.json());
    console.log('✅ CORS:', test.status);
  } catch(e) {
    console.error('❌ CORS:', e.message);
  }
}
diagnose();
```

Save this console script for debugging!
