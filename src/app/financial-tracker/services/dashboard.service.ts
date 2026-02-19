// src/app/financial-tracker/services/dashboard.service.ts
import { Types } from 'mongoose';
import RecordModel from '../models/record.model';
import ActivityLogModel from '../models/activity-log.model';
import UserModel from '@/models/User';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday?: number;  // Made optional
  totalRecords: number;
  recordsToday?: number;   // Made optional
  recordsThisWeek?: number; // Made optional
  recordsThisMonth?: number; // Made optional
  totalRE: number;
  totalExpense: number;
  netProfit?: number;      // Made optional
  reToday?: number;        // Made optional
  expenseToday?: number;   // Made optional
  pendingApprovals: number;
  approvedToday?: number;  // Made optional
  rejectedToday?: number;  // Made optional
  moduleStats: {
    re: { count: number; total: number; avg: number; growth?: number };
    expense: { count: number; total: number; avg: number; growth?: number };
  };
  weeklyData?: Array<{ day: string; re: number; expense: number; profit: number }>;
  monthlyData?: Array<{ month: string; re: number; expense: number }>;
  categoryData?: Array<{ name: string; value: number; color: string }>;
  recentActivities?: Array<{
    id: string;
    user: string;
    action: string;
    module: string;
    entity: string;
    timestamp: string;
  }>;
  topUsers?: Array<{
    id: string;
    name: string;
    role: string;
    records: number;
    reAmount: number;
    expenseAmount: number;
  }>;
  systemHealth?: {
    status: 'healthy' | 'warning' | 'error';
    uptime: string;
    lastBackup: string;
    errors24h: number;
    warnings24h: number;
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

    // Get new users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await UserModel.countDocuments({
      createdAt: { $gte: today }
    });

    // Get total records
    const totalRecords = await RecordModel.countDocuments(matchCondition);

    // Get records today
    const recordsToday = await RecordModel.countDocuments({
      ...matchCondition,
      createdAt: { $gte: today }
    });

    // Get records this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recordsThisWeek = await RecordModel.countDocuments({
      ...matchCondition,
      createdAt: { $gte: weekAgo }
    });

    // Get records this month
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const recordsThisMonth = await RecordModel.countDocuments({
      ...matchCondition,
      createdAt: { $gte: monthAgo }
    });

    // Get RE and Expense records
    const reRecords = await RecordModel.find({ 
      ...matchCondition, 
      module: 're' 
    }).lean();
    
    const expenseRecords = await RecordModel.find({ 
      ...matchCondition, 
      module: 'expense' 
    }).lean();

    // Calculate totals with safe access
    const totalRE = reRecords.reduce((sum, record) => {
      const amount = this.getAmountFromRecord(record);
      return sum + amount;
    }, 0);

    const totalExpense = expenseRecords.reduce((sum, record) => {
      const amount = this.getAmountFromRecord(record);
      return sum + amount;
    }, 0);

    // Calculate today's RE and Expense
    const reToday = reRecords
      .filter(r => new Date(r.createdAt) >= today)
      .reduce((sum, r) => sum + this.getAmountFromRecord(r), 0);

    const expenseToday = expenseRecords
      .filter(r => new Date(r.createdAt) >= today)
      .reduce((sum, r) => sum + this.getAmountFromRecord(r), 0);

    // Net profit
    const netProfit = totalRE - totalExpense;

    // Pending approvals
    const pendingApprovals = await RecordModel.countDocuments({
      ...matchCondition,
      status: 'submitted'
    });

    // Approved today
    const approvedToday = await RecordModel.countDocuments({
      ...matchCondition,
      status: 'approved',
      updatedAt: { $gte: today }
    });

    // Rejected today
    const rejectedToday = await RecordModel.countDocuments({
      ...matchCondition,
      status: 'rejected',
      updatedAt: { $gte: today }
    });

    // Module stats
    const moduleStats = {
      re: {
        count: reRecords.length,
        total: totalRE,
        avg: reRecords.length > 0 ? totalRE / reRecords.length : 0,
        growth: this.calculateGrowth(reRecords, 30)
      },
      expense: {
        count: expenseRecords.length,
        total: totalExpense,
        avg: expenseRecords.length > 0 ? totalExpense / expenseRecords.length : 0,
        growth: this.calculateGrowth(expenseRecords, 30)
      }
    };

    // Generate weekly data
    const weeklyData = await this.generateWeeklyData(matchCondition);

    // Generate monthly data
    const monthlyData = await this.generateMonthlyData(matchCondition);

    // Generate category data
    const categoryData = await this.generateCategoryData(matchCondition);

    return {
      totalUsers,
      activeUsers,
      newUsersToday,
      totalRecords,
      recordsToday,
      recordsThisWeek,
      recordsThisMonth,
      totalRE,
      totalExpense,
      netProfit,
      reToday,
      expenseToday,
      pendingApprovals,
      approvedToday,
      rejectedToday,
      moduleStats,
      weeklyData,
      monthlyData,
      categoryData
    };
  }

  /**
   * Safely get amount from record
   */
  private static getAmountFromRecord(record: any): number {
    try {
      if (!record.data) return 0;
      
      // Handle both Map and plain object
      if (record.data instanceof Map) {
        return Number(record.data.get('amount')) || 0;
      } else if (typeof record.data === 'object') {
        return Number((record.data as any).amount) || 0;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  /**
   * Calculate growth percentage
   */
  private static calculateGrowth(records: any[], days: number): number {
    const now = new Date();
    const halfAgo = new Date();
    halfAgo.setDate(halfAgo.getDate() - Math.floor(days / 2));
    
    const firstHalf = records.filter(r => 
      new Date(r.createdAt) < halfAgo
    ).length;
    
    const secondHalf = records.filter(r => 
      new Date(r.createdAt) >= halfAgo
    ).length;
    
    if (firstHalf === 0) return 100;
    return Math.round(((secondHalf - firstHalf) / firstHalf) * 100);
  }

  /**
   * Generate weekly data for charts
   */
  private static async generateWeeklyData(matchCondition: any): Promise<any[]> {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayRecords = await RecordModel.find({
        ...matchCondition,
        createdAt: { $gte: date, $lt: nextDate }
      }).lean();
      
      let re = 0;
      let expense = 0;
      
      dayRecords.forEach(record => {
        const amount = this.getAmountFromRecord(record);
        if (record.module === 're') {
          re += amount;
        } else {
          expense += amount;
        }
      });
      
      result.push({
        day: days[date.getDay()],
        re,
        expense,
        profit: re - expense
      });
    }
    
    return result;
  }

  /**
   * Generate monthly data for charts
   */
  private static async generateMonthlyData(matchCondition: any): Promise<any[]> {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = [];
    
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthRecords = await RecordModel.find({
        ...matchCondition,
        createdAt: { $gte: date, $lt: nextDate }
      }).lean();
      
      let re = 0;
      let expense = 0;
      
      monthRecords.forEach(record => {
        const amount = this.getAmountFromRecord(record);
        if (record.module === 're') {
          re += amount;
        } else {
          expense += amount;
        }
      });
      
      result.push({
        month: months[date.getMonth()],
        re,
        expense
      });
    }
    
    return result;
  }

  /**
   * Generate category data for pie chart
   */
  private static async generateCategoryData(matchCondition: any): Promise<any[]> {
    const records = await RecordModel.find(matchCondition).lean();
    const categoryMap = new Map<string, number>();
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
    
    records.forEach(record => {
      let category = 'Uncategorized';
      try {
        if (record.data instanceof Map) {
          category = record.data.get('category') || record.data.get('categoryName') || 'Uncategorized';
        } else if (typeof record.data === 'object') {
          category = (record.data as any).category || (record.data as any).categoryName || 'Uncategorized';
        }
      } catch {
        category = 'Uncategorized';
      }
      
      const amount = this.getAmountFromRecord(record);
      categoryMap.set(category, (categoryMap.get(category) || 0) + amount);
    });
    
    return Array.from(categoryMap.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
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
      const amount = this.getAmountFromRecord(record);
      groupedData[date].total += amount;
    });

    return Object.values(groupedData).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }
}

export default DashboardService;