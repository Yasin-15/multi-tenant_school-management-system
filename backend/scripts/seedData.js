import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tenant from '../models/Tenant.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Class from '../models/Class.js';
import Subject from '../models/Subject.js';

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Clear existing data
        await Tenant.deleteMany({});
        await User.deleteMany({});
        await Student.deleteMany({});
        await Teacher.deleteMany({});
        await Class.deleteMany({});
        await Subject.deleteMany({});

        console.log('Cleared existing data');

        // Create tenant
        const tenant = await Tenant.create({
            name: 'Demo High School',
            subdomain: 'demo',
            contactEmail: 'admin@demohighschool.com',
            contactPhone: '+1234567890',
            address: {
                street: '123 Education Street',
                city: 'Knowledge City',
                state: 'Learning State',
                country: 'USA',
                zipCode: '12345'
            },
            settings: {
                academicYearStart: new Date('2024-09-01'),
                academicYearEnd: new Date('2025-06-30'),
                currency: 'USD',
                timezone: 'America/New_York',
                language: 'en'
            },
            subscription: {
                plan: 'premium',
                status: 'active'
            }
        });

        console.log('Created tenant:', tenant.name);

        // Create admin user
        const admin = await User.create({
            tenant: tenant._id,
            email: 'admin@demo.com',
            password: 'admin123',
            role: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            phone: '+1234567890',
            emailVerified: true,
            isActive: true
        });

        console.log('Created admin user');

        // Create subjects
        const subjects = await Subject.insertMany([
            {
                tenant: tenant._id,
                name: 'Mathematics',
                code: 'MATH101',
                type: 'core',
                credits: 4,
                passingMarks: 40,
                totalMarks: 100
            },
            {
                tenant: tenant._id,
                name: 'English',
                code: 'ENG101',
                type: 'core',
                credits: 3,
                passingMarks: 40,
                totalMarks: 100
            },
            {
                tenant: tenant._id,
                name: 'Science',
                code: 'SCI101',
                type: 'core',
                credits: 4,
                passingMarks: 40,
                totalMarks: 100
            },
            {
                tenant: tenant._id,
                name: 'History',
                code: 'HIST101',
                type: 'core',
                credits: 3,
                passingMarks: 40,
                totalMarks: 100
            },
            {
                tenant: tenant._id,
                name: 'Physical Education',
                code: 'PE101',
                type: 'elective',
                credits: 2,
                passingMarks: 40,
                totalMarks: 100
            }
        ]);

        console.log('Created subjects');

        // Create teachers
        const teacherUsers = [];
        const teachers = [];

        for (let i = 1; i <= 5; i++) {
            const teacherUser = await User.create({
                tenant: tenant._id,
                email: `teacher${i}@demo.com`,
                password: 'teacher123',
                role: 'teacher',
                firstName: `Teacher`,
                lastName: `${i}`,
                phone: `+123456789${i}`,
                emailVerified: true,
                isActive: true
            });

            teacherUsers.push(teacherUser);

            const teacher = await Teacher.create({
                tenant: tenant._id,
                user: teacherUser._id,
                employeeId: `T${String(i).padStart(4, '0')}`,
                designation: 'Senior Teacher',
                department: 'Academic',
                subjects: [subjects[i - 1]._id],
                qualification: [{
                    degree: 'Master of Education',
                    institution: 'University of Education',
                    year: 2015,
                    specialization: subjects[i - 1].name
                }],
                salary: {
                    basic: 50000,
                    allowances: 10000,
                    deductions: 5000,
                    currency: 'USD'
                }
            });

            teachers.push(teacher);
        }

        console.log('Created teachers');

        // Create classes
        const classes = await Class.insertMany([
            {
                tenant: tenant._id,
                name: 'Grade 9 - Section A',
                grade: 9,
                section: 'A',
                academicYear: '2024-2025',
                classTeacher: teachers[0]._id,
                subjects: subjects.map((subject, index) => ({
                    subject: subject._id,
                    teacher: teachers[index % teachers.length]._id
                })),
                maxStudents: 40,
                room: '101'
            },
            {
                tenant: tenant._id,
                name: 'Grade 10 - Section A',
                grade: 10,
                section: 'A',
                academicYear: '2024-2025',
                classTeacher: teachers[1]._id,
                subjects: subjects.map((subject, index) => ({
                    subject: subject._id,
                    teacher: teachers[index % teachers.length]._id
                })),
                maxStudents: 40,
                room: '102'
            }
        ]);

        console.log('Created classes');

        // Create students
        for (let i = 1; i <= 20; i++) {
            const studentUser = await User.create({
                tenant: tenant._id,
                email: `student${i}@demo.com`,
                password: 'student123',
                role: 'student',
                firstName: `Student`,
                lastName: `${i}`,
                phone: `+123456780${i}`,
                dateOfBirth: new Date(2008, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                gender: i % 2 === 0 ? 'male' : 'female',
                emailVerified: true,
                isActive: true
            });

            await Student.create({
                tenant: tenant._id,
                user: studentUser._id,
                studentId: `S${String(i).padStart(5, '0')}`,
                admissionNumber: `ADM2024${String(i).padStart(3, '0')}`,
                admissionDate: new Date('2024-09-01'),
                class: classes[i % 2]._id,
                section: 'A',
                rollNumber: String(i),
                academicYear: '2024-2025',
                guardianName: `Guardian ${i}`,
                guardianPhone: `+123456790${i}`,
                guardianEmail: `guardian${i}@demo.com`,
                guardianRelation: 'Parent',
                bloodGroup: ['A+', 'B+', 'O+', 'AB+'][Math.floor(Math.random() * 4)],
                status: 'active'
            });
        }

        console.log('Created students');

        console.log('\n✅ Database seeded successfully!');
        console.log('\nLogin Credentials:');
        console.log('==================');
        console.log('Admin:');
        console.log('  Email: admin@demo.com');
        console.log('  Password: admin123');
        console.log('\nTeacher (example):');
        console.log('  Email: teacher1@demo.com');
        console.log('  Password: teacher123');
        console.log('\nStudent (example):');
        console.log('  Email: student1@demo.com');
        console.log('  Password: student123');
        console.log('\nTenant:');
        console.log('  Subdomain: demo');
        console.log('  Use header: X-Tenant-ID:', tenant._id);
        console.log('==================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
