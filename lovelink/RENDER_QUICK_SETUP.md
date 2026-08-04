# Render.com Quick Setup Guide for LoveLink

## TL;DR - Complete Checklist

### Step 1: Prepare GitHub Repository
- [ ] All code committed and pushed to main branch
- [ ] Latest changes include CORS and environment fixes

### Step 2: Create Render Account & Services
- [ ] Sign up at [Render.com](https://render.com)
- [ ] Create PostgreSQL database
- [ ] Create Web Service connected to GitHub repo

### Step 3: Environment Variables (Set in Render Dashboard)

#### Critical - Must Set
```
DATABASE_URL                = (auto from PostgreSQL add-on)
NODE_ENV                    = production
VITE_API_URL               = https://YOUR_RENDER_URL.onrender.com
VITE_APP_URL               = https://YOUR_RENDER_URL.onrender.com
ALLOWED_ORIGINS            = https://YOUR_RENDER_URL.onrender.com,https://www.YOUR_RENDER_URL.onrender.com
```

#### Secrets (Generate Strong Random Strings - Min 64 chars)
```
JWT_SECRET                 = (generate: openssl rand -base64 48)
JWT_REFRESH_SECRET         = (generate: openssl rand -base64 48)
SESSION_SECRET             = (generate: openssl rand -base64 48)
```

#### Razorpay (Production Keys)
```
RAZORPAY_KEY_ID            = rzp_live_xxxxx
RAZORPAY_KEY_SECRET        = xxxxxx
RAZORPAY_WEBHOOK_SECRET    = whsec_live_xxxxx
```

#### Email (DNSExit/SMTP)
```
SMTP_USER                  = your-email@yourdomain.com
SMTP_PASSWORD              = your-dnsexit-password
EMAIL_FROM                 = noreply@yourdomain.com
```

#### Cloudinary
```
CLOUDINARY_CLOUD_NAME      = your-cloud-name
CLOUDINARY_API_KEY         = xxxxxx
CLOUDINARY_API_SECRET      = xxxxxx
CLOUDINARY_UPLOAD_PRESET   = your-preset (optional)
```

#### Google OAuth (Optional)
```
GOOGLE_CLIENT_ID           = xxxxxx
GOOGLE_CLIENT_SECRET       = xxxxxx
```

### Step 4: Configure Services in Render Dashboard

**Web Service Settings:**
- Build Command: `npm install && npx prisma generate && npm run build && npx prisma migrate deploy`
- Start Command: `npm start`
- Health Check Path: `/api/health`

**PostgreSQL Database Settings:**
- Plan: Standard (or Starter if testing)
- Region: Same as Web Service (or closest)
- Backup: Enable daily backups

### Step 5: Deploy
- Render auto-deploys when you push to main branch
- Check deployment logs
- Verify health check passes
- Test at `https://YOUR_RENDER_URL.onrender.com`

## Troubleshooting

### Issue: CORS Errors in Browser Console
```
Access to XMLHttpRequest at 'https://...' from origin 'https://...' 
has been blocked by CORS policy
```
**Fix:** 
1. Check `ALLOWED_ORIGINS` environment variable is set correctly
2. Ensure it matches your Render URL exactly
3. Restart the service

### Issue: 500 Error on API Calls
1. Check Render logs for specific errors
2. Verify all required environment variables are set
3. Check database connection: `curl https://YOUR_URL/api/health`

### Issue: White Page / Not Loading
1. Check browser console for errors
2. Verify `VITE_API_URL` is set to your Render domain
3. Check if database migrations completed in build logs
4. Clear browser cache and restart

### Issue: Database Not Initializing
1. Verify `DATABASE_URL` is set (should be auto-populated)
2. Check build logs for "Prisma migrate" output
3. Ensure PostgreSQL database is connected
4. Try redeploying

### Issue: Emails Not Sending
1. Verify `SMTP_USER` and `SMTP_PASSWORD` are correct
2. Check `EMAIL_FROM` is correct
3. Verify SMTP credentials in DNSExit dashboard
4. Check email service logs

## Important URLs

- Render Dashboard: https://dashboard.render.com
- Your App: https://YOUR_RENDER_URL.onrender.com
- API Health: https://YOUR_RENDER_URL.onrender.com/api/health
- GitHub Repository: https://github.com/Arunydvmm/lovelink

## Key Files

- **Configuration:** `render.yaml`
- **Security Middleware:** `src/middleware/securityMiddleware.ts`
- **Full Documentation:** `RENDER_PRODUCTION_DEPLOYMENT_FIXES.md`
- **Production Guide:** `PRODUCTION_DEPLOYMENT_GUIDE.md`

## Testing Checklist

After deployment, verify:
- [ ] Health endpoint returns 200: `curl https://YOUR_URL/api/health`
- [ ] Frontend loads without CORS errors
- [ ] Can create account / login
- [ ] Payment flow works (test with Razorpay test keys first)
- [ ] Emails are being sent
- [ ] Database is persisting data

## Security Reminders

- ✅ Never commit secrets to git (use Render environment variables)
- ✅ Use strong, unique JWT secrets (min 64 characters)
- ✅ Enable HTTPS (automatic on Render)
- ✅ Keep dependencies updated
- ✅ Monitor logs regularly
- ✅ Set up error tracking (Sentry recommended)

## Support

- Render Docs: https://render.com/docs
- LoveLink Issues: Check GitHub repository
- Deployment Issues: Check render.yaml and environment variables

---

**Total Setup Time:** ~30 minutes (first time) | ~5 minutes (redeploy)

**Next Review:** After first deployment works successfully
