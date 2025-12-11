# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

1. **Do NOT create a public GitHub issue** for security vulnerabilities.

2. **Email the maintainers** directly with:
   - A description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (optional)

3. **Allow time for response** - We aim to respond within 48 hours.

### What to Expect

1. **Acknowledgment** - We'll confirm receipt of your report.
2. **Assessment** - We'll investigate and assess the severity.
3. **Fix** - We'll work on a fix for confirmed vulnerabilities.
4. **Disclosure** - Once fixed, we'll coordinate disclosure timing with you.

## Security Best Practices for Deployment

### Current Limitations

**Important:** The current version (0.x) does not include authentication. Before deploying to production, you should:

1. **Add API Authentication**
   - Implement API key authentication for v1 endpoints
   - Use rate limiting to prevent abuse

2. **Configure CORS**
   - Restrict allowed origins to your domains only
   - Don't use `*` for allowed origins in production

3. **Use HTTPS**
   - Always deploy behind HTTPS
   - Enable HSTS headers

4. **Secure Database**
   - Use strong passwords
   - Enable SSL connections
   - Restrict network access

### Environment Variables

- **Never commit `.env` files** to version control
- **Rotate secrets** regularly
- **Use different credentials** for development and production

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

- Enable row-level security if using Supabase
- Use connection pooling for production
- Regular backups with encryption

## Known Security Considerations

### No Authentication (v0.x)

The current version does not include authentication. All API endpoints are publicly accessible. This is by design for the MVP, but should be addressed before production deployment.

**Mitigation:**
- Deploy behind a reverse proxy with authentication
- Use network-level restrictions (VPN, IP allowlisting)
- Implement custom authentication middleware

### No Rate Limiting

API endpoints do not have rate limiting. High request volumes could impact performance.

**Mitigation:**
- Use a reverse proxy with rate limiting (nginx, Cloudflare)
- Implement Redis-based rate limiting middleware

### No Audit Trail

Changes to data are not logged. There's no way to track who changed what.

**Mitigation:**
- Implement audit logging before production use
- Use database triggers for critical tables

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
