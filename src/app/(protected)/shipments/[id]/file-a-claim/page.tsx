'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import { 
  AlertCircle, Upload, FileText, CheckCircle, XCircle, 
  Clock, Calendar, MapPin, DollarSign, Package,
  Shield, Truck, ArrowLeft, ChevronRight, AlertTriangle,
  Camera, FileCheck, Loader2, CheckCircle2, FileWarning,
  Users, Phone, MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PolicyData {
  id: string;
  policy_number: string;
  status: string;
  coverage_amount: number;
  deductible: number;
  cargo_type: string;
  transportation_mode: string;
  origin: any;
  destination: any;
  coverage_start: string;
  coverage_end: string;
  premium_amount: number;
  payment_status: string;
  created_at: string;
}

interface ShipmentDocument {
  id: string;
  policy_id: string;
  commercial_invoice_status: 'pending' | 'uploaded' | 'approved' | 'rejected';
  commercial_invoice_url: string | null;
  packing_list_status: 'pending' | 'uploaded' | 'approved' | 'rejected';
  packing_list_url: string | null;
  bill_of_lading_status: 'pending' | 'uploaded' | 'approved' | 'rejected';
  bill_of_lading_url: string | null;
}

interface EligibilityCheck {
  policyActive: boolean;
  paymentCompleted: boolean;
  coverageValid: boolean;
  documentsComplete: boolean;
  canFileClaim: boolean;
  missingDocs: string[];
}

export default function FileAClaimPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [policy, setPolicy] = useState<PolicyData | null>(null);
  const [documents, setDocuments] = useState<ShipmentDocument | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityCheck>({
    policyActive: false,
    paymentCompleted: false,
    coverageValid: false,
    documentsComplete: false,
    canFileClaim: false,
    missingDocs: []
  });

  // Claim form state
  const [claimForm, setClaimForm] = useState({
    claim_type: 'loss',
    incident_date: '',
    incident_location_country: '',
    incident_location_city: '',
    description: '',
    claimed_amount: '',
  });

  // Supporting documents state
  const [supportingDocs, setSupportingDocs] = useState<File[]>([]);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPolicyData();
  }, []);

  useEffect(() => {
    if (policy && documents) {
      checkEligibility();
    }
  }, [policy, documents]);

  const loadPolicyData = async () => {
    const supabase = createClient();
    
    try {
      // Get user's active policy (simplified - assuming user has one active policy)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to file a claim');
        router.push('/auth/signin');
        return;
      }

      // Get latest active policy for the user
      const { data: policies, error: policyError } = await supabase
        .from('policies')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (policyError || !policies) {
        toast.error('No active policy found');
        router.push('/dashboard');
        return;
      }

      setPolicy(policies);

      // Get documents for the policy
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('policy_id', policies.id)
        .single();

      if (!docError) {
        setDocuments(docData);
      }

    } catch (error) {
      console.error('Error loading policy:', error);
      toast.error('Failed to load policy information');
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = () => {
    if (!policy || !documents) return;

    const now = new Date();
    const startDate = new Date(policy.coverage_start);
    const endDate = new Date(policy.coverage_end);

    const checks = {
      policyActive: policy.status === 'active',
      paymentCompleted: policy.payment_status === 'paid' || policy.payment_status === 'completed',
      coverageValid: now >= startDate && now <= endDate,
    };

    // Check documents
    const requiredDocs = [
      { type: 'Commercial Invoice', status: documents.commercial_invoice_status },
      { type: 'Packing List', status: documents.packing_list_status },
      { type: 'Bill of Lading', status: documents.bill_of_lading_status }
    ];

    const missingDocs = requiredDocs
      .filter(doc => doc.status !== 'approved')
      .map(doc => doc.type);

    const documentsComplete = missingDocs.length === 0;

    const canFileClaim = checks.policyActive && 
                         checks.paymentCompleted && 
                         checks.coverageValid && 
                         documentsComplete;

    setEligibility({
      ...checks,
      documentsComplete,
      canFileClaim,
      missingDocs
    });
  };

  const handleFileUpload = (files: FileList) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const newFiles = Array.from(files).filter(file => {
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name}: Please upload PDF, JPEG, or PNG only`);
        return false;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name}: File size must be less than 5MB`);
        return false;
      }
      return true;
    });

    setSupportingDocs(prev => [...prev, ...newFiles]);
  };

  const removeSupportingDoc = (index: number) => {
    setSupportingDocs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitClaim = async () => {
    if (!policy || !eligibility.canFileClaim) return;

    // Validate form
    if (!claimForm.incident_date) {
      toast.error('Please select incident date');
      return;
    }

    if (!claimForm.incident_location_country || !claimForm.incident_location_city) {
      toast.error('Please enter incident location');
      return;
    }

    if (!claimForm.description.trim()) {
      toast.error('Please describe the incident');
      return;
    }

    const claimedAmount = parseFloat(claimForm.claimed_amount);
    if (!claimedAmount || claimedAmount <= 0) {
      toast.error('Please enter a valid claimed amount');
      return;
    }

    if (claimedAmount > policy.coverage_amount) {
      toast.error(`Claimed amount cannot exceed coverage amount: $${policy.coverage_amount.toLocaleString()}`);
      return;
    }

    const incidentDate = new Date(claimForm.incident_date);
    const coverageStart = new Date(policy.coverage_start);
    const coverageEnd = new Date(policy.coverage_end);

    if (incidentDate < coverageStart || incidentDate > coverageEnd) {
      toast.error('Incident date must be within coverage period');
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // Upload supporting documents if any
      let supportingDocUrls: string[] = [];
      if (supportingDocs.length > 0) {
        setUploadingDocs(true);
        const uploadPromises = supportingDocs.map(async (file, index) => {
          const timestamp = Date.now();
          const fileExt = file.name.split('.').pop();
          const fileName = `${timestamp}_${index}_claim_evidence.${fileExt}`;
          const filePath = `claim-documents/${policy.policy_number}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('shipment-documents')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('shipment-documents')
            .getPublicUrl(filePath);

          return publicUrl;
        });

        supportingDocUrls = await Promise.all(uploadPromises);
        setUploadingDocs(false);
      }

      // Create claim record
      const { data: claim, error: claimError } = await supabase
        .from('claims')
        .insert({
          policy_id: policy.id,
          user_id: user?.id,
          claim_type: claimForm.claim_type,
          incident_date: claimForm.incident_date,
          incident_location_country: claimForm.incident_location_country,
          incident_location_city: claimForm.incident_location_city,
          description: claimForm.description,
          claimed_amount: claimedAmount,
          status: 'submitted',
          supporting_documents: supportingDocUrls
        })
        .select()
        .single();

      if (claimError) throw claimError;

      // Send notification
      await supabase
        .from('notifications')
        .insert({
          user_id: user?.id,
          type: 'claim_submitted',
          title: 'Claim Submitted',
          message: `Your claim #${claim.id} has been received and is under review.`,
          metadata: { claim_id: claim.id }
        });

      toast.success('Claim submitted successfully!');
      
      // Redirect to claims page
      setTimeout(() => {
        router.push('/claims');
      }, 2000);

    } catch (error: any) {
      console.error('Error submitting claim:', error);
      toast.error(error.message || 'Failed to submit claim');
    } finally {
      setSubmitting(false);
      setUploadingDocs(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <DashboardHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Loading policy information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <DashboardHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Policy</h2>
            <p className="text-gray-600 mb-6">You need an active policy to file a claim.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                >
                  Dashboard
                </button>
                <ChevronRight className="w-3 h-3" />
                <span className="text-gray-900 font-medium">File a Claim</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">File a Claim</h1>
              <p className="text-gray-600 mt-2">
                Submit a claim for your insured shipment
              </p>
            </div>
            
            <div className="hidden lg:flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <p className="text-sm font-medium text-emerald-700">Policy Active</p>
                </div>
                <p className="text-xs text-gray-500">#{policy.policy_number}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Policy Summary */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Policy Number</span>
                </div>
                <p className="font-bold text-gray-900 text-lg">{policy.policy_number}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Coverage Period</span>
                </div>
                <p className="font-medium text-gray-900">
                  {formatDate(policy.coverage_start)} – {formatDate(policy.coverage_end)}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Coverage Amount</span>
                </div>
                <p className="font-medium text-gray-900">{formatCurrency(policy.coverage_amount)}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500">
                  <Package className="w-4 h-4" />
                  <span className="text-sm">Cargo Type</span>
                </div>
                <p className="font-medium text-gray-900">{policy.cargo_type}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Eligibility Check */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Claim Eligibility Check</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    eligibility.policyActive ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {eligibility.policyActive ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Policy is active</p>
                    <p className="text-sm text-gray-500">
                      {eligibility.policyActive 
                        ? 'Your policy is currently active' 
                        : 'Your policy is not active'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    eligibility.paymentCompleted ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {eligibility.paymentCompleted ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Payment completed</p>
                    <p className="text-sm text-gray-500">
                      {eligibility.paymentCompleted 
                        ? 'Premium payment completed' 
                        : 'Premium payment pending'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    eligibility.coverageValid ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {eligibility.coverageValid ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Coverage period valid</p>
                    <p className="text-sm text-gray-500">
                      {eligibility.coverageValid 
                        ? `Current date is within coverage period` 
                        : 'Current date is outside coverage period'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    eligibility.documentsComplete ? 'bg-green-100' : 'bg-amber-100'
                  }`}>
                    {eligibility.documentsComplete ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Required documents approved</p>
                    <p className="text-sm text-gray-500">
                      {eligibility.documentsComplete 
                        ? 'All required documents are approved' 
                        : `${eligibility.missingDocs.length} document${eligibility.missingDocs.length > 1 ? 's' : ''} pending approval`}
                    </p>
                  </div>
                </div>
              </div>

              {!eligibility.canFileClaim && (
                <div className="p-4 bg-gradient-to-r from-red-50 to-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-700 mb-1">Action Required</p>
                      {eligibility.missingDocs.length > 0 ? (
                        <div>
                          <p className="text-sm text-amber-600 mb-2">
                            Upload and get approval for these documents:
                          </p>
                          <ul className="text-sm text-amber-600 space-y-1">
                            {eligibility.missingDocs.map((doc, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <FileWarning className="w-3 h-3" />
                                {doc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-sm text-amber-600">
                          Complete all eligibility requirements to file a claim
                        </p>
                      )}
                      <button
                        onClick={() => router.push(`/shipments/${policy.id}`)}
                        className="mt-3 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
                      >
                        <Upload className="w-3 h-3" />
                        {eligibility.missingDocs.length > 0 ? 'Upload Documents' : 'Check Policy Status'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Claim Form (only shown if eligible) */}
            {eligibility.canFileClaim && (
              <>
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Claim Details</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Claim Type
                      </label>
                      <select
                        value={claimForm.claim_type}
                        onChange={(e) => setClaimForm(prev => ({ ...prev, claim_type: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      >
                        <option value="loss">Loss</option>
                        <option value="damage">Damage</option>
                        <option value="theft">Theft</option>
                        <option value="delay">Delay</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Incident Date
                        </label>
                        <input
                          type="date"
                          value={claimForm.incident_date}
                          onChange={(e) => setClaimForm(prev => ({ ...prev, incident_date: e.target.value }))}
                          min={policy.coverage_start}
                          max={policy.coverage_end}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Must be between {formatDate(policy.coverage_start)} and {formatDate(policy.coverage_end)}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Claimed Amount (USD)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <input
                            type="number"
                            value={claimForm.claimed_amount}
                            onChange={(e) => setClaimForm(prev => ({ ...prev, claimed_amount: e.target.value }))}
                            min="0"
                            max={policy.coverage_amount}
                            step="0.01"
                            className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="0.00"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Max: {formatCurrency(policy.coverage_amount)} coverage
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          value={claimForm.incident_location_country}
                          onChange={(e) => setClaimForm(prev => ({ ...prev, incident_location_country: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="Enter country"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={claimForm.incident_location_city}
                          onChange={(e) => setClaimForm(prev => ({ ...prev, incident_location_city: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="Enter city"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description of Incident
                      </label>
                      <textarea
                        value={claimForm.description}
                        onChange={(e) => setClaimForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                        placeholder="Describe what happened in detail..."
                      />
                    </div>
                  </div>
                </div>

                {/* Supporting Documents */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Supporting Evidence</h3>
                  <p className="text-gray-600 mb-4">
                    Upload photos or documents that support your claim (optional but recommended)
                  </p>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                      <Camera className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-gray-700 font-medium mb-2">Upload evidence files</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Photos of damage, police reports, carrier reports, etc.
                      <br />
                      PDF, JPEG, or PNG (max 5MB each)
                    </p>
                    <label className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                      />
                      Choose Files
                    </label>
                  </div>

                  {supportingDocs.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 mb-3">Selected Files</h4>
                      <div className="space-y-2">
                        {supportingDocs.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-gray-600" />
                              <div>
                                <p className="font-medium text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeSupportingDoc(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="space-y-6">
            {/* Claim Status Info */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-4">Claim Process</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Submit Claim</p>
                    <p className="text-xs text-gray-500">Complete and submit the claim form</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-600">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Under Review</p>
                    <p className="text-xs text-gray-500">Claim adjuster reviews your submission</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-600">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Decision</p>
                    <p className="text-xs text-gray-500">Claim approved or rejected</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-600">4</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment</p>
                    <p className="text-xs text-gray-500">Funds transferred if approved</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Claim Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Important Notes</h4>
                  <p className="text-sm text-gray-600">Before submitting your claim</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600 mb-6">
                <p>• Claims are reviewed within 5-7 business days</p>
                <p>• You'll be notified of any updates</p>
                <p>• Additional information may be requested</p>
                <p>• Keep all original documents</p>
              </div>

              {eligibility.canFileClaim ? (
                <button
                  onClick={handleSubmitClaim}
                  disabled={submitting || uploadingDocs}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {(submitting || uploadingDocs) ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {uploadingDocs ? 'Uploading Documents...' : 'Submitting Claim...'}
                    </>
                  ) : (
                    'Submit Claim'
                  )}
                </button>
              ) : (
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-semibold text-amber-700 mb-1">Not Eligible</p>
                      <p className="text-sm text-amber-600">
                        Complete all requirements to file a claim
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Help Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Need Help?</h4>
                  <p className="text-sm text-gray-600">Our team is here to assist</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Phone className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Claims Hotline</p>
                    <p className="text-xs text-gray-600">1-800-CLAIM-HELP</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <MessageCircle className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Live Chat</p>
                    <p className="text-xs text-gray-600">Available 24/7</p>
                  </div>
                </div>
              </div>
              
              <button className="w-full mt-4 py-2.5 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-200 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}