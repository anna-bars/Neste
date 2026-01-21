'use client'

import { ProfileTab } from './page'
import { ProfileBillingContent } from './ProfileBillingContent'
import { SecurityContent } from './SecurityContent'

interface ProfileContentSectionProps {
  activeTab: ProfileTab
  onTabChange: (tab: ProfileTab) => void
}

export const ProfileContentSection = ({ activeTab, onTabChange }: ProfileContentSectionProps) => {
  return (
    <>
      {/* Մոբայլ նավիգացիա */}
      <div className="w-full mb-6 sm:hidden">
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => onTabChange('profile')}
            className={`flex-1 px-4 py-3 text-center rounded-lg transition-colors [font-family:'Montserrat-Regular',Helvetica] text-sm font-medium ${
              activeTab === 'profile'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            My Profile & Billing
          </button>
          
          <button
            onClick={() => onTabChange('security')}
            className={`flex-1 px-4 py-3 text-center rounded-lg transition-colors [font-family:'Montserrat-Regular',Helvetica] text-sm font-medium ${
              activeTab === 'security'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Security
          </button>
        </div>
      </div>

      {/* Դեսքթոփ դասավորություն */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Ձախ կողմ - նավիգացիա (դեսքթոփի համար) */}
        <div className="hidden lg:block w-full lg:w-[16%] lg:min-w-[300px]">
          <div className="rounded-2xl sticky top-8">
            <div className="space-y-2">
              <button
                onClick={() => onTabChange('profile')}
                className={`flex justify-between items-center self-stretch w-full h-[43px] px-9 py-2.5 rounded-xl border border-solid border-[#FAFBFD] transition-colors [font-family:'Montserrat-Regular',Helvetica] text-sm ${
                  activeTab === 'profile'
                    ? 'bg-white'
                    : 'bg-[#f8fafd]'
                }`}
              >
                <span className="font-normal text-[16px] text-black">
                  My Profile & Billing
                </span>
              </button>
              
              <button
                onClick={() => onTabChange('security')}
                className={`flex justify-between items-center self-stretch w-full h-[43px] px-9 py-2.5 rounded-xl border border-solid border-[#FAFBFD] transition-colors [font-family:'Montserrat-Regular',Helvetica] text-sm ${
                  activeTab === 'security'
                    ? 'bg-white'
                    : 'bg-[#f8fafd]'
                }`}
              >
                <span className="font-normal text-[16px] text-black">
                  Security
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Աջ կողմ - պարունակություն */}
        <div className="w-full lg:w-[84%]">
          {activeTab === 'profile' ? <ProfileBillingContent /> : <SecurityContent />}
        </div>
      </div>
    </>
  )
}