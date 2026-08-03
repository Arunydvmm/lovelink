# 📧 Email Template Customization Guide

Complete guide to customizing email templates through the LoveLink Admin Panel.

---

## ✨ Feature Overview

The **Email Template Manager** allows you to:
- ✅ Edit email subject lines
- ✅ Customize HTML email templates
- ✅ Use dynamic variables (placeholders)
- ✅ Preview emails before saving
- ✅ Reset to default templates
- ✅ Store custom templates in browser

---

## 🎯 Accessing Email Template Manager

1. **Login to Admin Panel:**
   - Navigate to: `/admin`
   - Enter admin credentials
   - Default username: `admin`
   - Default password: `lovelink123`

2. **Open Email Templates Tab:**
   - Click on **"Email Templates"** tab
   - Located between "Payment & Cloudinary Config" and "Coupons"

---

## 📝 Available Email Templates

### 1. **Purchase Confirmation**
**When sent:** After successful payment and story creation

**Variables available:**
- `{{customerName}}` - Customer's name
- `{{orderId}}` - Order ID
- `{{templateName}}` - Story template name
- `{{amount}}` - Amount paid (in ₹)
- `{{orderDate}}` - Purchase date
- `{{storyLink}}` - Direct link to the story

**Default subject:**
```
🎉 Thank You for Your Purchase - {{customerName}}!
```

---

### 2. **Payment Receipt**
**When sent:** As payment confirmation

**Variables available:**
- `{{customerName}}` - Customer's name
- `{{orderId}}` - Order ID
- `{{templateName}}` - Story template name
- `{{amount}}` - Amount paid (in ₹)
- `{{paymentDate}}` - Payment date
- `{{paymentMethod}}` - Payment method (UPI, Card, etc.)
- `{{transactionId}}` - Transaction ID

**Default subject:**
```
💳 Payment Receipt - Order {{orderId}}
```

---

### 3. **Welcome Email**
**When sent:** When new user creates account

**Variables available:**
- `{{customerName}}` - Customer's name
- `{{loginEmail}}` - User's email address

**Default subject:**
```
👋 Welcome to LoveLink - {{customerName}}!
```

---

### 4. **System Notification**
**When sent:** For general notifications and announcements

**Variables available:**
- `{{customerName}}` - Customer's name
- `{{notificationTitle}}` - Notification title
- `{{notificationMessage}}` - Notification message

**Default subject:**
```
🔔 {{notificationTitle}}
```

---

## 🛠️ How to Edit Templates

### Step 1: Select Template

Click on the template tab you want to edit:
- Purchase Confirmation
- Payment Receipt
- Welcome Email
- System Notification

### Step 2: Edit Subject Line

In the left panel:
1. Find the **"Email Subject"** field
2. Modify the text
3. Use variables like `{{customerName}}` for personalization

**Example:**
```
Before: 🎉 Thank You for Your Purchase - {{customerName}}!
After:  💝 Your LoveLink Story is Ready, {{customerName}}! 🎉
```

### Step 3: Edit HTML Content

Two editing modes available:

#### **Visual Editor Mode**
- Easier for non-developers
- Edit HTML with syntax highlighting
- See structure clearly

#### **HTML Code Mode**
- Full HTML control
- Edit styles directly
- Advanced customization

### Step 4: Use Available Variables

Left panel shows all available variables for the selected template.

**Click any variable to copy it** - then paste into your HTML.

**Usage example:**
```html
<p>Hi {{customerName}},</p>
<p>Your order {{orderId}} has been confirmed!</p>
<p>Amount: ₹{{amount}}</p>
```

### Step 5: Preview Your Changes

Click **"Show Preview"** button to see how the email will look with sample data.

**Preview features:**
- Variables replaced with sample data
- Full rendering of HTML/CSS
- Mobile-responsive view
- See exactly what customers receive

### Step 6: Save Changes

Click **"Save Changes"** button (top-right).

**Status indicators:**
- 🔄 **Saving...** - Changes being saved
- ✅ **Saved!** - Successfully saved
- ❌ **Error** - Save failed (try again)

---

## 🎨 Customization Tips

### Colors & Branding

**Default gradient:**
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

**Change to your brand colors:**
```css
/* Rose/Pink gradient */
background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%);

/* Blue gradient */
background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);

/* Green gradient */
background: linear-gradient(135deg, #10b981 0%, #059669 100%);
```

---

### Logo Customization

**Default emoji logo:**
```html
<div class="logo">💝 LoveLink</div>
```

**Replace with image:**
```html
<div class="logo">
  <img src="https://yourdomain.com/logo.png" alt="LoveLink" style="max-width:150px;">
</div>
```

---

### Button Styles

**Default button:**
```html
<a href="{{storyLink}}" class="button">View Your Story</a>
```

**Customize button color:**
```css
.button {
  background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%);
  color: white;
  padding: 15px 30px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
}
```

---

### Add Your Own Content

**Example: Add social media links**
```html
<div class="footer">
  <p>Follow us:</p>
  <a href="https://facebook.com/yourpage">Facebook</a> |
  <a href="https://instagram.com/yourpage">Instagram</a> |
  <a href="https://twitter.com/yourpage">Twitter</a>
  
  <p>&copy; 2026 LoveLink. All rights reserved.</p>
</div>
```

---

## 📱 Mobile Responsive Design

All default templates are mobile-responsive. **Important CSS:**

```css
@media only screen and (max-width: 600px) {
  .header h1 { font-size: 24px; }
  .button { display: block; margin: 10px 0; }
  .content { padding: 20px 15px; }
}
```

**Test on mobile:**
1. Preview the email
2. Resize your browser window
3. Check text readability
4. Verify buttons are clickable

---

## 🔧 Advanced Customization

### Add Conditional Content

**Example: Show different messages based on amount**
```html
<!-- This requires backend modification -->
{{#if amount > 1000}}
  <p>🎁 Thank you for your premium purchase!</p>
{{else}}
  <p>Thank you for your purchase!</p>
{{/if}}
```

### Add Images

**Inline images:**
```html
<img src="https://yourdomain.com/banner.png" 
     alt="Banner" 
     style="max-width:100%; height:auto;">
```

**From Cloudinary:**
```html
<img src="https://res.cloudinary.com/your-cloud/image/upload/v123/banner.png"
     alt="Banner"
     style="max-width:100%; height:auto;">
```

### Custom Fonts

**Google Fonts:**
```html
<head>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Poppins', sans-serif; }
  </style>
</head>
```

---

## 🔄 Reset to Default

If you want to restore the original template:

1. Click **"Reset to Default"** button (top-right)
2. Confirm the action
3. Template will be restored to original version

**⚠️ Warning:** This cannot be undone. All custom changes will be lost.

---

## 💾 How Templates Are Stored

**Storage location:** Browser's `localStorage`

**Key:** `lovelink_email_templates`

**Implications:**
- ✅ Changes persist across sessions
- ✅ No database needed
- ⚠️ Stored per browser (not synced across devices)
- ⚠️ Clearing browser data deletes custom templates

**Production deployment:**
For production, consider implementing:
- Database storage for templates
- Version control for template changes
- Multi-admin synchronization
- Backup/restore functionality

---

## 🐛 Troubleshooting

### Changes Not Saving

**Solution:**
1. Check browser's localStorage is enabled
2. Try clearing cache: `Ctrl+Shift+Delete`
3. Disable browser extensions that block localStorage
4. Check browser console for errors: `F12`

### Preview Not Showing

**Solution:**
1. Check HTML syntax is valid
2. Close all HTML tags properly
3. Check CSS syntax
4. Verify no JavaScript errors in console

### Variables Not Working

**Solution:**
1. Ensure correct syntax: `{{variableName}}`
2. Use exact variable names from the list
3. No spaces: `{{customerName}}` ✅ not `{{ customerName }}` ❌
4. Case-sensitive: `{{customername}}` won't work

### Email Not Sent

**Issue:** Template customization doesn't affect sending

**Solutions:**
1. Check SMTP configuration in environment variables
2. Verify DNSExit credentials
3. Check email logs in admin panel
4. Review server logs for errors

---

## 🎓 Best Practices

### 1. **Keep It Simple**
- Use clear, concise language
- Don't overload with information
- Focus on the main message

### 2. **Brand Consistency**
- Use your brand colors
- Include your logo
- Maintain consistent tone

### 3. **Test Before Deploy**
- Always preview changes
- Send test emails
- Check on multiple devices
- Test all variables work

### 4. **Accessibility**
- Use sufficient color contrast
- Include alt text for images
- Use semantic HTML
- Ensure readable font sizes

### 5. **Legal Compliance**
- Include company address
- Add unsubscribe link (for marketing emails)
- Follow CAN-SPAM Act requirements
- GDPR compliance for EU customers

---

## 📊 Email Template Variables Reference

### Common Variables (All Templates)

| Variable | Description | Example |
|----------|-------------|---------|
| `{{customerName}}` | Customer's full name | John Doe |
| `{{APP_URL}}` | Application URL | https://lovelink.app |

### Purchase Confirmation Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{orderId}}` | Order ID | ORD-123456 |
| `{{templateName}}` | Story template name | Romantic Story |
| `{{amount}}` | Amount (formatted) | 499.00 |
| `{{orderDate}}` | Purchase date | January 15, 2026 |
| `{{storyLink}}` | Direct story URL | https://lovelink.app/story/abc123 |

### Payment Receipt Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{orderId}}` | Order ID | ORD-123456 |
| `{{transactionId}}` | Payment transaction ID | TXN-789012 |
| `{{amount}}` | Amount (formatted) | 499.00 |
| `{{paymentMethod}}` | Payment method | UPI / Card |
| `{{paymentDate}}` | Payment date | January 15, 2026 |

### Welcome Email Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{loginEmail}}` | User's email | john@example.com |

### System Notification Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{notificationTitle}}` | Notification title | Important Update |
| `{{notificationMessage}}` | Notification content | Your story has been viewed 100 times! |

---

## 🚀 Future Enhancements

Planned features:
- [ ] Database storage for templates
- [ ] A/B testing for email templates
- [ ] Email analytics (open rates, click rates)
- [ ] Template versioning and rollback
- [ ] Rich text editor (WYSIWYG)
- [ ] Template library/marketplace
- [ ] Multi-language support
- [ ] Drag-and-drop email builder

---

## 📚 Resources

### Email Design Tools
- [Really Good Emails](https://reallygoodemails.com/) - Email design inspiration
- [Litmus](https://litmus.com/) - Email testing platform
- [Can I Email](https://www.caniemail.com/) - Email client compatibility

### HTML Email Best Practices
- [Email on Acid Guide](https://www.emailonacid.com/blog/)
- [Campaign Monitor CSS Support](https://www.campaignmonitor.com/css/)
- [Mailchimp Email Design Guide](https://mailchimp.com/resources/email-design-guide/)

### Email Deliverability
- [Mail Tester](https://www.mail-tester.com/) - Test email spam score
- [MX Toolbox](https://mxtoolbox.com/) - Email server diagnostics

---

## 💡 Example Customizations

### Example 1: Minimalist Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, sans-serif; padding: 40px; background: #f9fafb; }
    .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; }
    h1 { font-size: 24px; font-weight: 600; margin: 0 0 20px 0; }
    .button { display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Order Confirmed</h1>
    <p>Hi {{customerName}},</p>
    <p>Your order ({{orderId}}) is confirmed.</p>
    <a href="{{storyLink}}" class="button">View Story</a>
  </div>
</body>
</html>
```

### Example 2: Colorful Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Comic Sans MS', cursive; background: linear-gradient(45deg, #ff6b6b, #4ecdc4); padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    .header { background: linear-gradient(135deg, #667eea, #764ba2); padding: 60px 20px; text-align: center; color: white; }
    .emoji { font-size: 80px; }
    .content { padding: 40px; }
    .button { background: linear-gradient(135deg, #f093fb, #f5576c); color: white; padding: 20px 40px; border-radius: 50px; text-decoration: none; display: inline-block; font-weight: bold; box-shadow: 0 10px 30px rgba(245, 87, 108, 0.4); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">🎉</div>
      <h1>Woohoo! Order Complete!</h1>
    </div>
    <div class="content">
      <h2>Hey {{customerName}}! 👋</h2>
      <p>Your <strong>{{templateName}}</strong> is ready to rock! 🎸</p>
      <p><a href="{{storyLink}}" class="button">Check It Out!</a></p>
    </div>
  </div>
</body>
</html>
```

---

**Guide Version:** 1.0.0  
**Last Updated:** 2026-08-04  
**Author:** LoveLink Team
