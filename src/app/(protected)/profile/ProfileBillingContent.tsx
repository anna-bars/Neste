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
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data from profileData
  useEffect(() => {
    if (profileData?.profile) {
      const { profile, policies } = profileData;
      
      // Set avatar URL
      if (profile.avatar_url) {
        setAvatarUrl(profile.avatar_url);
      } else if (user?.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url);
      }

      // Set form data
      setFormData({
        full_name: profile.full_name || user?.user_metadata?.full_name || '',
        phone: profile.phone || '',
        email: profile.email || user?.email || '',
        company_name: profile.company_name || '',
        address: profile.address || '',
      });

      // Format billing history from policies
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

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Please upload a valid image file (JPEG, PNG, GIF, WebP).');
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size must be less than 2MB.');
      }

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
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

      // Update local state
      setAvatarUrl(publicUrl);

      // Optionally update user metadata in auth.users
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
      
      // Update profile to remove avatar URL
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

      // Update local state
      setAvatarUrl(null);

      // Optionally update user metadata
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

  const formatLocalTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    
    return `${formattedHours}:${formattedMinutes} ${ampm} local time`;
  };

  return (
    <div className="flex flex-col w-full items-start gap-6 p-4 sm:p-6 relative bg-[#fbfbf6] rounded-2xl border border-[#e5e7eb]">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarUpload}
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        className="hidden"
      />

      {/* Edit Button Header */}
      <div className="flex justify-between items-center w-full">
        <div className="w-full sm:w-[354px] relative h-[43px]">
          <h1 className="absolute top-0 left-0 [font-family:'Montserrat-Medium',Helvetica] font-medium text-black text-lg tracking-[0.36px] leading-[normal]">
            My Profile
          </h1>
          <p className="absolute top-7 left-0 [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#c7c7c7] text-xs tracking-[0.24px] leading-[normal]">
            Manage your personal information and profile settings
          </p>
        </div>
        
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <img 
              className="w-4 h-4" 
              alt="Edit"
              src="/profile/pen-01-stroke-rounded.svg"
            />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setEditMode(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateProfile}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        )}
      </div>

      {/* User Profile Section */}
      <div className="flex flex-col sm:flex-row items-start gap-4 relative self-stretch w-full">
        {/* Profile image with edit button */}
        <div className="relative mb-4 sm:mb-0 group">
          <div 
            onClick={handleAvatarClick}
            className="relative w-16 h-16 sm:w-[81px] sm:h-[81px] rounded-[8px] border-2 border-[#f3f3f6] bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue-300 transition-all duration-200"
          >
            {uploading ? (
              <div className="flex items-center justify-center w-full h-full bg-blue-50">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Profile picture"
                width={81}
                height={81}
                className="w-full h-full object-cover"
                onError={() => setAvatarUrl(null)}
              />
            ) : (
              <div className="text-2xl sm:text-3xl font-semibold text-blue-600">
                {formData.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="text-white text-xs font-medium">Change</div>
            </div>
          </div>
          
          {/* Edit button - positioned at bottom right */}
          <div className="absolute -bottom-1 -right-1 flex gap-1">
            <button 
              onClick={handleAvatarClick}
              className="flex justify-center items-center w-6 h-6 sm:w-7 sm:h-7 bg-white px-1 sm:px-1.5 py-[0px] rounded-md border-[0.7px] border-solid border-[#EFF4FC] hover:bg-blue-50 transition-colors shadow-sm"
              title="Change profile picture"
              disabled={uploading}
            >
              {uploading ? (
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <img 
                  className="w-3 h-3 sm:w-4 sm:h-4" 
                  alt="Edit profile"
                  src="/profile/pen-01-stroke-rounded.svg"
                />
              )}
            </button>
            
            {avatarUrl && (
              <button 
                onClick={handleDeleteAvatar}
                className="flex justify-center items-center w-6 h-6 sm:w-7 sm:h-7 bg-white px-1 sm:px-1.5 py-[0px] rounded-md border-[0.7px] border-solid border-red-200 hover:bg-red-50 transition-colors shadow-sm"
                title="Remove profile picture"
                disabled={uploading}
              >
                <img 
                  className="w-3 h-3 sm:w-4 sm:h-4" 
                  alt="Delete profile picture"
                  src="/profile/delete-02-stroke-rounded.svg"
                />
              </button>
            )}
          </div>
          
          {/* Uploading indicator */}
          {uploading && (
            <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded-full animate-pulse">
              Uploading...
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-start justify-between px-0 py-[5px] relative flex-1 self-stretch grow">
          <h1 className="relative self-stretch mt-[-1.00px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#2a2a2a] text-xl sm:text-2xl tracking-[0.48px] leading-[normal]">
            {formData.full_name || 'User'}
          </h1>
          <p className="relative self-stretch [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#949494] text-sm sm:text-base tracking-[0.32px] leading-[normal]">
            {formData.company_name ? `${formData.company_name} Manager` : 'Logistics Manager'}
          </p>
          <div className="inline-flex items-center gap-1 relative flex-[0_0_auto] mt-2">
            <img
              className="relative w-3 h-3 aspect-[1] object-cover"
              alt="Location icon"
              src="/profile/location-01-stroke-rounded.svg"
            />
            <p className="relative w-full sm:w-[359px] mt-[-1.00px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#c7c7c7] text-xs sm:text-sm tracking-[0.28px] leading-[normal]">
              {formData.address || 'No address provided'} – {formatLocalTime()}
            </p>
          </div>
        </div>
      </div>

      {/* Upload Instructions */}
      {!avatarUrl && !uploading && (
        <div className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700 text-sm">
            <strong>Tip:</strong> Click on the profile picture to upload a new one. 
            Supported formats: JPEG, PNG, GIF, WebP (max 2MB)
          </p>
        </div>
      )}

      {/* Personal Information Fields */}
      <div className="flex flex-col lg:flex-row items-start justify-between gap-6 relative self-stretch w-full">
        {[
          { 
            id: "fullName", 
            label: "Full Name", 
            value: formData.full_name,
            onChange: (value: string) => setFormData({...formData, full_name: value}),
            placeholder: "Enter your full name"
          },
          { 
            id: "phoneNumber", 
            label: "Phone Number", 
            value: formData.phone,
            onChange: (value: string) => setFormData({...formData, phone: value}),
            placeholder: "Enter your phone number"
          },
          { 
            id: "emailAddress", 
            label: "Email Address", 
            value: formData.email,
            onChange: (value: string) => setFormData({...formData, email: value}),
            placeholder: "Enter your email address"
          },
        ].map((field) => (
          <div key={field.id} className="flex flex-col w-full lg:w-[385px] items-start gap-2 relative">
            <label className="relative w-fit mt-[-1.00px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#4f4f4f] text-sm tracking-[0] leading-[18px] whitespace-nowrap">
              {field.label}
            </label>
            {editMode ? (
              <input
                type="text"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder={field.placeholder}
                className="flex flex-col h-[38px] items-start justify-center gap-2.5 px-3 py-2 relative self-stretch w-full rounded-[7px] border border-solid border-[#c7c7c782] bg-white [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#7b7b7b] text-base tracking-[0] leading-[18px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <div className="flex flex-col h-[38px] items-start justify-center gap-2.5 px-3 py-2 relative self-stretch w-full rounded-[7px] border border-solid border-[#c7c7c782] bg-gray-50">
                <div className="relative w-full mt-[-1.00px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#7b7b7b] text-base tracking-[0] leading-[18px] whitespace-nowrap">
                  {field.value || 'Not provided'}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="relative self-stretch w-full h-px bg-gray-200" />

      {/* Company Information */}
      <div className="inline-flex flex-col items-start gap-5 relative w-full">
        <div className="relative w-full sm:w-[272px] h-[43px]">
          <h2 className="absolute top-0 left-0 [font-family:'Montserrat-Medium',Helvetica] font-medium text-black text-lg tracking-[0.36px] leading-[normal]">
            Company Information
          </h2>
          <p className="absolute top-7 left-0 [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#c7c7c7] text-xs tracking-[0.24px] leading-[normal]">
            Details used for policy and billing purposes
          </p>
        </div>
        <div className="flex flex-col lg:flex-row items-start gap-6 relative w-full">
          {[
            { 
              id: "companyName", 
              label: "Company Name", 
              value: formData.company_name,
              onChange: (value: string) => setFormData({...formData, company_name: value}),
              placeholder: "Enter company name"
            },
            { 
              id: "companyAddress", 
              label: "Company Address", 
              value: formData.address,
              onChange: (value: string) => setFormData({...formData, address: value}),
              placeholder: "Enter company address"
            },
          ].map((field) => (
            <div key={field.id} className="flex flex-col w-full lg:w-[385px] items-start gap-2 relative">
              <label className="relative w-fit mt-[-1.00px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#4f4f4f] text-sm tracking-[0] leading-[18px] whitespace-nowrap">
                {field.label}
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={field.placeholder}
                  className="flex flex-col h-[38px] items-start justify-center gap-2.5 px-3 py-2 relative self-stretch w-full rounded-[7px] border border-solid border-[#c7c7c782] bg-white [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#7b7b7b] text-base tracking-[0] leading-[18px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <div className="flex flex-col h-[38px] items-start justify-center gap-2.5 px-3 py-2 relative self-stretch w-full rounded-[7px] border border-solid border-[#c7c7c782] bg-gray-50">
                  <div className="relative w-full mt-[-1.00px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#7b7b7b] text-base tracking-[0] leading-[18px] whitespace-nowrap">
                    {field.value || 'Not provided'}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="relative self-stretch w-full h-px bg-gray-200" />

      {/* Billing History Header */}
      <div className="w-full sm:w-[354px] relative h-[43px]">
        <h1 className="absolute top-0 left-0 [font-family:'Montserrat-Medium',Helvetica] font-medium text-black text-lg tracking-[0.36px] leading-[normal]">
          Billing History
        </h1>
        <p className="absolute top-7 left-0 [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#c7c7c7] text-xs tracking-[0.24px] leading-[normal]">
          View your policy premium payment history and invoices
        </p>
      </div>

      {/* Billing History Table (Desktop View) */}
      <div className="hidden lg:block w-full">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr className="border-b border-[#EFF1F3]">
                <th className="py-3 px-4 text-left [font-family:'Poppins-Regular',Helvetica] font-normal text-[#606068] text-sm tracking-[0]">
                  Policy Number
                </th>
                <th className="py-3 px-4 text-left [font-family:'Poppins-Regular',Helvetica] font-normal text-[#606068] text-sm tracking-[0]">
                  Date
                </th>
                <th className="py-3 px-4 text-left [font-family:'Poppins-Regular',Helvetica] font-normal text-[#606068] text-sm tracking-[0]">
                  Coverage
                </th>
                <th className="py-3 px-4 text-left [font-family:'Poppins-Regular',Helvetica] font-normal text-[#606068] text-sm tracking-[0]">
                  Premium
                </th>
                <th className="py-3 px-4 text-left [font-family:'Poppins-Regular',Helvetica] font-normal text-[#606068] text-sm tracking-[0]">
                  Status
                </th>
                <th className="py-3 px-4 text-left [font-family:'Poppins-Regular',Helvetica] font-normal text-[#606068] text-sm tracking-[0]">
                  Documents
                </th>
              </tr>
            </thead>
            <tbody>
              {billingHistory.length > 0 ? (
                billingHistory.map((item) => (
                  <tr key={item.id} className="border-b border-[#EFF1F3] hover:bg-gray-50">
                    <td className="py-3 px-4 [font-family:'Poppins-Regular',Helvetica] font-normal text-black text-sm">
                      {item.policyNumber}
                    </td>
                    <td className="py-3 px-4 [font-family:'Poppins-Regular',Helvetica] font-normal text-black text-sm">
                      {item.date}
                    </td>
                    <td className="py-3 px-4 [font-family:'Poppins-Regular',Helvetica] font-normal text-blue-600 text-sm">
                      {item.coverage}
                    </td>
                    <td className="py-3 px-4 [font-family:'Poppins-Regular',Helvetica] font-normal text-black text-sm font-medium">
                      {item.premium}
                    </td>
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center justify-center gap-1.5 px-2 py-1 relative rounded-[37px]" style={{ backgroundColor: `${item.statusColor}20` }}>
                        <div className="relative w-2 h-2 rounded-full" style={{ backgroundColor: item.statusColor }} />
                        <div className="relative [font-family:'Poppins-Regular',Helvetica] font-normal text-xs tracking-[0]" style={{ color: item.statusColor }}>
                          {item.status}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {item.certificateUrl && (
                          <button
                            onClick={() => handleDownloadDocument(item.certificateUrl, `${item.policyNumber}-certificate.pdf`)}
                            className="flex items-center justify-center gap-2 px-3 py-1.5 relative rounded-md border border-solid border-[#e3e6ea] hover:bg-gray-50 transition-colors min-w-[100px]"
                          >
                            <span className="[font-family:'Poppins-Regular',Helvetica] font-normal text-gray-700 text-sm">
                              Certificate
                            </span>
                          </button>
                        )}
                        {item.receiptUrl && (
                          <button
                            onClick={() => handleDownloadDocument(item.receiptUrl, `${item.policyNumber}-receipt.pdf`)}
                            className="flex items-center justify-center gap-2 px-3 py-1.5 relative rounded-md border border-solid border-[#e3e6ea] hover:bg-gray-50 transition-colors min-w-[100px]"
                          >
                            <span className="[font-family:'Poppins-Regular',Helvetica] font-normal text-gray-700 text-sm">
                              Receipt
                            </span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                        <span className="text-gray-500 text-xl">📄</span>
                      </div>
                      <p className="text-gray-500 text-sm mb-2">No billing history yet</p>
                      <p className="text-gray-400 text-xs">Your billing history will appear here after your first policy</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Billing History - Mobile View */}
      <div className="lg:hidden flex flex-col w-full items-start gap-4 relative">
        {billingHistory.length > 0 ? (
          billingHistory.map((item) => (
            <div key={item.id} className="flex flex-col w-full p-4 relative bg-white rounded-xl border border-gray-200 gap-3 hover:border-blue-300 transition-colors">
              {/* Top Row - Policy Number and Status */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="relative [font-family:'Poppins-Regular',Helvetica] font-medium text-black text-sm">
                    {item.policyNumber}
                  </div>
                </div>
                <div className="inline-flex items-center justify-center gap-1.5 px-2 py-1 relative rounded-[37px]" style={{ backgroundColor: `${item.statusColor}20` }}>
                  <div className="relative w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.statusColor }} />
                  <div className="relative [font-family:'Poppins-Regular',Helvetica] font-normal text-xs" style={{ color: item.statusColor }}>
                    {item.status}
                  </div>
                </div>
              </div>

              {/* Middle Row - Date and Coverage */}
              <div className="flex items-center justify-between w-full">
                <div className="relative [font-family:'Poppins-Regular',Helvetica] font-normal text-gray-600 text-sm">
                  {item.date}
                </div>
                <div className="relative [font-family:'Poppins-Regular',Helvetica] font-normal text-blue-600 text-sm">
                  Coverage: {item.coverage}
                </div>
              </div>

              {/* Bottom Row - Premium and Documents */}
              <div className="flex items-center justify-between w-full">
                <div className="relative [font-family:'Poppins-Regular',Helvetica] font-medium text-black text-sm">
                  Premium: {item.premium}
                </div>
              </div>

              {/* Document buttons */}
              <div className="flex gap-2 mt-2">
                {item.certificateUrl && (
                  <button
                    onClick={() => handleDownloadDocument(item.certificateUrl, `${item.policyNumber}-certificate.pdf`)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 relative rounded-md border border-solid border-[#e3e6ea] hover:bg-gray-50 transition-colors"
                  >
                    <span className="relative [font-family:'Poppins-Regular',Helvetica] font-normal text-gray-700 text-sm">
                      Certificate
                    </span>
                  </button>
                )}
                {item.receiptUrl && (
                  <button
                    onClick={() => handleDownloadDocument(item.receiptUrl, `${item.policyNumber}-receipt.pdf`)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 relative rounded-md border border-solid border-[#e3e6ea] hover:bg-gray-50 transition-colors"
                  >
                    <span className="relative [font-family:'Poppins-Regular',Helvetica] font-normal text-gray-700 text-sm">
                      Receipt
                    </span>
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center w-full py-8 px-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mb-3">
              <span className="text-gray-500">📄</span>
            </div>
            <p className="text-gray-500 text-sm mb-2 text-center">No billing history yet</p>
            <p className="text-gray-400 text-xs text-center">Complete your first policy to see billing history</p>
          </div>
        )}
      </div>
    </div>
  );
};