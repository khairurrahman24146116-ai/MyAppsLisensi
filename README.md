# Dapatkan Lisensi

Platform permintaan lisensi dengan web admin dashboard, user interface, dan mobile app.

## Struktur Monorepo

```
/web      → Vue 3 + Vite + Tailwind CSS (frontend, deploy ke Vercel)
/api      → Vercel Functions (Node.js ESM, backend)
/mobile   → React Native (Expo) + NativeWind (mobile app)
```

## Setup Cepat

### 1. Buat Database Turso

```bash
# Install turso CLI
npm install -g @turso/cli

# Login
turso auth login

# Buat database
turso db create dapatkan-lisensi

# Dapatkan URL dan token
turso db show dapatkan-lisensi --api-key
```

### 2. Jalankan Schema

```bash
# Copy konten schema.sql, paste di Turso dashboard, atau:
turso db shell dapatkan-lisensi < schema.sql

# Seed data contoh
turso db shell dapatkan-lisensi < seed.sql
```

### 3. Environment Variables

Copy `.env.example` ke `.env`:

```bash
cp .env.example .env
```

Edit `.env` dengan Turso URL, token, password admin, dan JWT secret:

```env
TURSO_DATABASE_URL=libsql://your-db-xxx.turso.io
TURSO_AUTH_TOKEN=your-token-here
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret-key
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Development

**Web:**
```bash
npm run dev:web
# Buka http://localhost:5173
```

**Mobile (Expo):**
```bash
npm run dev:mobile
# Scan QR code dengan Expo Go app (iOS/Android)
```

## Deployment

### Deploy ke Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables di Vercel dashboard:
# TURSO_DATABASE_URL
# TURSO_AUTH_TOKEN
# ADMIN_PASSWORD
# JWT_SECRET
```

atau manual di [vercel.com](https://vercel.com):
1. Push ke GitHub
2. Import project
3. Set env vars
4. Deploy

Vercel otomatis build:
- `/web` → static site (frontend)
- `/api/**/*.js` → serverless functions

### Deploy Mobile

Build Expo app untuk iOS/Android:

```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

## Endpoints API

Semua response: `{ message: "...", data: {...} }` atau error JSON.

### User Endpoints

**POST /api/lisensi**
- Request: `{ order_number: "ORD-2024-001" }`
- Response: `{ request_id, status, license_code, message }`

**GET /api/lisensi/status?order_number=...**
- Response: `{ request_id, status, license_code, created_at, updated_at }`

### Admin Endpoints

**POST /api/admin/login**
- Request: `{ password: "..." }`
- Response: `{ token: "jwt..." }`

**GET /api/admin/requests**
- Header: `Authorization: Bearer {token}`
- Response: `{ requests: [...], pending_count: 3 }`

**POST /api/admin/approve**
- Header: `Authorization: Bearer {token}`
- Request: `{ request_id: "..." }`
- Response: `{ message, license_code: "XXXX-XXXX-XXXX" }`

**POST /api/admin/reject**
- Header: `Authorization: Bearer {token}`
- Request: `{ request_id: "..." }`
- Response: `{ message }`

**POST /api/admin/mark-seen**
- Header: `Authorization: Bearer {token}`
- Request: `{ request_id: "..." }`
- Response: `{ message }`

## Features

### Web (Vue 3)

**User Page:**
- Input nomor pesanan
- Tombol "Dapatkan Lisensi"
- Tampil status + kode lisensi (jika approved)
- Tombol salin kode
- Loading state & error handling

**Admin Page:**
- Login dengan password
- Dashboard tabel request
- Filter status (semua/pending/approved/rejected)
- Tombol approve/reject
- Badge "BARU" untuk request belum dilihat
- Badge jumlah pending di header & tab title
- Auto-refresh polling tiap 10 detik
- Toast + sound notification saat request baru masuk

### Mobile (React Native)

- Input nomor pesanan
- Lihat status & kode lisensi
- Tombol salin
- Tombol "Cek Status" untuk refresh
- Responsive mobile layout

### API

- Input validation (parameterized queries)
- Proper error handling (400/404/500)
- CORS enabled untuk web & mobile
- JWT auth untuk admin endpoints
- Random license code generator

## Database Schema

**orders**
- `id` (PRIMARY KEY)
- `order_number` (UNIQUE)
- `customer_name`
- `email`
- `created_at`

**license_requests**
- `id` (PRIMARY KEY)
- `order_number` (UNIQUE, FOREIGN KEY)
- `license_code` (nullable, set saat approved)
- `status` ('pending' | 'approved' | 'rejected')
- `is_seen` (0 | 1, default 0)
- `created_at`
- `updated_at`

## Local Testing

### Test API

```bash
# Request lisensi
curl -X POST http://localhost:3000/api/lisensi \
  -H "Content-Type: application/json" \
  -d '{"order_number": "ORD-2024-001"}'

# Admin login
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password": "your-password"}'

# Get requests (pakai token dari login)
curl http://localhost:3000/api/admin/requests \
  -H "Authorization: Bearer {token}"
```

### Test Web

Buka http://localhost:5173 → User page atau klik "Admin" → login.

### Test Mobile

```bash
npx expo start
# Scan QR code
```

## Security Notes

- JWT tokens tidak expire (untuk dev). Implementasi expiry untuk production.
- Parameterized queries melindungi dari SQL injection.
- CORS aktif untuk semua origin (ubah untuk production).
- ADMIN_PASSWORD di env, bukan hardcoded.
- Pastikan `.env` tidak di-commit (sudah di .gitignore).

## Production Checklist

- [ ] Set strong ADMIN_PASSWORD
- [ ] Generate random JWT_SECRET (minimal 32 karakter)
- [ ] Set CORS origins hanya ke domain Anda
- [ ] Implement JWT expiry & refresh
- [ ] Enable HTTPS di Vercel (otomatis)
- [ ] Monitor errors via Vercel logs
- [ ] Backup database Turso secara berkala

## Troubleshooting

**API error 404 "Pesanan tidak ditemukan":**
- Pastikan order_number di database (cek seed.sql)

**Admin login gagal:**
- Pastikan ADMIN_PASSWORD di env Vercel sesuai

**CORS error:**
- Pastikan API_URL di web & mobile benar
- Check browser console untuk URL yang dipanggil

**Database connection error:**
- Verifikasi TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN
- Pastikan database sudah di-create

## Scripts

```bash
# Development
npm run dev:web        # Vue 3 dev server
npm run dev:mobile     # Expo dev server

# Build
npm run build:web      # Build Vue 3 untuk production
npm run build:api      # Validasi API (Vercel build otomatis)
```

---

**Deploy sekarang:** Push ke GitHub → Connect ke Vercel → Set env vars → Deploy ✓
