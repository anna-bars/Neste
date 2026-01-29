'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      
      toast.success('Successfully logged in!')
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      })
      
      if (error) throw error
    } catch (error: any) {
      toast.error(error.message || 'Google sign in failed')
    }
  }

  return (
    <div className="cont flex justify-between flex-nowrap">
      {/* Left Side - Login Form */}
      <div className="bg-white sign-in-cont w-[40%] h-[108vh] p-[2%_3%] relative">
        <Link href="/">
          <Image
            src="/auth/logo.svg"
            alt="Cargo Guard Logo"
            width={154}
            height={40}
            className="logo-img absolute"
            priority
          />
        </Link>
        <div className="gen-cont w-full h-full flex items-center">
          <div className="sign-in w-[78%] mx-auto gap-7 flex flex-col">
            <div className="header">
              <h1 className="font-medium mb-1.5 text-[28px]">Sign in</h1>
              <p className="subtitle text-[#515151] text-[14px]">
                Sign in to enjoy the feature of Cargo Guard
              </p>
            </div>
            
            <form onSubmit={handleLogin}>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="google-btn bg-transparent border border-[#E6E8E7] rounded-[6px] w-full items-center flex justify-center gap-2 p-1.5 text-[14px] font-medium hover:border-[#cecfce] transition-all duration-200 cursor-pointer"
              >
                <p>Continue with Google</p>
                <Image
                  src="/auth/google.png"
                  alt="Google"
                  width={24}
                  height={24}
                />
              </button>
              
              <div className="or-cont flex items-center justify-between py-3">
                <div className="or-line w-[43%] bg-[#E6E8E7] h-[0.5px]"></div>
                <p className="text-[#6E6E6E] text-[14px] font-medium">or</p>
                <div className="or-line w-[43%] bg-[#E6E8E7] h-[0.5px]"></div>
              </div>
              
              <label className="text-[#9A9A9A] text-[14px]">
                Email <br />
                <input
                  type="email"
                  placeholder="jonas_kahnwald@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block mt-2 mb-3 w-full px-3 py-2 border border-[#E6E8E7] rounded-[6px] text-[14px] text-[#232323] transition-all duration-200 cursor-pointer hover:border-[#cecfce] focus:outline-none focus:border-[#367AFF]"
                />
              </label>
              
              <label className="text-[#9A9A9A] text-[14px]">
                Password <br />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block mt-2 mb-3 w-full px-3 py-2 border border-[#E6E8E7] rounded-[6px] text-[14px] text-[#232323] transition-all duration-200 cursor-pointer hover:border-[#cecfce] focus:outline-none focus:border-[#367AFF]"
                />
              </label>
              
              <button
                type="submit"
                disabled={loading}
                className="sign-in-btn w-full bg-[#367affc7] px-3 py-2.5 border-none rounded-[6px] text-white text-[16px] font-medium transition-all duration-200 cursor-pointer mt-3 hover:bg-[#367AFF] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>
            
            <p className="cta text-[14px] text-center text-[#6C6C6C]">
              Need an account?{' '}
              <Link href="/signup" className="font-medium text-[#367AFF] hover:underline">
                Create One
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Right Side - Background Image & Review */}
      <div 
        className="sign-img-cont w-[60%] h-[108vh] bg-cover bg-center relative"
        style={{ backgroundImage: 'url(/auth/backimg.avif)' }}
      >
        <div className="review-cont pt-16">
          <div className="container-rev w-[80%] mx-auto">
            <p className="review text-white text-[24px] mb-6">
              "Cargo Guard makes cargo insurance fast, transparent, 
              and effortless — we can secure every shipment in minutes,
              without endless calls or paperwork."
            </p>
            <div className="review-person flex gap-2 items-center">
              <Image
                src="/auth/person.png"
                alt="Alex Rivera"
                width={44}
                height={44}
                className="rounded-full"
              />
              <div className="review-person-info">
                <p className="person-name text-white text-[16px]">Alex Rivera</p>
                <p className="person-info text-[#FBFBFB] text-[14px]">Portfolio Manager</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}