import { AlertCircle } from 'lucide-react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

interface NotFoundStateProps {
  router: AppRouterInstance;
}

export default function NotFoundState({ router }: NotFoundStateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-[100%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 rounded-3xl border border-gray-200/50 p-8 text-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quote Not Found</h2>
          <p className="text-gray-600 mb-6">The quote you're looking for doesn't exist in our database.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}