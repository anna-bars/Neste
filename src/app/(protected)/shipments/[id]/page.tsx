'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import { 
  FileText, Download, Upload, CheckCircle, XCircle, Clock, 
  Shield, Calendar, MapPin, Package, DollarSign, Truck,
  AlertCircle, Eye, Printer, FileUp, ArrowLeft,
  ChevronRight, Zap, BadgeCheck, Users, Phone, Lock,
  CreditCard, TrendingUp, FileCheck, FileWarning, CheckCircle2,
  Loader2, Info, FileSignature, AlertTriangle
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
  insurance_certificate_url: string;
  terms_url: string;
  receipt_url: string;
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
  created_at: string;
  updated_at: string;
}

// Claim eligibility interface
interface EligibilityCheck {
  policyActive: boolean;
  paymentCompleted: boolean;
  coverageValid: boolean;
  documentsComplete: boolean;
  canFileClaim: boolean;
  missingDocs: string[];
}

export default function ShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [policy, setPolicy] = useState<PolicyData | null>(null);
  const [documents, setDocuments] = useState<ShipmentDocument | null>(null);
  const [uploading, setUploading] = useState<{
    type: 'commercial_invoice' | 'packing_list' | 'bill_of_lading' | null;
    progress: number;
  }>({ type: null, progress: 0 });
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'information' | 'documents' | 'claim'>('information');
  
  // Claim form state
  const [claimForm, setClaimForm] = useState({
    claim_type: 'loss',
    incident_date: '',
    incident_location_country: '',
    incident_location_city: '',
    description: '',
    claimed_amount: '',
  });
  
  // Supporting documents for claim
  const [supportingDocs, setSupportingDocs] = useState<File[]>([]);
  const [submittingClaim, setSubmittingClaim] = useState(false);
  
  // Eligibility
  const [eligibility, setEligibility] = useState<EligibilityCheck>({
    policyActive: false,
    paymentCompleted: false,
    coverageValid: false,
    documentsComplete: false,
    canFileClaim: false,
    missingDocs: []
  });
  
  const shipmentId = params.id as string;

  useEffect(() => {
    loadData();
  }, [shipmentId]);

  useEffect(() => {
    if (policy && documents) {
      checkEligibility();
    }
  }, [policy, documents]);

  const loadData = async () => {
    const supabase = createClient();
    
    try {
      // Load policy data
      const { data: policyData, error: policyError } = await supabase
        .from('policies')
        .select('*')
        .eq('id', shipmentId)
        .single();
      
      if (policyError || !policyData) {
        toast.error('Shipment not found');
        router.push('/dashboard');
        return;
      }
      
      setPolicy(policyData);
      
      // First, try to get existing document
      const { data: existingDocs, error: findError } = await supabase
        .from('documents')
        .select('*')
        .eq('policy_id', shipmentId)
        .maybeSingle();
      
      if (findError) {
        console.error('Error finding documents:', findError);
      }
      
      let documentsData;
      
      if (existingDocs) {
        // Document already exists - just use it
        documentsData = existingDocs;
      } else {
        // No document exists - create a new one
        const { data: newDocs, error: createError } = await supabase
          .from('documents')
          .insert({
            policy_id: shipmentId,
            commercial_invoice_status: 'pending',
            packing_list_status: 'pending',
            bill_of_lading_status: 'pending'
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating document:', createError);
        } else {
          documentsData = newDocs;
        }
      }
      
      if (documentsData) {
        setDocuments(documentsData);
      }
      
    } catch (error) {
      console.error('Error loading shipment:', error);
      toast.error('Failed to load shipment details');
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

  const handleFileUpload = async (
    type: 'commercial_invoice' | 'packing_list' | 'bill_of_lading',
    file: File
  ) => {
    if (!policy) return;
    
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload PDF, JPEG, or PNG files only');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    
    setUploading({ type, progress: 0 });
    
    try {
      const supabase = createClient();
      
      const sanitizeFileName = (fileName: string): string => {
        return fileName
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-zA-Z0-9._-]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_+|_+$/g, '');
      };
      
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const safeFileName = `${timestamp}_${sanitizeFileName(file.name.slice(0, -fileExtension.length - 1))}.${fileExtension}`;
      
      let finalFilePath = `documents/${policy.policy_number}/${type}/${safeFileName}`;
      
      // Check/create bucket
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some(bucket => bucket.name === 'shipment-documents');
        
        if (!bucketExists) {
          await supabase.storage.createBucket('shipment-documents', {
            public: true,
            fileSizeLimit: 5242880,
            allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
          });
        }
      } catch (bucketError) {
        console.warn('Bucket check failed:', bucketError);
      }
      
      // Upload file with progress simulation
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress += 10;
        if (currentProgress >= 90) clearInterval(progressInterval);
        setUploading({ type, progress: currentProgress });
      }, 200);
      
      const { error: uploadError } = await supabase.storage
        .from('shipment-documents')
        .upload(finalFilePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });
      
      clearInterval(progressInterval);
      
      if (uploadError) {
        if (uploadError.message?.includes('already exists') || uploadError.message?.includes('duplicate')) {
          const uniqueFileName = `${timestamp}_${Math.random().toString(36).substring(2, 9)}_${type}.${fileExtension}`;
          finalFilePath = `documents/${policy.policy_number}/${type}/${uniqueFileName}`;
          
          const { error: retryError } = await supabase.storage
            .from('shipment-documents')
            .upload(finalFilePath, file, {
              cacheControl: '3600',
              upsert: false,
              contentType: file.type
            });
          
          if (retryError) {
            throw retryError;
          }
        } else {
          throw uploadError;
        }
      }
      
      setUploading({ type, progress: 100 });
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('shipment-documents')
        .getPublicUrl(finalFilePath);
      
      // Prepare update data
      const updateData: any = {
        policy_id: policy.id,
        updated_at: new Date().toISOString()
      };
      
      if (type === 'commercial_invoice') {
        updateData.commercial_invoice_url = publicUrl;
        updateData.commercial_invoice_status = 'uploaded';
      } else if (type === 'packing_list') {
        updateData.packing_list_url = publicUrl;
        updateData.packing_list_status = 'uploaded';
      } else if (type === 'bill_of_lading') {
        updateData.bill_of_lading_url = publicUrl;
        updateData.bill_of_lading_status = 'uploaded';
      }
      
      const { data: updatedDocument, error: upsertError } = await supabase
        .from('documents')
        .update({
          ...updateData
        })
        .eq('policy_id', policy.id)
        .select()
        .single();
      
      if (upsertError) {
        throw upsertError;
      }
      
      setDocuments(updatedDocument);
      toast.success(`${getDocumentName(type)} uploaded successfully!`);
      
      setTimeout(() => {
        setUploading({ type: null, progress: 0 });
      }, 1000);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      
      let errorMessage = 'Failed to upload document';
      if (error.message?.includes('Invalid key') || error.message?.includes('invalid character')) {
        errorMessage = 'File name contains invalid characters. Please use a simpler file name.';
      } else if (error.message?.includes('File size limit exceeded')) {
        errorMessage = 'File size exceeds 5MB limit';
      } else if (error.message?.includes('Invalid file type')) {
        errorMessage = 'Invalid file type. Please upload PDF, JPEG, or PNG only.';
      }
      
      toast.error(errorMessage);
      setUploading({ type: null, progress: 0 });
    }
  };

  const handleClaimFileUpload = (files: FileList) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024;

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

    setSubmittingClaim(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('You must be logged in to submit a claim');
        return;
      }

      // Upload supporting documents if any
      let supportingDocUrls: string[] = [];
      if (supportingDocs.length > 0) {
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
      }

      // Create claim record
      const { data: claim, error: claimError } = await supabase
        .from('claims')
        .insert({
          policy_id: policy.id,
          user_id: user.id,
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

      // Reset form
      setClaimForm({
        claim_type: 'loss',
        incident_date: '',
        incident_location_country: '',
        incident_location_city: '',
        description: '',
        claimed_amount: '',
      });
      setSupportingDocs([]);

      toast.success(`Claim ${claim.claim_number || '#'} submitted successfully! We will review it within 5-7 business days.`);
      
      // Switch back to documents tab
      setActiveTab('documents');

    } catch (error: any) {
      console.error('Error submitting claim:', error);
      toast.error(error.message || 'Failed to submit claim');
    } finally {
      setSubmittingClaim(false);
    }
  };

  const getDocumentName = (type: string) => {
    switch (type) {
      case 'commercial_invoice': return 'Commercial Invoice';
      case 'packing_list': return 'Packing List';
      case 'bill_of_lading': return 'Bill of Lading';
      default: return 'Document';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'uploaded':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'pending':
      default:
        return <FileWarning className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'uploaded': return 'Under Review';
      case 'pending': return 'Not Uploaded';
      default: return 'Pending';
    }
  };

  const handleViewDocument = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDownloadDocument = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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

  const getTransportationModeDisplay = (mode: string) => {
    const modeMap: Record<string, string> = {
      'air': 'Air Freight',
      'sea': 'Sea Freight',
      'road': 'Road Freight'
    };
    return modeMap[mode] || mode;
  };

  // Calculate document statistics
  const getDocumentStats = () => {
    const totalDocs = 3;
    let uploadedDocs = 0;
    let approvedDocs = 0;
    let pendingDocs = 0;

    if (documents) {
      const docStatuses = [
        documents.commercial_invoice_status,
        documents.packing_list_status,
        documents.bill_of_lading_status
      ];

      uploadedDocs = docStatuses.filter(status => status === 'uploaded' || status === 'approved' || status === 'rejected').length;
      approvedDocs = docStatuses.filter(status => status === 'approved').length;
      pendingDocs = docStatuses.filter(status => status === 'pending').length;
    }

    return { totalDocs, uploadedDocs, approvedDocs, pendingDocs };
  };

  // Render document card with upload progress
  const renderDocumentCard = (
    type: 'commercial_invoice' | 'packing_list' | 'bill_of_lading',
    title: string,
    description: string,
    status: string,
    url: string | null
  ) => {
    const isUploading = uploading.type === type;
    
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              status === 'approved' ? 'bg-green-100' :
              status === 'uploaded' ? 'bg-amber-100' :
              'bg-gray-100'
            }`}>
              {isUploading ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : (
                getStatusIcon(status)
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isUploading ? (
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                Uploading {uploading.progress}%
              </span>
            ) : (
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                status === 'approved' ? 'bg-green-100 text-green-800' :
                status === 'uploaded' ? 'bg-amber-100 text-amber-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {getStatusText(status)}
              </span>
            )}
          </div>
        </div>
        
        {isUploading ? (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-blue-700">Uploading file...</span>
              <span className="text-sm font-bold text-blue-700">{uploading.progress}%</span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploading.progress}%` }}
              ></div>
            </div>
          </div>
        ) : url ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleViewDocument(url)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Eye className="w-4 h-4" />
              View
            </button>
            <button
              onClick={() => handleDownloadDocument(url, `${type}-${policy?.policy_number}.pdf`)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            
            {/* Միայն եթե approved չէ, ցույց տալ Replace կոճակը */}
            {status !== 'approved' && (
              <>
                <button
                  onClick={() => document.getElementById(`${type}_upload`)?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
                >
                  <Upload className="w-4 h-4" />
                  Replace
                </button>
                <input
                  id={`${type}_upload`}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(type, file);
                  }}
                />
              </>
            )}
            
            {/* Եթե approved է, ցույց տալ մեկնաբանություն */}
            {status === 'approved' && (
              <div className="ml-2 text-sm text-green-600 font-medium">
                ✓ Approved
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors hover:bg-blue-50/50">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-gray-700 font-medium">Click to upload {title}</p>
                <p className="text-sm text-gray-500 mt-1">PDF, JPEG, or PNG (max 5MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(type, file);
                }}
              />
            </label>
          </div>
        )}
      </div>
    );
  };

  // Tab navigation
  const tabs = [
    {
      id: 'information',
      name: 'Information',
      icon: <Info className="w-4 h-4" />,
      enabled: true
    },
    {
      id: 'documents',
      name: 'Documents',
      icon: <FileText className="w-4 h-4" />,
      enabled: true
    },
    {
      id: 'claim',
      name: 'File a Claim',
      icon: <FileSignature className="w-4 h-4" />,
      enabled: eligibility.canFileClaim // Disabled if not eligible
    }
  ];

  const documentStats = getDocumentStats();
  const serviceFee = 99;
  const taxes = Math.round((policy?.premium_amount || 0) * 0.08);
  const totalPaid = (policy?.premium_amount || 0) + serviceFee + taxes;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <DashboardHeader />
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Loading shipment details...</p>
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
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Shipment Not Found</h2>
            <p className="text-gray-600 mb-6">The shipment you're looking for doesn't exist.</p>
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
      
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8">
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
                <button 
                  onClick={() => router.push('/shipments')}
                  className="hover:text-gray-700 transition-colors"
                >
                  Shipments
                </button>
                <ChevronRight className="w-3 h-3" />
                <span className="text-gray-900 font-medium">Policy #{policy.policy_number}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Shipment Details</h1>
              <p className="text-gray-600 mt-2">
                Manage your shipment documents and file claims
              </p>
            </div>
            
            <div className="hidden lg:flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    policy.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'
                  }`}></div>
                  <p className={`text-sm font-medium ${
                    policy.status === 'active' ? 'text-emerald-700' : 'text-gray-700'
                  }`}>
                    {policy.status === 'active' ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <p className="text-xs text-gray-500">Policy #{policy.policy_number}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                policy.status === 'active' ? 'bg-emerald-100' : 'bg-gray-100'
              }`}>
                {policy.status === 'active' ? (
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                ) : (
                  <Clock className="w-6 h-6 text-gray-600" />
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => tab.enabled && setActiveTab(tab.id as any)}
                    disabled={!tab.enabled}
                    className={`
                      flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                      ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                      ${!tab.enabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {tab.icon}
                    {tab.name}
                    {!tab.enabled && tab.id === 'claim' && (
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'information' && (
              <div className="space-y-6">
                {/* Shipment Details Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Shipment Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Package className="w-4 h-4" />
                        <span className="text-sm">Cargo Type</span>
                      </div>
                      <p className="font-medium text-gray-900">{policy.cargo_type}</p>
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
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">Route</span>
                      </div>
                      <p className="font-medium text-gray-900">
                        {policy.origin?.city || 'Unknown'} → 
                        {policy.destination?.city || 'Unknown'}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Coverage Period</h4>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 flex-1">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-xs text-gray-500">Start Date</p>
                          <p className="text-sm font-medium">{formatDate(policy.coverage_start)}</p>
                        </div>
                      </div>
                      <div className="h-0.5 w-8 bg-gray-300"></div>
                      <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 flex-1">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-xs text-gray-500">End Date</p>
                          <p className="text-sm font-medium">{formatDate(policy.coverage_end)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Policy Documents */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Policy Documents</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Insurance Certificate</h4>
                          <p className="text-xs text-gray-600">Official policy document</p>
                        </div>
                      </div>
                      <button
                        onClick={() => policy.insurance_certificate_url && handleViewDocument(policy.insurance_certificate_url)}
                        className="w-full py-2 px-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Document
                      </button>
                    </div>
                    
                    <div className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-gray-100">
                          <FileText className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Terms & Conditions</h4>
                          <p className="text-xs text-gray-600">Policy terms</p>
                        </div>
                      </div>
                      <button
                        onClick={() => policy.terms_url && handleViewDocument(policy.terms_url)}
                        className="w-full py-2 px-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        View Terms
                      </button>
                    </div>
                    
                    <div className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-green-100">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Payment Receipt</h4>
                          <p className="text-xs text-gray-600">Transaction confirmation</p>
                        </div>
                      </div>
                      <button
                        onClick={() => policy.receipt_url && handleViewDocument(policy.receipt_url)}
                        className="w-full py-2 px-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        View Receipt
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                {/* Quick Upload Section */}
                {/* Document Progress Dashboard */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Document Progress</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Uploaded</p>
                          <p className="text-2xl font-bold text-gray-900">{documentStats.uploadedDocs}/3</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <Upload className="w-5 h-5 text-emerald-600" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Approved</p>
                          <p className="text-2xl font-bold text-gray-900">{documentStats.approvedDocs}/3</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Pending</p>
                          <p className="text-2xl font-bold text-gray-900">{documentStats.pendingDocs}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Document Completion</h4>
                    <span className="text-sm font-medium text-blue-600">
                      {Math.round((documentStats.uploadedDocs / 3) * 100)}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(documentStats.uploadedDocs / 3) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    {documentStats.pendingDocs === 0 
                      ? 'All documents uploaded! Your shipment is ready for processing.'
                      : `Upload ${documentStats.pendingDocs} more document${documentStats.pendingDocs > 1 ? 's' : ''} to complete your shipment setup.`
                    }
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                          <Upload className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">Upload Documents</h2>
                          <p className="text-gray-600">Required for claim processing and shipment verification</p>
                        </div>
                      </div>
                    </div>
                    <div className="hidden lg:block">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Priority</p>
                        <p className="text-lg font-bold text-blue-600">High</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {renderDocumentCard(
                      'commercial_invoice',
                      'Commercial Invoice',
                      'Shows cargo value and trade details',
                      documents?.commercial_invoice_status || 'pending',
                      documents?.commercial_invoice_url || null
                    )}
                    
                    {renderDocumentCard(
                      'packing_list',
                      'Packing List',
                      'Shows quantity, weight, and packaging details',
                      documents?.packing_list_status || 'pending',
                      documents?.packing_list_url || null
                    )}
                    
                    {renderDocumentCard(
                      'bill_of_lading',
                      'Bill of Lading / Air Waybill',
                      'Carrier-issued shipment receipt',
                      documents?.bill_of_lading_status || 'pending',
                      documents?.bill_of_lading_url || null
                    )}
                  </div>
                </div>

                
              </div>
            )}

            {activeTab === 'claim' && (
              <div className="space-y-6">
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
                            onClick={() => setActiveTab('documents')}
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

                {/* Claim Form */}
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
                          <Eye className="w-8 h-8 text-blue-600" />
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
                            onChange={(e) => e.target.files && handleClaimFileUpload(e.target.files)}
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
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Premium</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(policy.premium_amount)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Coverage</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(policy.coverage_amount)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Deductible</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(policy.deductible)}
                  </span>
                </div>
                
                <div className="pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold text-gray-900">Total Paid</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(totalPaid)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 text-right">Payment completed</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-700">Payment Completed</p>
                    <p className="text-sm text-green-600">Policy activated on {formatDate(policy.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Submit Claim Button for claim tab */}
              {activeTab === 'claim' && eligibility.canFileClaim && (
                <button 
                  onClick={handleSubmitClaim}
                  disabled={submittingClaim}
                  className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submittingClaim ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      Submit Claim
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Claim Process Info (only shown in claim tab) */}
            {activeTab === 'claim' && (
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
            )}

            {/* Next Steps (for information tab) */}
            {activeTab === 'information' && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4">Next Steps</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Policy Active</p>
                      <p className="text-xs text-gray-500">Your cargo is insured and protected</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      documentStats.uploadedDocs === 3 ? 'bg-emerald-100' : 'bg-blue-100'
                    }`}>
                      {documentStats.uploadedDocs === 3 ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Upload className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Upload Documents</p>
                      <p className="text-xs text-gray-500">
                        {documentStats.uploadedDocs === 3 
                          ? 'All documents uploaded'
                          : `${3 - documentStats.uploadedDocs} document${documentStats.uploadedDocs < 2 ? 's' : ''} remaining`
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Track Shipment</p>
                      <p className="text-xs text-gray-500">Monitor your shipment progress</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Help Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Need Help?</h4>
                  <p className="text-sm text-gray-600">We're here to assist you</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Phone className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Call Support</p>
                    <p className="text-xs text-gray-600">1-800-CLAIM-NOW</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <AlertCircle className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Live Chat</p>
                    <p className="text-xs text-gray-600">Available 24/7</p>
                  </div>
                </div>
              </div>
              
              <button className="w-full mt-4 py-2.5 px-4 bg-white text-blue-600 font-medium rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}