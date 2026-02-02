'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '';
  const errorMsg = searchParams.get('error');
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTab, setActiveTab] = useState<'employee' | 'admin'>('employee');
  
  const [employeeData, setEmployeeData] = useState({
    rollNo: '',
    fullName: '',
    cnic: '',
    password: '',
  });
  
  const [adminHrData, setAdminHrData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (errorMsg === 'session_expired') {
      toast.error('Session expired. Please login again.');
    }
    
    // Load remembered user
    const remembered = localStorage.getItem('rememberedUser');
    if (remembered) {
      try {
        const { type, rollNo, email } = JSON.parse(remembered);
        if (type === 'employee' && rollNo) {
          setEmployeeData(prev => ({ ...prev, rollNo }));
          setActiveTab('employee');
          setRememberMe(true);
        } else if (email) {
          setAdminHrData(prev => ({ ...prev, email }));
          setActiveTab('admin');
          setRememberMe(true);
        }
      } catch (error) {
        localStorage.removeItem('rememberedUser');
      }
    }
  }, [errorMsg]);

  const handleLogin = async (data: any) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Login failed');
      }

      // Store in localStorage for quick access
      localStorage.setItem('user', JSON.stringify(result.data));
      
      if (rememberMe) {
        localStorage.setItem('rememberedUser', JSON.stringify({
          type: data.loginType,
          ...(data.loginType === 'employee' ? { rollNo: employeeData.rollNo } : { email: adminHrData.email })
        }));
      } else {
        localStorage.removeItem('rememberedUser');
      }

      toast.success(`Welcome back, ${result.data.fullName}!`);
      
      // Determine redirect URL
      let redirectUrl = redirectPath || '/dashboard';
      const role = result.data.role;
      
      if (!redirectPath) {
        switch (role) {
          case 'admin': redirectUrl = '/admin/dashboard'; break;
          case 'hr': redirectUrl = '/hr/dashboard'; break;
          case 'employee': redirectUrl = '/employee/dashboard'; break;
        }
      }

      // IMPORTANT: Use window.location.assign for proper cookie handling
      setTimeout(() => {
        window.location.assign(redirectUrl);
      }, 300);

    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeData.rollNo || !employeeData.fullName || !employeeData.cnic || !employeeData.password) {
      toast.error('Please fill all fields');
      return;
    }
    handleLogin({
      ...employeeData,
      loginType: 'employee'
    });
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminHrData.email || !adminHrData.password) {
      toast.error('Please fill all fields');
      return;
    }
    handleLogin({
      ...adminHrData,
      loginType: 'admin'
    });
  };

  const handleHrLogin = () => {
    if (!adminHrData.email || !adminHrData.password) {
      toast.error('Please fill all fields');
      return;
    }
    handleLogin({
      ...adminHrData,
      loginType: 'hr'
    });
  };

  const formatCNIC = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5, 12)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
  };

  const handleCNICChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNIC(e.target.value);
    setEmployeeData(prev => ({ ...prev, cnic: formatted }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-blue-100 mt-2">Sign in to continue to your dashboard</p>
        </div>

        {/* Tabs */}
        <div className="p-1 bg-gray-100">
          <div className="flex">
            <button
              onClick={() => setActiveTab('employee')}
              className={`flex-1 py-3 text-center font-medium rounded-lg transition-all ${
                activeTab === 'employee'
                  ? 'bg-white shadow text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Employee Login
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-3 text-center font-medium rounded-lg transition-all ${
                activeTab === 'admin'
                  ? 'bg-white shadow text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Admin/HR Login
            </button>
          </div>
        </div>

        {/* Employee Login Form */}
        {activeTab === 'employee' && (
          <form onSubmit={handleEmployeeLogin} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
              <input
                type="text"
                placeholder="EMP-001"
                value={employeeData.rollNo}
                onChange={(e) => setEmployeeData(prev => ({ ...prev, rollNo: e.target.value.toUpperCase() }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={employeeData.fullName}
                onChange={(e) => setEmployeeData(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CNIC</label>
              <input
                type="text"
                placeholder="12345-1234567-1"
                value={employeeData.cnic}
                onChange={handleCNICChange}
                maxLength={15}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={employeeData.password}
                  onChange={(e) => setEmployeeData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                  disabled={loading}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                  disabled={loading}
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => toast.error('Contact HR for password reset')}
                className="text-sm text-blue-600 hover:text-blue-800"
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In as Employee'}
            </button>
          </form>
        )}

        {/* Admin/HR Login Form */}
        {activeTab === 'admin' && (
          <div className="p-6">
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="admin@company.com"
                  value={adminHrData.email}
                  onChange={(e) => setAdminHrData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={adminHrData.password}
                    onChange={(e) => setAdminHrData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500"
                    disabled={loading}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                    disabled={loading}
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => toast.error('Contact administrator for password reset')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Sign In as Admin'}
                </button>
                
                <button
                  type="button"
                  onClick={handleHrLogin}
                  disabled={loading}
                  className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-50 transition-all disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Sign In as HR'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <a href="mailto:support@erp.com" className="text-blue-600 hover:text-blue-800 font-medium">
              support@erp.com
            </a>
          </p>
          <div className="flex items-center justify-center mt-2 space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-500">Secure 256-bit SSL encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}