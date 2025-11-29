# Deployment Information

## Live URLs

### Backend (Render)
- **URL**: https://multi-tenant-school-management-system.onrender.com
- **API Base**: https://multi-tenant-school-management-system.onrender.com/api
- **Health Check**: https://multi-tenant-school-management-system.onrender.com/health

### Frontend (Vercel)
- **URL**: https://myschoolcom-yaasiins-projects.vercel.app
- **Login**: https://myschoolcom-yaasiins-projects.vercel.app/login
- **Old URL**: https://multi-tenant-school-management-syst-sable.vercel.app (also supported)

## Super Admin Credentials

- **Email**: yasindev54@gmail.com
- **Password**: Yaasiin@2026
- **Role**: super_admin

## Important Notes for Render

**Environment Variables to Set in Render Dashboard:**

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://multi-tenant:Yaasiin2026@multi-tenant.wbizi9n.mongodb.net/?appName=Multi-tenant
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=yasindev54@gmail.com
EMAIL_PASSWORD=pmhi hgvl gntb lhnk
EMAIL_FROM=noreply@schoolmanagement.com
FRONTEND_URL=https://myschoolcom-yaasiins-projects.vercel.app
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Important Notes for Vercel

**Environment Variable to Set in Vercel Dashboard:**

```
VITE_API_URL=https://multi-tenant-school-management-system.onrender.com/api
```

## MongoDB Atlas

- **Connection String**: mongodb+srv://multi-tenant:Yaasiin2026@multi-tenant.wbizi9n.mongodb.net/?appName=Multi-tenant
- **Database Name**: Will be created automatically
- **Network Access**: Ensure 0.0.0.0/0 is whitelisted

## Next Steps

1. **Update Render Environment Variables**
   - Go to your Render service dashboard
   - Navigate to "Environment" tab
   - Add/update all variables listed above
   - Save (this will trigger a redeploy)

2. **Update Vercel Environment Variables**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add `VITE_API_URL` with the backend URL
   - Redeploy the frontend

3. **Verify MongoDB Atlas**
   - Ensure IP whitelist includes 0.0.0.0/0
   - Wait 1-2 minutes for changes to take effect

4. **Create Super Admin**
   - Once backend is running, go to Render Shell
   - Run: `node scripts/createSuperAdmin.js`

5. **Test the Application**
   - Visit: https://multi-tenant-school-management-syst-sable.vercel.app/login
   - Login with super admin credentials
   - Verify all features work

## Troubleshooting

### If Backend Shows "Application failed to respond"
- Check Render logs for errors
- Verify MongoDB connection string is correct
- Ensure MongoDB Atlas IP whitelist is configured

### If Frontend Can't Connect to Backend
- Check browser console for CORS errors
- Verify `FRONTEND_URL` in Render matches your Vercel URL exactly
- Verify `VITE_API_URL` in Vercel is set correctly

### Free Tier Limitations
- Render spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- This is normal for free tier

## Monitoring

- **Render Logs**: https://dashboard.render.com → Your Service → Logs
- **Vercel Logs**: https://vercel.com → Your Project → Deployments → View Function Logs
- **MongoDB Metrics**: MongoDB Atlas → Cluster → Metrics
