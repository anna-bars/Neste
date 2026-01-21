export default function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-[100%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading details...</p>
          </div>
        </div>
      </div>
    </div>
  );
}