'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  Mail, 
  IdCard,
  Building,
  AlertCircle,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: authLogin } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTab, setActiveTab] = useState<'employee' | 'admin'>('employee');
  
  const redirectPath = searchParams.get('redirect') || '';
  const errorMsg = searchParams.get('error');
  
  // Employee Login State
  const [employeeData, setEmployeeData] = useState({
    rollNo: '',
    fullName: '',
    cnic: '',
    password: '',
  });
  
  // HR/Admin Login State
  const [adminHrData, setAdminHrData] = useState({
    email: '',
    password: '',
  });
  
  // Show error if redirected with error
  useEffect(() => {
    if (errorMsg === 'session_expired') {
      toast.error('Your session has expired. Please login again.');
    }
  }, [errorMsg]);

  // Handle Employee Login
  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeData.rollNo || !employeeData.fullName || !employeeData.cnic || !employeeData.password) {
      toast.error('Please fill all required fields');
      return;
    }
    
    await handleLogin('employee', {
      rollNo: employeeData.rollNo,
      fullName: employeeData.fullName,
      cnic: employeeData.cnic,
      password: employeeData.password,
      loginType: 'employee'
    });
  };
  
  // Handle Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminHrData.email || !adminHrData.password) {
      toast.error('Please fill all required fields');
      return;
    }
    
    await handleLogin('admin', {
      email: adminHrData.email,
      password: adminHrData.password,
      loginType: 'admin'
    });
  };
  
  // Handle HR Login
  const handleHrLogin = async () => {
    if (!adminHrData.email || !adminHrData.password) {
      toast.error('Please fill all required fields');
      return;
    }
    
    await handleLogin('hr', {
      email: adminHrData.email,
      password: adminHrData.password,
      loginType: 'hr'
    });
  };
  
  // Generic Login Handler
  const handleLogin = async (type: 'employee' | 'admin' | 'hr', data: any) => {
    try {
      setLoading(true);
      console.log('Logging in as:', type, data);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include', // CRITICAL: Include cookies
      });
      
      console.log('Login response status:', response.status);
      
      const result = await response.json();
      console.log('Login result:', result);
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || `Login failed with status ${response.status}`);
      }
      
      // Update auth context
      authLogin(result.data);
      
      // Remember me option
      if (rememberMe) {
        localStorage.setItem('rememberedUser', JSON.stringify({
          type,
          ...(type === 'employee' ? { rollNo: employeeData.rollNo } : { email: adminHrData.email })
        }));
      } else {
        localStorage.removeItem('rememberedUser');
      }
      
      toast.success(`Welcome back, ${result.data.fullName}!`);
      
      // Determine redirect URL
      let redirectUrl = '/dashboard';
      const role = result.data.role;
      
      if (redirectPath) {
        redirectUrl = redirectPath;
      } else {
        switch (role) {
          case 'admin':
            redirectUrl = '/admin/dashboard';
            break;
          case 'hr':
            redirectUrl = '/hr/dashboard';
            break;
          case 'employee':
            redirectUrl = '/employee/dashboard';
            break;
          case 'accounts':
            redirectUrl = '/accounts/dashboard';
            break;
          case 'support':
            redirectUrl = '/support/dashboard';
            break;
          case 'marketing':
            redirectUrl = '/marketing/dashboard';
            break;
        }
      }
      
      console.log('Redirecting to:', redirectUrl);
      
      // IMPORTANT: Use window.location.assign for full page reload
      // This ensures middleware runs and cookies are properly set
      setTimeout(() => {
        window.location.assign(redirectUrl);
      }, 500);
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format CNIC input
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
  
  // Load remembered user
  useEffect(() => {
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
        console.error('Error loading remembered user:', error);
      }
    }
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-0">
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center mb-2">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg">
            <Lock className="h-8 w-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-gray-600 text-lg">
          Sign in to your account
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="employee" value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-8 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger 
              value="employee" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-3"
            >
              <User className="h-4 w-4 mr-2" />
              Employee
            </TabsTrigger>
            <TabsTrigger 
              value="admin" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-3"
            >
              <Building className="h-4 w-4 mr-2" />
              Admin/HR
            </TabsTrigger>
          </TabsList>
          
          {/* Employee Login Tab */}
          <TabsContent value="employee" className="space-y-6">
            <form onSubmit={handleEmployeeLogin} className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="rollNo" className="text-gray-700 font-medium flex items-center gap-2">
                  <IdCard className="h-4 w-4" />
                  Roll Number
                </Label>
                <Input
                  id="rollNo"
                  placeholder="EMP-001"
                  value={employeeData.rollNo}
                  onChange={(e) => setEmployeeData(prev => ({ ...prev, rollNo: e.target.value.toUpperCase() }))}
                  required
                  className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="fullName" className="text-gray-700 font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={employeeData.fullName}
                  onChange={(e) => setEmployeeData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                  className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="cnic" className="text-gray-700 font-medium flex items-center gap-2">
                  <IdCard className="h-4 w-4" />
                  CNIC
                </Label>
                <Input
                  id="cnic"
                  placeholder="12345-1234567-1"
                  value={employeeData.cnic}
                  onChange={handleCNICChange}
                  maxLength={15}
                  required
                  className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">
                  Format: XXXXX-XXXXXXX-X
                </p>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="employeePassword" className="text-gray-700 font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="employeePassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={employeeData.password}
                    onChange={(e) => setEmployeeData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg pr-12"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="rememberEmployee"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-gray-400 data-[state=checked]:bg-blue-600"
                    disabled={loading}
                  />
                  <Label htmlFor="rememberEmployee" className="text-gray-600 text-sm">
                    Remember me
                  </Label>
                </div>
                
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-blue-600 hover:text-blue-800 p-0 h-auto font-medium"
                  onClick={() => toast.error('Contact HR department for password reset.')}
                  disabled={loading}
                >
                  Forgot password?
                </Button>
              </div>
              
              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In as Employee'
                )}
              </Button>
            </form>
          </TabsContent>
          
          {/* Admin/HR Login Tab */}
          <TabsContent value="admin" className="space-y-6">
            <form onSubmit={handleAdminLogin} className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-gray-700 font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@company.com"
                  value={adminHrData.email}
                  onChange={(e) => setAdminHrData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="adminPassword" className="text-gray-700 font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="adminPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={adminHrData.password}
                    onChange={(e) => setAdminHrData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg pr-12"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="rememberAdmin"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-gray-400 data-[state=checked]:bg-blue-600"
                    disabled={loading}
                  />
                  <Label htmlFor="rememberAdmin" className="text-gray-600 text-sm">
                    Remember me
                  </Label>
                </div>
                
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-blue-600 hover:text-blue-800 p-0 h-auto font-medium"
                  onClick={() => toast.error('Contact administrator for password reset.')}
                  disabled={loading}
                >
                  Forgot password?
                </Button>
              </div>
              
              <div className="pt-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <span>Login as:</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="submit"
                    className="h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      'Admin'
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleHrLogin}
                    variant="outline"
                    className="h-12 text-lg font-semibold border-2 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700 transition-all duration-200 rounded-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      'HR'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4 border-t pt-6">
        <div className="text-center text-sm text-gray-600">
          <p className="font-medium mb-1">Need help signing in?</p>
          <p>
            Contact support at{' '}
            <a href="mailto:support@erp.com" className="text-blue-600 hover:text-blue-800 font-medium underline">
              support@erp.com
            </a>
          </p>
        </div>
        
        <div className="w-full pt-4 border-t">
          <div className="flex items-center justify-center space-x-3">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-gray-500 font-medium">
              Secure connection • 256-bit encryption
            </span>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}