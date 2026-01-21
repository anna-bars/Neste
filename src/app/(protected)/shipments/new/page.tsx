"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Camera, FileText, AlertCircle, CheckCircle, Clock, DollarSign, Calendar, MapPin, Package } from 'lucide-react';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import toast from 'react-hot-toast';

export default function ClaimSubmissionPage() {
  const router = useRouter();
  
  // Form states
  const [policyId, setPolicyId] = useState('P-0142');
  const [incidentDate, setIncidentDate] = useState('');
  const [incidentTime, setIncidentTime] = useState('');
  const [claimType, setClaimType] = useState('');
  const [incidentDetails, setIncidentDetails] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [reportedToCarrier, setReportedToCarrier] = useState<string>('');
  
  // File upload states
  const [damagePhotos, setDamagePhotos] = useState<File[]>([]);
  const [incidentReport, setIncidentReport] = useState<File[]>([]);
  const [commercialInvoice, setCommercialInvoice] = useState<File[]>([]);
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Claim type options
  const claimTypes = [
    { id: 'damage', label: 'Cargo Damage', description: 'Goods arrived damaged' },
    { id: 'loss', label: 'Total Loss', description: 'Goods lost in transit' },
    { id: 'delay', label: 'Transit Delay', description: 'Significant delivery delay' },
    { id: 'theft', label: 'Theft/Pilferage', description: 'Goods stolen during transit' },
    { id: 'water', label: 'Water Damage', description: 'Damage from water/moisture' },
  ];

  // Handle file uploads
  const handleFileUpload = (files: FileList, type: 'photos' | 'report' | 'invoice') => {
    const fileArray = Array.from(files);
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const invalidFiles = fileArray.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast.error('Please upload only JPG, PNG or PDF files');
      return;
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = fileArray.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast.error('File size should not exceed 10MB');
      return;
    }
    
    switch (type) {
      case 'photos':
        setDamagePhotos(prev => [...prev, ...fileArray]);
        break;
      case 'report':
        setIncidentReport(prev => [...prev, ...fileArray]);
        break;
      case 'invoice':
        setCommercialInvoice(prev => [...prev, ...fileArray]);
        break;
    }
    
    toast.success(`${fileArray.length} file(s) uploaded successfully`);
  };

  // Remove uploaded file
  const removeFile = (index: number, type: 'photos' | 'report' | 'invoice') => {
    switch (type) {
      case 'photos':
        setDamagePhotos(prev => prev.filter((_, i) => i !== index));
        break;
      case 'report':
        setIncidentReport(prev => prev.filter((_, i) => i !== index));
        break;
      case 'invoice':
        setCommercialInvoice(prev => prev.filter((_, i) => i !== index));
        break;
    }
    toast.success('File removed');
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!policyId) {
      toast.error('Please enter Policy ID');
      return;
    }
    
    if (!incidentDate) {
      toast.error('Please select incident date');
      return;
    }
    
    if (!claimType) {
      toast.error('Please select claim type');
      return;
    }
    
    if (!incidentDetails) {
      toast.error('Please provide incident details');
      return;
    }
    
    if (!claimAmount || parseFloat(claimAmount) <= 0) {
      toast.error('Please enter valid claim amount');
      return;
    }
    
    if (damagePhotos.length === 0) {
      toast.error('Please upload at least one damage photo');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create claim data object
      const claimData = {
        policyId,
        incidentDate,
        incidentTime,
        claimType,
        incidentDetails,
        claimAmount: parseFloat(claimAmount),
        reportedToCarrier: reportedToCarrier === 'yes',
        damagePhotos: damagePhotos.length,
        incidentReport: incidentReport.length,
        commercialInvoice: commercialInvoice.length,
        submittedAt: new Date().toISOString(),
        claimId: `CLAIM-${Date.now().toString().slice(-6)}`
      };
      
      // Save to localStorage (for demo)
      const existingClaims = JSON.parse(localStorage.getItem('insurance_claims') || '[]');
      existingClaims.push(claimData);
      localStorage.setItem('insurance_claims', JSON.stringify(existingClaims));
      
      toast.success('Claim submitted successfully! Your claim ID: ' + claimData.claimId);
      
      // Reset form
      setPolicyId('');
      setIncidentDate('');
      setIncidentTime('');
      setClaimType('');
      setIncidentDetails('');
      setClaimAmount('');
      setReportedToCarrier('');
      setDamagePhotos([]);
      setIncidentReport([]);
      setCommercialInvoice([]);
      
      // Redirect to claims page
      setTimeout(() => {
        router.push('/dashboard/claims');
      }, 1500);
      
    } catch (error) {
      console.error('Error submitting claim:', error);
      toast.error('Failed to submit claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for date input max
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userEmail="client@example.com" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">File Insurance Claim</h1>
              <p className="text-gray-600 mt-2">
                Submit a claim for damaged, lost, or delayed shipment
              </p>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Submit within 30 days of incident</span>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {['Claim Details', 'Incident Info', 'Evidence', 'Review'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2
                ${index === 0 
                  ? 'border-blue-600 bg-blue-600 text-white' 
                  : 'border-gray-300 bg-white text-gray-400'
                }
              `}>
                {index + 1}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                index === 0 ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step}
              </span>
              {index < 3 && (
                <div className={`h-0.5 w-16 mx-4 ${
                  index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Policy Identification */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">1. Policy Identification</h2>
                  <p className="text-sm text-gray-600">Identify your insurance policy</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Policy ID *
                  </label>
                  <input
                    type="text"
                    value={policyId}
                    onChange={(e) => setPolicyId(e.target.value)}
                    placeholder="Enter your policy number"
                    className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Found on your insurance certificate (e.g., P-0142)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incident Date *
                  </label>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    max={today}
                    className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incident Time
                  </label>
                  <input
                    type="time"
                    value={incidentTime}
                    onChange={(e) => setIncidentTime(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Claim Type *
                  </label>
                  <select
                    value={claimType}
                    onChange={(e) => setClaimType(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors bg-white"
                    required
                  >
                    <option value="">Select Claim Type</option>
                    {claimTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {claimType && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">Selected:</span>{' '}
                    {claimTypes.find(t => t.id === claimType)?.label} -{' '}
                    {claimTypes.find(t => t.id === claimType)?.description}
                  </p>
                </div>
              )}
            </section>

            {/* Section 2: Incident Details */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">2. Incident Details</h2>
                  <p className="text-sm text-gray-600">Describe what happened</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incident Details *
                  </label>
                  <textarea
                    value={incidentDetails}
                    onChange={(e) => setIncidentDetails(e.target.value)}
                    placeholder="Provide a detailed account of the incident, including:
• What exactly happened
• When and where it occurred
• Who discovered the damage/loss
• Condition of goods upon arrival
• Any immediate actions taken"
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors resize-none"
                    required
                  />
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <AlertCircle className="w-4 h-4" />
                    <span>Be as detailed as possible. Include dates, locations, and persons involved.</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Claim Amount (USD) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">$</span>
                      </div>
                      <input
                        type="number"
                        value={claimAmount}
                        onChange={(e) => setClaimAmount(e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="pl-10 w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reported to Carrier? *
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setReportedToCarrier('yes')}
                        className={`flex-1 py-3 rounded-xl border-2 font-medium transition-colors ${
                          reportedToCarrier === 'yes'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setReportedToCarrier('no')}
                        className={`flex-1 py-3 rounded-xl border-2 font-medium transition-colors ${
                          reportedToCarrier === 'no'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-300 text-gray-700 hover:border-red-500 hover:bg-red-50'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>
                
                {reportedToCarrier === 'no' && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">
                          Important: Carrier notification required
                        </p>
                        <p className="text-sm text-amber-700 mt-1">
                          Most insurance policies require you to notify the carrier within 3 days of incident discovery.
                          Please ensure you report this to the carrier as soon as possible.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Section 3: Evidence Upload */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">3. Evidence Upload</h2>
                  <p className="text-sm text-gray-600">Provide supporting documents</p>
                </div>
              </div>
              
              <div className="space-y-8">
                {/* Damage Photos */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">Damage / Incident Photos *</h3>
                      <p className="text-sm text-gray-600">Upload clear photos of the damaged goods</p>
                    </div>
                    <div className="text-sm text-blue-600">
                      {damagePhotos.length} file(s) uploaded
                    </div>
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors">
                    <div className="max-w-md mx-auto">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="font-medium text-gray-900 mb-2">
                        Drag and drop your files here or click to browse
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Upload JPG, PNG, or PDF files (Max 10MB each)
                      </p>
                      <label className="inline-block px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors cursor-pointer">
                        <span>Upload File</span>
                        <input
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'photos')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  
                  {/* Uploaded files list */}
                  {damagePhotos.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {damagePhotos.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg">
                              <FileText className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index, 'photos')}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Carrier's Incident Report */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">Carrier's Incident Report</h3>
                      <p className="text-sm text-gray-600">Official report from the shipping carrier</p>
                    </div>
                    <div className="text-sm text-blue-600">
                      {incidentReport.length} file(s) uploaded
                    </div>
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors">
                    <div className="max-w-md mx-auto">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-gray-600" />
                      </div>
                      <p className="font-medium text-gray-900 mb-2">
                        Drag and drop your files here or click to browse
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Upload PDF documents (Max 10MB each)
                      </p>
                      <label className="inline-block px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors cursor-pointer">
                        <span>Upload File</span>
                        <input
                          type="file"
                          multiple
                          accept=".pdf"
                          onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'report')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Commercial Invoice */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">Original Commercial Invoice</h3>
                      <p className="text-sm text-gray-600">Proof of goods value and ownership</p>
                    </div>
                    <div className="text-sm text-blue-600">
                      {commercialInvoice.length} file(s) uploaded
                    </div>
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors">
                    <div className="max-w-md mx-auto">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <DollarSign className="w-8 h-8 text-gray-600" />
                      </div>
                      <p className="font-medium text-gray-900 mb-2">
                        Drag and drop your files here or click to browse
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Upload PDF documents (Max 10MB each)
                      </p>
                      <label className="inline-block px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors cursor-pointer">
                        <span>Upload File</span>
                        <input
                          type="file"
                          multiple
                          accept=".pdf"
                          onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'invoice')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse md:flex-row items-center justify-between pt-8 border-t border-gray-200 gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full md:w-auto px-8 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    // Save as draft functionality
                    toast.success('Claim saved as draft');
                  }}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl border border-blue-600 text-blue-600 font-medium hover:bg-blue-50 transition-colors"
                >
                  Save as Draft
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    'Submit Claim'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Help Card */}
        <div className="mt-8 bg-blue-50 rounded-2xl border border-blue-200 p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Need Help Filing Your Claim?</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Ensure photos clearly show the damage and packaging condition</li>
                <li>• Include photos of shipping labels and waybill numbers</li>
                <li>• Report to carrier within 3 days for faster processing</li>
                <li>• Keep original documents until claim is settled</li>
                <li>• Claims are typically processed within 7-14 business days</li>
              </ul>
              <button className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm">
                Contact Claims Support →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}