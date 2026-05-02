# Twinstitute AI - Running Instructions

## Overview
Twinstitute AI is a comprehensive career development platform built with Next.js, Prisma, NextAuth, and AI integrations. This guide covers everything needed to run the project locally and in production.

---

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** (comes with Node.js)
- **MongoDB** (local or Atlas - cloud database)
- **Git** (for version control)

### Verify Installation
```bash
node --version    # Should be v18+
npm --version     # Should be v9+
```

---

## Quick Start (5 Minutes)

### 1. Clone the Repository
```bash
git clone https://github.com/QizarBilal/Twinstitute-AI.git
cd "Twinstitute AI"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy the `.env` file or refer to `ENV_INSTRUCTIONS.md` for detailed configuration:
```bash
cp .env.example .env.local  # If available, or manually create .env with the provided template
```

### 4. Set Up Prisma Database
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Optional: Seed initial data
npm run seed
```

### 5. Run Development Server
```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

---

## Development Workflow

### Start Development Server
```bash
npm run dev
```
- Hot reloads on file changes
- Available at `http://localhost:3000`
- Check terminal for any errors

### Build for Production
```bash
npm run build
```
- Creates optimized production build
- Outputs to `.next/` directory
- Run `npm start` to test production build locally

### Linting
```bash
npm run lint
```
- Checks code quality and formatting
- Fix issues with ESLint

---

## Project Structure

```
twinstitute-ai/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── agents/       # AI agents
│   │   ├── proof/        # Proof generation
│   │   └── ...
│   ├── auth/             # Auth pages (login, signup, etc)
│   ├── dashboard/        # Dashboard pages
│   └── home/             # Home page
├── components/           # React components
│   ├── auth/            # Auth components
│   ├── dashboard/       # Dashboard components
│   ├── features/        # Feature components
│   └── shared/          # Shared components
├── lib/                 # Utilities and helpers
│   ├── auth.ts         # NextAuth configuration
│   ├── ai-agent.ts     # AI agent utilities
│   ├── prisma.ts       # Prisma client
│   └── ...
├── hooks/              # React hooks
├── types/              # TypeScript type definitions
├── prisma/            # Database schema and migrations
├── public/            # Static assets
├── styles/            # Global styles
├── next.config.js     # Next.js configuration
├── tailwind.config.ts # Tailwind CSS configuration
└── tsconfig.json      # TypeScript configuration
```

---

## Key Features & Setup

### 1. Authentication (NextAuth.js)
- **Google OAuth**: Configure in `ENV_INSTRUCTIONS.md`
- **GitHub OAuth**: Add credentials in environment
- **LinkedIn OAuth**: Optional integration
- **Local credentials**: Email/password authentication

### 2. Database (MongoDB + Prisma)
- Connection via `DATABASE_URL` in .env
- Schema defined in `prisma/schema.prisma`
- Migrations managed with Prisma
- Type-safe queries with Prisma client

### 3. AI Integration (Groq)
- Multiple Groq API keys for different features:
  - Orientation engine
  - Roadmap generation
  - Skill genome analysis
  - AI mentor
  - Career guidance
  - Resume builder
  - Recruiter evaluation
- Keys configured in `.env`

### 4. Email Service (Nodemailer)
- SMTP configured for Gmail
- Used for email verification and notifications
- Configuration in `ENV_INSTRUCTIONS.md`

### 5. Security
- Bcrypt for password hashing
- CORS enabled
- Rate limiting implemented
- reCAPTCHA integration (v2)

---

## Environment Setup

For detailed environment configuration, see **ENV_INSTRUCTIONS.md**

Quick summary of required variables:
- `DATABASE_URL`: MongoDB connection string
- `NEXTAUTH_URL`: Application URL (localhost:3000 for dev)
- `NEXTAUTH_SECRET`: Random 32+ character string
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: OAuth credentials
- `GROQ_*_KEY`: API keys for AI features
- `SMTP_*`: Email service configuration
- `GITHUB_OAUTH_ID` & `GITHUB_OAUTH_SECRET`: GitHub OAuth
- `LINKEDIN_OAUTH_ID` & `LINKEDIN_OAUTH_SECRET`: LinkedIn OAuth

---

## Troubleshooting

### Issue: "Cannot find module" errors
**Solution**: 
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: Prisma client not found
**Solution**:
```bash
npx prisma generate
npx prisma db push
```

### Issue: PORT 3000 already in use
**Solution**:
```bash
# Use a different port
npm run dev -- -p 3001
```

### Issue: Database connection fails
**Solution**:
1. Verify `DATABASE_URL` in `.env`
2. Check MongoDB connection string format
3. Ensure IP whitelist in MongoDB Atlas (if using cloud)
4. Test connection: `npx prisma db push`

### Issue: Google OAuth not working
**Solution**:
1. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
2. Check authorized redirect URIs in Google Console
3. Add `http://localhost:3000/api/auth/callback/google` for local dev

### Issue: Groq API errors
**Solution**:
1. Verify API keys in `.env`
2. Check Groq API rate limits
3. Ensure API key has correct permissions
4. Test with fallback responses in code

---

## Deployment

### Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Configuration:
- Build command: `npm run build`
- Start command: `npm start`
- Environment variables: Copy from `.env`

### Manual Deployment (Any Node.js Host)
```bash
# Build
npm run build

# Install production dependencies
npm install --production

# Start server
npm start
```

### Environment Variables for Production
- Use secure vault/secrets management
- Never commit `.env.local` to repository
- Set `NEXTAUTH_URL` to production domain
- Use production database URL
- Update OAuth redirect URIs for production domain

---

## Database Migrations

### Create a new migration
```bash
npx prisma migrate dev --name migration_name
```

### Apply migrations to production
```bash
npx prisma migrate deploy
```

### Reset database (⚠️ Deletes all data)
```bash
npx prisma migrate reset
```

### View database schema
```bash
npx prisma studio
```

---

## Development Tips

### Enable Debug Logging
```bash
# For NextAuth debug logs
DEBUG=* npm run dev

# For Prisma debug logs
export DEBUG="prisma:*"
npm run dev
```

### Format Code
```bash
npx prettier --write .
```

### Type Check
```bash
npx tsc --noEmit
```

### Database Inspector
```bash
npx prisma studio
# Opens http://localhost:5555 to view and edit database
```

---

## Git Workflow

### Daily Development
```bash
# Ensure you're on dev branch
git checkout dev

# Create feature branch
git checkout -b feature/feature-name

# Make changes, then commit
git add .
git commit -m "feat: description of changes"

# Push to origin
git push origin feature/feature-name

# Create Pull Request on GitHub
```

### Keeping Branches Synced
```bash
# Update dev branch
git checkout dev
git pull origin dev

# Update feature branch with latest dev
git checkout feature/feature-name
git rebase dev
git push origin feature/feature-name -f
```

### Deploy Changes
```bash
# Merge to dev
git checkout dev
git merge feature/feature-name
git push origin dev

# When ready for production, merge to main
git checkout main
git merge dev
git push origin main
```

---

## Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm install -D @next/bundle-analyzer
# Add to next.config.js and run build
```

### Image Optimization
- Use `<Image>` component from next/image
- Automatically optimizes and lazy loads

### Database Queries
- Use Prisma select for specific fields
- Implement pagination for large datasets
- Use database indices for frequent queries

---

## Security Best Practices

1. **Never commit secrets**
   - Keep `.env.local` in `.gitignore`
   - Use environment variables for all secrets

2. **Update dependencies regularly**
   ```bash
   npm outdated
   npm update
   ```

3. **Scan for vulnerabilities**
   ```bash
   npm audit
   npm audit fix
   ```

4. **Secure API routes**
   - Validate all inputs
   - Use NextAuth for session validation
   - Implement rate limiting

---

## Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **NextAuth Docs**: https://next-auth.js.org
- **Groq API**: https://console.groq.com
- **MongoDB**: https://docs.mongodb.com
- **GitHub Issues**: [Project Repository](https://github.com/QizarBilal/Twinstitute-AI/issues)

---

## Contact & Contribution

For questions or contributions, please open an issue on GitHub or contact the development team.

**Last Updated**: May 2, 2026
**Version**: 1.0.0
