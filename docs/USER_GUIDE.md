# School Management System - User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Admin Features](#admin-features)
4. [Teacher Features](#teacher-features)
5. [Student Features](#student-features)
6. [Common Features](#common-features)

## Introduction

The School Management System is a comprehensive multi-tenant platform designed to streamline school administration, teaching, and learning processes. It supports three main user roles:

- **Admin**: Full system access and management
- **Teacher**: Class and student management
- **Student**: View grades, attendance, and fees

## Getting Started

### Logging In

1. Navigate to the login page
2. Enter your email and password
3. Click "Login"
4. You'll be redirected to your role-specific dashboard

### First Time Setup

Admins should:
1. Create classes and subjects
2. Add teachers and assign subjects
3. Add students and assign to classes
4. Set up fee structures

## Admin Features

### Dashboard

The admin dashboard provides an overview of:
- Total students, teachers, and classes
- Recent activities
- Upcoming events
- Revenue statistics

### Student Management

#### Adding a Student

1. Go to **Students** page
2. Click **Add Student** button
3. Fill in the required information:
   - Personal details (name, email, DOB, gender)
   - Student ID and admission number
   - Class and section
   - Guardian information
   - Medical information (optional)
4. Click **Save**

#### Managing Students

- **Search**: Use the search bar to find students by name or ID
- **View**: Click the eye icon to view full student details
- **Edit**: Click the edit icon to update student information
- **Delete**: Click the delete icon to remove a student (requires confirmation)

#### Student Status

Students can have the following statuses:
- **Active**: Currently enrolled
- **Inactive**: Temporarily not attending
- **Graduated**: Completed their education
- **Transferred**: Moved to another school
- **Expelled**: Removed from school

### Teacher Management

#### Adding a Teacher

1. Go to **Teachers** page
2. Click **Add Teacher** button
3. Fill in the required information:
   - Personal details
   - Employee ID
   - Designation and department
   - Qualifications
   - Subjects they teach
   - Salary information (optional)
4. Click **Save**

#### Assigning Classes

Teachers can be assigned to multiple classes and subjects. You can also designate a teacher as a class teacher.

### Class Management

#### Creating a Class

1. Go to **Classes** page
2. Click **Add Class** button
3. Enter:
   - Class name (e.g., "Class 10")
   - Grade level
   - Section
   - Academic year
   - Class teacher
   - Room number
   - Maximum students
4. Assign subjects and teachers
5. Click **Save**

#### Class Schedule

You can create a weekly schedule for each class:
- Add periods for each day
- Assign subjects and teachers to periods
- Set start and end times
- Specify room numbers

#### Generating Timetables
1. Go to **Timetable** page
2. Select Class
3. Click **Generate** or **Edit**
4. Assign subjects to periods using the drag-and-drop interface or manual entry
5. System checks for conflicts automatically
6. Click **Save**

### Attendance Management

#### Marking Attendance

1. Go to **Attendance** page
2. Select a class from the dropdown
3. Select the date
4. Click **View Attendance**
5. Mark each student as:
   - Present
   - Absent
   - Late
   - Excused
6. Add remarks if needed
7. Click **Save**

#### Viewing Attendance Reports

- View attendance by class and date range
- Generate attendance reports
- Export to Excel or PDF

### Grade Management

#### Adding Grades

1. Go to **Grades** page
2. Select a class
3. Select subject and exam type
4. Enter marks for each student
5. System automatically calculates grades
6. Click **Save**

#### Grade Configuration

Admins can configure:
- Grading scale (A, B, C, etc.)
- Passing marks
- Exam types (midterm, final, quiz, etc.)
- Weightage for different exams

### Fee Management

#### Creating Fee Structures

1. Go to **Fees** > **Fee Structures** tab
2. Click **Add Structure**
3. Enter:
   - Fee name (e.g., "Tuition Fee")
   - Applicable class
   - Amount
   - Frequency (monthly, quarterly, annual)
   - Due date
4. Click **Save**

#### Recording Payments

1. Go to **Fees** > **Payments** tab
2. Click **Record Payment**
3. Select student
4. Select fee structure
5. Enter:
   - Amount paid
   - Payment method
   - Transaction ID
   - Payment date
6. Click **Save**

#### Payment Receipts

- View payment history
- Download receipts as PDF
- Send receipts via email

#### Fee Reports
1. Go to **Reports** > **Financial Reports**
2. Select **Class Fee Report**
3. Choose Class and Academic Year
4. Click **Generate PDF**
5. Report includes:
   - Total expected fees
   - Collected amount
   - Pending amount
   - List of defaulters

### Notifications

#### Sending Notifications

1. Go to **Notifications** page
2. Click **New Notification**
3. Enter:
   - Title
   - Message
   - Type (announcement, alert, reminder)
   - Priority (low, medium, high)
4. Select recipients:
   - All users
   - Specific role (all teachers, all students)
   - Specific class
   - Individual users
5. Click **Send**

### Settings

Admins can configure:
- School information
- Academic year dates
- Grading system
- Notification preferences
- User permissions
- System preferences

## Teacher Features

### Dashboard

Teachers see:
- Their assigned classes
- Today's schedule
- Pending tasks (attendance, grades)
- Recent notifications

### My Classes

- View all assigned classes
- See student lists
- Access class schedules
- View class performance

### Attendance

Teachers can:
- Mark attendance for their classes
- View attendance history
- Generate attendance reports
- Identify students with low attendance

### Grade Entry

Teachers can:
- Enter grades for their subjects
- View grade distribution
- Identify struggling students
- Export grade reports

### Student Information

Teachers can:
- View student profiles
- See student performance across subjects
- Add notes about students
- Contact guardians

## Student Features

### Dashboard

Students see:
- Today's schedule
- Recent grades
- Attendance summary
- Upcoming events
- Notifications

### My Attendance

Students can:
- View their attendance record
- See attendance percentage
- View monthly/yearly attendance
- Download attendance reports

### My Grades

Students can:
- View grades for all subjects
- See exam-wise performance
- Track progress over time
- Download grade reports

### Fee Payments

Students can:
- View fee structure
- See payment history
- Check pending payments
- Download payment receipts

### Notifications

Students receive notifications about:
- Exam schedules
- Results published
- Fee due dates
- School announcements
- Events and activities

## Common Features

### Profile Management

All users can:
- Update their profile information
- Change password
- Upload profile picture
- Update contact details

### Search and Filters

Most pages include:
- Search functionality
- Filters by various criteria
- Sorting options
- Export capabilities

### Reports

The system can generate:
- Attendance reports
- Grade reports
- Fee reports
- Student performance reports
- Teacher performance reports

### Data Export

Export data in multiple formats:
- PDF for printing
- Excel for analysis
- CSV for data import

### Real-time Updates

The system uses WebSocket for:
- Instant notifications
- Live attendance updates
- Real-time grade posting
- System announcements

## Best Practices

### For Admins

1. Regularly backup data
2. Review and update user permissions
3. Monitor system usage
4. Keep fee structures up to date
5. Communicate changes to all users

### For Teachers

1. Mark attendance daily
2. Enter grades promptly
3. Keep student notes updated
4. Respond to parent inquiries
5. Report issues to admin

### For Students

1. Check notifications daily
2. Monitor attendance regularly
3. Track grade progress
4. Pay fees on time
5. Update profile information

## Troubleshooting

### Cannot Login

- Verify email and password
- Check if account is active
- Contact admin for password reset

### Missing Data

- Refresh the page
- Check filters and search terms
- Verify you have permission to view the data

### Slow Performance

- Clear browser cache
- Check internet connection
- Try a different browser
- Contact admin if issue persists

## Support

For technical support or questions:
- Contact your school administrator
- Check the FAQ section
- Submit a support ticket
- Email: support@schoolms.com

## Security Tips

1. Never share your password
2. Log out when finished
3. Use a strong password
4. Report suspicious activity
5. Keep personal information updated
