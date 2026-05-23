# 🏍️ Moto POS — Motorcycle Spare Parts Point of Sale System

Internal desktop/web POS and inventory management system for a motorcycle
spare parts shop in Pakistan. Built with Next.js 14, Express.js, MongoDB.

---

## 🗂️ Project Structure

moto-pos/
├── backend/          Express.js API server (TypeScript)
├── frontend/         Next.js 14 App Router (TypeScript)
├── scripts/          Backup scripts (bash + PowerShell)
├── backups/          Auto-created by backup script
├── ecosystem.config.js   PM2 process manager config
└── README.md

---

## ⚡ Quick Start (Development)

### Prerequisites
- Node.js 20 LTS
- MongoDB 7.x with Replica Set (see setup below)
- pnpm (`npm install -g pnpm`)

### 1. MongoDB Replica Set Setup (one time only)

Edit `C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg` (Windows):
```yaml
replication:
  replSetName: "rs0"
```
Restart MongoDB service, then initialize:
```bash
mongosh
rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "127.0.0.1:27017" }] })
```

### 2. Backend Setup
```bash
cd backend
pnpm install
cp .env.example .env
# Edit .env — add your JWT secrets (generate with command below)
node -e "const c=require('crypto'); console.log('JWT_SECRET='+c.randomBytes(64).toString('hex')); console.log('JWT_REFRESH_SECRET='+c.randomBytes(64).toString('hex'));"
pnpm run seed           # Creates admin + cashier users + brands + categories
pnpm run seed:products  # Seeds 20 test products
pnpm dev                # Starts on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
pnpm install
cp .env.example .env.local
# .env.local already has NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
pnpm dev                # Starts on http://localhost:3000
```

### 4. Default Login Credentials
| Role    | Username  | Password    |
|---------|-----------|-------------|
| Admin   | admin     | admin123    |
| Cashier | cashier   | cashier123  |

> ⚠️ Change these passwords after first login via /settings or MongoDB compass.

---

## 🚀 Production Deployment (Local — PM2)

### Build
```bash
# Build backend
cd backend
pnpm run build
# Output: backend/dist/

# Build frontend
cd ../frontend
pnpm run build
# Output: frontend/.next/standalone/
```

### Start with PM2
```bash
# Install PM2 globally (one time)
npm install -g pm2 pm2-windows-startup

# From moto-pos/ root:
mkdir -p logs
pm2 start ecosystem.config.js

# Save process list + auto-start on Windows boot
pm2 save
pm2-startup install
```

### PM2 Commands
```bash
pm2 status              # Check both processes are "online"
pm2 logs                # View live logs
pm2 restart all         # Restart both
pm2 stop all            # Stop both
pm2 monit               # Real-time dashboard
```

---

## 💾 Backup

### Manual Backup
```bash
# Linux/Mac
chmod +x scripts/backup.sh
./scripts/backup.sh

# Windows PowerShell
.\scripts\backup.ps1
```

### Schedule Nightly Backup (Windows Task Scheduler)
1. Open **Task Scheduler** → Create Basic Task
2. Name: `Moto POS Backup`
3. Trigger: **Daily at 11:00 PM**
4. Action: **Start a Program**
   - Program: `powershell.exe`
   - Arguments: `-File "C:\moto-pos\scripts\backup.ps1"`
5. Finish

Backups saved to `moto-pos/backups/` — keep last 30 days automatically.

---

## 🌐 API Endpoints Summary

| Module      | Base URL                        | Auth  |
|-------------|--------------------------------|-------|
| Auth        | `/api/v1/auth`                 | Public (login/refresh) |
| Products    | `/api/v1/products`             | JWT   |
| Brands      | `/api/v1/brands`               | JWT   |
| Categories  | `/api/v1/categories`           | JWT   |
| Sales       | `/api/v1/sales`                | JWT   |
| Purchases   | `/api/v1/purchases`            | Admin |
| Suppliers   | `/api/v1/suppliers`            | Admin |
| Returns     | `/api/v1/returns`              | JWT   |
| Inventory   | `/api/v1/inventory`            | Admin |
| Dashboard   | `/api/v1/dashboard`            | Admin |
| Reports     | `/api/v1/reports`              | Admin |
| Settings    | `/api/v1/settings`             | Admin |

Health check: `GET http://localhost:5000/health`

---

## 🎯 POS Keyboard Shortcuts

| Key     | Action                                        |
|---------|-----------------------------------------------|
| Auto    | Search input auto-focused on POS page load    |
| `Enter` | Add to cart (when exactly 1 result shown)     |
| `Esc`   | Clear search + re-focus input                 |
| `Tab`   | Move between quantity fields in cart          |
| Click # | Click quantity number in cart → editable input |

---

## 👥 User Roles

| Feature                    | Admin | Cashier |
|----------------------------|-------|---------|
| POS Screen                 | ✅    | ✅      |
| View Products              | ✅    | ✅      |
| Add/Edit Products          | ✅    | ❌      |
| Change Prices              | ✅    | ❌      |
| View Sales History         | ✅    | ❌      |
| Purchase Entry             | ✅    | ❌      |
| Inventory Overview         | ✅    | ❌      |
| Dashboard + Reports        | ✅    | ❌      |
| Settings                   | ✅    | ❌      |
| Process Returns            | ✅    | ✅      |

---

## 🛠️ Tech Stack

| Layer       | Technology              | Version |
|-------------|-------------------------|---------|
| Frontend    | Next.js (App Router)    | 14      |
| UI          | Shadcn/UI + Tailwind    | Latest  |
| State       | Zustand                 | 4.x     |
| Data Fetch  | TanStack Query          | 5.x     |
| Backend     | Node.js + Express       | 20 / 4.x|
| Database    | MongoDB + Mongoose      | 7.x / 8.x|
| Auth        | JWT (access 15m + refresh 7d) | —  |
| Validation  | Zod                     | 3.x     |
| Charts      | Recharts                | 2.x     |
| Process Mgr | PM2                     | Latest  |
| Print       | `window.print()` + CSS  | Native  |

---

## 📞 Support

System built for single-shop, single-computer operation.
- All data stays on-site (no internet required after setup)
- Backups go to `moto-pos/backups/` — copy to USB weekly
- MongoDB port: `27017` | Backend: `5000` | Frontend: `3000`