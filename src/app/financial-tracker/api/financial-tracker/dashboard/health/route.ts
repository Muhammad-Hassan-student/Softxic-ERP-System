// src/app/api/financial-tracker/dashboard/health/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import os from 'os';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Calculate uptime
    const uptimeSeconds = os.uptime();
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const uptime = `${days}d ${hours}h ${minutes}m`;

    // Get last backup time (from env or mock)
    const lastBackup = process.env.LAST_BACKUP || new Date(Date.now() - 86400000).toISOString();

    // Mock error counts (replace with actual monitoring)
    const errors24h = Math.floor(Math.random() * 5);
    const warnings24h = Math.floor(Math.random() * 10);

    // Determine status
    let status: 'healthy' | 'warning' | 'error' = 'healthy';
    if (errors24h > 3) status = 'error';
    else if (warnings24h > 5 || errors24h > 0) status = 'warning';

    return NextResponse.json({
      status,
      uptime,
      lastBackup: new Date(lastBackup).toLocaleString(),
      errors24h,
      warnings24h,
      memory: {
        total: Math.round(os.totalmem() / 1024 / 1024 / 1024 * 10) / 10 + ' GB',
        free: Math.round(os.freemem() / 1024 / 1024 / 1024 * 10) / 10 + ' GB',
        usage: Math.round((1 - os.freemem() / os.totalmem()) * 100) + '%'
      },
      cpu: os.cpus().length + ' cores',
      loadAvg: os.loadavg().map(l => Math.round(l * 10) / 10)
    });

  } catch (error: any) {
    console.error('System health error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system health', details: error.message },
      { status: 500 }
    );
  }
}