# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

1. **Do NOT create a public GitHub issue** for security vulnerabilities.

2. **Email the maintainers** directly with:

   -  A description of the vulnerability
   -  Steps to reproduce
   -  Potential impact
   -  Any suggested fixes (optional)

3. **Allow time for response** - We aim to respond within 48 hours.

### What to Expect

1. **Acknowledgment** - We'll confirm receipt of your report.
2. **Assessment** - We'll investigate and assess the severity.
3. **Fix** - We'll work on a fix for confirmed vulnerabilities.
4. **Disclosure** - Once fixed, we'll coordinate disclosure timing with you.

## Security Best Practices for Deployment

### Production Configuration

Before deploying to production, ensure you:

1. **Enable Admin Authentication**

   -  Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables
   -  Sessions expire after 24 hours

2. **Enable API Authentication** (optional)

   -  Set `API_AUTH_REQUIRED=true` for v1 endpoints
   -  Create API keys via the admin panel

3. **Configure CORS**

   -  Set `CORS_ALLOWED_ORIGINS` to your domains only
   -  Don't use `*` for allowed origins in production

4. **Configure Rate Limiting**

   -  `RATE_LIMIT_PER_MINUTE` defaults to 100
   -  `RATE_LIMIT_WRITE_PER_MINUTE` defaults to 30

5. **Use HTTPS**

   -  Always deploy behind HTTPS
   -  Enable HSTS headers

6. **Secure Database**
   -  Use strong passwords
   -  Enable SSL connections
   -  Restrict network access

### Environment Variables

-  **Never commit `.env` files** to version control
-  **Rotate secrets** regularly
-  **Use different credentials** for development and production

### Recommended Headers

Add these security headers to your deployment:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'
```

### Database Security

-  Enable row-level security if using Supabase
-  Use connection pooling for production
-  Regular backups with encryption

## Known Security Considerations

### Session Storage

Admin sessions are stored in memory and expire after 24 hours. This means sessions are lost on server restart.

**Mitigation:**

-  Consider implementing persistent session storage for high-availability deployments
-  Use database or Redis-based session storage

### No Audit Trail

Changes to data are not logged. There's no way to track who changed what.

**Mitigation:**

-  Implement audit logging before production use
-  Use database triggers for critical tables

## Dependency Security

We regularly update dependencies to address known vulnerabilities:

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update
```

## Contact

For security concerns, contact the project maintainers through the appropriate channels listed in the repository.
