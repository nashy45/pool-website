# 🚀 Deploy to Render.com (5 Minutes)

## Stop Using Vercel - Use Render Instead!

Vercel doesn't support your type of website. Render.com is perfect and free.

---

## ✅ Step-by-Step Render Deployment

### **Step 1: Make Sure Code is on GitHub**

If you already pushed to GitHub, skip to Step 2.

If not, run these in PowerShell:

```powershell
cd "C:\Users\fombu\OneDrive\Desktop\pool website"

git init
git add .
git commit -m "Deploy to Render"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/pools-arena-website.git
git push -u origin main
```

---

### **Step 2: Sign Up on Render**

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with your **GitHub account** (easiest)
4. Authorize Render to access your GitHub

---

### **Step 3: Create Web Service**

1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Find your repository: **pools-arena-website**
4. Click **"Connect"**

---

### **Step 4: Configure Service**

Fill in these settings:

```
Name: pools-arena
(or any name you want - will be part of your URL)

Region: Frankfurt
(closest to Cameroon)

Branch: main

Root Directory: 
(leave empty)

Environment: Node

Build Command: npm install

Start Command: npm start

Plan: Free
```

---

### **Step 5: Deploy**

1. Click **"Create Web Service"**
2. Wait 3-5 minutes while Render:
   - Installs dependencies
   - Builds your app
   - Starts the server
3. Watch the logs - you'll see:
   ```
   ==> Building...
   ==> Installing dependencies...
   ==> Starting server...
   ==> Pool's Arena Server Running
   ==> Your service is live 🎉
   ```

---

### **Step 6: Get Your Public URL**

Once deployment completes:
- Top of page shows: **✅ Live**
- Your URL appears: **`https://pools-arena.onrender.com`**
- Click it to open your website!

---

## 🎯 Share With Your Client

**Customer Website:**
```
https://pools-arena.onrender.com
```

**Staff Dashboard:**
```
https://pools-arena.onrender.com/staff/login
Username: admin
Password: admin123
```

**Works from anywhere in the world!** 🌍

---

## ⚠️ Important Notes

### **Free Tier Limitations:**

1. **Database Resets**
   - SQLite database resets when inactive for 15+ minutes
   - Good for demos
   - For production: Upgrade to paid ($7/month)

2. **App "Sleeps"**
   - After 15 minutes of no visitors, app sleeps
   - First visit wakes it up (takes ~30 seconds)
   - Subsequent visits are instant

3. **Solution for Production:**
   - Upgrade to paid plan: $7/month
   - Database persists forever
   - No sleep mode
   - Worth it for real business!

---

## 🔧 Troubleshooting

### **Build Failed?**

Check build logs in Render dashboard. Common fixes:

**Missing dependencies:**
```bash
# Add to package.json if needed
npm install bcryptjs cors express sqlite3 --save
```

**Wrong start command:**
Make sure `package.json` has:
```json
"scripts": {
  "start": "node server.js"
}
```

### **Cannot Access /staff/login?**

Make sure `server.js` has:
```javascript
app.get('/staff/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'staff', 'login.html'));
});
```

### **Images Not Loading?**

Check that `public` folder structure is correct:
```
public/
  images/
  css/
  js/
  media/
  staff/
```

---

## 🚀 Redeploy After Changes

Made changes to your code?

1. **Commit and push to GitHub:**
   ```powershell
   git add .
   git commit -m "Updated website"
   git push
   ```

2. **Render auto-deploys!**
   - Watches your GitHub repo
   - Automatically rebuilds when you push
   - Takes 2-3 minutes

---

## 💰 Upgrade to Paid (Optional)

When ready for production:

1. Go to your service in Render
2. Click "Upgrade to Paid"
3. Choose plan: **$7/month**
4. Benefits:
   - ✅ Database persists forever
   - ✅ No sleep mode
   - ✅ More resources
   - ✅ Better performance

---

## ✅ Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] Web Service created and configured
- [ ] Deployment successful (shows "Live")
- [ ] Website accessible at public URL
- [ ] Tested customer website
- [ ] Tested staff dashboard login
- [ ] Shared URL with client

---

## 🎉 Done!

Your website is now live and accessible from anywhere!

**Need help?** Check Render's build logs for error messages.
