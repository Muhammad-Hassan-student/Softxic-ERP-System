'use client';

import React, { useState } from 'react';
import { Bell, Check, X, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New user registered', description: 'John Doe has joined the system', time: '5 minutes ago', type: 'info', read: false },
    { id: 2, title: 'Payment received', description: 'Invoice #INV-001 has been paid', time: '1 hour ago', type: 'success', read: false },
    { id: 3, title: 'System alert', description: 'Database backup is scheduled for tonight', time: '2 hours ago', type: 'warning', read: true },
    { id: 4, title: 'New complaint', description: 'Ticket #TKT-045 has been assigned to you', time: '3 hours ago', type: 'error', read: true },
    { id: 5, title: 'Inventory low', description: 'Product "Laptop Pro" stock is below minimum', time: '5 hours ago', type: 'warning', read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })));
  const clearAll = () => setNotifications([]);

  const getIcon = (type: string) => {
    switch(type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-gray-800">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Notifications</span>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-gray-600 dark:text-gray-300"
                onClick={markAllAsRead}
              >
                <Check className="h-3 w-3 mr-1" /> Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-gray-600 dark:text-gray-300"
              onClick={clearAll}
            >
              <X className="h-3 w-3 mr-1" /> Clear all
            </Button>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="border-gray-200 dark:border-gray-700" />

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-6 text-center">
              <Bell className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
            </div>
          ) : (
            notifications.map(notification => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex flex-col items-start p-3 cursor-pointer",
                  !notification.read ? "bg-gray-100 dark:bg-gray-700" : "bg-white dark:bg-gray-800"
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex w-full items-start gap-3">
                  <div className="mt-0.5">{getIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={cn(
                        "font-medium text-sm truncate",
                        !notification.read ? "text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300"
                      )}>{notification.title}</p>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {notification.description}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>

        <DropdownMenuSeparator className="border-gray-200 dark:border-gray-700" />
        <DropdownMenuItem className="justify-center text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
