import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  console.log('🔵 Auth callback called')
  
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  console.log('Code:', code ? 'Present' : 'Missing')
  
  // Ստանում ենք հիմնական URL-ը environment variable-ից
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  
  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('❌ Auth error:', error.message)
        return NextResponse.redirect(
          `${baseUrl}/login?error=${encodeURIComponent(error.message)}`
        )
      }
      
      console.log('✅ Session exchange successful')
    } catch (error: any) {
      console.error('❌ Unexpected error:', error)
      return NextResponse.redirect(
        `${baseUrl}/login?error=Authentication+failed`
      )
    }
  }
  
  // Հաջողության դեպքում
  return NextResponse.redirect(`${baseUrl}/dashboard`)
}