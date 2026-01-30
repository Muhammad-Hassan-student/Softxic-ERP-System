import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import Role from '@/models/Role';
import mongoose from 'mongoose';
import dns from 'node:dns/promises';
dns.setServers(['8.8.8.8', '1.1.1.1']);


async function initAdmin() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // First, check if default roles exist, create them if not
    console.log('🔄 Setting up default roles...');
    const defaultRoles = [
      {
        name: 'admin',
        description: 'System Administrator with full access',
        isDefault: true,
        isActive: true,
      },
      {
        name: 'hr',
        description: 'Human Resources Manager',
        isDefault: true,
        isActive: true,
      },
      {
        name: 'employee',
        description: 'Regular Employee',
        isDefault: true,
        isActive: true,
      },
      {
        name: 'accounts',
        description: 'Accounts Department',
        isDefault: true,
        isActive: true,
      },
      {
        name: 'support',
        description: 'Customer Support',
        isDefault: true,
        isActive: true,
      },
      {
        name: 'marketing',
        description: 'Marketing Department',
        isDefault: true,
        isActive: true,
      },
    ];

    for (const roleData of defaultRoles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        await Role.create(roleData);
        console.log(`✅ Created role: ${roleData.name}`);
      } else {
        console.log(`⚠️ Role already exists: ${roleData.name}`);
      }
    }

    // Check if admin already exists
    console.log('🔍 Checking for existing admin...');
    const adminExists = await User.findOne({ role: 'admin', isActive: true });
    
    if (adminExists) {
      console.log('⚠️ Admin user already exists:');
      console.log(`   Name: ${adminExists.fullName}`);
      console.log(`   Email: ${adminExists.email}`);
      console.log(`   Status: ${adminExists.status}`);
      
      // Update admin if needed
      const updateAdmin = process.argv.includes('--update');
      if (updateAdmin) {
        console.log('🔄 Updating admin user...');
        adminExists.password = 'Admin@123';
        await adminExists.save();
        console.log('✅ Admin password updated to: Admin@123');
      }
      
      process.exit(0);
    }

    // Create admin user with all required fields
    console.log('👤 Creating admin user...');
    
    const adminData = {
      // Login Credentials
      rollNo: 'ADM-001', // Admin roll number
      fullName: 'System Administrator',
      cnic: '35201-1234567-1',
      password: 'Admin@123',
      email: 'admin@erp.com',
      mobile: '03001234567',
      alternateMobile: '03001234568',
      
      // Personal Information
      profilePhoto: '', // Will be uploaded later
      fatherName: 'Admin Father',
      dateOfBirth: new Date('1980-01-15'),
      gender: 'male' as const,
      maritalStatus: 'married' as const,
      address: '123 Admin Street, Karachi, Pakistan',
      
      // Academic/Qualifications
      qualification: {
        academic: 'Masters in Computer Science',
        other: 'ERP System Administration, Network Security'
      },
      reference: 'System Generated',
      
      // Job Information
      jobTitle: 'System Administrator',
      department: 'admin',
      responsibility: 'Manage entire ERP system, user management, system configuration',
      timing: '9:00 AM - 6:00 PM',
      monthOff: 'Sunday',
      dateOfJoining: new Date('2020-01-01'),
      salary: 150000,
      incentive: 20000,
      taxDeduction: true,
      taxAmount: 15000,
      
      // Status
      status: 'active' as const,
      terminationDate: null,
      terminationReason: '',
      
      // System Fields
      role: 'admin' as const,
      createdBy: new mongoose.Types.ObjectId(), // Self-created
      isActive: true,
      lastLogin: null,
    };

    const adminUser = await User.create(adminData);
    
    console.log('✅ Admin user created successfully!');
    console.log('\n📋 ADMIN CREDENTIALS:');
    console.log('====================');
    console.log(`👤 Full Name: ${adminUser.fullName}`);
    console.log(`📧 Email: ${adminUser.email}`);
    console.log(`🔑 Password: Admin@123`);
    console.log(`📱 Mobile: ${adminUser.mobile}`);
    console.log(`🆔 CNIC: ${adminUser.cnic}`);
    console.log(`🎫 Roll No: ${adminUser.rollNo}`);
    console.log(`💼 Department: ${adminUser.department}`);
    console.log(`💰 Salary: PKR ${adminUser.salary.toLocaleString()}`);
    console.log(`📅 Date of Joining: ${adminUser.dateOfJoining.toLocaleDateString()}`);
    console.log('\n⚠️ IMPORTANT:');
    console.log('============');
    console.log('1. Change the password immediately after first login');
    console.log('2. Keep these credentials secure');
    console.log('3. Admin can create HR and Employee accounts');
    
    process.exit(0);
    
  } catch (error: any) {
    console.error('❌ Error initializing admin:', error);
    
    if (error.code === 11000) {
      console.error('Duplicate key error. Admin might already exist with same email or CNIC.');
    }
    
    if (error.message.includes('Only one admin is allowed')) {
      console.error('Only one admin user is allowed in the system.');
    }
    
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const showHelp = args.includes('--help') || args.includes('-h');

if (showHelp) {
  console.log(`
Admin Initialization Script
===========================

Usage:
  npm run init:admin [options]

Options:
  --help, -h      Show this help message
  --update        Update existing admin password
  --force         Force create admin even if exists

Examples:
  npm run init:admin           Create admin if not exists
  npm run init:admin --update  Update existing admin password
  `);
  process.exit(0);
}

initAdmin();