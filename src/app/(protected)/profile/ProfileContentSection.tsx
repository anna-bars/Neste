'use client'

import { ProfileTab } from './page'
import { ProfileBillingContent } from './ProfileBillingContent'
import { SecurityContent } from './SecurityContent'

interface ProfileContentSectionProps {
  activeTab: ProfileTab
  onTabChange: (tab: ProfileTab) => void
  profileData: any
}

export const ProfileContentSection = ({ 
  activeTab, 
  onTabChange, 
  profileData 
}: ProfileContentSectionProps) => {
  return (
    <>
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

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div className="hidden lg:block w-full lg:w-[23%] lg:min-w-[300px]">
          <div className="rounded-2xl sticky top-8">
            <div className="space-y-2">
              <button
                onClick={() => onTabChange('profile')}
                className={`flex justify-between items-center self-stretch w-full h-[43px] px-9 py-2.5 rounded-xl border border-solid border-[#FAFBFD] transition-colors [font-family:'Montserrat-Regular',Helvetica] text-sm ${
                  activeTab === 'profile'
                    ? 'bg-white shadow-sm'
                    : 'bg-[#f8fafd] hover:bg-gray-50'
                }`}
              >
                <span className={`font-normal text-[16px] ${
                  activeTab === 'profile' ? 'text-blue-600' : 'text-black'
                }`}>
                  My Profile & Billing
                </span>
                {activeTab === 'profile' && (
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                )}
              </button>
              
              <button
                onClick={() => onTabChange('security')}
                className={`flex justify-between items-center self-stretch w-full h-[43px] px-9 py-2.5 rounded-xl border border-solid border-[#FAFBFD] transition-colors [font-family:'Montserrat-Regular',Helvetica] text-sm ${
                  activeTab === 'security'
                    ? 'bg-white shadow-sm'
                    : 'bg-[#f8fafd] hover:bg-gray-50'
                }`}
              >
                <span className={`font-normal text-[16px] ${
                  activeTab === 'security' ? 'text-blue-600' : 'text-black'
                }`}>
                  Security
                </span>
                {activeTab === 'security' && (
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[77%]">
          {activeTab === 'profile' ? (
            <ProfileBillingContent profileData={profileData} />
          ) : (
            <SecurityContent />
          )}
        </div>
      </div>
    </>
  )
}