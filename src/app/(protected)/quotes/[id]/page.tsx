'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import QuoteHeader from './components/QuoteHeader';
import StatsGrid from './components/StatsGrid';
import QuickActions from './components/QuickActions';
import CostSummary from './components/CostSummary';
import SupportCard from './components/SupportCard';
import DeleteConfirmation from './components/DeleteConfirmation';
import LoadingState from './components/LoadingState';
import NotFoundState from './components/NotFoundState';
import { QuoteData } from './types';
import { getStatusConfig } from './utils/statusConfig';
import { formatCurrency, formatDateTime } from './utils/formatters';
import toast from 'react-hot-toast';

export default function QuoteDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const quoteId = params.id as string;

  useEffect(() => {
    loadQuoteData();
  }, [quoteId]);

  const loadQuoteData = async () => {
    const supabase = createClient();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please login to view quote details");
        router.push('/login');
        return;
      }
      
      // Load quote data
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .eq('user_id', user.id)
        .single();
      
      if (quoteError || !quote) {
        toast.error("Quote not found or access denied");
        router.push('/dashboard');
        return;
      }
      
      // Ensure payment_status has valid value
      const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'] as const;
      const paymentStatus = (validPaymentStatuses.includes(quote.payment_status as any) 
        ? quote.payment_status 
        : 'pending') as 'pending' | 'paid' | 'failed' | 'refunded';
      
      // Load policy data if exists
      const { data: policy, error: policyError } = await supabase
        .from('policies')
        .select('id, policy_number, status, premium_amount, coverage_start, coverage_end')
        .eq('quote_id', quoteId)
        .maybeSingle();
      
      // Load payment data if exists
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('id, transaction_id, payment_status, amount, completed_at')
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      // Combine all data
      const combinedData: QuoteData = {
        ...quote,
        payment_status: paymentStatus, // Use validated status
        policy_id: policy?.id || null,
        policy_number: policy?.policy_number || null,
        policy_status: policy?.status || null,
        payment_id: payment?.id || null,
        transaction_id: payment?.transaction_id || null,
        premium_amount: policy?.premium_amount || quote.calculated_premium,
        coverage_start: policy?.coverage_start || quote.start_date,
        coverage_end: policy?.coverage_end || quote.end_date,
        payment_amount: payment?.amount,
        payment_completed_at: payment?.completed_at
      };
      
      setQuoteData(combinedData);
      
    } catch (error) {
      console.error('Error loading quote data:', error);
      toast.error("Failed to load quote details");
    } finally {
      setLoading(false);
    }
  };


  const handleViewPolicy = () => {
    if (!quoteData) return;
    
    if (!quoteData.policy_id) {
      toast.error('Policy not yet created. Please complete payment first.');
      return;
    }
    
    toast.loading('Loading policy...');
    
    setTimeout(() => {
      toast.dismiss();
      router.push(`/shipments/${quoteData.policy_id}`);
    }, 1000);
  };

  const handleViewReceipt = () => {
    if (!quoteData) return;
    
    if (quoteData.payment_status !== 'paid') {
      toast.error('No payment receipt available');
      return;
    }
    
    toast.loading('Loading receipt...');
    
    setTimeout(() => {
      toast.dismiss();
      
      const receiptContent = `
        CARGO GUARD INSURANCE
        PAYMENT RECEIPT
        
        Receipt Number: RCP-${quoteData.transaction_id || Date.now()}
        Date: ${quoteData.payment_completed_at ? formatDateTime(quoteData.payment_completed_at) : new Date().toLocaleDateString()}
        
        DETAILS:
        • Quote Number: ${quoteData.quote_number}
        • Policy Number: ${quoteData.policy_number || 'N/A'}
        • Amount Paid: ${formatCurrency(quoteData.payment_amount || (quoteData.calculated_premium || 0) + 99)}
        • Payment Method: Credit Card
        • Status: ${quoteData.payment_status.toUpperCase()}
        
        ITEMS:
        • Insurance Premium: ${formatCurrency(quoteData.calculated_premium || 0)}
        • Service Fee: $99
        • Taxes: ${formatCurrency(Math.round((quoteData.calculated_premium || 0) * 0.08))}
        • Total: ${formatCurrency((quoteData.calculated_premium || 0) + 99 + Math.round((quoteData.calculated_premium || 0) * 0.08))}
        
        Thank you for your business!
        This is a computer-generated receipt.
      `;
      
      const receiptWindow = window.open();
      if (receiptWindow) {
        receiptWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Receipt - ${quoteData.quote_number}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
              h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
              .receipt { border: 1px solid #ddd; padding: 20px; margin-top: 20px; }
              .item { margin: 10px 0; }
              .total { font-weight: bold; font-size: 1.2em; margin-top: 20px; }
            </style>
          </head>
          <body>
            <h1>Payment Receipt</h1>
            <div class="receipt">
              <pre>${receiptContent}</pre>
            </div>
            <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #1e40af; color: white; border: none; cursor: pointer;">
              Print Receipt
            </button>
          </body>
          </html>
        `);
        receiptWindow.document.close();
      }
      
      toast.success('Receipt opened in new window');
    }, 1000);
  };

  const handleMakePayment = () => {
    if (!quoteData) return;
    
    if (quoteData.status !== 'approved') {
      toast.error('Quote must be approved before payment');
      return;
    }
    
    if (quoteData.payment_status === 'paid') {
      toast.error('Payment already completed');
      return;
    }
    
    router.push(`/quotes/${quoteData.id}/payment`);
  };

  const handleDeleteQuote = async () => {
    if (!quoteData) return;
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', quoteData.id);
      
      if (error) {
        throw error;
      }
      
      toast.success('Quote deleted successfully');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting quote:', error);
      toast.error('Failed to delete quote');
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleEditQuote = () => {
    if (!quoteData) return;
    
    if (quoteData.payment_status === 'paid') {
      toast.error('Cannot edit paid quotes');
      return;
    }
    
    router.push(`/quotes/edit/${quoteData.id}`);
  };

  const handleResubmit = () => {
    if (!quoteData) return;
    
    if (quoteData.payment_status === 'paid') {
      toast.error('Cannot resubmit paid quotes');
      return;
    }
    
    toast.success('Redirecting to quote editor...');
    router.push(`/quotes/edit/${quoteData.id}`);
  };

  const refreshData = () => {
    setLoading(true);
    loadQuoteData();
    toast.success('Refreshing quote data...');
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!quoteData) {
    return <NotFoundState router={router} />;
  }

  const statusConfig = getStatusConfig(quoteData.status, quoteData.payment_status);

  return (
    <div className="min-h-screen bg-[#F3F3F6]">
      <DashboardHeader userEmail="client@example.com" />
      
      {showDeleteConfirm && (
        <DeleteConfirmation
          onCancel={() => setShowDeleteConfirm(false)}
          onDelete={handleDeleteQuote}
        />
      )}
      
      <div className="relative max-w-[100%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <QuoteHeader
          quoteData={quoteData}
          statusConfig={statusConfig}
          onBack={() => router.back()}
          onEdit={handleEditQuote}
          onDelete={() => setShowDeleteConfirm(true)}
          onRefresh={refreshData}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <StatsGrid quoteData={quoteData} statusConfig={statusConfig} />
            
            {/* Overview Section - No Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {quoteData.payment_status === 'paid' ? (
                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-800">Payment Completed</h3>
                      <p className="text-sm text-green-600">
                        Your policy is now active and coverage has begun.
                      </p>
                    </div>
                  </div>
                </div>
              ) : quoteData.payment_status === 'pending' && quoteData.status === 'approved' ? (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-800">Ready for Payment</h3>
                      <p className="text-sm text-blue-600">
                        Your quote is approved. Complete payment to activate your coverage.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Shipment Details</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Cargo Type</p>
                      <p className="font-medium text-gray-900">{quoteData.cargo_type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Transportation</p>
                      <p className="font-medium text-gray-900">{quoteData.transportation_mode}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Coverage Type</p>
                      <p className="font-medium text-gray-900">{quoteData.selected_coverage || 'Standard'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Coverage Timeline</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Start Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(quoteData.start_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">End Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(quoteData.end_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Route Information</h3>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Origin</p>
                    <p className="font-medium text-gray-900">{quoteData.origin?.city || 'Unknown'}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">Destination</p>
                    <p className="font-medium text-gray-900">{quoteData.destination?.city || 'Unknown'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <QuickActions
              statusConfig={statusConfig}
              onMakePayment={handleMakePayment}
              onViewPolicy={handleViewPolicy}
              onViewReceipt={handleViewReceipt}
              onResubmit={handleResubmit}
              onCheckStatus={refreshData}
              quoteData={quoteData}
            />
            
            {quoteData.status === 'approved' && (
              <CostSummary
                calculatedPremium={quoteData.calculated_premium || 0}
                paymentStatus={quoteData.payment_status}
              />
            )}
            
            <SupportCard />
          </div>
        </div>
      </div>
    </div>
  );
}