# LoveLink Production Deployment Guide

## Pre-Deployment Checklist ✓

### 1. Environment Setup
- [ ] PostgreSQL database provisioned (AWS RDS, DigitalOcean, etc.)
- [ ] Backup strategy configured
- [ ] Environment variables created (.env.production)
- [ ] Secrets stored in secure vault (not in git)
- [ ] SSL/TLS certificates obtained (Let's Encrypt)

### 2. Third-Party Services
- [ ] Razorpay production account configured
- [ ] SMTP email service configured (SendGrid, AWS SES)
- [ ] Cloudinary account created
- [ ] Domain DNS configured
- [ ] CDN configured for static assets (optional but recommended)

### 3. Security Hardening
- [ ] Database password secured (strong, random)
- [ ] JWT secrets rotated and strong (min 64 chars)
- [ ] CORS origins whitelisted
- [ ] HTTPS enforced
- [ ] Security headers verified (Helmet enabled)
- [ ] Rate limiting configured appropriately
- [ ] Admin authentication tested

### 4. Monitoring & Logging
- [ ] Application logging configured
- [ ] Error tracking setup (Sentry recommended)
- [ ] Health check endpoint verified
- [ ] Uptime monitoring configured
- [ ] Alerts configured for critical errors

### 5. Backup & Recovery
- [ ] Database backups automated (daily)
- [ ] Backup retention policy set (30 days minimum)
- [ ] Disaster recovery plan documented
- [ ] Recovery procedure tested

## Deployment Steps

### Option 1: Docker Deployment (Recommended)

```bash
# 1. Build Docker image
docker build -t lovelink:latest .

# 2. Push to registry (e.g., Docker Hub, GitHub Container Registry)
docker tag lovelink:latest myregistry/lovelink:latest
docker push myregistry/lovelink:latest

# 3. Deploy using docker-compose
docker-compose -f docker-compose.yml up -d

# 4. Run database migrations
docker exec lovelink-app npx prisma migrate deploy

# 5. Seed initial data (optional)
docker exec lovelink-app npm run db:seed

# 6. Verify deployment
curl https://lovelink.app/api/health
```

### Option 2: Cloud Platforms

#### Vercel/Netlify (Frontend + Serverless Backend)
```bash
# 1. Install CLI
npm install -g vercel

# 2. Connect repository
vercel link

# 3. Set environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
# ... add remaining env vars

# 4. Deploy
vercel deploy --prod
```

#### Railway/Render (Full Stack)
```bash
# 1. Connect repository via web dashboard
# 2. Set environment variables
# 3. Configure PostgreSQL add-on
# 4. Deploy automatically on push
```

#### AWS (ECS/Fargate)
```bash
# 1. Push Docker image to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag lovelink:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/lovelink:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/lovelink:latest

# 2. Deploy to ECS cluster
# Use AWS console or terraform
```

## Post-Deployment Verification

```bash
# 1. Check health endpoint
curl https://lovelink.app/api/health

# 2. Check database connectivity
curl -H "Authorization: Bearer <token>" https://lovelink.app/api/auth/me

# 3. Verify payment integration
# Test payment webhook endpoint

# 4. Check email service
# Monitor email logs for verification emails

# 5. Verify SSL/TLS
openssl s_client -connect lovelink.app:443

# 6. Run security scan
npm audit

# 7. Performance test
# Use tools like: Apache Bench, wrk, or k6
```

## Monitoring & Maintenance

### Application Metrics to Monitor
- Response time (target: < 500ms)
- Error rate (target: < 0.1%)
- CPU usage (target: < 70%)
- Memory usage (target: < 80%)
- Database connection pool
- API rate limit usage

### Daily Checks
- [ ] Application logs for errors
- [ ] Error tracking dashboard (Sentry)
- [ ] Database backup completion
- [ ] Uptime monitoring alerts

### Weekly Checks
- [ ] Performance metrics
- [ ] Security audit logs
- [ ] Failed payment notifications
- [ ] Email delivery rate
- [ ] Database size

### Monthly Checks
- [ ] Full security audit
- [ ] Dependency updates
- [ ] Performance optimization review
- [ ] Capacity planning

## Scaling Strategy

### Vertical Scaling (Increase machine size)
- When: CPU/Memory consistently > 70%
- How: Upgrade server plan in hosting provider

### Horizontal Scaling (Add more machines)
- When: Load increases significantly
- How: 
  1. Setup load balancer
  2. Deploy multiple instances
  3. Share database connection pool
  4. Use Redis for session management

### Database Scaling
- When: Query performance degrades
- How:
  1. Add database indexes
  2. Implement caching (Redis)
  3. Database read replicas
  4. Archive old data

## Rollback Procedure

```bash
# If deployment issues occur:

# 1. Identify issue
docker logs lovelink-app

# 2. Rollback to previous version
docker pull myregistry/lovelink:v1.0.0
docker-compose down
docker-compose up -d

# 3. Run migrations if needed
docker exec lovelink-app npx prisma migrate deploy

# 4. Verify
curl https://lovelink.app/api/health

# 5. Post-mortem
# Document what went wrong and fix
```

## Production Environment Variables

```bash
# Required
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/lovelink
JWT_SECRET=<64+ random characters>
JWT_REFRESH_SECRET=<64+ random characters>

# Razorpay
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=<secret>
RAZORPAY_WEBHOOK_SECRET=<secret>

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<sendgrid-api-key>
SMTP_FROM=noreply@lovelink.app

# Frontend URLs
VITE_API_URL=https://api.lovelink.app
VITE_APP_URL=https://lovelink.app

# Cloudinary
CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>

# Monitoring
SENTRY_DSN=https://...
```

## Support & Troubleshooting

### Common Issues

**Database Connection Failed**
- Check DATABASE_URL format
- Verify database is running and accessible
- Check firewall rules
- Verify database credentials

**Payment Webhook Not Working**
- Verify webhook URL in Razorpay dashboard
- Check webhook secret matches
- Monitor webhook logs
- Test with Razorpay sandbox first

**Email Not Sending**
- Check SMTP credentials
- Verify sender email is whitelisted
- Check spam folder
- Review email service logs

**High Memory Usage**
- Check for memory leaks in logs
- Restart application
- Investigate specific API endpoints
- Upgrade database connection pool size

## Security Best Practices in Production

1. **Never commit secrets** - Use environment variables
2. **Enable HTTPS** - Force redirect HTTP → HTTPS
3. **Regular backups** - Automate and test restoration
4. **Keep dependencies updated** - Weekly security audits
5. **Monitor logs** - Watch for suspicious patterns
6. **Rate limiting** - Prevent DDoS and brute force
7. **Database encryption** - Enable at-rest encryption
8. **CORS properly configured** - Whitelist origins only
9. **Admin access limited** - Use strong passwords + 2FA
10. **Audit logging** - Track all admin actions

## Performance Optimization

1. **Enable caching**
   - Redis for sessions
   - CDN for static assets
   - Database query caching

2. **Database optimization**
   - Ensure all indexes are present
   - Monitor slow queries
   - Archive old data

3. **Frontend optimization**
   - Code splitting enabled (Vite)
   - Images optimized (Cloudinary)
   - Gzip compression enabled

4. **API optimization**
   - Response compression
   - Pagination on large lists
   - Async operations for long tasks

## Support Contacts

- Technical Support: support@lovelink.app
- Security Issues: security@lovelink.app
- Billing: billing@lovelink.app
