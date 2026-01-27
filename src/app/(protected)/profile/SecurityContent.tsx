'use client'

import { useState } from "react";
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/app/context/UserContext';

export const SecurityContent = () => {
  const { user } = useUser();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Password updated successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        
        // Sign out from all sessions after password change
        setTimeout(() => {
          supabase.auth.signOut();
        }, 2000);
      }
    } catch (error: any) {
      setError(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    try {
      // Note: In production, you should implement proper account deletion
      // This might involve deleting from profiles table first, then auth.users
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        alert("Error signing out: " + error.message);
        return;
      }

      alert("Account deletion request sent. You will be redirected.");
      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("An error occurred while deleting account.");
    }
  };

  return (
    <div className="flex flex-col w-full items-start gap-6 p-4 sm:p-6 relative bg-[#fbfbf6] rounded-2xl border border-[#e5e7eb]">
      <div className="inline-flex flex-col items-start gap-5 relative w-full">
        <div className="flex flex-col sm:flex-row items-start justify-between relative self-stretch w-full gap-4">
          <div className="w-full sm:w-[278px] relative h-[43px]">
            <h2 className="absolute top-0 left-0 [font-family:'Montserrat-Medium',Helvetica] font-medium text-black text-lg tracking-[0.36px] leading-[normal]">
              Change Password
            </h2>
            <p className="absolute top-7 left-0 [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#c7c7c7] text-xs tracking-[0.24px] leading-[normal]">
              Update your password regularly to keep your account secure
            </p>
          </div>
          <button
            onClick={handleChangePassword}
            disabled={loading}
            className="inline-flex h-[35.68px] items-center justify-center gap-2.5 px-3 py-1.5 relative bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            <span className="relative w-fit [font-family:'Poppins-Regular',Helvetica] font-normal text-white text-sm tracking-[0] leading-[18px] whitespace-nowrap">
              {loading ? "Updating..." : "Update Password"}
            </span>
          </button>
        </div>

        {error && (
          <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="w-full p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm">{success}</p>
            <p className="text-green-500 text-xs mt-1">You will be signed out in a few seconds...</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row items-start gap-6 relative w-full">
          {[
            {
              id: "currentPassword",
              label: "Current Password",
              value: passwordForm.currentPassword,
              onChange: (value: string) => setPasswordForm({...passwordForm, currentPassword: value}),
              placeholder: "Enter current password",
            },
            {
              id: "newPassword",
              label: "New Password",
              value: passwordForm.newPassword,
              onChange: (value: string) => setPasswordForm({...passwordForm, newPassword: value}),
              placeholder: "Enter new password (min 6 characters)",
            },
            {
              id: "confirmPassword",
              label: "Confirm New Password",
              value: passwordForm.confirmPassword,
              onChange: (value: string) => setPasswordForm({...passwordForm, confirmPassword: value}),
              placeholder: "Confirm new password",
            },
          ].map((field) => (
            <div key={field.id} className="flex flex-col w-full lg:w-[385px] items-start gap-2 relative">
              <label className="relative w-fit mt-[-1.00px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#4f4f4f] text-sm tracking-[0] leading-[18px] whitespace-nowrap">
                {field.label}
              </label>
              <div className="flex flex-col h-[38px] items-start justify-center gap-2.5 px-3 py-2 relative self-stretch w-full rounded-[7px] border border-solid border-[#c7c7c782] bg-white">
                <input
                  type="password"
                  id={field.id}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={field.placeholder}
                  className="relative w-full mt-[-1.00px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#7b7b7b] text-base tracking-[0] leading-[18px] bg-transparent border-none outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative self-stretch w-full h-px bg-gray-200" />

      <div className="inline-flex flex-col items-start gap-5 relative w-full">
        <div className="flex flex-col sm:flex-row items-start justify-between relative self-stretch w-full gap-4">
          <div className="w-full sm:w-[278px] relative h-[43px]">
            <h2 className="absolute top-0 left-0 [font-family:'Montserrat-Medium',Helvetica] font-medium text-black text-lg tracking-[0.36px] leading-[normal]">
              Active Sessions
            </h2>
            <p className="absolute top-7 left-0 [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#c7c7c7] text-xs tracking-[0.24px] leading-[normal]">
              Manage your login sessions across devices
            </p>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="inline-flex h-[35.68px] items-center justify-center gap-2.5 px-3 py-1.5 relative rounded-md border border-solid border-gray-300 hover:bg-gray-50 transition-colors w-full sm:w-auto"
          >
            <span className="relative w-fit [font-family:'Poppins-Regular',Helvetica] font-normal text-gray-700 text-sm tracking-[0] leading-[18px] whitespace-nowrap">
              Sign Out All Devices
            </span>
          </button>
        </div>

        <div className="flex flex-col w-full items-start gap-4 relative">
          <div className="inline-flex items-start gap-2.5 p-4 relative self-stretch w-full rounded-[7px] bg-blue-50 border border-solid border-blue-100">
            <div className="relative w-5 h-5">⚡</div>
            <p className="relative flex-1 mt-[-1.00px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-blue-700 text-sm tracking-[0] leading-[18px]">
              You are currently signed in. Signing out will require you to log in again on this device.
            </p>
          </div>
        </div>
      </div>

      <div className="relative self-stretch w-full h-px bg-gray-200" />

      <div className="inline-flex flex-col items-start gap-5 relative self-stretch w-full p-4 sm:p-6 rounded-lg border border-solid border-red-200 bg-red-50">
        <div className="flex flex-col sm:flex-row items-start justify-between relative self-stretch w-full gap-4">
          <div className="w-full sm:w-[278px] relative h-[43px]">
            <h2 className="absolute top-0 left-0 [font-family:'Montserrat-Medium',Helvetica] font-medium text-red-900 text-lg tracking-[0.36px] leading-[normal]">
              Delete Account
            </h2>
            <p className="absolute top-7 left-0 [font-family:'Montserrat-Regular',Helvetica] font-normal text-red-600 text-xs tracking-[0.24px] leading-[normal]">
              Permanently delete your account and all data. This action cannot be undone.
            </p>
          </div>
          <button
            onClick={handleDeleteAccount}
            className="inline-flex h-[35.68px] items-center justify-center gap-2.5 px-3 py-1.5 relative bg-red-600 rounded-md hover:bg-red-700 transition-colors w-full sm:w-auto"
          >
            <span className="relative w-fit [font-family:'Poppins-Regular',Helvetica] font-normal text-white text-sm tracking-[0] leading-[18px] whitespace-nowrap">
              Delete Account
            </span>
          </button>
        </div>
        
        <div className="inline-flex items-start gap-2.5 p-3 relative self-stretch w-full rounded-[7px] bg-white border border-solid border-red-100">
          <div className="relative w-5 h-5 text-red-500">⚠️</div>
          <p className="relative flex-1 mt-[-1.00px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-red-700 text-sm tracking-[0] leading-[18px]">
            Warning: This will permanently delete your account, all policies, quotes, and billing information. You will lose access to all documents and certificates associated with your account.
          </p>
        </div>
      </div>
    </div>
  );
};