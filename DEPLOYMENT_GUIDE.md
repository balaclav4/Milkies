# Milkies - Deployment Guide

This guide will walk you through deploying your Milkies breastfeeding tracker to Netlify with Supabase authentication and database.

## Architecture Overview

The app now uses:
- **Frontend**: Next.js (deployed on Netlify)
- **Database**: Supabase PostgreSQL (cloud-hosted)
- **Authentication**: Supabase Auth (multi-user with private data)
- **No Python backend needed!** ✅

---

## Step 1: Set Up Supabase (5 minutes)

### 1.1 Create a Supabase Account

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email

### 1.2 Create a New Project

1. Click "New Project"
2. Fill in the details:
   - **Name**: `milkies` (or your preferred name)
   - **Database Password**: Choose a strong password (save it somewhere safe)
   - **Region**: Choose the region closest to you
3. Click "Create new project"
4. Wait 2-3 minutes for the project to be created

### 1.3 Run the Database Schema

1. In your Supabase project dashboard, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Open the file `/supabase-schema.sql` from your project
4. Copy the entire contents
5. Paste it into the SQL Editor
6. Click **Run** (or press Ctrl/Cmd + Enter)
7. You should see "Success. No rows returned"

This creates:
- ✅ Tables: `pumping_sessions`, `baby_feedings`, `daily_stats`
- ✅ Row Level Security (RLS) policies for private data
- ✅ Automatic triggers to update daily statistics
- ✅ Indexes for fast queries

### 1.4 Get Your Supabase Credentials

1. Click **Settings** (gear icon) in the left sidebar
2. Click **API** under "Project Settings"
3. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (under "Project API keys")

**Keep these safe!** You'll need them in the next step.

---

## Step 2: Configure Your Local Environment (2 minutes)

### 2.1 Create Environment File

1. Navigate to the `web` folder:
   ```bash
   cd web
   ```

2. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

3. Edit `.env.local` and add your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### 2.2 Install Dependencies

```bash
npm install
```

This installs:
- Supabase client libraries
- Authentication helpers
- All existing dependencies

### 2.3 Test Locally (Optional but Recommended)

```bash
npm run dev
```

1. Open http://localhost:3000
2. Try creating an account
3. Add some pumping/feeding data
4. Make sure everything works!

**Tip**: Open your browser's Developer Console (F12) to check for any errors.

---

## Step 3: Deploy to Netlify (10 minutes)

### 3.1 Prepare Your Repository

Make sure your code is pushed to GitHub:

```bash
git add .
git commit -m "Add Supabase integration for multi-user support"
git push -u origin claude/breastfeeding-pumping-guide-011CUpKnwywMN7UbtRp2uwDp
```

### 3.2 Create a Netlify Account

1. Go to https://netlify.com
2. Click "Sign up"
3. Sign up with GitHub (recommended)

### 3.3 Deploy Your Site

#### Option A: Deploy from GitHub (Recommended)

1. Click "Add new site" → "Import an existing project"
2. Choose "GitHub"
3. Authorize Netlify to access your repositories
4. Select your `Milkies` repository
5. Configure build settings:
   - **Base directory**: `web`
   - **Build command**: `npm run build`
   - **Publish directory**: `web/.next`
6. **Add environment variables** (IMPORTANT):
   - Click "Show advanced" → "New variable"
   - Add `NEXT_PUBLIC_SUPABASE_URL` with your Supabase URL
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` with your Supabase anon key
7. Click "Deploy site"

#### Option B: Manual Deploy

```bash
cd web
npm run build
# Drag and drop the .next folder to Netlify
```

### 3.4 Wait for Deployment

- Netlify will build and deploy your site (takes 2-5 minutes)
- You'll get a URL like: `https://random-name-123456.netlify.app`

### 3.5 Configure a Custom Domain (Optional)

1. In Netlify dashboard, click "Domain settings"
2. Click "Add custom domain"
3. Follow the instructions to:
   - Use a Netlify subdomain (e.g., `milkies.netlify.app`)
   - Or connect your own domain

---

## Step 4: Configure Supabase for Production

### 4.1 Add Your Netlify URL to Supabase

1. Go back to your Supabase dashboard
2. Click **Authentication** in the left sidebar
3. Click **URL Configuration**
4. Add your Netlify URL to **Site URL**:
   ```
   https://your-site-name.netlify.app
   ```
5. Add the same URL to **Redirect URLs**:
   ```
   https://your-site-name.netlify.app/**
   ```
6. Click **Save**

This ensures authentication redirects work properly.

### 4.2 Configure Email Templates (Optional)

1. In Supabase dashboard, go to **Authentication** → **Email Templates**
2. Customize your signup confirmation email
3. Update the "Confirm signup" email with your branding

---

## Step 5: Test Your Deployed App

1. Visit your Netlify URL
2. Click "Sign Up"
3. Create an account with your email
4. Check your email for the confirmation link
5. Click the confirmation link
6. Sign in and start tracking!

### Troubleshooting

**Problem**: "Invalid Supabase credentials"
- **Solution**: Double-check your environment variables in Netlify
- Go to Netlify dashboard → Site settings → Environment variables
- Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly

**Problem**: Email confirmation not working
- **Solution**: Check your spam folder
- Or go to Supabase → Authentication → Users and manually verify the user

**Problem**: Data not saving
- **Solution**: Open browser DevTools (F12) → Console tab
- Look for error messages
- Make sure RLS policies were created (check Step 1.3)

**Problem**: "Failed to fetch data"
- **Solution**: This usually means the Supabase client can't connect
- Check environment variables
- Make sure you're using `NEXT_PUBLIC_` prefix (required for Next.js)

---

## Architecture Comparison

### Before (Python Backend):
```
User → Next.js Frontend → Flask API (Python) → SQLite Database
      ❌ Need to deploy Python backend
      ❌ SQLite doesn't work on Netlify
      ❌ Single-user only
```

### After (Supabase):
```
User → Next.js Frontend → Supabase (PostgreSQL + Auth)
      ✅ Deploy frontend only
      ✅ Cloud database with automatic backups
      ✅ Multi-user with private data
      ✅ Row Level Security (RLS)
```

---

## What's New?

### Multi-User Authentication
- Each user creates their own account
- All data is private (other users can't see your data)
- Row Level Security (RLS) ensures data isolation
- Sign in from any device and see your data

### Database Features
- **Automatic daily stats calculation** via triggers
- **Real-time updates** (Supabase automatically refreshes)
- **Automatic backups** (Supabase handles this)
- **Scalable** (handles millions of records)

### Removed Dependencies
- ❌ No more Python backend
- ❌ No more Flask server
- ❌ No more SQLite
- ❌ No more API rewrites
- ✅ Just Next.js + Supabase!

---

## Cost Breakdown

### Free Tier (Perfect for Personal Use)
- **Netlify**:
  - ✅ 100GB bandwidth/month
  - ✅ 300 build minutes/month
  - ✅ Automatic HTTPS
  - ✅ Custom domain support

- **Supabase**:
  - ✅ 500MB database storage
  - ✅ 50,000 monthly active users
  - ✅ 5GB bandwidth
  - ✅ Automatic backups (7 days)

**Total Cost**: $0/month for typical usage!

### If You Outgrow Free Tier
- **Netlify Pro**: $19/month (1TB bandwidth)
- **Supabase Pro**: $25/month (8GB database, 250k MAU)

For a personal breastfeeding tracker, you'll **never** hit these limits.

---

## Maintenance

### Updating Your App

```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push

# Netlify automatically rebuilds and deploys!
```

### Database Backups

Supabase automatically backs up your database:
- **Free tier**: 7 days of backups
- **Pro tier**: 30 days of backups

To manually export data:
1. Click the "Export" button in your app
2. Or use Supabase dashboard → Database → Backups

### Monitoring

**Netlify Dashboard**:
- View deployment history
- Check build logs
- Monitor bandwidth usage

**Supabase Dashboard**:
- View database size
- Monitor API usage
- Check authentication stats

---

## Security Best Practices

### Environment Variables
- ✅ **NEVER** commit `.env.local` to Git (it's in `.gitignore`)
- ✅ **ALWAYS** use `NEXT_PUBLIC_` prefix for client-side variables
- ✅ Store secrets only in Netlify environment variables

### Row Level Security (RLS)
- ✅ Already enabled in the schema
- ✅ Users can only access their own data
- ✅ Automatic enforcement at the database level

### Authentication
- ✅ Passwords are hashed with bcrypt
- ✅ Email confirmation required
- ✅ Rate limiting on login attempts
- ✅ All provided by Supabase

---

## FAQ

**Q: Can multiple users use the same app?**
A: Yes! Each user creates their own account and has private data.

**Q: Can I share data with my partner?**
A: Not out of the box, but you could:
- Share login credentials (simplest)
- Or implement data sharing features (advanced)

**Q: What happens if I delete my account?**
A: All your data is automatically deleted (CASCADE in the schema)

**Q: Can I export my data?**
A: Yes! Click the "Export" button to download JSON

**Q: Is my data secure?**
A: Yes!
- HTTPS encryption in transit
- Encrypted at rest in Supabase
- Row Level Security prevents unauthorized access

**Q: Can I use a custom domain?**
A: Yes! Netlify supports custom domains (e.g., milkies.yourdomain.com)

**Q: How do I add more users?**
A: Just share the URL! Each person signs up with their own email.

---

## Next Steps

### Optional Enhancements

1. **Email Notifications**
   - Set up scheduled reminders to pump/feed
   - Requires Supabase Edge Functions

2. **Mobile App**
   - The React Native app in `/mobile` already exists
   - Connect it to the same Supabase backend

3. **Advanced Analytics**
   - Add more charts and insights
   - Track milk stash inventory
   - Export to PDF

4. **Sharing Features**
   - Allow partners to view (but not edit) data
   - Share reports with lactation consultants

---

## Support

### Getting Help

- **Supabase Docs**: https://supabase.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Next.js Docs**: https://nextjs.org/docs

### Common Issues

Check the Troubleshooting section in Step 5.

---

## Summary

You've successfully:
- ✅ Removed the Python backend
- ✅ Migrated to Supabase (PostgreSQL + Auth)
- ✅ Added multi-user support with private data
- ✅ Deployed to Netlify (100% cloud-based)
- ✅ Set up automatic SSL/HTTPS
- ✅ Configured Row Level Security

**Your app is now production-ready and can be used by unlimited users!**

Enjoy tracking your breastfeeding journey! 🍼✨
