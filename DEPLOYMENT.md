# Deployment Guide

This guide covers deploying the School Management System with the backend on Render and frontend on Vercel or Netlify.

## Prerequisites

- GitHub account
- MongoDB Atlas account (free tier available)
- Render account (free tier available)
- Vercel or Netlify account (free tier available)

---

## Part 1: MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for a free account

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "Free" tier (M0)
   - Select your preferred cloud provider and region
   - Click "Create Cluster"

3. **Configure Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and password (save these!)
   - Set user privileges to "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - **IMPORTANT**: Add comment "Render deployment" 
   - Click "Confirm"
   - Wait 1-2 minutes for changes to take effect

5. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster.mongodb.net/`)
   - Replace `<password>` with your actual password
   - Add database name at the end: `mongodb+srv://username:password@cluster.mongodb.net/school_management_system`

---

## Part 2: Backend Deployment on Render

### Step 1: Prepare Your Repository

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Verify backend structure**
   - Ensure `backend/package.json` has a start script
   - Ensure `backend/server.js` exists

### Step 2: Deploy on Render

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - **Name**: `school-management-backend` (or your choice)
     - **Region**: Choose closest to your users
     - **Branch**: `main`
     - **Root Directory**: `backend`
     - **Runtime**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`
     - **Instance Type**: Free

3. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable" and add these:

   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/school_management_system
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_use_random_string
   JWT_EXPIRE=7d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=yasindev54@gmail.com
   EMAIL_PASSWORD=pmhi hgvl gntb lhnk
   EMAIL_FROM=noreply@schoolmanagement.com
   FRONTEND_URL=https://your-frontend-url.vercel.app
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

   **Important**: 
   - Replace `MONGODB_URI` with your actual MongoDB Atlas connection string
   - Generate a strong random string for `JWT_SECRET`
   - Update `FRONTEND_URL` after deploying frontend (you'll get this URL later)

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete (5-10 minutes)
   - Copy your backend URL (e.g., `https://school-management-backend.onrender.com`)

### Step 3: Create Super Admin

**1. **Run the script via Render Shell**
   - Go to your service dashboard on Render
   - Click "Shell" tab
   - Run: `node scripts/createSuperAdmin.js`
   - This will create the super admin with credentials:
     - Email: yasindev54@gmail.com
     - Password: Yaasiin@2026
**
---

## Part 3: Frontend Deployment

Choose either Vercel (recommended) or Netlify:

### Option A: Deploy on Vercel

1. **Prepare Frontend**
   - Update `frontend/.env`:
     ```
     VITE_API_URL=https://your-backend-url.onrender.com/api
     ```
   - Replace with your actual Render backend URL

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Sign up with GitHub
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Add Environment Variable:
     - Key: `VITE_API_URL`
     - Value: `https://your-backend-url.onrender.com/api`
   - Click "Deploy"

3. **Get Frontend URL**
   - After deployment, copy your Vercel URL (e.g., `https://school-management.vercel.app`)

### Option B: Deploy on Netlify

1. **Prepare Frontend**
   - Update `frontend/.env`:
     ```
     VITE_API_URL=https://your-backend-url.onrender.com/api
     ```

2. **Create netlify.toml**
   - Create `frontend/netlify.toml`:
     ```toml
     [build]
       base = "frontend"
       command = "npm run build"
       publish = "dist"

     [[redirects]]
       from = "/*"
       to = "/index.html"
       status = 200
     ```

3. **Deploy to Netlify**
   - Go to https://netlify.com
   - Sign up with GitHub
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select your repository
   - Configure:
     - **Base directory**: `frontend`
     - **Build command**: `npm run build`
     - **Publish directory**: `frontend/dist`
   - Add Environment Variable:
     - Key: `VITE_API_URL`
     - Value: `https://your-backend-url.onrender.com/api`
   - Click "Deploy"

4. **Get Frontend URL**
   - After deployment, copy your Netlify URL (e.g., `https://school-management.netlify.app`)

---

## Part 4: Final Configuration

### Update Backend CORS

1. **Go back to Render**
   - Open your backend service
   - Go to "Environment" tab
   - Update `FRONTEND_URL` with your actual frontend URL
   - Save changes (this will redeploy)

### Test Your Deployment

1. **Visit your frontend URL**
2. **Login with super admin credentials**:
   - Email: yasindev54@gmail.com
   - Password: Yaasiin@2026
3. **Verify all features work**

---

## Troubleshooting

### Backend Issues

**MongoDB Connection Failed**
- Verify MongoDB Atlas connection string is correct
- Check that IP whitelist includes 0.0.0.0/0
- Ensure database user has correct permissions

**Build Failed on Render**
- Check build logs in Render dashboard
- Verify `package.json` has all dependencies
- Ensure Node version compatibility

**CORS Errors**
- Verify `FRONTEND_URL` in backend environment variables matches your actual frontend URL
- Check that frontend is using correct backend URL

### Frontend Issues

**API Calls Failing**
- Verify `VITE_API_URL` is set correctly
- Check browser console for errors
- Ensure backend is running (visit backend URL directly)

**Build Failed**
- Check build logs
- Verify all dependencies are in `package.json`
- Test build locally: `npm run build`

**404 on Refresh**
- For Netlify: Ensure `netlify.toml` redirects are configured
- For Vercel: Should handle automatically

---

## Free Tier Limitations

### Render Free Tier
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month free

### MongoDB Atlas Free Tier
- 512 MB storage
- Shared RAM
- No backups

### Vercel Free Tier
- 100 GB bandwidth/month
- Unlimited deployments

### Netlify Free Tier
- 100 GB bandwidth/month
- 300 build minutes/month

---

## Production Recommendations

1. **Use Custom Domain**
   - Configure custom domain in Vercel/Netlify
   - Update backend CORS settings

2. **Enable HTTPS**
   - Both Render and Vercel/Netlify provide free SSL

3. **Set Up Monitoring**
   - Use Render's built-in monitoring
   - Consider services like Sentry for error tracking

4. **Regular Backups**
   - Upgrade MongoDB Atlas for automated backups
   - Or manually export data regularly

5. **Environment Security**
   - Never commit `.env` files
   - Use strong, unique passwords
   - Rotate JWT secrets periodically

6. **Performance**
   - Consider upgrading Render to paid tier for always-on service
   - Use CDN for static assets
   - Implement caching strategies

---

## Support

For issues:
- Check Render logs: Service Dashboard → Logs
- Check Vercel/Netlify logs: Deployment → Function Logs
- Review MongoDB Atlas metrics: Cluster → Metrics

## Next Steps

After successful deployment:
1. Create tenants (schools)
2. Add admin users for each tenant
3. Configure school settings
4. Start adding students and teachers
