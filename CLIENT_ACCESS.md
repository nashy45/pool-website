# 🎯 Quick Setup: Show Website to Client

## ✅ Your Website is Ready!

### 📱 Share This Link With Your Client:

```
http://192.168.1.114:3000
```

### 🔑 Staff Dashboard Link:

```
http://192.168.1.114:3000/staff/login
Username: admin
Password: admin123
```

---

## ⚠️ Important Requirements:

1. **Same WiFi Network**
   - Your computer and client's phone/laptop must be on the SAME WiFi
   - Example: Both connected to your phone's hotspot or office WiFi

2. **Keep Server Running**
   - Don't close the terminal window
   - Don't sleep/shut down your computer

3. **Firewall (if needed)**
   - If client can't connect, you may need to allow port 3000 through Windows Firewall
   - Run PowerShell as Administrator and paste:
   ```powershell
   New-NetFirewallRule -DisplayName "Pool's Arena Website" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
   ```

---

## 🎬 Demo Checklist:

### Show on Client's Phone:
- [ ] Hero slideshow with venue photos (auto-changing)
- [ ] Menu section (97 drinks with prices)
- [ ] Add items to cart
- [ ] Checkout with MTN/Orange Money options
- [ ] Make a table reservation
- [ ] Mobile-friendly design

### Show on Your Laptop (Staff Dashboard):
- [ ] Login to dashboard
- [ ] View orders in real-time
- [ ] Manage reservations
- [ ] Generate QR codes for tables
- [ ] View analytics/revenue
- [ ] Manage menu items

---

## 🔧 Quick Troubleshooting:

**If client can't connect:**

1. Check WiFi - Are you both on same network?
2. Check server - Is it still running? (should see "Server Running" in terminal)
3. Try on your phone first using `http://192.168.1.114:3000`
4. If firewall blocks, run the PowerShell command above as admin

---

## ✨ What Makes This Special:

✅ Professional design with client's actual venue photos
✅ Complete menu (97+ premium spirits, cocktails, champagne)
✅ QR code ordering system for tables
✅ Mobile money payment integration (MTN & Orange)
✅ Real-time order management for staff
✅ Reservation system with availability checking
✅ Analytics dashboard with revenue tracking
✅ Fully mobile-responsive

---

**Ready to demo? Server is running at http://192.168.1.114:3000** 🚀
