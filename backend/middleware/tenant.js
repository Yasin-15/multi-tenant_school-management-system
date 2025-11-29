import Tenant from '../models/Tenant.js';

/**
 * Middleware to identify and attach tenant to request
 * Supports subdomain and header-based tenant identification
 */
export const tenantMiddleware = async (req, res, next) => {
    try {
        let tenant = null;

        // Method 1: Get tenant from subdomain
        const host = req.get('host');
        console.log('[Tenant Middleware] Host:', host);

        if (host) {
            const subdomain = host.split('.')[0];

            // Skip if it's localhost or www
            if (subdomain && subdomain !== 'localhost' && subdomain !== 'www' && !subdomain.includes(':')) {
                console.log('[Tenant Middleware] Checking subdomain:', subdomain);
                tenant = await Tenant.findOne({ subdomain, isActive: true });
            }
        }

        // Method 2: Get tenant from header (useful for API calls)
        if (!tenant) {
            const tenantId = req.get('X-Tenant-ID');
            console.log('[Tenant Middleware] X-Tenant-ID header:', tenantId);

            if (tenantId) {
                try {
                    tenant = await Tenant.findOne({ _id: tenantId, isActive: true });
                    console.log('[Tenant Middleware] Tenant found by header:', tenant ? tenant.name : 'null');
                } catch (error) {
                    console.error('[Tenant Middleware] Error finding tenant by ID:', error.message);
                }
            }
        }

        // Method 3: Get tenant from query parameter (fallback for development)
        if (!tenant && req.query.tenantId) {
            console.log('[Tenant Middleware] Checking query param:', req.query.tenantId);
            tenant = await Tenant.findOne({ _id: req.query.tenantId, isActive: true });
        }

        // Method 4: For super admin login, find or create system tenant
        if (!tenant && req.path === '/login' && req.body.role === 'super_admin') {
            console.log('[Tenant Middleware] Super admin login detected, using system tenant');
            tenant = await Tenant.findOne({ subdomain: 'system' });

            // Create system tenant if it doesn't exist
            if (!tenant) {
                tenant = await Tenant.create({
                    name: 'System',
                    subdomain: 'system',
                    contactEmail: 'system@schoolms.com',
                    isActive: true,
                });
                console.log('[Tenant Middleware] System tenant created');
            }
        }

        // Method 5: For regular login without tenant, allow it to proceed
        // The auth controller will find the user's tenant
        if (!tenant && req.path === '/login') {
            console.log('[Tenant Middleware] Login without tenant, will be resolved in auth controller');
            // Don't return error, let the auth controller handle it
            return next();
        }

        if (!tenant) {
            console.error('[Tenant Middleware] No tenant found');
            return res.status(400).json({
                success: false,
                message: 'Tenant not found or inactive'
            });
        }

        // Check subscription status (skip for system tenant and trial)
        if (tenant.subdomain !== 'system' &&
            tenant.subscription.status !== 'active' &&
            tenant.subscription.plan !== 'trial') {
            return res.status(403).json({
                success: false,
                message: 'Tenant subscription is not active. Please contact support.'
            });
        }

        console.log('[Tenant Middleware] Tenant validated:', tenant.name);
        // Attach tenant to request
        req.tenant = tenant;
        next();
    } catch (error) {
        console.error('Tenant middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Error identifying tenant'
        });
    }
};

/**
 * Middleware to ensure user belongs to the tenant
 */
export const validateTenantAccess = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (!req.tenant) {
        return res.status(400).json({
            success: false,
            message: 'Tenant not identified'
        });
    }

    // Check if user belongs to this tenant
    if (req.user.tenant.toString() !== req.tenant._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Access denied: User does not belong to this tenant'
        });
    }

    next();
};
