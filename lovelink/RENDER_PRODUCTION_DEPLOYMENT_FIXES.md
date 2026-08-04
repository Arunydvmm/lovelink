# Render Production Deployment Fixes

## Overview
This document details the fixes applied to resolve production deployment issues on Render for the LoveLink application.

## Issues Fixed

### Issue 1: CORS Error - Render Domain Not Allowed
**Problem:** The CORS configuration was rejecting requests from the Render domain, causing white page errors on production.

**Root Cause:** The CORS middleware had hardcoded origins that didn't include the Render deployment domain (`https://lovelinkkk.onrender.com`).

**Solution Implemented:**
- Refactored CORS origin configuration in `src/middleware/securityMiddleware.ts`
- Added dynamic origin parsing from `ALLOWED_ORIGINS` environment variable
- Added support for wildcard domain matching (e.g., `*.onrender.com`)
- Improved CORS error logging for debugging
- File: `src/middleware/securityMiddleware.ts`

**Changes:**
```typescript
// Before: Hardcoded and limited to exact string matching
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://lovelink.app',
];

// After: Dynamic with wildcard support
const getConfiguredOrigins = (): string[] => {
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  }
  return [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ];
};

// Added wildcard matching:
if (allowed.includes('*')) {
  const regex = new RegExp('^' + allowed.replace(/\*/g, '.*') + '$');
  return regex.test(origin);
}
```

### Issue 2: Database Migrations Not Running
**Problem:** The SystemLog table and other database schema weren't being created during deployment.

**Solution Implemented:**
- Verified migration command in build process: `npx prisma migrate deploy`
- Added clear instructions in `render.yaml` about DATABASE_URL setup
- Ensured migrations exist and are properly versioned
- File: `render.yaml`

**Key Configuration:**
```yaml
buildCommand: npm install && npx prisma generate && npm run build && npx prisma migrate deploy
```

**Action Required in Render Dashboard:**
1. Ensure PostgreSQL database is connected to the service
2. Set `DATABASE_URL` environment variable to the database connection string
3. The build process will automatically run migrations

### Issue 3: Environment Variables Pointing to Localhost
**Problem:** Frontend environment variables (`VITE_API_URL` and `VITE_APP_URL`) were showing as localhost instead of the production Render domain.

**Root Cause:** Using `fromService` property which may not resolve correctly during build time.

**Solution Implemented:**
- Changed `VITE_API_URL` and `VITE_APP_URL` to static values for Render deployment
- Set to `https://lovelinkkk.onrender.com` (replace with your actual Render domain)
- File: `render.yaml`

**Changes:**
```yaml
# Before: Dynamic resolution
- key: VITE_API_URL
  fromService:
    type: web
    name: lovelink
    property: url

# After: Static Render domain
- key: VITE_API_URL
  value: https://lovelinkkk.onrender.com
```

**Action Required:**
- Replace `https://lovelinkkk.onrender.com` with your actual Render deployment URL
- This ensures the frontend knows where to send API requests

## Complete Configuration Checklist for Render

### 1. Environment Variables to Set in Render Dashboard

**Database:**
- `DATABASE_URL` - PostgreSQL connection string (auto-populated if using Render's PostgreSQL add-on)

**JWT Secrets (generate strong random strings, minimum 64 characters):**
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

**Razorpay (Production Keys):**
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

**Email (DNSExit SMTP):**
- `SMTP_USER`
- `SMTP_PASSWORD`
- `EMAIL_FROM` (e.g., noreply@yourdomain.com)

**Cloudinary:**
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_UPLOAD_PRESET` (optional)

**Google OAuth (if using):**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

**Frontend URLs (Update with your Render domain):**
- `VITE_API_URL=https://lovelinkkk.onrender.com`
- `VITE_APP_URL=https://lovelinkkk.onrender.com`

**CORS Configuration:**
- `ALLOWED_ORIGINS=https://lovelinkkk.onrender.com,https://www.lovelinkkk.onrender.com`

**Auto-Populated by render.yaml:**
- `NODE_ENV=production`
- `SMTP_HOST=relay.dnsexit.com`
- `SMTP_PORT=587`
- `EMAIL_FROM_NAME=LoveLink`
- `LOG_LEVEL=info`
- And other feature flags and rate limiting settings

### 2. PostgreSQL Database Setup
1. Add PostgreSQL database in Render dashboard
2. Connect it to the web service
3. Ensure `DATABASE_URL` is automatically set
4. Database will be initialized during first deployment

### 3. Build & Start Commands
Already configured in `render.yaml`:
- **Build:** `npm install && npx prisma generate && npm run build && npx prisma migrate deploy`
- **Start:** `npm start`

### 4. Health Check
Health check endpoint: `/api/health`
- Used by Render to verify service is running
- Returns JSON with status and uptime

## Deployment Steps

### First-Time Deployment

1. **Update Render Domain Reference**
   - Find all instances of `lovelinkkk.onrender.com` in render.yaml
   - Replace with your actual Render deployment URL
   - This includes `VITE_API_URL`, `VITE_APP_URL`, and `ALLOWED_ORIGINS`

2. **Push Changes to GitHub**
   ```bash
   git add render.yaml src/middleware/securityMiddleware.ts
   git commit -m "Configure for Render production deployment"
   git push origin main
   ```

3. **Set Up in Render Dashboard**
   - Connect GitHub repository to Render
   - Create new Web Service
   - Select repository and branch
   - Add PostgreSQL database
   - Set all required environment variables
   - Deploy

4. **Verify Deployment**
   ```bash
   # Check health endpoint
   curl https://your-render-url.onrender.com/api/health
   
   # Check frontend loads
   curl https://your-render-url.onrender.com/
   ```

## Testing After Deployment

### CORS Testing
```bash
# Test from different origin
curl -H "Origin: https://yourdomain.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS https://your-render-url.onrender.com/api/auth/login
```

### API Testing
```bash
# Health check
curl https://your-render-url.onrender.com/api/health

# Try login (should give validation error if no body, not CORS error)
curl -X POST https://your-render-url.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"test"}'
```

### Database Testing
1. Check Render logs for migration errors
2. Verify tables are created: `psql $DATABASE_URL -c "\dt"`
3. Confirm data is persisted

## Monitoring Production

### Key Logs to Watch
- **Deployment logs:** Check build commands executed successfully
- **Build logs:** Verify Prisma migrations ran
- **Runtime logs:** Monitor for API and database errors
- **CORS errors:** Watch for "Not allowed by CORS" warnings

### Common Issues After Deployment

**Issue: CORS Error in Console**
- **Solution:** Verify `ALLOWED_ORIGINS` environment variable is set correctly
- **Debug:** Check logs for "CORS rejected origin: ..." messages

**Issue: Database Errors**
- **Solution:** Verify `DATABASE_URL` is set and migrations completed
- **Debug:** Check build logs for "Prisma migrate" output

**Issue: 500 Errors on API Calls**
- **Solution:** Check API logs for specific errors
- **Common Causes:** Missing environment variables, database not ready, JWT secrets not set

**Issue: White Page on Frontend**
- **Solution 1:** Check browser console for CORS errors
- **Solution 2:** Verify `VITE_API_URL` is pointing to correct server
- **Solution 3:** Check Render logs for server startup errors

## Files Modified

1. **src/middleware/securityMiddleware.ts**
   - Enhanced CORS configuration with dynamic origin parsing
   - Added wildcard domain support
   - Improved error logging

2. **render.yaml**
   - Set `VITE_API_URL` and `VITE_APP_URL` to Render domain
   - Set `ALLOWED_ORIGINS` with Render domain
   - Added helpful comments about required environment variables
   - Added build command comments

## Commit Details

- **Commit Hash:** `b6ede1c`
- **Date:** 2025
- **Message:** "fix: Fix production deployment CORS and environment issues"

## Next Steps

1. Deploy to Render using these configuration updates
2. Monitor logs during initial deployment
3. Verify all endpoints return expected responses
4. Test payment flows with Razorpay
5. Monitor email delivery
6. Set up error tracking (Sentry recommended)
7. Configure uptime monitoring alerts

## Support References

- [Render.com Documentation](https://render.com/docs)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Express CORS Middleware](https://github.com/expressjs/cors)
- [LoveLink Production Deployment Guide](./PRODUCTION_DEPLOYMENT_GUIDE.md)
