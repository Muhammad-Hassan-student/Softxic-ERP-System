import { Suspense } from 'react';
import FieldsContent from './fields-content';

export const metadata = {
  title: 'Dynamic Fields',
  description: 'Configure custom fields',
};

// ✅ FIX: Add loading fallback
export default function FieldsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading fields...</p>
        </div>
      </div>
    }>
      <FieldsContent />
    </Suspense>
  );
}