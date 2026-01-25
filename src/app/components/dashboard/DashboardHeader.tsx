'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Notifications from './Notifications'
import MobileBottomNav from './MobileBottomNav'
import DesktopNav from './DesktopNav'
import ProfileModal from './ProfileModal'
import UserDropdown from './UserDropdown'

interface DashboardHeaderProps {
  userEmail?: string
}

export default function DashboardHeader({ userEmail }: DashboardHeaderProps) {
  const [activeNavItem, setActiveNavItem] = useState('Dashboard')
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const pathname = usePathname()
  
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'New Quote Request',
      message: 'You have a new quote request from Global Shipping Ltd.',
      type: 'info' as const,
      read: false,
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '2',
      title: 'Shipment Update',
      message: 'Your shipment #12345 has been dispatched',
      type: 'success' as const,
      read: false,
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: '3',
      title: 'Document Expiry',
      message: 'Your insurance document expires in 7 days',
      type: 'warning' as const,
      read: true,
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ])
  
  const [unreadCount, setUnreadCount] = useState(0)
  
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length
    setUnreadCount(count)
  }, [notifications])
  
  useEffect(() => {
    const currentPath = pathname.split('/').pop() || 'dashboard'
    const navItem = navItems.find(item => item.id === currentPath)
    if (navItem) {
      setActiveNavItem(navItem.label)
    }
  }, [pathname])
  
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
  }
  
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }
  
  const toggleProfileModal = () => {
    setIsProfileModalOpen(!isProfileModalOpen)
  }
  
  const closeProfileModal = () => {
    setIsProfileModalOpen(false)
  }
  
  const closeUserDropdown = () => {
    setIsUserDropdownOpen(false)
  }
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { id: 'quotes', label: 'Quotes', href: '/quotes', icon: 'quotes' },
    { id: 'policies', label: 'Shipments', href: '/shipments', icon: 'policies' },
    { id: 'documents', label: 'Documents', href: '/documents', icon: 'documents' }
  ]
  
  const handleNavClick = (itemLabel: string) => {
    setActiveNavItem(itemLabel)
  }
  
  const userDisplayName = userEmail?.split('@')[0] || 'User'
  
  return (
    <>
      {/* Fixed width container */}
      <div className="max-w-[88%] sm:max-w-[96%] mx-auto pt-3">
        {/* Header */}
        <header className="flex justify-between items-center h-[68px] mb-0 md:mb-3">
          <div className="flex items-center gap-3">
            <img 
              src="https://c.animaapp.com/mjiggi0jSqvoj5/img/layer-1-1.png" 
              alt="Cargo Guard Logo" 
              className="w-[22px] h-[29px] object-cover"
            />
            {/* Hide text on mobile, show only on desktop */}
            <h2 className="hidden sm:block font-montserrat text-[18px] sm:text-[24px] font-normal text-[#0a3d62]">
              Cargo Guard
            </h2>
          </div>
          
          {/* Desktop Navigation */}
          <DesktopNav 
            navItems={navItems}
            activeNavItem={activeNavItem}
            onNavClick={handleNavClick}
          />
          
          {/* Header Actions */}
          <div className="flex items-center gap-2.5">
            {/* Notifications Button */}
            <div className="relative">
              <button 
                className="w-[44px] h-[44px] sm:w-[54px] sm:h-[54px] bg-[#f7f7f7] rounded-lg border border-white/22 flex items-center justify-center relative cursor-pointer hover:bg-white transition-colors duration-300"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                aria-label="Notifications"
              >
                <img 
                  src="https://c.animaapp.com/mjiggi0jSqvoj5/img/bell-1.png" 
                  alt="Notifications"
                  className="w-[24px]"
                />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#f86464] text-white text-[10px] font-inter font-medium rounded-full flex items-center justify-center px-1">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              <Notifications 
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
              />
            </div>
            
            {/* Desktop User Avatar with Dropdown */}
            <div className="hidden xl:block relative">
              <div 
                className="relative cursor-pointer"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              >
                <img 
                  src="/dashboard/avatar-img.png" 
                  alt="User Avatar"
                  className="w-[54px] h-[54px] rounded-lg object-cover hover:opacity-90 transition-opacity duration-300"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border border-gray-200">
                  <svg 
                    className={`w-3 h-3 text-gray-600 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              <UserDropdown 
                isOpen={isUserDropdownOpen}
                onClose={closeUserDropdown}
                userDisplayName={userDisplayName}
                userEmail={userEmail}
              />
            </div>
            
            {/* Mobile User Avatar - Click opens profile modal */}
            <div className="xl:hidden relative">
              <div 
                className="relative cursor-pointer"
                onClick={toggleProfileModal}
              >
                <img 
                  src="/dashboard/avatar-img.png" 
                  alt="User Avatar"
                  className="w-[44px] h-[44px] rounded-lg object-cover hover:opacity-90 transition-opacity duration-300"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Profile Modal for Mobile */}
        <ProfileModal 
          isOpen={isProfileModalOpen}
          onClose={closeProfileModal}
          userDisplayName={userDisplayName}
          userEmail={userEmail}
        />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        navItems={navItems}
        activeNavItem={activeNavItem}
        onNavClick={handleNavClick}
      />

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        /* Add padding to main content to avoid overlap with bottom nav */
        @media (max-width: 1279px) {
          main {
            padding-bottom: 60px !important;
          }
        }
      `}</style>
    </>
  )
} 