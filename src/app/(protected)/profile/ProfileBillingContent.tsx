'use client'

import { useState, useEffect } from "react";
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/app/context/UserContext';

interface ProfileBillingContentProps {
  profileData: any;
}

export const ProfileBillingContent = ({ profileData }: ProfileBillingContentProps) => {
  const { user } = useUser();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    company_name: '',
    address: '',
  });

  // Initialize form data from profileData
  useEffect(() => {
    if (profileData?.profile) {
      const { profile, policies, payments } = profileData;
      
      // Format payment methods from payments data
      const formattedPaymentMethods = (payments || []).map((payment: any, index: number) => ({
        id: payment.id || `payment-${index}`,
        type: payment.payment_method === 'bank_transfer' ? 'Bank Account' : 'Credit Card',
        lastFourDigits: payment.bank_account_last_four || payment.card_last_four || '••••',
        expiryDate: 'Active',
        isDefault: index === 0,
        bankName: payment.bank_name,
        transactionId: payment.transaction_id,
        amount: payment.amount,
      }));

      // Format billing history from policies and payments
      const formattedBillingHistory = (policies || []).map((policy: any, index: number) => {
        const payment = (payments || []).find((p: any) => p.policy_id === policy.id);
        return {
          id: policy.id,
          invoiceNumber: policy.policy_number || `POL-${index + 1}`,
          date: new Date(policy.created_at).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          projectId: policy.policy_number?.replace('POL-', 'P-') || `P-${index + 1}`,
          amount: `$${policy.premium_amount || 0}`,
          status: policy.status === 'active' ? 'Active' : 'Pending',
          statusColor: policy.status === 'active' ? '#10b981' : '#f59e0b',
          receiptUrl: policy.receipt_url,
          certificateUrl: policy.insurance_certificate_url,
        };
      });

      setFormData({
        full_name: profile.full_name || 'User',
        phone: profile.phone || '',
        email: profile.email || user?.email || '',
        company_name: profile.company_name || '',
        address: profile.address || '',
      });

      setPaymentMethods(formattedPaymentMethods);
      setBillingHistory(formattedBillingHistory);
    }
  }, [profileData, user]);

  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);

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
        console.error('Error updating profile:', error);
        alert('Error updating profile. Please try again.');
      } else {
        alert('Profile updated successfully!');
        setEditMode(false);
        
        // Refresh profile data
        if (profileData) {
          const updatedProfileData = {
            ...profileData,
            profile: {
              ...profileData.profile,
              ...formData,
            }
          };
          // You might want to trigger a refetch here
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    // Note: In real app, you would call API to delete payment method
    // For now, just remove from local state
    setPaymentMethods(paymentMethods.filter(method => method.id !== id));
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
      {/* User Profile Section */}
      <div className="flex flex-col sm:flex-row items-start gap-4 relative self-stretch w-full">
        {/* Profile image with edit button */}
        <div className="relative mb-4 sm:mb-0">
          <div className="relative w-16 h-16 sm:w-[81px] sm:h-[81px] rounded-[8px] border border-[#f3f3f6] bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center overflow-hidden">
            {user?.user_metadata?.avatar_url ? (
              <img
                className="w-full h-full object-cover"
                alt="Profile picture"
                src={user.user_metadata.avatar_url}
              />
            ) : (
              <div className="text-2xl font-semibold text-blue-600">
                {formData.full_name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          {/* Edit button - positioned at bottom right */}
          <button 
            onClick={() => setEditMode(!editMode)}
            className="absolute bottom-0 right-0 flex justify-center items-center w-6 h-6 sm:w-7 sm:h-7 bg-white px-1 sm:px-1.5 py-[0px] rounded-md border-[0.7px] border-solid border-[#EFF4FC] hover:bg-blue-50 transition-colors shadow-sm"
          >
            <img 
              className="w-4 h-4 sm:w-6 sm:h-6" 
              alt="Edit profile"
              src="/profile/pen-01-stroke-rounded.svg"
            />
          </button>
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

      {/* Personal Information Fields */}
      <div className="flex flex-col lg:flex-row items-start justify-between gap-6 relative self-stretch w-full">
        {[
          { 
            id: "fullName", 
            label: "Full Name", 
            value: formData.full_name,
            onChange: (value: string) => setFormData({...formData, full_name: value})
          },
          { 
            id: "phoneNumber", 
            label: "Phone Number", 
            value: formData.phone,
            onChange: (value: string) => setFormData({...formData, phone: value})
          },
          { 
            id: "emailAddress", 
            label: "Email Address", 
            value: formData.email,
            onChange: (value: string) => setFormData({...formData, email: value})
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
                className="flex flex-col h-[38px] items-start justify-center gap-2.5 px-3 py-2 relative self-stretch w-full rounded-[7px] border border-solid border-[#c7c7c782] bg-white [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#7b7b7b] text-base tracking-[0] leading-[18px]"
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

      {editMode && (
        <div className="flex justify-end w-full gap-3">
          <button
            onClick={() => setEditMode(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateProfile}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

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
              onChange: (value: string) => setFormData({...formData, company_name: value})
            },
            { 
              id: "companyAddress", 
              label: "Company Address", 
              value: formData.address,
              onChange: (value: string) => setFormData({...formData, address: value})
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
                  className="flex flex-col h-[38px] items-start justify-center gap-2.5 px-3 py-2 relative self-stretch w-full rounded-[7px] border border-solid border-[#c7c7c782] bg-white [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#7b7b7b] text-base tracking-[0] leading-[18px]"
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

      {/* Payment Methods */}
      <div className="inline-flex flex-col items-start gap-5 relative w-full">
        <div className="flex flex-col sm:flex-row items-start justify-between relative self-stretch w-full gap-4 sm:gap-0">
          <div className="w-full sm:w-[278px] relative h-[43px]">
            <h2 className="absolute top-0 left-0 [font-family:'Montserrat-Medium',Helvetica] font-medium text-black text-lg tracking-[0.36px] leading-[normal]">
              Payment Methods
            </h2>
            <p className="absolute top-7 left-0 [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#c7c7c7] text-xs tracking-[0.24px] leading-[normal]">
              Add or remove payment methods for billing
            </p>
          </div>
          <button className="inline-flex h-[35.68px] items-center justify-center gap-2.5 px-3 py-1.5 relative bg-blue-600 rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto">
            <span className="relative w-fit [font-family:'Poppins-Regular',Helvetica] font-normal text-white text-sm tracking-[0] leading-[18px] whitespace-nowrap">
              Add Payment Method
            </span>
          </button>
        </div>
        
        {paymentMethods.length > 0 ? (
          <div className="flex flex-col lg:flex-row items-start gap-6 relative w-full">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex w-full lg:w-[385px] items-center justify-between p-4 relative rounded-xl border border-dashed border-[#e7e7eb] bg-white hover:border-blue-300 transition-colors">
                <div className="flex flex-col items-start gap-3 relative flex-1 grow">
                  <div className="flex flex-col w-full sm:w-[172px] items-start gap-2 relative">
                    <div className="inline-flex items-center gap-3 relative">
                      <div className="flex flex-col w-12 h-8 items-start gap-2.5 relative">
                        <div className={`w-full h-full rounded flex items-center justify-center ${
                          method.type === 'Bank Account' 
                            ? 'bg-gradient-to-r from-green-100 to-green-50 border border-green-200'
                            : 'bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200'
                        }`}>
                          {method.type === 'Bank Account' ? '🏦' : '💳'}
                        </div>
                      </div>
                      <div className="flex flex-col items-start justify-center relative">
                        <div className="relative w-full h-[17px]">
                          <div className="absolute top-0 left-0 [font-family:'Urbanist-Medium',Helvetica] font-medium text-[#5e5e5e] text-sm tracking-[0]">
                            {method.type} •••• {method.lastFourDigits}
                          </div>
                          {method.isDefault && (
                            <span className="inline-flex items-center justify-center gap-2.5 px-2 py-1 absolute left-[120px] top-[-2px] bg-[#edecf7] rounded-md">
                              <span className="relative w-fit mt-[-1.00px] [font-family:'Urbanist-Medium',Helvetica] font-medium text-[#7b7b7b] text-[10px] tracking-[0]">
                                Default
                              </span>
                            </span>
                          )}
                        </div>
                        <div className="relative [font-family:'Urbanist-Medium',Helvetica] font-medium text-[#7b7b7b] text-xs tracking-[0] mt-1">
                          {method.bankName && `${method.bankName} • `}{method.expiryDate}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeletePaymentMethod(method.id)}
                  className="relative w-5 h-5 aspect-[1] hover:opacity-70 transition-opacity ml-4"
                >
                  <img src="/profile/delete-02-stroke-rounded.svg" alt="Delete" className="w-full h-full" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full py-8 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-3">
              <span className="text-gray-500 text-xl">💳</span>
            </div>
            <p className="text-gray-500 text-sm mb-2">No payment methods added</p>
            <p className="text-gray-400 text-xs">Add a payment method to complete purchases</p>
          </div>
        )}
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

      {/* Billing History Table Header (դեսքթոփի համար) */}
      <div className="hidden lg:block relative w-full h-[18px] mb-4">
        {[
          { label: "Policy Number", left: 0, width: '150px' },
          { label: "Date", left: 160, width: '120px' },
          { label: "Coverage", left: 300, width: '150px' },
          { label: "Premium", left: 470, width: '100px' },
          { label: "Status", left: 590, width: '100px' },
          { label: "Documents", left: 710, width: '150px' },
        ].map((column, index) => (
          <div key={index} className="inline-flex items-center gap-2 absolute top-0" style={{ left: column.left }}>
            <div className="relative w-fit mt-[-1.00px] [font-family:'Poppins-Regular',Helvetica] font-normal text-[#606068] text-sm tracking-[0] leading-[18px] whitespace-nowrap">
              {column.label}
            </div>
          </div>
        ))}
      </div>

      {/* Billing History Items - դեսքթոփ տեսք */}
      <div className="hidden lg:flex flex-col w-full items-start gap-2 relative">
        {billingHistory.length > 0 ? (
          billingHistory.map((item) => (
            <div key={item.id} className="border-t border-[#EFF1F3] pt-1 relative w-full h-14 bg-white hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex w-full items-center justify-between relative top-2 left-4">
                <div className="relative w-[150px] [font-family:'Poppins-Regular',Helvetica] font-normal text-black text-sm tracking-[0] leading-[18px]">
                  {item.invoiceNumber}
                </div>
                <div className="relative w-[120px] [font-family:'Poppins-Regular',Helvetica] font-normal text-black text-sm tracking-[0] leading-[18px]">
                  {item.date}
                </div>
                <div className="relative w-[150px] h-[21px] [font-family:'Poppins-Regular',Helvetica] font-normal text-blue-600 text-sm tracking-[0] leading-[18px]">
                  {item.projectId}
                </div>
                <div className="relative w-[100px] [font-family:'Poppins-Regular',Helvetica] font-normal text-[#030303] text-sm tracking-[0] leading-[18px] font-medium">
                  {item.amount}
                </div>
                <div className="inline-flex items-center justify-center gap-1.5 px-2 py-1 relative rounded-[37px] bg-green-50">
                  <div className="relative w-2 h-2 rounded-full" style={{ backgroundColor: item.statusColor }} />
                  <div className="relative w-fit [font-family:'Poppins-Regular',Helvetica] font-normal text-xs tracking-[0] leading-[18px] whitespace-nowrap" style={{ color: item.statusColor }}>
                    {item.status}
                  </div>
                </div>
                <div className="flex gap-2">
                  {item.certificateUrl && (
                    <button
                      onClick={() => handleDownloadDocument(item.certificateUrl, `${item.invoiceNumber}-certificate.pdf`)}
                      className="flex items-center justify-center gap-2 px-3 py-1.5 relative rounded-md border border-solid border-[#e3e6ea] hover:bg-gray-50 transition-colors"
                    >
                      <span className="relative w-fit [font-family:'Poppins-Regular',Helvetica] font-normal text-gray-700 text-sm tracking-[0] leading-[18px] whitespace-nowrap">
                        Certificate
                      </span>
                    </button>
                  )}
                  {item.receiptUrl && (
                    <button
                      onClick={() => handleDownloadDocument(item.receiptUrl, `${item.invoiceNumber}-receipt.pdf`)}
                      className="flex items-center justify-center gap-2 px-3 py-1.5 relative rounded-md border border-solid border-[#e3e6ea] hover:bg-gray-50 transition-colors"
                    >
                      <span className="relative w-fit [font-family:'Poppins-Regular',Helvetica] font-normal text-gray-700 text-sm tracking-[0] leading-[18px] whitespace-nowrap">
                        Receipt
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center w-full py-8 rounded-xl border border-dashed border-gray-300 bg-gray-50">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-3">
              <span className="text-gray-500 text-xl">📄</span>
            </div>
            <p className="text-gray-500 text-sm mb-2">No billing history yet</p>
            <p className="text-gray-400 text-xs">Your billing history will appear here after your first policy</p>
          </div>
        )}
      </div>

      {/* Billing History Items - մոբայլ տեսք */}
      <div className="lg:hidden flex flex-col w-full items-start gap-4 relative">
        {billingHistory.length > 0 ? (
          billingHistory.map((item) => (
            <div key={item.id} className="flex flex-col w-full p-4 relative bg-white rounded-xl border border-gray-200 gap-3 hover:border-blue-300 transition-colors">
              {/* Վերին մաս - Policy Number և ստատուսը */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="relative [font-family:'Poppins-Regular',Helvetica] font-medium text-black text-sm tracking-[0]">
                    {item.invoiceNumber}
                  </div>
                  <div className="text-gray-400">|</div>
                  <div className="relative [font-family:'Poppins-Regular',Helvetica] font-normal text-blue-600 text-sm tracking-[0]">
                    {item.projectId}
                  </div>
                </div>
                <div className="inline-flex items-center justify-center gap-1.5 px-2 py-1 relative rounded-[37px] bg-green-50">
                  <div className="relative w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.statusColor }} />
                  <div className="relative w-fit [font-family:'Poppins-Regular',Helvetica] font-normal text-xs tracking-[0]" style={{ color: item.statusColor }}>
                    {item.status}
                  </div>
                </div>
              </div>

              {/* Ներքևի մաս - ամսաթիվ և գումար */}
              <div className="flex items-center justify-between w-full">
                <div className="relative [font-family:'Poppins-Regular',Helvetica] font-normal text-gray-600 text-sm tracking-[0]">
                  {item.date}
                </div>
                <div className="relative [font-family:'Poppins-Regular',Helvetica] font-medium text-black text-sm tracking-[0]">
                  {item.amount}
                </div>
              </div>

              {/* Document buttons */}
              <div className="flex gap-2 mt-2">
                {item.certificateUrl && (
                  <button
                    onClick={() => handleDownloadDocument(item.certificateUrl, `${item.invoiceNumber}-certificate.pdf`)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 relative rounded-md border border-solid border-[#e3e6ea] hover:bg-gray-50 transition-colors"
                  >
                    <span className="relative w-fit [font-family:'Poppins-Regular',Helvetica] font-normal text-gray-700 text-sm tracking-[0]">
                      Certificate
                    </span>
                  </button>
                )}
                {item.receiptUrl && (
                  <button
                    onClick={() => handleDownloadDocument(item.receiptUrl, `${item.invoiceNumber}-receipt.pdf`)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 relative rounded-md border border-solid border-[#e3e6ea] hover:bg-gray-50 transition-colors"
                  >
                    <span className="relative w-fit [font-family:'Poppins-Regular',Helvetica] font-normal text-gray-700 text-sm tracking-[0]">
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