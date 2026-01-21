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
  CreditCard
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
  const shipmentId = params.id as string;

  useEffect(() => {
    loadData();
  }, [shipmentId]);

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
      
      // Load or create shipment document record
      const { data: existingDocs, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .eq('policy_id', shipmentId)
        .maybeSingle();
      
      if (docsError || !existingDocs) {
        // Create new document record if doesn't exist
        const { data: newDocs, error: createError } = await supabase
          .from('documents')
          .insert([{
            policy_id: shipmentId,
            commercial_invoice_status: 'pending',
            packing_list_status: 'pending',
            bill_of_lading_status: 'pending'
          }])
          .select()
          .single();
        
        if (!createError && newDocs) {
          setDocuments(newDocs);
        }
      } else {
        setDocuments(existingDocs);
      }
      
    } catch (error) {
      console.error('Error loading shipment:', error);
      toast.error('Failed to load shipment details');
    } finally {
      setLoading(false);
    }
  };

const handleFileUpload = async (
  type: 'commercial_invoice' | 'packing_list' | 'bill_of_lading',
  file: File
) => {
  if (!policy) return;
  
  // Validate file type
  const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  if (!validTypes.includes(file.type)) {
    toast.error('Please upload PDF, JPEG, or PNG files only');
    return;
  }
  
  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    toast.error('File size must be less than 5MB');
    return;
  }
  
  setUploading({ type, progress: 0 });
  
  try {
    const supabase = createClient();
    
    // Create safe file path
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    
    // Generate initial file path
    let filePath = `documents/${policy.policy_number}/${type}/${timestamp}_${type}.${fileExtension}`;
    
    console.log('Uploading file:', {
      originalName: file.name,
      filePath
    });
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploading(prev => ({
        ...prev,
        progress: prev.progress < 90 ? prev.progress + 10 : prev.progress
      }));
    }, 100);
    
    // First, check if bucket exists
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('Error listing buckets:', bucketsError);
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === 'shipment-documents');
      
      if (!bucketExists) {
        console.log('Creating bucket: shipment-documents');
        await supabase.storage.createBucket('shipment-documents', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
        });
      }
    } catch (bucketError) {
      console.warn('Bucket check/creation failed, continuing:', bucketError);
    }
    
    // Upload file
    let uploadError = null;
    let finalFilePath = filePath;
    
    const uploadResult = await supabase.storage
      .from('shipment-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });
    
    uploadError = uploadResult.error;
    
    // If file already exists, try with a different name
    if (uploadError?.message?.includes('already exists') || uploadError?.message?.includes('duplicate')) {
      const uniqueFileName = `${timestamp}_${Math.random().toString(36).substring(2, 9)}_${type}.${fileExtension}`;
      finalFilePath = `documents/${policy.policy_number}/${type}/${uniqueFileName}`;
      
      console.log('Retrying with unique filename:', uniqueFileName);
      
      const retryResult = await supabase.storage
        .from('shipment-documents')
        .upload(finalFilePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });
      
      uploadError = retryResult.error;
    }
    
    clearInterval(progressInterval);
    
    if (uploadError) {
      throw uploadError;
    }
    
    setUploading({ type, progress: 100 });
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('shipment-documents')
      .getPublicUrl(finalFilePath);
    
    console.log('File uploaded successfully. Public URL:', publicUrl);
    
    // Update database
    const updateData: any = {
      updated_at: new Date().toISOString(),
      policy_id: shipmentId
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
    
    // Check if document record exists
    const { data: existingDoc } = await supabase
      .from('documents')
      .select('id')
      .eq('policy_id', shipmentId)
      .maybeSingle();
    
    let updatedDocument;
    
    if (existingDoc?.id) {
      // Update existing record
      const { data, error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', existingDoc.id)
        .select()
        .single();
      
      if (error) {
        console.error('Update error:', error);
        throw error;
      }
      updatedDocument = data;
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from('documents')
        .insert([updateData])
        .select()
        .single();
      
      if (error) {
        console.error('Insert error:', error);
        throw error;
      }
      updatedDocument = data;
    }
    
    setDocuments(updatedDocument);
    toast.success(`${getDocumentName(type)} uploaded successfully!`);
    
    // Reset upload progress after success
    setTimeout(() => {
      setUploading({ type: null, progress: 0 });
    }, 1000);
    
  } catch (error: any) {
    console.error('Upload error details:', error);
    
    let errorMessage = 'Failed to upload document';
    if (error.message?.includes('The resource already exists')) {
      errorMessage = 'File already exists. Please rename your file.';
    } else if (error.message?.includes('Invalid key') || error.message?.includes('invalid character')) {
      errorMessage = 'File name contains invalid characters. Please rename the file to use only letters, numbers, and underscores.';
    } else if (error.message?.includes('File size limit exceeded')) {
      errorMessage = 'File size exceeds 5MB limit';
    } else if (error.message?.includes('Invalid file type')) {
      errorMessage = 'Invalid file type. Please upload PDF, JPEG, or PNG only.';
    } else if (error.message?.includes('not found')) {
      errorMessage = 'Storage bucket not found. Please contact support.';
    } else if (error.message?.includes('permission denied') || error.message?.includes('Forbidden')) {
      errorMessage = 'Permission denied. Please check your storage permissions.';
    }
    
    toast.error(errorMessage);
    setUploading({ type: null, progress: 0 });
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
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'uploaded':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'pending':
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="max-w-[100%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="max-w-[100%] mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Shipment Not Found</h2>
            <p className="text-gray-600 mb-6">The shipment you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total paid (premium + service fee + taxes)
  const serviceFee = 99;
  const taxes = Math.round(policy.premium_amount * 0.08);
  const totalPaid = policy.premium_amount + serviceFee + taxes;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-[100%] mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header with breadcrumbs */}
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
                Manage your cargo insurance policy and required documents
              </p>
            </div>
            
            <div className="hidden lg:flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    policy.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <p className={`text-sm font-medium ${
                    policy.status === 'active' ? 'text-green-700' : 'text-gray-700'
                  }`}>
                    {policy.status === 'active' ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <p className="text-xs text-gray-500">Policy #{policy.policy_number}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                policy.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {policy.status === 'active' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Clock className="w-5 h-5 text-gray-600" />
                )}
              </div>
            </div>
          </div>

          {/* Status Banner */}
          {policy.status === 'active' ? (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Policy Active!</h3>
                  <p className="text-sm text-gray-600">
                    Your cargo insurance is active and protecting your shipment.
                    Coverage ends on {formatDate(policy.coverage_end)}.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Policy Inactive</h3>
                  <p className="text-sm text-gray-600">
                    Your cargo insurance is not active. Please contact support for assistance.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6 w-[102%]">
            {/* Shipment Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Shipment Details</h2>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  policy.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {policy.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Package className="w-4 h-4" />
                    <span className="text-sm">Cargo Type</span>
                  </div>
                  <p className="font-medium">{policy.cargo_type}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">Coverage Amount</span>
                  </div>
                  <p className="font-medium">{formatCurrency(policy.coverage_amount)}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">Route</span>
                  </div>
                  <p className="font-medium">
                    {policy.origin?.city || 'Unknown'} → 
                    {policy.destination?.city || 'Unknown'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Truck className="w-4 h-4" />
                    <span className="text-sm">Transport Mode</span>
                  </div>
                  <p className="font-medium">{getTransportationModeDisplay(policy.transportation_mode)}</p>
                </div>
              </div>

              {/* Coverage Period */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Coverage Period</h4>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Start Date</p>
                      <p className="text-sm font-medium">{formatDate(policy.coverage_start)}</p>
                    </div>
                  </div>
                  <div className="h-0.5 w-8 bg-gray-300"></div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">End Date</p>
                      <p className="text-sm font-medium">{formatDate(policy.coverage_end)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Required Shipment Documents</h2>
                  <p className="text-gray-600 text-sm">Upload required documents for claim processing</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <AlertCircle className="w-4 h-4" />
                  <span>All documents required for claims</span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Commercial Invoice */}
                <div className={`
                  p-5 rounded-xl border-2 transition-all duration-200
                  ${documents?.commercial_invoice_status === 'approved' 
                    ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50' 
                    : documents?.commercial_invoice_status === 'rejected'
                    ? 'border-red-200 bg-gradient-to-br from-red-50 to-pink-50'
                    : documents?.commercial_invoice_status === 'uploaded'
                    ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        documents?.commercial_invoice_status === 'approved' ? 'bg-green-100' :
                        documents?.commercial_invoice_status === 'rejected' ? 'bg-red-100' :
                        documents?.commercial_invoice_status === 'uploaded' ? 'bg-yellow-100' :
                        'bg-gray-100'
                      }`}>
                        {documents?.commercial_invoice_status === 'approved' ? 
                          <CheckCircle className="w-5 h-5 text-green-600" /> :
                          documents?.commercial_invoice_status === 'rejected' ?
                          <XCircle className="w-5 h-5 text-red-600" /> :
                          documents?.commercial_invoice_status === 'uploaded' ?
                          <Clock className="w-5 h-5 text-yellow-600" /> :
                          <FileText className="w-5 h-5 text-gray-600" />
                        }
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Commercial Invoice</h3>
                        <p className="text-sm text-gray-600">Shows cargo value and trade details</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(documents?.commercial_invoice_status || 'pending')}
                      <span className="text-sm font-medium">
                        {getStatusText(documents?.commercial_invoice_status || 'pending')}
                      </span>
                    </div>
                  </div>
                  
                  {documents?.commercial_invoice_url ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleViewDocument(documents.commercial_invoice_url!)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(documents.commercial_invoice_url!, `commercial-invoice-${policy.policy_number}.pdf`)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => document.getElementById('commercial_invoice_upload')?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Replace
                      </button>
                      <input
                        id="commercial_invoice_upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('commercial_invoice', file);
                        }}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">Click to upload Commercial Invoice</p>
                          <p className="text-sm text-gray-500 mt-1">PDF, JPEG, or PNG (max 5MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('commercial_invoice', file);
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Packing List */}
                <div className={`
                  p-5 rounded-xl border-2 transition-all duration-200
                  ${documents?.packing_list_status === 'approved' 
                    ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50' 
                    : documents?.packing_list_status === 'rejected'
                    ? 'border-red-200 bg-gradient-to-br from-red-50 to-pink-50'
                    : documents?.packing_list_status === 'uploaded'
                    ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        documents?.packing_list_status === 'approved' ? 'bg-green-100' :
                        documents?.packing_list_status === 'rejected' ? 'bg-red-100' :
                        documents?.packing_list_status === 'uploaded' ? 'bg-yellow-100' :
                        'bg-gray-100'
                      }`}>
                        {documents?.packing_list_status === 'approved' ? 
                          <CheckCircle className="w-5 h-5 text-green-600" /> :
                          documents?.packing_list_status === 'rejected' ?
                          <XCircle className="w-5 h-5 text-red-600" /> :
                          documents?.packing_list_status === 'uploaded' ?
                          <Clock className="w-5 h-5 text-yellow-600" /> :
                          <FileText className="w-5 h-5 text-gray-600" />
                        }
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Packing List</h3>
                        <p className="text-sm text-gray-600">Shows quantity, weight, and packaging details</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(documents?.packing_list_status || 'pending')}
                      <span className="text-sm font-medium">
                        {getStatusText(documents?.packing_list_status || 'pending')}
                      </span>
                    </div>
                  </div>
                  
                  {documents?.packing_list_url ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleViewDocument(documents.packing_list_url!)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(documents.packing_list_url!, `packing-list-${policy.policy_number}.pdf`)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => document.getElementById('packing_list_upload')?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Replace
                      </button>
                      <input
                        id="packing_list_upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('packing_list', file);
                        }}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">Click to upload Packing List</p>
                          <p className="text-sm text-gray-500 mt-1">PDF, JPEG, or PNG (max 5MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('packing_list', file);
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Bill of Lading */}
                <div className={`
                  p-5 rounded-xl border-2 transition-all duration-200
                  ${documents?.bill_of_lading_status === 'approved' 
                    ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50' 
                    : documents?.bill_of_lading_status === 'rejected'
                    ? 'border-red-200 bg-gradient-to-br from-red-50 to-pink-50'
                    : documents?.bill_of_lading_status === 'uploaded'
                    ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        documents?.bill_of_lading_status === 'approved' ? 'bg-green-100' :
                        documents?.bill_of_lading_status === 'rejected' ? 'bg-red-100' :
                        documents?.bill_of_lading_status === 'uploaded' ? 'bg-yellow-100' :
                        'bg-gray-100'
                      }`}>
                        {documents?.bill_of_lading_status === 'approved' ? 
                          <CheckCircle className="w-5 h-5 text-green-600" /> :
                          documents?.bill_of_lading_status === 'rejected' ?
                          <XCircle className="w-5 h-5 text-red-600" /> :
                          documents?.bill_of_lading_status === 'uploaded' ?
                          <Clock className="w-5 h-5 text-yellow-600" /> :
                          <FileText className="w-5 h-5 text-gray-600" />
                        }
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Bill of Lading / Air Waybill</h3>
                        <p className="text-sm text-gray-600">Carrier-issued shipment receipt</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(documents?.bill_of_lading_status || 'pending')}
                      <span className="text-sm font-medium">
                        {getStatusText(documents?.bill_of_lading_status || 'pending')}
                      </span>
                    </div>
                  </div>
                  
                  {documents?.bill_of_lading_url ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleViewDocument(documents.bill_of_lading_url!)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(documents.bill_of_lading_url!, `bill-of-lading-${policy.policy_number}.pdf`)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => document.getElementById('bill_of_lading_upload')?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Replace
                      </button>
                      <input
                        id="bill_of_lading_upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('bill_of_lading', file);
                        }}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">Click to upload Bill of Lading</p>
                          <p className="text-sm text-gray-500 mt-1">PDF, JPEG, or PNG (max 5MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('bill_of_lading', file);
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
              
              {uploading.type && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Uploading {getDocumentName(uploading.type)}...</span>
                    <span>{uploading.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploading.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* System Documents */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Policy Documents</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Insurance Certificate</h4>
                      <p className="text-sm text-gray-600">Official policy document</p>
                    </div>
                  </div>
                  <button
                    onClick={() => policy.insurance_certificate_url && handleViewDocument(policy.insurance_certificate_url)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    View Document
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Terms & Conditions</h4>
                      <p className="text-sm text-gray-600">Policy terms and conditions</p>
                    </div>
                  </div>
                  <button
                    onClick={() => policy.terms_url && handleViewDocument(policy.terms_url)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    View Terms
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Payment Receipt</h4>
                      <p className="text-sm text-gray-600">Transaction confirmation</p>
                    </div>
                  </div>
                  <button
                    onClick={() => policy.receipt_url && handleViewDocument(policy.receipt_url)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    View Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
              
              <div className="space-y-3">
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
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Paid</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(totalPaid)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 text-right mt-1">Payment completed</p>
                </div>
              </div>
              
              <div className="mt-6 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-700">Payment Completed</span>
                </div>
                <p className="text-sm text-green-600 mt-1">Policy activated on {formatDate(policy.created_at)}</p>
              </div>

              {/* File Claim Button */}
              <button className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                File a Claim
              </button>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Next Steps</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Policy Activated</p>
                    <p className="text-xs text-gray-500">Your cargo is insured and protected</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    documents?.commercial_invoice_status === 'approved' && 
                    documents?.packing_list_status === 'approved' && 
                    documents?.bill_of_lading_status === 'approved' 
                      ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      documents?.commercial_invoice_status === 'approved' && 
                      documents?.packing_list_status === 'approved' && 
                      documents?.bill_of_lading_status === 'approved' 
                        ? 'bg-green-600' : 'bg-blue-600'
                    }`}></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Upload Documents</p>
                    <p className="text-xs text-gray-500">
                      {documents?.commercial_invoice_status === 'approved' && 
                       documents?.packing_list_status === 'approved' && 
                       documents?.bill_of_lading_status === 'approved' 
                        ? 'All documents uploaded and approved'
                        : 'Required for claim processing'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Track Shipment</p>
                    <p className="text-xs text-gray-500">Monitor your shipment progress</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Need Assistance?</h4>
                  <p className="text-sm text-gray-600">Our team is here to help</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Phone className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Claims Support</p>
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
              
              <button className="w-full mt-4 py-2 px-4 bg-white text-blue-600 font-medium rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors">
                Contact Support
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center">
                  <Download className="w-5 h-5 text-gray-600 mb-1" />
                  <span className="text-xs text-gray-700">Download All</span>
                </button>
                <button className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center">
                  <Printer className="w-5 h-5 text-gray-600 mb-1" />
                  <span className="text-xs text-gray-700">Print</span>
                </button>
                <button className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center">
                  <Eye className="w-5 h-5 text-gray-600 mb-1" />
                  <span className="text-xs text-gray-700">Preview</span>
                </button>
                <button className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center">
                  <Share className="w-5 h-5 text-gray-600 mb-1" />
                  <span className="text-xs text-gray-700">Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add Share icon component
function Share(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}