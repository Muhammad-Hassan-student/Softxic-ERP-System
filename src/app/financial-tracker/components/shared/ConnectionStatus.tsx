'use client';

import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';

interface ConnectionStatusProps {
  module: string;
  entity: string;
  showLabel?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  module,
  entity,
  showLabel = true
}) => {
  const { isConnected, error } = useSocket(module, entity);

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        {error && (
          <div className="absolute -top-1 -right-1">
            <div className="w-1 h-1 rounded-full bg-red-500 animate-ping" />
          </div>
        )}
      </div>
      {showLabel && (
        <span className="text-xs text-gray-500">
          {isConnected ? 'Live' : error ? 'Connection Error' : 'Connecting...'}
        </span>
      )}
      {error && (
        <button
          onClick={() => window.location.reload()}
          className="ml-2 p-1 hover:bg-gray-100 rounded"
          title="Reconnect"
        >
          <RefreshCw className="h-3 w-3 text-gray-500" />
        </button>
      )}
    </div>
  );
};