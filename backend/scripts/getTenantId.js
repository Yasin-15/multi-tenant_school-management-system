import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tenant from '../models/Tenant.js';

dotenv.config();

const getTenantId = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const tenant = await Tenant.findOne({});

        if (tenant) {
            console.log('TENANT_ID=' + tenant._id.toString());
        } else {
            console.log('NO_TENANT_FOUND');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

getTenantId();
