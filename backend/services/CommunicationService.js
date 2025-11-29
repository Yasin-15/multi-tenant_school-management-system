import twilio from 'twilio';
import nodemailer from 'nodemailer';
import CommunicationLog from '../models/CommunicationLog.js';

class CommunicationService {
    constructor() {
        // Initialize Twilio client if credentials exist
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            this.twilioClient = twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );
        }

        // Initialize Nodemailer transporter
        this.emailTransporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    /**
     * Send SMS
     * @param {string} to - Recipient phone number
     * @param {string} message - Message content
     * @param {string} tenantId - Tenant ID for logging
     */
    async sendSMS(to, message, tenantId) {
        try {
            if (!this.twilioClient) {
                console.warn('Twilio client not initialized. SMS skipped.');
                return false;
            }

            const result = await this.twilioClient.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: to,
            });

            // Log the communication
            await this.logCommunication({
                tenant: tenantId,
                type: 'SMS',
                recipient: to,
                content: message,
                status: 'SUCCESS',
                providerId: result.sid,
            });

            return result;
        } catch (error) {
            console.error('Error sending SMS:', error);

            await this.logCommunication({
                tenant: tenantId,
                type: 'SMS',
                recipient: to,
                content: message,
                status: 'FAILED',
                error: error.message,
            });

            throw error;
        }
    }

    /**
     * Send Email
     * @param {string} to - Recipient email
     * @param {string} subject - Email subject
     * @param {string} html - Email body (HTML)
     * @param {string} tenantId - Tenant ID for logging
     */
    async sendEmail(to, subject, html, tenantId) {
        try {
            const info = await this.emailTransporter.sendMail({
                from: process.env.SMTP_FROM || '"School Admin" <admin@school.com>',
                to,
                subject,
                html,
            });

            await this.logCommunication({
                tenant: tenantId,
                type: 'EMAIL',
                recipient: to,
                content: `Subject: ${subject}`, // Don't log full HTML body
                status: 'SUCCESS',
                providerId: info.messageId,
            });

            return info;
        } catch (error) {
            console.error('Error sending Email:', error);

            await this.logCommunication({
                tenant: tenantId,
                type: 'EMAIL',
                recipient: to,
                content: `Subject: ${subject}`,
                status: 'FAILED',
                error: error.message,
            });

            throw error;
        }
    }

    async logCommunication(data) {
        try {
            if (data.tenant) {
                await CommunicationLog.create(data);
            }
        } catch (err) {
            console.error('Failed to log communication:', err);
        }
    }
}

export default new CommunicationService();
