# Deployment Guide - Vercel

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

2. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub

3. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite settings

4. **Configure Build Settings** (usually auto-detected)
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~1-2 minutes)
   - Your site will be live at `your-project.vercel.app`

### Option 2: Deploy via Vercel CLI (Advanced)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **For production deployment**
   ```bash
   vercel --prod
   ```

## Configuration

The `vercel.json` file is already configured with:
- ✅ Build command: `npm run build`
- ✅ Output directory: `dist`
- ✅ SPA routing support (all routes redirect to index.html)

## Environment Variables

If you need environment variables later:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add variables (e.g., `VITE_API_URL`)
3. Redeploy

## Custom Domain

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Automatic Deployments

- **Production**: Deploys on push to `main` branch
- **Preview**: Creates preview deployments for pull requests
- **Automatic**: No manual steps needed after initial setup

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify `npm run build` works locally

### 404 Errors on Routes
- Already handled by `vercel.json` rewrites
- All routes redirect to `index.html` for SPA routing

### IndexedDB Not Working
- IndexedDB works in all modern browsers
- No special configuration needed
- Storage is per-domain (your Vercel URL)

---

# Alternative: Deploy to Netlify

If you prefer Netlify:

## Quick Deploy to Netlify

1. **Push to GitHub** (same as above)

2. **Go to Netlify**
   - Visit [netlify.com](https://netlify.com)
   - Sign up/Login with GitHub

3. **Add New Site**
   - Click "Add new site" → "Import an existing project"
   - Select your GitHub repository

4. **Configure Build Settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

5. **Deploy**
   - Click "Deploy site"
   - Your site will be live at `your-project.netlify.app`

## Netlify Configuration File

Create `netlify.toml` in your project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Comparison: Vercel vs Netlify

| Feature | Vercel | Netlify |
|---------|--------|---------|
| **React Support** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Very Good |
| **Build Speed** | ⭐⭐⭐⭐⭐ Very Fast | ⭐⭐⭐⭐ Fast |
| **Free Tier** | ⭐⭐⭐⭐⭐ Generous | ⭐⭐⭐⭐⭐ Generous |
| **Ease of Use** | ⭐⭐⭐⭐⭐ Very Easy | ⭐⭐⭐⭐⭐ Very Easy |
| **Analytics** | ✅ Built-in | ✅ Available |
| **Serverless Functions** | ✅ Easy | ✅ Available |
| **Custom Domain** | ✅ Free SSL | ✅ Free SSL |

**Recommendation**: **Vercel** for React/Vite projects (better optimization)

---

## Post-Deployment Checklist

- [ ] Test the deployed site
- [ ] Verify file uploads work (IndexedDB)
- [ ] Check responsive design on mobile
- [ ] Test form submission
- [ ] Verify Recent Files section works
- [ ] Set up custom domain (optional)
- [ ] Enable analytics (optional)

---

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Vite Deployment**: https://vitejs.dev/guide/static-deploy.html

