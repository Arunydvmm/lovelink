# LoveLink - Environment Variables Reference

Complete list of environment variables required for the LoveLink application.

---

## 📋 Quick Setup Checklist

**Required for Production:**
- ✅ DATABASE_URL
- ✅ JWT_SECRET, JWT_REFRESH_SECRET
- ✅ GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- ✅ RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
- ✅ SMTP_HOST, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM
- ✅ CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

---

## 🗄️ DATABASE

### `DATABASE_URL` *(Required)*
**Format:** `postgresql://username:password@host:port/database`

**Examples:**
```bash
# Development (Local PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lovelink_dev"

# Production (Cloud PostgreSQL - e.g., Neon, Supabase, Railway)
DATABASE_URL="postgresql://user:password@ep-xyz.aws.neon.tech/lovelink_prod?sslmode=require"
```

**Where to get:**
- Local: Install PostgreSQL locally
- Cloud: [Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app), [Render](https://render.com)

**Notes:**
- Must be PostgreSQL 12+ for Prisma compatibility
- Cloud providers automatically include SSL (`sslmode=require`)

---

## 🔐 JWT & SECURITY

### `JWT_SECRET` *(Required)*
**Description:** Secret key for signing access tokens (short-lived)

**Example:**
```bash
JWT_SECRET=a7f8d9e2b1c4a5f8d9e2b1c4a5f8d9e2b1c4a5f8d9e2b1c4a5f8d9e2
```

**How to generate:**
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32

# PowerShell
[System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Security:**
- Minimum 32 characters
- NEVER commit to Git
- Different value per environment

---

### `JWT_REFRESH_SECRET` *(Required)*
**Description:** Secret key for signing refresh tokens (long-lived)

**Example:**
```bash
JWT_REFRESH_SECRET=b8g9e3c2d5b6a7f8e9c3d2e5b6a7f8e9c3d2e5b6a7f8e9c3d2e5b6
```

**Notes:**
- MUST be different from `JWT_SECRET`
- Same generation method as JWT_SECRET

---

### `JWT_EXPIRE` *(Optional)*
**Description:** Access token expiration time

**Default:** `7d` (7 days)

**Valid formats:**
```bash
JWT_EXPIRE=15m    # 15 minutes
JWT_EXPIRE=1h     # 1 hour
JWT_EXPIRE=7d     # 7 days
```

**Recommendation:**
- Development: `7d`
- Production: `15m` to `1h` (more secure)

---

### `JWT_REFRESH_EXPIRE` *(Optional)*
**Description:** Refresh token expiration time

**Default:** `30d` (30 days)

**Example:**
```bash
JWT_REFRESH_EXPIRE=30d
```

**Recommendation:**
- Development: `30d`
- Production: `7d` to `30d`

---

### `SESSION_SECRET` *(Required)*
**Description:** Secret key for session cookies

**Example:**
```bash
SESSION_SECRET=c9h1f4e3g6c8b9a2f5e4g7c9b1a3f6e5g8c1b4a7f9e2g5c8b1
```

**Generate using same methods as JWT_SECRET**

---

## 🔑 GOOGLE OAUTH

### `GOOGLE_CLIENT_ID` *(Required)*
**Description:** Google OAuth 2.0 Client ID

**Example:**
```bash
GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

**Where to get:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   ```
   http://localhost:5173/auth/callback
   https://yourdomain.com/auth/callback
   ```
7. Copy the Client ID

---

### `GOOGLE_CLIENT_SECRET` *(Required)*
**Description:** Google OAuth 2.0 Client Secret

**Example:**
```bash
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz123
```

**Where to get:**
- Available in the same Google Cloud Console page after creating OAuth client
- Click "Download JSON" for backup

**Security:**
- NEVER expose in frontend code
- NEVER commit to Git

---

## 💳 RAZORPAY (Payment Gateway)

### `RAZORPAY_KEY_ID` *(Required)*
**Description:** Razorpay API Key ID

**Example:**
```bash
# Test Mode
RAZORPAY_KEY_ID=rzp_test_1234567890abcd

# Live Mode
RAZORPAY_KEY_ID=rzp_live_1234567890abcd
```

**Where to get:**
1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to **Settings → API Keys**
3. Generate Test/Live Keys
4. Copy Key ID

**Notes:**
- Use `rzp_test_` prefix for testing
- Switch to `rzp_live_` for production

---

### `RAZORPAY_KEY_SECRET` *(Required)*
**Description:** Razorpay API Key Secret

**Example:**
```bash
RAZORPAY_KEY_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

**Where to get:**
- Same location as Key ID
- Visible only once after generation (download and save securely)

**Security:**
- NEVER expose in frontend
- Store in backend environment only

---

### `RAZORPAY_WEBHOOK_SECRET` *(Required)*
**Description:** Secret for verifying Razorpay webhook signatures

**Example:**
```bash
RAZORPAY_WEBHOOK_SECRET=whsec_abcdefghijklmnopqrstuvwxyz123456
```

**Where to get:**
1. In Razorpay Dashboard: **Settings → Webhooks**
2. Create a new webhook:
   ```
   URL: https://yourdomain.com/api/webhooks/razorpay
   Events: payment.captured, payment.failed, order.paid
   ```
3. Copy the webhook secret

**Notes:**
- Used to verify webhook authenticity
- Prevents webhook spoofing attacks

---

## 📧 EMAIL SERVICE (DNSExit SMTP Mail Relay)

### `SMTP_HOST` *(Required)*
**Description:** Primary SMTP server hostname

**Default:** `relay.dnsexit.com`

**Example:**
```bash
SMTP_HOST=relay.dnsexit.com
```

**Provider:** [DNSExit Mail Relay](https://www.dnsexit.com/Direct.sv?cmd=mailRelay2)

---

### `SMTP_BACKUP_HOST` *(Optional)*
**Description:** Backup SMTP server (automatic failover)

**Default:** `relaybackup.dnsexit.com`

**Example:**
```bash
SMTP_BACKUP_HOST=relaybackup.dnsexit.com
```

**Notes:**
- Application automatically switches if primary fails
- Configured in `src/lib/email/DNSExitProvider.ts`

---

### `SMTP_PORT` *(Required)*
**Description:** SMTP server port

**Default:** `587` (STARTTLS)

**Supported Ports:**
```bash
587   # Recommended (STARTTLS)
2525  # Alternative
26    # Alternative
80    # Alternative
940   # Alternative
8001  # Alternative
25    # Traditional (may be blocked by ISPs)
```

**Recommendation:** Use `587` with STARTTLS

---

### `SMTP_SECURE` *(Optional)*
**Description:** Use direct SSL/TLS connection

**Default:** `false`

**Values:**
```bash
SMTP_SECURE=false   # Use STARTTLS (port 587)
SMTP_SECURE=true    # Use SSL/TLS (port 465)
```

**Recommendation:** Keep `false` for DNSExit (port 587 uses STARTTLS)

---

### `SMTP_USER` *(Required)*
**Description:** SMTP authentication username

**Example:**
```bash
SMTP_USER=your-dnsexit-username
```

**Where to get:**
1. Sign up at [DNSExit Mail Relay](https://www.dnsexit.com/Direct.sv?cmd=mailRelay2)
2. Verify your domain
3. Create SMTP credentials
4. Use the username provided

---

### `SMTP_PASSWORD` *(Required)*
**Description:** SMTP authentication password

**Example:**
```bash
SMTP_PASSWORD=your-secure-smtp-password
```

**Security:**
- NEVER commit to Git
- Store securely in environment

---

### `EMAIL_FROM` *(Required)*
**Description:** Default sender email address

**Example:**
```bash
EMAIL_FROM=noreply@yourdomain.com
```

**Requirements:**
- Must be a verified domain in DNSExit
- Configure SPF record: `v=spf1 include:dnsexit.com ~all`
- Configure DKIM: Point `relay._domainkey` to `dkim.dnsexit.com`

**Best Practices:**
- Use `noreply@` or `hello@` or `support@`
- Match your actual domain

---

### `EMAIL_FROM_NAME` *(Optional)*
**Description:** Friendly name for sender

**Default:** `LoveLink`

**Example:**
```bash
EMAIL_FROM_NAME=LoveLink
EMAIL_FROM_NAME=LoveLink Support Team
```

---

## ☁️ CLOUDINARY (Image/Media Storage)

### `CLOUDINARY_CLOUD_NAME` *(Required)*
**Description:** Cloudinary cloud name

**Example:**
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
```

**Where to get:**
1. Sign up at [Cloudinary](https://cloudinary.com)
2. Go to Dashboard
3. Find "Cloud Name" in the top section
4. Copy the value

**Free Tier:**
- 25 GB storage
- 25 GB bandwidth/month
- Sufficient for development and small production apps

---

### `CLOUDINARY_API_KEY` *(Required)*
**Description:** Cloudinary API key

**Example:**
```bash
CLOUDINARY_API_KEY=123456789012345
```

**Where to get:**
- Same Cloudinary Dashboard
- Under "Account Details"

---

### `CLOUDINARY_API_SECRET` *(Required)*
**Description:** Cloudinary API secret

**Example:**
```bash
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz-123
```

**Where to get:**
- Same Cloudinary Dashboard
- Click "Reveal API Secret" to view

**Security:**
- Backend only (NEVER expose in frontend)
- Used for upload signatures

---

### `CLOUDINARY_UPLOAD_PRESET` *(Optional)*
**Description:** Unsigned upload preset for frontend uploads

**Example:**
```bash
CLOUDINARY_UPLOAD_PRESET=lovelink_unsigned
```

**How to create:**
1. Cloudinary Dashboard → Settings → Upload
2. Scroll to "Upload presets"
3. Click "Add upload preset"
4. Set signing mode to "Unsigned"
5. Configure folder, transformations, etc.
6. Save and copy preset name

**Notes:**
- Safe to expose in frontend
- Limits uploads to specific configurations

---

## 🌐 FRONTEND (Vite)

### `VITE_API_URL` *(Required)*
**Description:** Backend API base URL

**Examples:**
```bash
# Development
VITE_API_URL=http://localhost:3000

# Production
VITE_API_URL=https://api.yourdomain.com
```

**Notes:**
- Must be accessible from browser
- Include protocol (http:// or https://)
- No trailing slash

---

### `VITE_APP_NAME` *(Optional)*
**Description:** Application display name

**Default:** `LoveLink`

**Example:**
```bash
VITE_APP_NAME=LoveLink
```

---

### `VITE_APP_URL` *(Required)*
**Description:** Frontend application URL

**Examples:**
```bash
# Development
VITE_APP_URL=http://localhost:5173

# Production
VITE_APP_URL=https://yourdomain.com
```

**Usage:**
- Used in emails for links
- Used in OAuth redirects
- Used for QR code generation

---

## ⚙️ GENERAL CONFIGURATION

### `NODE_ENV` *(Required)*
**Description:** Application environment

**Values:**
```bash
NODE_ENV=development
NODE_ENV=production
NODE_ENV=test
```

**Effects:**
- Changes logging verbosity
- Enables/disables debug features
- Affects error reporting detail

---

### `PORT` *(Optional)*
**Description:** Backend server port

**Default:** `3000`

**Example:**
```bash
PORT=3000
```

**Notes:**
- Cloud platforms (Railway, Render) often auto-assign PORT
- Use `process.env.PORT || 3000` in code

---

## 📊 LOGGING

### `LOG_LEVEL` *(Optional)*
**Description:** Logging verbosity level

**Default:** `info`

**Values:**
```bash
LOG_LEVEL=error    # Only errors
LOG_LEVEL=warn     # Warnings and errors
LOG_LEVEL=info     # Info, warnings, errors (recommended for production)
LOG_LEVEL=debug    # Verbose debugging (development only)
LOG_LEVEL=silly    # Everything (very verbose)
```

**Recommendation:**
- Development: `debug`
- Production: `info`

---

### `LOG_FILE` *(Optional)*
**Description:** Log file path

**Default:** `logs/app.log`

**Example:**
```bash
LOG_FILE=logs/app.log
```

**Notes:**
- Relative to project root
- Directory created automatically
- Rotates when size exceeds limit

---

## 🚦 RATE LIMITING

### `RATE_LIMIT_WINDOW_MS` *(Optional)*
**Description:** Rate limit time window (milliseconds)

**Default:** `900000` (15 minutes)

**Example:**
```bash
RATE_LIMIT_WINDOW_MS=900000
```

---

### `RATE_LIMIT_MAX_REQUESTS` *(Optional)*
**Description:** Max requests per window

**Default:** `1000`

**Example:**
```bash
RATE_LIMIT_MAX_REQUESTS=1000
```

---

### `RATE_LIMIT_LOGIN_MAX` *(Optional)*
**Description:** Max login attempts per window

**Default:** `10`

**Example:**
```bash
RATE_LIMIT_LOGIN_MAX=10
```

**Notes:**
- Prevents brute force attacks
- Per IP address

---

### `RATE_LIMIT_LOGIN_WINDOW` *(Optional)*
**Description:** Login rate limit window (milliseconds)

**Default:** `900000` (15 minutes)

**Example:**
```bash
RATE_LIMIT_LOGIN_WINDOW=900000
```

---

## 🎛️ FEATURE FLAGS

### `FEATURE_EMAIL_NOTIFICATIONS` *(Optional)*
**Description:** Enable email notifications

**Default:** `true`

**Example:**
```bash
FEATURE_EMAIL_NOTIFICATIONS=true
```

---

### `FEATURE_TWO_FACTOR_AUTH` *(Optional)*
**Description:** Enable 2FA (future feature)

**Default:** `false`

**Example:**
```bash
FEATURE_TWO_FACTOR_AUTH=false
```

---

### `FEATURE_ANALYTICS` *(Optional)*
**Description:** Enable analytics tracking

**Default:** `true`

**Example:**
```bash
FEATURE_ANALYTICS=true
```

---

## 🔒 CORS

### `ALLOWED_ORIGINS` *(Optional)*
**Description:** Comma-separated list of allowed CORS origins

**Default:** Frontend URL

**Example:**
```bash
# Development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173

# Production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Notes:**
- No spaces between URLs
- Include protocol
- No trailing slashes

---

## 📦 Complete .env.production Template

```bash
# ============================================
# PRODUCTION ENVIRONMENT
# ============================================

NODE_ENV=production
PORT=3000

# ============================================
# DATABASE (Required)
# ============================================
DATABASE_URL="postgresql://user:password@host:5432/lovelink_prod?sslmode=require"

# ============================================
# JWT & SECURITY (Required)
# ============================================
JWT_SECRET=YOUR_SECURE_32_CHAR_RANDOM_STRING_HERE
JWT_REFRESH_SECRET=YOUR_DIFFERENT_32_CHAR_RANDOM_STRING_HERE
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
SESSION_SECRET=YOUR_SESSION_32_CHAR_RANDOM_STRING_HERE

# ============================================
# GOOGLE OAUTH (Required)
# ============================================
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-client-secret

# ============================================
# RAZORPAY PAYMENTS (Required)
# ============================================
RAZORPAY_KEY_ID=rzp_live_your_actual_key_id
RAZORPAY_KEY_SECRET=your_actual_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=whsec_your_actual_webhook_secret

# ============================================
# DNSEXIT SMTP EMAIL (Required)
# ============================================
SMTP_HOST=relay.dnsexit.com
SMTP_BACKUP_HOST=relaybackup.dnsexit.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-dnsexit-username
SMTP_PASSWORD=your-dnsexit-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=LoveLink

# ============================================
# CLOUDINARY (Required)
# ============================================
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_PRESET=lovelink_unsigned

# ============================================
# FRONTEND URLS (Required)
# ============================================
VITE_API_URL=https://api.yourdomain.com
VITE_APP_URL=https://yourdomain.com
VITE_APP_NAME=LoveLink

# ============================================
# RATE LIMITING (Optional)
# ============================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_LOGIN_MAX=10
RATE_LIMIT_LOGIN_WINDOW=900000

# ============================================
# LOGGING (Optional)
# ============================================
LOG_LEVEL=info
LOG_FILE=logs/app.log

# ============================================
# FEATURE FLAGS (Optional)
# ============================================
FEATURE_EMAIL_NOTIFICATIONS=true
FEATURE_TWO_FACTOR_AUTH=false
FEATURE_ANALYTICS=true

# ============================================
# CORS (Optional)
# ============================================
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

## 🚨 Security Checklist

Before deploying to production:

- [ ] All secrets are randomly generated (32+ characters)
- [ ] JWT_SECRET and JWT_REFRESH_SECRET are different
- [ ] No credentials are committed to Git
- [ ] .env files are in .gitignore
- [ ] Google OAuth redirects include production URL
- [ ] Razorpay is in live mode (not test mode)
- [ ] DNSExit domain is verified with SPF/DKIM
- [ ] Cloudinary API secret is backend-only
- [ ] CORS origins are restricted to your domain
- [ ] Database URL uses SSL (`sslmode=require`)
- [ ] Rate limiting is enabled
- [ ] Log level is set to `info` (not `debug`)

---

## 📚 Additional Resources

- **Prisma Database:** https://www.prisma.io/docs/guides/database
- **Google OAuth:** https://console.cloud.google.com
- **Razorpay:** https://dashboard.razorpay.com
- **DNSExit SMTP:** https://www.dnsexit.com/Direct.sv?cmd=mailRelay2
- **Cloudinary:** https://cloudinary.com/documentation

---

## 🆘 Need Help?

If you encounter issues with environment variables:

1. Check spelling and formatting
2. Verify quotes around values with special characters
3. Restart server after changing .env files
4. Check logs for specific error messages
5. Verify credentials with provider dashboards

**Common Issues:**
- `DATABASE_URL` connection refused → Check PostgreSQL is running
- `GOOGLE_CLIENT_ID` invalid → Verify OAuth redirect URIs
- `RAZORPAY_KEY_SECRET` rejected → Ensure using correct mode (test/live)
- `SMTP_USER` auth failed → Verify DNSExit credentials and domain verification
- `CLOUDINARY_API_SECRET` invalid → Check for extra spaces or characters

---

Generated on: 2026-08-04
Version: 1.0.0
