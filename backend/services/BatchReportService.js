import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import Student from '../models/Student.js';
import Grade from '../models/Grade.js';
import FeePayment from '../models/FeePayment.js';
import Class from '../models/Class.js';

class BatchReportService {
    /**
     * Generate a single PDF containing report cards for all students in a class
     */
    async generateClassReportCards(tenantId, classId, academicYear) {
        const students = await Student.find({ tenant: tenantId, class: classId })
            .populate('user', 'firstName lastName email')
            .populate('class', 'name')
            .sort({ rollNumber: 1 });

        if (!students || students.length === 0) {
            throw new Error('No students found in this class');
        }

        const doc = new PDFDocument({ margin: 50, autoFirstPage: false });

        for (const student of students) {
            // Fetch grades for this student
            const query = {
                tenant: tenantId,
                student: student._id
            };
            if (academicYear) query.academicYear = academicYear;

            const grades = await Grade.find(query)
                .populate('subject', 'name')
                .sort({ examDate: -1 });

            // Add a new page for each student
            doc.addPage();

            // --- Draw Report Card ---
            // Header
            doc.fontSize(20).text('Student Report Card', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Academic Year: ${academicYear || 'All Years'}`, { align: 'center' });
            doc.moveDown(2);

            // Student Info
            doc.fontSize(14).text('Student Information', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(11);
            doc.text(`Name: ${student.user.firstName} ${student.user.lastName}`);
            doc.text(`Roll Number: ${student.rollNumber}`);
            doc.text(`Class: ${student.class.name}`);
            doc.moveDown(2);

            // Grades
            if (grades.length > 0) {
                // Stats
                const totalPercentage = grades.reduce((sum, g) => sum + g.percentage, 0);
                const averagePercentage = (totalPercentage / grades.length).toFixed(2);

                doc.fontSize(14).text('Performance Summary', { underline: true });
                doc.moveDown(0.5);
                doc.fontSize(11);
                doc.text(`Average Percentage: ${averagePercentage}%`);
                doc.moveDown(2);

                // Table
                doc.fontSize(14).text('Detailed Grades', { underline: true });
                doc.moveDown(0.5);

                const tableTop = doc.y;
                const col1 = 50;
                const col2 = 200;
                const col3 = 300;
                const col4 = 400;

                doc.fontSize(10).font('Helvetica-Bold');
                doc.text('Subject', col1, tableTop);
                doc.text('Exam', col2, tableTop);
                doc.text('Marks', col3, tableTop);
                doc.text('Grade', col4, tableTop);

                doc.font('Helvetica');
                let y = tableTop + 20;

                grades.forEach((grade) => {
                    doc.text(grade.subject.name.substring(0, 20), col1, y);
                    doc.text(grade.examName.substring(0, 15), col2, y);
                    doc.text(`${grade.obtainedMarks}/${grade.totalMarks}`, col3, y);
                    doc.text(grade.grade, col4, y);
                    y += 20;
                });
            } else {
                doc.fontSize(12).text('No grades recorded for this period.', { align: 'center' });
            }
        }

        doc.end();
        return doc;
    }

    /**
     * Generate an Excel sheet with fee status for all students in a class
     */
    async generateClassFeeReport(tenantId, classId) {
        const students = await Student.find({ tenant: tenantId, class: classId })
            .populate('user', 'firstName lastName')
            .populate('class', 'name')
            .sort({ rollNumber: 1 });

        if (!students || students.length === 0) {
            throw new Error('No students found in this class');
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Fee Report');

        worksheet.columns = [
            { header: 'Roll No', key: 'rollNumber', width: 10 },
            { header: 'Name', key: 'name', width: 25 },
            { header: 'Class', key: 'class', width: 15 },
            { header: 'Total Paid', key: 'paid', width: 15 },
            { header: 'Pending', key: 'pending', width: 15 },
            { header: 'Status', key: 'status', width: 15 }
        ];

        // Style header
        worksheet.getRow(1).font = { bold: true };

        for (const student of students) {
            // Fetch payments
            const payments = await FeePayment.find({ tenant: tenantId, student: student._id });

            let totalPaid = 0;
            let totalPending = 0; // This would ideally come from FeeStructure - Paid

            // Simplified logic: Summing up paid amounts. 
            // Real logic needs total fee assigned to student.
            // Assuming we have a way to calculate pending, or just showing paid for now.

            payments.forEach(p => {
                totalPaid += p.amountPaid;
                if (p.status === 'PARTIAL' || p.status === 'PENDING') {
                    // This is tricky without knowing the total due for each specific payment structure
                    // We'll just list what we know
                }
            });

            worksheet.addRow({
                rollNumber: student.rollNumber,
                name: `${student.user.firstName} ${student.user.lastName}`,
                class: student.class.name,
                paid: totalPaid,
                pending: 'Check Invoice', // Placeholder as calculation is complex without more context
                status: totalPaid > 0 ? 'Active' : 'No Payment'
            });
        }

        return workbook;
    }
}

export default new BatchReportService();
