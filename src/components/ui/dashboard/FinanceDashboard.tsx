'use client';

import { StatsCard } from './StatsCard';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  PieChart,
  BarChart3,
  Wallet,
  Receipt
} from 'lucide-react';

export const FinanceDashboard = () => {
  const financeStats = [
    {
      title: 'Total Revenue',
      value: '$1.24M',
      change: '+18.7%',
      icon: 'dollar',
      color: 'green',
    },
    {
      title: 'Total Expenses',
      value: '$842K',
      change: '+8.2%',
      icon: 'trendingDown',
      color: 'red',
    },
    {
      title: 'Net Profit',
      value: '$398K',
      change: '+24.3%',
      icon: 'trendingUp',
      color: 'blue',
    },
    {
      title: 'Pending Invoices',
      value: '42',
      change: '-12%',
      icon: 'creditCard',
      color: 'orange',
    },
    {
      title: 'Cash Flow',
      value: '+$124K',
      change: '+15.2%',
      icon: 'wallet',
      color: 'teal',
    },
    {
      title: 'Tax Liability',
      value: '$84.2K',
      change: '+3.8%',
      icon: 'pieChart',
      color: 'purple',
    },
  ] as const ;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Finance Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Financial Overview - Revenue, Expenses, Profit & Cash Flow
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {financeStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Finance Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">
            Revenue Breakdown
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Product Sales', value: 65, color: 'bg-blue-500' },
              { label: 'Services', value: 20, color: 'bg-green-500' },
              { label: 'Subscriptions', value: 10, color: 'bg-purple-500' },
              { label: 'Other', value: 5, color: 'bg-gray-500' },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.label}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} w-[${item.value}%]`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">
            Recent Transactions
          </h3>
          <div className="space-y-3">
            {[
              { id: 'INV-001', client: 'ABC Corp', amount: '$12,500', status: 'Paid', date: 'Today' },
              { id: 'INV-002', client: 'XYZ Ltd', amount: '$8,400', status: 'Pending', date: 'Yesterday' },
              { id: 'INV-003', client: 'Tech Solutions', amount: '$5,200', status: 'Paid', date: '2 days ago' },
              { id: 'INV-004', client: 'Global Inc', amount: '$21,800', status: 'Overdue', date: '5 days ago' },
            ].map((txn, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{txn.id}</p>
                  <p className="text-sm text-gray-500">{txn.client}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{txn.amount}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    txn.status === 'Paid' ? 'bg-green-100 text-green-800' :
                    txn.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {txn.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};