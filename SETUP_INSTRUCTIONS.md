# Quick Setup Instructions

## 1. Supabase Setup (5 minutes)

### Create Project
1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Name: `medilink`, choose region, set password
4. Wait for project to initialize

### Get Credentials
1. Go to Settings → API
2. Copy **Project URL** (SUPABASE_URL)
3. Copy **anon/public key** (SUPABASE_KEY)

### Create Tables
1. Go to SQL Editor
2. Copy ALL code from `backend/sql/schema.sql`
3. Paste and click "Run"

### Create Storage Buckets
1. Go to Storage
2. Create bucket: `photos` (public, 5MB, images only)
3. Create bucket: `reports` (public, 10MB, PDFs and images)

## 2. Backend Configuration (2 minutes)

### Create .env File
In `backend` folder, create `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
JWT_SECRET=any-random-secret-string-here
PORT=5000
```

### Install & Run
```bash
cd backend
npm install
npm run dev
```

Server should start on http://localhost:5000

## 3. Test Connection

Test by registering a user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123","role":"admin"}'
```

If you get a success response, you're all set! ✅

---

**For detailed instructions, see `SUPABASE_SETUP_GUIDE.md` in the root folder.**

