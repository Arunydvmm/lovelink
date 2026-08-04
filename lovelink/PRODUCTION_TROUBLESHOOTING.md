# LoveLink Production Troubleshooting Guide

## Blank Page Issue - Root Causes & Fixes

### 🔴 Critical Issue: DATABASE_URL Not Set

**Symptoms:**
- White blank page
- Browser console: No errors visible
- Render logs: Error about @prisma/client not initializing

**Root Cause:**
DATABASE_URL environment variable not configured in Render dashboard.

**Fix:**
1. Go to https://dashboard.render.com
2. Select your service: `lovelink`
3. Click "Environment" tab
4. Look for the PostgreSQL database service:
   - Go to **Services** → **lovelink-db** (or similar) → **Info**
   - Copy the "Internal Database URL" or "External Database URL"
5. In your `lovelink` service Environment:
   - Add key: `DATABASE_URL`
   - Paste the connection string
   - Click "Save Changes"
6. Click the three dots ⋯ menu → "Manual Deploy" → "Deploy latest commit"
7. Wait 5-10 minutes for deployment to complete
8. Refresh the page in your browser

---

## Step-by-Step Verification

### Step 1: Verify Server is Running

Open your browser console (F12) and run:
```javascript
fetch('/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Server OK:', d))
  .catch(e => console.error('❌ Server Error:', e))
```

**Expected Result:**
```json
{
  "status": "ok",
  "time": "2026-08-04T12:34:56.789Z",
  "environment": "production",
  "uptime": 123.45
}
```

### Step 2: Verify Database Connection

Run in browser console:
```javascript
fetch('/api/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ test: 'data' })
})
.then(r => r.json())
.then(d => console.log('✅ API OK:', d))
.catch(e => console.error('❌ API Error:', e))
```

**Expected Result:**
```json
{
  "status": "ok",
  "message": "API connectivity test successful",
  "testId": "test_1722700496789_abc123def",
  "receivedData": { "body": { "test": "data" }, "query": {} },
  "server": { "timestamp": "2026-08-04T12:34:56.789Z", "environment": "production", "uptime": 123.45 }
}
```

### Step 3: Test Templates API

Run in browser console:
```javascript
fetch('/api/templates')
  .then(r => r.json())
  .then(d => console.log('✅ Templates Loaded:', d.length, 'templates'))
  .catch(e => console.error('❌ Templates Error:', e))
```

**Expected Result:** Shows templates count, e.g., "✅ Templates Loaded: 12 templates"

### Step 4: Check CORS Configuration

Run in browser console:
```javascript
// Get current origin
console.log('Current Origin:', window.location.origin);

// Test CORS by fetching from different origin
fetch('/api/debug')
  .then(r => r.json())
  .then(d => {
    console.log('✅ CORS OK');
    console.log('   Allowed Origins:', d.config.allowedOrigins);
    console.log('   Request Origin:', d.config.requestOrigin);
  })
  .catch(e => console.error('❌ CORS Error:', e))
```

---

## Common Error Messages & Fixes

### Error 1: "Assets return JSON with status 500"

**Symptoms:**
- CSS file returns: `{"error": "Internal Server Error"}`
- JS files return: `{"error": "...details..."}`

**Root Cause:** Static files not served before API routes (middleware order issue)

**Status:** ✅ FIXED in current build - middleware reordered correctly

**Verification:**
```javascript
// Check if CSS loads properly
fetch('/assets/index.css')
  .then(r => {
    console.log('Content-Type:', r.headers.get('content-type'));
    return r.text();
  })
  .then(text => {
    if (text.includes('body') || text.includes('css')) {
      console.log('✅ CSS loads correctly');
    } else {
      console.error('❌ CSS returns:', text.substring(0, 200));
    }
  })
```

### Error 2: ".prisma/client/index-browser is imported but could not be resolved"

**Symptoms:**
- Browser console: "Uncaught TypeError: Failed to resolve module specifier"
- Build warnings in Render logs

**Root Cause:** Prisma client bundled into frontend (should only be on backend)

**Status:** ✅ FIXED - Vite config excludes @prisma/client from bundling

**Verification:** Check vite.config.ts has:
```typescript
external: ['@prisma/client', '.prisma/client']
```

### Error 3: "@prisma/client did not initialize yet"

**Symptoms:**
- Render logs show: "Error: @prisma/client did not initialize yet. Please run 'prisma generate'"
- Server exits with status 1
- App unavailable

**Root Cause:** 
- DATABASE_URL not set during build
- OR Prisma schema has validation errors

**Fix:**
1. Check Render dashboard → Environment → DATABASE_URL is set
2. Check Render logs for Prisma schema errors
3. If schema errors shown, they must be fixed in code

**In Your Code:** Check `prisma/schema.prisma` doesn't have duplicate `@relation` directives

### Error 4: "CORS error in browser console"

**Symptoms:**
```
Access to XMLHttpRequest at 'https://lovelinkkk.onrender.com/api/templates' 
from origin 'https://example.com' has been blocked by CORS policy
```

**Root Cause:** Request origin not in ALLOWED_ORIGINS

**Fix:**
1. Check Render Environment → ALLOWED_ORIGINS
2. Should be: `https://lovelinkkk.onrender.com` (or your custom domain)
3. If using multiple origins, separate with commas: `https://lovelinkkk.onrender.com,https://lovelink.com`
4. Save and manually deploy

**Verification:**
```javascript
fetch('/api/debug')
  .then(r => r.json())
  .then(d => console.log('Allowed Origins:', d.config.allowedOrigins))
```

---

## Environment Variables Checklist

### 🔴 CRITICAL (Without these, app won't start)
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `JWT_SECRET` - Random string, generated with: `openssl rand -base64 48`
- [ ] `JWT_REFRESH_SECRET` - Random string, generated with: `openssl rand -base64 48`
- [ ] `NODE_ENV` - Set to: `production`

### 🟡 IMPORTANT (Without these, some features fail)
- [ ] `ALLOWED_ORIGINS` - Your Render URL: `https://lovelinkkk.onrender.com`
- [ ] `VITE_API_URL` - Same as ALLOWED_ORIGINS: `https://lovelinkkk.onrender.com`
- [ ] `VITE_APP_URL` - Same as ALLOWED_ORIGINS: `https://lovelinkkk.onrender.com`

### 🟢 OPTIONAL (App works without these, but features disabled)
- [ ] `RAZORPAY_KEY_ID` - Payment processing
- [ ] `RAZORPAY_KEY_SECRET` - Payment processing
- [ ] `GOOGLE_CLIENT_ID` - Social login
- [ ] `GOOGLE_CLIENT_SECRET` - Social login
- [ ] `SMTP_USER` - Email sending
- [ ] `SMTP_PASSWORD` - Email sending
- [ ] `CLOUDINARY_CLOUD_NAME` - Image uploads

---

## Render Dashboard Navigation

### Go to Environment Variables

1. https://dashboard.render.com
2. Click on your service: **lovelink**
3. Click **Environment** tab
4. Scroll down to "Environment Variables"
5. Each key=value is one variable

### Manually Deploy After Changes

1. In your service page
2. Click the three dots ⋯ (top right)
3. Select **Manual Deploy**
4. Choose **Deploy latest commit**
5. Wait 5-10 minutes

### Find PostgreSQL Connection String

1. In your service page
2. Look for section "Add-ons"
3. Click on your PostgreSQL database (e.g., "lovelink-db")
4. Copy "Internal Database URL" (for internal services) OR "External Database URL" (for external tools)
5. Paste into `DATABASE_URL` in Environment

---

## Quick Diagnostic Script

Save this in browser console and run it:

```javascript
async function diagnose() {
  console.log('🔍 === LoveLink Diagnostic Report ===\n');
  
  // Test 1: Server Health
  try {
    const health = await fetch('/api/health').then(r => r.json());
    console.log('✅ Server Health:', health.status);
    console.log('   Environment:', health.environment);
    console.log('   Uptime:', Math.round(health.uptime) + 's');
  } catch(e) {
    console.error('❌ Server Health:', e.message);
  }
  
  // Test 2: Database
  try {
    const test = await fetch('/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'diagnostic' })
    }).then(r => r.json());
    console.log('\n✅ API Endpoint:', test.status);
  } catch(e) {
    console.error('\n❌ API Endpoint:', e.message);
  }
  
  // Test 3: Templates
  try {
    const templates = await fetch('/api/templates').then(r => r.json());
    console.log('✅ Templates:', Array.isArray(templates) ? templates.length : 'unknown', 'found');
  } catch(e) {
    console.error('❌ Templates:', e.message);
  }
  
  // Test 4: CORS Config
  try {
    const debug = await fetch('/api/debug').then(r => r.json());
    console.log('\n✅ CORS Config:');
    console.log('   Request Origin:', debug.config.requestOrigin);
    console.log('   Allowed Origins:', debug.config.allowedOrigins.join(', '));
  } catch(e) {
    console.error('\n❌ CORS Config:', e.message);
  }
  
  console.log('\n🔍 === End Diagnostic Report ===');
}

diagnose();
```

---

## Still Stuck?

1. **Check Render Logs:**
   - Dashboard → your service → **Logs** tab
   - Look for any error messages at the bottom

2. **Check Browser Console:**
   - Press F12 → Console tab
   - Scroll to top - first error is usually the culprit
   - Screenshot and copy the full error message

3. **Run Diagnostic:**
   - Copy & paste the diagnostic script above
   - Share the output

4. **Verify Environment Variables:**
   - Go to service → Environment
   - Confirm all critical variables are set
   - Check for typos (case-sensitive!)

