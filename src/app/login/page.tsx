import LoginForm from '@/components/auth/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | ERP System',
  description: 'Login to your ERP account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="py-6 px-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="font-bold text-white text-xl">ERP</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ERP System</h1>
                <p className="text-sm text-gray-600">Enterprise Resource Planning</p>
              </div>
            </div>
            <div className="hidden md:block">
              <span className="text-sm text-gray-500">v2.0.0</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-8 border-t">
        <div className="container mx-auto text-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} ERP System. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Secure login powered by JWT authentication
          </p>
        </div>
      </footer>
    </div>
  );
}