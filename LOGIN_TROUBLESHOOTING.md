# Login Troubleshooting Guide

## Issues Fixed

1. ✅ **Role selector was hidden** - Now visible in the login form
2. ✅ **Super Admin credentials displayed** - Visible at the bottom of the login form

## How to Login

### Super Admin Login
1. Select **"Super Admin"** from the role dropdown
2. Enter email: `yasindev54@gmail.com`
3. Enter password: `Yaasiin@2026`
4. Click "Sign In"

### Demo Users (if seeded)
First, you need to seed the database with demo data:
```bash
cd backend
npm run seed
```

Then you can login with:

**Admin:**
- Role: Admin
- Email: `admin@demo.com`
- Password: `admin123`

**Teacher:**
- Role: Teacher
- Email: `teacher1@demo.com` (or teacher2, teacher3, etc.)
- Password: `teacher123`

**Student:**
- Role: Student
- Email: `student1@demo.com` (or student2, student3, etc.)
- Password: `student123`

**Note:** The system will automatically find your tenant based on your email.

## Common Issues & Solutions

### Issue 1: "Tenant not found or inactive"
**Solution:** 
- For Super Admin: Make sure you select "Super Admin" role
- For regular users: Your tenant might not be set up yet. Contact the super admin.

### Issue 2: "Invalid credentials"
**Solution:**
- Double-check your email and password
- Make sure you selected the correct role
- Verify your account is active

### Issue 3: Backend not responding
**Solution:**
- Check if backend is running: https://multi-tenant-school-management-system.onrender.com/health
- If running locally, make sure backend is started: `cd backend && npm run dev`

### Issue 4: CORS errors in browser console
**Solution:**
- The backend is configured to accept requests from your frontend URL
- If you see CORS errors, check that `FRONTEND_URL` in backend/.env matches your deployment URL

## Testing the Backend

You can test if the backend is working by visiting:
```
https://multi-tenant-school-management-system.onrender.com/health
```

You should see:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "..."
}
```

## Setting Up Demo Data

### Option 1: Seed Demo Data (Recommended for Testing)
This creates a demo tenant with admin, teachers, and students:
```bash
cd backend
npm run seed
```

This will create:
- 1 Demo tenant (subdomain: "demo")
- 1 Admin user
- 5 Teachers
- 20 Students

### Option 2: Create Your Own Tenant
```bash
cd backend
npm run create-tenant
```

### Check Existing Users
To see what users exist in your database:
```bash
cd backend
npm run check-users
```

### Create Users via UI
Once logged in as Super Admin, you can create:
- Tenants (schools)
- Admins (for each tenant)
- Teachers (via Admin panel)
- Students (via Admin panel)

## Environment Variables

Make sure these are set correctly:

**Backend (.env):**
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `FRONTEND_URL` - Your frontend deployment URL

**Frontend (.env):**
- `VITE_API_URL` - Your backend API URL

## Next Steps

1. Try logging in with the Super Admin credentials
2. If successful, create a tenant for your school
3. Create admin users for that tenant
4. Admins can then create teachers and students
