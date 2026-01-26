'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import LogoutButton from './LogoutButton'
import type { Profile } from './DashboardHeader' // Import Profile type

interface UserDropdownProps {
  isOpen: boolean
  onClose: () => void
  userDisplayName: string
  userEmail?: string
  profile?: Profile | null
}

export default function UserDropdown({ 
  isOpen, 
  onClose, 
  userDisplayName, 
  userEmail,
  profile 
}: UserDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])
  
  if (!isOpen) return null
  
  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-2"
      style={{ 
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
        borderRadius: '12px'
      }}
    >
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="font-inter text-sm font-medium text-gray-900">
          {userDisplayName}
        </div>
        <div className="font-inter text-xs text-gray-500 truncate">
          {userEmail || 'user@example.com'}
        </div>
      </div>
      
      <Link 
        href="/profile"
        onClick={onClose}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors duration-200 text-left no-underline"
      >
        <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="font-inter text-sm font-medium text-gray-800">Profile Setting</span>
      </Link>
      
      <div className="border-t border-gray-100">
        <LogoutButton desktopVersion />
      </div>
    </div>
  )
}