// src/app/user-system/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Building2, Home, Package, Briefcase, 
  LayoutDashboard, ArrowRight, DollarSign, CreditCard,
  Loader2, AlertCircle
} from 'lucide-react';

interface Entity {
  _id: string;
  entityKey: string;
  name: string;
  description?: string;
  module: 're' | 'expense';
}

export default function UserSystemPage() {
  const router = useRouter();
  const [module, setModule] = useState<'re' | 'expense' | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get module from cookie set during login
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const moduleCookie = getCookie('module') as 're' | 'expense' | null;
    const token = getCookie('token');
    
    if (!moduleCookie || !token) {
      router.push('/module-login');
      return;
    }

    setModule(moduleCookie);
    fetchEntities(moduleCookie, token);
  }, [router]);

  const fetchEntities = async (module: string, token: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/financial-tracker/api/financial-tracker/entities?module=${module}&active=true`, {
        headers: {
          'Authorization': token
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/module-login');
          return;
        }
        throw new Error('Failed to fetch entities');
      }
      
      const data = await response.json();
      setEntities(data.entities || []);
    } catch (error) {
      console.error('Failed to fetch entities:', error);
      setError('Could not load entities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getEntityIcon = (entityKey: string) => {
    switch (entityKey) {
      case 'dealer': return Users;
      case 'fhh-client': return Users;
      case 'cp-client': return Users;
      case 'builder': return Briefcase;
      case 'project': return Package;
      case 'office': return Home;
      default: return Building2;
    }
  };

  const getEntityColor = (entityKey: string) => {
    switch (entityKey) {
      case 'dealer': return 'blue';
      case 'fhh-client': return 'green';
      case 'cp-client': return 'purple';
      case 'builder': return 'orange';
      case 'project': return 'pink';
      case 'office': return 'indigo';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Entities</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto pt-12 px-4 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-md mb-4">
            {module === 're' ? (
              <DollarSign className="h-8 w-8 text-blue-600" />
            ) : (
              <CreditCard className="h-8 w-8 text-green-600" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {module === 're' ? 'RE Module' : 'Expense Module'}
          </h1>
          <p className="text-gray-600 mt-2">Select an entity to manage records</p>
        </div>

        {/* Entities Grid */}
        {entities.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <LayoutDashboard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Entities Available</h3>
            <p className="text-gray-500">You don't have access to any entities in this module.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entities.map((entity) => {
              const Icon = getEntityIcon(entity.entityKey);
              const color = getEntityColor(entity.entityKey);

              return (
                <button
                  key={entity._id}
                  onClick={() => router.push(`/user-system/${module}/${entity.entityKey}`)}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all group text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg bg-${color}-100 text-${color}-600`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">{entity.name}</h2>
                        <p className="text-sm text-gray-500 mt-1">
                          {entity.description || `Manage ${entity.name.toLowerCase()}`}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Select an entity to start managing records</p>
        </div>
      </div>
    </div>
  );
}