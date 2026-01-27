import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import ClientMobileMenu from './components/ClientMobileMenu'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#FBFBFF]">
      {/* Navigation */}
      <header className="w-full">
        <div className="container w-[96%] mx-auto lg:w-[88%] sm:w-[88%]">
          <div className="tb flex justify-between items-center py-4 lg:py-[16px]">
            {/* Logo */}
            <div className="toolbar">
              <Link href="/">
                <Image 
                  src="/landing/logo.svg" 
                  alt="Cargo Guard Logo" 
                  width={154} 
                  height={40}
                  priority
                />
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-6 items-center">
              <Link href="#" className="text-sm text-[#535C65] hover:text-[#163e66] transition-all duration-250 ease-in">
                Why Cargo Guard
              </Link>
              <Link href="#" className="text-sm text-[#535C65] hover:text-[#163e66] transition-all duration-250 ease-in">
                How It Works
              </Link>
              <Link href="#" className="text-sm text-[#535C65] hover:text-[#163e66] transition-all duration-250 ease-in">
                Results
              </Link>
              <Link href="#" className="text-sm text-[#535C65] hover:text-[#163e66] transition-all duration-250 ease-in">
                Platform
              </Link>
            </nav>
            
            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex gap-3">
                <Link href="/login">
                  <button className="login-btn text-sm text-[#2a2a2a] px-4 py-1.5 hover:text-[#0a0891] transition-all duration-250 ease-in">
                    Login
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="sign-up-btn text-sm text-[#FAFAFA] px-4 py-1.5 bg-[#63686C] rounded-lg hover:bg-[#191b1c] transition-all duration-250 ease-in">
                    Sign Up
                  </button>
                </Link>
              </div>
            </div>
            
            
          </div>
          {/* Mobile Hamburger Button - Client Component */}
            <ClientMobileMenu />
          {/* Hero Section */}
          <div className="py-10 flex flex-col gap-4 md:py-[40px] md:gap-[16px]">
            <div className="flex flex-col gap-3 md:gap-[12px]">
              <div className="w-fit mx-auto flex items-center gap-2 md:gap-[8px] bg-white/56 rounded-full pr-3 md:pr-[12px]">
                <Image 
                  src="/landing/flash.svg" 
                  alt="Flash Icon" 
                  width={24}
                  height={24}
                  className="md:w-7 md:h-7 lg:w-7 lg:h-7"
                />
                <p className="text-xs md:text-sm lg:text-sm font-normal text-[#4C4C4C]">
                  FINALLY. LOGISTICS MOVES AT YOUR SPEED.
                </p>
              </div>
              
              <h1 className="text-[28px] leading-[36px] md:text-[32px] md:leading-[44px] lg:text-[36px] lg:leading-[48px] font-normal text-[#4C4C4C] text-center mx-auto w-[96%] md:w-[96%] lg:w-[82%] xl:w-[66%] 2xl:w-[51%]">
                Cargo Insurance, Simplified.{' '}
                <span className="text-[#2563EB] font-medium">Instant Quotes. Zero Paperwork.</span>
              </h1>
              
              <p className="text-base text-[#4C4C4C] text-center mx-auto w-[90%] md:w-[90%] lg:w-[90%] xl:w-[72%] 2xl:w-[43%]">
                The first fully digital platform to secure your global freight against risk, powered by smart compliance tools.
              </p>
            </div>
            
            <div className="w-fit mx-auto flex flex-row sm:flex-row gap-4 md:gap-[16px]">
              <Link href="/quote">
                <button className="first-btn bg-transparent border-none px-0 py-1.5 text-sm md:text-base text-[#2F2F2F] hover:text-[#2563eb] transition-all duration-250 ease-in cursor-pointer">
                  Get An Instant Quote
                </button>
              </Link>
              <Link href="/signup">
                <button className="main-btn bg-[#2563EB] px-4 py-1.5 md:px-6 md:py-1.5 rounded-lg text-sm md:text-base text-[#FAFAFA] hover:bg-[#043fc1] transition-all duration-250 ease-in cursor-pointer">
                  Start Securing Cargo
                </button>
              </Link>
            </div>
          </div>
          
          {/* Desktop Dashboard Image */}
          <div className="hidden md:block">
            <Image 
              src="/landing/dashbaord-deskt.png" 
              alt="Cargo Guard Dashboard" 
              width={1200}
              height={600}
              className="w-[90%] mx-auto shadow-[0_4px_37px_0px_#2563eb36] rounded-t-[16px]"
              priority
            />
          </div>
        </div>
        {/* Mobile Dashboard Image */}
          <div className="md:hidden w-full">
            <Image 
              src="/landing/mob-dash.png" 
              alt="Cargo Guard Dashboard Mobile" 
              width={600}
              height={400}
              className="w-[96%] shadow-[0_4px_37px_0px_#2563eb36] rounded-tr-[16px]"
              priority
            />
          </div>
      </header>
      <section className="features bg-white py-16 lg:py-[72px]">
  <div className="container w-[96%] mx-auto lg:w-[88%]">
    {/* Title with text-left and responsive font sizes */}
    <h2 className="sect-title text-[#4C4C4C] text-[24px] lg:text-[32px] font-normal leading-normal lg:leading-[46px] mb-8 text-left">
      Stop Losing Time. <br /> Start Securing Cargo.
    </h2>
    
    <div className="features-cont flex flex-col lg:flex-row justify-between gap-4 lg:gap-4">
      {/* Old Way */}
      <div className="old-way w-full lg:w-[49.5%] rounded-[16px] p-4 lg:p-6 flex flex-col gap-4 lg:gap-[22px] border border-white shadow-[0px_0px_2px_#0000ff1a] bg-[#fcfcfc]">
        <div className="features-item-header">
          <h2 className="features-item-header-title text-[#2c2c2c] text-[20px] lg:text-[24px] font-normal">
            The Old Way
          </h2>
          <p className="features-item-header-subtitle text-[#575757] text-sm lg:text-base font-light">
            Delays & Uncertainty
          </p>
        </div>
        
        <div className="features-item-cont flex flex-col gap-4 lg:gap-[22px]">
          {/* Feature 1 */}
          <div className="feat-it flex justify-start gap-4 rounded-[16px] p-3 lg:p-4 items-start transition-all duration-250 ease-in border border-[#0000001f] bg-white hover:bg-[#fcecec] hover:-translate-y-1">
            <img 
              src="/landing/features/slow.svg" 
              alt="Slow Quotes" 
              className="mt-[6px] w-4 h-4 lg:w-6 lg:h-6"
            />
            <div className="feat-it-text">
              <h4 className="text-[#b45353] text-[16px] lg:text-[20px] font-normal mb-1">Slow Quotes</h4>
              <p className="text-[#AFAFAF] text-sm lg:text-base font-light">
                Takes days to get a quote.
              </p>
            </div>
          </div>
          
          {/* Feature 2 */}
          <div className="feat-it flex justify-start gap-4 rounded-[16px] p-3 lg:p-4 items-start transition-all duration-250 ease-in border border-[#0000001f] bg-white hover:bg-[#fcecec] hover:-translate-y-1">
            <img 
              src="/landing/features/paperwork.svg" 
              alt="Paperwork Overload" 
              className="mt-[6px] w-4 h-4 lg:w-6 lg:h-6"
            />
            <div className="feat-it-text">
              <h4 className="text-[#b45353] text-[16px] lg:text-[20px] font-normal mb-1">Paperwork Overload</h4>
              <p className="text-[#AFAFAF] text-sm lg:text-base font-light">
                Endless forms and manual data entry.
              </p>
            </div>
          </div>
          
          {/* Feature 3 */}
          <div className="feat-it flex justify-start gap-4 rounded-[16px] p-3 lg:p-4 items-start transition-all duration-250 ease-in border border-[#0000001f] bg-white hover:bg-[#fcecec] hover:-translate-y-1">
            <img 
              src="/landing/features/fees.svg" 
              alt="Hidden Fees" 
              className="mt-[6px] w-4 h-4 lg:w-6 lg:h-6"
            />
            <div className="feat-it-text">
              <h4 className="text-[#b45353] text-[16px] lg:text-[20px] font-normal mb-1">Hidden Fees</h4>
              <p className="text-[#AFAFAF] text-sm lg:text-base font-light">
                Non-transparent pricing and surprise charges.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* New Way */}
      <div className="new-way w-full lg:w-[49.5%] rounded-[16px] p-4 lg:p-6 flex flex-col gap-4 lg:gap-[22px] border border-white shadow-[0px_0px_2px_#0000ff1a] bg-[#fcfcfc] lg:mt-0 mt-4">
        <div className="features-item-header">
          <h2 className="features-item-header-title text-black text-[20px] lg:text-[24px] font-normal">
            The New Way
          </h2>
          <p className="features-item-header-subtitle text-[#575757] text-sm lg:text-base font-light">
            Instant & Digital
          </p>
        </div>
        
        <div className="features-item-cont flex flex-col gap-4 lg:gap-[22px]">
          {/* Feature 1 */}
          <div className="feat-it flex justify-start gap-4 rounded-[16px] p-3 lg:p-4 items-start transition-all duration-250 ease-in border border-[#0000001f] bg-white hover:bg-[#eafff1] hover:-translate-y-1">
            <img 
              src="/landing/features/instant.svg" 
              alt="Instant Quotes" 
              className="mt-[6px] w-4 h-4 lg:w-6 lg:h-6"
            />
            <div className="feat-it-text">
              <h4 className="text-[#53b475] text-[16px] lg:text-[20px] font-normal mb-1">Instant Quotes</h4>
              <p className="text-[#AFAFAF] text-sm lg:text-base font-light">
                Real-time pricing based on your cargo details.
              </p>
            </div>
          </div>
          
          {/* Feature 2 */}
          <div className="feat-it flex justify-start gap-4 rounded-[16px] p-3 lg:p-4 items-start transition-all duration-250 ease-in border border-[#0000001f] bg-white hover:bg-[#eafff1] hover:-translate-y-1">
            <img 
              src="/landing/features/zero-paperwork.svg" 
              alt="Zero Paperwork" 
              className="mt-[6px] w-4 h-4 lg:w-6 lg:h-6"
            />
            <div className="feat-it-text">
              <h4 className="text-[#53b475] text-[16px] lg:text-[20px] font-normal mb-1">Zero Paperwork</h4>
              <p className="text-[#AFAFAF] text-sm lg:text-base font-light">
                Fully digital documents & automated compliance.
              </p>
            </div>
          </div>
          
          {/* Feature 3 */}
          <div className="feat-it flex justify-start gap-4 rounded-[16px] p-3 lg:p-4 items-start transition-all duration-250 ease-in border border-[#0000001f] bg-white hover:bg-[#eafff1] hover:-translate-y-1">
            <img 
              src="/landing/features/premium.svg" 
              alt="Transparent Premium" 
              className="mt-[6px] w-4 h-4 lg:w-6 lg:h-6"
            />
            <div className="feat-it-text">
              <h4 className="text-[#53b475] text-[16px] lg:text-[20px] font-normal mb-1">Transparent Premium</h4>
              <p className="text-[#AFAFAF] text-sm lg:text-base font-light">
                One-screen confirmation, no hidden costs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
      </section>
      <section className="process bg-white pb-16 lg:pb-[72px]">
  <div className="container w-[96%] mx-auto lg:w-[88%]">
    {/* Header */}
    <div className="process-header mb-8 lg:mb-[46px]">
      <h2 className="process-header-title text-[#4C4C4C] text-[24px] lg:text-[32px] font-normal leading-normal lg:leading-[46px] mb-2">
        Your Cargo Secure in 3 Simple Steps
      </h2>
      <p className="process-header-subtitle text-[#4C4C4C] text-sm lg:text-base">
        No calls, no waiting. Get covered in minutes, not days.
      </p>
    </div>
    
    {/* Process Items Container */}
    <div className="process-cont flex flex-col md:flex-row flex-wrap justify-between gap-y-8 lg:gap-y-0">
      {/* Step 1 */}
      <div className="process-item w-full md:w-[49.5%] lg:w-[32.5%] rounded-[16px] mt-0 md:mt-0 lg:mt-0">
        <img 
          src="landing/process/01.svg" 
          alt="Step 1: Enter Cargo & Route" 
          className="w-50px h-auto"
        />
        <div className="process-item-cont mt-4 lg:mt-[18px]">
          <h3 className="process-item-title text-[#2F2F2F] text-lg lg:text-[20px] font-normal mb-2 lg:mb-2">
            Enter Cargo & Route
          </h3>
          <div className="process-item-text text-[#848484] text-sm lg:text-base font-light w-[85%] lg:w-[75%]">
            Input your cargo value, type, and route in our simplified form
          </div>
        </div>
      </div>
      
      {/* Step 2 */}
      <div className="process-item w-full md:w-[49.5%] lg:w-[32.5%] rounded-[16px] mt-8 md:mt-0 lg:mt-0">
        <img 
          src="landing/process/02.svg" 
          alt="Step 2: Get Instant Quote" 
          className="w-50px h-auto"
        />
        <div className="process-item-cont mt-4 lg:mt-[18px]">
          <h3 className="process-item-title text-[#2F2F2F] text-lg lg:text-[20px] font-normal mb-2 lg:mb-2">
            Get Instant Quote
          </h3>
          <div className="process-item-text text-[#848484] text-sm lg:text-base font-light w-[85%] lg:w-[75%]">
            Cargo Guard instantly calculates your premium using real-time data.
          </div>
        </div>
      </div>
      
      {/* Step 3 - Special handling for tablet (1024px breakpoint) */}
      <div className="process-item w-full md:w-[49.5%] lg:w-[32.5%] rounded-[16px] mt-8 md:mt-8 lg:mt-0">
        <img 
          src="landing/process/03.svg" 
          alt="Step 3: Confirm & Activate" 
          className="w-50px h-auto"
        />
        <div className="process-item-cont mt-4 lg:mt-[18px]">
          <h3 className="process-item-title text-[#2F2F2F] text-lg lg:text-[20px] font-normal mb-2 lg:mb-2">
            Confirm & Activate
          </h3>
          <div className="process-item-text text-[#848484] text-sm lg:text-base font-light w-[85%] lg:w-[75%]">
            Review the quote, pay, and your policy is instantly active — ready for shipment.
          </div>
        </div>
      </div>
    </div>
  </div>
      </section>
      <section className="perform bg-white pb-16 lg:pb-[72px]">
        <div className="container w-[96%] mx-auto lg:w-[88%]">
          {/* Հատվածի վերնագիր */}
          <div className="perform-header mb-8 lg:mb-[46px]">
            <h2 className="perform-title text-[#4C4C4C] text-[24px] md:text-[28px] lg:text-[32px] font-normal leading-normal mb-2 lg:mb-2">
              Trusted by Thousands. <br /> Proven by Results.
            </h2>
            <p className="perform-subtitle text-[#4C4C4C] text-sm lg:text-base w-full lg:w-[56%] xl:w-[37%]">
              Cargo Guard helps businesses insure cargo in minutes — with higher conversion rates, faster quotes, and zero paperwork.
            </p>
          </div>

          {/* Առաջին շարք (երկու ցուցանիշ) */}
          <div className="perform-cont flex flex-col lg:flex-row justify-between gap-2 mb-2">
            {/* Ցուցանիշ 1 */}
            <div className="perform-item w-full lg:w-[49.8%] bg-[#F9F9F9] rounded-[16px] p-6 lg:p-[50px_40px] text-center">
              <div className="count text-[#2F2F2F] text-4xl lg:text-[48px] font-normal relative w-fit mx-auto 
                before:content-[''] before:absolute before:top-[8px] before:-left-[20px] before:!w-3 before:!h-3 before:bg-[url('/landing/perform/percent.svg')] before:bg-no-repeat before:bg-contain
                after:content-[''] after:absolute after:top-[8px] after:-right-[20px] after:!w-3 after:!h-3 after:bg-[url('/landing/perform/arrow.svg')] after:bg-no-repeat after:bg-contain">
                +55.<span className="text-[#B2B2B2]">3</span>
              </div>
              <p className="text-[#AFAFAF] text-xs lg:text-sm font-light mt-2">
                Manual Reporting Reduced
              </p>
            </div>

            {/* Ցուցանիշ 2 */}
            <div className="perform-item w-full lg:w-[49.8%] bg-[#F9F9F9] rounded-[16px] p-6 lg:p-[50px_40px] text-center mt-2 lg:mt-0">
              <div className="count text-[#2F2F2F] text-4xl lg:text-[48px] font-normal relative w-fit mx-auto
                before:content-[''] before:absolute before:top-[8px] before:-left-[26px] before:!w-3 before:!h-3 before:bg-[url('/landing/perform/percent.svg')] before:bg-no-repeat before:bg-contain
                after:content-[''] after:absolute after:top-[8px] after:-right-[26px] after:!w-3 after:!h-3 after:bg-[url('/landing/perform/arrow.svg')] after:bg-no-repeat after:bg-contain">
                +72.<span className="text-[#B2B2B2]">8</span>
              </div>
              <p className="text-[#AFAFAF] text-xs lg:text-sm font-light mt-2">
                Faster Quote Conversion
              </p>
            </div>
          </div>

          {/* Երկրորդ շարք (ցուցանիշ + ակնարկ) */}
          <div className="perform-cont flex flex-col lg:flex-row justify-between gap-2">
            {/* Ցուցանիշ 3 */}
            <div className="perform-item w-full lg:w-[49.8%] bg-[#F9F9F9] rounded-[16px] p-6 lg:p-[50px_40px] text-center">
              <div className="count text-[#2F2F2F] text-4xl lg:text-[48px] font-normal relative w-fit mx-auto
                before:content-[''] before:absolute before:top-[8px] before:-left-[26px] before:!w-3 before:!h-3 before:bg-[url('/landing/perform/percent.svg')] before:bg-no-repeat before:bg-contain
                after:content-[''] after:absolute after:top-[8px] after:-right-[26px] after:!w-3 after:!h-3 after:bg-[url('/landing/perform/arrow.svg')] after:bg-no-repeat after:bg-contain">
                +65.<span className="text-[#B2B2B2]">0</span>
              </div>
              <p className="text-[#AFAFAF] text-xs lg:text-sm font-light mt-2">
                Average Conversion Rate
              </p>
            </div>

            {/* Ակնարկի բլոկ */}
            <div className="perform-item review-perform-item w-full lg:w-[49.8%] bg-[#F9F9F9] rounded-[16px] p-6 lg:p-[24px_40px] flex flex-col justify-center items-start">
              <div className="review text-sm lg:text-base text-left font-medium lg:font-medium mb-4 lg:mb-4">
                Cargo Guard makes cargo insurance fast, transparent, and effortless — we can secure every shipment in minutes, without endless calls or paperwork.
              </div>
              <div className="rev-person flex gap-3 lg:gap-[12px] items-center">
                <img
                  src="/landing/perform/rev.png"
                  alt="Alex Rivera Portrait"
                  className="w-11 lg:w-[44px] h-auto"
                />
                <div className="rev-person-info">
                  <h3 className="text-base text-left font-normal">Alex Rivera</h3>
                  <h4 className="text-xs lg:text-[13px] text-[#AFAFAF] font-normal">Portfolio Manager</h4>
                </div>
              </div>
            </div>
          </div>

          {/* Գործողությունների կոչ */}
          <div className="perform-cta pt-6 lg:pt-7 text-center">
            <button className="text-white bg-[#2563EB] border-none px-6 py-1.5 lg:px-6 lg:py-1.5 text-sm lg:text-base rounded-lg mb-2 hover:bg-[#043fc1] transition-all duration-250 ease-in cursor-pointer">
              Join 12,500+ Active Users
            </button>
            <p className="text-[#878787] text-xs lg:text-xs">
              It only takes 60 seconds to set up your account.
            </p>
          </div>
        </div>
      </section>
      <section className="power bg-white pb-16 lg:pb-[72px]">
  <div className="container w-[96%] mx-auto lg:w-[88%]">
    {/* Power Header */}
    <div className="power-header mb-6 lg:mb-[42px]">
      <h2 className="power-header-title text-[#4C4C4C] text-[24px] lg:text-[32px] font-normal mb-2 lg:mb-2">
        The Power Behind the Platform
      </h2>
      <p className="power-header-subtitle text-[#4C4C4C] text-sm lg:text-base w-[99%] lg:w-[75%] xl:w-auto">
        Built on three pillars of logistics assurance: Speed, Transparency, and Control.
      </p>
    </div>
    
    {/* Power Items Container */}
    <div className="power-cont flex flex-col md:flex-row flex-wrap justify-between lg:justify-between gap-7 lg:gap-0">
      {/* Item 1: Transparency */}
      <div className="power-item w-full md:w-[49.5%] lg:w-[32.5%] flex flex-col gap-6 lg:gap-6">
        <div className="power-item-text w-full bg-gradient-to-r from-[#F9F9F9] to-[#FBFBFF] border border-[rgba(255,255,255,0.489)] rounded-[16px] p-4 lg:p-4">
          <h4 className="text-[#2F2F2F] text-lg lg:text-[20px] font-normal mb-1 lg:mb-1">Transparency</h4>
          <p className="text-[#9D9D9D] text-sm lg:text-sm">Smart Compliance Dashboard</p>
        </div>
        <img 
          src="/landing/power/01.png" 
          alt="Transparency" 
          className="w-full md:w-[100%] lg:w-[75%] mx-auto block"
        />
      </div>
      
      {/* Item 2: Control - Special handling */}
      <div className="power-item w-full md:w-[49.5%] lg:w-[32.5%] flex flex-col gap-6 lg:gap-6 md:flex-col-reverse lg:flex-col">
        <div className="power-item-text w-full bg-gradient-to-r from-[#F9F9F9] to-[#FBFBFF] border border-[rgba(255,255,255,0.489)] rounded-[16px] p-4 lg:p-4">
          <h4 className="text-[#2F2F2F] text-lg lg:text-[20px] font-normal mb-1 lg:mb-1">Control</h4>
          <p className="text-[#9D9D9D] text-sm lg:text-sm">Dynamic Policy Management</p>
        </div>
        <img 
          src="/landing/power/02.png" 
          alt="Control" 
          className="w-full md:w-[100%] lg:w-[75%] mx-auto block"
        />
      </div>
      
      {/* Item 3: Speed */}
      <div className="power-item w-full md:w-[49.5%] lg:w-[32.5%] flex flex-col gap-6 lg:gap-6">
        <div className="power-item-text w-full bg-gradient-to-r from-[#F9F9F9] to-[#FBFBFF] border border-[rgba(255,255,255,0.489)] rounded-[16px] p-4 lg:p-4">
          <h4 className="text-[#2F2F2F] text-lg lg:text-[20px] font-normal mb-1 lg:mb-1">Speed</h4>
          <p className="text-[#9D9D9D] text-sm lg:text-sm">Instant Claims & Quick Actions</p>
        </div>
        <img 
          src="/landing/power/03.png" 
          alt="Speed" 
          className="w-full md:w-[100%] lg:w-[75%] mx-auto block"
        />
      </div>
    </div>
  </div>
      </section>
      <section className="cta-sect bg-white">
  <div className="container w-[96%] mx-auto lg:w-[88%]">
    <div className="cta py-12 lg:py-[72px] rounded-[16px] bg-[url('/landing/cta/back-img.png')] bg-cover text-center">
      <div className="container w-full mx-auto">
        <div className="cta-header flex flex-col gap-3 lg:gap-3">
          <p className="mean-text uppercase text-white text-sm lg:text-base font-medium">
            GET STARTED WITH CARGO GUARD FOR FREE
          </p>
          <h2 className="cta-title text-white text-[32px] lg:text-[48px] font-normal leading-[44px] lg:leading-[64px] w-[80%] lg:w-[95%] xl:w-[64%] 2xl:w-[52%] mx-auto">
            Stop losing time & start insuring cargo digitally.
          </h2>
          <p className="cta-subtitle text-white text-sm lg:text-base font-normal w-[80%] lg:w-[80%] xl:w-[56%] 2xl:w-[38%] mx-auto">
            Ready to take control of your cargo security?
            Join the digital platform built by logistics experts․
          </p>
        </div>
        <div className="cta-footer pt-6 lg:pt-6">
          <div className="cta-btn-cont">
            <button className="cta-main-btn text-black text-sm lg:text-base py-3 px-9 lg:py-3 lg:px-9 bg-white rounded-lg border border-[rgba(255,255,255,0.269)] hover:bg-gray-50 transition-all duration-250 ease-in cursor-pointer">
              Start Your Free Account
            </button>
            <button className="cta-second-btn bg-transparent border-none text-white text-sm lg:text-base ml-0 lg:ml-8 hidden lg:inline-block hover:text-gray-200 transition-all duration-250 ease-in cursor-pointer">
              See Cargo Guard in action
            </button>
          </div>
          <h6 className="text-white text-xs font-normal mt-3 lg:mt-3">
            No credit card required. Start in seconds.
          </h6>
        </div>
      </div>
    </div>
  </div>
      </section>
      <footer className="bg-white pt-16 pb-16 lg:pt-[72px] lg:pb-[72px]">
  <div className="container w-[96%] mx-auto lg:w-[88%]">
    {/* Footer Header */}
    <div className="footer-header-info flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-0 mb-11 lg:mb-[72px]">
      <div className="cont1 w-full lg:w-[26%]">
        <img 
          src="/landing/footer/logo-icon.png" 
          alt="Cargo Guard Logo" 
          width={44}
          height={44}
          className="mb-1"
        />
        <p className="text-[#123148] text-sm lg:text-base mt-3 lg:mt-3">
          Cargo Guard is the first fully digital cargo insurance platform,
          helping logistics partners secure their global freight instantly and transparently.
        </p>
      </div>
      <button className="bg-[#2563EB] text-white text-sm lg:text-base py-1.5 lg:py-1.5 px-6 lg:px-6 rounded-lg border-none hover:bg-[#043fc1] transition-all duration-250 ease-in cursor-pointer w-full lg:w-auto">
        Sign Up For Free
      </button>
    </div>
    
    {/* Footer Navigation */}
    <div className="footer-nav-container flex flex-col lg:flex-row justify-between gap-8 lg:gap-0 mb-8 lg:mb-0">
      {/* PRODUCT */}
      <div className="footer-nav-item w-fit flex flex-col gap-4 lg:gap-4">
        <h4 className="footer-nav-item-title text-[#535353] text-base lg:text-[18px] font-medium">
          PRODUCT
        </h4>
        <div className="footer-nav-cont flex flex-col gap-3 lg:gap-3">
          <a href="#" className="footer-nav-item-nav text-[#747474] text-sm lg:text-base no-underline hover:text-[#2563EB] transition-colors duration-250">
            Pricing
          </a>
          <a href="#" className="footer-nav-item-nav text-[#747474] text-sm lg:text-base no-underline hover:text-[#2563EB] transition-colors duration-250">
            Demo Request
          </a>
          <a href="#" className="footer-nav-item-nav text-[#747474] text-sm lg:text-base no-underline hover:text-[#2563EB] transition-colors duration-250">
            Our Roadmap
          </a>
          <a href="#" className="footer-nav-item-nav text-[#747474] text-sm lg:text-base no-underline hover:text-[#2563EB] transition-colors duration-250">
            Alternatives
          </a>
        </div>
      </div>
      
      {/* FEATURES */}
      <div className="footer-nav-item w-fit flex flex-col gap-4 lg:gap-4">
        <h4 className="footer-nav-item-title text-[#535353] text-base lg:text-[18px] font-medium">
          FEATURES
        </h4>
        <div className="footer-nav-cont flex flex-col gap-3 lg:gap-3">
          <a href="#" className="footer-nav-item-nav text-[#747474] text-sm lg:text-base no-underline hover:text-[#2563EB] transition-colors duration-250">
            Quotes
          </a>
          <a href="#" className="footer-nav-item-nav text-[#747474] text-sm lg:text-base no-underline hover:text-[#2563EB] transition-colors duration-250">
            Policies
          </a>
          <a href="#" className="footer-nav-item-nav text-[#747474] text-sm lg:text-base no-underline hover:text-[#2563EB] transition-colors duration-250">
            Claims
          </a>
          <a href="#" className="footer-nav-item-nav text-[#747474] text-sm lg:text-base no-underline hover:text-[#2563EB] transition-colors duration-250">
            Compliance
          </a>
        </div>
      </div>
      
      {/* RESOURCES */}
      <div className="footer-nav-item w-fit flex flex-col gap-4 lg:gap-4">
        <h4 className="footer-nav-item-title text-[#535353] text-base lg:text-[18px] font-medium">
          RESOURCES
        </h4>
        <div className="footer-nav-cont flex flex-col gap-3 lg:gap-3">
          <a href="#" className="footer-nav-item-nav text-[#747474] text-sm lg:text-base no-underline hover:text-[#2563EB] transition-colors duration-250">
            Blog / News
          </a>
          <a href="#" className="footer-nav-item-nav text-[#747474] text-sm lg:text-base no-underline hover:text-[#2563EB] transition-colors duration-250">
            Help Center / FAQ
          </a>
          <a href="#" className="footer-nav-item-nav text-[#747474] text-sm lg:text-base no-underline hover:text-[#2563EB] transition-colors duration-250">
            Glossary
          </a>
          <a href="#" className="footer-nav-item-nav text-[#747474] text-sm lg:text-base no-underline hover:text-[#2563EB] transition-colors duration-250">
            Contact Sales
          </a>
        </div>
      </div>
      
      {/* MY ACCOUNT */}
      <div className="footer-nav-item w-fit flex flex-col gap-4 lg:gap-4">
        <h4 className="footer-nav-item-title text-[#535353] text-base lg:text-[18px] font-medium">
          MY ACCOUNT
        </h4>
        <div className="footer-nav-cont flex flex-col gap-3 lg:gap-3">
          <a href="#" className="footer-nav-item-nav text-[#747474] text-sm lg:text-base no-underline hover:text-[#2563EB] transition-colors duration-250">
            Profile Settings
          </a>
          <a href="#" className="footer-nav-item-nav text-[#747474] text-sm lg:text-base no-underline hover:text-[#2563EB] transition-colors duration-250">
            Billing & Payments
          </a>
          <a href="#" className="footer-nav-item-nav text-[#747474] text-sm lg:text-base no-underline hover:text-[#2563EB] transition-colors duration-250">
            User Management
          </a>
          <a href="#" className="footer-nav-item-nav text-[#747474] text-sm lg:text-base no-underline hover:text-[#2563EB] transition-colors duration-250">
            Security & Login
          </a>
        </div>
      </div>
      
      {/* POLICIES */}
      <div className="footer-nav-item w-fit flex flex-col gap-4 lg:gap-4">
        <h4 className="footer-nav-item-title text-[#535353] text-base lg:text-[18px] font-medium">
          POLICIES
        </h4>
        <div className="footer-nav-cont flex flex-col gap-3 lg:gap-3">
          <a href="#" className="footer-nav-item-nav text-[#747474] text-sm lg:text-base no-underline hover:text-[#2563EB] transition-colors duration-250">
            Privacy Policy
          </a>
          <a href="#" className="footer-nav-item-nav text-[#747474] text-sm lg:text-base no-underline hover:text-[#2563EB] transition-colors duration-250">
            Terms of Service
          </a>
          <a href="#" className="footer-nav-item-nav text-[#747474] text-sm lg:text-base no-underline hover:text-[#2563EB] transition-colors duration-250">
            Legal Notices
          </a>
          <a href="#" className="footer-nav-item-nav text-[#747474] text-sm lg:text-base no-underline hover:text-[#2563EB] transition-colors duration-250">
            Cookie Settings
          </a>
        </div>
      </div>
    </div>
    
    {/* Footer Bottom */}
    <div className="ft pt-16 lg:pt-[72px]">
      <p className="text-[#747474] text-xs lg:text-sm font-light">
        © Copyright 2025 Cargo Guard. All rights reserved.
      </p>
    </div>
  </div>
</footer>
    </div>
  )
}