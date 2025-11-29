# School Management System - API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All API requests (except login/register) require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
X-Tenant-ID: <tenant-id> (Optional if using subdomain)
```

### Auth Endpoints

#### POST /auth/login
Login to the system

**Request Body:**
```json
{
  "email": "admin@school.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "_id": "user-id",
    "email": "admin@school.com",
    "role": "admin",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### POST /auth/register
Register a new user (admin only)

**Request Body:**
```json
{
  "email": "newuser@school.com",
  "password": "password123",
  "role": "teacher",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1234567890"
}
```

#### POST /auth/forgot-password
Request password reset

**Request Body:**
```json
{
  "email": "user@school.com"
}
```

#### POST /auth/reset-password
Reset password with token

**Request Body:**
```json
{
  "token": "reset-token",
  "password": "newpassword123"
}
```

## Students

#### GET /students
Get all students

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search by name or student ID
- `class` (string): Filter by class ID
- `status` (string): Filter by status (active, inactive, graduated)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "total": 100,
  "page": 1,
  "pages": 10
}
```

#### GET /students/:id
Get student by ID

#### POST /students
Create new student (admin only)

**Request Body:**
```json
{
  "email": "student@school.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "studentId": "STU001",
  "admissionNumber": "ADM2024001",
  "class": "class-id",
  "section": "A",
  "academicYear": "2024-2025",
  "dateOfBirth": "2010-01-15",
  "gender": "male",
  "bloodGroup": "O+",
  "guardianName": "Parent Name",
  "guardianPhone": "+1234567890",
  "guardianEmail": "parent@email.com"
}
```

#### PUT /students/:id
Update student

#### DELETE /students/:id
Delete student (admin only)

#### GET /students/class/:classId
Get students by class

## Teachers

#### GET /teachers
Get all teachers

**Query Parameters:**
- `page`, `limit`, `search`, `status`

#### GET /teachers/:id
Get teacher by ID

#### POST /teachers
Create new teacher (admin only)

**Request Body:**
```json
{
  "email": "teacher@school.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "employeeId": "EMP001",
  "designation": "Senior Teacher",
  "department": "Mathematics",
  "subjects": ["subject-id-1", "subject-id-2"],
  "qualification": [
    {
      "degree": "M.Sc Mathematics",
      "institution": "University Name",
      "year": 2015
    }
  ]
}
```

#### PUT /teachers/:id
Update teacher

#### DELETE /teachers/:id
Delete teacher (admin only)

## Classes

#### GET /classes
Get all classes

#### GET /classes/:id
Get class by ID

#### POST /classes
Create new class (admin only)

**Request Body:**
```json
{
  "name": "Class 10",
  "grade": 10,
  "section": "A",
  "academicYear": "2024-2025",
  "classTeacher": "teacher-id",
  "maxStudents": 40,
  "room": "Room 101",
  "subjects": [
    {
      "subject": "subject-id",
      "teacher": "teacher-id"
    }
  ]
}
```

#### PUT /classes/:id
Update class

#### DELETE /classes/:id
Delete class (admin only)

## Attendance

#### POST /attendance
Mark attendance

**Request Body:**
```json
{
  "class": "class-id",
  "date": "2024-01-15",
  "records": [
    {
      "student": "student-id",
      "status": "present",
      "remarks": "On time"
    }
  ]
}
```

#### GET /attendance/class/:classId
Get attendance by class

**Query Parameters:**
- `date` (string): Date in YYYY-MM-DD format
- `startDate` (string): Start date for range
- `endDate` (string): End date for range

#### GET /attendance/student/:studentId
Get attendance by student

**Query Parameters:**
- `startDate` (string): Start date
- `endDate` (string): End date

#### PUT /attendance/:id
Update attendance record

## Grades

#### POST /grades
Create grade entry

**Request Body:**
```json
{
  "student": "student-id",
  "class": "class-id",
  "subject": "subject-id",
  "examType": "midterm",
  "examName": "Mid Term Exam 2024",
  "marksObtained": 85,
  "totalMarks": 100,
  "grade": "A",
  "remarks": "Excellent performance"
}
```

#### GET /grades/student/:studentId
Get grades by student

**Query Parameters:**
- `academicYear` (string): Filter by academic year

#### GET /grades/class/:classId
Get grades by class

**Query Parameters:**
- `subject` (string): Filter by subject
- `exam` (string): Filter by exam type

#### PUT /grades/:id
Update grade

#### DELETE /grades/:id
Delete grade

## Fee Management

### Fee Structures

#### GET /fee-structures
Get all fee structures

#### POST /fee-structures
Create fee structure (admin only)

**Request Body:**
```json
{
  "name": "Tuition Fee",
  "class": "class-id",
  "amount": 5000,
  "frequency": "monthly",
  "dueDate": 5,
  "academicYear": "2024-2025"
}
```

#### PUT /fee-structures/:id
Update fee structure

#### DELETE /fee-structures/:id
Delete fee structure

### Fee Reports

#### GET /reports/class/:classId/fee
Generate class fee report

**Query Parameters:**
- `academicYear` (string): Filter by academic year

**Response:**
- Returns a PDF file

### Fee Payments

#### GET /fee-payments
Get all fee payments

**Query Parameters:**
- `student` (string): Filter by student ID
- `status` (string): Filter by status (paid, pending, overdue)
- `startDate`, `endDate`: Date range

#### POST /fee-payments
Record fee payment

**Request Body:**
```json
{
  "student": "student-id",
  "feeStructure": "fee-structure-id",
  "amount": 5000,
  "paymentMethod": "cash",
  "transactionId": "TXN123456",
  "paymentDate": "2024-01-15"
}
```

#### GET /fee-payments/student/:studentId
Get payments by student

#### GET /fee-payments/:id/receipt
Download payment receipt (PDF)

## Timetable

#### GET /timetable/:classId
Get timetable for a class

#### PUT /timetable/:classId
Update timetable for a class (admin only)

#### POST /timetable/check-conflicts
Check for scheduling conflicts

#### GET /timetable/teacher/:teacherId/schedule
Get teacher's schedule

#### GET /timetable/student/:studentId/weekly
Get student's weekly schedule

## Notifications

#### GET /notifications
Get user notifications

**Query Parameters:**
- `read` (boolean): Filter by read status
- `type` (string): Filter by notification type

#### POST /notifications
Create notification (admin/teacher)

**Request Body:**
```json
{
  "title": "Important Announcement",
  "message": "School will remain closed tomorrow",
  "type": "announcement",
  "recipients": ["user-id-1", "user-id-2"],
  "priority": "high"
}
```

#### PUT /notifications/:id/read
Mark notification as read

#### DELETE /notifications/:id
Delete notification

## Subjects

#### GET /subjects
Get all subjects

#### POST /subjects
Create subject (admin only)

**Request Body:**
```json
{
  "name": "Mathematics",
  "code": "MATH101",
  "description": "Advanced Mathematics",
  "credits": 4
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Rate Limiting

API requests are limited to 100 requests per 15 minutes per IP address.

## WebSocket Events

The system uses Socket.IO for real-time updates:

### Events to Listen

- `notification` - New notification received
- `attendance-updated` - Attendance record updated
- `grade-added` - New grade added

### Events to Emit

- `join-tenant` - Join tenant room
- `join-user` - Join user-specific room
