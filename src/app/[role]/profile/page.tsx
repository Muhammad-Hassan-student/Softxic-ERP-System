'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  MapPin,
  Shield,
  DollarSign,
  Upload,
  Camera,
  Save,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api-request';
import { toast } from 'sonner';

export default function ProfilePage() {
  const params = useParams();
  const { user: currentUser, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    alternateMobile: '',
    address: '',
    jobTitle: '',
    department: '',
    salary: '',
    incentive: '',
    taxDeduction: false,
    taxAmount: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Check if current user can edit this profile
  const canEdit = () => {
    if (!currentUser || !user) return false;
    
    // Admin can edit anyone
    if (currentUser.role === 'admin') return true;
    
    // HR can edit employees
    if (currentUser.role === 'hr' && user.role === 'employee') return true;
    
    // Users can edit their own profile
    return currentUser.id === user.id;
  };

  // Check if current user can change password
  const canChangePassword = () => {
    if (!currentUser || !user) return false;
    
    // Admin can change anyone's password
    if (currentUser.role === 'admin') return true;
    
    // Users can only change their own password
    return currentUser.id === user.id;
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userId = params.id || currentUser?.id;
      
      if (!userId) return;
      
      const response = await apiRequest(`/api/users/${userId}`);
      
      if (response.success) {
        setUser(response.data);
        setFormData({
          fullName: response.data.fullName || '',
          email: response.data.email || '',
          mobile: response.data.mobile || '',
          alternateMobile: response.data.alternateMobile || '',
          address: response.data.address || '',
          jobTitle: response.data.jobTitle || '',
          department: response.data.department || '',
          salary: response.data.salary?.toString() || '',
          incentive: response.data.incentive?.toString() || '',
          taxDeduction: response.data.taxDeduction || false,
          taxAmount: response.data.taxAmount?.toString() || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(response.message || 'Failed to load user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      fetchUserData();
    }
  }, [isLoading, params.id]);

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle switch change
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('profilePhoto', file);
      formData.append('userId', user.id);

      const response = await apiRequest('/api/users/upload-profile', {
        method: 'POST',
        body: formData,
      });

      if (response.success) {
        toast.success('Profile picture updated successfully');
        // Update user state with new picture
        setUser((prev: any) => ({
          ...prev,
          profilePhoto: response.data.profilePhoto
        }));
      } else {
        toast.error(response.message || 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      // Prepare update data based on permissions
      const updateData: any = {
        fullName: formData.fullName,
        mobile: formData.mobile,
        alternateMobile: formData.alternateMobile,
        address: formData.address,
      };

      // Only include fields that current user is allowed to edit
      if (currentUser?.role === 'admin') {
        updateData.email = formData.email;
        updateData.jobTitle = formData.jobTitle;
        updateData.department = formData.department;
        updateData.salary = parseFloat(formData.salary) || 0;
        updateData.incentive = parseFloat(formData.incentive) || 0;
        updateData.taxDeduction = formData.taxDeduction;
        updateData.taxAmount = parseFloat(formData.taxAmount) || 0;
      } else if (currentUser?.role === 'hr' && user?.role === 'employee') {
        updateData.jobTitle = formData.jobTitle;
        updateData.department = formData.department;
        updateData.salary = parseFloat(formData.salary) || 0;
        updateData.incentive = parseFloat(formData.incentive) || 0;
      }

      const response = await apiRequest(`/api/users/${user.id}`, {
        method: 'PUT',
        body: updateData,
      });

      if (response.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        fetchUserData(); // Refresh data
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      
      const passwordData = {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        userId: user.id
      };

      const response = await apiRequest('/api/users/change-password', {
        method: 'POST',
        body: passwordData,
      });

      if (response.success) {
        toast.success('Password changed successfully');
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        toast.error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">User not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Profile - {user.fullName}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Picture & Basic Info */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={user.profilePhoto} />
                    <AvatarFallback className="text-2xl">
                      {user.fullName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  {canEdit() && (
                    <label className="absolute bottom-2 right-2 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePictureUpload}
                        disabled={uploading}
                      />
                      <div className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </div>
                    </label>
                  )}
                </div>
                
                <h2 className="text-xl font-bold">{user.fullName}</h2>
                <p className="text-gray-600">{user.jobTitle}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 capitalize">
                    {user.role} • {user.department}
                  </span>
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{user.email || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Mobile</p>
                    <p className="font-medium">{user.mobile}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Joined</p>
                    <p className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{user.address}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salary Information (Only for employees) */}
          {user.role === 'employee' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Salary Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Basic Salary</span>
                    <span className="font-bold">PKR {user.salary?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Incentive</span>
                    <span className="font-bold text-green-600">
                      + PKR {user.incentive?.toLocaleString()}
                    </span>
                  </div>
                  {user.taxDeduction && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax Deduction</span>
                      <span className="font-bold text-red-600">
                        - PKR {user.taxAmount?.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Net Salary</span>
                      <span className="text-xl font-bold">
                        PKR {(user.salary + user.incentive - user.taxAmount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Edit Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Edit Form */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Profile Information</CardTitle>
              {canEdit() && (
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          fetchUserData(); // Reset form
                        }}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile} disabled={loading}>
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Personal Information</h3>
                  
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing || currentUser?.role !== 'admin'}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="mobile">Mobile No</Label>
                      <Input
                        id="mobile"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="alternateMobile">Alternate Mobile</Label>
                      <Input
                        id="alternateMobile"
                        name="alternateMobile"
                        value={formData.alternateMobile}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Job Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Job Information</h3>
                  
                  <div>
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      disabled={!isEditing || !(currentUser?.role === 'admin' || (currentUser?.role === 'hr' && user.role === 'employee'))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => handleSelectChange('department', value)}
                      disabled={!isEditing || !(currentUser?.role === 'admin' || (currentUser?.role === 'hr' && user.role === 'employee'))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="it">IT</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Salary Information (Only for Admin editing employees) */}
                  {(currentUser?.role === 'admin' && user.role === 'employee') && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="salary">Salary (PKR)</Label>
                          <Input
                            id="salary"
                            name="salary"
                            type="number"
                            value={formData.salary}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="incentive">Incentive (PKR)</Label>
                          <Input
                            id="incentive"
                            name="incentive"
                            type="number"
                            value={formData.incentive}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="taxDeduction">Tax Deduction</Label>
                          <Switch
                            checked={formData.taxDeduction}
                            onCheckedChange={(checked) => handleSwitchChange('taxDeduction', checked)}
                            disabled={!isEditing}
                          />
                        </div>
                        
                        {formData.taxDeduction && (
                          <div>
                            <Label htmlFor="taxAmount">Tax Amount (PKR)</Label>
                            <Input
                              id="taxAmount"
                              name="taxAmount"
                              type="number"
                              value={formData.taxAmount}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Change Form */}
          {canChangePassword() && (
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current Password (only required if user is changing their own password) */}
                  {currentUser?.id === user.id && (
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.newPassword}
                          onChange={handleInputChange}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={handlePasswordChange} disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Change Password
                  </Button>
                  
                  {currentUser?.role === 'admin' && currentUser.id !== user.id && (
                    <p className="text-sm text-gray-600 mt-2">
                      As admin, you can change this user's password without entering current password.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}