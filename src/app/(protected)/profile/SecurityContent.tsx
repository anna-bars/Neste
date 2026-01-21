import { useState } from "react";

export const SecurityContent = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const sessions = [
    {
      id: "1",
      device: "Chrome on Windows",
      location: "Gyumri, Armenia",
      lastActive: "5 minutes ago",
      isCurrent: true,
      icon: "🌐",
    },
    {
      id: "2",
      device: "Safari on iPhone",
      location: "Amsterdam, Netherlands",
      lastActive: "2 days ago",
      isCurrent: false,
      icon: "📱",
    },
  ];

  const handleSignOut = (id: string) => {
    console.log(`Sign out session ${id}`);
  };

  const handleSignOutAll = () => {
    console.log("Sign out all devices");
  };

  const handleDeleteAccount = () => {
    console.log("Delete account clicked");
  };

  const handleChangePassword = () => {
    console.log("Change password clicked");
  };

  return (
    <div className="flex flex-col w-full items-start gap-6 p-4 sm:p-6 relative bg-[#fbfbf6] rounded-2xl">
      {/* Change Password Section */}
      <div className="inline-flex flex-col items-start gap-5 relative w-full">
        <div className="flex flex-col sm:flex-row items-start justify-between relative self-stretch w-full gap-4">
          <div className="w-full sm:w-[278px] relative h-[43px]">
            <h2 className="absolute top-0 left-0 [font-family:'Montserrat-Medium',Helvetica] font-medium text-black text-lg tracking-[0.36px] leading-[normal]">
              Change Password
            </h2>
            <p className="absolute top-7 mb-3 left-0 [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#c7c7c7] text-xs tracking-[0.24px] leading-[normal]">
              Update your password regularly to keep your account secure
            </p>
          </div>
          <button
            onClick={handleChangePassword}
            className="inline-flex h-[35.68px] items-center justify-center gap-2.5 px-3 py-1.5 relative bg-blue-600 rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            <span className="relative w-fit [font-family:'Poppins-Regular',Helvetica] font-normal text-white text-sm tracking-[0] leading-[18px] whitespace-nowrap">
              Change Password
            </span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-6 relative w-full mt-4">
          {[
            {
              id: "currentPassword",
              label: "Current Password",
              value: currentPassword,
              setter: setCurrentPassword,
              placeholder: "Enter current password",
            },
            {
              id: "newPassword",
              label: "New Password",
              value: newPassword,
              setter: setNewPassword,
              placeholder: "Enter new password",
            },
            {
              id: "confirmPassword",
              label: "Confirm New Password",
              value: confirmPassword,
              setter: setConfirmPassword,
              placeholder: "Confirm new password",
            },
          ].map((field) => (
            <div key={field.id} className="flex flex-col w-full lg:w-[385px] items-start gap-2 relative">
              <label className="relative w-fit mt-[-1.00px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#4f4f4f] text-sm tracking-[0] leading-[18px] whitespace-nowrap">
                {field.label}
              </label>
              <div className="flex flex-col h-[38px] items-start justify-center gap-2.5 px-3 py-2 relative self-stretch w-full rounded-[7px] border border-solid border-[#c7c7c782]">
                <input
                  type="password"
                  id={field.id}
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  placeholder={field.placeholder}
                  className="relative w-full mt-[-1.00px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#7b7b7b] text-base tracking-[0] leading-[18px] bg-transparent border-none outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative self-stretch w-full h-px bg-gray-200" />

      {/* Two-Factor Authentication */}
      <div className="inline-flex flex-col items-start gap-5 relative w-full">
        <div className="flex flex-col sm:flex-row items-start justify-between relative self-stretch w-full gap-4">
          <div className="w-full sm:w-[278px] relative h-[43px]">
            <h2 className="absolute top-0 left-0 [font-family:'Montserrat-Medium',Helvetica] font-medium text-black text-lg tracking-[0.36px] leading-[normal]">
              Two-Factor Authentication
            </h2>
            <p className="absolute top-7 left-0 [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#c7c7c7] text-xs tracking-[0.24px] leading-[normal]">
              Add an extra layer of security to your account
            </p>
          </div>
          <div className="flex items-center gap-3 self-start">
            <span className="relative w-fit [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#606068] text-sm tracking-[0] leading-[18px] whitespace-nowrap">
              {is2FAEnabled ? "Enabled" : "Disabled"}
            </span>
            <div
              onClick={() => setIs2FAEnabled(!is2FAEnabled)}
              className={`w-12 h-6 rounded-full cursor-pointer relative transition-colors ${is2FAEnabled ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <div
                className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-all ${is2FAEnabled ? "right-1" : "left-1"}`}
              />
            </div>
          </div>
        </div>

        {is2FAEnabled && (
          <div className="inline-flex items-start gap-2.5 p-4 relative self-stretch w-full rounded-[7px] bg-blue-50 border border-solid border-blue-100">
            <div className="relative w-5 h-5">⚡</div>
            <p className="relative flex-1 mt-[-1.00px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-blue-700 text-sm tracking-[0] leading-[18px]">
              Two-factor authentication is currently active. You'll need to verify your identity using your authenticator app when signing in from new devices.
            </p>
          </div>
        )}
      </div>

      <div className="relative self-stretch w-full h-px bg-gray-200" />

      {/* Active Sessions */}
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
            onClick={handleSignOutAll}
            className="inline-flex h-[35.68px] items-center justify-center gap-2.5 px-3 py-1.5 relative rounded-md border border-solid border-gray-300 hover:bg-gray-50 transition-colors w-full sm:w-auto"
          >
            <span className="relative w-fit [font-family:'Poppins-Regular',Helvetica] font-normal text-gray-700 text-sm tracking-[0] leading-[18px] whitespace-nowrap">
              Sign Out All Devices
            </span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-4 relative self-stretch w-full">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`flex flex-col w-full lg:w-[582px] items-start justify-center p-4 sm:p-6 relative rounded-lg border border-solid ${session.isCurrent ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-gray-50 opacity-70"}`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between relative self-stretch w-full gap-4">
                <div className="inline-flex items-center gap-4 relative flex-[0_0_auto]">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${session.isCurrent ? "bg-blue-100" : "bg-gray-100"}`}>
                    <span className={`${session.isCurrent ? "text-blue-600" : "text-gray-400"}`}>
                      {session.icon}
                    </span>
                  </div>
                  <div className="inline-flex flex-col items-start relative">
                    <div className={`relative w-fit [font-family:'Montserrat-Regular',Helvetica] font-normal ${session.isCurrent ? "text-black" : "text-gray-500"} text-base tracking-[0] leading-[normal]`}>
                      {session.device}
                    </div>
                    <div className="relative w-fit [font-family:'Montserrat-Regular',Helvetica] font-normal text-gray-400 text-sm tracking-[0] leading-[normal]">
                      {session.location} – Last active: {session.lastActive}
                    </div>
                  </div>
                </div>
                <div className="inline-flex items-center gap-3 relative flex-[0_0_auto]">
                  {session.isCurrent && (
                    <span className="inline-flex items-center justify-center gap-2.5 px-2 py-1 relative bg-green-100 rounded-[37px]">
                      <div className="relative w-1.5 h-1.5 bg-green-500 rounded-[3px]" />
                      <div className="relative w-fit [font-family:'Poppins-Regular',Helvetica] font-normal text-green-800 text-xs tracking-[0] leading-[normal] whitespace-nowrap">
                        Current
                      </div>
                    </span>
                  )}
                  <button
                    onClick={() => handleSignOut(session.id)}
                    className={`inline-flex h-[35.68px] items-center justify-center gap-2.5 px-3 py-1.5 relative rounded-md border border-solid ${session.isCurrent ? "border-red-300 text-red-600 hover:bg-red-50" : "border-gray-300 text-gray-600 hover:bg-gray-50"} transition-colors w-full sm:w-auto`}
                  >
                    <span className="relative w-fit [font-family:'Poppins-Regular',Helvetica] font-normal text-sm tracking-[0] leading-[18px] whitespace-nowrap">
                      Sign Out
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative self-stretch w-full h-px bg-gray-200" />

      {/* Delete Account */}
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
      </div>
    </div>
  );
};