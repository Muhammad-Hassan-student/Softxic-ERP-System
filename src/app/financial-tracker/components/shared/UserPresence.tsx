'use client';

import React, { useState, useEffect } from 'react';
import { Users, User, Wifi, WifiOff } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';

interface ActiveUser {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  currentModule?: string;
  currentEntity?: string;
  lastActive: string;
}

interface UserPresenceProps {
  module?: string;
  entity?: string;
  showList?: boolean;
}

export const UserPresence: React.FC<UserPresenceProps> = ({
  module,
  entity,
  showList = true
}) => {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const { socket, isConnected } = useSocket(module, entity);

  useEffect(() => {
    if (!socket) return;

    const handleUserJoined = (user: ActiveUser) => {
      setActiveUsers(prev => {
        if (prev.some(u => u.userId === user.userId)) return prev;
        return [...prev, user];
      });
    };

    const handleUserLeft = (userId: string) => {
      setActiveUsers(prev => prev.filter(u => u.userId !== userId));
    };

    const handleUsersList = (users: ActiveUser[]) => {
      setActiveUsers(users);
    };

    socket.on('userJoined', handleUserJoined);
    socket.on('userLeft', handleUserLeft);
    socket.on('activeUsers', handleUsersList);

    return () => {
      socket.off('userJoined', handleUserJoined);
      socket.off('userLeft', handleUserLeft);
      socket.off('activeUsers', handleUsersList);
    };
  }, [socket]);

  if (!showList) {
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm text-gray-600">
          {activeUsers.length} active user{activeUsers.length !== 1 ? 's' : ''}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Active Users</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">{activeUsers.length} online</span>
        </div>
      </div>

      <div className="space-y-3">
        {activeUsers.map((user) => (
          <div key={user.userId} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
            {user.currentModule && (
              <span className="text-xs text-gray-400">
                {user.currentModule}/{user.currentEntity}
              </span>
            )}
          </div>
        ))}

        {activeUsers.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No active users</p>
          </div>
        )}
      </div>
    </div>
  );
};