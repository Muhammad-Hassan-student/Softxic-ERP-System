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
  Smartphone,
  Building,
  AlertCircle,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTab, setActiveTab] = useState<'employee' | 'admin'>('employee');
  
  // Get redirect path from URL if any
  const redirectPath = searchParams.get('redirect') || '';
  
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
  
  // Handle Employee Login
  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeData.rollNo || !employeeData.fullName || !employeeData.cnic || !employeeData.password) {
    toast.error('Please fill all required fields')
      return;
    }
    
    await handleLogin('employee', {
      ...employeeData,
      loginType: 'employee'
    });
  };
  
  // Handle HR/Admin Login
  const handleAdminHrLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminHrData.email || !adminHrData.password) {
      toast.error('Please fill all required fields')
      return;
    }
    
    await handleLogin('admin', {
      email: adminHrData.email,
      password: adminHrData.password,
      loginType: 'admin' // Will be determined by server
    });
  };
  
  // Generic Login Handler
  const handleLogin = async (type: 'employee' | 'admin' | 'hr', data: any) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }
      
      if (!result.success) {
        throw new Error(result.message || 'Login failed');
      }
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(result.data));
      
      // Remember me option
      if (rememberMe) {
        localStorage.setItem('rememberedUser', JSON.stringify({
          type,
          ...(type === 'employee' ? { rollNo: employeeData.rollNo } : { email: adminHrData.email })
        }));
      } else {
        localStorage.removeItem('rememberedUser');
      }
      
    toast.success( `Welcome back, ${result.data.fullName}!`)
      // Get role from response
      const role = result.data.role;
      
      // Wait a bit for cookies to be set
      setTimeout(() => {
        // Check if there's a redirect path
        if (redirectPath) {
          window.location.href = redirectPath;
        } else {
          // Redirect based on role
          switch (role) {
            case 'admin':
              window.location.href = '/admin/dashboard';
              break;
            case 'hr':
              window.location.href = '/hr/dashboard';
              break;
            case 'employee':
              window.location.href = '/employee/dashboard';
              break;
            case 'accounts':
              window.location.href = '/accounts/dashboard';
              break;
            case 'support':
              window.location.href = '/support/dashboard';
              break;
            case 'marketing':
              window.location.href = '/marketing/dashboard';
              break;
            default:
              window.location.href = '/dashboard';
          }
        }
      }, 500);
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid credentials. Please try again.')
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
  
  // Handle CNIC input change
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
    <Card className="shadow-lg border-0">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
            <Lock className="h-6 w-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="employee" value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="employee" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Employee
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Admin/HR
            </TabsTrigger>
          </TabsList>
          
          {/* Employee Login Tab */}
          <TabsContent value="employee">
            <form onSubmit={handleEmployeeLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rollNo" className="flex items-center gap-2">
                  <IdCard className="h-4 w-4" />
                  Roll Number
                </Label>
                <Input
                  id="rollNo"
                  placeholder="EMP-DEP-24-001"
                  value={employeeData.rollNo}
                  onChange={(e) => setEmployeeData(prev => ({ ...prev, rollNo: e.target.value.toUpperCase() }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={employeeData.fullName}
                  onChange={(e) => setEmployeeData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cnic" className="flex items-center gap-2">
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
                />
                <p className="text-xs text-gray-500">
                  Format: XXXXX-XXXXXXX-X
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="employeePassword" className="flex items-center gap-2">
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
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberEmployee"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="rememberEmployee" className="text-sm">
                    Remember me
                  </Label>
                </div>
                
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-blue-600 hover:text-blue-800 p-0 h-auto"
                  onClick={() =>toast.error('Please contact your HR department for password reset.')}
                >
                  Forgot password?
                </Button>
              </div>
              
              <Button
                type="submit"
                className="w-full mt-4"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In as Employee'
                )}
              </Button>
            </form>
          </TabsContent>
          
          {/* Admin/HR Login Tab */}
          <TabsContent value="admin">
            <form onSubmit={handleAdminHrLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@erp.com"
                  value={adminHrData.email}
                  onChange={(e) => setAdminHrData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adminPassword" className="flex items-center gap-2">
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
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberAdmin"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="rememberAdmin" className="text-sm">
                    Remember me
                  </Label>
                </div>
                
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-blue-600 hover:text-blue-800 p-0 h-auto"
                  onClick={() => toast.error('Please contact system administrator for password reset.')}
                >
                  Forgot password?
                </Button>
              </div>
              
              <div className="pt-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <AlertCircle className="h-4 w-4" />
                  <span>Login as:</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="submit"
                    variant="default"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Admin'
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleLogin('hr', {
                      email: adminHrData.email,
                      password: adminHrData.password,
                      loginType: 'hr'
                    })}
                    variant="outline"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
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
      
      <CardFooter className="flex flex-col space-y-3">
        <div className="text-center text-sm text-gray-600">
          <p>Having trouble signing in?</p>
          <p className="mt-1">
            Contact support at{' '}
            <a href="mailto:support@erp.com" className="text-blue-600 hover:underline">
              support@erp.com
            </a>
          </p>
        </div>
        
        <div className="w-full border-t pt-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Secure login with{' '}
              <span className="font-semibold">256-bit encryption</span>
            </p>
            <div className="flex items-center justify-center mt-2 space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-500">All connections are secured</span>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}