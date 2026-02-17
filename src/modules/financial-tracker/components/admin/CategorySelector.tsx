'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, FolderTree } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  color: string;
}

interface CategorySelectorProps {
  module: 're' | 'expense';
  entity: string;
  value?: string;
  onChange: (categoryId: string, categoryName: string) => void;
  type?: 'income' | 'expense' | 'both';
  required?: boolean;
  placeholder?: string;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  module,
  entity,
  value,
  onChange,
  type = 'both',
  required = false,
  placeholder = 'Select category...'
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [module, entity, type]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('module', module);
      params.append('entity', entity);
      params.append('active', 'true');
      if (type !== 'both') params.append('type', type);

      const response = await fetch(`/api/financial-tracker/categories?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCategory = categories.find(c => c._id === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white flex items-center justify-between"
      >
        <div className="flex items-center">
          {selectedCategory ? (
            <>
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: selectedCategory.color }}
              />
              <span>{selectedCategory.name}</span>
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-3 text-center text-gray-500">
                Loading...
              </div>
            ) : categories.length === 0 ? (
              <div className="px-4 py-3 text-center text-gray-500">
                No categories found
              </div>
            ) : (
              categories.map((category) => (
                <button
                  key={category._id}
                  type="button"
                  onClick={() => {
                    onChange(category._id, category.name);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                >
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: category.color }}
                  />
                  <span>{category.name}</span>
                  {category.type !== 'both' && (
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                      category.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {category.type}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};