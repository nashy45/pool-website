# Pool's Arena Club & Bar - Website & Management System

Complete full-stack website with customer ordering, table reservations, and comprehensive owner dashboard.

## Features

### Customer Website
- Browse menu (Meals, Snacks, Drinks)
- Place orders with cart system
- Reserve pool tables, dining tables, or event spaces
- QR code table ordering
- Multiple payment options (MTN MoMo, Orange Money, Pay at venue)
- Mobile-first responsive design

### Owner Dashboard
- Secure authentication
- Menu management (add, edit, hide, delete items)
- Order management with status tracking
- Reservation management
- Table/resource management
- QR code generation for tables
- Business details configuration
- Payment merchant code setup

## Technology Stack

- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Authentication**: JWT + bcryptjs
- **File Uploads**: Multer
- **QR Codes**: qrcode library
- **Frontend**: Vanilla HTML/CSS/JavaScript (no framework dependencies)

## Installation & Setup

### 1. Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
# Copy the example environment file
copy .env.example .env

# Edit .env and set:
# - JWT_SECRET to a secure random string
# - PUBLIC_URL to your domain (for QR codes)
# - Other business details as needed
```

### 4. Initialize Database
```bash
npm run init-db
```

This creates the SQLite database with all necessary tables.

### 5. Create Owner Account
```bash
npm run create-admin
```

Follow the prompts to create your owner/admin account.

### 6. Create Required Directories
```bash
mkdir uploads
mkdir qr-codes
```

### 7. Start the Server
```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

The server will start on port 3000 (or the PORT specified in .env).

## Accessing the Application

- **Customer Website**: http://localhost:3000
- **Owner Dashboard**: http://localhost:3000/admin

## Deployment

### Option 1: VPS or Cloud Server (Recommended)

1. Choose a hosting provider (DigitalOcean, Linode, AWS EC2, etc.)
2. Set up a Linux server (Ubuntu recommended)
3. Install Node.js and npm
4. Clone/upload your code
5. Set up a process manager (PM2):
   ```bash
   npm install -g pm2
   pm2 start server.js --name pools-arena
   pm2 startup
   pm2 save
   ```
6. Set up Nginx as reverse proxy with SSL:
   ```bash
   sudo apt install nginx certbot python3-certbot-nginx
   ```
7. Configure domain and obtain SSL certificate:
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

### Option 2: Platform as a Service (PaaS)

Deploy to platforms like:
- **Render** (Easy, free tier available)
- **Railway** (Simple deployment)
- **Heroku** (Well-documented)

Each platform has specific deployment instructions. Generally:
1. Connect your Git repository
2. Set environment variables
3. Deploy

### Important Production Steps

1. **Set Secure JWT_SECRET**: Generate a strong random string
2. **Set PUBLIC_URL**: Your actual domain (for QR codes)
3. **Use HTTPS**: Essential for security
4. **Backup Database**: Regularly backup the `pools-arena.db` file
5. **Set Merchant Codes**: Add payment codes via admin dashboard
6. **Add Menu Items**: Populate your actual menu
7. **Configure Tables**: Set up pool tables, dining tables

## QR Code Table Ordering

1. Go to Admin Dashboard → Tables
2. Add tables (pool tables, dining tables)
3. Generate QR codes for each table
4. Download and print QR codes
5. Place physical QR codes on tables

When customers scan the QR code:
- Opens the menu automatically
- Orders are tagged with the table number
- Staff can see which table placed the order

## Payment Setup

### MTN Mobile Money
1. Contact MTN to obtain your merchant code
2. Enter it in Admin Dashboard → Business Settings
3. Customers will see the merchant code to send payment

### Orange Money / Max it
1. Contact Orange to obtain your merchant code
2. Enter it in Admin Dashboard → Business Settings
3. Customers will see the merchant code to send payment

**Important**: This system shows payment instructions but does NOT automatically verify payments. Staff must:
1. Check their merchant account/dashboard
2. Confirm payment was received
3. Mark order as paid in the system

For automatic payment verification, you would need to integrate with MTN/Orange APIs (requires additional merchant agreements).

## Owner Tasks Before Launch

### Required:
- [ ] Create owner account
- [ ] Add real menu items with prices (FCFA)
- [ ] Upload menu item photos
- [ ] Set up tables (pool tables, dining tables)
- [ ] Generate and print QR codes
- [ ] Obtain and enter merchant codes
- [ ] Set actual opening hours (if different from 6:30 PM)
- [ ] Test ordering flow
- [ ] Test reservation system

### Recommended:
- [ ] Configure backup schedule
- [ ] Set up domain name
- [ ] Enable HTTPS/SSL
- [ ] Test on mobile devices
- [ ] Train staff on order management
- [ ] Establish payment verification workflow

## Database Backup

To backup your database:
```bash
# Copy the database file
copy pools-arena.db pools-arena-backup-2024-10-28.db
```

To restore from backup:
```bash
# Stop the server first, then:
copy pools-arena-backup-2024-10-28.db pools-arena.db
```

## Security Notes

- All admin routes require JWT authentication
- Passwords are hashed with bcryptjs
- Input validation on all forms
- SQL injection prevented (parameterized queries)
- File upload restrictions (images only, size limits)
- CORS configured

## Troubleshooting

### Database locked error
- Make sure only one instance of the server is running
- Check file permissions on the .db file

### Images not loading
- Verify `uploads` directory exists and is writable
- Check file size limits in server.js

### QR codes not working
- Ensure PUBLIC_URL is set correctly in .env
- QR codes must point to your actual domain

## Support

For technical issues, check:
1. Server logs (console output)
2. Browser console for frontend errors
3. Database integrity (`npm run init-db` to recreate tables)

## License

Proprietary - Pool's Arena Club & Bar
