'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { XCircle, AlertCircle, RefreshCw, FileText, Home } from 'lucide-react';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import { useUser } from '@/app/context/UserContext';
import { quotes } from '@/lib/supabase/quotes';

export default function RejectedQuotePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  
  const quoteId = params.id as string;
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quoteId || !user) return;

    const loadQuote = async () => {
      try {
        const quoteData = await quotes.getById(quoteId);
        setQuote(quoteData);
      } catch (error) {
        console.error('Error loading quote:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuote();
  }, [quoteId, user]);

  const handleCreateNew = () => {
    router.push('/quotes/new/shipping');
  };

  const handleViewDetails = () => {
    router.push(`/quotes/${quoteId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader userEmail={user?.email} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader userEmail={user?.email} />
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900">Quote not found</h2>
          <button
            onClick={() => router.push('/quotes')}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Quotes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userEmail={user?.email} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Quote Rejected
            </h1>
            <p className="text-gray-600">
              Quote #{quote.quote_number} has been rejected
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-amber-500" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Rejection Details
                </h2>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Reason for Rejection</h3>
                    <p className="text-gray-700">
                      {quote.rejection_reason || 'Your quote did not meet our current underwriting criteria.'}
                    </p>
                  </div>
                  
                  {quote.risk_score && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Risk Assessment</h3>
                      <p className="text-gray-700">
                        Risk score: <span className="font-bold">{quote.risk_score}/10</span>
                        <span className="text-sm text-gray-500 ml-2">(higher indicates greater risk)</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quote Summary */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quote Summary
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cargo Type</span>
                    <span className="font-medium">{quote.cargo_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipment Value</span>
                    <span className="font-medium">
                      ${quote.shipment_value?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Route</span>
                    <span className="font-medium">
                      {quote.origin?.city || quote.origin?.name} → {quote.destination?.city || quote.destination?.name}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transport Mode</span>
                    <span className="font-medium">{quote.transportation_mode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coverage Period</span>
                    <span className="font-medium">
                      {new Date(quote.start_date).toLocaleDateString()} - {new Date(quote.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Submitted</span>
                    <span className="font-medium">
                      {new Date(quote.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Next Steps
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900">Contact Support</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      If you believe this was a mistake or want to discuss alternative options, 
                      please contact our support team.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <RefreshCw className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900">Modify Your Quote</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Adjust your shipment details and create a new quote that meets our requirements.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/quotes')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Back to Quotes
              </button>
              
              <button
                onClick={handleViewDetails}
                className="flex-1 px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
              >
                View Quote Details
              </button>
              
              <button
                onClick={handleCreateNew}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
              >
                Create New Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}