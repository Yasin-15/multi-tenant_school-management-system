# School Management System

A comprehensive multi-tenant school management system built with MERN stack (MongoDB, Express.js, React, Node.js).

## Features

### Admin Features
- **Dashboard**: Overview of students, teachers, classes, and revenue
- **Student Management**: Add, edit, delete, and manage student records
- **Teacher Management**: Manage teacher profiles and assignments
- **Class Management**: Create and manage classes, sections, and schedules
- **Subject Management**: Create and assign subjects to classes
- **Attendance Tracking**: Mark and monitor student attendance
- **Grade Management**: Record and manage student grades (monthly & chapter-wise exams)
- **Fee Management**: Create fee structures and track payments
- **Notifications**: Send multi-language announcements to students, teachers, or specific groups
- **Reports & Export**: Generate and export comprehensive reports in PDF and Excel formats

### Teacher Features
- View assigned classes and students
- Mark attendance for classes
- Enter and manage grades (monthly & chapter exams)
- View student performance and analytics
- Generate class and subject reports
- Export grade data to Excel
- Communicate with students and parents

### Student Features
- View personal dashboard
- Check attendance records
- View grades and performance (monthly & chapter-wise)
- Download personal report cards (PDF & Excel)
- Track fee payments
- Receive notifications in preferred language

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.IO** for real-time updates
- **Bcrypt** for password hashing
- **Express Validator** for input validation
- **PDFKit** for PDF report generation
- **ExcelJS** for Excel export functionality

### Frontend
- **React** with Hooks
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Axios** for API calls
- **Tailwind CSS** for styling
- **Lucide React** for icons

## Project Structure

```
school-management-system/
├── backend/
│   ├── controllers/      # Request handlers
│   │   ├── gradeController.js
│   │   ├── reportController.js
│   │   └── ...
│   ├── models/          # Database models
│   │   ├── Grade.js
│   │   ├── Student.js
│   │   └── ...
│   ├── routes/          # API routes
│   │   ├── gradeRoutes.js
│   │   ├── reportRoutes.js
│   │   └── ...
│   ├── middleware/      # Custom middleware
│   ├── scripts/         # Utility scripts
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   │   └── ReportDownloadButton.jsx
│   │   ├── pages/       # Page components
│   │   │   ├── Reports.jsx
│   │   │   ├── Grades.jsx
│   │   │   └── student/
│   │   │       └── MyReports.jsx
│   │   ├── features/    # Redux slices
│   │   ├── services/    # API services
│   │   │   ├── gradeService.js
│   │   │   ├── reportService.js
│   │   │   └── ...
│   │   ├── layouts/     # Layout components
│   │   ├── store/       # Redux store
│   │   └── utils/       # Utility functions
│   └── public/          # Static assets
└── docs/                # Documentation
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd school-management-system
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

4. **Create Initial Tenant**
```bash
cd backend
npm run create-tenant
```

5. **Seed Sample Data (Optional)**
```bash
npm run seed
```

For detailed setup instructions, see [SETUP.md](./docs/SETUP.md)

## Documentation

- [Setup Guide](./docs/SETUP.md) - Installation and configuration
- [API Documentation](./docs/API_DOCS.md) - API endpoints and usage
- [User Guide](./docs/USER_GUIDE.md) - Feature documentation
- [Grades Reporting Feature](./GRADES_REPORTING_FEATURE.md) - Comprehensive reporting system
- [Reports Integration Guide](./REPORTS_INTEGRATION_GUIDE.md) - How to integrate reports
- [Report Button Usage](./REPORT_BUTTON_USAGE.md) - Reusable report button component

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create student
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Teachers
- `GET /api/teachers` - Get all teachers
- `POST /api/teachers` - Create teacher
- `GET /api/teachers/:id` - Get teacher by ID
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create class
- `GET /api/classes/:id` - Get class by ID
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

### Attendance
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/class/:classId` - Get class attendance
- `GET /api/attendance/student/:studentId` - Get student attendance

### Grades
- `POST /api/grades` - Create grade
- `GET /api/grades` - Get all grades (with filters)
- `GET /api/grades/:id` - Get grade by ID
- `PUT /api/grades/:id` - Update grade
- `DELETE /api/grades/:id` - Delete grade
- `GET /api/grades/student/:studentId` - Get student grades
- `GET /api/grades/class/:classId/report` - Get class grades report

### Reports
- `GET /api/reports/student/:studentId/report-card` - Download student PDF report card
- `GET /api/reports/student/:studentId/excel` - Download student Excel report
- `GET /api/reports/class/:classId/pdf` - Download class PDF report
- `GET /api/reports/class/:classId/excel` - Download class Excel report
- `GET /api/reports/subject/:subjectId/report` - Download subject PDF report

### Fees
- `GET /api/fee-structures` - Get fee structures
- `POST /api/fee-structures` - Create fee structure
- `GET /api/fee-payments` - Get payments
- `POST /api/fee-payments` - Record payment

For complete API documentation, see [API_DOCS.md](./docs/API_DOCS.md)

## Default Credentials

After seeding data:

**Admin**
- Email: admin@school.com
- Password: admin123

**Teacher**
- Email: teacher@school.com
- Password: teacher123

**Student**
- Email: student@school.com
- Password: student123

## Features in Detail

### Multi-Tenancy
Each school is a separate tenant with isolated data. Tenants are identified by subdomain or custom domain.

### Role-Based Access Control
- **Super Admin**: Manage multiple tenants and system-wide settings
- **Admin**: Full system access within tenant
- **Teacher**: Limited to assigned classes and students
- **Student**: View-only access to personal data
- **Parent**: View child's information (future feature)

### Grade Management System
- **Monthly Exams**: Track regular monthly assessments
- **Chapter-wise Exams**: Monitor chapter-specific performance
- **Automatic Grading**: Auto-calculate percentages and letter grades
- **Performance Analytics**: View statistics and trends
- **Multi-subject Support**: Manage grades across all subjects

### Comprehensive Reporting System
- **Student Reports**: Individual performance reports with detailed grades
- **Class Reports**: Class-wide analytics and performance summaries
- **Subject Reports**: Subject-specific performance across students
- **Export Formats**: Download reports in PDF or Excel format
- **Filtering Options**: Filter by academic year, exam type, subject, etc.
- **Automated Generation**: Reports generated on-demand with real-time data

### Real-Time Updates
Socket.IO integration provides:
- Instant notifications
- Live attendance updates
- Real-time grade posting
- Multi-language notification support

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation
- CORS protection
- Helmet security headers
- Tenant data isolation

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@schoolms.com or create an issue in the repository.

## Roadmap

- [x] Grade management (monthly & chapter-wise)
- [x] Report generation (PDF & Excel)
- [x] Multi-language notifications
- [x] Subject management
- [x] Super admin features
- [ ] Parent portal
- [ ] Mobile app (React Native)
- [x] SMS notifications
- [x] Online exam system
- [x] Graphical performance charts
- [x] Batch report generation
- [ ] Email report delivery
- [ ] Library management
- [ ] Transport management
- [ ] Hostel management
- [ ] Payroll system
- [ ] Timetable generator

## Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- UI components inspired by modern design systems
- Built with love for educational institutions
