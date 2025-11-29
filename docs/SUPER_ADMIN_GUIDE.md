# Super Admin Guide

## Overview

The Super Admin role has system-wide access to manage all tenants (schools) in the School Management System. This is the highest level of access and should be used carefully.

## Creating a Super Admin

### Step 1: Run the Super Admin Creation Script

```bash
cd backend
npm run create-super-admin
```

### Step 2: Enter Details

The script will prompt you for:
- Email address
- Password
- First name
- Last name

### Step 3: Login

1. Go to the login page
2. Select "Super Admin" from the role dropdown
3. Enter your credentials
4. Click "Sign In"

You'll be redirected to the Super Admin dashboard.

## Super Admin Features

### 1. Dashboard

The dashboard provides an overview of:
- **Total Tenants**: Number of schools in the system
- **Total Users**: All users across all tenants
- **Total Students**: Students across all schools
- **Total Teachers**: Teachers across all schools
- **Subscription Plans**: Breakdown by plan type
- **Tenant Status**: Active vs inactive tenants

### 2. Tenant Management

#### Creating a New Tenant (School)

1. Navigate to **Tenants** page
2. Click **Add Tenant** button
3. Fill in the required information:

**School Information:**
- School Name (e.g., "Springfield High School")
- Subdomain (e.g., "springfield" → springfield.schoolms.com)
- Contact Email
- Contact Phone

**Admin User:**
- First Name
- Last Name
- Email (this will be the school admin's login)
- Password

4. Click **Create**

The system will:
- Create the tenant
- Create an admin user for that tenant
- Set up the initial configuration

#### Viewing Tenant Details

1. Click the **eye icon** next to a tenant
2. View:
   - Tenant information
   - Statistics (students, teachers, classes)
   - Subscription details
   - Admin users

#### Editing a Tenant

1. Click the **edit icon** next to a tenant
2. Update the information
3. Click **Update**

Note: You cannot change the subdomain after creation.

#### Activating/Deactivating a Tenant

1. Click the **power icon** next to a tenant
2. Confirm the action

When a tenant is deactivated:
- Users cannot log in
- Data is preserved
- Can be reactivated at any time

#### Deleting a Tenant

⚠️ **Warning**: This action is permanent and cannot be undone!

1. Click the **trash icon** next to a tenant
2. Confirm the deletion

This will delete:
- The tenant
- All users (admins, teachers, students)
- All student records
- All classes
- All attendance records
- All grades
- All fee records
- All notifications

### 3. User Management

View all users across all tenants:
- Filter by tenant
- Filter by role
- Search by name or email
- View user details
- Deactivate/activate users

### 4. System Settings

Configure system-wide settings:
- Default subscription plans
- System email templates
- Global rate limits
- Backup schedules
- Security settings

## Subscription Plans

### Available Plans

1. **Trial**
   - Duration: 30 days
   - Max Students: 50
   - Max Teachers: 10
   - Features: Basic features

2. **Basic**
   - Max Students: 500
   - Max Teachers: 50
   - Features: All basic features

3. **Premium**
   - Max Students: 2000
   - Max Teachers: 200
   - Features: All features + priority support

4. **Enterprise**
   - Unlimited students
   - Unlimited teachers
   - Features: All features + custom integrations

### Managing Subscriptions

1. Go to tenant details
2. Click **Edit Subscription**
3. Select new plan
4. Set start and end dates
5. Save changes

## Best Practices

### Security

1. **Protect Super Admin Credentials**
   - Use a strong, unique password
   - Enable 2FA (when available)
   - Don't share credentials
   - Change password regularly

2. **Limit Super Admin Accounts**
   - Create only necessary super admin accounts
   - Review access regularly
   - Remove unused accounts

3. **Audit Logs**
   - Review system logs regularly
   - Monitor tenant creation/deletion
   - Track user activities

### Tenant Management

1. **Before Creating a Tenant**
   - Verify school information
   - Confirm contact details
   - Choose appropriate subscription plan

2. **Before Deleting a Tenant**
   - Confirm with the school
   - Export important data
   - Notify all users
   - Document the reason

3. **Regular Maintenance**
   - Review inactive tenants
   - Check subscription expirations
   - Monitor system resources
   - Update tenant information

### Performance

1. **Monitor System Load**
   - Check active tenants
   - Monitor database size
   - Review API usage
   - Track response times

2. **Optimize Resources**
   - Archive old data
   - Clean up inactive tenants
   - Optimize database queries
   - Scale infrastructure as needed

## Common Tasks

### Task 1: Onboard a New School

1. Collect school information
2. Create tenant via Super Admin panel
3. Provide admin credentials to school
4. Verify school can log in
5. Assist with initial setup if needed

### Task 2: Handle Subscription Renewal

1. Check expiring subscriptions
2. Contact school for renewal
3. Update subscription in system
4. Confirm payment received
5. Extend subscription dates

### Task 3: Troubleshoot Login Issues

1. Verify tenant is active
2. Check user account status
3. Verify email address
4. Reset password if needed
5. Check for system-wide issues

### Task 4: Generate System Reports

1. Go to Reports section
2. Select report type
3. Choose date range
4. Apply filters
5. Export report

## API Access

Super admins can access all API endpoints:

```bash
# Get all tenants
GET /api/super-admin/tenants

# Get system stats
GET /api/super-admin/stats

# Create tenant
POST /api/super-admin/tenants

# Update tenant
PUT /api/super-admin/tenants/:id

# Delete tenant
DELETE /api/super-admin/tenants/:id

# Toggle tenant status
PATCH /api/super-admin/tenants/:id/toggle-status
```

All requests require:
- Valid JWT token
- Super admin role
- Authorization header: `Bearer <token>`

## Troubleshooting

### Cannot Create Tenant

**Issue**: "Subdomain already exists"
- **Solution**: Choose a different subdomain

**Issue**: "Email already exists"
- **Solution**: Use a different admin email

### Tenant Not Appearing

- Refresh the page
- Check filters
- Verify tenant was created successfully
- Check browser console for errors

### Cannot Delete Tenant

- Ensure you have super admin role
- Check if tenant has active subscriptions
- Verify network connection
- Check server logs

### Performance Issues

- Too many tenants: Consider archiving inactive ones
- Large database: Run optimization scripts
- High traffic: Scale infrastructure
- Slow queries: Review database indexes

## Support

For super admin support:
- Email: superadmin@schoolms.com
- Documentation: /docs
- System logs: /var/log/school-ms
- Database backup: /backups

## Security Checklist

- [ ] Strong password set
- [ ] 2FA enabled (when available)
- [ ] Regular password changes
- [ ] Audit logs reviewed monthly
- [ ] Inactive tenants archived
- [ ] Backup verified weekly
- [ ] Security updates applied
- [ ] Access logs monitored
- [ ] Suspicious activity reported
- [ ] Emergency contacts updated

## Emergency Procedures

### System Down

1. Check server status
2. Review error logs
3. Restart services if needed
4. Notify affected tenants
5. Document the incident

### Data Breach

1. Immediately change all passwords
2. Review access logs
3. Identify affected data
4. Notify affected parties
5. Implement additional security
6. Document and report

### Accidental Deletion

1. Stop all operations
2. Restore from backup
3. Verify data integrity
4. Notify affected users
5. Document the incident
6. Implement safeguards

## Maintenance Schedule

### Daily
- Monitor system health
- Check error logs
- Review new tenant requests

### Weekly
- Review active tenants
- Check subscription expirations
- Verify backups
- Update documentation

### Monthly
- Generate system reports
- Review security logs
- Archive old data
- Update system software

### Quarterly
- Performance review
- Security audit
- Capacity planning
- User feedback review
