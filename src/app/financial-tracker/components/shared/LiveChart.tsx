'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useSocket } from '../../hooks/useSocket';
import { Activity } from 'lucide-react';

interface LiveChartProps {
  module: string;
  entity: string;
  type?: 'line' | 'area';
  height?: number;
}

export const LiveChart: React.FC<LiveChartProps> = ({
  module,
  entity,
  type = 'line',
  height = 300
}) => {
  const [data, setData] = useState<any[]>([]);
  const { socket, isConnected } = useSocket(module, entity);
  const maxDataPoints = 20;

  useEffect(() => {
    if (!socket) return;

    const handleChartData = (newPoint: any) => {
      setData(prev => {
        const updated = [...prev, {
          ...newPoint,
          timestamp: new Date().toLocaleTimeString()
        }];
        return updated.slice(-maxDataPoints);
      });
    };

    socket.on('chartData', handleChartData);

    return () => {
      socket.off('chartData', handleChartData);
    };
  }, [socket]);

  const Chart = type === 'line' ? LineChart : AreaChart;
  const DataComponent = type === 'line' ? Line : Area;

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Live Updates</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-500">
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <Chart data={data}>
            <XAxis dataKey="timestamp" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Legend />
            <DataComponent
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.1}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </Chart>
        </ResponsiveContainer>
      </div>

      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400 animate-pulse" />
            <p className="text-sm text-gray-500">Waiting for live data...</p>
          </div>
        </div>
      )}
    </div>
  );
};