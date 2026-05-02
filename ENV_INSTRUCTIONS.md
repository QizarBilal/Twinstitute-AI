# .env Configuration Guide

This document provides detailed instructions for setting up all environment variables needed for Twinstitute AI to run properly.

---

## Table of Contents

1. [Database Configuration](#database-configuration)
2. [NextAuth Configuration](#nextauth-configuration)
3. [Google OAuth Setup](#google-oauth-setup)
4. [GitHub OAuth Setup](#github-oauth-setup)
5. [LinkedIn OAuth Setup](#linkedin-oauth-setup)
6. [Email Configuration (SMTP)](#email-configuration-smtp)
7. [AI Integration (Groq)](#ai-integration-groq)
8. [reCAPTCHA Setup](#recaptcha-setup)
9. [Best Working Configuration](#best-working-configuration)

---

## Database Configuration

### `DATABASE_URL`

**Purpose**: MongoDB connection string for Prisma ORM

**Where to Get It**:

1. **Option A: MongoDB Atlas (Cloud) - Recommended**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` and `<username>`

2. **Option B: Local MongoDB**
   - Install MongoDB locally
   - Use connection string: `mongodb://localhost:27017/twinstitute`

**Example (Atlas)**:
```
DATABASE_URL="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/twinstitute?retryWrites=true&w=majority&appName=TechPortfolioHub"
```

**Example (Local)**:
```
DATABASE_URL="mongodb://localhost:27017/twinstitute"
```

**Important Notes**:
- Replace `username` and `password` with your credentials
- Use URL encoding for special characters in password (e.g., `@` → `%40`)
- Create a dedicated database user (not admin) for security

---

## NextAuth Configuration

### `NEXTAUTH_URL`

**Purpose**: The URL where your app is accessible (used for OAuth callbacks)

**Local Development**:
```
NEXTAUTH_URL="http://localhost:3000"
```

**Production**:
```
NEXTAUTH_URL="https://yourdomain.com"
```

---

### `EXTERNAL_URL`

**Purpose**: External URL for email links and redirects

**Development**:
```
EXTERNAL_URL="http://localhost:3000"
```

**Production**:
```
EXTERNAL_URL="https://yourdomain.com"
```

---

### `NEXTAUTH_SECRET`

**Purpose**: Encryption key for NextAuth sessions and JWT tokens

**How to Generate**:

**Option 1: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2: Using OpenSSL**
```bash
openssl rand -hex 32
```

**Example**:
```
NEXTAUTH_SECRET="75f8a9d3e2c1b4567890abcdef123456789abcdef0123456789abcdef012345"
```

**Important Notes**:
- Must be at least 32 characters long
- Generate a new one for each environment
- Never share or commit to version control
- Keep the same value in production (don't regenerate)

---

### `NEXT_PUBLIC_APP_URL`

**Purpose**: Public URL for API calls from frontend

**Development**:
```
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Production**:
```
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

**Note**: Public variables are visible in the browser, so don't include secrets here

---

## Google OAuth Setup

### Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Select "Web Application"
6. Add authorized redirect URIs:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. Copy Client ID and Client Secret

### `GOOGLE_CLIENT_ID`

**Example**:
```
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com"
```

### `GOOGLE_CLIENT_SECRET`

**Example**:
```
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET_HERE"
```

**Important Notes**:
- Keep Secret private (never commit to git)
- Regenerate if accidentally exposed
- Use different credentials for dev/prod

---

## GitHub OAuth Setup

### Getting GitHub OAuth Credentials

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in application details:
   - **Application name**: Twinstitute AI
   - **Homepage URL**: `http://localhost:3000` (dev)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and generate Client Secret

### `GITHUB_OAUTH_ID`

**Example**:
```
GITHUB_OAUTH_ID="YOUR_GITHUB_OAUTH_ID_HERE"
```

### `GITHUB_OAUTH_SECRET`

**Example**:
```
GITHUB_OAUTH_SECRET="YOUR_GITHUB_OAUTH_SECRET_HERE"
```

---

## LinkedIn OAuth Setup

### Getting LinkedIn OAuth Credentials

1. Go to [LinkedIn Developer Dashboard](https://www.linkedin.com/developers/apps)
2. Create a new app
3. Request OAuth 2.0 credentials
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/linkedin`
   - `https://yourdomain.com/api/auth/callback/linkedin`
5. Copy Client ID and Client Secret

### `LINKEDIN_OAUTH_ID`

**Example**:
```
LINKEDIN_OAUTH_ID="YOUR_LINKEDIN_OAUTH_ID_HERE"
```

### `LINKEDIN_OAUTH_SECRET`

**Example**:
```
LINKEDIN_OAUTH_SECRET="YOUR_LINKEDIN_OAUTH_SECRET_HERE"
```

---

## Email Configuration (SMTP)

### `SMTP_HOST`

**Purpose**: SMTP server for sending emails

**For Gmail**:
```
SMTP_HOST="smtp.gmail.com"
```

**For Other Providers**: Check their documentation

### `SMTP_PORT`

**For Gmail (TLS)**:
```
SMTP_PORT="587"
```

**For Gmail (SSL)**:
```
SMTP_PORT="465"
```

### `SMTP_USER`

**Example**:
```
SMTP_USER="your-email@gmail.com"
```

### `SMTP_PASS`

**For Gmail**:
1. Enable 2-factor authentication
2. Generate App Password: [Google Account Security](https://myaccount.google.com/apppasswords)
3. Use the generated password (not your regular password)

**Example**:
```
SMTP_PASS="YOUR_GMAIL_APP_PASSWORD_HERE"
```

### `SMTP_FROM`

**Purpose**: Display name and email for outgoing messages

**Example**:
```
SMTP_FROM="Twinstitute AI <your-email@gmail.com>"
```

**Note**: The `<email>` should match `SMTP_USER`

---

## AI Integration (Groq)

### Getting Groq API Keys

1. Go to [Groq Console](https://console.groq.com)
2. Sign up or log in
3. Navigate to API Keys
4. Create API keys for different use cases
5. Copy the API key

### Available Groq Keys

Each key can have rate limits, so dedicated keys for different features provide better stability:

#### `GROQ_ORIENTATION_KEY`
- **Purpose**: Orientation system for new users
- **Example**: `gsk_YOUR_GROQ_ORIENTATION_KEY_HERE`

#### `GROQ_ROADMAP_KEY`
- **Purpose**: Roadmap generation and planning
- **Example**: `gsk_YOUR_GROQ_ROADMAP_KEY_HERE`

#### `GROQ_SKILL_GENOME_KEY`
- **Purpose**: Skill analysis and capability mapping
- **Example**: `gsk_YOUR_GROQ_SKILL_GENOME_KEY_HERE`

#### `GROQ_MENTOR_KEY`
- **Purpose**: AI mentor for interview prep and guidance
- **Example**: `gsk_YOUR_GROQ_MENTOR_KEY_HERE`

#### `GROQ_CAREER_KEY`
- **Purpose**: Career path and opportunity analysis
- **Example**: `gsk_YOUR_GROQ_CAREER_KEY_HERE`

#### `GROQ_RESUME_BUILDER_KEY`
- **Purpose**: Resume generation and optimization
- **Example**: `gsk_YOUR_GROQ_RESUME_BUILDER_KEY_HERE`

#### `GROQ_RECRUITER_KEY`
- **Purpose**: Recruiter evaluation and job matching
- **Example**: `gsk_YOUR_GROQ_RECRUITER_KEY_HERE`

**Best Practice**:
- Create multiple API keys in Groq console
- Assign each key to different features for rate limit isolation
- Monitor usage in Groq dashboard
- Set up alerts for quota limits

---

## reCAPTCHA Setup

### Getting reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Create a new site
3. Choose reCAPTCHA v2 (Checkbox)
4. Add domains:
   - Local: `localhost`
   - Production: `yourdomain.com`
5. Copy Site Key and Secret Key

### `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`

**Example**:
```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="YOUR_RECAPTCHA_SITE_KEY_HERE"
```

**Note**: This is public (visible in frontend code)

### `RECAPTCHA_SECRET_KEY`

**Example**:
```
RECAPTCHA_SECRET_KEY="YOUR_RECAPTCHA_SECRET_KEY_HERE"
```

**Important**: Keep this secret (server-side only)

---

## Best Working Configuration

This is a tested, working configuration template. Copy and modify as needed:

```bash
# ═══════════════════════════════════════════════════════════════════════
# DATABASE CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════
DATABASE_URL="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/twinstitute?retryWrites=true&w=majority&appName=TechPortfolioHub"

# ═══════════════════════════════════════════════════════════════════════
# NEXTAUTH CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════
NEXTAUTH_URL="http://localhost:3000"
EXTERNAL_URL="http://localhost:3000"
NEXTAUTH_SECRET="YOUR_NEXTAUTH_SECRET_HERE_GENERATE_WITH_PROVIDED_COMMAND"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ═══════════════════════════════════════════════════════════════════════
# OAUTH PROVIDERS
# ═══════════════════════════════════════════════════════════════════════

# Google OAuth
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET_HERE"

# GitHub OAuth
GITHUB_OAUTH_ID="YOUR_GITHUB_OAUTH_ID_HERE"
GITHUB_OAUTH_SECRET="YOUR_GITHUB_OAUTH_SECRET_HERE"

# LinkedIn OAuth
LINKEDIN_OAUTH_ID="YOUR_LINKEDIN_OAUTH_ID_HERE"
LINKEDIN_OAUTH_SECRET="YOUR_LINKEDIN_OAUTH_SECRET_HERE"

# ═══════════════════════════════════════════════════════════════════════
# EMAIL CONFIGURATION (SMTP)
# ═══════════════════════════════════════════════════════════════════════
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="YOUR_GMAIL_APP_PASSWORD_HERE"
SMTP_FROM="Twinstitute AI <your-email@gmail.com>"

# ═══════════════════════════════════════════════════════════════════════
# AI INTEGRATION (GROQ) - Dedicated Keys for Each Feature
# ═══════════════════════════════════════════════════════════════════════
GROQ_ORIENTATION_KEY="gsk_YOUR_GROQ_ORIENTATION_KEY_HERE"
GROQ_ROADMAP_KEY="gsk_YOUR_GROQ_ROADMAP_KEY_HERE"
GROQ_SKILL_GENOME_KEY="gsk_YOUR_GROQ_SKILL_GENOME_KEY_HERE"
GROQ_MENTOR_KEY="gsk_YOUR_GROQ_MENTOR_KEY_HERE"
GROQ_CAREER_KEY="gsk_YOUR_GROQ_CAREER_KEY_HERE"
GROQ_RESUME_BUILDER_KEY="gsk_YOUR_GROQ_RESUME_BUILDER_KEY_HERE"
GROQ_RECRUITER_KEY="gsk_YOUR_GROQ_RECRUITER_KEY_HERE"

# ═══════════════════════════════════════════════════════════════════════
# RECAPTCHA CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="YOUR_RECAPTCHA_SITE_KEY_HERE"
RECAPTCHA_SECRET_KEY="YOUR_RECAPTCHA_SECRET_KEY_HERE"
```

---

## Environment-Specific Configuration

### Development (.env.local)

Use localhost URLs and development API keys:

```bash
NEXTAUTH_URL="http://localhost:3000"
EXTERNAL_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DATABASE_URL="mongodb+srv://dev_user:dev_password@..."
```

### Production (.env.production)

Use production domain and production API keys:

```bash
NEXTAUTH_URL="https://twinstitute.ai"
EXTERNAL_URL="https://twinstitute.ai"
NEXT_PUBLIC_APP_URL="https://twinstitute.ai"
DATABASE_URL="mongodb+srv://prod_user:prod_password@..."
```

---

## Verification Checklist

After setting up all environment variables, verify with this checklist:

- [ ] Database connection works (`npx prisma db push`)
- [ ] Google OAuth redirects to login on `/auth/login`
- [ ] Email sending works (check verification emails)
- [ ] Groq API calls succeed (check AI features)
- [ ] reCAPTCHA appears on forms
- [ ] NextAuth sessions created properly
- [ ] All OAuth providers redirect correctly
- [ ] No console errors in browser/server

---

## Troubleshooting

### "NEXTAUTH_SECRET is missing"
- Generate a new secret using the provided command
- Make sure it's at least 32 characters

### "Database connection failed"
- Check MongoDB connection string
- Verify IP whitelist in MongoDB Atlas
- Ensure database name matches schema

### "OAuth redirect URI mismatch"
- Verify redirect URIs match exactly (including protocol)
- For dev: `http://localhost:3000/api/auth/callback/provider`
- For prod: `https://yourdomain.com/api/auth/callback/provider`

### "SMTP authentication failed"
- For Gmail: Use App Password, not regular password
- Enable Less Secure App Access (if not using App Password)
- Check SMTP host and port configuration

### "Groq API rate limit exceeded"
- Use different API keys for different features
- Monitor usage in Groq dashboard
- Implement request queuing in application

---

## Security Best Practices

1. **Never commit `.env` or `.env.local`** - Already in `.gitignore`
2. **Use different credentials for dev/prod** - Create separate OAuth apps
3. **Rotate secrets regularly** - Especially API keys
4. **Use environment-specific configuration** - Dev and prod have different settings
5. **Keep secrets in a vault** - Use services like AWS Secrets Manager for production
6. **Audit API key usage** - Monitor Groq, Google Cloud, and GitHub dashboards

---

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org)
- [Groq API Documentation](https://console.groq.com/docs)
- [MongoDB Connection Guide](https://docs.mongodb.com/manual/reference/connection-string)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [SMTP Configuration Guide](https://www.nodemailer.com/smtp)

---

**Last Updated**: May 2, 2026
**Status**: Best Working Configuration ✅
