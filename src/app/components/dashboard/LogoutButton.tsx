'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface LogoutButtonProps {
  mobileVersion?: boolean
  desktopVersion?: boolean
}

export default function LogoutButton({ mobileVersion = false, desktopVersion = false }: LogoutButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setLoading(false)
    }
  }

  if (mobileVersion) {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-red-50 transition-colors cursor-pointer text-red-600"
      >
        <div className="w-8 h-8 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="font-inter text-sm font-medium">
          {loading ? 'Logging out...' : 'Log Out'}
        </span>
      </button>
    )
  }

  if (desktopVersion) {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors duration-200 text-left text-red-600"
      >
        <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="font-inter text-sm font-medium">
          {loading ? 'Logging out...' : 'Log Out'}
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-inter text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Logging out...' : 'Log Out'}
    </button>
  )
}