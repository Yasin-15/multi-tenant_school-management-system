import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected\n');

        // Check all tenants
        const tenants = await Tenant.find();
        console.log(`Found ${tenants.length} tenant(s):`);
        tenants.forEach(tenant => {
            console.log(`  - ${tenant.name} (${tenant.subdomain}) - ${tenant.isActive ? 'Active' : 'Inactive'}`);
        });

        console.log('\n');

        // Check all users
        const users = await User.find().populate('tenant');
        console.log(`Found ${users.length} user(s):\n`);
        
        const usersByRole = {
            super_admin: [],
            admin: [],
            teacher: [],
            student: []
        };

        users.forEach(user => {
            usersByRole[user.role].push(user);
        });

        Object.keys(usersByRole).forEach(role => {
            if (usersByRole[role].length > 0) {
                console.log(`${role.toUpperCase()}S (${usersByRole[role].length}):`);
                usersByRole[role].forEach(user => {
                    console.log(`  - ${user.email} (${user.tenant?.name || 'No tenant'}) - ${user.isActive ? 'Active' : 'Inactive'}`);
                });
                console.log('');
            }
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

checkUsers();
