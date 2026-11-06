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
- **Database**: SQLite (sqlite3)
- **Authentication**: JWT + bcryptjs
- **File Uploads**: Multer
- **QR Codes**: qrcode library
- **Frontend**: Vanilla HTML/CSS/JavaScript (no framework dependencies)

## Running the App

The server sets itself up on every start: it creates the database schema, seeds the bar menu and the default tables (only into empty tables), and creates the owner account from `ADMIN_USERNAME` / `ADMIN_PASSWORD` if no staff account exists yet. There are no manual setup steps.

### Production (EC2 / any Linux server) — one command
```bash
cp .env.example .env      # set JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD
docker compose up -d --build
```
This starts the Node app and Caddy (reverse proxy with automatic HTTPS for poolsarena.com). See **[DEPLOY.md](DEPLOY.md)** for the full EC2 runbook (DNS, security group, updates, backups).

### Local development
```bash
npm install
npm start            # or: npm run dev  (auto-reload)
```
Without a `.env` it runs on http://localhost:3000 with development defaults (data stored in the project folder). Set `ADMIN_USERNAME`/`ADMIN_PASSWORD` in `.env`, or run `npm run create-admin`, to get a staff login.

### Useful scripts
| Command | Purpose |
|---|---|
| `npm start` | Bootstrap DB + start server |
| `npm run bootstrap` | Bootstrap DB only (idempotent) |
| `npm run create-admin` | Interactively add another owner account |

## Accessing the Application

- **Customer Website**: `/`
- **Staff Dashboard**: `/staff/login`

### After first deploy
1. Log in at `/staff/login` and change the owner password
2. Set MTN MoMo / Orange Money merchant codes in Settings
3. Review menu prices and tables, then generate and print the table QR codes
4. Back up data regularly (see DEPLOY.md)


## QR Code Table Ordering

1. Go to Staff Dashboard → Tables
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
