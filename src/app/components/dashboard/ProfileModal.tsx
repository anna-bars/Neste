'use client'

import Link from 'next/link'
import LogoutButton from './LogoutButton'
import type { Profile } from './DashboardHeader' // Import Profile type

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  userDisplayName: string
  userEmail?: string
  profile?: Profile | null
}

export default function ProfileModal({ 
  isOpen, 
  onClose, 
  userDisplayName, 
  userEmail,
  profile 
}: ProfileModalProps) {
  if (!isOpen) return null
  
  // Օգտագործեք profile-ից avatar_url-ը
  const avatarUrl = profile?.avatar_url || '/dashboard/avatar-img.png'
  
  return (
    <div className="fixed inset-0 z-[9999] transition-opacity duration-300">
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-5 transition-transform duration-300 animate-slideUp">
        <div className="flex justify-end mb-6">
          <button 
            className="w-[44px] h-[44px] bg-[#f7f7f7] rounded-lg border border-white/22 flex items-center justify-center cursor-pointer text-2xl text-black hover:bg-gray-100 transition-colors duration-300"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div className="flex items-center gap-3 mb-6 p-4 bg-[#f7f7f7] rounded-lg">
          <img 
            src={avatarUrl}
            alt="User Avatar"
            className="w-12 h-12 rounded-lg object-cover"
            onError={(e) => {
              e.currentTarget.src = '/dashboard/avatar-img.png'
            }}
          />
          <div>
            <div className="font-inter text-base font-medium text-black">
              {userDisplayName}
            </div>
            <div className="font-inter text-sm text-gray-600 truncate max-w-[200px]">
              {userEmail || 'user@example.com'}
            </div>
          </div>
        </div>
        
        <Link 
          href="/profile"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-gray-100 transition-colors duration-300 cursor-pointer mb-3 no-underline"
        >
          <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-inter text-base font-medium text-gray-800">Profile Setting</span>
        </Link>
        
        <div onClick={onClose}>
          <LogoutButton mobileVersion />
        </div>
      </div>
    </div>
  )
}