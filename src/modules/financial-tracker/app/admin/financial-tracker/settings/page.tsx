'use client';

import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Shield,
  Database,
  Mail,
  Globe,
  Clock,
  Save,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      companyName: 'Softxic ERP',
      timezone: 'Asia/Karachi',
      dateFormat: 'DD/MM/YYYY',
      currency: 'PKR'
    },
    notifications: {
      emailNotifications: true,
      approvalRequests: true,
      reportCompletion: true,
      userActivities: false
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordExpiry: 90,
      twoFactorRequired: false
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionDays: 30,
      lastBackup: '2024-01-15 03:00 AM'
    }
  });

  const handleSave = async () => {
    try {
      // Save settings
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure system preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="border-b">
          <nav className="flex space-x-4 px-6">
            {[
              { id: 'general', label: 'General', icon: Settings },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'backup', label: 'Backup', icon: Database },
              { id: 'email', label: 'Email', icon: Mail },
              { id: 'localization', label: 'Localization', icon: Globe }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={settings.general.companyName}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, companyName: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone
                </label>
                <select
                  value={settings.general.timezone}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, timezone: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="Asia/Karachi">Asia/Karachi</option>
                  <option value="Asia/Dubai">Asia/Dubai</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Format
                </label>
                <select
                  value={settings.general.dateFormat}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, dateFormat: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={settings.general.currency}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, currency: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="PKR">PKR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-3 max-w-md">
              <label className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive email alerts</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.emailNotifications}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, emailNotifications: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-blue-600"
                />
              </label>
              <label className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Approval Requests</p>
                  <p className="text-sm text-gray-500">Get notified for pending approvals</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.approvalRequests}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, approvalRequests: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-blue-600"
                />
              </label>
              <label className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Report Completion</p>
                  <p className="text-sm text-gray-500">When scheduled reports are ready</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.reportCompletion}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, reportCompletion: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-blue-600"
                />
              </label>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4 max-w-md">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Last backup: {settings.backup.lastBackup}
                </p>
                <button className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Create Backup Now
                </button>
              </div>

              <label className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Automatic Backup</p>
                  <p className="text-sm text-gray-500">Schedule regular backups</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.backup.autoBackup}
                  onChange={(e) => setSettings({
                    ...settings,
                    backup: { ...settings.backup, autoBackup: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-blue-600"
                />
              </label>

              {settings.backup.autoBackup && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Backup Frequency
                    </label>
                    <select
                      value={settings.backup.backupFrequency}
                      onChange={(e) => setSettings({
                        ...settings,
                        backup: { ...settings.backup, backupFrequency: e.target.value }
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Retention Period (days)
                    </label>
                    <input
                      type="number"
                      value={settings.backup.retentionDays}
                      onChange={(e) => setSettings({
                        ...settings,
                        backup: { ...settings.backup, retentionDays: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}