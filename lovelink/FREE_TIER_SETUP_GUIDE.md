# LoveLink - FREE Tier Setup Guide

**Goal:** Run the entire LoveLink platform using **FREE services only** until production launch.

**No paid services required** except Razorpay payment gateway transaction charges.

---

## 📋 Required Services

| Service | Provider | Cost | Purpose |
|---------|----------|------|---------|
| **Database** | PostgreSQL (Render) | FREE | Data storage |
| **Backend Hosting** | Render | FREE | API & Server |
| **Authentication** | Google OAuth | FREE | User login |
| **Email** | Gmail SMTP | FREE | Notifications |
| **Storage** | Cloudinary | FREE | Images/Assets |
| **Payments** | Razorpay | Transaction fee only | Payment processing |

---

## 🚀 Step-by-Step Setup

### 1. Google OAuth Setup (FREE)

#### Create Google OAuth Credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "LoveLink"
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure consent screen:
   - User Type: External
   - App name: LoveLink
   - User support email: your-email@gmail.com
   - Developer contact: your-email@gmail.com
6. Create OAuth Client ID:
   - Application type: Web application
   - Name: LoveLink Web Client
   - Authorized JavaScript origins:
     - `http://localhost:5173` (development)
     - `https://your-app.onrender.com` (production)
   - Authorized redirect URIs:
     - `http://localhost:5173/auth/callback` (development)
     - `https://your-app.onrender.com/auth/callback` (production)
7. **Copy your Client ID and Client Secret**

#### Add to `.env`:
```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

---

### 2. Gmail SMTP Setup (FREE)

#### Generate App Password:

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification (enable if not already)
3. Security → App passwords
4. Create new app password:
   - App: Mail
   - Device: Other (LoveLink)
5. **Copy the 16-character password**

#### Add to `.env`:
```env
EMAIL_PROVIDER=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=noreply@lovelink.app
EMAIL_FROM_NAME=LoveLink
```

**Note:** Gmail free tier allows **500 emails/day** - sufficient for MVP.

---

### 3. Cloudinary Setup (FREE)

#### Create Account:

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for FREE account
3. Go to Dashboard
4. Copy your credentials:
   - Cloud Name
   - API Key
   - API Secret

#### Add to `.env`:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Free Tier Limits:**
- 25 GB storage
- 25 GB bandwidth/month
- 25,000 transformations/month

More than enough for MVP!

---

### 4. Razorpay Setup (Transaction Fees Only)

#### Create Account:

1. Go to [Razorpay](https://razorpay.com/)
2. Sign up
3. Complete KYC verification
4. Go to Settings → API Keys
5. Generate **Test Keys** for development
6. Generate **Live Keys** for production

#### Add to `.env`:
```env
# Development (Test Mode)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_test_secret

# Production (Live Mode)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

**Pricing:**
- No setup fees
- No monthly fees
- **Only 2% transaction fee** (charged on successful payments)

---

### 5. PostgreSQL Database (FREE - Render)

#### Create Database:

1. Go to [Render](https://render.com/)
2. Sign up (FREE account)
3. Click **New** → **PostgreSQL**
4. Configure:
   - Name: lovelink-db
   - Database: lovelink
   - User: lovelink_user
   - Region: Singapore (or closest to your users)
   - Plan: **FREE**
5. Create Database
6. **Copy the External Database URL**

#### Add to `.env`:
```env
DATABASE_URL=postgresql://lovelink_user:password@dpg-xxxxx.singapore-postgres.render.com/lovelink
```

**Free Tier Limits:**
- 256 MB RAM
- 1 GB Storage
- Automatically deleted after 90 days of inactivity

**Important:** Database will spin down after 15 minutes of inactivity. First request may be slow (cold start).

---

### 6. Backend Hosting (FREE - Render)

#### Deploy Backend:

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click **New** → **Web Service**
4. Connect your GitHub repository
5. Configure:
   - Name: lovelink-api
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: **FREE**
6. Add Environment Variables (from your `.env`)
7. Deploy

**Free Tier Limits:**
- 512 MB RAM
- Spins down after 15 minutes of inactivity
- 750 hours/month (sufficient for single instance)

**Important:** Free tier has cold starts (~30 seconds). Keep-alive services can help.

---

## 📝 Complete .env Configuration

```env
# ============================================
# DATABASE
# ============================================
DATABASE_URL=postgresql://lovelink_user:password@dpg-xxxxx.render.com/lovelink

# ============================================
# JWT & SECURITY
# ============================================
JWT_SECRET=generate-a-strong-random-secret-64-characters-minimum
JWT_REFRESH_SECRET=generate-another-strong-random-secret-64-characters
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
SESSION_SECRET=generate-session-secret-64-characters-minimum

# ============================================
# GOOGLE OAUTH
# ============================================
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# ============================================
# PAYMENTS - RAZORPAY
# ============================================
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# ============================================
# EMAIL SERVICE (GMAIL)
# ============================================
EMAIL_PROVIDER=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=noreply@lovelink.app
EMAIL_FROM_NAME=LoveLink

# ============================================
# CLOUDINARY
# ============================================
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ============================================
# FRONTEND
# ============================================
VITE_API_URL=https://lovelink-api.onrender.com
VITE_APP_NAME=LoveLink
VITE_APP_URL=https://lovelink-api.onrender.com

# ============================================
# ENVIRONMENT
# ============================================
NODE_ENV=production
PORT=3000

# ============================================
# LOGGING
# ============================================
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

---

## 🔐 Generate Secure Secrets

Use this command to generate secure random secrets:

```bash
# Linux/Mac
openssl rand -hex 32

# Or Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

---

## 📦 Installation & Deployment

### Local Development:

```bash
# 1. Install dependencies
npm install

# 2. Setup database
npm run db:push

# 3. Run migrations
npm run db:migrate

# 4. Seed database (optional)
npm run db:seed

# 5. Start development server
npm run dev
```

### Deploy to Render:

```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Render will automatically build and deploy

# 3. Run migrations on Render
# In Render Shell, run:
npm run db:migrate:prod
```

---

## ✅ Verification Checklist

After setup, verify each service:

- [ ] **Google OAuth**: Can login with Google account
- [ ] **Database**: Data persists after restart
- [ ] **Email**: Receive purchase confirmation emails
- [ ] **Cloudinary**: Images upload and display correctly
- [ ] **Razorpay**: Test payment works in sandbox mode
- [ ] **Backend**: API endpoints respond correctly

---

## 💡 FREE Tier Limitations & Solutions

### 1. Database Spins Down (Render FREE)

**Issue:** 15-minute inactivity timeout  
**Solution:** 
- Use a cron job to ping `/api/health` every 10 minutes
- Or accept 30-second cold start for first request

### 2. Email Limit (Gmail FREE)

**Issue:** 500 emails/day  
**Solution:**
- More than enough for MVP
- Monitor usage in Email Logs admin panel
- Upgrade to SendGrid (also has free tier: 100 emails/day)

### 3. Backend Cold Starts (Render FREE)

**Issue:** First request slow after inactivity  
**Solution:**
- Use [cron-job.org](https://cron-job.org/) (FREE) to ping every 10 minutes
- Or UptimeRobot (FREE) for monitoring + keep-alive

### 4. Storage Limits (Cloudinary FREE)

**Issue:** 25 GB storage limit  
**Solution:**
- Compress images before upload
- Use Cloudinary's automatic optimization
- 25 GB = ~25,000 high-quality images (more than enough for MVP)

---

## 📊 Cost Breakdown

| Service | Monthly Cost | Notes |
|---------|--------------|-------|
| **Database** | $0 | Render FREE tier |
| **Hosting** | $0 | Render FREE tier |
| **Google OAuth** | $0 | Always free |
| **Gmail SMTP** | $0 | 500 emails/day free |
| **Cloudinary** | $0 | 25 GB free |
| **Razorpay** | 2% per transaction | Only on successful payments |

**Total Fixed Cost: $0/month**

**Example Transaction Costs:**
- 100 orders @ ₹500 each = ₹50,000 revenue
- Razorpay fee (2%) = ₹1,000
- **Your net revenue: ₹49,000**

---

## 🚀 Scaling Plan

When you outgrow FREE tier:

### Phase 1: MVP (0-100 users) - FREE
- Current setup
- **Cost: $0/month**

### Phase 2: Growth (100-1,000 users) - LOW COST
- Upgrade Render to Starter ($7/month)
- Keep database FREE (upgrade only when needed)
- **Cost: ~$10/month**

### Phase 3: Scale (1,000+ users) - MODERATE COST
- Database: Render Standard ($20/month)
- Backend: Render Standard ($20/month)
- Email: SendGrid Essentials ($15/month - 40k emails)
- **Cost: ~$60/month**

### Phase 4: Enterprise (10,000+ users)
- AWS/GCP infrastructure
- Dedicated database
- Redis caching
- **Cost: $200-500/month**

---

## 🔧 Troubleshooting

### Google OAuth not working:
- Verify redirect URLs match exactly
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Ensure Google+ API is enabled

### Emails not sending:
- Verify Gmail app password (not account password)
- Enable 2-Step Verification
- Check EMAIL_USER and EMAIL_PASSWORD in .env

### Database connection fails:
- Verify DATABASE_URL format
- Check if database is active (Render dashboard)
- Wait 30 seconds for cold start

### Payment verification fails:
- Use Razorpay test keys for development
- Verify RAZORPAY_KEY_SECRET matches
- Check webhook signature

---

## 📞 Support

For issues:
1. Check logs in Render dashboard
2. Review Email Logs in admin panel
3. Test each service individually
4. Refer to service documentation:
   - [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)
   - [Gmail SMTP Guide](https://support.google.com/mail/answer/7126229)
   - [Cloudinary Docs](https://cloudinary.com/documentation)
   - [Razorpay Docs](https://razorpay.com/docs/)
   - [Render Docs](https://render.com/docs)

---

## ✅ Summary

**LoveLink runs entirely on FREE services:**

✅ No database costs  
✅ No hosting costs  
✅ No authentication costs  
✅ No email costs (up to 500/day)  
✅ No storage costs (up to 25 GB)  
✅ Only pay Razorpay 2% on successful transactions  

**Ready to launch with ZERO monthly costs!** 🚀

---

**Last Updated:** August 2026  
**Platform:** LoveLink v2.0  
**Architecture:** Google OAuth Only + Gmail SMTP + FREE Tier
