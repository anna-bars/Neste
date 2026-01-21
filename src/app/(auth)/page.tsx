import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Եթե օգտատերը մուտք գործած է, ուղղորդել dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {/* Navbar */}
      <nav className="px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">Cargo Guard</div>
        <div className="space-x-4">
          <Link href="/login" className="text-gray-600 hover:text-blue-600">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            FINALLY. LOGISTICS MOVES AT
            <span className="text-blue-600"> YOUR SPEED.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Cargo Insurance, Simplified. Instant Quotes. Zero Paperwork.
            The first fully digital platform to secure your global freight against risk,
            powered by smart compliance tools.
          </p>
          <div className="space-x-4">
            <Link
              href="/signup"
              className="bg-blue-600 text-white text-lg px-8 py-4 rounded-lg hover:bg-blue-700 inline-block"
            >
              Get An Instant Quote
            </Link>
            <Link
              href="/login"
              className="border-2 border-blue-600 text-blue-600 text-lg px-8 py-4 rounded-lg hover:bg-blue-50 inline-block"
            >
              Start Securing Cargo
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}