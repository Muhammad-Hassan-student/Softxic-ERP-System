'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Mail,
  Users,
  Save,
  X,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ScheduleConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
}

interface ReportSchedulerProps {
  reportId: string;
  initialSchedule?: ScheduleConfig;
  onSave: (schedule: ScheduleConfig) => Promise<void>;
  onCancel?: () => void;
}

export const ReportScheduler: React.FC<ReportSchedulerProps> = ({
  reportId,
  initialSchedule,
  onSave,
  onCancel
}) => {
  const [schedule, setSchedule] = useState<ScheduleConfig>(initialSchedule || {
    enabled: true,
    frequency: 'weekly',
    time: '09:00',
    dayOfWeek: 1,
    dayOfMonth: 1,
    recipients: [],
    format: 'pdf',
    includeCharts: true
  });

  const [newEmail, setNewEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const addRecipient = () => {
    if (!newEmail) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast.error('Invalid email address');
      return;
    }
    setSchedule({
      ...schedule,
      recipients: [...schedule.recipients, newEmail]
    });
    setNewEmail('');
  };

  const removeRecipient = (email: string) => {
    setSchedule({
      ...schedule,
      recipients: schedule.recipients.filter(e => e !== email)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(schedule);
      toast.success('Report scheduled successfully');
    } catch (error) {
      toast.error('Failed to schedule report');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Enable Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <Clock className="h-5 w-5 text-gray-400" />
          <div>
            <h3 className="font-medium text-gray-900">Schedule Report</h3>
            <p className="text-sm text-gray-500">Automatically generate and send reports</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={schedule.enabled}
            onChange={(e) => setSchedule({ ...schedule, enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {schedule.enabled && (
        <>
          {/* Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <select
                value={schedule.frequency}
                onChange={(e) => setSchedule({ ...schedule, frequency: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                value={schedule.time}
                onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Day selection based on frequency */}
          {schedule.frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Day of Week
              </label>
              <select
                value={schedule.dayOfWeek}
                onChange={(e) => setSchedule({ ...schedule, dayOfWeek: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value={0}>Sunday</option>
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
              </select>
            </div>
          )}

          {schedule.frequency === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Day of Month
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={schedule.dayOfMonth}
                onChange={(e) => setSchedule({ ...schedule, dayOfMonth: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          )}

          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Export Format
            </label>
            <select
              value={schedule.format}
              onChange={(e) => setSchedule({ ...schedule, format: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          {/* Include Charts */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={schedule.includeCharts}
              onChange={(e) => setSchedule({ ...schedule, includeCharts: e.target.checked })}
              className="rounded border-gray-300 text-blue-600"
            />
            <span className="text-sm text-gray-700">Include charts in report</span>
          </label>

          {/* Recipients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Recipients
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="email@example.com"
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <button
                type="button"
                onClick={addRecipient}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              {schedule.recipients.map((email) => (
                <div key={email} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">{email}</span>
                  <button
                    type="button"
                    onClick={() => removeRecipient(email)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Next Run Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Next Scheduled Run</h4>
                <p className="text-sm text-blue-700 mt-1">
                  {schedule.frequency === 'daily' && `Daily at ${schedule.time}`}
                  {schedule.frequency === 'weekly' && `Every ${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][schedule.dayOfWeek!]} at ${schedule.time}`}
                  {schedule.frequency === 'monthly' && `Monthly on day ${schedule.dayOfMonth} at ${schedule.time}`}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>
    </form>
  );
};