'use client';

import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

// ✅ Fixed: Only these types are supported by ChartComponent
export type ChartType = 'line' | 'area' | 'bar' | 'pie';

interface ChartProps {
  data: any[];
  type: ChartType;  // ✅ Fixed: Removed 'table'
  height?: number;
  dataKey?: string;
  xAxisKey?: string;
  colors?: string[];
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
}

export const ChartComponent: React.FC<ChartProps> = ({
  data,
  type,
  height = 300,
  dataKey = 'value',
  xAxisKey = 'name',
  colors = COLORS,
  showGrid = true,
  showTooltip = true,
  showLegend = true
}) => {
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            <Line type="monotone" dataKey={dataKey} stroke="#3B82F6" strokeWidth={2} />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            <Area type="monotone" dataKey={dataKey} stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            <Bar dataKey={dataKey} fill="#3B82F6" />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      {renderChart()}
    </ResponsiveContainer>
  );
};

// Multi-series Line Chart
export const MultiLineChart: React.FC<{
  data: any[];
  lines: Array<{ key: string; color: string; name: string }>;
  xAxisKey?: string;
  height?: number;
}> = ({ data, lines, xAxisKey = 'name', height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            stroke={line.color}
            name={line.name}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

// Stacked Bar Chart
export const StackedBarChart: React.FC<{
  data: any[];
  bars: Array<{ key: string; color: string; name: string }>;
  xAxisKey?: string;
  height?: number;
}> = ({ data, bars, xAxisKey = 'name', height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {bars.map((bar) => (
          <Bar key={bar.key} dataKey={bar.key} stackId="a" fill={bar.color} name={bar.name} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};