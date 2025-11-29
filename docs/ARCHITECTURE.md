# School Management System - Architecture

## System Overview

The School Management System is built using a modern three-tier architecture:

1. **Presentation Layer** - React-based frontend
2. **Application Layer** - Node.js/Express backend
3. **Data Layer** - MongoDB database

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │   Mobile     │  │   Tablet     │      │
│  │   (React)    │  │   (Future)   │  │   (Future)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/WSS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Load Balancer (Nginx)                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│  ┌─────────────┬──────────┴──────────┬─────────────┐       │
│  │   Node.js   │     Node.js         │   Node.js   │       │
│  │   Server 1  │     Server 2        │   Server N  │       │
│  └─────────────┴─────────────────────┴─────────────┘       │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Socket.IO Server                        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ MongoDB Protocol
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   MongoDB    │  │   MongoDB    │  │   MongoDB    │      │
│  │   Primary    │  │  Secondary   │  │  Secondary   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              File Storage (S3/Local)                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Technology Stack
- **React 19** - UI library
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **Tailwind CSS** - Styling
- **Vite** - Build tool

### Directory Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Base UI components
│   │   ├── Sidebar.jsx
│   │   └── ...
│   ├── pages/           # Page components
│   │   ├── admin/       # Admin pages
│   │   ├── teacher/     # Teacher pages
│   │   └── student/     # Student pages
│   ├── features/        # Redux slices
│   │   └── auth/
│   ├── services/        # API services
│   │   ├── api.js       # Axios instance
│   │   ├── authService.js
│   │   └── ...
│   ├── layouts/         # Layout components
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── store/           # Redux store
│   ├── App.jsx          # Root component
│   └── main.jsx         # Entry point
└── public/              # Static assets
```

### State Management

```
Redux Store
├── auth
│   ├── user
│   ├── token
│   ├── isAuthenticated
│   └── loading
└── (future slices)
    ├── students
    ├── teachers
    └── notifications
```

### Component Hierarchy

```
App
├── Router
│   ├── Login
│   └── DashboardLayout
│       ├── Sidebar
│       └── Outlet
│           ├── Dashboard
│           ├── Students
│           ├── Teachers
│           ├── Classes
│           ├── Attendance
│           ├── Grades
│           └── Fees
```

## Backend Architecture

### Technology Stack
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Socket.IO** - Real-time communication
- **Bcrypt** - Password hashing

### Directory Structure

```
backend/
├── controllers/         # Request handlers
│   ├── authController.js
│   ├── studentController.js
│   └── ...
├── models/             # Mongoose models
│   ├── User.js
│   ├── Student.js
│   └── ...
├── routes/             # API routes
│   ├── authRoutes.js
│   ├── studentRoutes.js
│   └── ...
├── middleware/         # Custom middleware
│   ├── auth.js         # Authentication
│   └── tenant.js       # Multi-tenancy
├── scripts/            # Utility scripts
│   ├── seedData.js
│   └── createTenant.js
├── utils/              # Utility functions
└── server.js           # Entry point
```

### API Architecture

#### RESTful API Design

```
/api
├── /auth
│   ├── POST /login
│   ├── POST /register
│   └── GET /me
├── /students
│   ├── GET /
│   ├── POST /
│   ├── GET /:id
│   ├── PUT /:id
│   └── DELETE /:id
├── /teachers
├── /classes
├── /attendance
├── /grades
├── /fees
└── /notifications
```

#### Middleware Chain

```
Request
  ↓
CORS Middleware
  ↓
Body Parser
  ↓
Helmet (Security)
  ↓
Rate Limiter
  ↓
Tenant Middleware
  ↓
Authentication Middleware
  ↓
Authorization Middleware
  ↓
Route Handler
  ↓
Error Handler
  ↓
Response
```

### Database Architecture

#### Multi-Tenancy Strategy

**Approach:** Database-per-tenant with shared schema

```
MongoDB
├── Tenant Collection (Shared)
│   ├── tenant_id
│   ├── subdomain
│   └── settings
└── All Other Collections
    └── tenant field (indexed)
```

#### Data Models

```
User
├── _id
├── tenant (ref: Tenant)
├── email
├── password (hashed)
├── role
├── firstName
├── lastName
└── timestamps

Student
├── _id
├── tenant (ref: Tenant)
├── user (ref: User)
├── studentId
├── class (ref: Class)
├── guardianInfo
└── timestamps

Teacher
├── _id
├── tenant (ref: Tenant)
├── user (ref: User)
├── employeeId
├── subjects (ref: Subject)
└── timestamps

Class
├── _id
├── tenant (ref: Tenant)
├── name
├── grade
├── section
├── classTeacher (ref: Teacher)
└── timestamps

Attendance
├── _id
├── tenant (ref: Tenant)
├── student (ref: Student)
├── class (ref: Class)
├── date
├── status
└── timestamps

Grade
├── _id
├── tenant (ref: Tenant)
├── student (ref: Student)
├── subject (ref: Subject)
├── examType
├── marks
└── timestamps
```

#### Indexes

```javascript
// User
{ tenant: 1, email: 1 } - unique
{ tenant: 1, role: 1 }

// Student
{ tenant: 1, studentId: 1 } - unique
{ tenant: 1, class: 1 }
{ tenant: 1, status: 1 }

// Attendance
{ tenant: 1, student: 1, date: 1 }
{ tenant: 1, class: 1, date: 1 }

// Grade
{ tenant: 1, student: 1, subject: 1 }
{ tenant: 1, class: 1, examType: 1 }
```

## Security Architecture

### Authentication Flow

```
1. User submits credentials
   ↓
2. Backend validates credentials
   ↓
3. Generate JWT token
   ↓
4. Return token to client
   ↓
5. Client stores token (localStorage)
   ↓
6. Client includes token in subsequent requests
   ↓
7. Backend validates token
   ↓
8. Process request
```

### Authorization Levels

```
Super Admin
  ↓
Admin (Tenant)
  ↓
Teacher
  ↓
Student
  ↓
Parent (Future)
```

### Security Measures

1. **Authentication**
   - JWT tokens with expiration
   - Secure password hashing (bcrypt)
   - Token refresh mechanism

2. **Authorization**
   - Role-based access control
   - Resource-level permissions
   - Tenant isolation

3. **Data Protection**
   - Input validation
   - SQL injection prevention
   - XSS protection
   - CSRF tokens
   - Rate limiting

4. **Network Security**
   - HTTPS/TLS encryption
   - CORS configuration
   - Security headers (Helmet)

## Real-Time Architecture

### Socket.IO Implementation

```
Client                    Server
  │                         │
  ├─ connect ──────────────>│
  │                         │
  │<──── connection ────────┤
  │                         │
  ├─ join-tenant ──────────>│
  │                         │
  ├─ join-user ────────────>│
  │                         │
  │<──── notification ──────┤
  │                         │
  │<──── attendance-update ─┤
  │                         │
  │<──── grade-added ───────┤
```

### Event Types

- **notification** - New notifications
- **attendance-updated** - Attendance changes
- **grade-added** - New grades posted
- **announcement** - System announcements

## Scalability Considerations

### Horizontal Scaling

1. **Stateless Backend**
   - No session storage on server
   - JWT for authentication
   - Redis for shared cache (future)

2. **Load Balancing**
   - Nginx reverse proxy
   - Round-robin distribution
   - Health checks

3. **Database Scaling**
   - MongoDB replica sets
   - Read replicas
   - Sharding (future)

### Vertical Scaling

1. **Server Resources**
   - CPU optimization
   - Memory management
   - Connection pooling

2. **Database Optimization**
   - Index optimization
   - Query optimization
   - Aggregation pipelines

## Deployment Architecture

### Production Setup

```
Internet
  ↓
CDN (Static Assets)
  ↓
Load Balancer
  ↓
┌─────────────┬─────────────┐
│   App       │   App       │
│  Server 1   │  Server 2   │
└─────────────┴─────────────┘
  ↓
MongoDB Cluster
  ↓
Backup Storage
```

### CI/CD Pipeline

```
Code Push
  ↓
GitHub Actions
  ↓
Run Tests
  ↓
Build Application
  ↓
Deploy to Staging
  ↓
Run E2E Tests
  ↓
Deploy to Production
  ↓
Health Check
```

## Monitoring & Logging

### Monitoring Stack

- **Application Monitoring** - PM2
- **Error Tracking** - Sentry (future)
- **Performance Monitoring** - New Relic (future)
- **Uptime Monitoring** - Pingdom (future)

### Logging Strategy

```
Application Logs
├── Error Logs
├── Access Logs
├── Audit Logs
└── Performance Logs
```

## Backup Strategy

1. **Database Backups**
   - Daily automated backups
   - Point-in-time recovery
   - 30-day retention

2. **File Backups**
   - Document storage backups
   - Image backups
   - Configuration backups

3. **Disaster Recovery**
   - Backup verification
   - Recovery testing
   - Failover procedures

## Performance Optimization

### Frontend
- Code splitting
- Lazy loading
- Image optimization
- Caching strategies
- Bundle size optimization

### Backend
- Database query optimization
- Connection pooling
- Response compression
- Caching (Redis)
- API rate limiting

### Database
- Proper indexing
- Query optimization
- Aggregation pipelines
- Connection pooling
- Read replicas

## Future Architecture Enhancements

1. **Microservices**
   - Service decomposition
   - API gateway
   - Service mesh

2. **Event-Driven Architecture**
   - Message queues (RabbitMQ/Kafka)
   - Event sourcing
   - CQRS pattern

3. **Containerization**
   - Docker containers
   - Kubernetes orchestration
   - Auto-scaling

4. **Serverless Components**
   - Lambda functions
   - Serverless APIs
   - Edge computing
