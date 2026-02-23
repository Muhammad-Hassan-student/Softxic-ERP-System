// src/app/admin/financial-tracker/categories/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
  FolderTree,
  Palette,
  Type,
  AlignLeft,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Sparkles,
  DollarSign,
  CreditCard,
  Grid3x3,
  Layers,
  Copy,
  Shield,
  Menu,
  Loader2,
  Filter,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Activity,
  BarChart3,
  Clock,
  Calendar,
  User,
  Globe,
  Award,
  Zap,
  Star,
  Flag,
  Bell,
  Briefcase,
  Building,
  Code,
  Database,
  Gift,
  Key,
  Lightbulb,
  Link,
  Lock,
  Server,
  ShoppingBag,
  ShoppingCart,
  Signal,
  Smartphone,
  ThumbsUp,
  ThumbsDown,
  Ticket,
  Timer,
  Wifi,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Square,
  ChevronsUpDown,
  GripVertical,
  Pencil,
  FileDown,
  FileUp,
  Printer,
  EyeIcon,
  EyeOffIcon,
  Power,
  PowerOff,
  ToggleLeft,
  ToggleRight,
  Settings2,
  Sliders,
  ListFilter,
  ListChecks,
  ListTodo,
  ListTree,
  ListOrdered,
  ListPlus,
  ListMinus,
  ListX,
  ListCheck,
  ListCollapse,
  Grip,
  GripHorizontal,
  GripVerticalIcon,
  Move,
  MoveHorizontal,
  MoveVertical,
  Move3d,
  MoveDiagonal,
  MoveDiagonal2,
  ArrowLeft,
  ArrowRight,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "lucide-react";

// ✅ Token utility function with Bearer prefix
const getToken = (): string => {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/token=([^;]+)/);
  return match ? match[1] : "";
};

// ✅ Auth header helper
const getAuthHeader = () => ({
  Authorization: `Bearer ${getToken()}`,
});

interface Category {
  _id: string;
  module: "re" | "expense";
  entity: string;
  name: string;
  description?: string;
  type: "income" | "expense" | "both";
  isActive: boolean;
  isSystem: boolean;
  color: string;
  icon?: string;
  parentCategory?: Category;
  createdBy?: { fullName: string; email: string };
  updatedBy?: { fullName: string; email: string };
  createdAt: string;
  updatedAt: string;
}

interface Entity {
  _id: string;
  module: "re" | "expense";
  entityKey: string;
  name: string;
  description?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState<
    "all" | "re" | "expense"
  >("all");
  const [selectedEntity, setSelectedEntity] = useState<string>("all");
  const [showInactive, setShowInactive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "created" | "updated">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    system: 0,
    income: 0,
    expense: 0,
  });

  const [formData, setFormData] = useState({
    module: "re" as "re" | "expense",
    entity: "",
    name: "",
    description: "",
    type: "both" as "income" | "expense" | "both",
    color: "#4361ee",
    icon: "Tag",
    isActive: true,
  });

  // ✅ Fetch entities from database - FIXED ENDPOINT
  const fetchEntities = async () => {
    try {
      const response = await fetch(
        `/financial-tracker/api/financial-tracker/entities`,
        {
          headers: getAuthHeader(),
        },
      );

      if (!response.ok) {
        console.error("Failed to fetch entities:", response.status);
        return;
      }

      const data = await response.json();
      setEntities(data.entities || []);
    } catch (error) {
      console.error("Failed to fetch entities:", error);
    }
  };

  // ✅ Fetch categories - FIXED ENDPOINT
  const fetchCategories = async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();
      if (selectedModule !== "all") params.append("module", selectedModule);
      if (selectedEntity !== "all") params.append("entity", selectedEntity);
      if (!showInactive) params.append("active", "true");

      const response = await fetch(
        `/financial-tracker/api/financial-tracker/categories?${params.toString()}`,
        {
          headers: getAuthHeader(),
        },
      );

      if (!response.ok) throw new Error("Failed to fetch categories");

      const data = await response.json();
      let sortedCategories = data.categories || [];

      // Apply sorting
      sortedCategories.sort((a: Category, b: Category) => {
        if (sortBy === "name") {
          return sortOrder === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        } else if (sortBy === "created") {
          return sortOrder === "asc"
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else {
          return sortOrder === "asc"
            ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
            : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
      });

      setCategories(sortedCategories);

      const cats = data.categories || [];
      setStats({
        total: cats.length,
        active: cats.filter((c: Category) => c.isActive).length,
        system: cats.filter((c: Category) => c.isSystem).length,
        income: cats.filter((c: Category) => c.type === "income").length,
        expense: cats.filter((c: Category) => c.type === "expense").length,
      });
    } catch (error) {
      toast.error("Failed to load categories");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    fetchEntities();
    fetchCategories();
  }, [selectedModule, selectedEntity, showInactive, sortBy, sortOrder]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Get filtered entity options based on selected module
  const getEntityOptions = () => {
    if (selectedModule === "all") {
      return entities;
    }
    return entities.filter((e) => e.module === selectedModule);
  };

  // ✅ Validate if entity is valid for selected module
  const isValidEntity = (
    module: "re" | "expense",
    entityKey: string,
  ): boolean => {
    if (!entityKey) return false;
    const entity = entities.find((e) => e.entityKey === entityKey);
    return entity ? entity.module === module : false;
  };

  // In your CategoriesPage component, update the handleSubmit:

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.entity) {
      toast.error("Please select an entity");
      return;
    }

    try {
      const url = editingCategory
        ? `/financial-tracker/api/financial-tracker/categories/${editingCategory._id}`
        : "/financial-tracker/api/financial-tracker/categories";

      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle entity validation error gracefully
        if (response.status === 400 && data.suggestion) {
          toast.error(
            <div>
              <p className="font-semibold">{data.error}</p>
              <p className="text-sm mt-1">{data.details}</p>
              <p className="text-sm text-blue-600 mt-2">{data.suggestion}</p>
            </div>,
          );
        } else {
          throw new Error(data.error || "Failed to save category");
        }
        return;
      }

      toast.success(
        editingCategory
          ? "Category updated successfully"
          : "Category created successfully",
      );
      setIsModalOpen(false);
      setEditingCategory(null);
      resetForm();
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // ✅ Handle delete
  const handleDelete = async (category: Category) => {
    if (category.isSystem) {
      toast.error("System categories cannot be deleted");
      return;
    }

    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return;

    try {
      const response = await fetch(
        `/financial-tracker/api/financial-tracker/categories/${category._id}`,
        {
          method: "DELETE",
          headers: getAuthHeader(),
        },
      );

      if (!response.ok) throw new Error("Failed to delete category");

      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  // ✅ Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedCategories.length} categories?`,
      )
    )
      return;

    try {
      await Promise.all(
        selectedCategories.map(async (id) => {
          await fetch(
            `/financial-tracker/api/financial-tracker/categories/${id}`,
            {
              method: "DELETE",
              headers: getAuthHeader(),
            },
          );
        }),
      );

      toast.success(
        `${selectedCategories.length} categories deleted successfully`,
      );
      setSelectedCategories([]);
      setShowBulkActions(false);
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete some categories");
    }
  };

  // ✅ Handle bulk toggle active
  const handleBulkToggleActive = async () => {
    if (selectedCategories.length === 0) return;

    try {
      await Promise.all(
        selectedCategories.map(async (id) => {
          await fetch(
            `/financial-tracker/api/financial-tracker/categories/${id}/toggle`,
            {
              method: "PATCH",
              headers: getAuthHeader(),
            },
          );
        }),
      );

      toast.success(
        `${selectedCategories.length} categories toggled successfully`,
      );
      setSelectedCategories([]);
      setShowBulkActions(false);
      fetchCategories();
    } catch (error) {
      toast.error("Failed to toggle some categories");
    }
  };

  // ✅ Handle toggle active
  const handleToggleActive = async (category: Category) => {
    try {
      const response = await fetch(
        `/financial-tracker/api/financial-tracker/categories/${category._id}/toggle`,
        {
          method: "PATCH",
          headers: getAuthHeader(),
        },
      );

      if (!response.ok) throw new Error("Failed to toggle category");

      toast.success(
        `Category ${category.isActive ? "deactivated" : "activated"} successfully`,
      );
      fetchCategories();
    } catch (error) {
      toast.error("Failed to toggle category");
    }
  };

  // ✅ Handle duplicate - FIXED
  const handleDuplicate = (category: Category) => {
    const entityExists = entities.some(
      (e) => e.entityKey === category.entity && e.module === category.module,
    );

    if (!entityExists) {
      toast.error(
        `Cannot duplicate: Entity "${category.entity}" not found in ${category.module} module`,
      );
      return;
    }

    setFormData({
      module: category.module,
      entity: category.entity,
      name: `${category.name} (Copy)`,
      description: category.description || "",
      type: category.type,
      color: category.color,
      icon: category.icon || "Tag",
      isActive: category.isActive,
    });
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  // ✅ Handle export
  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedModule !== "all") params.append("module", selectedModule);
      if (selectedEntity !== "all") params.append("entity", selectedEntity);

      const response = await fetch(
        `/financial-tracker/api/financial-tracker/categories/export?${params.toString()}`,
        {
          headers: getAuthHeader(),
        },
      );

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `categories-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Categories exported successfully");
    } catch (error) {
      toast.error("Failed to export categories");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      module: "re",
      entity: "",
      name: "",
      description: "",
      type: "both",
      color: "#4361ee",
      icon: "Tag",
      isActive: true,
    });
  };

  // Edit category
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      module: category.module,
      entity: category.entity,
      name: category.name,
      description: category.description || "",
      type: category.type,
      color: category.color,
      icon: category.icon || "Tag",
      isActive: category.isActive,
    });
    setIsModalOpen(true);
  };

  // Toggle category selection
  const toggleSelect = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedCategories.length === filteredCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(filteredCategories.map((c) => c._id));
    }
  };

  // Toggle dropdown - FIXED
  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.entity.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Get entity display name
  const getEntityName = (entityKey: string) => {
    const entity = entities.find((e) => e.entityKey === entityKey);
    return (
      entity?.name ||
      entityKey
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  };

  // ✅ Function to get status badge with better visibility
  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          <span className="relative flex h-2 w-2 mr-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
          <span className="relative flex h-2 w-2 mr-1.5">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-400"></span>
          </span>
          Inactive
        </span>
      );
    }
  };

  // ✅ Function to get entity badge with module color
  const getEntityBadge = (module: string, entity: string) => {
    const colors = {
      re: "bg-indigo-100 text-indigo-800 border-indigo-200",
      expense: "bg-emerald-100 text-emerald-800 border-emerald-200",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[module as keyof typeof colors]}`}
      >
        {getEntityName(entity)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header with modern glass morphism */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-indigo-100 shadow-lg shadow-indigo-500/5">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          {/* Top Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center justify-between lg:justify-start">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30">
                  <FolderTree className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-800 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                    Category Management
                  </h1>
                  <p className="text-sm text-indigo-500 mt-0.5">
                    Organize your financial categories
                  </p>
                </div>
              </div>

              {/* Mobile Action Buttons */}
              <div className="flex items-center gap-2 lg:hidden">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all active:scale-95"
                >
                  <Filter className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2.5 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-all active:scale-95"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    resetForm();
                    setIsModalOpen(true);
                  }}
                  className="p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-500/30 active:scale-95"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Desktop Stats Cards */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-indigo-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-600" />
                  <span className="text-sm font-medium text-slate-600">
                    Total
                  </span>
                  <span className="text-xl font-bold text-indigo-600">
                    {stats.total}
                  </span>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-emerald-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-600">
                    Active
                  </span>
                  <span className="text-xl font-bold text-emerald-600">
                    {stats.active}
                  </span>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-purple-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-slate-600">
                    System
                  </span>
                  <span className="text-xl font-bold text-purple-600">
                    {stats.system}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Stats Panel */}
          {isMobileMenuOpen && (
            <div className="mt-4 lg:hidden animate-slideDown">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-200 text-center">
                  <div className="text-indigo-600 text-lg font-bold">
                    {stats.total}
                  </div>
                  <div className="text-xs text-slate-500">Total</div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-center">
                  <div className="text-emerald-600 text-lg font-bold">
                    {stats.active}
                  </div>
                  <div className="text-xs text-slate-500">Active</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 border border-purple-200 text-center">
                  <div className="text-purple-600 text-lg font-bold">
                    {stats.system}
                  </div>
                  <div className="text-xs text-slate-500">System</div>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-center">
                  <div className="text-amber-600 text-lg font-bold">
                    {stats.income}
                  </div>
                  <div className="text-xs text-slate-500">Income</div>
                </div>
                <div className="bg-rose-50 rounded-xl p-3 border border-rose-200 text-center">
                  <div className="text-rose-600 text-lg font-bold">
                    {stats.expense}
                  </div>
                  <div className="text-xs text-slate-500">Expense</div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Filters Panel */}
          {showMobileFilters && (
            <div className="mt-4 lg:hidden animate-slideDown">
              <div className="bg-white rounded-2xl border border-indigo-200 p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-indigo-900">Filters</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-1.5 hover:bg-indigo-50 rounded-lg"
                  >
                    <X className="h-5 w-5 text-indigo-400" />
                  </button>
                </div>
                <div className="space-y-4">
                  {/* Search - FIXED: Text visibility */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400" />
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-sm border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                      style={{ color: "#111827" }} // Explicit dark text
                    />
                  </div>

                  {/* Module Filter */}
                  <select
                    value={selectedModule}
                    onChange={(e) => {
                      setSelectedModule(e.target.value as any);
                      setSelectedEntity("all");
                    }}
                    className="w-full px-4 py-3 text-sm border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                  >
                    <option value="all">All Modules</option>
                    <option value="re">RE Module</option>
                    <option value="expense">Expense Module</option>
                  </select>

                  {/* Entity Filter */}
                  <select
                    value={selectedEntity}
                    onChange={(e) => setSelectedEntity(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                  >
                    <option value="all">All Entities</option>
                    {getEntityOptions().map((entity) => (
                      <option key={entity._id} value={entity.entityKey}>
                        {entity.name}
                      </option>
                    ))}
                  </select>

                  {/* Sort By */}
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [newSortBy, newSortOrder] = e.target.value.split(
                        "-",
                      ) as ["name" | "created" | "updated", "asc" | "desc"];
                      setSortBy(newSortBy);
                      setSortOrder(newSortOrder);
                    }}
                    className="w-full px-4 py-3 text-sm border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="created-desc">Newest First</option>
                    <option value="created-asc">Oldest First</option>
                    <option value="updated-desc">Recently Updated</option>
                  </select>

                  {/* Show Inactive Toggle */}
                  <label className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                    <input
                      type="checkbox"
                      checked={showInactive}
                      onChange={(e) => setShowInactive(e.target.checked)}
                      className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-indigo-700">
                      Show inactive
                    </span>
                  </label>

                  {/* View Mode Toggle */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setViewMode("grid");
                        setShowMobileFilters(false);
                      }}
                      className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                        viewMode === "grid"
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                          : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                      }`}
                    >
                      <Grid3x3 className="h-4 w-4" />
                      Grid
                    </button>
                    <button
                      onClick={() => {
                        setViewMode("list");
                        setShowMobileFilters(false);
                      }}
                      className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                        viewMode === "list"
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                          : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                      }`}
                    >
                      <Layers className="h-4 w-4" />
                      List
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <button
                      onClick={handleExport}
                      className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all active:scale-95"
                      title="Export"
                    >
                      <Download className="h-5 w-5 mx-auto" />
                    </button>
                    <button
                      onClick={fetchCategories}
                      className="p-3 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-all active:scale-95"
                      title="Refresh"
                    >
                      <RefreshCw className="h-5 w-5 mx-auto" />
                    </button>
                    <button
                      onClick={() => {
                        setViewMode(viewMode === "grid" ? "list" : "grid");
                      }}
                      className="p-3 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-100 transition-all active:scale-95"
                      title="Toggle View"
                    >
                      {viewMode === "grid" ? (
                        <Layers className="h-5 w-5 mx-auto" />
                      ) : (
                        <Grid3x3 className="h-5 w-5 mx-auto" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Filters Bar */}
          <div className="hidden lg:flex lg:items-center lg:gap-3 mt-5">
            {/* Search - FIXED: Text visibility */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-400" />
                <input
                  type="text"
                  placeholder="Search categories by name, entity..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-5 py-3 text-sm border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                  style={{ color: "#111827" }} // Explicit dark text
                />
              </div>
            </div>

            {/* Module Filter */}
            <div className="relative min-w-[140px]">
              <select
                value={selectedModule}
                onChange={(e) => {
                  setSelectedModule(e.target.value as any);
                  setSelectedEntity("all");
                }}
                className="w-full px-4 py-3 text-sm border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 appearance-none bg-white text-gray-900"
              >
                <option value="all">All Modules</option>
                <option value="re">RE Module</option>
                <option value="expense">Expense Module</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400 pointer-events-none" />
            </div>

            {/* Entity Filter */}
            <div className="relative min-w-[160px]">
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 appearance-none bg-white text-gray-900"
              >
                <option value="all">All Entities</option>
                {getEntityOptions().map((entity) => (
                  <option key={entity._id} value={entity.entityKey}>
                    {entity.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400 pointer-events-none" />
            </div>

            {/* Sort By */}
            <div className="relative min-w-[140px]">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split(
                    "-",
                  ) as ["name" | "created" | "updated", "asc" | "desc"];
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className="w-full px-4 py-3 text-sm border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 appearance-none bg-white text-gray-900"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="created-desc">Newest</option>
                <option value="created-asc">Oldest</option>
                <option value="updated-desc">Updated</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400 pointer-events-none" />
            </div>

            {/* Show Inactive Toggle */}
            <label className="flex items-center space-x-2 px-4 py-3 border border-indigo-200 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors bg-white">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-indigo-600 whitespace-nowrap">
                Show inactive
              </span>
            </label>

            {/* View Toggle */}
            <div className="flex border border-indigo-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 transition-all ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                    : "text-indigo-600 hover:bg-indigo-50"
                }`}
                title="Grid View"
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 border-l border-indigo-200 transition-all ${
                  viewMode === "list"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                    : "text-indigo-600 hover:bg-indigo-50"
                }`}
                title="List View"
              >
                <Layers className="h-5 w-5" />
              </button>
            </div>

            {/* Action Buttons */}
            <button
              onClick={handleExport}
              className="p-3 border border-indigo-200 rounded-xl hover:bg-indigo-50 text-indigo-600 bg-white transition-all active:scale-95"
              title="Export to CSV"
            >
              <Download className="h-5 w-5" />
            </button>

            <button
              onClick={fetchCategories}
              className="p-3 border border-indigo-200 rounded-xl hover:bg-purple-50 text-purple-600 bg-white transition-all active:scale-95"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </button>

            <button
              onClick={() => {
                setEditingCategory(null);
                resetForm();
                setIsModalOpen(true);
              }}
              className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 font-medium text-sm flex items-center whitespace-nowrap active:scale-95"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Category
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedCategories.length > 0 && (
        <div className="sticky top-[88px] lg:top-[104px] z-20 bg-white border-b border-indigo-100 shadow-md animate-slideDown">
          <div className="px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-indigo-600">
                  {selectedCategories.length} selected
                </span>
                <button
                  onClick={toggleSelectAll}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  {selectedCategories.length === filteredCategories.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkToggleActive}
                  className="px-4 py-2 text-sm bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 border border-amber-200 transition-all active:scale-95"
                >
                  Toggle Active
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 text-sm bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 border border-rose-200 transition-all active:scale-95"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <Loader2 className="h-12 w-12 text-indigo-600 animate-spin relative" />
            </div>
            <p className="mt-4 text-indigo-400 font-medium">
              Loading categories...
            </p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-indigo-200 shadow-xl p-10 text-center max-w-lg mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30">
              <FolderTree className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-800 to-purple-800 bg-clip-text text-transparent mb-3">
              No Categories Found
            </h3>
            <p className="text-indigo-400 mb-8">
              {searchTerm || selectedEntity !== "all" || showInactive
                ? "Try adjusting your filters"
                : "Create your first category to get started"}
            </p>
            <button
              onClick={() => {
                setEditingCategory(null);
                resetForm();
                setIsModalOpen(true);
              }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 text-base active:scale-95"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create First Category
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View - FIXED: Better inactive visibility */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
            {filteredCategories.map((category) => (
              <div
                key={category._id}
                className={`group relative bg-white rounded-xl border shadow-md hover:shadow-xl transition-all ${
                  !category.isActive
                    ? "border-gray-200 bg-gray-50/50 opacity-75"
                    : "border-indigo-100"
                }`}
              >
                {/* Color Header - Shows even for inactive */}
                <div
                  className={`h-2 rounded-t-xl ${!category.isActive ? "opacity-50" : ""}`}
                  style={{ backgroundColor: category.color }}
                />

                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category._id)}
                        onChange={() => toggleSelect(category._id)}
                        className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          !category.isActive ? "opacity-50" : ""
                        }`}
                        style={{
                          background: `linear-gradient(135deg, ${category.color}15, ${category.color}25)`,
                          color: category.color,
                        }}
                      >
                        <FolderTree className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Status Badge - Added for mobile visibility */}
                    <div className="sm:hidden">
                      {getStatusBadge(category.isActive)}
                    </div>

                    {/* Actions Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={(e) => toggleDropdown(category._id, e)}
                        className="p-1.5 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <MoreVertical className="h-4 w-4 text-indigo-400" />
                      </button>

                      {activeDropdown === category._id && (
                        <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-indigo-200 z-20 py-2 animate-fadeIn">
                          <button
                            onClick={() => {
                              handleEdit(category);
                              setActiveDropdown(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-indigo-50 flex items-center transition-colors"
                          >
                            <Edit className="h-4 w-4 mr-3 text-indigo-600" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              handleDuplicate(category);
                              setActiveDropdown(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-purple-50 flex items-center transition-colors"
                          >
                            <Copy className="h-4 w-4 mr-3 text-purple-600" />
                            Duplicate
                          </button>
                          <button
                            onClick={() => {
                              handleToggleActive(category);
                              setActiveDropdown(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-amber-50 flex items-center transition-colors"
                          >
                            {category.isActive ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-3 text-amber-600" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-3 text-emerald-600" />
                                Activate
                              </>
                            )}
                          </button>
                          {!category.isSystem && (
                            <button
                              onClick={() => {
                                handleDelete(category);
                                setActiveDropdown(null);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-rose-50 flex items-center text-rose-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4 mr-3" />
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3
                        className={`font-semibold text-base line-clamp-1 ${
                          !category.isActive
                            ? "text-gray-500"
                            : "text-indigo-900"
                        }`}
                      >
                        {category.name}
                      </h3>
                      {/* Desktop Status Badge */}
                      <div className="hidden sm:block">
                        {getStatusBadge(category.isActive)}
                      </div>
                    </div>
                    {category.description && (
                      <p
                        className={`text-sm line-clamp-2 ${
                          !category.isActive
                            ? "text-gray-400"
                            : "text-indigo-500"
                        }`}
                      >
                        {category.description}
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        category.module === "re"
                          ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                          : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      } ${!category.isActive ? "opacity-50" : ""}`}
                    >
                      {category.module === "re" ? "RE" : "EXP"}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        category.type === "income"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : category.type === "expense"
                            ? "bg-rose-100 text-rose-700 border border-rose-200"
                            : "bg-amber-100 text-amber-700 border border-amber-200"
                      } ${!category.isActive ? "opacity-50" : ""}`}
                    >
                      {category.type === "both" ? "Both" : category.type}
                    </span>
                    {category.isSystem && (
                      <span
                        className={`px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full border border-purple-200 flex items-center ${
                          !category.isActive ? "opacity-50" : ""
                        }`}
                      >
                        <Shield className="h-3 w-3 mr-0.5" />
                        System
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div
                    className={`flex items-center justify-between text-xs border-t pt-3 ${
                      !category.isActive
                        ? "border-gray-200 text-gray-400"
                        : "border-indigo-100 text-indigo-400"
                    }`}
                  >
                    <span className="truncate max-w-[80px]">
                      {getEntityName(category.entity)}
                    </span>
                    <span>
                      {new Date(category.updatedAt).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View - FIXED: Better inactive visibility */
          <div className="bg-white rounded-xl border border-indigo-200 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-200">
                  <tr>
                    <th className="px-4 py-4 w-12">
                      <input
                        type="checkbox"
                        checked={
                          selectedCategories.length ===
                            filteredCategories.length &&
                          filteredCategories.length > 0
                        }
                        onChange={toggleSelectAll}
                        className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                      Module
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                      Entity
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-4 text-right text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-100">
                  {filteredCategories.map((category) => (
                    <tr
                      key={category._id}
                      className={`hover:bg-indigo-50/50 transition-colors ${
                        !category.isActive ? "bg-gray-50/50" : ""
                      }`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category._id)}
                          onChange={() => toggleSelect(category._id)}
                          className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                              !category.isActive ? "opacity-50" : ""
                            }`}
                            style={{
                              background: `linear-gradient(135deg, ${category.color}15, ${category.color}25)`,
                              color: category.color,
                            }}
                          >
                            <FolderTree className="h-4 w-4" />
                          </div>
                          <div>
                            <div
                              className={`text-sm font-medium ${
                                !category.isActive
                                  ? "text-gray-500"
                                  : "text-indigo-900"
                              }`}
                            >
                              {category.name}
                            </div>
                            {category.description && (
                              <div
                                className={`text-xs truncate max-w-[200px] ${
                                  !category.isActive
                                    ? "text-gray-400"
                                    : "text-indigo-400"
                                }`}
                              >
                                {category.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-3 py-1 text-xs rounded-full ${
                            category.module === "re"
                              ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                              : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          } ${!category.isActive ? "opacity-50" : ""}`}
                        >
                          {category.module === "re" ? "RE" : "EXP"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {getEntityBadge(category.module, category.entity)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-3 py-1 text-xs rounded-full ${
                            category.type === "income"
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : category.type === "expense"
                                ? "bg-rose-100 text-rose-700 border border-rose-200"
                                : "bg-amber-100 text-amber-700 border border-amber-200"
                          } ${!category.isActive ? "opacity-50" : ""}`}
                        >
                          {category.type === "both" ? "Both" : category.type}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(category.isActive)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleEdit(category)}
                            className={`p-2 rounded-lg transition-colors active:scale-95 ${
                              !category.isActive
                                ? "text-gray-400 hover:bg-gray-100"
                                : "text-indigo-600 hover:bg-indigo-100"
                            }`}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(category)}
                            className={`p-2 rounded-lg transition-colors active:scale-95 ${
                              !category.isActive
                                ? "text-gray-400 hover:bg-gray-100"
                                : "text-purple-600 hover:bg-purple-100"
                            }`}
                            title="Duplicate"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(category)}
                            className={`p-2 rounded-lg transition-colors active:scale-95 ${
                              category.isActive
                                ? "text-amber-600 hover:bg-amber-100"
                                : "text-emerald-600 hover:bg-emerald-100"
                            }`}
                            title={
                              category.isActive ? "Deactivate" : "Activate"
                            }
                          >
                            {category.isActive ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-4 py-3 border-t border-indigo-200 bg-indigo-50/50">
              <div className="flex items-center justify-between text-sm text-indigo-500">
                <span>
                  Showing {filteredCategories.length} of {categories.length}{" "}
                  categories
                  {stats.active > 0 && (
                    <span className="ml-2 text-emerald-600">
                      ({stats.active} active, {stats.total - stats.active}{" "}
                      inactive)
                    </span>
                  )}
                </span>
                {selectedCategories.length > 0 && (
                  <span className="font-medium text-indigo-600">
                    {selectedCategories.length} selected
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scaleIn">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-indigo-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg">
                    {editingCategory ? (
                      <Edit className="h-5 w-5 text-white" />
                    ) : (
                      <Plus className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <h2 className="text-lg font-semibold text-indigo-900">
                    {editingCategory ? "Edit Category" : "Create New Category"}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCategory(null);
                    resetForm();
                  }}
                  className="p-1.5 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-indigo-400" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Module Selection */}
              <div>
                <label className="block text-sm font-medium text-indigo-700 mb-2">
                  Module <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, module: "re", entity: "" })
                    }
                    className={`p-4 border-2 rounded-xl flex flex-col items-center transition-all ${
                      formData.module === "re"
                        ? "border-indigo-500 bg-indigo-50 shadow-md"
                        : "border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                    }`}
                  >
                    <DollarSign
                      className={`h-6 w-6 mb-2 ${
                        formData.module === "re"
                          ? "text-indigo-600"
                          : "text-indigo-400"
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        formData.module === "re"
                          ? "text-indigo-700"
                          : "text-indigo-500"
                      }`}
                    >
                      RE Module
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        module: "expense",
                        entity: "",
                      })
                    }
                    className={`p-4 border-2 rounded-xl flex flex-col items-center transition-all ${
                      formData.module === "expense"
                        ? "border-emerald-500 bg-emerald-50 shadow-md"
                        : "border-indigo-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                    }`}
                  >
                    <CreditCard
                      className={`h-6 w-6 mb-2 ${
                        formData.module === "expense"
                          ? "text-emerald-600"
                          : "text-indigo-400"
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        formData.module === "expense"
                          ? "text-emerald-700"
                          : "text-indigo-500"
                      }`}
                    >
                      Expense Module
                    </span>
                  </button>
                </div>
              </div>

              {/* Entity Selection */}
              <div>
                <label className="block text-sm font-medium text-indigo-700 mb-1">
                  Entity <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.entity}
                  onChange={(e) =>
                    setFormData({ ...formData, entity: e.target.value })
                  }
                  className="w-full px-4 py-3 text-sm border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900"
                  required
                >
                  <option value="">Select an entity</option>
                  {entities
                    .filter((e) => e.module === formData.module)
                    .map((entity) => (
                      <option key={entity._id} value={entity.entityKey}>
                        {entity.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-indigo-700 mb-1">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 text-sm border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                  placeholder="e.g., Office Rent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-indigo-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-3 text-sm border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 resize-none"
                  placeholder="Optional description"
                />
              </div>

              {/* Type and Color */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-indigo-700 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as any })
                    }
                    className="w-full px-4 py-3 text-sm border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="both">Both</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-indigo-700 mb-1">
                    Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className="w-10 h-10 border-2 border-indigo-200 rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className="flex-1 px-4 py-3 text-sm border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                      placeholder="#4361ee"
                    />
                  </div>
                </div>
              </div>

              {/* Active Status */}
              <label className="flex items-center space-x-3 p-4 bg-indigo-50 rounded-xl border-2 border-indigo-200 cursor-pointer hover:bg-indigo-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-5 w-5 text-indigo-600 border-2 border-indigo-300 rounded-lg focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-indigo-700">
                  Active (visible to users)
                </span>
              </label>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t-2 border-indigo-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCategory(null);
                    resetForm();
                  }}
                  className="px-5 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 font-medium flex items-center active:scale-95"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {editingCategory ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
