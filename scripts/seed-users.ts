import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import Role from '@/models/Role';
import mongoose from 'mongoose';
import dns from 'node:dns/promises';
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Department values from your schema
const DEPARTMENT_VALUES = ['hr', 'finance', 'sales', 'support', 'marketing', 'it', 'operations', 'admin'];

// Function to generate employee ID
function generateEmployeeId(department: string, index: number): string {
  const prefixes: Record<string, string> = {
    it: 'IT',
    finance: 'FIN',
    hr: 'HR',
    marketing: 'MRK',
    sales: 'SLS',
    support: 'SUP',
    operations: 'OPS',
    admin: 'ADM'
  };
  
  const prefix = prefixes[department.toLowerCase()] || 'EMP';
  const paddedIndex = String(index).padStart(3, '0');
  return `${prefix}-${paddedIndex}`;
}

// Generate secure password
function generatePassword(cnic: string): string {
  const last4Digits = cnic.replace(/-/g, '').slice(-4);
  const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const randomChar = randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  return `${last4Digits}${randomChar}@`;
}

async function seedUsers() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Check if roles exist
    console.log('🔄 Checking roles...');
    const roles = await Role.find({});
    if (roles.length === 0) {
      console.log('❌ No roles found. Please run init:admin first.');
      process.exit(1);
    }

    // Check if admin exists
    console.log('🔍 Checking for admin user...');
    const adminUser = await User.findOne({ role: 'admin', isActive: true });
    
    if (!adminUser) {
      console.log('❌ Admin user not found. Please run init:admin first.');
      process.exit(1);
    }
    console.log(`✅ Admin found: ${adminUser.fullName}`);

    // Display available departments
    console.log('\n📋 Available Departments (from schema):');
    console.log('=======================================');
    DEPARTMENT_VALUES.forEach((dept, index) => {
      console.log(`${index + 1}. ${dept.toUpperCase()}`);
    });

    // ========== DELETE EXISTING USERS (if --force flag) ==========
    const forceCreate = process.argv.includes('--force');
    const updateUsers = process.argv.includes('--update');
    
    if (forceCreate) {
      console.log('\n🗑️ Force flag detected, cleaning up...');
      // Delete all non-admin users
      const result = await User.deleteMany({ role: { $ne: 'admin' } });
      console.log(`✅ Deleted ${result.deletedCount} non-admin users`);
    }

    // ========== CREATE 2 HR USERS ==========
    console.log('\n👥 Creating HR Users...');
    console.log('========================');

    const hrUsers = [
      {
        // HR 1
        fullName: 'Ahmed Raza',
        cnic: '35201-1234567-1',
        email: 'ahmed.hr@company.com',
        mobile: '03001234567',
        alternateMobile: '03007654321',
        fatherName: 'Raza Ahmed',
        dateOfBirth: new Date('1985-05-15'),
        gender: 'male' as const,
        maritalStatus: 'married' as const,
        address: 'House No. 123, Main Boulevard, Lahore, Pakistan',
        qualification: {
          academic: 'MBA in Human Resource Management',
          other: 'PHR Certified, SHRM Member'
        },
        jobTitle: 'HR Manager',
        department: 'hr' as const,
        responsibility: 'Employee Management, Recruitment, Policy Implementation',
        timing: '9:00 AM - 5:00 PM',
        monthOff: 'Sunday',
        dateOfJoining: new Date('2020-01-15'),
        salary: 150000,
        incentive: 20000,
        taxDeduction: true,
        taxAmount: 15000,
        status: 'active' as const,
        role: 'hr' as const,
        createdBy: adminUser._id,
        isActive: true,
        bankAccount: {
          bankName: 'HBL',
          accountNumber: '1234567890123',
          accountTitle: 'Ahmed Raza'
        },
        emergencyContact: {
          name: 'Sara Raza',
          relation: 'Wife',
          mobile: '03121234567'
        },
        reference: 'Internal Promotion'
      },
      {
        // HR 2
        fullName: 'Sara Khan',
        cnic: '35202-2345678-2',
        email: 'sara.hr@company.com',
        mobile: '03122345678',
        alternateMobile: '03019876543',
        fatherName: 'Khan Sahab',
        dateOfBirth: new Date('1990-08-22'),
        gender: 'female' as const,
        maritalStatus: 'single' as const,
        address: 'Flat 45, Gulberg III, Lahore, Pakistan',
        qualification: {
          academic: 'BS Psychology',
          other: 'SHRM Certified, HR Analytics Specialist'
        },
        jobTitle: 'HR Executive',
        department: 'hr' as const,
        responsibility: 'Recruitment, Employee Onboarding, Training',
        timing: '9:00 AM - 5:00 PM',
        monthOff: 'Saturday',
        dateOfJoining: new Date('2022-03-01'),
        salary: 80000,
        incentive: 10000,
        taxDeduction: true,
        taxAmount: 8000,
        status: 'active' as const,
        role: 'hr' as const,
        createdBy: adminUser._id,
        isActive: true,
        bankAccount: {
          bankName: 'UBL',
          accountNumber: '2345678901234',
          accountTitle: 'Sara Khan'
        },
        emergencyContact: {
          name: 'Ali Khan',
          relation: 'Brother',
          mobile: '03219876543'
        },
        reference: 'Campus Recruitment'
      }
    ];

    let hrCount = 0;
    for (let i = 0; i < hrUsers.length; i++) {
      const hrData = hrUsers[i];
      const rollNo = generateEmployeeId('hr', i + 1);
      
      // Check if HR already exists
      const existingHR = await User.findOne({ 
        $or: [
          { cnic: hrData.cnic },
          { email: hrData.email }
        ]
      });

      if (existingHR) {
        console.log(`⚠️ HR already exists: ${hrData.fullName}`);
        
        if (updateUsers) {
          // Update existing HR
          const password = generatePassword(hrData.cnic);
          existingHR.password = password;
          existingHR.rollNo = rollNo;
          await existingHR.save();
          console.log(`   ✅ Updated: ${rollNo} | Password: ${password}`);
          hrCount++;
        }
      } else {
        // Create new HR
        const password = generatePassword(hrData.cnic);
        const hrUser = await User.create({
          ...hrData,
          rollNo,
          password
        });
        hrCount++;
        console.log(`✅ Created HR: ${hrUser.fullName} (${rollNo})`);
        console.log(`   📧 Email: ${hrUser.email}`);
        console.log(`   🔑 Password: ${password}`);
        console.log(`   📱 Mobile: ${hrUser.mobile}`);
      }
    }

    // ========== CREATE 10 EMPLOYEE USERS ==========
    console.log('\n👥 Creating Employee Users...');
    console.log('=============================');

    const employeeUsers = [
      // IT Department Employees (5)
      {
        fullName: 'Ali Hassan',
        cnic: '35203-3456789-3',
        email: 'ali.hassan@company.com',
        mobile: '03013456789',
        fatherName: 'Hassan Ahmed',
        dateOfBirth: new Date('1993-02-14'),
        gender: 'male' as const,
        maritalStatus: 'single' as const,
        address: '123 Model Town, Lahore, Pakistan',
        qualification: {
          academic: 'BS Computer Science',
          other: 'AWS Solutions Architect, Node.js Expert'
        },
        jobTitle: 'Senior Software Engineer',
        department: 'it' as const,
        responsibility: 'Backend Development, API Design, System Architecture',
        timing: '9:00 AM - 5:00 PM',
        monthOff: 'Sunday',
        dateOfJoining: new Date('2021-06-01'),
        salary: 120000,
        incentive: 15000,
        taxDeduction: true,
        taxAmount: 12000,
        status: 'active' as const,
        role: 'employee' as const,
        createdBy: adminUser._id,
        isActive: true,
        bankAccount: {
          bankName: 'MCB',
          accountNumber: '3456789012345',
          accountTitle: 'Ali Hassan'
        },
        emergencyContact: {
          name: 'Fatima Hassan',
          relation: 'Sister',
          mobile: '03001112222'
        }
      },
      {
        fullName: 'Fatima Noor',
        cnic: '35204-4567890-4',
        email: 'fatima.noor@company.com',
        mobile: '03134567890',
        fatherName: 'Noor Muhammad',
        dateOfBirth: new Date('1995-07-30'),
        gender: 'female' as const,
        maritalStatus: 'married' as const,
        address: '456 Defense Phase 5, Karachi, Pakistan',
        qualification: {
          academic: 'BS Design',
          other: 'Adobe Certified Expert, Figma Specialist'
        },
        jobTitle: 'UI/UX Designer',
        department: 'it' as const,
        responsibility: 'Design System Management, User Research, Prototyping',
        timing: '10:00 AM - 6:00 PM',
        monthOff: 'Saturday',
        dateOfJoining: new Date('2022-08-15'),
        salary: 90000,
        incentive: 10000,
        taxDeduction: true,
        taxAmount: 9000,
        status: 'active' as const,
        role: 'employee' as const,
        createdBy: adminUser._id,
        isActive: true
      },
      {
        fullName: 'Bilal Akhtar',
        cnic: '35205-5678901-5',
        email: 'bilal.akhtar@company.com',
        mobile: '03025678901',
        fatherName: 'Akhtar Mehmood',
        dateOfBirth: new Date('1990-11-05'),
        gender: 'male' as const,
        maritalStatus: 'married' as const,
        address: '789 Satellite Town, Rawalpindi, Pakistan',
        qualification: {
          academic: 'Masters in Computer Science',
          other: 'Kubernetes Administrator, Docker Certified'
        },
        jobTitle: 'DevOps Engineer',
        department: 'it' as const,
        responsibility: 'Cloud Infrastructure, CI/CD Pipeline, Monitoring',
        timing: 'Flexible',
        monthOff: 'Friday',
        dateOfJoining: new Date('2020-09-10'),
        salary: 140000,
        incentive: 18000,
        taxDeduction: true,
        taxAmount: 14000,
        status: 'active' as const,
        role: 'employee' as const,
        createdBy: adminUser._id,
        isActive: true
      },
      {
        fullName: 'Zainab Malik',
        cnic: '35206-6789012-6',
        email: 'zainab.malik@company.com',
        mobile: '03146789012',
        fatherName: 'Malik Saeed',
        dateOfBirth: new Date('1994-04-18'),
        gender: 'female' as const,
        maritalStatus: 'single' as const,
        address: '321 Gulshan-e-Iqbal, Karachi, Pakistan',
        qualification: {
          academic: 'BS Software Engineering',
          other: 'ISTQB Certified, Selenium Expert'
        },
        jobTitle: 'QA Engineer',
        department: 'it' as const,
        responsibility: 'Automated Testing, Test Planning, Bug Tracking',
        timing: '9:30 AM - 5:30 PM',
        monthOff: 'Sunday',
        dateOfJoining: new Date('2023-01-20'),
        salary: 75000,
        incentive: 8000,
        taxDeduction: true,
        taxAmount: 7500,
        status: 'active' as const,
        role: 'employee' as const,
        createdBy: adminUser._id,
        isActive: true
      },
      {
        fullName: 'Usman Ghani',
        cnic: '35207-7890123-7',
        email: 'usman.ghani@company.com',
        mobile: '03037890123',
        fatherName: 'Ghaniullah',
        dateOfBirth: new Date('1988-12-25'),
        gender: 'male' as const,
        maritalStatus: 'married' as const,
        address: '555 Faisal Town, Lahore, Pakistan',
        qualification: {
          academic: 'MCS + MBA',
          other: 'PMP Certified, Scrum Master, Agile Methodology'
        },
        jobTitle: 'Project Manager',
        department: 'it' as const,
        responsibility: 'Project Delivery, Team Management, Client Communication',
        timing: '9:00 AM - 6:00 PM',
        monthOff: 'Saturday',
        dateOfJoining: new Date('2019-03-12'),
        salary: 180000,
        incentive: 25000,
        taxDeduction: true,
        taxAmount: 18000,
        status: 'active' as const,
        role: 'employee' as const,
        createdBy: adminUser._id,
        isActive: true
      },
      // Finance Department Employees (5)
      {
        fullName: 'Nida Shah',
        cnic: '35208-8901234-8',
        email: 'nida.shah@company.com',
        mobile: '03158901234',
        fatherName: 'Shah Jahan',
        dateOfBirth: new Date('1992-03-08'),
        gender: 'female' as const,
        maritalStatus: 'single' as const,
        address: '222 Clifton, Karachi, Pakistan',
        qualification: {
          academic: 'ACCA',
          other: 'QuickBooks Expert, Financial Modeling'
        },
        jobTitle: 'Accounts Manager',
        department: 'finance' as const,
        responsibility: 'Financial Reporting, Budgeting, Audit Coordination',
        timing: '9:00 AM - 5:00 PM',
        monthOff: 'Sunday',
        dateOfJoining: new Date('2021-04-01'),
        salary: 110000,
        incentive: 12000,
        taxDeduction: true,
        taxAmount: 11000,
        status: 'active' as const,
        role: 'employee' as const,
        createdBy: adminUser._id,
        isActive: true
      },
      {
        fullName: 'Kamran Yousuf',
        cnic: '35209-9012345-9',
        email: 'kamran.yousuf@company.com',
        mobile: '03049012345',
        fatherName: 'Yousuf Ali',
        dateOfBirth: new Date('1987-06-12'),
        gender: 'male' as const,
        maritalStatus: 'married' as const,
        address: '777 Garden Town, Lahore, Pakistan',
        qualification: {
          academic: 'MBA Finance',
          other: 'CFA Level II, Excel Modeling Expert'
        },
        jobTitle: 'Financial Analyst',
        department: 'finance' as const,
        responsibility: 'Budget Analysis, Financial Planning, Investment Analysis',
        timing: '9:00 AM - 5:00 PM',
        monthOff: 'Saturday',
        dateOfJoining: new Date('2020-07-15'),
        salary: 95000,
        incentive: 10000,
        taxDeduction: true,
        taxAmount: 9500,
        status: 'active' as const,
        role: 'employee' as const,
        createdBy: adminUser._id,
        isActive: true
      },
      {
        fullName: 'Rabia Tariq',
        cnic: '35210-0123456-0',
        email: 'rabia.tariq@company.com',
        mobile: '03160123456',
        fatherName: 'Tariq Mehmood',
        dateOfBirth: new Date('1996-09-22'),
        gender: 'female' as const,
        maritalStatus: 'single' as const,
        address: '444 Bahria Town, Lahore, Pakistan',
        qualification: {
          academic: 'B.Com',
          other: 'MS Excel Expert, Tally ERP9 Certified'
        },
        jobTitle: 'Accounts Officer',
        department: 'finance' as const,
        responsibility: 'Invoice Processing, Accounts Receivable, Bank Reconciliation',
        timing: '9:00 AM - 5:00 PM',
        monthOff: 'Friday',
        dateOfJoining: new Date('2023-02-10'),
        salary: 60000,
        incentive: 6000,
        taxDeduction: true,
        taxAmount: 6000,
        status: 'active' as const,
        role: 'employee' as const,
        createdBy: adminUser._id,
        isActive: true
      },
      {
        fullName: 'Fahad Masood',
        cnic: '35211-1234567-1',
        email: 'fahad.masood@company.com',
        mobile: '03051234567',
        fatherName: 'Masood Ahmed',
        dateOfBirth: new Date('1989-01-30'),
        gender: 'male' as const,
        maritalStatus: 'married' as const,
        address: '888 DHA Phase 6, Karachi, Pakistan',
        qualification: {
          academic: 'CA',
          other: 'FBR Registered, Tax Consultant License'
        },
        jobTitle: 'Tax Consultant',
        department: 'finance' as const,
        responsibility: 'Tax Planning, FBR Compliance, Tax Filing',
        timing: '10:00 AM - 6:00 PM',
        monthOff: 'Sunday',
        dateOfJoining: new Date('2019-11-05'),
        salary: 130000,
        incentive: 15000,
        taxDeduction: true,
        taxAmount: 13000,
        status: 'active' as const,
        role: 'employee' as const,
        createdBy: adminUser._id,
        isActive: true
      },
      {
        fullName: 'Hina Qureshi',
        cnic: '35212-2345678-2',
        email: 'hina.qureshi@company.com',
        mobile: '03172345678',
        fatherName: 'Qureshi Sohail',
        dateOfBirth: new Date('1993-10-15'),
        gender: 'female' as const,
        maritalStatus: 'married' as const,
        address: '999 Gulistan Colony, Lahore, Pakistan',
        qualification: {
          academic: 'BBA',
          other: 'HRMS Specialist, Payroll Processing Expert'
        },
        jobTitle: 'Payroll Officer',
        department: 'finance' as const,
        responsibility: 'Salary Processing, Deductions Calculation, PF Management',
        timing: '9:00 AM - 5:00 PM',
        monthOff: 'Saturday',
        dateOfJoining: new Date('2022-05-20'),
        salary: 70000,
        incentive: 7000,
        taxDeduction: true,
        taxAmount: 7000,
        status: 'active' as const,
        role: 'employee' as const,
        createdBy: adminUser._id,
        isActive: true
      }
    ];

    let employeeCount = 0;
    for (let i = 0; i < employeeUsers.length; i++) {
      const empData = employeeUsers[i];
      const rollNo = generateEmployeeId(empData.department, i + 1);
      
      // Check if employee already exists
      const existingEmp = await User.findOne({ 
        $or: [
          { cnic: empData.cnic },
          { email: empData.email }
        ]
      });

      if (existingEmp) {
        console.log(`⚠️ Employee already exists: ${empData.fullName}`);
        
        if (updateUsers) {
          // Update existing employee
          const password = generatePassword(empData.cnic);
          existingEmp.password = password;
          existingEmp.rollNo = rollNo;
          await existingEmp.save();
          console.log(`   ✅ Updated: ${rollNo} | Password: ${password}`);
          employeeCount++;
        }
      } else {
        // Create new employee
        const password = generatePassword(empData.cnic);
        const employee = await User.create({
          ...empData,
          rollNo,
          password
        });
        employeeCount++;
        console.log(`✅ Created Employee: ${employee.fullName} (${rollNo})`);
        console.log(`   📧 Email: ${employee.email}`);
        console.log(`   🔑 Password: ${password}`);
        console.log(`   💼 Department: ${employee.department.toUpperCase()}`);
      }
    }

    // ========== SUMMARY ==========
    console.log('\n📊 SEEDING SUMMARY');
    console.log('==================');
    console.log(`👑 Admin Users: 1 (pre-existing)`);
    console.log(`👥 HR Users Created/Updated: ${hrCount}`);
    console.log(`👤 Employee Users Created/Updated: ${employeeCount}`);
    console.log(`📈 Total Users in System: ${1 + hrCount + employeeCount}`);
    
    // Display sample login credentials
    console.log('\n🔐 SAMPLE LOGIN CREDENTIALS:');
    console.log('============================');
    console.log('1. Admin:');
    console.log('   📧 Email: admin@erp.com');
    console.log('   🔑 Password: Admin@123');
    console.log('\n2. HR Manager:');
    console.log('   📧 Email: ahmed.hr@company.com');
    console.log('   🔑 Password: [CNIC last 4 digits] + random letter + @');
    console.log('   Example: 4567A@');
    console.log('\n3. Employee (IT):');
    console.log('   📧 Email: ali.hassan@company.com');
    console.log('   🔑 Password: [CNIC last 4 digits] + random letter + @');
    console.log('   Example: 6789B@');
    
    console.log('\n⚠️ IMPORTANT NOTES:');
    console.log('==================');
    console.log('1. All passwords are generated from CNIC (last 4 digits + random letter + @)');
    console.log('2. Users should change passwords on first login');
    console.log('3. Use --update flag to update existing users\' passwords');
    console.log('4. Use --force flag to delete all non-admin users and recreate');
    
    console.log('\n✅ Seeding completed successfully!');
    
    process.exit(0);
    
  } catch (error: any) {
    console.error('❌ Error seeding users:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      console.error(`❌ Duplicate ${field}: ${value}`);
    }
    
    if (error.name === 'ValidationError') {
      console.error('❌ Validation Errors:');
      Object.keys(error.errors).forEach(key => {
        console.error(`   - ${key}: ${error.errors[key].message}`);
      });
    }
    
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const showHelp = args.includes('--help') || args.includes('-h');

if (showHelp) {
  console.log(`
User Seeding Script
===================

Usage:
  npm run seed:users [options]

Options:
  --help, -h      Show this help message
  --force         Delete all non-admin users and recreate
  --update        Update passwords for existing users

Examples:
  npm run seed:users           Create users if not exist
  npm run seed:users --force   Delete all and create fresh users
  npm run seed:users --update  Update passwords for existing users

Note: Department values must be from this list:
  ${DEPARTMENT_VALUES.join(', ')}
  `);
  process.exit(0);
}

seedUsers();