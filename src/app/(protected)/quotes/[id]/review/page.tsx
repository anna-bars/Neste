'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, CheckCircle, Users, Mail, Phone, RefreshCw } from 'lucide-react';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import QuoteStatusUpdater from '@/app/components/quotes/QuoteStatusUpdater';
import { useUser } from '@/app/context/UserContext';
import { quotes } from '@/lib/supabase/quotes';
import { createClient } from '@/lib/supabase/client';

export default function QuoteReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  
  const quoteId = params.id as string;
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [manualCheck, setManualCheck] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (!quoteId || !user) return;

    const loadQuote = async () => {
      try {
        const quoteData = await quotes.getById(quoteId);
        setQuote(quoteData);
        
        // Subscribe to real-time updates
        const subscription = supabase
          .channel(`quote-${quoteId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'quotes',
              filter: `id=eq.${quoteId}`
            },
            (payload) => {
              console.log('Real-time update:', payload.new);
              setQuote(payload.new);
              
              // Auto-redirect if status changed
              const newStatus = payload.new.status;
              if (newStatus !== 'under_review' && newStatus !== 'needs_info') {
                setTimeout(() => {
                  if (newStatus === 'approved') {
                    router.push(`/quotes/new/insurance?quote_id=${quoteId}&approved=true`);
                  } else if (newStatus === 'rejected') {
                    router.push(`/quotes/${quoteId}/rejected`);
                  }
                }, 2000);
              }
            }
          )
          .subscribe();

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error loading quote:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuote();
  }, [quoteId, user, router, supabase]);

  const handleManualStatusCheck = async () => {
    setManualCheck(true);
    try {
      const { data } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .single();
      
      setQuote(data);
    } catch (error) {
      console.error('Manual check failed:', error);
    } finally {
      setManualCheck(false);
    }
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

  // If quote is no longer under review, redirect
  if (quote.status !== 'under_review' && quote.status !== 'needs_info') {
    router.push(`/quotes/${quoteId}`);
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userEmail={user?.email} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Real-time Status Updater */}
        <div className="mb-8">
          <QuoteStatusUpdater 
            quoteId={quoteId}
            initialStatus={quote.status}
            autoRedirect={true}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {quote.status === 'needs_info' ? 'Additional Information Required' : 'Under Review'}
                  </h1>
                  <p className="text-gray-600">
                    Quote #{quote.quote_number} is being reviewed by our team
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleManualStatusCheck}
                disabled={manualCheck}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${manualCheck ? 'animate-spin' : ''}`} />
                {manualCheck ? 'Checking...' : 'Refresh Status'}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* What to Expect */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                What Happens Next
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Expert Review</h3>
                  <p className="text-sm text-gray-600">
                    Our underwriters are reviewing your shipment details against risk criteria
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Quick Decision</h3>
                  <p className="text-sm text-gray-600">
                    Most reviews are completed within 2-4 hours during business hours
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Notification</h3>
                  <p className="text-sm text-gray-600">
                    You'll receive an email when the review is complete
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Review Timeline
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-gray-900">Quote Submitted</h3>
                      <span className="text-sm text-gray-500">
                        {new Date(quote.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Your quote has been received and is in the queue for review.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-gray-900">Underwriter Review</h3>
                      <span className="text-sm text-blue-600 font-medium">In Progress</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Our underwriting team is assessing your shipment details against our risk criteria.
                    </p>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                          style={{ width: '60%' }}
                        />
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        Estimated completion: Within 24 hours
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Need Help?</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Support</p>
                    <p className="text-xs text-gray-600">support@yourcompany.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone Support</p>
                    <p className="text-xs text-gray-600">1-800-INS-CARGO</p>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mt-4">
                Our team is available 24/7 to assist with any questions about your quote review.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}