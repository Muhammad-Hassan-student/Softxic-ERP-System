// src/app/financial-tracker/components/shared/CategorySelector.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, FolderTree, Loader2 } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  color: string;
  icon?: string;
}

interface CategorySelectorProps {
  module: 're' | 'expense';
  entity: string;
  value?: string;
  onChange: (categoryId: string, categoryName: string) => void;
  type?: 'income' | 'expense' | 'both';
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  module,
  entity,
  value,
  onChange,
  type = 'both',
  required = false,
  placeholder = 'Select category...',
  disabled = false
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on mount and when dependencies change
  useEffect(() => {
    fetchCategories();
  }, [module, entity, type]);

  // Get token from cookie
  const getToken = (): string => {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(/token=([^;]+)/);
    return match ? match[1] : '';
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.append('module', module);
      params.append('entity', entity);
      params.append('active', 'true');
      
      if (type !== 'both') {
        params.append('type', type);
      }

      const token = getToken();
      const response = await fetch(`/api/financial-tracker/categories?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Could not load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCategory = categories.find(c => c._id === value);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.category-selector')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative category-selector">
      {/* Selected Category Display / Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className={`
          w-full px-4 py-2.5 text-left border rounded-lg 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
          bg-white flex items-center justify-between
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50'}
          ${error ? 'border-red-300' : 'border-gray-300'}
        `}
      >
        <div className="flex items-center min-w-0">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400 mr-2" />
          ) : selectedCategory ? (
            <>
              <div
                className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                style={{ backgroundColor: selectedCategory.color }}
              />
              <span className="truncate">{selectedCategory.name}</span>
            </>
          ) : (
            <span className="text-gray-500 truncate">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`
          h-4 w-4 ml-2 flex-shrink-0 transition-transform
          ${isOpen ? 'rotate-180' : ''}
          ${disabled ? 'text-gray-300' : 'text-gray-400'}
        `} />
      </button>

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-3 text-center text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500">
              <FolderTree className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No categories found</p>
              <p className="text-xs mt-1">Contact admin to create categories</p>
            </div>
          ) : (
            <div className="py-1">
              {categories.map((category) => (
                <button
                  key={category._id}
                  type="button"
                  onClick={() => {
                    onChange(category._id, category.name);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-4 py-2.5 text-left hover:bg-gray-50 
                    flex items-center transition-colors
                    ${value === category._id ? 'bg-blue-50' : ''}
                  `}
                >
                  <div
                    className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="flex-1 truncate">{category.name}</span>
                  {category.type !== 'both' && (
                    <span className={`
                      ml-2 text-xs px-1.5 py-0.5 rounded-full flex-shrink-0
                      ${category.type === 'income' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                      }
                    `}>
                      {category.type}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Required field indicator */}
      {required && !value && !disabled && (
        <p className="text-xs text-red-500 mt-1">Category is required</p>
      )}
    </div>
  );
};