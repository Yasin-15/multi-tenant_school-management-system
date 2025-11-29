# School Management System - Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn package manager

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/school-management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@schoolms.com
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

### 4. Create Initial Tenant

```bash
npm run create-tenant
```

Follow the prompts to create your first school tenant.

### 5. Seed Sample Data (Optional)

```bash
npm run seed
```

### 6. Start Backend Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The backend server will start on `http://localhost:5000`

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Frontend Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

The production build will be created in the `dist` directory.

## Default Login Credentials

After seeding data, you can use these credentials:

### Admin
- Email: admin@school.com
- Password: admin123

### Teacher
- Email: teacher@school.com
- Password: teacher123

### Student
- Email: student@school.com
- Password: student123

## Troubleshooting

### MongoDB Connection Issues

1. Verify MongoDB is running: `mongosh`
2. Check the connection string in `.env`
3. Ensure MongoDB is accessible on the specified port

### Port Already in Use

If port 5000 or 5173 is already in use:

1. Change the PORT in backend `.env`
2. Update VITE_API_URL in frontend `.env` accordingly

### CORS Errors

Ensure the FRONTEND_URL in backend `.env` matches your frontend URL.

## Next Steps

1. Read the [User Guide](./USER_GUIDE.md) for feature documentation
2. Check the [API Documentation](./API_DOCS.md) for API endpoints
3. Customize the system for your school's needs

## Support

For issues or questions, please create an issue in the repository.
