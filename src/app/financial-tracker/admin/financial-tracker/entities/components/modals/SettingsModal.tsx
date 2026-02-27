// src/app/admin/financial-tracker/entities/components/modals/SettingsModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Moon, Sun, Monitor, Globe, Bell, Eye, Save, Palette, Clock, Languages, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: string;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  compactMode: boolean;
  setCompactMode: (value: boolean) => void;
  zoomLevel: number;
  setZoomLevel: (value: number) => void;
  chartDensity: 'compact' | 'comfortable' | 'luxury';
  setChartDensity: (value: 'compact' | 'comfortable' | 'luxury') => void;
}

interface SettingOption {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  type: 'toggle' | 'select' | 'slider' | 'radio';
  value: any;
  options?: { value: any; label: string }[];
  min?: number;
  max?: number;
  step?: number;
}

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  setTheme,
  compactMode,
  setCompactMode,
  zoomLevel,
  setZoomLevel,
  chartDensity,
  setChartDensity
}: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState({
    theme,
    compactMode,
    zoomLevel,
    chartDensity,
    notifications: true,
    autoSave: true,
    showAvatars: true,
    animations: true,
    language: 'en',
    timezone: 'auto',
    fontSize: 14,
    colorScheme: 'default',
    keyboardShortcuts: true,
    soundEffects: false,
  });

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'appearance' | 'preferences' | 'notifications' | 'advanced'>('appearance');

  useEffect(() => {
    if (isOpen) {
      setLocalSettings({
        theme,
        compactMode,
        zoomLevel,
        chartDensity,
        notifications: true,
        autoSave: true,
        showAvatars: true,
        animations: true,
        language: 'en',
        timezone: 'auto',
        fontSize: 14,
        colorScheme: 'default',
        keyboardShortcuts: true,
        soundEffects: false,
      });
    }
  }, [isOpen, theme, compactMode, zoomLevel, chartDensity]);

  if (!isOpen) return null;

  const handleSave = () => {
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setTheme(localSettings.theme as any);
      setCompactMode(localSettings.compactMode);
      setZoomLevel(localSettings.zoomLevel);
      setChartDensity(localSettings.chartDensity as any);
      
      toast.success('Settings saved successfully');
      setSaving(false);
      onClose();
    }, 1000);
  };

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      {/* Theme */}
      <div>
        <h4 className="text-sm font-medium mb-3">Theme</h4>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setLocalSettings({ ...localSettings, theme: 'light' })}
            className={`p-3 border-2 rounded-xl flex flex-col items-center space-y-2 transition-all ${
              localSettings.theme === 'light' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <Sun className={`h-5 w-5 ${localSettings.theme === 'light' ? 'text-yellow-500' : 'text-gray-400'}`} />
            <span className="text-xs">Light</span>
          </button>
          <button
            onClick={() => setLocalSettings({ ...localSettings, theme: 'dark' })}
            className={`p-3 border-2 rounded-xl flex flex-col items-center space-y-2 transition-all ${
              localSettings.theme === 'dark' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <Moon className={`h-5 w-5 ${localSettings.theme === 'dark' ? 'text-blue-500' : 'text-gray-400'}`} />
            <span className="text-xs">Dark</span>
          </button>
          <button
            onClick={() => setLocalSettings({ ...localSettings, theme: 'system' })}
            className={`p-3 border-2 rounded-xl flex flex-col items-center space-y-2 transition-all ${
              localSettings.theme === 'system' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <Monitor className={`h-5 w-5 ${localSettings.theme === 'system' ? 'text-purple-500' : 'text-gray-400'}`} />
            <span className="text-xs">System</span>
          </button>
        </div>
      </div>

      {/* Color Scheme */}
      <div>
        <h4 className="text-sm font-medium mb-3">Color Scheme</h4>
        <div className="grid grid-cols-4 gap-2">
          {['default', 'purple', 'green', 'orange'].map((scheme) => (
            <button
              key={scheme}
              onClick={() => setLocalSettings({ ...localSettings, colorScheme: scheme })}
              className={`p-2 rounded-lg border-2 capitalize ${
                localSettings.colorScheme === scheme
                  ? 'border-blue-500'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className={`h-8 rounded ${
                scheme === 'default' ? 'bg-gradient-to-r from-blue-500 to-purple-600' :
                scheme === 'purple' ? 'bg-gradient-to-r from-purple-500 to-pink-600' :
                scheme === 'green' ? 'bg-gradient-to-r from-green-500 to-teal-600' :
                'bg-gradient-to-r from-orange-500 to-red-600'
              }`} />
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">Font Size</h4>
          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {localSettings.fontSize}px
          </span>
        </div>
        <input
          type="range"
          min="12"
          max="18"
          step="1"
          value={localSettings.fontSize}
          onChange={(e) => setLocalSettings({ ...localSettings, fontSize: parseInt(e.target.value) })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Small</span>
          <span>Medium</span>
          <span>Large</span>
        </div>
      </div>

      {/* Compact Mode */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Compact Mode</p>
          <p className="text-xs text-gray-500">Show more content with less spacing</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={localSettings.compactMode}
            onChange={(e) => setLocalSettings({ ...localSettings, compactMode: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Zoom Level */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">Zoom Level</h4>
          <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {Math.round(localSettings.zoomLevel * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="70"
          max="150"
          step="5"
          value={localSettings.zoomLevel * 100}
          onChange={(e) => setLocalSettings({ ...localSettings, zoomLevel: parseInt(e.target.value) / 100 })}
          className="w-full"
        />
      </div>

      {/* Chart Density */}
      <div>
        <h4 className="text-sm font-medium mb-2">Chart Density</h4>
        <select
          value={localSettings.chartDensity}
          onChange={(e) => setLocalSettings({ ...localSettings, chartDensity: e.target.value as any })}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
        >
          <option value="compact">Compact</option>
          <option value="comfortable">Comfortable</option>
          <option value="luxury">Luxury</option>
        </select>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      {/* Language */}
      <div>
        <h4 className="text-sm font-medium mb-2">Language</h4>
        <select
          value={localSettings.language}
          onChange={(e) => setLocalSettings({ ...localSettings, language: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="ur">اردو</option>
          <option value="ar">العربية</option>
        </select>
      </div>

      {/* Timezone */}
      <div>
        <h4 className="text-sm font-medium mb-2">Timezone</h4>
        <select
          value={localSettings.timezone}
          onChange={(e) => setLocalSettings({ ...localSettings, timezone: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
        >
          <option value="auto">Auto Detect</option>
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time (UTC-5)</option>
          <option value="America/Chicago">Central Time (UTC-6)</option>
          <option value="America/Denver">Mountain Time (UTC-7)</option>
          <option value="America/Los_Angeles">Pacific Time (UTC-8)</option>
          <option value="Europe/London">London (UTC+0)</option>
          <option value="Europe/Paris">Paris (UTC+1)</option>
          <option value="Asia/Dubai">Dubai (UTC+4)</option>
          <option value="Asia/Karachi">Pakistan (UTC+5)</option>
          <option value="Asia/Kolkata">India (UTC+5:30)</option>
          <option value="Asia/Shanghai">China (UTC+8)</option>
          <option value="Asia/Tokyo">Japan (UTC+9)</option>
          <option value="Australia/Sydney">Sydney (UTC+10)</option>
        </select>
      </div>

      {/* Date Format */}
      <div>
        <h4 className="text-sm font-medium mb-2">Date Format</h4>
        <select
          value="MMM dd, yyyy"
          onChange={() => {}}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
        >
          <option value="MMM dd, yyyy">Jan 15, 2024</option>
          <option value="dd/MM/yyyy">15/01/2024</option>
          <option value="MM/dd/yyyy">01/15/2024</option>
          <option value="yyyy-MM-dd">2024-01-15</option>
        </select>
      </div>

      {/* Time Format */}
      <div>
        <h4 className="text-sm font-medium mb-2">Time Format</h4>
        <div className="flex space-x-2">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="timeFormat"
              checked={true}
              onChange={() => {}}
              className="rounded-full"
            />
            <span>12-hour (3:30 PM)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="timeFormat"
              checked={false}
              onChange={() => {}}
              className="rounded-full"
            />
            <span>24-hour (15:30)</span>
          </label>
        </div>
      </div>

      {/* First Day of Week */}
      <div>
        <h4 className="text-sm font-medium mb-2">First Day of Week</h4>
        <select
          value="monday"
          onChange={() => {}}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
        >
          <option value="sunday">Sunday</option>
          <option value="monday">Monday</option>
          <option value="saturday">Saturday</option>
        </select>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Email Notifications</p>
          <p className="text-xs text-gray-500">Receive updates via email</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={localSettings.notifications}
            onChange={(e) => setLocalSettings({ ...localSettings, notifications: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Browser Notifications */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Browser Notifications</p>
          <p className="text-xs text-gray-500">Show desktop notifications</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={true}
            onChange={() => {}}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Sound Effects */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Sound Effects</p>
          <p className="text-xs text-gray-500">Play sounds for notifications</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={localSettings.soundEffects}
            onChange={(e) => setLocalSettings({ ...localSettings, soundEffects: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Notification Types */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Notification Types</h4>
        {['Entity Updates', 'Bulk Operations', 'Export Completed', 'Import Completed', 'Error Alerts'].map((item) => (
          <div key={item} className="flex items-center justify-between">
            <span className="text-sm">{item}</span>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="space-y-6">
      {/* Auto Save */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Auto Save</p>
          <p className="text-xs text-gray-500">Automatically save changes</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={localSettings.autoSave}
            onChange={(e) => setLocalSettings({ ...localSettings, autoSave: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Show Avatars */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Show Avatars</p>
          <p className="text-xs text-gray-500">Display user profile pictures</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={localSettings.showAvatars}
            onChange={(e) => setLocalSettings({ ...localSettings, showAvatars: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Animations */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Animations</p>
          <p className="text-xs text-gray-500">Enable UI animations</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={localSettings.animations}
            onChange={(e) => setLocalSettings({ ...localSettings, animations: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Keyboard Shortcuts</p>
          <p className="text-xs text-gray-500">Enable keyboard navigation</p>
        </div>
        <label className="relative inline-flex itemsa-center cursor-pointer">
          <input
            type="checkbox"
            checked={localSettings.keyboardShortcuts}
            onChange={(e) => setLocalSettings({ ...localSettings, keyboardShortcuts: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Cache */}
      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Cache</h4>
        <p className="text-xs text-gray-500 mb-3">Clear application cache to free up space</p>
        <button className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
          Clear Cache
        </button>
      </div>

      {/* Reset */}
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">Reset All Settings</h4>
        <p className="text-xs text-red-600 dark:text-red-300 mb-3">
          Reset all settings to default values. This action cannot be undone.
        </p>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
          Reset to Defaults
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-lg p-2">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6">
          <div className="flex space-x-4">
            {[
              { id: 'appearance', icon: Palette, label: 'Appearance' },
              { id: 'preferences', icon: Clock, label: 'Preferences' },
              { id: 'notifications', icon: Bell, label: 'Notifications' },
              { id: 'advanced', icon: Settings, label: 'Advanced' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                    isActive
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'appearance' && renderAppearanceTab()}
          {activeTab === 'preferences' && renderPreferencesTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab === 'advanced' && renderAdvancedTab()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}