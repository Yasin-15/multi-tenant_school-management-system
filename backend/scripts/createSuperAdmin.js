import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';

dotenv.config();

const createSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Create a system tenant for super admin
        let systemTenant = await Tenant.findOne({ subdomain: 'system' });
        
        if (!systemTenant) {
            systemTenant = await Tenant.create({
                name: 'System',
                subdomain: 'system',
                contactEmail: 'system@schoolms.com',
                isActive: true,
            });
            console.log('System tenant created');
        }

        console.log('\n=== Create Super Admin User ===\n');

        // Default credentials
        const email = 'yasindev54@gmail.com';
        const password = 'Yaasiin@2026';
        const firstName = 'Yasin';
        const lastName = 'Mohamed';

        // Check if super admin already exists
        const existingUser = await User.findOne({ email, role: 'super_admin' });
        
        if (existingUser) {
            console.log('\nSuper admin with this email already exists!');
            process.exit(0);
        }

        await User.create({
            tenant: systemTenant._id,
            email,
            password,
            role: 'super_admin',
            firstName,
            lastName,
            isActive: true,
            emailVerified: true,
        });

        console.log('\n✅ Super Admin created successfully!');
        console.log('\nLogin credentials:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`Role: super_admin`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

createSuperAdmin();
