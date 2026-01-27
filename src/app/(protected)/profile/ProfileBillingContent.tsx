'use client'

import { useState, useEffect, useRef } from "react";
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/app/context/UserContext';
import Image from 'next/image';

interface ProfileBillingContentProps {
  profileData: any;
}

export const ProfileBillingContent = ({ profileData }: ProfileBillingContentProps) => {
  const { user } = useUser();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    company_name: '',
    address: '',
  });

  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (profileData?.profile) {
      const { profile, policies } = profileData;
      
      if (profile.avatar_url) {
        setAvatarUrl(profile.avatar_url);
      } else if (user?.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url);
      }

      setFormData({
        full_name: profile.full_name || user?.user_metadata?.full_name || '',
        phone: profile.phone || '',
        email: profile.email || user?.email || '',
        company_name: profile.company_name || '',
        address: profile.address || '',
      });

      const formattedBillingHistory = (policies || []).map((policy: any) => {
        const policyDate = policy.created_at || policy.activated_at || new Date();
        return {
          id: policy.id,
          policyNumber: policy.policy_number || 'Unknown',
          date: new Date(policyDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          coverage: policy.coverage_amount ? `$${policy.coverage_amount.toLocaleString()}` : 'N/A',
          premium: policy.premium_amount ? `$${policy.premium_amount}` : 'N/A',
          status: policy.status === 'active' ? 'Active' : 'Pending',
          statusColor: policy.status === 'active' ? '#10b981' : '#f59e0b',
          certificateUrl: policy.insurance_certificate_url,
          receiptUrl: policy.receipt_url,
          termsUrl: policy.terms_url,
        };
      });

      setBillingHistory(formattedBillingHistory);
    }
  }, [profileData, user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Please upload a valid image file (JPEG, PNG, GIF, WebP).');
      }

      if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size must be less than 2MB.');
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(publicUrl);

      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      alert('Profile picture updated successfully!');
      
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      alert(`Error uploading avatar: ${error.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAvatar = async () => {
    if (!avatarUrl || !confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    try {
      setUploading(true);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(null);

      await supabase.auth.updateUser({
        data: { avatar_url: null }
      });

      alert('Profile picture removed successfully!');
      
    } catch (error: any) {
      console.error('Error deleting avatar:', error);
      alert(`Error deleting avatar: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.full_name,
          phone: formData.phone,
          email: formData.email,
          company_name: formData.company_name,
          address: formData.address,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

      alert('Profile updated successfully!');
      setEditMode(false);
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(`Error updating profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = (url: string, filename: string) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('Document not available');
    }
  };

  return (
    <div className="flex flex-col w-full gap-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarUpload}
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        className="hidden"
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            My Profile
          </h1>
          <p className="text-sm text-gray-500">
            Manage your personal information and profile settings
          </p>
        </div>
        
        {/* Edit Button */}
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {isMobile ? 'Edit' : 'Edit Profile'}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setEditMode(false)}
              className="px-4 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors font-medium text-sm border border-gray-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateProfile}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isMobile ? 'Saving...' : 'Saving...'}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {isMobile ? 'Save' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div 
              onClick={handleAvatarClick}
              className="relative w-24 h-24 md:w-28 md:h-28 rounded-2xl border-4 border-white bg-gradient-to-br from-blue-50 to-cyan-50 shadow-md flex items-center justify-center overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
            >
              {uploading ? (
                <div className="flex items-center justify-center w-full h-full">
                  <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Profile picture"
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarUrl(null)}
                />
              ) : (
                <div className="text-4xl font-bold text-blue-600">
                  {formData.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
                <div className="text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  Change Photo
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-2 -right-2 flex gap-2">
              {avatarUrl && (
                <button 
                  onClick={handleDeleteAvatar}
                  className="flex justify-center items-center w-10 h-10 bg-white px-1.5 py-[0px] rounded-xl border border-solid border-red-100 hover:bg-red-50 transition-colors shadow-md hover:shadow-lg"
                  title="Remove profile picture"
                  disabled={uploading}
                >
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              <button 
                onClick={handleAvatarClick}
                className="flex justify-center items-center w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-400 text-white px-1.5 py-[0px] rounded-xl border border-solid border-blue-200 hover:from-blue-600 hover:to-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
                title="Change profile picture"
                disabled={uploading}
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Profile Info */}
          <div className="flex-1">
            <div className="mb-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {formData.full_name || 'Welcome'}
              </h2>
              <p className="text-gray-600 font-medium">
                {formData.company_name ? `${formData.company_name} • Logistics Manager` : 'Logistics Manager'}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">{formData.email || user?.email}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-sm">{formData.phone || 'No phone'}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm">{formData.address || 'No address'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Fields Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-100">
            Personal Information
          </h3>
          <div className="space-y-5">
            {[
              { 
                id: "fullName", 
                label: "Full Name", 
                value: formData.full_name,
                onChange: (value: string) => setFormData({...formData, full_name: value}),
                placeholder: "Enter your full name",
                icon: (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )
              },
              { 
                id: "emailAddress", 
                label: "Email Address", 
                value: formData.email,
                onChange: (value: string) => setFormData({...formData, email: value}),
                placeholder: "Enter your email address",
                icon: (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )
              },
              { 
                id: "phoneNumber", 
                label: "Phone Number", 
                value: formData.phone,
                onChange: (value: string) => setFormData({...formData, phone: value}),
                placeholder: "Enter your phone number",
                icon: (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                )
              },
            ].map((field) => (
              <div key={field.id} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                {editMode ? (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {field.icon}
                    </div>
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                    {field.icon}
                    <span className="text-gray-700 font-medium">
                      {field.value || 'Not provided'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Company Information */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-100">
            Company Information
          </h3>
          <div className="space-y-5">
            {[
              { 
                id: "companyName", 
                label: "Company Name", 
                value: formData.company_name,
                onChange: (value: string) => setFormData({...formData, company_name: value}),
                placeholder: "Enter company name",
                icon: (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                )
              },
              { 
                id: "companyAddress", 
                label: "Company Address", 
                value: formData.address,
                onChange: (value: string) => setFormData({...formData, address: value}),
                placeholder: "Enter company address",
                icon: (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )
              },
            ].map((field) => (
              <div key={field.id} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                {editMode ? (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {field.icon}
                    </div>
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                    {field.icon}
                    <span className="text-gray-700 font-medium">
                      {field.value || 'Not provided'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Billing History Section */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Billing History
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                View your policy premium payment history and invoices
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                {billingHistory.length} {billingHistory.length === 1 ? 'Record' : 'Records'}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        {billingHistory.length > 0 ? (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Policy</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Coverage</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Premium</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Documents</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {billingHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">{item.policyNumber}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-600">{item.date}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-blue-600">{item.coverage}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900">{item.premium}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: `${item.statusColor}15` }}>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.statusColor }} />
                          <span className="text-xs font-medium" style={{ color: item.statusColor }}>{item.status}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          {item.certificateUrl && (
                            <button
                              onClick={() => handleDownloadDocument(item.certificateUrl, `${item.policyNumber}-certificate.pdf`)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm font-medium text-gray-700"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Certificate
                            </button>
                          )}
                          {item.receiptUrl && (
                            <button
                              onClick={() => handleDownloadDocument(item.receiptUrl, `${item.policyNumber}-receipt.pdf`)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm font-medium text-gray-700"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Receipt
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              {billingHistory.map((item) => (
                <div key={item.id} className="p-5 border-b border-gray-100 last:border-b-0">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">{item.policyNumber}</div>
                      <div className="text-sm text-gray-500">{item.date}</div>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ backgroundColor: `${item.statusColor}15` }}>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.statusColor }} />
                      <span className="text-xs font-medium" style={{ color: item.statusColor }}>{item.status}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">Coverage</div>
                      <div className="font-medium text-blue-600">{item.coverage}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">Premium</div>
                      <div className="font-semibold text-gray-900">{item.premium}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {item.certificateUrl && (
                      <button
                        onClick={() => handleDownloadDocument(item.certificateUrl, `${item.policyNumber}-certificate.pdf`)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-200 text-sm font-medium text-gray-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Certificate
                      </button>
                    )}
                    {item.receiptUrl && (
                      <button
                        onClick={() => handleDownloadDocument(item.receiptUrl, `${item.policyNumber}-receipt.pdf`)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-200 text-sm font-medium text-gray-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Receipt
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 mb-4">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No billing history yet</h4>
            <p className="text-gray-500 max-w-md mx-auto">
              Your billing history will appear here after you complete your first policy. Start by creating a quote.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};