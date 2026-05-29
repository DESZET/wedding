# Vercel Deployment Guide - Wedding App

This guide will help you deploy your wedding app to Vercel.

## Prerequisites

1. **Vercel Account**: Create one at https://vercel.com
2. **Git Repository**: Your project should be in a Git repository (GitHub, GitLab, or Bitbucket)
3. **Node.js & pnpm**: Ensure you have Node.js 18+ and pnpm installed

## Step 1: Push to Git Repository

Make sure your code is pushed to a Git repository:

```bash
git add .
git commit -m "Add Vercel configuration"
git push origin main
```

## Step 2: Connect to Vercel

### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally if not already installed
npm install -g vercel

# Deploy from your project directory
vercel
```

The CLI will guide you through:
- Linking to your Vercel account
- Selecting your project
- Configuring build settings

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Select your Git repository
4. Vercel will auto-detect the configuration from `vercel.json`
5. Click "Deploy"

## Step 3: Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables (based on your `.env` file):
   - `PING_MESSAGE` (or any other env vars your app needs)
   - Any database connection strings if applicable

## Important Notes

### Database & File Storage

Your app currently uses:
- **SQLite database** (`wedding.db`)
- **File uploads** to `public/uploads/`

#### Issue: Serverless Functions Limitations

Vercel serverless functions have **ephemeral filesystems** - meaning files created during function execution are not persisted. This affects:
1. **Database**: SQLite files will be lost between deployments
2. **Uploads**: User-uploaded files won't persist

#### Solutions:

**Option 1: Use External Database (Recommended)**
- Migrate to PostgreSQL, MySQL, or SQLite Cloud
- Update your `server/database.ts` to use the cloud database
- Connection string would be stored in environment variables

**Option 2: Use External Storage for Uploads**
- AWS S3, Cloudinary, or similar service
- Update file upload routes to use cloud storage
- Store file metadata in database

**Option 3: Edge Runtime Limitations**
If you need persistent storage, consider:
- Vercel KV (Redis) for session/cache data
- Vercel Postgres for relational data
- External S3 for static files

### Current Build Configuration

- **Build Command**: `npm run build`
- **Output Directory**: `dist/spa` (your static SPA files)
- **Server API**: `api/` directory (serverless functions)

The project will:
1. Build the React SPA to `dist/spa`
2. Deploy API routes from `api/` as serverless functions
3. Serve static files + SPA with API rewrites

## Step 4: First Deployment

```bash
vercel --prod
```

This deploys to the production URL.

## Step 5: Monitor & Troubleshoot

In Vercel Dashboard:
- **Deployments**: Check build logs and deployment status
- **Functions**: Monitor serverless function execution
- **Logs**: View real-time logs and errors

### Common Issues

**Build Fails**
- Check Vercel build logs for specific errors
- Ensure all dependencies are in `package.json`
- Verify `npm run build` works locally

**API Not Working**
- Check that `api/index.ts` exists
- Verify API routes are correctly exported
- Check function logs in Vercel dashboard

**Database Connection Issues**
- Ensure DATABASE_URL is set in environment variables
- For SQLite, this won't persist - migrate to cloud DB
- Check database credentials and network access

## Subsequent Deployments

### Automatic Deployments (Recommended)

Any push to your main branch will automatically trigger a deployment.

To disable auto-deployments:
- Dashboard → Settings → Git → Uncheck "Deploy on push"

### Manual Deployments

```bash
vercel --prod
```

## Local Testing (Optional)

To test locally as it would run on Vercel:

```bash
vercel dev
```

This starts a local Vercel environment simulator.

## Rollback to Previous Deployment

```bash
vercel --prod --no-wait --team <team-name> --git-meta-from-vercel
```

Or use the dashboard to select a previous deployment to promote to production.

## Database Migration (If Needed)

If you decide to migrate from SQLite to a cloud database:

1. Choose a provider (PostgreSQL recommended):
   - Vercel Postgres (easiest)
   - Railway.app
   - Planetscale (MySQL)

2. Export your current SQLite database

3. Import to cloud database

4. Update `server/database.ts` connection string

5. Set DATABASE_URL in Vercel environment variables

6. Redeploy

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Project Logs**: Check Vercel Dashboard → Deployments → Build/Function Logs
- **Environment Issues**: Verify `.env` variables are set in Vercel dashboard

---

Your app is now ready for Vercel deployment! 🚀
