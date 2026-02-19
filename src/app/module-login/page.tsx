// src/app/module-login/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, DollarSign, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ModuleLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    module: 're' as 're' | 'expense'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);

      const response = await fetch('/api/module-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      // Check if response is ok
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: `HTTP error ${response.status}` 
        }));
        throw new Error(errorData.error || 'Login failed');
      }

      // Parse response
      const data = await response.json();
      
      if (!data.token) {
        throw new Error('Invalid response from server');
      }

      // Set cookies
      document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `module=${data.user.module}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `userType=module; path=/; max-age=604800; SameSite=Lax`;
      
      toast.success('Login successful');
      
      // Redirect to entity selector
      router.push('/user-system');

    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Module Login</h1>
          <p className="text-gray-600 mt-2">Access your specific module</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Module
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, module: 're' })}
                className={`p-4 border-2 rounded-xl flex flex-col items-center transition-all ${
                  formData.module === 're'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200'
                }`}
              >
                <DollarSign className={`h-8 w-8 mb-2 ${
                  formData.module === 're' ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <span className={`font-medium ${
                  formData.module === 're' ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  RE Module
                </span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, module: 'expense' })}
                className={`p-4 border-2 rounded-xl flex flex-col items-center transition-all ${
                  formData.module === 'expense'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-200'
                }`}
              >
                <CreditCard className={`h-8 w-8 mb-2 ${
                  formData.module === 'expense' ? 'text-green-600' : 'text-gray-400'
                }`} />
                <span className={`font-medium ${
                  formData.module === 'expense' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  Expense Module
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="user@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Logging in...
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5 mr-2" />
                Login to Module
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Only users with module access can login</p>
        </div>
      </div>
    </div>
  );
}