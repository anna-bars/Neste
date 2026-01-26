'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { redirect, usePathname } from 'next/navigation'
import DashboardHeader from '../components/dashboard/DashboardHeader'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        redirect('/login')
      }
      
      setUser(user)
      setLoading(false)
    }

    fetchUser()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a3d62]"></div>
      </div>
    )
  }

  // Ստուգել, թե որ էջում ենք
  const isProfilePage = pathname?.includes('/profile')
  const isDocumentsPage = pathname?.includes('/documents')
  const isQuoteFlow = pathname?.includes('/quotes/new/')

  // Quote flow էջերի համար background
  const quoteBackgroundClass = isQuoteFlow 
    ? "bg-gradient-to-b from-[#F3F3F6] to-[#FFFFFF] min-h-screen"
    : ""

  // Էջի համար կոնկրետ styling
  const getPageLayoutClass = () => {
    if (isProfilePage) return "bg-[#F3F3F6] min-h-screen"
    if (isQuoteFlow) return quoteBackgroundClass
    if (isDocumentsPage) return "bg-[url('/documents/documents-back.png')] bg-cover bg-center"
    
    return `
      md:h-[116vh] overflow-hidden
      bg-[#F3F3F6]
      md:bg-[url('/background2.png')]
      md:bg-no-repeat md:bg-cover md:bg-center md:bg-top
    `
  }

  // Quote flow էջերի համար պարզ layout
  if (isQuoteFlow) {
    return (
      <div className="font-montserrat">
        <div className='bg-white shadow-sm'>
          <DashboardHeader userEmail={user?.email} />
        </div>
        <main className={quoteBackgroundClass}>
          {children}
        </main>
      </div>
    )
  }

  // Profile էջի համար
  if (isProfilePage) {
    return (
      <div className="font-montserrat">
        <div className='bg-[#F3F3F6]'>
          <DashboardHeader userEmail={user?.email} />
        </div>
        <main className="flex-1 mt-[-12px] bg-[#f3f3f6]">
          {children}
        </main>
      </div>
    )
  }

  // Սովորական էջերի համար
  return (
    <div className={getPageLayoutClass()}>
      <div className="md:h-[116vh] md:min-h-[116vh] font-montserrat flex flex-col">
        <div className='block-1'>
          <DashboardHeader userEmail={user?.email} />
        </div>
      
        <main className={`
          block-2 
          omblock 
          min-w-[100%] 
          max-h-[86%]  
          scrollbar-thin 
          mx-auto 
          overflow-hidden 
          max-[767px]:!overflow-hidden
          ${isDocumentsPage ? "bg-[url('/documents/documents-back.png')] bg-cover bg-center" : ""}
        `}>
          {children}
        </main>
      </div>
    </div>
  )
}