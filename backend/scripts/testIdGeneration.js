import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { generateStudentId, generateRollNumber, generateHemisId, generateTeacherId, getTenantCode } from '../utils/idGenerator.js';

dotenv.config();

const testIdGeneration = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Mock tenant data
        const mockTenant = {
            _id: new mongoose.Types.ObjectId(),
            subdomain: 'testschool',
            name: 'Test School'
        };

        const tenantCode = getTenantCode(mockTenant);
        console.log('📋 Tenant Code:', tenantCode);
        console.log('─'.repeat(50));

        // Generate Student IDs
        console.log('\n👨‍🎓 STUDENT IDs:');
        const studentId1 = await generateStudentId(mockTenant._id, tenantCode);
        console.log('  Student ID 1:', studentId1);
        
        const studentId2 = await generateStudentId(mockTenant._id, tenantCode);
        console.log('  Student ID 2:', studentId2);
        
        const studentId3 = await generateStudentId(mockTenant._id, tenantCode);
        console.log('  Student ID 3:', studentId3);

        // Generate HEMIS IDs
        console.log('\n🎓 HEMIS IDs:');
        const hemisId1 = await generateHemisId(mockTenant._id, tenantCode);
        console.log('  HEMIS ID 1:', hemisId1);
        
        const hemisId2 = await generateHemisId(mockTenant._id, tenantCode);
        console.log('  HEMIS ID 2:', hemisId2);

        // Generate Roll Numbers
        console.log('\n📝 ROLL NUMBERS:');
        const mockClassId = new mongoose.Types.ObjectId();
        const rollNumber1 = await generateRollNumber(mockTenant._id, mockClassId, 'A');
        console.log('  Roll Number 1 (Class A):', rollNumber1);
        
        const rollNumber2 = await generateRollNumber(mockTenant._id, mockClassId, 'A');
        console.log('  Roll Number 2 (Class A):', rollNumber2);
        
        const rollNumber3 = await generateRollNumber(mockTenant._id, mockClassId, 'B');
        console.log('  Roll Number 3 (Class B):', rollNumber3);

        // Generate Teacher IDs
        console.log('\n👨‍🏫 TEACHER IDs:');
        const teacherId1 = await generateTeacherId(mockTenant._id, tenantCode);
        console.log('  Teacher ID 1:', teacherId1);
        
        const teacherId2 = await generateTeacherId(mockTenant._id, tenantCode);
        console.log('  Teacher ID 2:', teacherId2);

        console.log('\n' + '─'.repeat(50));
        console.log('✅ ID Generation Test Completed Successfully!');
        console.log('\n💡 Note: These are preview IDs. Actual IDs will be generated');
        console.log('   when creating students/teachers in the database.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
};

testIdGeneration();
