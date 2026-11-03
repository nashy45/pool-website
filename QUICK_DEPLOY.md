# ⚡ QUICK DEPLOY COMMANDS

## Copy-Paste These Commands (One by One)

Open PowerShell in your project folder and run:

```powershell
# 1. Initialize git
git init

# 2. Add all files  
git add .

# 3. Commit
git commit -m "Pool's Arena website ready for deployment"

# 4. Set main branch
git branch -M main

# 5. Add GitHub repository (REPLACE YOUR-USERNAME!)
git remote add origin https://github.com/YOUR-USERNAME/pools-arena-website.git

# 6. Push to GitHub
git push -u origin main
```

---

## 🌐 Then Deploy:

**Option 1: Render.com (Recommended)**
1. Go to https://render.com
2. Sign up with GitHub
3. New + → Web Service
4. Connect repository
5. Deploy (takes 3-5 min)
6. Get URL: `https://pools-arena.onrender.com`

**Option 2: Vercel (Faster)**
1. Go to https://vercel.com
2. Sign up with GitHub  
3. Import project
4. Deploy
5. Get URL: `https://pools-arena.vercel.app`

---

## ✅ Your client can access from anywhere!

**Customer Site:** `https://your-url.com`
**Staff Dashboard:** `https://your-url.com/staff/login`

---

## 🚨 If You Get Errors:

**"git: command not found"**
- Install Git: https://git-scm.com/download/win

**"GitHub authentication failed"**
- Use Personal Access Token instead of password
- Get token: https://github.com/settings/tokens

**"Deployment failed on Render"**
- Check build logs in Render dashboard
- Make sure package.json has "start": "node server.js"

---

**Need detailed guide? See DEPLOY_GUIDE.md**
