'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Notifications from './Notifications'
import MobileBottomNav from './MobileBottomNav'
import DesktopNav from './DesktopNav'
import ProfileModal from './ProfileModal'
import UserDropdown from './UserDropdown'
import { createClient } from '@/lib/supabase/client' // Օգտագործեք Ձեր ստորագրությունը

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  email: string | null
  company_name: string | null
  phone: string | null
  address: string | null
  created_at: string
  updated_at: string
}

interface DashboardHeaderProps {
  userEmail?: string
  userId?: string
}

export default function DashboardHeader({ userEmail, userId }: DashboardHeaderProps) {
  const [activeNavItem, setActiveNavItem] = useState('Dashboard')
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string>('/dashboard/avatar-img.png')
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  
  // Ստեղծել Supabase կլիենտ
  const supabase = createClient()
  
  // Թարմացնենք notifications-ը
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
  
  // Fetch user profile from Supabase
  useEffect(() => {
    async function fetchProfile() {
      if (!userId) {
        setIsLoading(false)
        return
      }
      
      try {
        setIsLoading(true)
        
        // Ֆետչ անել profile-ը user_id-ի հիման վրա
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (error) {
          console.error('Error fetching profile:', error)
          
          // Եթե error է, փորձել ստանալ auth user-ից
          const { data: authData } = await supabase.auth.getUser()
          if (authData.user) {
            // Ստեղծել պարզ profile օբյեկտ auth տվյալներից
            const basicProfile: Profile = {
              id: authData.user.id,
              full_name: authData.user.user_metadata?.full_name || null,
              avatar_url: authData.user.user_metadata?.avatar_url || null,
              email: authData.user.email || null,
              company_name: null,
              phone: null,
              address: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            setProfile(basicProfile)
            
            // Սահմանել avatar_url
            if (authData.user.user_metadata?.avatar_url) {
              setAvatarUrl(authData.user.user_metadata.avatar_url)
            }
          }
        } else if (data) {
          setProfile(data)
          
          // Սահմանել avatar_url եթե կա
          if (data.avatar_url) {
            setAvatarUrl(data.avatar_url)
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProfile()
  }, [userId, supabase])
  
  // Subscribe to profile changes for real-time updates
  useEffect(() => {
    if (!userId) return
    
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload: any) => { // Ավելացրեք any type
          const updatedProfile = payload.new as Profile
          setProfile(updatedProfile)
          
          // Update avatar if changed
          if (updatedProfile.avatar_url) {
            setAvatarUrl(updatedProfile.avatar_url)
          }
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])
  
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length
    setUnreadCount(count)
  }, [notifications])
  
  useEffect(() => {
    if (pathname === '/dashboard') {
      setActiveNavItem('Dashboard')
    } else if (pathname === '/quotes') {
      setActiveNavItem('Quotes')
    } else if (pathname === '/shipments') {
      setActiveNavItem('Shipments')
    } else if (pathname === '/documents') {
      setActiveNavItem('Documents')
    } else if (pathname.includes('/shipments')) {
      setActiveNavItem('Shipments')
    } else if (pathname.includes('/quotes')) {
      setActiveNavItem('Quotes')
    } else if (pathname.includes('/documents')) {
      setActiveNavItem('Documents')
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
    { id: 'shipments', label: 'Shipments', href: '/shipments', icon: 'policies' },
    { id: 'documents', label: 'Documents', href: '/documents', icon: 'documents' }
  ]
  
  const handleNavClick = (itemLabel: string) => {
    setActiveNavItem(itemLabel)
  }
  
  const userDisplayName = profile?.full_name || userEmail?.split('@')[0] || 'User'
  const displayEmail = profile?.email || userEmail || ''

  const handleAvatarError = () => {
    setAvatarUrl('/dashboard/avatar-img.png')
  }
  
  return (
    <>
      <div className="max-w-[88%] sm:max-w-[96%] mx-auto pt-3">
        <header className="flex justify-between items-center h-[68px] mb-0 md:mb-3">
          <div className="flex items-center gap-3">
            <img 
              src="https://c.animaapp.com/mjiggi0jSqvoj5/img/layer-1-1.png" 
              alt="Cargo Guard Logo" 
              className="w-[22px] h-[29px] object-cover"
            />
            <h2 className="hidden sm:block font-montserrat text-[18px] sm:text-[24px] font-normal text-[#0a3d62]">
              Cargo Guard
            </h2>
          </div>
          
          <DesktopNav 
            navItems={navItems}
            activeNavItem={activeNavItem}
            onNavClick={handleNavClick}
          />
          
          <div className="flex items-center gap-2.5">
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
            
            <div className="hidden xl:block relative">
              <div 
                className="relative cursor-pointer"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              >
                {isLoading ? (
                  <div className="w-[54px] h-[54px] rounded-lg bg-gray-200 animate-pulse flex items-center justify-center">
                    <span className="text-gray-400 text-sm">...</span>
                  </div>
                ) : (
                  <>
                    <img 
                      src={avatarUrl}
                      alt="User Avatar"
                      className="w-[54px] h-[54px] rounded-lg object-cover hover:opacity-90 transition-opacity duration-300"
                      onError={handleAvatarError}
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
                  </>
                )}
              </div>
              
              <UserDropdown 
                isOpen={isUserDropdownOpen}
                onClose={closeUserDropdown}
                userDisplayName={userDisplayName}
                userEmail={displayEmail}
                profile={profile}
              />
            </div>
            
            <div className="xl:hidden relative">
              <div 
                className="relative cursor-pointer"
                onClick={toggleProfileModal}
              >
                {isLoading ? (
                  <div className="w-[44px] h-[44px] rounded-lg bg-gray-200 animate-pulse flex items-center justify-center">
                    <span className="text-gray-400 text-xs">...</span>
                  </div>
                ) : (
                  <img 
                    src={avatarUrl}
                    alt="User Avatar"
                    className="w-[44px] h-[44px] rounded-lg object-cover hover:opacity-90 transition-opacity duration-300"
                    onError={handleAvatarError}
                  />
                )}
              </div>
            </div>
          </div>
        </header>

        <ProfileModal 
          isOpen={isProfileModalOpen}
          onClose={closeProfileModal}
          userDisplayName={userDisplayName}
          userEmail={displayEmail}
          profile={profile}
        />
      </div>

      <MobileBottomNav 
        navItems={navItems}
        activeNavItem={activeNavItem}
        onNavClick={handleNavClick}
      />

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
        
        @media (max-width: 1279px) {
          main {
            padding-bottom: 60px !important;
          }
        }
      `}</style>
    </>
  )
}