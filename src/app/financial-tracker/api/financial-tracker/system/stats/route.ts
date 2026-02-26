// src/app/financial-tracker/api/financial-tracker/system/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import RecordModel from '@/app/financial-tracker/models/record.model';
import UserModel from '@/models/User';
import EntityModel from '@/app/financial-tracker/models/entity-model';
import FieldModel from '@/app/financial-tracker/models/custom-field.model';
import ActivityModel from '@/app/financial-tracker/models/activity-log.model';
import os from 'os';
import { startOfDay, subDays, subWeeks, subMonths, subQuarters, subYears } from 'date-fns';

// ==================== TYPES ====================
// 🔥 FIXED: Added all aggregation fields
interface FinancialAggregationResult {
  total: number;
  avg?: number;
  min?: number;
  max?: number;
  count?: number;
  _id: null;
}

interface StorageResult {
  storage: number;
  _id: null;
}

interface ModuleDistribution {
  _id: string;
  count: number;
}

interface StatusDistribution {
  _id: string;
  count: number;
}

interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'error';
  memory: number;
  cpu: number;
  disk: number;
  database: number;
  api: number;
  issues: string[];
}

interface PerformanceMetrics {
  avgQueryTime: number;
  avgResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  requestsPerMinute: number;
}

// ==================== CONSTANTS ====================
const MEMORY_WARNING_THRESHOLD = 75;
const MEMORY_ERROR_THRESHOLD = 90;
const CPU_WARNING_THRESHOLD = 3;
const CPU_ERROR_THRESHOLD = 5;
const DISK_WARNING_THRESHOLD = 80;
const DISK_ERROR_THRESHOLD = 95;

// ==================== UTILITIES ====================
const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const getDateRange = (period: 'day' | 'week' | 'month' | 'quarter' | 'year'): DateRange => {
  const now = new Date();
  const end = new Date();
  
  switch (period) {
    case 'day':
      return {
        start: startOfDay(subDays(now, 1)),
        end: startOfDay(now),
        label: '24h'
      };
    case 'week':
      return {
        start: subWeeks(now, 1),
        end: now,
        label: '7d'
      };
    case 'month':
      return {
        start: subMonths(now, 1),
        end: now,
        label: '30d'
      };
    case 'quarter':
      return {
        start: subQuarters(now, 1),
        end: now,
        label: '90d'
      };
    case 'year':
      return {
        start: subYears(now, 1),
        end: now,
        label: '365d'
      };
    default:
      return {
        start: subDays(now, 7),
        end: now,
        label: '7d'
      };
  }
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ==================== MAIN API ROUTE ====================
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    await connectDB();

    // ==================== AUTHENTICATION ====================
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized',
          code: 'UNAUTHORIZED'
        }, 
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid token',
          code: 'INVALID_TOKEN'
        }, 
        { status: 401 }
      );
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Forbidden - Admin access required',
          code: 'FORBIDDEN'
        }, 
        { status: 403 }
      );
    }

    // ==================== PARSE QUERY PARAMETERS ====================
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as 'day' | 'week' | 'month' | 'quarter' | 'year' || 'month';
    const includeSystem = searchParams.get('includeSystem') === 'true';
    const includePerformance = searchParams.get('includePerformance') === 'true';

    // ==================== DATE RANGES ====================
    const now = new Date();
    const today = startOfDay(now);
    const weekAgo = subWeeks(now, 1);
    const monthAgo = subMonths(now, 1);
    const currentRange = getDateRange(period);
    const previousRange = {
      start: subDays(currentRange.start, 7),
      end: currentRange.start,
      label: 'previous'
    };

    // ==================== PARALLEL QUERIES - CURRENT PERIOD ====================
    const [
      totalRecords,
      todayRecords,
      weekRecords,
      monthRecords,
      currentPeriodRecords,
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersWeek,
      newUsersMonth,
      totalEntities,
      enabledEntities,
      totalFields,
      systemFields,
      customFields,
      requiredFields,
      reStats,
      expenseStats,
      recentActivity,
      dbStats,
      moduleStats,
      statusStats
    ] = await Promise.all([
      // Record counts
      RecordModel.countDocuments(),
      RecordModel.countDocuments({ createdAt: { $gte: today } }),
      RecordModel.countDocuments({ createdAt: { $gte: weekAgo } }),
      RecordModel.countDocuments({ createdAt: { $gte: monthAgo } }),
      RecordModel.countDocuments({ createdAt: { $gte: currentRange.start, $lt: currentRange.end } }),
      
      // User stats
      UserModel.countDocuments(),
      UserModel.countDocuments({ lastLogin: { $gte: weekAgo } }),
      UserModel.countDocuments({ createdAt: { $gte: today } }),
      UserModel.countDocuments({ createdAt: { $gte: weekAgo } }),
      UserModel.countDocuments({ createdAt: { $gte: monthAgo } }),
      
      // Entity stats
      EntityModel.countDocuments(),
      EntityModel.countDocuments({ isEnabled: true }),
      
      // Field stats
      FieldModel.countDocuments(),
      FieldModel.countDocuments({ isSystem: true }),
      FieldModel.countDocuments({ isSystem: false }),
      FieldModel.countDocuments({ required: true }),
      
      // 🔥 FIXED: Financial stats - RE with all fields
      RecordModel.aggregate<FinancialAggregationResult>([
        { $match: { module: 're' } },
        { 
          $group: { 
            _id: null, 
            total: { $sum: { $ifNull: ['$data.amount', '$data.total', 0] } },
            avg: { $avg: { $ifNull: ['$data.amount', '$data.total', 0] } },
            min: { $min: { $ifNull: ['$data.amount', '$data.total', 0] } },
            max: { $max: { $ifNull: ['$data.amount', '$data.total', 0] } },
            count: { $sum: 1 }
          }
        }
      ]),
      
      // 🔥 FIXED: Financial stats - Expense with all fields
      RecordModel.aggregate<FinancialAggregationResult>([
        { $match: { module: 'expense' } },
        { 
          $group: { 
            _id: null, 
            total: { $sum: { $ifNull: ['$data.amount', '$data.total', 0] } },
            avg: { $avg: { $ifNull: ['$data.amount', '$data.total', 0] } },
            min: { $min: { $ifNull: ['$data.amount', '$data.total', 0] } },
            max: { $max: { $ifNull: ['$data.amount', '$data.total', 0] } },
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Recent activity
      ActivityModel.countDocuments({ createdAt: { $gte: subDays(now, 1) } }),
      
      // Database storage estimation
      RecordModel.aggregate<StorageResult>([
        { $group: { _id: null, storage: { $sum: { $bsonSize: '$$ROOT' } } } }
      ]),
      
      // Module distribution
      RecordModel.aggregate<ModuleDistribution>([
        { $group: { _id: '$module', count: { $sum: 1 } } }
      ]),
      
      // Status distribution
      RecordModel.aggregate<StatusDistribution>([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    // ==================== PARALLEL QUERIES - PREVIOUS PERIOD ====================
    const [
      previousPeriodRecords,
      previousPeriodRE,
      previousPeriodExpense
    ] = await Promise.all([
      RecordModel.countDocuments({ 
        createdAt: { $gte: previousRange.start, $lt: previousRange.end } 
      }),
      
      RecordModel.aggregate<FinancialAggregationResult>([
        { 
          $match: { 
            module: 're',
            createdAt: { $gte: previousRange.start, $lt: previousRange.end }
          }
        },
        { $group: { _id: null, total: { $sum: { $ifNull: ['$data.amount', '$data.total', 0] } } } }
      ]),
      
      RecordModel.aggregate<FinancialAggregationResult>([
        { 
          $match: { 
            module: 'expense',
            createdAt: { $gte: previousRange.start, $lt: previousRange.end }
          }
        },
        { $group: { _id: null, total: { $sum: { $ifNull: ['$data.amount', '$data.total', 0] } } } }
      ])
    ]);

    // ==================== SYSTEM METRICS ====================
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = (usedMemory / totalMemory) * 100;
    
    const cpuLoad = os.loadavg();
    const cpuCores = os.cpus().length;
    const cpuUsage = (cpuLoad[0] / cpuCores) * 100;
    
    const uptime = os.uptime();
    const uptimeDays = Math.floor(uptime / 86400);
    const uptimeHours = Math.floor((uptime % 86400) / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);
    
    // ==================== CALCULATE FINANCIAL METRICS ====================
    // 🔥 FIXED: Safe access with optional chaining and nullish coalescing
    const reStatsData = reStats[0] || { total: 0, avg: 0, min: 0, max: 0, count: 0 };
    const expenseStatsData = expenseStats[0] || { total: 0, avg: 0, min: 0, max: 0, count: 0 };
    
    const reTotalValue = reStatsData.total || 0;
    const reAvgValue = reStatsData.avg || 0;
    const reMinValue = reStatsData.min || 0;
    const reMaxValue = reStatsData.max || 0;
    const reCountValue = reStatsData.count || 0;
    
    const expenseTotalValue = expenseStatsData.total || 0;
    const expenseAvgValue = expenseStatsData.avg || 0;
    const expenseMinValue = expenseStatsData.min || 0;
    const expenseMaxValue = expenseStatsData.max || 0;
    const expenseCountValue = expenseStatsData.count || 0;
    
    const netProfit = reTotalValue - expenseTotalValue;
    const profitMargin = reTotalValue > 0 ? (netProfit / reTotalValue) * 100 : 0;
    
    const previousReTotal = previousPeriodRE[0]?.total || 0;
    const previousExpenseTotal = previousPeriodExpense[0]?.total || 0;
    const previousNetProfit = previousReTotal - previousExpenseTotal;

    // ==================== CALCULATE TRENDS ====================
    const recordsTrend = calculatePercentageChange(currentPeriodRecords, previousPeriodRecords);
    const reTrend = calculatePercentageChange(reTotalValue, previousReTotal);
    const expenseTrend = calculatePercentageChange(expenseTotalValue, previousExpenseTotal);
    const profitTrend = calculatePercentageChange(netProfit, previousNetProfit);
    const usersTrend = calculatePercentageChange(newUsersMonth, newUsersMonth * 0.8); // Placeholder

    // ==================== DETERMINE SYSTEM HEALTH ====================
    let healthStatus: SystemHealth['status'] = 'healthy';
    const healthIssues: string[] = [];

    if (memoryUsage > MEMORY_ERROR_THRESHOLD) {
      healthStatus = 'error';
      healthIssues.push(`Memory usage critical: ${memoryUsage.toFixed(1)}%`);
    } else if (memoryUsage > MEMORY_WARNING_THRESHOLD) {
      healthStatus = 'warning';
      healthIssues.push(`Memory usage high: ${memoryUsage.toFixed(1)}%`);
    }

    if (cpuUsage > CPU_ERROR_THRESHOLD * 100) {
      healthStatus = 'error';
      healthIssues.push(`CPU load critical: ${cpuUsage.toFixed(1)}%`);
    } else if (cpuUsage > CPU_WARNING_THRESHOLD * 100) {
      healthStatus = 'warning';
      healthIssues.push(`CPU load high: ${cpuUsage.toFixed(1)}%`);
    }

    // ==================== PERFORMANCE METRICS ====================
    const responseTime = Date.now() - startTime;
    const performance: PerformanceMetrics = {
      avgQueryTime: Math.floor(Math.random() * 50) + 20, // Simulated - replace with actual metrics
      avgResponseTime: responseTime,
      cacheHitRate: Math.floor(Math.random() * 20) + 75, // Simulated
      errorRate: Math.floor(Math.random() * 3), // Simulated
      requestsPerMinute: Math.floor(Math.random() * 1000) + 500 // Simulated
    };

    // ==================== BUILD RESPONSE ====================
    const stats = {
      success: true,
      timestamp: new Date().toISOString(),
      responseTime,
      
      // Record statistics
      records: {
        total: totalRecords,
        today: todayRecords,
        week: weekRecords,
        month: monthRecords,
        period: currentPeriodRecords,
        previousPeriod: previousPeriodRecords,
        trend: recordsTrend,
        distribution: {
          byModule: Object.fromEntries(moduleStats.map((m: ModuleDistribution) => [m._id, m.count])),
          byStatus: Object.fromEntries(statusStats.map((s: StatusDistribution) => [s._id, s.count]))
        }
      },
      
      // 🔥 FIXED: Financial statistics with proper typing
      financial: {
        revenue: {
          total: reTotalValue,
          avg: reAvgValue,
          min: reMinValue,
          max: reMaxValue,
          count: reCountValue,
          trend: reTrend
        },
        expense: {
          total: expenseTotalValue,
          avg: expenseAvgValue,
          min: expenseMinValue,
          max: expenseMaxValue,
          count: expenseCountValue,
          trend: expenseTrend
        },
        profit: {
          total: netProfit,
          margin: profitMargin,
          trend: profitTrend
        }
      },
      
      // User statistics
      users: {
        total: totalUsers,
        active: activeUsers,
        new: {
          today: newUsersToday,
          week: newUsersWeek,
          month: newUsersMonth
        },
        trend: usersTrend
      },
      
      // Entity statistics
      entities: {
        total: totalEntities,
        enabled: enabledEntities,
        disabled: totalEntities - enabledEntities
      },
      
      // Field statistics
      fields: {
        total: totalFields,
        system: systemFields,
        custom: customFields,
        required: requiredFields
      },
      
      // System statistics
      system: {
        memory: {
          total: totalMemory,
          free: freeMemory,
          used: usedMemory,
          usage: memoryUsage,
          formatted: {
            total: formatBytes(totalMemory),
            free: formatBytes(freeMemory),
            used: formatBytes(usedMemory)
          }
        },
        cpu: {
          load: cpuLoad,
          cores: cpuCores,
          usage: cpuUsage,
          model: os.cpus()[0]?.model || 'Unknown'
        },
        uptime: {
          seconds: uptime,
          formatted: `${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m`,
          days: uptimeDays,
          hours: uptimeHours,
          minutes: uptimeMinutes
        },
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        network: os.networkInterfaces()
      },
      
      // Health status
      health: {
        status: healthStatus,
        issues: healthIssues,
        memory: memoryUsage,
        cpu: cpuUsage,
        database: 98.5, // Simulated - replace with actual DB health
        api: 99.2 // Simulated
      },
      
      // Storage
      storage: {
        database: dbStats[0]?.storage || 0,
        formatted: formatBytes(dbStats[0]?.storage || 0),
        attachments: 0, // Add if you have attachment storage
        backups: 0 // Add if you track backups
      },
      
      // Activity
      activity: {
        last24h: recentActivity,
        peakHour: 14, // Simulated
        peakCount: 234 // Simulated
      },
      
      // Metadata
      metadata: {
        period: currentRange.label,
        generatedAt: new Date().toISOString(),
        version: '1.0.0'
      }
    };

    // Add performance metrics if requested
    if (includePerformance) {
      Object.assign(stats, { performance });
    }

    // Add system details if requested
    if (includeSystem) {
      Object.assign(stats, {
        process: {
          pid: process.pid,
          title: process.title,
          version: process.version,
          memoryUsage: process.memoryUsage(),
          uptime: process.uptime()
        }
      });
    }

    return NextResponse.json(stats, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'X-Response-Time': `${responseTime}ms`
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching system stats:', error);
    
    const errorResponse = {
      success: false,
      error: 'Failed to fetch system statistics',
      code: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(errorResponse, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  }
}

// ==================== OPTIONAL: CACHE INVALIDATION ====================
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Invalidate cache if you're using caching
    // await redis.del('system:stats');

    return NextResponse.json({ 
      success: true, 
      message: 'Cache invalidated successfully' 
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to invalidate cache', details: error.message },
      { status: 500 }
    );
  }
}