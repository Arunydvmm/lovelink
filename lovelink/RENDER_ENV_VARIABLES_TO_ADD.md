# 📋 Environment Variables for Render Dashboard

**Copy and paste each variable below into your Render dashboard.**

## Steps to Add Variables to Render

1. Go to: https://dashboard.render.com
2. Select service: **lovelink**
3. Click tab: **Environment** 
4. For each variable below:
   - Click "+ Add Environment Variable"
   - Paste the **Key** name
   - Paste the **Value**
   - Click Save

---

## 🔴 CRITICAL VARIABLES (Must be set)

### DATABASE_URL
```
[Your Neon PostgreSQL connection string]
```

### JWT_SECRET
```
[Your generated JWT secret from .env file]
```

### JWT_REFRESH_SECRET
```
[Your generated JWT refresh secret from .env file]
```

### NODE_ENV
```
production
```

---

## 🟡 IMPORTANT VARIABLES (Website/CORS)

### ALLOWED_ORIGINS
```
https://lovelinkkk.onrender.com,https://www.lovelinkkk.onrender.com
```

### VITE_API_URL
```
https://lovelinkkk.onrender.com
```

### VITE_APP_URL
```
https://lovelinkkk.onrender.com
```

### FRONTEND_URL
```
https://lovelinkkk.onrender.com
```

---

## 🟡 IMPORTANT VARIABLES (Admin)

### ADMIN_USERNAME
```
Admin
```

### ADMIN_PASSWORD
```
[Your secure admin password]
```

### ADMIN_PASSCODE
```
[Your secure admin passcode]
```

### SESSION_SECRET
```
[Your generated session secret from .env file]
```

---

## 🟢 OPTIONAL VARIABLES (Payment)

### RAZORPAY_KEY_ID
```
[Leave empty if not configured]
```

### RAZORPAY_KEY_SECRET
```
[Leave empty if not configured]
```

### RAZORPAY_WEBHOOK_SECRET
```
[Leave empty if not configured]
```

---

## 🟢 OPTIONAL VARIABLES (Google OAuth)

### GOOGLE_CLIENT_ID
```
[Your Google OAuth Client ID from Google Console]
```

### GOOGLE_CLIENT_SECRET
```
[Your Google OAuth Client Secret from Google Console]
```

---

## 🟢 OPTIONAL VARIABLES (Email - SMTP)

### SMTP_HOST
```
relay.dnsexit.com
```

### SMTP_PORT
```
587
```

### SMTP_SECURE
```
false
```

### SMTP_USER
```
[Your DNSExit SMTP username]
```

### SMTP_PASSWORD
```
[Your DNSExit SMTP password]
```

### EMAIL_FROM
```
[Your email sender address]
```

---

## 🟢 OPTIONAL VARIABLES (Cloudinary - Image Upload)

### CLOUDINARY_CLOUD_NAME
```
[Your Cloudinary Cloud Name]
```

### CLOUDINARY_API_KEY
```
[Your Cloudinary API Key]
```

### CLOUDINARY_API_SECRET
```
[Your Cloudinary API Secret]
```

---

## ✅ Quick Checklist

Add these variables in order:

- [ ] DATABASE_URL
- [ ] JWT_SECRET
- [ ] JWT_REFRESH_SECRET
- [ ] NODE_ENV = production
- [ ] ALLOWED_ORIGINS
- [ ] VITE_API_URL
- [ ] VITE_APP_URL
- [ ] FRONTEND_URL
- [ ] ADMIN_USERNAME
- [ ] ADMIN_PASSWORD
- [ ] ADMIN_PASSCODE
- [ ] SESSION_SECRET
- [ ] GOOGLE_CLIENT_ID
- [ ] GOOGLE_CLIENT_SECRET
- [ ] SMTP_HOST
- [ ] SMTP_PORT
- [ ] SMTP_SECURE
- [ ] SMTP_USER
- [ ] SMTP_PASSWORD
- [ ] EMAIL_FROM
- [ ] CLOUDINARY_CLOUD_NAME
- [ ] CLOUDINARY_API_KEY
- [ ] CLOUDINARY_API_SECRET

---

## 🚀 After Adding Variables

1. **Click "Save Changes"** in Render dashboard
2. **Go back to service page**
3. **Click ⋯ menu (top right)**
4. **Select "Manual Deploy"**
5. **Choose "Deploy latest commit"**
6. **Wait 5-10 minutes for build**

---

## ✅ After Deployment

Test the app:
1. Open: https://lovelinkkk.onrender.com
2. Should see homepage (NOT blank page)
3. Try logging in with:
   - Username: `Admin`
   - Password: `Yadav@123`
4. Admin panel should load
5. Check browser console (F12) - no red errors

---

## ⚠️ Important Notes

- **DATABASE_URL is critical** - Without it, app won't start
- **JWT_SECRET & JWT_REFRESH_SECRET are required** - For authentication
- **ALLOWED_ORIGINS must include your domain** - For CORS to work
- **ADMIN credentials are for admin panel** - Change these later for security
- **SMTP credentials are optional** - App works without email
- **Google OAuth is optional** - Social login can be disabled
- **Cloudinary is optional** - Image upload can be disabled

---

## 🔒 Security Notes

⚠️ These credentials are now in Render dashboard (secure).

**Later, consider:**
1. Rotating JWT secrets periodically
2. Using stronger admin password
3. Moving credentials to secret manager (AWS Secrets, Vault, etc.)
4. Enabling two-factor authentication
5. Setting up audit logging

