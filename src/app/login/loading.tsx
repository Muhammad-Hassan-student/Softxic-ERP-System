export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="animate-pulse space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="h-12 w-12 bg-gray-300 rounded-lg mx-auto mb-4"></div>
              <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            
            {/* Tabs */}
            <div className="flex space-x-4">
              <div className="h-10 bg-gray-200 rounded flex-1"></div>
              <div className="h-10 bg-gray-200 rounded flex-1"></div>
            </div>
            
            {/* Form Fields */}
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-100 rounded w-full"></div>
                </div>
              ))}
            </div>
            
            {/* Button */}
            <div className="h-10 bg-gray-300 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}