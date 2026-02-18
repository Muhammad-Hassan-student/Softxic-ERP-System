'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Key,
  Copy,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  Download,
  Send
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CreateUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    username: string;
    password: string;
    email: string;
  } | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    role: 'employee' as 'admin' | 'manager' | 'employee',
    department: '',
    designation: '',
    employeeId: '',
    joiningDate: '',
    password: '',
    confirmPassword: '',
    sendEmail: true,
    notifyUser: true
  });

  // Generate random strong password
  const generateStrongPassword = () => {
    const length = 12;
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*";
    
    const allChars = uppercase + lowercase + numbers + symbols;
    let password = "";
    
    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setFormData(prev => ({ 
      ...prev, 
      password, 
      confirmPassword: password 
    }));
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('/financial-tracker/api/financial-tracker/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create user');
      }

      const data = await response.json();
      
      setGeneratedCredentials({
        username: data.user.email,
        password: formData.password,
        email: data.user.email
      });

      toast.success('User created successfully');

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy credentials to clipboard
  const copyCredentials = () => {
    if (!generatedCredentials) return;
    
    const text = `Username: ${generatedCredentials.username}\nPassword: ${generatedCredentials.password}`;
    navigator.clipboard.writeText(text);
    toast.success('Credentials copied to clipboard');
  };

  // Download credentials as text file
  const downloadCredentials = () => {
    if (!generatedCredentials) return;
    
    const content = `=== USER CREDENTIALS ===
Generated: ${new Date().toLocaleString()}
Name: ${formData.fullName}
Username: ${generatedCredentials.username}
Password: ${generatedCredentials.password}
Role: ${formData.role}
Department: ${formData.department || 'N/A'}

Please change your password after first login.
`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credentials-${formData.fullName.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Credentials downloaded');
  };

  // Send credentials via email
  const sendCredentialsEmail = async () => {
    if (!generatedCredentials) return;
    
    try {
      const response = await fetch('/financial-tracker/api/financial-tracker/admin/users/send-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        body: JSON.stringify({
          email: generatedCredentials.email,
          name: formData.fullName,
          password: generatedCredentials.password,
          role: formData.role
        })
      });

      if (!response.ok) throw new Error('Failed to send email');
      
      toast.success('Credentials sent to user email');
    } catch (error) {
      toast.error('Failed to send email');
    }
  };

  // Continue to permissions
  const continueToPermissions = () => {
    router.push(`/admin/financial-tracker/users/${generatedCredentials?.username}/permissions`);
  };

  if (generatedCredentials) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border shadow-lg overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center">User Created Successfully!</h2>
            <p className="text-center text-green-100 mt-2">
              Save these credentials. They won't be shown again.
            </p>
          </div>

          {/* User Info */}
          <div className="p-6 border-b">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-900">{formData.fullName}</h3>
                <p className="text-sm text-gray-500">{formData.email}</p>
              </div>
              <span className="ml-auto px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full capitalize">
                {formData.role}
              </span>
            </div>
          </div>

          {/* Credentials Display */}
          <div className="p-6 bg-gray-50 border-b">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Generated Credentials</h4>
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-400">Username:</span>
                <span className="text-green-400">{generatedCredentials.username}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Password:</span>
                <span className="text-yellow-400">{generatedCredentials.password}</span>
              </div>
            </div>
            
            {/* Security Note */}
            <div className="mt-3 flex items-start space-x-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>These credentials are shown only once. Please save them securely.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 grid grid-cols-2 gap-3">
            <button
              onClick={copyCredentials}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </button>
            <button
              onClick={downloadCredentials}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
            <button
              onClick={sendCredentialsEmail}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 col-span-2"
            >
              <Send className="h-4 w-4 mr-2" />
              Send to Email
            </button>
          </div>

          {/* Next Steps */}
          <div className="p-6 bg-gray-50 border-t">
            <h4 className="font-medium text-gray-900 mb-3">Next Steps</h4>
            <button
              onClick={continueToPermissions}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Shield className="h-4 w-4 mr-2" />
              Configure Permissions
            </button>
            <button
              onClick={() => router.push('/admin/financial-tracker/users')}
              className="w-full flex items-center justify-center px-4 py-3 mt-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back to Users
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Users
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create New User</h1>
        <p className="text-gray-600 mt-1">Add a new user and generate credentials</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {/* Basic Information */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="h-4 w-4 inline mr-1" />
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="h-4 w-4 inline mr-1" />
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="h-4 w-4 inline mr-1" />
                Mobile
              </label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Employment Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Building2 className="h-4 w-4 inline mr-1" />
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Sales, Marketing"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Briefcase className="h-4 w-4 inline mr-1" />
                Designation
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Sales Manager"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID
              </label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Joining Date
              </label>
              <input
                type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Password</h2>
            <button
              type="button"
              onClick={generateStrongPassword}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <Key className="h-4 w-4 mr-1" />
              Generate Strong Password
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-3">
              <div className="flex items-center space-x-2">
                <div className={`h-1 flex-1 rounded ${
                  formData.password.length < 8 ? 'bg-red-500' :
                  formData.password.length < 10 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`} />
                <span className="text-xs text-gray-500">
                  {formData.password.length < 8 ? 'Weak' :
                   formData.password.length < 10 ? 'Medium' :
                   'Strong'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Notifications</h2>
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.sendEmail}
                onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Send credentials via email</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.notifyUser}
                onChange={(e) => setFormData({ ...formData, notifyUser: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Send welcome notification</span>
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="p-6 bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create User
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}