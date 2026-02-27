
// src/app/admin/financial-tracker/entities/components/modals/KeyboardShortcutsModal.tsx
'use client';

import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';
import { motion } from 'framer-motion';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { category: 'Navigation', items: [
      { keys: ['Alt', '1-9'], description: 'Switch tabs' },
      { keys: ['Ctrl', 'F'], description: 'Focus search' },
      { keys: ['Ctrl', 'E'], description: 'Edit current entity' },
      { keys: ['Ctrl', 'S'], description: 'Share entity' },
    ]},
    { category: 'View Modes', items: [
      { keys: ['Ctrl', 'E'], description: 'Table view' },
      { keys: ['Ctrl', 'C'], description: 'Cards view' },
      { keys: ['Ctrl', 'K'], description: 'Kanban view' },
      { keys: ['Ctrl', 'G'], description: 'Gallery view' },
    ]},
    { category: 'Bulk Operations', items: [
      { keys: ['Ctrl', 'B'], description: 'Toggle bulk mode' },
      { keys: ['Shift', 'Ctrl', 'A'], description: 'Select all' },
      { keys: ['Shift', 'Ctrl', 'D'], description: 'Deselect all' },
      { keys: ['Ctrl', 'X'], description: 'Export selected' },
    ]},
    { category: 'Actions', items: [
      { keys: ['Ctrl', 'N'], description: 'Create new entity' },
      { keys: ['Ctrl', 'R'], description: 'Refresh data' },
      { keys: ['Shift', 'Ctrl', 'C'], description: 'Clone entity' },
      { keys: ['Shift', 'Ctrl', 'D'], description: 'Delete entity' },
    ]},
    { category: 'UI Controls', items: [
      { keys: ['Ctrl', '+'], description: 'Zoom in' },
      { keys: ['Ctrl', '-'], description: 'Zoom out' },
      { keys: ['Ctrl', '0'], description: 'Reset zoom' },
      { keys: ['Ctrl', 'F'], description: 'Toggle fullscreen' },
      { keys: ['Esc'], description: 'Close modal / cancel' },
    ]},
  ];

  const KeyComponent = ({ children }: { children: string }) => (
    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono shadow-sm">
      {children}
    </kbd>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-lg p-2">
                <Keyboard className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">Keyboard Shortcuts</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-6">
            {shortcuts.map((section) => (
              <div key={section.category}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </span>
                      <div className="flex items-center space-x-1">
                        {item.keys.map((key, i) => (
                          <React.Fragment key={key}>
                            {i > 0 && <span className="text-gray-400">+</span>}
                            <KeyComponent>{key}</KeyComponent>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <Command className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">Pro Tip</p>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  Hold <kbd className="px-1 bg-blue-100 dark:bg-blue-800 rounded">Ctrl</kbd> + 
                  <kbd className="px-1 bg-blue-100 dark:bg-blue-800 rounded">Shift</kbd> for additional options.
                  Most shortcuts work throughout the application.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}