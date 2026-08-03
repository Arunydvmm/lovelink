# 🚀 LoveLink - Render Deployment Guide

Complete step-by-step guide to deploy LoveLink on Render.com

---

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ GitHub repository: https://github.com/Arunydvmm/lovelink.git
- ✅ Render.com account (free tier available)
- ✅ All environment variable values ready (see `ENVIRONMENT_VARIABLES.md`)
- ✅ Google OAuth credentials configured
- ✅ Razorpay account (live mode)
- ✅ DNSExit SMTP credentials
- ✅ Cloudinary account

---

## 🎯 Deployment Options

### **Option 1: Blueprint Deploy (Recommended - Automatic)**
Uses `render.yaml` for automatic configuration

### **Option 2: Manual Deploy**
Manual configuration through Render dashboard

---

## 🔷 Option 1: Blueprint Deploy (Automatic)

### Step 1: Push to GitHub

```powershell
cd d:\lovelink
git add .
git commit -m "feat: Add Render deployment configuration"
git push origin main
```

### Step 2: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 3: Deploy with Blueprint

1. Click **"New +"** → **"Blueprint"**
2. Connect your GitHub repository: `Arunydvmm/lovelink`
3. Render will automatically detect `render.yaml`
4. Click **"Apply"**

### Step 4: Configure Environment Variables

Render will create services but you need to set secret values:

1. Go to your web service dashboard
2. Click **"Environment"**
3. Add these **SECRET** environment variables:

```bash
# Database (automatically set by Render if using their PostgreSQL)
DATABASE_URL=<auto-filled or paste your PostgreSQL URL>

# JWT & Security (generate random strings)
JWT_SECRET=<generate-32-char-random-string>
JWT_REFRESH_SECRET=<generate-different-32-char-random-string>
SESSION_SECRET=<generate-32-char-random-string>

# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Razorpay
RAZORPAY_KEY_ID=rzp_live_<your-key-id>
RAZORPAY_KEY_SECRET=<your-razorpay-secret>
RAZORPAY_WEBHOOK_SECRET=whsec_<your-webhook-secret>

# DNSExit SMTP
SMTP_USER=<your-dnsexit-username>
SMTP_PASSWORD=<your-dnsexit-password>
EMAIL_FROM=noreply@yourdomain.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
CLOUDINARY_UPLOAD_PRESET=<your-upload-preset>
```

### Step 5: Save and Deploy

Click **"Save Changes"** → Render will automatically rebuild and deploy

---

## 🔷 Option 2: Manual Deploy

### Step 1: Create PostgreSQL Database

1. In Render dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name:** `lovelink-db`
   - **Database:** `lovelink_prod`
   - **Region:** Oregon (or nearest to you)
   - **Plan:** Starter (free for 90 days)
3. Click **"Create Database"**
4. Copy the **"Internal Database URL"** (starts with `postgresql://`)

### Step 2: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `Arunydvmm/lovelink`
3. Configure:

#### Basic Settings:
```
Name: lovelink
Region: Oregon (same as database)
Branch: main
Root Directory: . (leave blank or type dot)
Runtime: Node
```

#### Build & Start:
```
Build Command:
npm install && npm run build && npx prisma generate && npx prisma migrate deploy

Start Command:
npm start
```

#### Plan:
```
Plan: Starter ($7/month or Free trial)
```

### Step 3: Add Environment Variables

Click **"Environment"** → **"Add Environment Variable"**

**Copy and paste these (replace with your actual values):**

```bash
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=<paste-internal-database-url-from-step-1>

# JWT & Security
JWT_SECRET=<generate-random-32-chars>
JWT_REFRESH_SECRET=<generate-different-random-32-chars>
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
SESSION_SECRET=<generate-random-32-chars>

# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Razorpay
RAZORPAY_KEY_ID=rzp_live_<your-key-id>
RAZORPAY_KEY_SECRET=<your-razorpay-secret>
RAZORPAY_WEBHOOK_SECRET=whsec_<your-webhook-secret>

# DNSExit SMTP
SMTP_HOST=relay.dnsexit.com
SMTP_BACKUP_HOST=relaybackup.dnsexit.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<your-dnsexit-username>
SMTP_PASSWORD=<your-dnsexit-password>
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=LoveLink

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
CLOUDINARY_UPLOAD_PRESET=<your-upload-preset>

# Frontend URLs (will be auto-assigned by Render)
VITE_API_URL=https://lovelink.onrender.com
VITE_APP_URL=https://lovelink.onrender.com
VITE_APP_NAME=LoveLink

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_LOGIN_MAX=10
RATE_LIMIT_LOGIN_WINDOW=900000

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Feature Flags
FEATURE_EMAIL_NOTIFICATIONS=true
FEATURE_TWO_FACTOR_AUTH=false
FEATURE_ANALYTICS=true

# CORS
ALLOWED_ORIGINS=https://lovelink.onrender.com
```

### Step 4: Create and Deploy

Click **"Create Web Service"** → Render will start building

---

## 🔧 Post-Deployment Configuration

### 1. Update Google OAuth Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to **APIs & Services → Credentials**
4. Edit your OAuth 2.0 Client ID
5. Add authorized redirect URI:
   ```
   https://your-app-name.onrender.com/auth/callback
   ```
6. Save changes

### 2. Update Razorpay Webhook URL

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to **Settings → Webhooks**
3. Create/edit webhook:
   ```
   URL: https://your-app-name.onrender.com/api/webhooks/razorpay
   Events: payment.captured, payment.failed, order.paid
   ```
4. Copy the webhook secret and update `RAZORPAY_WEBHOOK_SECRET` in Render

### 3. Configure Custom Domain (Optional)

1. In Render dashboard, go to your web service
2. Click **"Settings"** → **"Custom Domains"**
3. Add your domain: `lovelink.yourdomain.com`
4. Add DNS records (Render will show you what to add):
   ```
   CNAME: lovelink → your-app.onrender.com
   ```
5. Wait for SSL certificate (automatic, ~5 minutes)
6. Update environment variables:
   ```bash
   VITE_API_URL=https://lovelink.yourdomain.com
   VITE_APP_URL=https://lovelink.yourdomain.com
   ALLOWED_ORIGINS=https://lovelink.yourdomain.com
   ```
7. Update Google OAuth and Razorpay webhook URLs

---

## 🐛 Troubleshooting

### ❌ Error: "Could not read package.json"

**Cause:** Render is looking in the wrong directory

**Solution 1:** Set Root Directory
- In service settings, set **Root Directory** to `.` (dot) or leave blank

**Solution 2:** Update Build Command
```bash
npm install && npm run build && npx prisma generate && npx prisma migrate deploy
```

### ❌ Error: "Build failed" or "npm install failed"

**Cause:** Missing dependencies or Node version mismatch

**Solution:**
1. Check Node.js version in Render logs
2. Add `.node-version` file:
   ```bash
   24
   ```
3. Or specify in `package.json`:
   ```json
   {
     "engines": {
       "node": ">=18.0.0"
     }
   }
   ```

### ❌ Error: "Prisma migrate failed"

**Cause:** Database connection issue

**Solution:**
1. Verify `DATABASE_URL` is correct
2. Check database is in same region
3. Use **Internal Database URL** (not External)
4. Ensure connection string includes `?sslmode=require`

### ❌ Error: "Health check failed"

**Cause:** Server not starting or health endpoint unreachable

**Solution:**
1. Check logs: Render Dashboard → Logs
2. Verify server starts on `PORT` environment variable:
   ```typescript
   const port = process.env.PORT || 3000;
   ```
3. Check health endpoint exists: `/api/health`
4. Disable health check temporarily (Settings → Health Check → Disable)

### ❌ Error: "CORS error" in browser

**Cause:** CORS origins not configured

**Solution:**
1. Update `ALLOWED_ORIGINS` environment variable:
   ```bash
   ALLOWED_ORIGINS=https://your-app.onrender.com
   ```
2. Restart service

### ❌ Error: "Google OAuth redirect_uri_mismatch"

**Cause:** Redirect URI not whitelisted in Google Console

**Solution:**
1. Add Render URL to Google OAuth redirect URIs
2. Format: `https://your-app.onrender.com/auth/callback`
3. Wait 5 minutes for Google to propagate changes

### ❌ Error: "Email sending failed"

**Cause:** SMTP credentials incorrect or domain not verified

**Solution:**
1. Verify DNSExit credentials
2. Check domain verification in DNSExit dashboard
3. Add SPF record: `v=spf1 include:dnsexit.com ~all`
4. Add DKIM record: Point `relay._domainkey` to `dkim.dnsexit.com`
5. Test SMTP connection in logs

### ❌ Error: "Cloudinary upload failed"

**Cause:** API credentials incorrect

**Solution:**
1. Verify `CLOUDINARY_CLOUD_NAME`, `API_KEY`, `API_SECRET`
2. Check Cloudinary dashboard for correct values
3. Ensure no extra spaces in environment variables

### ❌ Error: "Payment webhook verification failed"

**Cause:** Webhook secret mismatch

**Solution:**
1. Copy exact webhook secret from Razorpay dashboard
2. Update `RAZORPAY_WEBHOOK_SECRET` in Render
3. Restart service
4. Test webhook using Razorpay dashboard test tool

---

## 📊 Monitoring & Logs

### View Logs

1. Go to Render Dashboard
2. Select your web service
3. Click **"Logs"**
4. Filter by log level: Info, Warning, Error

### Enable Persistent Logs

1. In service settings: **Logging**
2. Enable **"Persistent Logs"** (paid feature)
3. Or use external logging: Logtail, Datadog, Sentry

### Monitor Performance

1. Render Dashboard → **"Metrics"**
2. View:
   - CPU usage
   - Memory usage
   - Request rate
   - Response time

---

## 🔄 Updating Your App

### Automatic Deploys (Recommended)

1. Push to GitHub:
   ```powershell
   git add .
   git commit -m "feat: Update feature"
   git push origin main
   ```
2. Render automatically detects and deploys

### Disable Auto-Deploy

1. Service Settings → **"Build & Deploy"**
2. Disable **"Auto-Deploy"**
3. Deploy manually: Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## 💰 Cost Estimates

### Free Tier (0-90 days)
- PostgreSQL: Free for 90 days
- Web Service: Free instance (spins down after inactivity)
- Total: **$0/month**

### After Free Trial
- PostgreSQL: $7/month (Starter plan)
- Web Service: $7/month (Starter plan)
- Total: **$14/month**

### Production (Recommended)
- PostgreSQL: $20/month (Standard plan - 2GB RAM)
- Web Service: $25/month (Standard plan - 2GB RAM)
- Total: **$45/month**

---

## 🌐 Custom Domain Setup

### Step 1: Add Custom Domain

1. Render Dashboard → Your service → **Settings** → **Custom Domains**
2. Click **"Add Custom Domain"**
3. Enter: `lovelink.yourdomain.com`

### Step 2: Configure DNS

Add these records in your domain registrar (Cloudflare, Namecheap, GoDaddy):

```
Type: CNAME
Name: lovelink (or @)
Value: your-app.onrender.com
TTL: Auto or 3600
```

### Step 3: Wait for SSL

- Render automatically provisions SSL certificate (Let's Encrypt)
- Takes 5-15 minutes
- Status: Settings → Custom Domains → ✅ SSL Active

### Step 4: Update Environment Variables

```bash
VITE_API_URL=https://lovelink.yourdomain.com
VITE_APP_URL=https://lovelink.yourdomain.com
ALLOWED_ORIGINS=https://lovelink.yourdomain.com
EMAIL_FROM=noreply@yourdomain.com
```

### Step 5: Update OAuth & Webhooks

- Google OAuth: Add `https://lovelink.yourdomain.com/auth/callback`
- Razorpay Webhook: Update to `https://lovelink.yourdomain.com/api/webhooks/razorpay`

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] All environment variables prepared
- [ ] Google OAuth credentials configured
- [ ] Razorpay live mode enabled
- [ ] DNSExit SMTP verified
- [ ] Cloudinary account set up
- [ ] Code pushed to GitHub

### During Deployment
- [ ] PostgreSQL database created
- [ ] Web service created and configured
- [ ] All environment variables added
- [ ] Build completed successfully
- [ ] Health check passing

### Post-Deployment
- [ ] Application accessible via URL
- [ ] Google OAuth login works
- [ ] Payment flow tested (Razorpay)
- [ ] Email sending works (DNSExit)
- [ ] Image upload works (Cloudinary)
- [ ] Webhook tested (Razorpay)
- [ ] Logs monitored for errors
- [ ] Custom domain configured (optional)

---

## 🆘 Need Help?

### Render Documentation
- [Node.js Deployment](https://render.com/docs/deploy-node-express-app)
- [PostgreSQL Guide](https://render.com/docs/databases)
- [Environment Variables](https://render.com/docs/configure-environment-variables)
- [Troubleshooting](https://render.com/docs/troubleshooting-deploys)

### Render Support
- Community Forum: https://community.render.com
- Support: support@render.com
- Status Page: https://status.render.com

### Project Issues
- GitHub Issues: https://github.com/Arunydvmm/lovelink/issues
- Email Support: [Your Support Email]

---

## 📈 Next Steps

After successful deployment:

1. **Set up monitoring:** Integrate Sentry or LogRocket
2. **Enable backups:** Configure automated database backups
3. **Add analytics:** Google Analytics, Mixpanel, or PostHog
4. **Performance testing:** Load test with Artillery or k6
5. **Security audit:** Run OWASP ZAP or Burp Suite
6. **Documentation:** Update README with production URL

---

**Deployment Guide Version:** 1.0.0  
**Last Updated:** 2026-08-04  
**Author:** LoveLink Team
