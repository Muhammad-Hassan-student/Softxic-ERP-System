'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Key,
  Copy,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  Download,
  Send,
  DollarSign,
  CreditCard
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CreateModuleUserPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
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
    module: 're' as 're' | 'expense',
    entities: [] as string[],
    password: '',
    confirmPassword: '',
    sendEmail: true
  });

  const [permissions, setPermissions] = useState<Record<string, any>>({});

  // Entity options based on module
  const entityOptions = {
    re: ['dealer', 'fhh-client', 'cp-client', 'builder', 'project'],
    expense: ['dealer', 'fhh-client', 'cp-client', 'office', 'project', 'all']
  };

  const generateStrongPassword = () => {
    const length = 12;
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*";
    
    const allChars = uppercase + lowercase + numbers + symbols;
    let password = "";
    
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setFormData(prev => ({ 
      ...prev, 
      password, 
      confirmPassword: password 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.entities.length === 0) {
      toast.error('Select at least one entity');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('/financial-tracker/api/financial-tracker/module-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        body: JSON.stringify({
          ...formData,
          permissions
        })
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

      toast.success('Module user created successfully');

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (generatedCredentials) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center">Module User Created!</h2>
            <p className="text-center text-green-100 mt-2">
              User can now access {formData.module.toUpperCase()} module
            </p>
          </div>

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
                {formData.module}
              </span>
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-b">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Access Credentials</h4>
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
          </div>

          <div className="p-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `Username: ${generatedCredentials.username}\nPassword: ${generatedCredentials.password}`
                );
                toast.success('Copied!');
              }}
              className="flex items-center justify-center px-4 py-3 border rounded-lg hover:bg-gray-50"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </button>
            <button
              onClick={() => router.push('/admin/financial-tracker/module-users')}
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View All Users
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create Module User</h1>
        <p className="text-gray-600 mt-1">Create user with access to specific modules</p>
      </div>

      <div className="mb-8">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className={`flex-1 h-1 mx-2 ${
            step >= 2 ? 'bg-blue-600' : 'bg-gray-200'
          }`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {step === 1 && (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile
                  </label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Module *
                  </label>
                  <div className="flex border rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, module: 're', entities: [] });
                        setPermissions({});
                      }}
                      className={`flex-1 px-4 py-2 text-sm ${
                        formData.module === 're'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <DollarSign className="h-4 w-4 inline mr-1" />
                      RE Module
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, module: 'expense', entities: [] });
                        setPermissions({});
                      }}
                      className={`flex-1 px-4 py-2 text-sm ${
                        formData.module === 'expense'
                          ? 'bg-green-600 text-white'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <CreditCard className="h-4 w-4 inline mr-1" />
                      Expense Module
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Password</h2>
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
                      className="w-full px-3 py-2 border rounded-lg pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={generateStrongPassword}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <Key className="h-4 w-4 inline mr-1" />
                Generate Strong Password
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-6 space-y-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Select Entities & Set Permissions
            </h2>

            {entityOptions[formData.module].map((entity) => (
              <div key={entity} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.entities.includes(entity)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            entities: [...formData.entities, entity]
                          });
                          setPermissions({
                            ...permissions,
                            [entity]: {
                              access: true,
                              create: false,
                              edit: false,
                              delete: false,
                              scope: 'own'
                            }
                          });
                        } else {
                          setFormData({
                            ...formData,
                            entities: formData.entities.filter(e => e !== entity)
                          });
                          const newPerms = { ...permissions };
                          delete newPerms[entity];
                          setPermissions(newPerms);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="font-medium capitalize">
                      {entity.replace('-', ' ')}
                    </span>
                  </label>
                </div>

                {formData.entities.includes(entity) && (
                  <div className="ml-6 space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={permissions[entity]?.create || false}
                          onChange={(e) => setPermissions({
                            ...permissions,
                            [entity]: {
                              ...permissions[entity],
                              create: e.target.checked
                            }
                          })}
                          className="rounded border-gray-300 text-blue-600"
                        />
                        <span className="text-sm">Create</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={permissions[entity]?.edit || false}
                          onChange={(e) => setPermissions({
                            ...permissions,
                            [entity]: {
                              ...permissions[entity],
                              edit: e.target.checked
                            }
                          })}
                          className="rounded border-gray-300 text-blue-600"
                        />
                        <span className="text-sm">Edit</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={permissions[entity]?.delete || false}
                          onChange={(e) => setPermissions({
                            ...permissions,
                            [entity]: {
                              ...permissions[entity],
                              delete: e.target.checked
                            }
                          })}
                          className="rounded border-gray-300 text-blue-600"
                        />
                        <span className="text-sm">Delete</span>
                      </label>
                      <select
                        value={permissions[entity]?.scope || 'own'}
                        onChange={(e) => setPermissions({
                          ...permissions,
                          [entity]: {
                            ...permissions[entity],
                            scope: e.target.value as 'own' | 'all'
                          }
                        })}
                        className="px-2 py-1 border rounded-lg text-sm"
                      >
                        <option value="own">Own Records</option>
                        <option value="all">All Records</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="p-6 bg-gray-50 flex justify-between">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg"
            >
              Previous
            </button>
          )}
          {step < 2 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="ml-auto flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
          )}
        </div>
      </form>

      <div className="mt-4 text-sm text-gray-500">
        <AlertCircle className="h-4 w-4 inline mr-1" />
        User will only have access to selected modules and entities
      </div>
    </div>
  );
}