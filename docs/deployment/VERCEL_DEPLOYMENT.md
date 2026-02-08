# HemoLedger - Vercel Deployment Guide

A step-by-step guide to deploy the Blood Bank Management System on Vercel.

## Prerequisites

Before deploying, ensure you have:

- [ ] A [Vercel account](https://vercel.com/signup) (free tier available)
- [ ] A [GitHub account](https://github.com) with the repository pushed
- [ ] A PostgreSQL database (recommended: [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app))
- [ ] Node.js 18+ installed locally (for testing)

---

## Step 1: Prepare Your Database

### Option A: Neon (Recommended - Free Tier)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Click **"Create a project"**
3. Select a region closest to your users
4. Copy the connection string:
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

### Option B: Supabase

1. Go to [supabase.com](https://supabase.com) and create a project
2. Navigate to **Settings → Database**
3. Copy the **Connection string (URI)**

### Option C: Railway

1. Go to [railway.app](https://railway.app)
2. Click **"New Project" → "Provision PostgreSQL"**
3. Copy the `DATABASE_URL` from the **Variables** tab

---

## Step 2: Configure Environment Variables

Create a list of required environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_URL` | Your Vercel deployment URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Random 32+ character string | Generate with `openssl rand -base64 32` |
| `ENCRYPTION_KEY` | Exactly 32 characters for AES-256 | Generate with `openssl rand -hex 16` |

### Generate Secrets Locally

Run these commands to generate secure secrets:

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY (32 characters)
openssl rand -hex 16
```

---

## Step 3: Deploy to Vercel

### Method A: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Click **"Add New Project"**

2. **Import Your Repository**
   - Select **"Import Git Repository"**
   - Choose `gkganesh12/Hemolegder` from the list
   - If not visible, click **"Adjust GitHub App Permissions"**

3. **Configure Project Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npx prisma generate && npm run build`
   - **Output Directory**: Leave empty (uses `.next`)
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   - Expand **"Environment Variables"** section
   - Add each variable:

   ```
   DATABASE_URL = your_postgresql_connection_string
   NEXTAUTH_URL = https://your-project-name.vercel.app
   NEXTAUTH_SECRET = your_generated_secret
   ENCRYPTION_KEY = your_32_character_key
   ```

5. **Deploy**
   - Click **"Deploy"**
   - Wait for the build to complete (2-5 minutes)

### Method B: Via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from Project Directory**
   ```bash
   cd "/Users/ganesh_khetawat/Blood Bank Managment System"
   vercel
   ```

4. **Follow the Prompts**
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N`
   - Project name? `hemoledger`
   - Directory? `./`

5. **Add Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXTAUTH_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add ENCRYPTION_KEY
   ```

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

## Step 4: Run Database Migrations

After deployment, run Prisma migrations:

### Option A: Via Vercel Dashboard

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings → Functions**
3. Add a build command that includes migrations:
   ```
   npx prisma generate && npx prisma db push && npm run build
   ```

### Option B: Via Local Terminal

```bash
# Set the production DATABASE_URL
export DATABASE_URL="your_production_database_url"

# Run migrations
npx prisma db push

# (Optional) Seed the database
npx prisma db seed
```

---

## Step 5: Verify Deployment

1. **Visit Your App**
   - Go to `https://your-project-name.vercel.app`
   - You should see the HemoLedger landing page

2. **Test Authentication**
   - Navigate to `/login`
   - Try registering a new account
   - Verify login/logout works

3. **Check Vercel Logs**
   - Go to Vercel Dashboard → Your Project → **Deployments**
   - Click on the latest deployment → **Functions** tab
   - Check for any errors

---

## Step 6: Configure Custom Domain (Optional)

1. **Go to Project Settings**
   - Vercel Dashboard → Your Project → **Settings** → **Domains**

2. **Add Your Domain**
   - Enter your domain (e.g., `hemoledger.com`)
   - Click **Add**

3. **Configure DNS**
   - Add the DNS records shown by Vercel to your domain registrar:

   | Type | Name | Value |
   |------|------|-------|
   | A | @ | 76.76.21.21 |
   | CNAME | www | cname.vercel-dns.com |

4. **Update NEXTAUTH_URL**
   - Go to **Settings → Environment Variables**
   - Update `NEXTAUTH_URL` to `https://yourdomain.com`
   - Redeploy the project

---

## Troubleshooting

### Build Fails: "Prisma Client not generated"

**Solution**: Update your build command:
```
npx prisma generate && npm run build
```

### Error: "NEXTAUTH_URL" not set

**Solution**: Add the environment variable in Vercel:
```
NEXTAUTH_URL=https://your-app.vercel.app
```

### Database Connection Errors

**Solutions**:
1. Ensure `?sslmode=require` is in your DATABASE_URL
2. Check if your database allows connections from Vercel IPs
3. For Neon: Enable "Pooled connection" if getting timeout errors

### Error: "Invalid ENCRYPTION_KEY"

**Solution**: Ensure ENCRYPTION_KEY is exactly 32 characters:
```bash
# Generate a valid 32-character key
openssl rand -hex 16
```

### Serverless Function Timeout

**Solution**: Add to `vercel.json`:
```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

---

## Post-Deployment Checklist

- [ ] App loads at Vercel URL
- [ ] User registration works
- [ ] User login/logout works
- [ ] Dashboard pages load correctly
- [ ] API routes respond properly
- [ ] Database operations work (create, read, update)
- [ ] Environment variables are set for all environments (Production, Preview, Development)
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (automatic with Vercel)

---

## Continuous Deployment

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches / pull requests

To disable auto-deploy:
1. Go to **Settings → Git**
2. Toggle off **"Auto-deploy"**

---

## Environment-Specific Variables

Set different values per environment:

| Environment | NEXTAUTH_URL |
|-------------|--------------|
| Production | `https://your-app.vercel.app` |
| Preview | `https://your-app-git-branch.vercel.app` |
| Development | `http://localhost:3000` |

---

## Cost Considerations

### Vercel Free Tier Includes:
- Unlimited personal projects
- 100GB bandwidth/month
- Serverless function executions
- Automatic HTTPS

### Upgrade Needed For:
- Team collaboration
- Password protection
- Advanced analytics
- Higher bandwidth limits

---

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma Docs**: [prisma.io/docs](https://prisma.io/docs)
- **Project Issues**: [github.com/gkganesh12/Hemolegder/issues](https://github.com/gkganesh12/Hemolegder/issues)
