import express from 'express';
import multer from 'multer';
import {
    getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    addStudentNote,
    importStudentsFromExcel
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { tenantMiddleware, validateTenantAccess } from '../middleware/tenant.js';

const router = express.Router();

// Configure multer for Excel file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel' // .xls
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Please upload an Excel file (.xlsx or .xls)'));
        }
    }
});

// Apply middleware
router.use(tenantMiddleware);
router.use(protect);
router.use(validateTenantAccess);

router.route('/')
    .get(authorize('admin', 'teacher'), getStudents)
    .post(authorize('admin'), createStudent);

// Import students from Excel
router.post('/import', authorize('admin'), upload.single('file'), importStudentsFromExcel);

router.get('/my-profile', authorize('student'), getStudent);

router.route('/:id')
    .get(getStudent)
    .put(authorize('admin'), updateStudent)
    .delete(authorize('admin'), deleteStudent);

router.post('/:id/notes', authorize('admin', 'teacher'), addStudentNote);

export default router;

