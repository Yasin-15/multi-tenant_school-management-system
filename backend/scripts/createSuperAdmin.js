import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

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

        const email = await question('Email: ');
        const password = await question('Password: ');
        const firstName = await question('First Name: ');
        const lastName = await question('Last Name: ');

        // Check if super admin already exists
        const existingUser = await User.findOne({ email, role: 'super_admin' });
        
        if (existingUser) {
            console.log('\nSuper admin with this email already exists!');
            rl.close();
            process.exit(0);
        }

        const superAdmin = await User.create({
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

        rl.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        rl.close();
        process.exit(1);
    }
};

createSuperAdmin();
