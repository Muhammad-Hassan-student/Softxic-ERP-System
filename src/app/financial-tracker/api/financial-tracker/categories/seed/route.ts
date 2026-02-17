import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import CategoryModel from '@/app/financial-tracker/models/category.model';

// POST /api/financial-tracker/categories/seed - Initialize default categories
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Only admin can seed categories
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Default categories for RE module
    const reCategories = [
      // Dealer categories
      { module: 're', entity: 'dealer', name: 'Commission Paid', type: 'expense', color: '#EF4444', isSystem: true },
      { module: 're', entity: 'dealer', name: 'Incentives', type: 'income', color: '#10B981', isSystem: true },
      { module: 're', entity: 'dealer', name: 'Bonus', type: 'income', color: '#3B82F6', isSystem: true },
      
      // FHH Client categories
      { module: 're', entity: 'fhh-client', name: 'Booking Amount', type: 'income', color: '#10B981', isSystem: true },
      { module: 're', entity: 'fhh-client', name: 'Installment Received', type: 'income', color: '#3B82F6', isSystem: true },
      { module: 're', entity: 'fhh-client', name: 'Late Payment Fee', type: 'income', color: '#F59E0B', isSystem: true },
      
      // CP Client categories
      { module: 're', entity: 'cp-client', name: 'Down Payment', type: 'income', color: '#10B981', isSystem: true },
      { module: 're', entity: 'cp-client', name: 'Monthly Installment', type: 'income', color: '#3B82F6', isSystem: true },
      { module: 're', entity: 'cp-client', name: 'Processing Fee', type: 'income', color: '#8B5CF6', isSystem: true },
      
      // Builder categories
      { module: 're', entity: 'builder', name: 'Project Commission', type: 'income', color: '#10B981', isSystem: true },
      { module: 're', entity: 'builder', name: 'Marketing Support', type: 'expense', color: '#EF4444', isSystem: true },
      { module: 're', entity: 'builder', name: 'Site Visit Expense', type: 'expense', color: '#F59E0B', isSystem: true },
      
      // Project categories
      { module: 're', entity: 'project', name: 'Revenue', type: 'income', color: '#10B981', isSystem: true },
      { module: 're', entity: 'project', name: 'Development Cost', type: 'expense', color: '#EF4444', isSystem: true },
      { module: 're', entity: 'project', name: 'Marketing Cost', type: 'expense', color: '#F59E0B', isSystem: true }
    ];

    // Default categories for Expense module
    const expenseCategories = [
      // Office categories
      { module: 'expense', entity: 'office', name: 'Office Rent', type: 'expense', color: '#EF4444', isSystem: true },
      { module: 'expense', entity: 'office', name: 'Salary', type: 'expense', color: '#EF4444', isSystem: true },
      { module: 'expense', entity: 'office', name: 'Marketing Ads', type: 'expense', color: '#F59E0B', isSystem: true },
      { module: 'expense', entity: 'office', name: 'Petrol', type: 'expense', color: '#8B5CF6', isSystem: true },
      { module: 'expense', entity: 'office', name: 'Utility Bills', type: 'expense', color: '#EC4899', isSystem: true },
      { module: 'expense', entity: 'office', name: 'Commission Paid to Dealer', type: 'expense', color: '#EF4444', isSystem: true },
      { module: 'expense', entity: 'office', name: 'Software Subscription', type: 'expense', color: '#3B82F6', isSystem: true },
      { module: 'expense', entity: 'office', name: 'Travel Expense', type: 'expense', color: '#F59E0B', isSystem: true },
      
      // Dealer categories (expense)
      { module: 'expense', entity: 'dealer', name: 'Commission', type: 'expense', color: '#EF4444', isSystem: true },
      { module: 'expense', entity: 'dealer', name: 'Marketing Support', type: 'expense', color: '#F59E0B', isSystem: true },
      { module: 'expense', entity: 'dealer', name: 'Training Cost', type: 'expense', color: '#8B5CF6', isSystem: true },
      
      // FHH Client categories (expense)
      { module: 'expense', entity: 'fhh-client', name: 'Client Entertainment', type: 'expense', color: '#EF4444', isSystem: true },
      { module: 'expense', entity: 'fhh-client', name: 'Gifts', type: 'expense', color: '#F59E0B', isSystem: true },
      
      // CP Client categories (expense)
      { module: 'expense', entity: 'cp-client', name: 'Client Meetings', type: 'expense', color: '#EF4444', isSystem: true },
      { module: 'expense', entity: 'cp-client', name: 'Documentation Cost', type: 'expense', color: '#3B82F6', isSystem: true },
      
      // Project categories (expense)
      { module: 'expense', entity: 'project', name: 'Site Expenses', type: 'expense', color: '#EF4444', isSystem: true },
      { module: 'expense', entity: 'project', name: 'Material Cost', type: 'expense', color: '#F59E0B', isSystem: true },
      { module: 'expense', entity: 'project', name: 'Labor Cost', type: 'expense', color: '#8B5CF6', isSystem: true },
      
      // All entities categories
      { module: 'expense', entity: 'all', name: 'Stationery', type: 'expense', color: '#3B82F6', isSystem: true },
      { module: 'expense', entity: 'all', name: 'Office Supplies', type: 'expense', color: '#10B981', isSystem: true },
      { module: 'expense', entity: 'all', name: 'Miscellaneous', type: 'expense', color: '#6B7280', isSystem: true }
    ];

    const allCategories = [...reCategories, ...expenseCategories];
    
    const results = {
      created: 0,
      skipped: 0,
      errors: 0
    };

    for (const cat of allCategories) {
      try {
        // Check if category already exists
        const existing = await CategoryModel.findOne({
          module: cat.module,
          entity: cat.entity,
          name: cat.name
        });

        if (!existing) {
          await CategoryModel.create({
            ...cat,
            createdBy: decoded.userId,
            updatedBy: decoded.userId
          });
          results.created++;
        } else {
          results.skipped++;
        }
      } catch (error) {
        console.error(`Error creating category ${cat.name}:`, error);
        results.errors++;
      }
    }

    return NextResponse.json({
      message: 'Default categories seeded successfully',
      results
    });

  } catch (error: any) {
    console.error('Error seeding categories:', error);
    return NextResponse.json(
      { error: 'Failed to seed categories', details: error.message },
      { status: 500 }
    );
  }
}