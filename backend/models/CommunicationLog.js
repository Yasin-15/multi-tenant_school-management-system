import mongoose from 'mongoose';

const communicationLogSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    type: {
        type: String,
        enum: ['SMS', 'EMAIL'],
        required: true
    },
    recipient: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILED', 'PENDING'],
        default: 'PENDING'
    },
    providerId: {
        type: String
    },
    error: {
        type: String
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

communicationLogSchema.index({ tenant: 1, createdAt: -1 });

const CommunicationLog = mongoose.model('CommunicationLog', communicationLogSchema);

export default CommunicationLog;
