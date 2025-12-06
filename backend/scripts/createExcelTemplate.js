import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createStudentImportTemplate() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Students');

    // Define columns
    worksheet.columns = [
        { header: 'First Name*', key: 'firstName', width: 15 },
        { header: 'Last Name*', key: 'lastName', width: 15 },
        { header: 'Email*', key: 'email', width: 25 },
        { header: 'Password*', key: 'password', width: 15 },
        { header: 'Date of Birth* (YYYY-MM-DD)', key: 'dateOfBirth', width: 20 },
        { header: 'Gender* (male/female/other)', key: 'gender', width: 20 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Admission Number*', key: 'admissionNumber', width: 18 },
        { header: 'Admission Date (YYYY-MM-DD)', key: 'admissionDate', width: 20 },
        { header: 'Class Name*', key: 'className', width: 15 },
        { header: 'Section', key: 'section', width: 10 },
        { header: 'Roll Number', key: 'rollNumber', width: 12 },
        { header: 'Academic Year', key: 'academicYear', width: 12 },
        { header: 'Guardian Name', key: 'guardianName', width: 20 },
        { header: 'Guardian Phone', key: 'guardianPhone', width: 15 },
        { header: 'Guardian Email', key: 'guardianEmail', width: 25 },
        { header: 'Guardian Relation', key: 'guardianRelation', width: 18 },
        { header: 'Blood Group', key: 'bloodGroup', width: 12 },
        { header: 'Street Address', key: 'street', width: 30 },
        { header: 'City', key: 'city', width: 15 },
        { header: 'State', key: 'state', width: 15 },
        { header: 'Country', key: 'country', width: 15 },
        { header: 'Zip Code', key: 'zipCode', width: 10 }
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add sample data
    worksheet.addRow({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        dateOfBirth: '2010-05-15',
        gender: 'male',
        phone: '1234567890',
        admissionNumber: 'ADM2025001',
        admissionDate: '2025-01-10',
        className: 'Grade 10',
        section: 'A',
        rollNumber: '01',
        academicYear: '2025',
        guardianName: 'Jane Doe',
        guardianPhone: '0987654321',
        guardianEmail: 'jane.doe@example.com',
        guardianRelation: 'mother',
        bloodGroup: 'O+',
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001'
    });

    // Add instructions sheet
    const instructionsSheet = workbook.addWorksheet('Instructions');
    instructionsSheet.columns = [
        { header: 'Instructions for Student Import', key: 'instruction', width: 80 }
    ];

    instructionsSheet.getRow(1).font = { bold: true, size: 14 };
    instructionsSheet.addRow({ instruction: '' });
    instructionsSheet.addRow({ instruction: 'Required Fields (marked with *):' });
    instructionsSheet.addRow({ instruction: '• First Name, Last Name, Email, Password' });
    instructionsSheet.addRow({ instruction: '• Date of Birth, Gender, Admission Number, Class Name' });
    instructionsSheet.addRow({ instruction: '' });
    instructionsSheet.addRow({ instruction: 'Date Format: YYYY-MM-DD (e.g., 2010-05-15)' });
    instructionsSheet.addRow({ instruction: '' });
    instructionsSheet.addRow({ instruction: 'Gender Values: male, female, or other' });
    instructionsSheet.addRow({ instruction: '' });
    instructionsSheet.addRow({ instruction: 'Blood Group Values: A+, A-, B+, B-, AB+, AB-, O+, O-' });
    instructionsSheet.addRow({ instruction: '' });
    instructionsSheet.addRow({ instruction: 'Guardian Relation Values: father, mother, guardian, other' });
    instructionsSheet.addRow({ instruction: '' });
    instructionsSheet.addRow({ instruction: 'Class Name: Must match an existing class in your system exactly' });
    instructionsSheet.addRow({ instruction: '' });
    instructionsSheet.addRow({ instruction: 'Notes:' });
    instructionsSheet.addRow({ instruction: '• Delete the sample row before importing your data' });
    instructionsSheet.addRow({ instruction: '• Email addresses must be unique' });
    instructionsSheet.addRow({ instruction: '• Student IDs and HEMIS IDs will be auto-generated' });
    instructionsSheet.addRow({ instruction: '• If Class Name and Section are provided, Roll Number will be auto-generated' });

    // Save the file
    const templatePath = path.join(__dirname, '..', 'templates', 'student-import-template.xlsx');
    await workbook.xlsx.writeFile(templatePath);

    console.log('Excel template created successfully at:', templatePath);
}

createStudentImportTemplate().catch(console.error);
