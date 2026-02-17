'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { usePermissions } from '@/modules/financial-tracker/hooks/usePermission';
import { useRecords } from '@/modules/financial-tracker/hooks/useRecord';
import { useFields } from '@/modules/financial-tracker/hooks/useField';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  records: Array<{
    id: string;
    amount: number;
    category: string;
    status: string;
  }>;
  total: number;
}

export default function CalendarPage() {
  const params = useParams();
  const module = params.module as 're' | 'expense';
  const entity = params.entity as string;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [showFilters, setShowFilters] = useState(false);

  const { canAccess, canCreate } = usePermissions(module, entity);
  const { records, isLoading, refreshRecords } = useRecords(module, entity);
  const { visibleFields } = useFields(module, entity);

  useEffect(() => {
    if (!canAccess) {
      toast.error('Access denied');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    }
  }, [canAccess]);

  useEffect(() => {
    generateCalendar();
  }, [currentDate, records, viewMode]);

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

    // Get last day of month
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    // Get days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    const days: CalendarDay[] = [];

    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push(createCalendarDay(date, false));
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      days.push(createCalendarDay(date, true));
    }

    // Next month days (to fill 6 rows)
    const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push(createCalendarDay(date, false));
    }

    setCalendarDays(days);
  };

  const createCalendarDay = (date: Date, isCurrentMonth: boolean): CalendarDay => {
    const dayRecords = records.filter(record => {
      const recordDate = new Date(record.createdAt);
      return recordDate.toDateString() === date.toDateString();
    });

    const total = dayRecords.reduce((sum, record) => {
      return sum + (Number(record.data.amount) || 0);
    }, 0);

    return {
      date,
      isCurrentMonth,
      isToday: date.toDateString() === new Date().toDateString(),
      records: dayRecords.map(r => ({
        id: r._id,
        amount: Number(r.data.amount) || 0,
        category: r.data.category || 'Uncategorized',
        status: r.status
      })),
      total
    };
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      case 'submitted':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CalendarIcon className="h-6 w-6 text-gray-400" />
              <h1 className="text-2xl font-bold text-gray-900">Calendar View</h1>
              <span className="text-sm text-gray-500 capitalize">
                {module} / {entity}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  viewMode === 'month' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  viewMode === 'week' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  viewMode === 'day' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
              >
                Day
              </button>

              <div className="h-6 w-px bg-gray-300 mx-2" />

              <button
                onClick={handleToday}
                className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
              >
                Today
              </button>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-gray-50 rounded-l-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 py-1.5 text-sm font-medium border-x">
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-gray-50 rounded-r-lg"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 border rounded-lg hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
              </button>

              <button
                onClick={refreshRecords}
                className="p-2 border rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="px-4 py-2 text-sm font-medium text-gray-500 text-center">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 divide-x divide-y">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                onClick={() => setSelectedDate(day.date)}
                className={`min-h-32 p-2 cursor-pointer transition-colors ${
                  day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${day.isToday ? 'ring-2 ring-blue-500 ring-inset' : ''} ${
                  selectedDate?.toDateString() === day.date.toDateString() ? 'bg-blue-50' : ''
                } hover:bg-gray-50`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${
                    day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {day.date.getDate()}
                  </span>
                  {day.total > 0 && (
                    <span className="text-xs font-medium text-blue-600">
                      PKR {day.total.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {day.records.slice(0, 3).map(record => (
                    <div
                      key={record.id}
                      className={`text-xs p-1 rounded ${getStatusColor(record.status)}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{record.category}</span>
                        <span className="font-medium">PKR {record.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  {day.records.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{day.records.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <div className="mt-6 bg-white rounded-lg border shadow-sm">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-medium text-gray-900">
                Records for {selectedDate.toLocaleDateString('default', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="divide-y">
              {calendarDays
                .find(d => d.date.toDateString() === selectedDate.toDateString())
                ?.records.map(record => (
                  <div key={record.id} className="px-6 py-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{record.category}</p>
                        <p className="text-xs text-gray-500">ID: {record.id}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-900">
                          PKR {record.amount.toLocaleString()}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

              {(!calendarDays.find(d => d.date.toDateString() === selectedDate.toDateString())?.records.length) && (
                <div className="px-6 py-8 text-center text-gray-500">
                  No records for this date
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}