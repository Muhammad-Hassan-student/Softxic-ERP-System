"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
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
  Loader2,
  X,
  Image as ImageIcon,
  Key,
  Lock,
  AlertCircle,
  Check,
  ArrowLeft,
  Users,
  Activity,
  Clock,
  MessageSquare,
  Phone as PhoneIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { apiRequest, apiPost, debugCookies } from "@/lib/api-request"; // Import debugCookies
import { toast } from "sonner";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const params = useParams();
  const { user: currentUser, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    alternateMobile: "",
    address: "",
    jobTitle: "",
    department: "",
    salary: "",
    incentive: "",
    taxDeduction: false,
    taxAmount: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Check if current user can edit this profile
  const canEdit = () => {
    if (!currentUser || !user) return false;

    // Admin can edit anyone
    if (currentUser.role === "admin") return true;

    // HR can edit employees
    if (currentUser.role === "hr" && user.role === "employee") return true;

    // Users can edit their own profile
    return currentUser.id === user.id;
  };

  // Check if current user can change password
  const canChangePassword = () => {
    if (!currentUser || !user) return false;

    // Admin can change anyone's password
    if (currentUser.role === "admin") return true;

    // HR can change employee passwords
    if (currentUser.role === "hr" && user.role === "employee") return true;

    // Users (non-employees) can change their own password
    if (currentUser.id === user.id && currentUser.role !== "employee") return true;

    return false;
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
          fullName: response.data.fullName || "",
          email: response.data.email || "",
          mobile: response.data.mobile || "",
          alternateMobile: response.data.alternateMobile || "",
          address: response.data.address || "",
          jobTitle: response.data.jobTitle || "",
          department: response.data.department || "",
          salary: response.data.salary?.toString() || "",
          incentive: response.data.incentive?.toString() || "",
          taxDeduction: response.data.taxDeduction || false,
          taxAmount: response.data.taxAmount?.toString() || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(response.message || "Failed to load user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load user data");
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
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle switch change
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, etc.)");
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setIsUploadDialogOpen(true);
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = async () => {
    if (!selectedFile || !user) {
      toast.error("No file selected");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append("profilePhoto", selectedFile);
      formData.append("userId", user.id);

      const response = await apiRequest("/api/users/upload-profile", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        toast.success("Profile picture updated successfully!");
        // Update user state with new picture
        setUser((prev: any) => ({
          ...prev,
          profilePhoto: response.data.profilePhoto,
        }));

        // Clean up
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setSelectedFile(null);
        setPreviewUrl("");
        setIsUploadDialogOpen(false);
      } else {
        toast.error(response.message || "Failed to upload profile picture");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("Failed to upload profile picture");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
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
      if (currentUser?.role === "admin") {
        updateData.email = formData.email;
        updateData.jobTitle = formData.jobTitle;
        updateData.department = formData.department;
        updateData.salary = parseFloat(formData.salary) || 0;
        updateData.incentive = parseFloat(formData.incentive) || 0;
        updateData.taxDeduction = formData.taxDeduction;
        updateData.taxAmount = parseFloat(formData.taxAmount) || 0;
      } else if (currentUser?.role === "hr" && user?.role === "employee") {
        updateData.jobTitle = formData.jobTitle;
        updateData.department = formData.department;
        updateData.salary = parseFloat(formData.salary) || 0;
        updateData.incentive = parseFloat(formData.incentive) || 0;
      }

      const response = await apiRequest(`/api/users/${user.id}`, {
        method: "PUT",
        body: updateData,
      });

      if (response.success) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
        fetchUserData(); // Refresh data
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    // Check if user is an employee trying to change their own password
    if (currentUser?.role === "employee" && currentUser?.id === user.id) {
      toast.error("Employees cannot change their own password. Please contact HR or Admin.");
      return;
    }

    // If user is changing their own password (and not an employee), require current password
    if (currentUser?.id === user.id && !formData.currentPassword && currentUser?.role !== "employee") {
      toast.error("Current password is required");
      return;
    }

    try {
      setPasswordChangeLoading(true);

      const passwordData = {
        currentPassword: formData.currentPassword || "",
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      };

      console.log("🔍 Sending password change request:", {
        userId: user.id,
        currentUserRole: currentUser?.role,
        targetUserRole: user.role,
        requiresCurrentPassword: currentUser?.id === user.id && currentUser?.role !== "employee",
      });

      // Use PUT method with the correct endpoint
      const response = await apiRequest(`/api/users/${user.id}/password`, {
        method: "PUT",
        body: passwordData,
      });

      if (response.success) {
        toast.success("Password changed successfully");
        // Clear password fields
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        toast.error(response.message || "Failed to change password");
        console.error("Password change error:", response);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password. Please try again.");
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate net salary
  const calculateNetSalary = () => {
    const salary = user.salary || 0;
    const incentive = user.incentive || 0;
    const taxAmount = user.taxDeduction ? user.taxAmount || 0 : 0;
    return salary + incentive - taxAmount;
  };

  if (loading && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="relative">
          <Loader2 className="h-16 w-16 animate-spin text-gradient-to-r from-blue-500 to-purple-600" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 blur-xl opacity-20 animate-pulse"></div>
        </div>
        <p className="text-gray-600 mt-4 text-lg font-medium">
          Loading profile...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <Card className="max-w-md mx-auto border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-12 text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-500 rounded-full blur-lg opacity-30"></div>
              <User className="h-24 w-24 text-gradient-to-r from-red-400 to-pink-500 mx-auto relative z-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              User Not Found
            </h3>
            <p className="text-gray-600 mb-6">
              The requested user profile could not be found or you don't have
              permission to view it.
            </p>
            <Button
              onClick={() => window.history.back()}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                User Profile
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <Badge className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0 shadow-md">
                <Shield className="h-3.5 w-3.5 mr-1.5" />
                <span className="font-semibold capitalize">{user.role}</span>
              </Badge>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
                <Briefcase className="h-3.5 w-3.5 text-gray-600" />
                <span className="text-gray-700 font-medium">
                  {user.department}
                </span>
              </div>
              <p className="text-gray-600 text-lg">
                Welcome to{" "}
                <span className="font-semibold text-gray-900">
                  {user.fullName}'s
                </span>{" "}
                profile
              </p>
            </div>
          </div>

          {canEdit() && !isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 px-6 py-3 h-auto text-lg font-semibold"
            >
              <Save className="h-5 w-5 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Picture & Basic Info */}
        <div className="space-y-8">
          {/* Profile Card */}
          <Card className="overflow-hidden border-0 shadow-2xl relative bg-gradient-to-br from-white to-gray-50">
            {/* Gradient Header */}
            <div className="h-48 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-300/20 rounded-full blur-2xl"></div>
            </div>

            {/* Profile Picture Section */}
            <CardContent className="relative pt-0 px-8 pb-8">
              <div className="flex flex-col items-center -mt-24 mb-8">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-500"></div>
                  <Avatar className="h-40 w-40 border-4 border-white shadow-2xl relative z-10">
                    <AvatarImage
                      src={user.profilePhoto}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Upload Overlay */}
                  {canEdit() && (
                    <>
                      <div
                        className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-20 cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="text-center">
                          <Camera className="h-8 w-8 text-white mx-auto mb-2" />
                          <span className="text-white text-sm font-medium">
                            Change Photo
                          </span>
                        </div>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </>
                  )}
                </div>

                <div className="text-center mt-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {user.fullName}
                  </h2>
                  <p className="text-gray-600 text-lg mb-3">
                    {user.jobTitle || "No title assigned"}
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-white rounded-full border border-gray-200 shadow-sm">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700 font-medium">
                      {user.department}
                    </span>
                  </div>
                  
                  {canEdit() && (
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="mt-6"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Profile Picture
                    </Button>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:bg-white/80 transition-all duration-200 shadow-sm hover:shadow-md">
                  <div className="p-3 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Email
                    </p>
                    <p className="font-medium text-gray-900 mt-1 truncate">
                      {user.email || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:bg-white/80 transition-all duration-200 shadow-sm hover:shadow-md">
                  <div className="p-3 bg-gradient-to-r from-green-100 to-green-50 rounded-lg">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Mobile
                    </p>
                    <p className="font-medium text-gray-900 mt-1">
                      {user.mobile || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:bg-white/80 transition-all duration-200 shadow-sm hover:shadow-md">
                  <div className="p-3 bg-gradient-to-r from-purple-100 to-purple-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Joined
                    </p>
                    <p className="font-medium text-gray-900 mt-1">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:bg-white/80 transition-all duration-200 shadow-sm hover:shadow-md">
                  <div className="p-3 bg-gradient-to-r from-orange-100 to-orange-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Address
                    </p>
                    <p className="font-medium text-gray-900 mt-1">
                      {user.address || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salary Information (Only for employees) */}
          {user.role === "employee" && (
            <Card className="border-0 shadow-2xl relative bg-gradient-to-br from-white to-emerald-50/30 overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full -translate-y-16 translate-x-16"></div>

              <CardHeader className="relative z-10 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    Salary Information
                  </CardTitle>
                  <Badge className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border-0">
                    Monthly
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 p-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-center py-4 border-b border-gray-200/50">
                    <div>
                      <p className="text-gray-600 font-medium">Basic Salary</p>
                      <p className="text-sm text-gray-500">
                        Fixed monthly amount
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">
                      PKR {user.salary?.toLocaleString() || "0"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-4 border-b border-gray-200/50">
                    <div>
                      <p className="text-gray-600 font-medium">Incentive</p>
                      <p className="text-sm text-emerald-500 font-medium">
                        Performance bonus
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-emerald-600">
                      + PKR {user.incentive?.toLocaleString() || "0"}
                    </span>
                  </div>

                  {user.taxDeduction && (
                    <div className="flex justify-between items-center py-4 border-b border-gray-200/50">
                      <div>
                        <p className="text-gray-600 font-medium">
                          Tax Deduction
                        </p>
                        <p className="text-sm text-rose-500 font-medium">
                          Government tax
                        </p>
                      </div>
                      <span className="text-2xl font-bold text-rose-600">
                        - PKR {user.taxAmount?.toLocaleString() || "0"}
                      </span>
                    </div>
                  )}

                  <div className="pt-6">
                    <div className="bg-gradient-to-r from-emerald-50 to-white p-6 rounded-2xl border border-emerald-200 shadow-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-600 font-semibold text-lg">
                            Net Salary
                          </p>
                          <p className="text-sm text-gray-500">
                            Take home amount
                          </p>
                        </div>
                        <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
                          PKR {calculateNetSalary().toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                          <span>
                            Gross: PKR{" "}
                            {(user.salary + user.incentive).toLocaleString()}
                          </span>
                        </div>
                        {user.taxDeduction && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                            <span>
                              Tax: PKR {(user.taxAmount || 0).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Edit Profile Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Edit Form */}
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 overflow-hidden">
            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-white/80 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Profile Information
                  </CardTitle>
                </div>
                {canEdit() && isEditing && (
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        fetchUserData();
                      }}
                      disabled={loading}
                      className="border-gray-300 hover:bg-gray-50 px-5"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 px-6"
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      ) : (
                        <Save className="h-5 w-5 mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Personal Information
                      </h3>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <Label
                          htmlFor="fullName"
                          className="text-gray-700 font-medium mb-2 block"
                        >
                          Full Name
                        </Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="email"
                          className="text-gray-700 font-medium mb-2 block"
                        >
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing || currentUser?.role !== "admin"}
                          className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <Label
                            htmlFor="mobile"
                            className="text-gray-700 font-medium mb-2 block"
                          >
                            Mobile Number
                          </Label>
                          <Input
                            id="mobile"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <Label
                            htmlFor="alternateMobile"
                            className="text-gray-700 font-medium mb-2 block"
                          >
                            Alternate Mobile
                          </Label>
                          <Input
                            id="alternateMobile"
                            name="alternateMobile"
                            value={formData.alternateMobile}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <Label
                          htmlFor="address"
                          className="text-gray-700 font-medium mb-2 block"
                        >
                          Address
                        </Label>
                        <Textarea
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          rows={4}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job Information */}
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Job Information
                      </h3>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <Label
                          htmlFor="jobTitle"
                          className="text-gray-700 font-medium mb-2 block"
                        >
                          Job Title
                        </Label>
                        <Input
                          id="jobTitle"
                          name="jobTitle"
                          value={formData.jobTitle}
                          onChange={handleInputChange}
                          disabled={
                            !isEditing ||
                            !(
                              currentUser?.role === "admin" ||
                              (currentUser?.role === "hr" &&
                                user.role === "employee")
                            )
                          }
                          className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="department"
                          className="text-gray-700 font-medium mb-2 block"
                        >
                          Department
                        </Label>
                        <Select
                          value={formData.department}
                          onValueChange={(value) =>
                            handleSelectChange("department", value)
                          }
                          disabled={
                            !isEditing ||
                            !(
                              currentUser?.role === "admin" ||
                              (currentUser?.role === "hr" &&
                                user.role === "employee")
                            )
                          }
                        >
                          <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hr">Human Resources</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="sales">Sales</SelectItem>
                            <SelectItem value="support">Support</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="it">
                              Information Technology
                            </SelectItem>
                            <SelectItem value="operations">
                              Operations
                            </SelectItem>
                            <SelectItem value="admin">
                              Administration
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Salary Information (Only for Admin editing employees) */}
                      {currentUser?.role === "admin" &&
                        user.role === "employee" && (
                          <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div>
                                <Label
                                  htmlFor="salary"
                                  className="text-gray-700 font-medium mb-2 block"
                                >
                                  Salary (PKR)
                                </Label>
                                <Input
                                  id="salary"
                                  name="salary"
                                  type="number"
                                  value={formData.salary}
                                  onChange={handleInputChange}
                                  disabled={!isEditing}
                                  className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>

                              <div>
                                <Label
                                  htmlFor="incentive"
                                  className="text-gray-700 font-medium mb-2 block"
                                >
                                  Incentive (PKR)
                                </Label>
                                <Input
                                  id="incentive"
                                  name="incentive"
                                  type="number"
                                  value={formData.incentive}
                                  onChange={handleInputChange}
                                  disabled={!isEditing}
                                  className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                            </div>

                            <div className="space-y-6 pt-2">
                              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200">
                                <div>
                                  <Label
                                    htmlFor="taxDeduction"
                                    className="text-gray-700 font-medium block"
                                  >
                                    Tax Deduction
                                  </Label>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Enable tax deduction from salary
                                  </p>
                                </div>
                                <Switch
                                  checked={formData.taxDeduction}
                                  onCheckedChange={(checked) =>
                                    handleSwitchChange("taxDeduction", checked)
                                  }
                                  disabled={!isEditing}
                                />
                              </div>

                              {formData.taxDeduction && (
                                <div>
                                  <Label
                                    htmlFor="taxAmount"
                                    className="text-gray-700 font-medium mb-2 block"
                                  >
                                    Tax Amount (PKR)
                                  </Label>
                                  <Input
                                    id="taxAmount"
                                    name="taxAmount"
                                    type="number"
                                    value={formData.taxAmount}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                  />
                                </div>
                              )}
                            </div>
                          </>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Security Management - Simplified Beautiful Design */}
<Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50/30 overflow-hidden backdrop-blur-sm">
  <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-white/90 to-gray-50/90 backdrop-blur-sm py-6">
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl blur opacity-30"></div>
        <div className="relative p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-xl">
          <Lock className="h-6 w-6 text-white" />
        </div>
      </div>
      <div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Password Security
        </CardTitle>
        <p className="text-gray-600 text-sm mt-1">
          Manage account authentication credentials securely
        </p>
      </div>
    </div>
  </CardHeader>

  <CardContent className="p-6">
    {/* Employee Password Restriction View */}
    {user.role === "employee" && currentUser?.id === user.id ? (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl mb-4">
          <Lock className="h-8 w-8 text-amber-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          Password Change Restricted
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          For security compliance, employees cannot change their own passwords. 
          Please contact your HR department or system administrator for assistance.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => toast.info("HR department has been notified")}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
          >
            <Users className="h-4 w-4 mr-2" />
            Contact HR Department
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.info("Admin has been notified")}
            className="border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            <Shield className="h-4 w-4 mr-2" />
            Contact Administrator
          </Button>
        </div>
      </div>
    ) : canChangePassword() ? (
      /* Authorized Password Change Form - Simplified */
      <div className="space-y-6">
        {/* Security Requirements */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900 text-sm mb-2">
                Password Requirements
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-500" />
                  Minimum 6 characters
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-500" />
                  No common passwords
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-500" />
                  Should include letters and numbers
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Current Password - Only for self-change */}
        {currentUser?.id === user.id && currentUser?.role !== "employee" && (
          <div className="space-y-3">
            <Label htmlFor="currentPassword" className="text-gray-700 font-medium">
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showPassword ? "text" : "password"}
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* New Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label htmlFor="newPassword" className="text-gray-700 font-medium">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={handleInputChange}
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                placeholder="Enter new password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Password Strength</span>
                  <span className={`font-medium ${
                    formData.newPassword.length >= 8 ? 'text-green-600' : 
                    formData.newPassword.length >= 6 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {formData.newPassword.length >= 8 ? 'Strong' : 
                     formData.newPassword.length >= 6 ? 'Good' : 'Weak'}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      formData.newPassword.length >= 8 ? 'bg-green-500' : 
                      formData.newPassword.length >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(formData.newPassword.length * 12.5, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-3">
            <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            
            {/* Password Match Indicator */}
            {formData.confirmPassword && (
              <div className={`flex items-center gap-2 text-sm ${
                formData.newPassword === formData.confirmPassword 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {formData.newPassword === formData.confirmPassword ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Passwords match</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    <span>Passwords don't match</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Permission Context */}
        <div className="bg-gradient-to-r from-gray-50 to-white/80 rounded-xl border border-gray-200 p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900 text-sm">
                {currentUser?.role === "admin" && currentUser.id !== user.id
                  ? "Administrator Password Reset"
                  : currentUser?.role === "hr" && user.role === "employee"
                  ? "HR Password Management"
                  : "Personal Password Change"}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {currentUser?.role === "admin" && currentUser.id !== user.id
                  ? "You can reset this user's password without their current credentials."
                  : currentUser?.role === "hr" && user.role === "employee"
                  ? "You can manage employee passwords as part of HR responsibilities."
                  : "You are changing your own account password."}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            onClick={handlePasswordChange}
            disabled={passwordChangeLoading || !formData.newPassword || formData.newPassword !== formData.confirmPassword}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg hover:shadow-xl"
            size="lg"
          >
            {passwordChangeLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Updating Password...
              </>
            ) : (
              <>
                <Lock className="h-5 w-5 mr-2" />
                Update Password
              </>
            )}
          </Button>
        </div>
      </div>
    ) : (
      /* Unauthorized Access View */
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl mb-4">
          <Shield className="h-8 w-8 text-rose-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          Access Restricted
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Password management is restricted to authorized personnel only. 
          Please contact the security team if you need access.
        </p>
        <div className="space-y-3">
          <Button
            onClick={() => toast.info("Security team has been notified")}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
          >
            <Shield className="h-4 w-4 mr-2" />
            Request Authorization
          </Button>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full border-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Button>
        </div>
      </div>
    )}
  </CardContent>
</Card>
        </div>
      </div>

      {/* Profile Picture Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-lg border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50">
          <DialogHeader className="border-b border-gray-200/50 pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <Camera className="h-5 w-5 text-white" />
              </div>
              Update Profile Picture
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-8 py-6">
            {/* Image Preview */}
            <div className="flex justify-center">
              <div className="relative h-72 w-72 rounded-2xl overflow-hidden border-4 border-white shadow-2xl group">
                {previewUrl ? (
                  <>
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </>
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-gray-500 font-medium">Image Preview</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">
                    Uploading...
                  </span>
                  <span className="font-bold text-blue-600">
                    {uploadProgress}%
                  </span>
                </div>
                <Progress value={uploadProgress} className="h-2 bg-gray-200" />
              </div>
            )}

            {/* File Info */}
            {selectedFile && !uploading && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <ImageIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 truncate max-w-[200px]">
                        {selectedFile.name}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {selectedFile.type.split("/")[1].toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl("");
                      if (previewUrl) URL.revokeObjectURL(previewUrl);
                    }}
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsUploadDialogOpen(false);
                  setSelectedFile(null);
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setPreviewUrl("");
                }}
                disabled={uploading}
                className="flex-1 border-gray-300 hover:bg-gray-50 h-12"
              >
                Cancel
              </Button>
              <Button
                onClick={handleProfilePictureUpload}
                disabled={!selectedFile || uploading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl h-12 text-lg font-medium"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Picture
                  </>
                )}
              </Button>
            </div>

            {/* Upload Guidelines */}
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-700 font-medium mb-1">
                    Upload Guidelines
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>Supported formats: JPG, PNG, GIF, WebP</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>Maximum file size: 5MB</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>Recommended dimensions: 500x500 pixels</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>Square images work best for profile pictures</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}