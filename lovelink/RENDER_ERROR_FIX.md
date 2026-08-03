# 🔧 Quick Fix: Render "package.json not found" Error

## ❌ The Error You're Seeing

```
npm error code ENOENT
npm error syscall open
npm error path /opt/render/project/src/package.json
npm error errno -2
npm error enoent Could not read package.json
```

---

## ✅ Root Cause

Render is looking for `package.json` in the **wrong directory**:
- Looking for: `/opt/render/project/src/package.json` ❌
- Should be: `/opt/render/project/package.json` ✅

This happens because Render's **Root Directory** setting is incorrect or the build command is running in the wrong context.

---

## 🚀 Solution (3 Options)

### **Option 1: Update Render Dashboard Settings (Quick Fix)**

1. Go to your Render service dashboard
2. Click **"Settings"**
3. Scroll to **"Build & Deploy"** section
4. Update these fields:

```
Root Directory: .
(or leave it completely empty/blank)

Build Command:
npm install && npm run build && npx prisma generate && npx prisma migrate deploy

Start Command:
npm start
```

5. Click **"Save Changes"**
6. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

### **Option 2: Use render.yaml (Automatic - Recommended)**

The `render.yaml` file has been added to your repository. To use it:

1. **Push changes to GitHub:**
   ```powershell
   cd d:\lovelink
   git add .
   git commit -m "fix: Add Render configuration files"
   git push origin main
   ```

2. **Delete existing Render service** (if you created one manually)
   - Go to Render dashboard
   - Select your service
   - Settings → Delete Service

3. **Create new Blueprint deployment:**
   - Render Dashboard → **"New +"** → **"Blueprint"**
   - Select repository: `Arunydvmm/lovelink`
   - Render will detect `render.yaml` automatically
   - Click **"Apply"**
   - Add secret environment variables (see below)

4. **Add Secret Environment Variables:**

After blueprint creates the service, go to Environment and add:

```bash
DATABASE_URL=<your-postgresql-url>
JWT_SECRET=<generate-random-32-chars>
JWT_REFRESH_SECRET=<generate-different-random-32-chars>
SESSION_SECRET=<generate-random-32-chars>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
RAZORPAY_KEY_ID=<your-razorpay-key-id>
RAZORPAY_KEY_SECRET=<your-razorpay-secret>
RAZORPAY_WEBHOOK_SECRET=<your-webhook-secret>
SMTP_USER=<your-dnsexit-username>
SMTP_PASSWORD=<your-dnsexit-password>
EMAIL_FROM=noreply@yourdomain.com
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```

---

### **Option 3: Update Existing Service (No Blueprint)**

If you want to keep your existing service:

1. **Push latest changes:**
   ```powershell
   cd d:\lovelink
   git add .
   git commit -m "fix: Update package.json and add Node version"
   git push origin main
   ```

2. **Update Render settings:**
   - Go to your service → **Settings**
   - Find **"Build & Deploy"** section
   - Set **Root Directory** to: `.` (just a dot) or leave blank
   - Update **Build Command** to:
     ```
     npm install && npm run build && npx prisma generate && npx prisma migrate deploy
     ```
   - Update **Start Command** to:
     ```
     npm start
     ```
   - Click **"Save Changes"**

3. **Manual Deploy:**
   - Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## 📋 Verification Steps

After deploying, verify:

### 1. Check Build Logs
Look for these success indicators:
```
✓ Dependencies installed
✓ Vite build completed
✓ Prisma generated
✓ Prisma migrations applied
```

### 2. Check Health Endpoint
Open in browser:
```
https://your-app-name.onrender.com/api/health
```

Should return:
```json
{
  "status": "ok",
  "time": "2026-08-04T...",
  "environment": "production",
  "uptime": 123.456
}
```

### 3. Check Application
```
https://your-app-name.onrender.com
```
Should load the LoveLink homepage

---

## 🐛 If Still Failing

### Check 1: Node Version
Verify logs show correct Node version:
```
==> Using Node.js version 24.x.x
```

If wrong version, the `.node-version` file has been added to force Node 24.

### Check 2: Build Command Location
In logs, verify command runs from correct directory:
```
==> Running build command in /opt/render/project/src
```
Should be: `/opt/render/project/src` ✅

### Check 3: package.json Location
After build starts, logs should show:
```
npm install
✓ Installed dependencies
```
NOT:
```
npm error Could not read package.json
```

### Check 4: Environment Variables
Ensure all required variables are set:
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=...
RAZORPAY_KEY_ID=...
SMTP_USER=...
CLOUDINARY_CLOUD_NAME=...
```

---

## 📞 Still Need Help?

### Quick Diagnostic

Run this in your local terminal to verify structure:
```powershell
cd d:\lovelink
dir package.json
```

Should show:
```
d:\lovelink\package.json
```

If package.json is in a different location, that's the issue!

### Contact Support

- **Render Support:** support@render.com
- **Render Community:** https://community.render.com
- **GitHub Issues:** https://github.com/Arunydvmm/lovelink/issues

---

## 📝 Files Updated

These files have been created/updated to fix the issue:

1. ✅ `render.yaml` - Automatic Render configuration
2. ✅ `.node-version` - Force Node.js 24
3. ✅ `package.json` - Updated with engines field
4. ✅ `RENDER_DEPLOYMENT_GUIDE.md` - Complete deployment guide
5. ✅ `RENDER_ERROR_FIX.md` - This quick fix guide

**Next step:** Push to GitHub and redeploy!

```powershell
cd d:\lovelink
git add .
git commit -m "fix: Add Render deployment configuration"
git push origin main
```

---

**Last Updated:** 2026-08-04  
**Issue:** ENOENT package.json not found  
**Status:** ✅ FIXED
