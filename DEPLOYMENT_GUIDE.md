# GitHub Pages Deployment Guide

Your files are ready! Follow these simple steps to get your public URLs:

## Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `know-your-ammo-funnel` (or any name you prefer)
3. Set to **Public**
4. **DO NOT** check "Initialize with README"
5. Click "Create repository"

## Step 2: Push Your Code

GitHub will show you commands. Run these in your terminal from this project folder:

```bash
# If you haven't set up git before, run these first:
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"

# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/know-your-ammo-funnel.git
git branch -M main
git push -u origin main
```

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top navigation)
3. Click **Pages** (left sidebar)
4. Under "Source", select: **Deploy from a branch**
5. Under "Branch", select: **main** and folder **/wireframes/html**
6. Click **Save**

## Step 4: Get Your URLs

GitHub will show you the URL (usually takes 1-2 minutes to deploy). It will be:

`https://YOUR_USERNAME.github.io/know-your-ammo-funnel/`

### Your Page URLs:

- **Home/Index:** `https://YOUR_USERNAME.github.io/know-your-ammo-funnel/`
- **Upsell 1:** `https://YOUR_USERNAME.github.io/know-your-ammo-funnel/upsell1_unthinkable.html`
- **Upsell 2:** `https://YOUR_USERNAME.github.io/know-your-ammo-funnel/upsell2_firstaid.html`
- **Upsell 3:** `https://YOUR_USERNAME.github.io/know-your-ammo-funnel/upsell3_hershield.html`
- **Upsell 4:** `https://YOUR_USERNAME.github.io/know-your-ammo-funnel/upsell4_megabundle.html`
- **Downsell 1:** `https://YOUR_USERNAME.github.io/know-your-ammo-funnel/downsell1_unthinkable.html`
- **Downsell 2:** `https://YOUR_USERNAME.github.io/know-your-ammo-funnel/downsell2_firstaid.html`
- **Downsell 3:** `https://YOUR_USERNAME.github.io/know-your-ammo-funnel/downsell3_hershield.html`

---

## Alternative: If You Don't Want to Use Terminal

1. Go to https://github.com/new and create a new repository
2. After creating, click "uploading an existing file"
3. Drag the entire `wireframes/html` folder into the upload area
4. Click "Commit changes"
5. Then follow Step 3 above to enable GitHub Pages

---

**Need help?** Just let me know!
