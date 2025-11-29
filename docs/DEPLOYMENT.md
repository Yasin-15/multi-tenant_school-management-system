# Deployment Guide

## Production Deployment

### Prerequisites

- Node.js v18+ installed on server
- MongoDB instance (local or cloud like MongoDB Atlas)
- Domain name (optional)
- SSL certificate (recommended)

## Backend Deployment

### Option 1: Traditional Server (VPS/Dedicated)

#### 1. Prepare the Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx (Reverse Proxy)
sudo apt install -y nginx
```

#### 2. Deploy Backend

```bash
# Clone repository
git clone <your-repo-url>
cd school-management-system/backend

# Install dependencies
npm install --production

# Create production .env file
nano .env
```

Production `.env`:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/school-management
JWT_SECRET=your-super-secure-secret-key-here
FRONTEND_URL=https://yourdomain.com
```

```bash
# Start with PM2
pm2 start server.js --name school-backend
pm2 save
pm2 startup
```

#### 3. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/school-backend
```

Add configuration:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/school-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

### Option 2: Cloud Platforms

#### Heroku

1. Install Heroku CLI
2. Create Heroku app:
```bash
heroku create school-backend
heroku addons:create mongolab
```

3. Set environment variables:
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
```

4. Deploy:
```bash
git push heroku main
```

#### Railway

1. Connect GitHub repository
2. Add MongoDB service
3. Set environment variables in dashboard
4. Deploy automatically on push

#### DigitalOcean App Platform

1. Connect repository
2. Configure build settings
3. Add MongoDB database
4. Set environment variables
5. Deploy

## Frontend Deployment

### Build Frontend

```bash
cd frontend
npm install
npm run build
```

### Option 1: Static Hosting (Netlify/Vercel)

#### Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
cd frontend
netlify deploy --prod
```

3. Configure environment variables in Netlify dashboard:
   - `VITE_API_URL=https://api.yourdomain.com/api`

#### Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd frontend
vercel --prod
```

3. Set environment variables in Vercel dashboard

### Option 2: Nginx Static Hosting

```bash
# Copy build files
sudo cp -r dist/* /var/www/school-frontend/

# Configure Nginx
sudo nano /etc/nginx/sites-available/school-frontend
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/school-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/school-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Database Setup

### MongoDB Atlas (Cloud)

1. Create account at mongodb.com/cloud/atlas
2. Create cluster
3. Create database user
4. Whitelist IP addresses
5. Get connection string
6. Update MONGODB_URI in backend .env

### Local MongoDB

```bash
# Install MongoDB
sudo apt install -y mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Create database and user
mongosh
use school-management
db.createUser({
  user: "schooladmin",
  pwd: "secure-password",
  roles: ["readWrite"]
})
```

## Environment Variables

### Backend (.env)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/school
JWT_SECRET=your-super-secure-secret-minimum-32-characters
JWT_EXPIRE=7d
FRONTEND_URL=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

### Frontend (.env)

```env
VITE_API_URL=https://api.yourdomain.com/api
```

## Security Checklist

- [ ] Use strong JWT_SECRET (minimum 32 characters)
- [ ] Enable HTTPS/SSL
- [ ] Set secure CORS origins
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Database authentication enabled
- [ ] Backup strategy in place
- [ ] Monitor logs for suspicious activity

## Monitoring

### PM2 Monitoring

```bash
# View logs
pm2 logs school-backend

# Monitor resources
pm2 monit

# View status
pm2 status
```

### Setup Log Rotation

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## Backup Strategy

### Database Backup

```bash
# Create backup script
nano /home/user/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/user/backups"
mongodump --uri="mongodb://localhost:27017/school-management" --out="$BACKUP_DIR/backup_$DATE"
# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
```

```bash
chmod +x /home/user/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /home/user/backup-db.sh
```

## Performance Optimization

### Backend

1. Enable compression (already configured)
2. Use Redis for caching (optional)
3. Optimize database queries with indexes
4. Use CDN for static assets

### Frontend

1. Enable gzip compression in Nginx
2. Use CDN for assets
3. Implement lazy loading
4. Optimize images

### Nginx Optimization

```nginx
# Enable gzip
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

# Enable caching
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;
```

## Scaling

### Horizontal Scaling

1. Use load balancer (Nginx/HAProxy)
2. Run multiple backend instances
3. Use Redis for session storage
4. Implement database replication

### Vertical Scaling

1. Increase server resources (CPU, RAM)
2. Optimize database indexes
3. Use database connection pooling

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
pm2 logs school-backend

# Check port availability
sudo netstat -tulpn | grep 5000

# Check environment variables
pm2 env 0
```

### Database Connection Issues

```bash
# Test MongoDB connection
mongosh "mongodb://localhost:27017/school-management"

# Check MongoDB status
sudo systemctl status mongodb
```

### Frontend Not Loading

```bash
# Check Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Verify build files
ls -la /var/www/school-frontend
```

## Maintenance

### Update Application

```bash
# Backend
cd backend
git pull
npm install
pm2 restart school-backend

# Frontend
cd frontend
git pull
npm install
npm run build
sudo cp -r dist/* /var/www/school-frontend/
```

### Database Maintenance

```bash
# Compact database
mongosh
use school-management
db.runCommand({ compact: 'collection_name' })

# Rebuild indexes
db.collection.reIndex()
```

## Support

For deployment issues:
- Check logs first
- Review error messages
- Consult documentation
- Contact support team
