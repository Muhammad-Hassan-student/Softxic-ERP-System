import { Types } from 'mongoose';
import RecordModel from '../models/record.model';
import ActivityLogModel from '../models/activity-log.model';
import UserModel from '@/models/User';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRecords: number;
  totalRE: number;
  totalExpense: number;
  pendingApprovals: number;
  moduleStats: {
    re: { count: number; total: number; avg: number };
    expense: { count: number; total: number; avg: number };
  };
}

export interface CalendarData {
  date: string;
  count: number;
  total: number;
  module?: string;
}

class DashboardService {
  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(
    module?: string,
    entity?: string,
    branchId?: string
  ): Promise<DashboardStats> {
    // Build match condition
    const matchCondition: any = { isDeleted: false };
    if (module && module !== 'all') matchCondition.module = module;
    if (entity && entity !== 'all') matchCondition.entity = entity;
    if (branchId) matchCondition.branchId = branchId;

    // Get total users
    const totalUsers = await UserModel.countDocuments();
    const activeUsers = await UserModel.countDocuments({ 
      status: 'active',
      lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    // Get total records
    const totalRecords = await RecordModel.countDocuments(matchCondition);

    // Get RE and Expense totals
    const reRecords = await RecordModel.find({ 
      ...matchCondition, 
      module: 're' 
    }).lean();
    
    const expenseRecords = await RecordModel.find({ 
      ...matchCondition, 
      module: 'expense' 
    }).lean();

    // Calculate totals
    const totalRE = reRecords.reduce((sum, record) => {
      const amount = record.data?.get('amount') || 0;
      return sum + Number(amount);
    }, 0);

    const totalExpense = expenseRecords.reduce((sum, record) => {
      const amount = record.data?.get('amount') || 0;
      return sum + Number(amount);
    }, 0);

    // Pending approvals
    const pendingApprovals = await RecordModel.countDocuments({
      ...matchCondition,
      status: 'submitted'
    });

    // Module stats
    const moduleStats = {
      re: {
        count: reRecords.length,
        total: totalRE,
        avg: reRecords.length > 0 ? totalRE / reRecords.length : 0
      },
      expense: {
        count: expenseRecords.length,
        total: totalExpense,
        avg: expenseRecords.length > 0 ? totalExpense / expenseRecords.length : 0
      }
    };

    return {
      totalUsers,
      activeUsers,
      totalRecords,
      totalRE,
      totalExpense,
      pendingApprovals,
      moduleStats
    };
  }

  /**
   * Get calendar data for date range
   */
  static async getCalendarData(
    startDate: Date,
    endDate: Date,
    module?: string,
    entity?: string,
    branchId?: string
  ): Promise<CalendarData[]> {
    const matchCondition: any = {
      isDeleted: false,
      createdAt: { $gte: startDate, $lte: endDate }
    };
    
    if (module && module !== 'all') matchCondition.module = module;
    if (entity && entity !== 'all') matchCondition.entity = entity;
    if (branchId) matchCondition.branchId = branchId;

    const records = await RecordModel.find(matchCondition).lean();

    // Group by date
    const groupedData: Record<string, CalendarData> = {};

    records.forEach(record => {
      const date = record.createdAt ? new Date(record.createdAt).toISOString().split('T')[0] : '';
      if (!date) return;

      if (!groupedData[date]) {
        groupedData[date] = {
          date,
          count: 0,
          total: 0,
          module: record.module
        };
      }

      groupedData[date].count++;
      const amount = record.data?.get('amount') || 0;
      groupedData[date].total += Number(amount);
    });

    return Object.values(groupedData).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }
}

export default DashboardService;