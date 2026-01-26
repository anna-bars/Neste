'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle,
  Download,
  Mail,
  FileText,
  Shield,
  Calendar,
  MapPin,
  Truck,
  DollarSign,
  Sparkles,
  ChevronRight,
  Copy,
  ExternalLink,
  Clock
} from 'lucide-react';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import { useUser } from '@/app/context/UserContext';

export default function SuccessPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  
  const [policyData, setPolicyData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const quoteId = params.quote_id as string;

  // Simulate fetching policy data
  useEffect(() => {
    const draftData = localStorage.getItem('quote_draft');
    
    if (!draftData) {
      // If no draft, generate sample data for demo
      const samplePolicy = {
        policyNumber: `POL-${Date.now().toString().slice(-8)}`,
        quoteId: quoteId || 'DEMO-QUOTE-ID',
        createdAt: new Date().toISOString(),
        premiumAmount: 2450,
        coverageAmount: 50000,
        deductible: 500,
        coveragePlan: 'premium',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cargoType: 'Electronics',
        shipmentValue: 50000,
        transportationMode: 'air',
        origin: 'New York, USA',
        destination: 'London, UK',
        status: 'active'
      };
      setPolicyData(samplePolicy);
    } else {
      const draft = JSON.parse(draftData);
      const policy = {
        policyNumber: `POL-${Date.now().toString().slice(-8)}`,
        quoteId: quoteId || draft.quoteId || 'DEMO-QUOTE-ID',
        createdAt: new Date().toISOString(),
        premiumAmount: draft.finalPremium || 2450,
        coverageAmount: parseFloat(draft.shipmentValue) || 50000,
        deductible: draft.deductible || 500,
        coveragePlan: draft.selectedPlan || 'premium',
        startDate: draft.startDate || new Date().toISOString(),
        endDate: draft.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cargoType: draft.cargoType === 'other' ? draft.otherCargoType : draft.cargoType,
        shipmentValue: parseFloat(draft.shipmentValue) || 50000,
        transportationMode: draft.transportationMode || 'air',
        origin: draft.origin?.display_name || 'New York, USA',
        destination: draft.destination?.display_name || 'London, UK',
        status: 'active'
      };
      setPolicyData(policy);
      // Clear draft after successful payment
      localStorage.removeItem('quote_draft');
    }
  }, [quoteId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPolicy = () => {
    // In a real app, this would download the PDF
    alert('Policy document download started. Check your email for the PDF.');
  };

  if (!policyData) {
    return (
      <div className="min-h-screen bg-[#F3F3F6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading policy details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F3F6] text-gray-900">
      <DashboardHeader userEmail={user?.email}/>
      
      <div className="relative max-w-[88%] mx-auto pt-2 pb-4 py-8">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex p-4 rounded-3xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-2xl mb-6">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your cargo insurance policy is now active. All documents have been sent to your email.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Side - Main Content (80%) */}
          <div className="lg:col-span-8 order-2 lg:order-1">
            {/* Success Card */}
            <div className="relative group mb-6">
              <div className="relative border border-[#d1d1d154] bg-[#FDFEFF] rounded-2xl shadow-sm overflow-hidden">
                <div className="p-8">
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">Policy Active</h2>
                          <p className="text-gray-600 text-sm mt-1">
                            Your cargo is now protected
                          </p>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-700">Coverage Active</span>
                      </div>
                    </div>
                    
                    {/* Policy Number */}
                    <div className="text-right">
                      <div className="text-xs font-mono text-gray-500 mb-1">POLICY NUMBER</div>
                      <div className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                        {policyData.policyNumber}
                      </div>
                    </div>
                  </div>

                  {/* Policy Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Coverage Summary */}
                    <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-white border border-blue-200">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Coverage Summary</h3>
                          <p className="text-sm text-gray-600">Financial protection details</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Coverage Amount</span>
                          <span className="font-bold text-gray-900">
                            ${policyData.coverageAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Premium Paid</span>
                          <span className="font-bold text-gray-900">
                            ${policyData.premiumAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Deductible</span>
                          <span className="font-bold text-gray-900">
                            ${policyData.deductible}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Plan</span>
                          <span className="font-bold text-gray-900 capitalize">
                            {policyData.coveragePlan}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Shipment Details */}
                    <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-white border border-purple-200">
                          <Truck className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Shipment Details</h3>
                          <p className="text-sm text-gray-600">Transportation information</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Cargo Type</span>
                          <span className="font-bold text-gray-900">{policyData.cargoType}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Transport Mode</span>
                          <span className="font-bold text-gray-900 capitalize">
                            {policyData.transportationMode}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">From</span>
                          <span className="font-bold text-gray-900">{policyData.origin}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">To</span>
                          <span className="font-bold text-gray-900">{policyData.destination}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coverage Period */}
                  <div className="mb-8 p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-white border border-amber-200">
                        <Calendar className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Coverage Period</h3>
                        <p className="text-sm text-gray-600">Policy active dates</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-8">
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">Start Date</div>
                        <div className="text-lg font-bold text-gray-900">
                          {new Date(policyData.startDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      
                      <div className="text-gray-300">
                        <ChevronRight className="w-6 h-6" />
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">End Date</div>
                        <div className="text-lg font-bold text-gray-900">
                          {new Date(policyData.endDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-amber-200 text-center">
                      <div className="text-sm text-gray-600">
                        Policy Duration: {Math.ceil((new Date(policyData.endDate).getTime() - new Date(policyData.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={handleDownloadPolicy}
                      className="group p-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-300"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                          <Download className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-gray-900">Download Policy</div>
                          <div className="text-sm text-gray-600">Get PDF document</div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => copyToClipboard(policyData.policyNumber)}
                      className="group p-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-300"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                          <Copy className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-gray-900">
                            {copied ? 'Copied!' : 'Copy Policy #'}
                          </div>
                          <div className="text-sm text-gray-600">For your records</div>
                        </div>
                      </div>
                    </button>

                    <Link
                      href="/dashboard/policies"
                      className="group p-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-300"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors">
                          <ExternalLink className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-gray-900">View Policies</div>
                          <div className="text-sm text-gray-600">Go to dashboard</div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* What's Next Section */}
            <div className="border border-[#d1d1d154] bg-[#FDFEFF] rounded-2xl shadow-sm p-8">
              <h3 className="font-bold text-gray-900 text-xl mb-6">What Happens Next?</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-cyan-200 mb-4">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Email Confirmation</h4>
                  <p className="text-sm text-gray-600">
                    You'll receive policy documents and receipt within 5 minutes
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 mb-4">
                    <FileText className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Document Access</h4>
                  <p className="text-sm text-gray-600">
                    All documents are available in your dashboard 24/7
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200 mb-4">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">24/7 Support</h4>
                  <p className="text-sm text-gray-600">
                    Contact our support team anytime for claims or questions
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Information Panel (20%) */}
          <div className="lg:col-span-4 space-y-2 order-1 lg:order-2">
            {/* Quick Actions */}
            <div className="border border-[#d1d1d154] bg-[#FDFEFF] rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Quick Actions</h3>
              </div>
              
              <div className="space-y-3">
                <button className="w-full p-3 text-left rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">View Certificate</span>
                  </div>
                </button>
                <button className="w-full p-3 text-left rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Resend Email</span>
                  </div>
                </button>
                <Link
                  href="/support"
                  className="block w-full p-3 text-left rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Contact Support</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Policy Details */}
            <div className="border border-[#d1d1d154] bg-[#FDFEFF] rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Policy Details</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">POLICY NUMBER</div>
                  <div className="text-sm font-mono text-gray-900 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200 flex items-center justify-between">
                    <span>{policyData.policyNumber}</span>
                    <button
                      onClick={() => copyToClipboard(policyData.policyNumber)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <span className="font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Issued Date</span>
                    <span className="font-medium text-gray-900">
                      {new Date(policyData.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Quote ID</span>
                    <span className="font-medium text-gray-900">
                      {policyData.quoteId ? policyData.quoteId.substring(0, 8) + '...' : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* What's Covered */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-5">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 text-base">What's Covered</h3>
              </div>
              
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Physical damage during transit</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Theft and pilferage protection</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>24/7 claims support</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Worldwide coverage</span>
                </div>
              </div>
            </div>

            {/* Need Help? */}
            <div className="border border-[#d1d1d154] bg-[#FDFEFF] rounded-2xl shadow-sm p-6">
              <div className="text-center">
                <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-4 shadow-lg">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-2">Questions?</h3>
                <p className="text-sm text-gray-600 mb-5">
                  Our support team is ready to help
                </p>
                <Link
                  href="/support"
                  className="block w-full py-3 text-sm font-medium text-blue-600 hover:text-blue-700 bg-white hover:bg-gray-50 border border-blue-200 hover:border-blue-300 rounded-xl transition-all duration-300 shadow-sm hover:shadow"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Go to Dashboard
            <ChevronRight className="w-5 h-5" />
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            You can always access your policies from the dashboard
          </p>
        </div>
      </div>
    </div>
  );
}