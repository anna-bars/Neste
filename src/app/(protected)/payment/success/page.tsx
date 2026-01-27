"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import { CheckCircle, Shield, Download, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [policy, setPolicy] = useState<any>(null);
  const sessionId = searchParams.get('session_id');
  const policyId = searchParams.get('policyId');
  const quoteId = searchParams.get('quoteId');

  useEffect(() => {
    if (!sessionId || !policyId) {
      router.push('/dashboard');
      return;
    }

    verifyPayment();
  }, [sessionId, policyId]);

  const verifyPayment = async () => {
    const supabase = createClient();
    
    try {
      // Update policy status
      const { data: policy, error } = await supabase
        .from('policies')
        .update({
          payment_status: 'paid',
          status: 'active',
          paid_at: new Date().toISOString(),
          activated_at: new Date().toISOString(),
        })
        .eq('id', policyId)
        .select()
        .single();

      if (error) throw error;

      // Update quote payment status
      if (quoteId) {
        await supabase
          .from('quote_requests')
          .update({
            payment_status: 'paid',
          })
          .eq('id', quoteId);
      }

      setPolicy(policy);
      
    } catch (error) {
      console.error('Error verifying payment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F3F6]">
        <DashboardHeader userEmail="client@example.com" />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Verifying your payment...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F3F6]">
      <DashboardHeader userEmail="client@example.com" />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Successful!</h1>
          <p className="text-gray-600 mt-2">
            Your cargo insurance policy is now active
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Policy Activated</h2>
              <p className="text-sm text-emerald-600">
                Your coverage is now in effect
              </p>
            </div>
            {policy && (
              <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200">
                <span className="font-semibold text-sm">{policy.policy_number}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2">What's Next</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                  <span>Policy documents available for download</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                  <span>Coverage starts immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                  <span>Email confirmation sent</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-3">
                Contact our support team for any questions about your policy.
              </p>
              <button className="px-4 py-2 bg-white border border-blue-300 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-all duration-300">
                Contact Support
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href={`/policies/${policyId}`}
            className="block bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">View Policy</h3>
                <p className="text-sm text-gray-600">Access your policy details</p>
              </div>
            </div>
            <div className="flex items-center text-blue-600">
              <span className="font-medium">Go to Policy</span>
              <ExternalLink className="w-4 h-4 ml-2" />
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="block bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-xl">
                <Download className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Dashboard</h3>
                <p className="text-sm text-gray-600">Back to your account</p>
              </div>
            </div>
            <div className="flex items-center text-emerald-600">
              <span className="font-medium">Go to Dashboard</span>
              <ExternalLink className="w-4 h-4 ml-2" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}