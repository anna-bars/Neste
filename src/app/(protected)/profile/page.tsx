'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '../DashboardLayout'
import { ProfileNavigationSection } from './ProfileNavigationSection'
import { ProfileContentSection } from './ProfileContentSection'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/app/context/UserContext'
import { User } from '@supabase/supabase-js'

export type ProfileTab = 'profile' | 'security'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile')
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  
  const { user } = useUser()
  const supabase = createClient()

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // 1. Load profile from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error loading profile:', profileError)
        }

        // 2. Load user's policies
        const { data: policies, error: policiesError } = await supabase
          .from('policies')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (policiesError) {
          console.error('Error loading policies:', policiesError)
        }

        // 3. Load user's payment history
        const { data: payments, error: paymentsError } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (paymentsError) {
          console.error('Error loading payments:', paymentsError)
        }

        setProfileData({
          profile: profile || {},
          policies: policies || [],
          payments: payments || []
        })

      } catch (error) {
        console.error('Error loading profile data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfileData()
  }, [user, supabase])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#778B8E]"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="bg-[#f3f3f6] w-full min-h-screen">
        <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
          {/* Վերին բաժինը */}
          <ProfileNavigationSection />
          
          {/* Հիմնական բաժինը */}
          <div className="mt-6 sm:mt-8 lg:mt-12">
            <ProfileContentSection 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
              profileData={profileData}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}