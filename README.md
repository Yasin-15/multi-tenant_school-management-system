# 🎓 School Management System

A comprehensive, multi-tenant school management system built with the MERN stack (MongoDB, Express.js, React, Node.js). This system provides complete solutions for managing students, teachers, classes, attendance, grades, fees, payroll, timetables, and more.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [API Documentation](#api-documentation)
- [Features in Detail](#features-in-detail)
- [User Roles & Permissions](#user-roles--permissions)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Development](#development)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)

## 🌟 Overview

The School Management System is a production-ready, multi-tenant application designed to streamline educational institution operations. It supports multiple schools (tenants) with complete data isolation, role-based access control, and real-time updates.

### Key Highlights

- 🏢 **Multi-Tenancy**: Support multiple schools with isolated data
- 🔐 **Secure Authentication**: JWT-based authentication with role-based access control
- 📊 **Comprehensive Dashboard**: Real-time analytics and insights
- 📱 **Responsive Design**: Fully optimized for mobile, tablet, and desktop - [View Responsive Design Guide](./RESPONSIVE_DESIGN.md)
- 🌐 **Internationalization**: Multi-language support for notifications
- ⚡ **Real-time Updates**: Socket.IO integration for instant notifications
- 📄 **Report Generation**: PDF and Excel export capabilities
- 💰 **Financial Management**: Complete fee and payroll management

## ✨ Features

### 👨‍💼 Admin Features

- **Dashboard Analytics**
  - Overview of students, teachers, classes, and revenue
  - Visual charts and statistics
  - Quick access to important metrics
  
- **Student Management**
  - Add, edit, delete, and manage student records
  - Bulk import/export functionality
  - Student profile management with photos
  - Parent/guardian information
  - Academic history tracking
  
- **Teacher Management**
  - Manage teacher profiles and qualifications
  - Subject and class assignments
  - Performance tracking
  - Salary and payroll management
  
- **Class & Section Management**
  - Create and manage classes and sections
  - Assign class teachers
  - Set capacity limits
  - Manage academic years
  
- **Subject Management**
  - Create subjects with codes
  - Assign subjects to classes
  - Link teachers to subjects
  - Track subject-wise performance
  
- **Attendance Tracking**
  - Mark daily attendance
  - View attendance reports
  - Track attendance percentages
  - Generate attendance certificates
  
- **Grade Management**
  - Record monthly exam grades
  - Track chapter-wise assessments
  - Automatic grade calculation
  - Performance analytics
  - Subject-wise grade reports
  
- **Fee Management**
  - Create flexible fee structures
  - Track fee payments
  - Generate invoices
  - Payment history
  - Sibling discounts
  - Late fee calculations
  - Multiple payment methods
  
- **Payroll Management**
  - Generate monthly payrolls
  - Track salary history
  - Manage deductions and bonuses
  - Generate payslips
  - Export payroll reports
  
- **Timetable Management**
  - Create class timetables
  - Conflict detection
  - Teacher schedule management
  - Student weekly schedules
  - Period allocation
  
- **Exam Management**
  - Create and schedule exams
  - Online exam system
  - Automatic grading
  - Result publication
  
- **Notifications**
  - Send announcements to specific groups
  - Multi-language support
  - Email and in-app notifications
  - Scheduled notifications
  
- **Reports & Analytics**
  - Student performance reports
  - Class analytics
  - Subject-wise reports
  - Attendance reports
  - Fee collection reports
  - Export to PDF and Excel

### 👨‍🏫 Teacher Features

- **Personal Dashboard**
  - View assigned classes and students
  - Quick access to daily tasks
  - Upcoming exams and deadlines
  
- **Class Management**
  - View class details and rosters
  - Student performance tracking
  
- **Attendance**
  - Mark daily attendance for classes
  - View attendance history
  - Generate attendance reports
  
- **Grade Management**
  - Enter monthly and chapter-wise grades
  - Bulk grade entry
  - Performance analytics
  - Export grade sheets
  
- **My Schedule**
  - View weekly timetable
  - Track teaching hours
  - Class schedule overview
  
- **Subjects**
  - Manage assigned subjects
  - Subject-specific resources
  
- **Payslips**
  - View and download payslips
  - Salary history
  
- **Communication**
  - Send messages to students/parents
  - View notification history

### 👨‍🎓 Student Features

- **Personal Dashboard**
  - Overview of attendance, grades, and fees
  - Upcoming exams and assignments
  - Recent notifications
  
- **My Attendance**
  - View attendance records
  - Month-wise attendance percentage
  - Attendance history
  
- **My Grades**
  - View exam results
  - Subject-wise performance
  - Monthly and chapter-wise grades
  - Progress tracking
  
- **My Fees**
  - View fee structure
  - Payment history
  - Pending payments
  - Download receipts
  
- **My Schedule**
  - Weekly timetable
  - Class schedule
  - Exam schedule
  
- **My Reports**
  - Download report cards (PDF/Excel)
  - Performance analysis
  - Attendance certificates
  
- **Exams**
  - View upcoming exams
  - Take online exams
  - View results
  
- **Notifications**
  - Receive announcements
  - Multi-language support

### 🔧 Super Admin Features

- **Tenant Management**
  - Create and manage schools (tenants)
  - Activate/deactivate tenants
  - Tenant configurations
  
- **System Administration**
  - Manage super admins
  - System-wide settings
  - Monitor system health
  
- **Analytics**
  - Cross-tenant analytics
  - Usage statistics
  - Revenue reports

## 🛠 Technology Stack

### Backend

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web application framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | ODM for MongoDB |
| **JWT** | Authentication tokens |
| **Socket.IO** | Real-time bidirectional communication |
| **Bcrypt.js** | Password hashing |
| **Express Validator** | Request validation |
| **PDFKit** | PDF generation |
| **ExcelJS** | Excel file generation |
| **Nodemailer** | Email sending |
| **Helmet** | Security headers |
| **Morgan** | HTTP request logger |
| **Compression** | Response compression |
| **Rate Limiter** | API rate limiting |
| **Node Cron** | Scheduled tasks |
| **Multer** | File upload handling |

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 19** | UI library |
| **Vite** | Build tool and dev server |
| **Redux Toolkit** | State management |
| **React Router** | Client-side routing |
| **Axios** | HTTP client |
| **Tailwind CSS** | Utility-first CSS framework |
| **Lucide React** | Icon library |
| **React Icons** | Additional icons |
| **Recharts** | Data visualization |
| **React Hot Toast** | Toast notifications |
| **i18next** | Internationalization |
| **Socket.IO Client** | Real-time updates |
| **Clsx** | Conditional classNames |

## 📁 Project Structure

```
school-management-system/
├── backend/
│   ├── controllers/           # Request handlers
│   │   ├── attendanceController.js
│   │   ├── authController.js
│   │   ├── classController.js
│   │   ├── examController.js
│   │   ├── feePaymentController.js
│   │   ├── feeStructureController.js
│   │   ├── gradeController.js
│   │   ├── notificationController.js
│   │   ├── payrollController.js
│   │   ├── reportController.js
│   │   ├── settingsController.js
│   │   ├── studentController.js
│   │   ├── subjectController.js
│   │   ├── superAdminController.js
│   │   ├── teacherController.js
│   │   ├── tenantController.js
│   │   └── timetableController.js
│   │
│   ├── models/               # Database models
│   │   ├── Attendance.js
│   │   ├── Class.js
│   │   ├── CommunicationLog.js
│   │   ├── Exam.js
│   │   ├── ExamResult.js
│   │   ├── FeePayment.js
│   │   ├── FeeStructure.js
│   │   ├── Grade.js
│   │   ├── Notification.js
│   │   ├── Payroll.js
│   │   ├── Student.js
│   │   ├── Subject.js
│   │   ├── Teacher.js
│   │   ├── Tenant.js
│   │   ├── User.js
│   │   └── UserSettings.js
│   │
│   ├── routes/               # API routes
│   │   ├── attendanceRoutes.js
│   │   ├── authRoutes.js
│   │   ├── classRoutes.js
│   │   ├── examRoutes.js
│   │   ├── feePaymentRoutes.js
│   │   ├── feeStructureRoutes.js
│   │   ├── gradeRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── payrollRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── settings.js
│   │   ├── studentRoutes.js
│   │   ├── subjectRoutes.js
│   │   ├── superAdminRoutes.js
│   │   ├── teacherRoutes.js
│   │   ├── tenantRoutes.js
│   │   └── timetableRoutes.js
│   │
│   ├── middleware/           # Custom middleware
│   │   ├── auth.js          # Authentication & authorization
│   │   └── tenant.js        # Tenant identification
│   │
│   ├── scripts/             # Utility scripts
│   │   ├── createSuperAdmin.js
│   │   ├── createTenant.js
│   │   └── seedData.js
│   │
│   ├── services/            # Business logic services
│   │   └── emailService.js
│   │
│   ├── utils/               # Utility functions
│   │
│   ├── .env.example         # Environment variables template
│   ├── server.js            # Application entry point
│   └── package.json         # Dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── AttendanceCalendar.jsx
│   │   │   ├── ChartComponents.jsx
│   │   │   ├── ClassCard.jsx
│   │   │   ├── ExportButton.jsx
│   │   │   ├── FeeInvoice.jsx
│   │   │   ├── GradeChart.jsx
│   │   │   ├── GradeForm.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── PaymentModal.jsx
│   │   │   ├── ReportDownloadButton.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── StudentCard.jsx
│   │   │   ├── TeacherCard.jsx
│   │   │   └── Timetable.jsx
│   │   │
│   │   ├── pages/           # Page components
│   │   │   ├── admin/       # Admin pages
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Students.jsx
│   │   │   │   ├── Teachers.jsx
│   │   │   │   ├── Classes.jsx
│   │   │   │   ├── Subjects.jsx
│   │   │   │   ├── Attendance.jsx
│   │   │   │   ├── Grades.jsx
│   │   │   │   ├── Fees.jsx
│   │   │   │   ├── Payroll.jsx
│   │   │   │   ├── Timetable.jsx
│   │   │   │   ├── Reports.jsx
│   │   │   │   ├── CreateExam.jsx
│   │   │   │   ├── ExamList.jsx
│   │   │   │   └── ManageNotifications.jsx
│   │   │   │
│   │   │   ├── teacher/     # Teacher pages
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── MyClasses.jsx
│   │   │   │   ├── ClassDetails.jsx
│   │   │   │   ├── Attendance.jsx
│   │   │   │   ├── Grades.jsx
│   │   │   │   ├── MySchedule.jsx
│   │   │   │   └── Subjects.jsx
│   │   │   │
│   │   │   ├── student/     # Student pages
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── MyAttendance.jsx
│   │   │   │   ├── MyGrades.jsx
│   │   │   │   ├── MyFees.jsx
│   │   │   │   ├── MySchedule.jsx
│   │   │   │   ├── MyReports.jsx
│   │   │   │   ├── StudentExamList.jsx
│   │   │   │   └── TakeExam.jsx
│   │   │   │
│   │   │   ├── superadmin/  # Super admin pages
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── Login.jsx
│   │   │   ├── Grades.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Settings.jsx
│   │   │
│   │   ├── features/        # Redux slices
│   │   │   └── auth/
│   │   │
│   │   ├── services/        # API services
│   │   │   ├── api.js
│   │   │   ├── attendanceService.js
│   │   │   ├── authService.js
│   │   │   ├── classService.js
│   │   │   ├── examService.js
│   │   │   ├── feeService.js
│   │   │   ├── gradeService.js
│   │   │   ├── notificationService.js
│   │   │   ├── payrollService.js
│   │   │   ├── reportService.js
│   │   │   ├── studentService.js
│   │   │   ├── subjectService.js
│   │   │   ├── teacherService.js
│   │   │   ├── tenantService.js
│   │   │   └── timetableService.js
│   │   │
│   │   ├── layouts/         # Layout components
│   │   │   ├── AdminLayout.jsx
│   │   │   └── MainLayout.jsx
│   │   │
│   │   ├── contexts/        # React contexts
│   │   │   └── SocketContext.jsx
│   │   │
│   │   ├── hooks/           # Custom hooks
│   │   │   └── useSocket.js
│   │   │
│   │   ├── i18n/            # Internationalization
│   │   │   └── config.js
│   │   │
│   │   ├── store/           # Redux store
│   │   │   └── store.js
│   │   │
│   │   ├── utils/           # Utility functions
│   │   │   └── helpers.js
│   │   │
│   │   ├── App.jsx          # Main App component
│   │   ├── main.jsx         # React entry point
│   │   └── index.css        # Global styles
│   │
│   ├── public/              # Static assets
│   ├── .env.example         # Environment variables template
│   ├── vite.config.js       # Vite configuration
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   └── package.json         # Dependencies
│
├── docs/                    # Documentation
│   ├── API_DOCS.md
│   ├── SETUP.md
│   └── USER_GUIDE.md
│
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd school-management-system
```

2. **Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
# Use your preferred text editor (nano, vim, notepad, VS Code, etc.)
nano .env  # or code .env

# Start the development server
npm run dev
```

3. **Frontend Setup**

Open a new terminal window/tab:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
nano .env  # or code .env

# Start the development server
npm run dev
```

4. **Create Initial Tenant**

In the backend terminal:

```bash
# Create a new tenant (school)
npm run create-tenant

# Follow the prompts to enter:
# - School name
# - Subdomain
# - Admin email
# - Admin password
# - Contact information
```

5. **Create Super Admin (Optional)**

```bash
# Create super admin account
npm run create-super-admin

# Follow the prompts
```

6. **Seed Sample Data (Optional)**

```bash
# Seed database with sample data for testing
npm run seed
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## ⚙️ Environment Configuration

### Backend (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/school_management_system
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@schoolmanagement.com

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)

```env
# API Base URL
VITE_API_URL=http://localhost:5000/api

# Socket.IO URL
VITE_SOCKET_URL=http://localhost:5000
```

## 📚 API Documentation

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Students

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/students` | Get all students | Admin/Teacher |
| POST | `/api/students` | Create student | Admin |
| GET | `/api/students/:id` | Get student by ID | Admin/Teacher |
| PUT | `/api/students/:id` | Update student | Admin |
| DELETE | `/api/students/:id` | Delete student | Admin |
| GET | `/api/students/class/:classId` | Get students by class | Admin/Teacher |

### Teachers

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/teachers` | Get all teachers | Admin |
| POST | `/api/teachers` | Create teacher | Admin |
| GET | `/api/teachers/:id` | Get teacher by ID | Admin |
| PUT | `/api/teachers/:id` | Update teacher | Admin |
| DELETE | `/api/teachers/:id` | Delete teacher | Admin |

### Classes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/classes` | Get all classes | Admin/Teacher |
| POST | `/api/classes` | Create class | Admin |
| GET | `/api/classes/:id` | Get class by ID | Admin/Teacher |
| PUT | `/api/classes/:id` | Update class | Admin |
| DELETE | `/api/classes/:id` | Delete class | Admin |

### Subjects

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/subjects` | Get all subjects | Admin/Teacher |
| POST | `/api/subjects` | Create subject | Admin |
| GET | `/api/subjects/:id` | Get subject by ID | Admin/Teacher |
| PUT | `/api/subjects/:id` | Update subject | Admin |
| DELETE | `/api/subjects/:id` | Delete subject | Admin |

### Attendance

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/attendance` | Mark attendance | Admin/Teacher |
| GET | `/api/attendance/class/:classId` | Get class attendance | Admin/Teacher |
| GET | `/api/attendance/student/:studentId` | Get student attendance | Admin/Teacher/Student |
| GET | `/api/attendance/date/:date` | Get attendance by date | Admin/Teacher |

### Grades

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/grades` | Create grade | Admin/Teacher |
| GET | `/api/grades` | Get all grades (with filters) | Admin/Teacher |
| GET | `/api/grades/:id` | Get grade by ID | Admin/Teacher |
| PUT | `/api/grades/:id` | Update grade | Admin/Teacher |
| DELETE | `/api/grades/:id` | Delete grade | Admin/Teacher |
| GET | `/api/grades/student/:studentId` | Get student grades | Admin/Teacher/Student |
| GET | `/api/grades/class/:classId/report` | Get class grades report | Admin/Teacher |

### Fee Structures

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/fee-structures` | Get fee structures | Admin |
| POST | `/api/fee-structures` | Create fee structure | Admin |
| GET | `/api/fee-structures/:id` | Get fee structure | Admin |
| PUT | `/api/fee-structures/:id` | Update fee structure | Admin |
| DELETE | `/api/fee-structures/:id` | Delete fee structure | Admin |

### Fee Payments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/fee-payments` | Get payments | Admin |
| POST | `/api/fee-payments` | Record payment | Admin |
| GET | `/api/fee-payments/:id` | Get payment details | Admin |
| GET | `/api/fee-payments/student/:studentId` | Get student payments | Admin/Student |
| PUT | `/api/fee-payments/:id` | Update payment | Admin |

### Payroll

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payroll/generate` | Generate payroll | Admin |
| GET | `/api/payroll` | Get payroll records | Admin |
| PUT | `/api/payroll/:id` | Update payroll status | Admin |
| GET | `/api/payroll/my-payslips` | Get teacher's payslips | Teacher |

### Timetable

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/timetable/:classId` | Get class timetable | Admin/Teacher/Student |
| PUT | `/api/timetable/:classId` | Update class timetable | Admin |
| POST | `/api/timetable/check-conflicts` | Check scheduling conflicts | Admin |
| GET | `/api/timetable/teacher/:teacherId/schedule` | Get teacher schedule | Admin/Teacher |
| GET | `/api/timetable/teacher/:teacherId/weekly` | Get teacher weekly schedule | Admin/Teacher |
| GET | `/api/timetable/student/:studentId/weekly` | Get student weekly schedule | Admin/Student |

### Reports

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/reports/student/:studentId/report-card` | Download student PDF report | Admin/Teacher/Student |
| GET | `/api/reports/student/:studentId/excel` | Download student Excel report | Admin/Teacher/Student |
| GET | `/api/reports/class/:classId/pdf` | Download class PDF report | Admin/Teacher |
| GET | `/api/reports/class/:classId/excel` | Download class Excel report | Admin/Teacher |
| GET | `/api/reports/subject/:subjectId/report` | Download subject PDF report | Admin/Teacher |
| GET | `/api/reports/attendance/:classId` | Download attendance report | Admin/Teacher |
| GET | `/api/reports/fees/class/:classId` | Download fee report | Admin |

### Exams

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/exams` | Create exam | Admin |
| GET | `/api/exams` | Get all exams | Admin/Teacher/Student |
| GET | `/api/exams/:id` | Get exam by ID | Admin/Teacher |
| PUT | `/api/exams/:id` | Update exam | Admin |
| DELETE | `/api/exams/:id` | Delete exam | Admin |
| POST | `/api/exams/:id/submit` | Submit exam answers | Student |

### Notifications

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/notifications` | Send notification | Admin |
| GET | `/api/notifications` | Get user notifications | All |
| PUT | `/api/notifications/:id/read` | Mark as read | All |
| DELETE | `/api/notifications/:id` | Delete notification | All |

For complete API documentation with request/response examples, see [API_DOCS.md](./docs/API_DOCS.md)

## 🔐 User Roles & Permissions

### Super Admin
- Manage multiple tenants (schools)
- Create and configure schools
- System-wide analytics
- User management across tenants

### Admin (School Admin)
- Full access within their school
- Manage students, teachers, classes
- Configure fee structures
- Generate reports
- Send notifications
- Manage payroll
- Create timetables

### Teacher
- View assigned classes and students
- Mark attendance
- Enter grades
- View own schedule
- Generate class reports
- View own payslips
- Access student information

### Student
- View own information
- Check attendance
- View grades and reports
- Track fee payments
- View timetable
- Take online exams
- Receive notifications

### Parent (Future Feature)
- View child's information
- Track attendance and grades
- Fee payment management
- Communication with teachers

## 💾 Database Schema

### Key Models

#### User
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  role: ['superadmin', 'admin', 'teacher', 'student', 'parent'],
  tenant: ObjectId,
  isActive: Boolean,
  profilePicture: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Student
```javascript
{
  user: ObjectId,
  tenant: ObjectId,
  studentId: String,
  class: ObjectId,
  section: String,
  admissionNumber: String,
  admissionDate: Date,
  dateOfBirth: Date,
  gender: String,
  bloodGroup: String,
  address: Object,
  parentInfo: Object,
  previousSchool: String,
  academicYear: String,
  isActive: Boolean
}
```

#### Teacher
```javascript
{
  user: ObjectId,
  tenant: ObjectId,
  employeeId: String,
  subjects: [ObjectId],
  classes: [ObjectId],
  designation: String,
  qualification: String,
  experience: Number,
  joiningDate: Date,
  salary: Number,
  address: Object,
  isActive: Boolean
}
```

#### Attendance
```javascript
{
  tenant: ObjectId,
  student: ObjectId,
  class: ObjectId,
  date: Date,
  status: ['present', 'absent', 'late', 'excused'],
  markedBy: ObjectId,
  remarks: String
}
```

#### Grade
```javascript
{
  tenant: ObjectId,
  student: ObjectId,
  class: ObjectId,
  subject: ObjectId,
  examType: ['monthly', 'chapter'],
  examName: String,
  marks: Number,
  totalMarks: Number,
  percentage: Number,
  grade: String,
  academicYear: String,
  term: String,
  remarks: String
}
```

#### FeeStructure
```javascript
{
  tenant: ObjectId,
  name: String,
  class: ObjectId,
  academicYear: String,
  components: [{
    name: String,
    amount: Number,
    dueDate: Date
  }],
  totalAmount: Number,
  isActive: Boolean
}
```

#### FeePayment
```javascript
{
  tenant: ObjectId,
  student: ObjectId,
  feeStructure: ObjectId,
  amountPaid: Number,
  paymentDate: Date,
  paymentMethod: String,
  transactionId: String,
  status: ['paid', 'partial', 'pending', 'overdue'],
  discount: Number,
  lateFee: Number,
  remarks: String
}
```

## 🌐 Deployment

### Backend Deployment (Render/Heroku/Railway)

1. **Push to Git Repository**
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

2. **Configure Environment Variables**
   - Set all required environment variables in your hosting platform
   - Update `FRONTEND_URL` to your production frontend URL
   - Ensure `NODE_ENV=production`

3. **Database**
   - Use MongoDB Atlas for cloud database
   - Update `MONGODB_URI` with Atlas connection string

### Frontend Deployment (Vercel/Netlify)

1. **Build the Application**
```bash
cd frontend
npm run build
```

2. **Configure Environment Variables**
   - Set `VITE_API_URL` to your production backend URL
   - Set `VITE_SOCKET_URL` to your backend URL

3. **Deploy**
   - Connect your GitHub repository to Vercel/Netlify
   - Configure build settings:
     - Build command: `npm run build`
     - Output directory: `dist`

### CORS Configuration

Update `backend/server.js` to include your production frontend URL:

```javascript
const allowedOrigins = [
    'http://localhost:5173',
    'https://your-production-frontend.vercel.app',
    process.env.FRONTEND_URL
].filter(Boolean);
```

## 👨‍💻 Development

### Running Development Servers

**Backend:**
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

**Frontend:**
```bash
cd frontend
npm run dev  # Uses Vite dev server with HMR
```

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Code Linting

```bash
# Frontend linting
cd frontend
npm run lint
```

### Building for Production

**Backend:**
```bash
cd backend
npm start  # Production mode
```

**Frontend:**
```bash
cd frontend
npm run build  # Creates optimized build in dist/
npm run preview  # Preview production build locally
```

### Development Scripts

**Backend:**
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data
- `npm run create-tenant` - Create new tenant interactively
- `npm run create-super-admin` - Create super admin account

**Frontend:**
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Coding Standards

- Follow the existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed
- Test your changes thoroughly

## 🗺 Roadmap

### Completed Features
- [x] Multi-tenant architecture
- [x] User authentication & authorization
- [x] Student management
- [x] Teacher management
- [x] Class & subject management
- [x] Attendance tracking
- [x] Grade management (monthly & chapter-wise)
- [x] Fee management system
- [x] Payroll system
- [x] Timetable generator
- [x] Report generation (PDF & Excel)
- [x] Real-time notifications
- [x] Multi-language support
- [x] Online exam system
- [x] Dashboard analytics
- [x] Super admin features

### In Progress
- [ ] Email report delivery
- [ ] Advanced analytics & insights
- [ ] Mobile app (React Native)

### Planned Features
- [ ] Parent portal
- [ ] Library management
- [ ] Transport management
- [ ] Hostel management
- [ ] Asset management
- [ ] HR management
- [ ] Admission management
- [ ] Certificate generation
- [ ] SMS notifications
- [ ] Biometric attendance integration
- [ ] Video conferencing integration
- [ ] Assignment management
- [ ] Homework tracking
- [ ] Student behavior tracking
- [ ] Canteen management
- [ ] Inventory management

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Icons**: [Lucide](https://lucide.dev/) and [React Icons](https://react-icons.github.io/react-icons/)
- **UI Design**: Inspired by modern design systems and best practices
- **Community**: Built with love for educational institutions worldwide

## 📞 Support

For support, please:
- **Email**: support@schoolms.com
- **Issues**: Create an issue in the repository
- **Documentation**: Check the [docs](./docs) folder

## 📊 Project Statistics

- **Backend Controllers**: 17
- **Database Models**: 16
- **API Routes**: 18
- **Frontend Pages**: 39+
- **Reusable Components**: 19+
- **API Endpoints**: 100+

---

**Built with ❤️ for educational institutions**

*Making school management efficient, modern, and accessible.*
