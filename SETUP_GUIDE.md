# Pool's Arena - Setup Guide

## Quick Start

The database has been initialized! Follow these steps to complete setup:

### Step 1: Create Owner Account

Run this command to create your owner account:
```bash
npm run create-admin
```

You'll be prompted to create a username and password. Use these credentials to log into the admin dashboard.

### Step 2: Save the Logo Image

**IMPORTANT:** Save your logo image as `public/images/logo.png`

The logo image (from the chat) should be saved to this location. If you don't have it yet, create a temporary placeholder or the site will show broken images.

### Step 3: Start the Server

```bash
npm start
```

The server will start on http://localhost:3000

### Step 4: Access the Website

- **Customer Website:** http://localhost:3000
- **Owner Dashboard:** http://localhost:3000/admin

Log in with the credentials you created in Step 1.

### Step 5: Configure Your Business

1. Log into the admin dashboard
2. Go to "Business Settings"
3. Update:
   - Business information (if needed)
   - Opening/closing hours
   - MTN Mobile Money merchant code
   - Orange Money merchant code

### Step 6: Add Your Menu

1. Go to "Menu Management"
2. Click "Add Menu Item"
3. Fill in:
   - Name
   - Category (Meals, Snacks, or Drinks)
   - Price in FCFA
   - Description
   - Upload an image

Repeat for all your menu items.

### Step 7: Set Up Tables

1. Go to "Tables & Resources"
2. Click "Add Table/Resource"
3. Add your pool tables, dining tables, or event spaces
4. For each table, click "Generate QR Code"
5. Download and print the QR codes
6. Place QR codes on physical tables

When customers scan the QR code with their phone camera, they'll see your menu and can place orders directly from that table.

## Test the System

### Test Customer Ordering:
1. Open http://localhost:3000 in a browser
2. Browse the menu
3. Add items to cart
4. Place a test order

### Test Admin Dashboard:
1. Log into http://localhost:3000/admin
2. Check the "Orders" page to see your test order
3. Update the order status
4. Mark it as paid

### Test Reservations:
1. Go to the Reservations section on the customer site
2. Select a table
3. Choose date and time
4. Submit a reservation
5. Check the admin dashboard to approve it

## Payment Setup

### MTN Mobile Money
1. Contact MTN Cameroon to register as a merchant
2. Obtain your merchant code
3. Enter it in Admin Dashboard → Business Settings
4. Customers will see instructions to send payment to your merchant code

### Orange Money / Max it
1. Contact Orange Cameroon to register as a merchant
2. Obtain your merchant code
3. Enter it in Admin Dashboard → Business Settings
4. Customers will see instructions to send payment to your merchant code

**Note:** The system shows payment instructions but does NOT automatically verify payments. Staff must check the merchant dashboard/account and manually mark orders as paid.

## Production Deployment

When you're ready to deploy to a real server:

1. **Choose a Hosting Provider:**
   - DigitalOcean, Linode, or AWS EC2 (VPS)
   - Render, Railway, or Heroku (PaaS)

2. **Set Up a Domain:**
   - Register a domain name
   - Point it to your server

3. **Enable HTTPS:**
   - Essential for security
   - Use Let's Encrypt (free SSL certificate)

4. **Update Environment Variables:**
   - Change `JWT_SECRET` to a secure random string
   - Set `PUBLIC_URL` to your actual domain (for QR codes)
   - Set `NODE_ENV=production`

5. **Use a Process Manager:**
   ```bash
   npm install -g pm2
   pm2 start server.js --name pools-arena
   pm2 startup
   pm2 save
   ```

6. **Set Up Nginx (recommended):**
   - Acts as reverse proxy
   - Handles SSL/HTTPS
   - Serves static files efficiently

7. **Regular Backups:**
   - Backup the `pools-arena.db` file regularly
   - Backup the `uploads/` directory (menu images)

## Troubleshooting

### Database Issues
- Delete `pools-arena.db` and run `npm run init-db` again
- Check file permissions

### Images Not Loading
- Ensure `uploads/` directory exists and is writable
- Check file paths in database

### QR Codes Not Working
- Make sure `PUBLIC_URL` in `.env` is set correctly
- Must be your actual domain, not localhost for production

### Port Already in Use
- Change `PORT=3000` in `.env` to another port
- Or stop the other process using port 3000

## Support & Customization

### Adding More Categories
1. Edit `scripts/init-db.js`
2. Add categories to the initialization
3. Run `npm run init-db` (will not duplicate existing data)

### Changing Colors/Branding
1. Edit `public/css/style.css` (customer site)
2. Edit `public/css/admin.css` (admin dashboard)
3. Modify the CSS variables at the top of each file

### Adding Features
The codebase is organized and documented for easy modification:
- `server.js` - All API routes
- `public/js/app.js` - Customer website logic
- `public/js/admin.js` - Admin dashboard logic

## Security Notes

✓ Passwords are hashed with bcryptjs
✓ JWT tokens for authentication
✓ SQL injection prevented (parameterized queries)
✓ File upload restrictions (images only)
✓ Input validation on all forms

**Remember to:**
- Change the JWT_SECRET in production
- Use HTTPS in production
- Keep dependencies updated
- Backup your database regularly

## Need Help?

Check the README.md file for detailed information about:
- Technology stack
- API endpoints
- Database schema
- Deployment options

---

**Pool's Arena Club & Bar**
*Play • Eat • Drink • Relax*
