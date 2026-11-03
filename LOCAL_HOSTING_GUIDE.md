# Pool's Arena - Local Network Access Guide

## Your Computer's Local IP Address: **192.168.1.114**

---

## 🌐 How Clients Can Access Your Website

### **Step 1: Make Sure Server is Running**
On your computer, the server should already be running. If not:
```bash
npm start
```

### **Step 2: Share These URLs With Your Client**

**Customer Website (Main Site):**
```
http://192.168.1.114:3000
```

**Staff Dashboard (Admin Panel):**
```
http://192.168.1.114:3000/staff/login
```
- Username: `admin`
- Password: `admin123`

---

## ✅ Requirements for Client Access

1. **Same WiFi Network**
   - Your computer and client's device MUST be on the same WiFi network
   - Example: Both connected to "Home WiFi" or "Office WiFi"

2. **Firewall Settings** (if client can't connect)
   - Windows Firewall might block the connection
   - See "Troubleshooting" section below

3. **Keep Server Running**
   - Don't close the terminal window where `npm start` is running
   - Don't shut down or sleep your computer

---

## 📱 Testing Access

### On Your Computer (to verify it works):
```
http://localhost:3000
```

### On Client's Phone/Tablet/Computer:
```
http://192.168.1.114:3000
```

**The client should see:**
- Hero slideshow with venue photos
- Menu with all drinks and prices
- Reservation form
- Contact information

---

## 🔥 Troubleshooting

### Problem: Client can't access the website

**Solution 1: Allow Node.js through Windows Firewall**

1. Press `Windows + R`
2. Type: `wf.msc` and press Enter
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. Select "TCP" and enter port: `3000` → Next
6. Select "Allow the connection" → Next
7. Check all boxes (Domain, Private, Public) → Next
8. Name it: "Pool's Arena Website" → Finish

**Solution 2: Temporarily Disable Firewall (for testing only)**
```powershell
# Run PowerShell as Administrator
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False

# To re-enable after testing:
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

**Solution 3: Check if port 3000 is listening**
```powershell
netstat -ano | findstr :3000
```
You should see a line with `:3000` and `LISTENING`

---

## 🚀 Quick Firewall Rule (Run as Administrator)

Copy and paste this in PowerShell (Run as Administrator):
```powershell
New-NetFirewallRule -DisplayName "Pool's Arena Website" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

---

## 📊 What Your Client Can Do

### ✅ Customer Access (http://192.168.1.114:3000)
- Browse menu with 97+ items
- Add items to cart
- Place orders (with MTN/Orange Money payment)
- Make table reservations
- View venue photos in hero slideshow
- See contact information

### ✅ Staff Access (http://192.168.1.114:3000/staff/login)
- View all orders and reservations
- Manage menu items (add, edit, delete)
- Manage tables/resources
- Generate QR codes for tables
- View analytics and revenue reports
- Update business settings

---

## 🎯 Demo Flow for Client

1. **Show Customer Website**
   - Open `http://192.168.1.114:3000` on client's phone
   - Navigate through menu
   - Add items to cart
   - Show checkout process

2. **Show Staff Dashboard**
   - Login at `http://192.168.1.114:3000/staff/login`
   - Show order management
   - Show reservation system
   - Show QR code generation
   - Show analytics

3. **Show QR Code Ordering**
   - Generate QR code for a table in dashboard
   - Scan QR code with phone
   - Shows it's linked to specific table
   - Place order

---

## 💡 Tips for Presentation

1. **Prepare Sample Data**
   - Create a few test orders beforehand
   - Have some pending reservations to show

2. **Have Both Devices Ready**
   - Your laptop showing staff dashboard
   - Client's phone showing customer site

3. **Demonstrate Key Features**
   - Hero slideshow with their venue photos
   - Easy menu browsing and ordering
   - Mobile money payment options
   - Reservation system
   - Staff order management

4. **Highlight Unique Features**
   - QR code table ordering
   - Real-time order tracking
   - Professional design with their branding
   - Analytics dashboard for business insights

---

## 🔒 Security Notes

**For Local Demo:**
- This is safe for local network only
- Only people on same WiFi can access

**For Production (Later):**
- You'll need proper web hosting
- SSL certificate for HTTPS
- Change default admin password
- Set up proper authentication

---

## 📞 Quick Reference Card (Print This for Client)

```
╔═══════════════════════════════════════════════╗
║     POOL'S ARENA WEBSITE - ACCESS LINKS      ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  Customer Website:                            ║
║  http://192.168.1.114:3000                   ║
║                                               ║
║  Staff Dashboard:                             ║
║  http://192.168.1.114:3000/staff/login       ║
║  Username: admin                              ║
║  Password: admin123                           ║
║                                               ║
║  ⚠️ Must be on same WiFi network              ║
║                                               ║
╚═══════════════════════════════════════════════╝
```

---

## 🎬 Next Steps After Demo

If client approves, you can:
1. Deploy to proper hosting (Render, Railway, Heroku)
2. Get custom domain name
3. Set up SSL for security
4. Configure production database
5. Set up automatic backups

---

**Need help? The server logs will show all access attempts.**
