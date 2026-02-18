
import { Metadata } from 'next';
import { requireAuth } from '@/lib/auth/server-auth';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'User profile',
};

export default async function ProfilePage() {
  const user = await requireAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{user.fullName || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium capitalize">{user.role}</p>
                </div>
                {user.email && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="font-medium text-sm">{user.userId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-gray-500">
              This page is accessible to all authenticated users regardless of role.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}