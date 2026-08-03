# DNSExit SMTP Integration Guide

**Provider:** DNSExit Mail Relay  
**Status:** ✅ PRODUCTION READY  
**Failover:** Automatic backup server  

---

## 🎯 Overview

LoveLink uses DNSExit SMTP Mail Relay for all email communications. The system features:

- ✅ Primary & backup SMTP servers (automatic failover)
- ✅ STARTTLS encryption
- ✅ Complete email logging
- ✅ Async sending (non-blocking)
- ✅ Provider-agnostic architecture
- ✅ Email failure never fails payment

---

## 📧 SMTP Configuration

### DNSExit Servers:
| Type | Host | Port | Security |
|------|------|------|----------|
| **Primary** | relay.dnsexit.com | 587 | STARTTLS |
| **Backup** | relaybackup.dnsexit.com | 587 | STARTTLS |

### Supported Ports:
- **587** (Preferred - STARTTLS)
- 2525, 26, 80, 940, 8001, 25

---

## 🔐 Environment Variables

Add to your `.env` file:

```env
# ============================================
# EMAIL SERVICE (DNSExit SMTP Mail Relay)
# ============================================
SMTP_HOST=relay.dnsexit.com
SMTP_BACKUP_HOST=relaybackup.dnsexit.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-dnsexit-username
SMTP_PASSWORD=your-dnsexit-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=LoveLink
```

**Important:**
- `SMTP_SECURE=false` for STARTTLS (port 587)
- `SMTP_SECURE=true` for SSL (port 465)
- Never commit `.env` to git

---

## 🏗️ Architecture

### Email Flow:
```
Controller
    ↓
EmailService (central service)
    ↓
EmailProvider (abstract interface)
    ↓
DNSExitProvider (implementation)
    ↓
Nodemailer → DNSExit SMTP
```

### Files:
- `src/lib/email/EmailProvider.ts` - Abstract interface
- `src/lib/email/DNSExitProvider.ts` - DNSExit implementation
- `src/lib/email/EmailService.ts` - Central email service

### Design Pattern:
- **Strategy Pattern** for provider switching
- **Singleton Pattern** for EmailService
- **Factory Pattern** for email templates

---

## 💡 Usage

### Send Email from Controller:

```typescript
import { emailService } from '../lib/email/EmailService';

// Async send (non-blocking - recommended)
await emailService.sendAsync(
  {
    to: 'customer@example.com',
    subject: 'Your Order Confirmation',
    html: '<h1>Thank you!</h1>',
  },
  {
    userId: 'user_id',
    orderId: 'order_id',
    recipientEmail: 'customer@example.com',
    subject: 'Your Order Confirmation',
    emailType: 'PURCHASE_CONFIRMATION',
  }
);

// Sync send (wait for result)
const result = await emailService.send(
  {
    to: 'customer@example.com',
    subject: 'Your Order Confirmation',
    html: '<h1>Thank you!</h1>',
  },
  {
    userId: 'user_id',
    recipientEmail: 'customer@example.com',
    subject: 'Your Order Confirmation',
    emailType: 'PURCHASE_CONFIRMATION',
  }
);

if (result.success) {
  console.log('Email sent:', result.emailLogId);
} else {
  console.error('Email failed:', result.error);
}
```

### Use Email Templates:

```typescript
const templates = emailService.getTemplates();

// Purchase confirmation
const html = templates.purchaseConfirmation({
  customerName: 'John Doe',
  orderId: 'ORD123',
  templateName: 'Love Story',
  amount: 50000, // in paise
  orderDate: new Date(),
  storyLink: 'https://lovelink.app/story/xyz',
});

// Payment receipt
const receipt = templates.paymentReceipt({
  customerName: 'John Doe',
  orderId: 'ORD123',
  templateName: 'Love Story',
  amount: 50000,
  transactionId: 'pay_ABC123',
  paymentDate: new Date(),
});

// Welcome email
const welcome = templates.welcome({
  userName: 'John Doe',
});

// System notification
const notification = templates.systemNotification({
  recipientName: 'John Doe',
  subject: 'Important Update',
  message: 'Your account has been verified.',
});
```

---

## 🔄 Automatic Failover

The system automatically tries backup server if primary fails:

```
1. Try relay.dnsexit.com
     ↓ (if fails)
2. Try relaybackup.dnsexit.com
     ↓ (if fails)
3. Log error & continue
```

**Important:** Email failure NEVER fails payment processing.

---

## 📊 Email Logging

Every email is logged to database:

### EmailLog Table:
```prisma
model EmailLog {
  id                String
  userId            String?
  orderId           String?
  storyId           String?
  templateId        String?
  recipientEmail    String
  senderEmail       String
  subject           String
  emailType         EmailType
  status            EmailStatus
  provider          String  // "DNSExit"
  providerMessageId String?
  smtpHost          String? // "relay.dnsexit.com"
  smtpPort          Int?    // 587
  errorMessage      String?
  retryCount        Int
  sentAt            DateTime?
  failedAt          DateTime?
  createdAt         DateTime
  updatedAt         DateTime
}
```

### Email Types:
- `PURCHASE_CONFIRMATION`
- `PAYMENT_RECEIPT`
- `SYSTEM_NOTIFICATION`
- `CUSTOM`

### Email Status:
- `PENDING` - Being sent
- `SENT` - Successfully sent
- `FAILED` - Send failed
- `RETRY_SCHEDULED` - Queued for retry

---

## 🛡️ Security Features

### 1. **Header Injection Prevention**
- Email addresses validated with regex
- Subjects sanitized (remove \r\n)
- Maximum subject length: 998 chars

### 2. **STARTTLS Encryption**
- All emails encrypted in transit
- `requireTLS: true` enforced

### 3. **Credential Protection**
- Never hardcoded
- Only in environment variables
- Not exposed in API responses

### 4. **Email Validation**
- Format validation: `name@domain.com`
- Whitespace trimming
- Injection attempt detection

---

## 🧪 Testing

### 1. **SMTP Connection Test**

```bash
# Start server - watch for:
📧 DNSExit SMTP connection verified
```

### 2. **Send Test Email**

```typescript
// In your test file
import { emailService } from '../lib/email/EmailService';

const result = await emailService.send(
  {
    to: 'your-email@example.com',
    subject: 'Test Email from LoveLink',
    html: '<h1>This is a test</h1><p>If you see this, SMTP works!</p>',
  },
  {
    recipientEmail: 'your-email@example.com',
    subject: 'Test Email',
    emailType: 'CUSTOM',
  }
);

console.log('Test result:', result);
```

### 3. **Test Purchase Flow**

Complete a test purchase and verify:
- ✅ Purchase confirmation email received
- ✅ Payment receipt email received
- ✅ Email logs created in database
- ✅ Payment succeeds even if email fails

### 4. **Test Backup Server**

Temporarily set wrong primary host:
```env
SMTP_HOST=invalid.dnsexit.com
```

Start server - should see:
```
⚠️ Primary SMTP failed, trying backup server...
✅ Email sent via relaybackup.dnsexit.com
```

---

## 🔧 DNS Configuration

### SPF Record:
Add to your DNS:
```
TXT @ "v=spf1 include:dnsexit.com ~all"
```

### DKIM Record:
Add to your DNS:
```
TXT relay._domainkey "v=DKIM1; k=rsa; p=..."
```

Get DKIM public key from DNSExit dashboard.

### DMARC Record (Optional):
```
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com"
```

---

## 📈 Monitoring

### Check Email Logs:

```typescript
// Admin endpoint
GET /api/email-logs?status=FAILED

// Response:
{
  "emailLogs": [
    {
      "id": "log_123",
      "recipientEmail": "customer@example.com",
      "subject": "Purchase Confirmation",
      "status": "FAILED",
      "errorMessage": "Connection timeout",
      "smtpHost": "relay.dnsexit.com",
      "smtpPort": 587,
      "retryCount": 2,
      "failedAt": "2026-08-04T..."
    }
  ]
}
```

### Retry Failed Emails:

```typescript
POST /api/email-logs/:id/retry
```

### Email Statistics:

```typescript
GET /api/email-logs/stats

// Response:
{
  "stats": {
    "totalEmails": 1000,
    "sentEmails": 950,
    "failedEmails": 50,
    "pendingEmails": 0,
    "successRate": "95.00%"
  }
}
```

---

## 🐛 Troubleshooting

### Issue: "SMTP connection failed"

**Solutions:**
1. Check SMTP credentials in `.env`
2. Verify SMTP_USER and SMTP_PASSWORD
3. Check firewall allows port 587 outbound
4. Test with backup server

### Issue: "Email not received"

**Solutions:**
1. Check spam folder
2. Verify SPF/DKIM records
3. Check email logs in database
4. Verify sender domain not blacklisted

### Issue: "Authentication failed"

**Solutions:**
1. Verify SMTP_USER format (username or email)
2. Check SMTP_PASSWORD is correct
3. Ensure DNSExit account is active
4. Check account hasn't exceeded send limit

### Issue: "Connection timeout"

**Solutions:**
1. Check internet connectivity
2. Verify port 587 is accessible
3. Try backup server
4. Check DNSExit service status

---

## 🔄 Switching Email Providers

The architecture supports easy provider switching:

### 1. Create new provider:

```typescript
// src/lib/email/MailgunProvider.ts
export class MailgunProvider extends EmailProvider {
  name = 'Mailgun';

  async send(options: EmailOptions): Promise<EmailResult> {
    // Mailgun implementation
  }

  async verify(): Promise<boolean> {
    // Mailgun verification
  }
}
```

### 2. Update EmailService:

```typescript
// src/lib/email/EmailService.ts
constructor() {
  // Switch provider here
  this.provider = new MailgunProvider();
  // OR
  this.provider = new DNSExitProvider();
}
```

### 3. No controller changes needed!

All controllers use `EmailService.send()` - provider is abstracted away.

---

## ✅ Production Checklist

Before going live:

- [ ] SPF record configured
- [ ] DKIM record configured
- [ ] SMTP credentials in production `.env`
- [ ] Test email sent successfully
- [ ] Purchase email tested
- [ ] Email logs working
- [ ] Backup server tested
- [ ] Monitoring setup
- [ ] Support email configured

---

## 📞 Support

### DNSExit Support:
- Website: https://www.dnsexit.com
- Email: support@dnsexit.com

### LoveLink Email Issues:
- Check email logs: `/api/email-logs`
- Review error messages
- Test SMTP connection
- Contact DNSExit if SMTP issue

---

## 🎯 Best Practices

1. **Always use EmailService** - Never call Nodemailer directly
2. **Use async sends** - Don't block payment processing
3. **Log all emails** - Track delivery status
4. **Monitor failures** - Check email logs regularly
5. **Test backups** - Verify failover works
6. **Update DNS** - Keep SPF/DKIM current
7. **Rotate credentials** - Change passwords periodically

---

**Email System Status:** ✅ PRODUCTION READY  
**Provider:** DNSExit SMTP Mail Relay  
**Failover:** Automatic  
**Logging:** Complete  

**Last Updated:** August 2026  
**Platform:** LoveLink v2.0
