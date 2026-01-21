'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import { 
  FileText, Download, Upload, CheckCircle, XCircle, Clock, 
  Shield, Calendar, MapPin, Package, DollarSign, Truck,
  AlertCircle, Eye, Printer, FileUp
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
      console.log(policyData)
      
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
    
    // Upload to Supabase Storage
    const filePath = `documents/${policy.policy_number}/${type}/${Date.now()}-${file.name}`;
    
    let uploadResult;
    try {
      uploadResult = await supabase.storage
        .from('shipment-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
    } catch (bucketError) {
      console.log('Bucket might not exist, trying to create...');
      
      // Try to create bucket
      await supabase.storage.createBucket('shipment-documents', {
        public: true
      });
      
      // Retry upload
      uploadResult = await supabase.storage
        .from('shipment-documents')
        .upload(filePath, file);
    }
    
    const { data: uploadData, error: uploadError } = uploadResult;
    
    if (uploadError) {
      throw uploadError;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('shipment-documents')
      .getPublicUrl(filePath);
    
    // Update database - ՍԱՐՔԵՆՔ ՄԵԹՈԴ, ՈՐ ՉԻ ՉԱՐՏԱՐԵԼ single() ՊԱՅՄԱՆՆԵՐՈՒՄ
    const updateData: any = {
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
    
    // Սկզբում փորձենք գտնել գոյություն ունեցող գրառում
    const { data: existingDoc, error: findError } = await supabase
      .from('documents')
      .select('id')
      .eq('policy_id', shipmentId)
      .maybeSingle();
    
    let updatedDocument;
    
    if (existingDoc) {
      // Եթե գրառումը գոյություն ունի, update
      const { data, error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', existingDoc.id)
        .select()
        .single();
      
      if (error) throw error;
      updatedDocument = data;
    } else {
      // Եթե գրառումը չկա, insert
      const { data, error } = await supabase
        .from('documents')
        .insert({
          policy_id: shipmentId,
          ...updateData
        })
        .select()
        .single();
      
      if (error) throw error;
      updatedDocument = data;
    }
    
    setDocuments(updatedDocument);
    toast.success(`${getDocumentName(type)} uploaded successfully!`);
    
  } catch (error) {
    console.error('Upload error:', error);
    toast.error('Failed to upload document');
  } finally {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
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
        <div className="max-w-6xl mx-auto px-4 py-8">
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

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back</span>
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{policy.policy_number}</h1>
              <div className="flex items-center gap-3 mt-2">
                <div className={`px-3 py-1 rounded-full ${
                  policy.status === 'active' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}>
                  <span className="font-semibold text-sm">{policy.status}</span>
                </div>
                <p className="text-gray-600">Cargo Insurance Policy</p>
              </div>
              <p className="text-gray-500 mt-1">Coverage in effect • Activated on {new Date(policy.created_at).toLocaleDateString()}</p>
            </div>
            
            <button className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
              <FileText className="w-5 h-5" />
              File a Claim
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Policy Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Policy Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Policy Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Cargo Type</span>
                  </div>
                  <p className="font-semibold text-gray-900">{policy.cargo_type}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Coverage</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ${policy.coverage_amount.toLocaleString()}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Deductible</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ${policy.deductible.toLocaleString()}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Transportation</span>
                  </div>
                  <p className="font-semibold text-gray-900">{policy.transportation_mode}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Coverage Period</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Start: {new Date(policy.coverage_start).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">End: {new Date(policy.coverage_end).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Route</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Origin</p>
                      <p className="font-medium text-gray-900">{policy.origin?.city || 'Unknown'}</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500">Destination</p>
                      <p className="font-medium text-gray-900">{policy.destination?.city || 'Unknown'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* User Document Uploads Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-100">
                  <FileUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Required Shipment Documents</h2>
                  <p className="text-sm text-gray-600">Upload required documents for claim processing</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Commercial Invoice */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">Commercial Invoice</h3>
                      <p className="text-sm text-gray-600">Shows cargo value and trade details (Required)</p>
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
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(documents.commercial_invoice_url!, `commercial-invoice-${policy.policy_number}.pdf`)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => document.getElementById('commercial_invoice_upload')?.click()}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                      <label className="block mb-2">
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
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">Packing List</h3>
                      <p className="text-sm text-gray-600">Shows quantity, weight, and packaging details (Required)</p>
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
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(documents.packing_list_url!, `packing-list-${policy.policy_number}.pdf`)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => document.getElementById('packing_list_upload')?.click()}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                      <label className="block mb-2">
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
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">Bill of Lading / Air Waybill</h3>
                      <p className="text-sm text-gray-600">Carrier-issued shipment receipt (Required)</p>
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
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(documents.bill_of_lading_url!, `bill-of-lading-${policy.policy_number}.pdf`)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => document.getElementById('bill_of_lading_upload')?.click()}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                      <label className="block mb-2">
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
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
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
              <h2 className="text-xl font-bold text-gray-900 mb-6">System Documents</h2>
              
              <div className="space-y-4">
                {/* Insurance Certificate */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Insurance Certificate</h3>
                      <p className="text-sm text-gray-600">Official policy document</p>
                    </div>
                    <button
                      onClick={() => policy.insurance_certificate_url && handleViewDocument(policy.insurance_certificate_url)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      View Document
                    </button>
                  </div>
                </div>
                
                {/* Terms & Conditions */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Terms & Conditions</h3>
                      <p className="text-sm text-gray-600">Policy terms</p>
                    </div>
                    <button
                      onClick={() => policy.terms_url && handleViewDocument(policy.terms_url)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      View Terms
                    </button>
                  </div>
                </div>
                
                {/* Payment Receipt */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Payment Receipt</h3>
                      <p className="text-sm text-gray-600">Transaction confirmation</p>
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
          </div>
          
          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Premium Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Premium Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-700">Premium</span>
                  <span className="font-semibold text-gray-900">
                    ${policy.premium_amount.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-700">Coverage</span>
                  <span className="font-semibold text-gray-900">
                    ${policy.coverage_amount.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-700">Deductible</span>
                  <span className="font-semibold text-gray-900">
                    ${policy.deductible.toLocaleString()}
                  </span>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-gray-900">Total Paid</span>
                    <span className="text-xl font-bold text-blue-600">
                      ${(policy.premium_amount + 99 + Math.round(policy.premium_amount * 0.08)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-700">Payment Completed</span>
                </div>
              </div>
            </div>
            
            {/* Next Steps */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Next Steps</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Coverage Active</h4>
                    <p className="text-sm text-gray-600 mt-1">Your cargo is now insured against all risks</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Download className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Download Documents</h4>
                    <p className="text-sm text-gray-600 mt-1">Save your policy and documents for records</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <Upload className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Upload Required Documents</h4>
                    <p className="text-sm text-gray-600 mt-1">Upload commercial invoice, packing list, and B/L</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}