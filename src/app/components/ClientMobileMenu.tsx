// src/components/ClientMobileMenu.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ClientMobileMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('menu-open')
      document.documentElement.style.overflow = 'hidden'
      window.scrollTo(0, 0)
    } else {
      document.body.classList.remove('menu-open')
      document.documentElement.style.overflow = ''
    }

    return () => {
      document.body.classList.remove('menu-open')
      document.documentElement.style.overflow = ''
    }
  }, [isMenuOpen])

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMenuOpen])

  return (
    <>
      {/* Hamburger Button */}
      <button
        className="hamburger-menu-btn md:hidden flex flex-col justify-between w-[30px] h-[21px] bg-transparent border-none cursor-pointer p-0 z-[1001] relative transition-opacity duration-150"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span 
          className={`hamburger-line block h-[3px] w-full bg-[#4C4C4C] rounded transition-all duration-200 ease-in-out ${
            isMenuOpen ? 'transform translate-y-[9px] rotate-45 w-full' : ''
          }`}
        />
        <span 
          className={`hamburger-line block h-[3px] w-full bg-[#4C4C4C] rounded transition-all duration-200 ease-in-out ${
            isMenuOpen ? 'opacity-0' : ''
          }`}
        />
        <span 
          className={`hamburger-line block h-[3px] w-full bg-[#4C4C4C] rounded transition-all duration-200 ease-in-out ${
            isMenuOpen ? 'transform -translate-y-[9px] -rotate-45 w-full' : ''
          }`}
        />
      </button>

      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-menu fixed inset-0 w-full h-screen bg-[#FBFBFF] transition-all duration-200 z-[98999] md:hidden ${
          isMenuOpen 
            ? 'opacity-100 visible' 
            : 'opacity-0 invisible'
        }`}
        style={{ display: isMenuOpen ? 'block' : 'none' }}
      >
        

        {/* Menu Content */}
        <div 
          className={`mobile-menu-content pt-20 px-6 pb-40 flex flex-col gap-8 h-full transition-all duration-250 ${
            isMenuOpen 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-2.5'
          }`}
        >
          <div className="mobile-nav flex flex-col gap-0">
            {[
              { text: 'Why Cargo Guard', delay: '0.05s' },
              { text: 'How It Works', delay: '0.1s' },
              { text: 'Results', delay: '0.15s' },
              { text: 'Platform', delay: '0.2s' }
            ].map((item, index) => (
              <Link
                key={item.text}
                href="#"
                className={`nav-item text-[16px] text-[#535C65] py-3 border-b border-[#eee] font-medium hover:text-[#2563EB] transition-all duration-150 block ${
                  isMenuOpen ? 'animate-fadeInUpFast' : ''
                }`}
                style={{
                  animationDelay: isMenuOpen ? item.delay : '0s',
                  opacity: isMenuOpen ? 0 : 1,
                  transform: isMenuOpen ? 'translateY(8px)' : 'translateY(0)'
                }}
                onClick={() => {
                  setTimeout(() => {
                    closeMenu()
                  }, 50)
                }}
              >
                {item.text}
              </Link>
            ))}
          </div>

          <div 
            className={`mobile-buttons flex flex-col sm:flex-row gap-4 mt-40 opacity-0 transition-all duration-250 ${
              isMenuOpen 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-2.5'
            }`}
            style={{ animationDelay: '0.25s' }}
          >
            <Link href="/login" className="flex-1" onClick={() => setTimeout(closeMenu, 100)}>
              <button className="w-full py-3 text-[14px] bg-white text-[#2a2a2a] rounded-lg hover:bg-gray-100 transition-all duration-150 login-btn">
                Login
              </button>
            </Link>
            <Link href="/signup" className="flex-1" onClick={() => setTimeout(closeMenu, 100)}>
              <button className="w-full py-3 text-[14px] bg-[#2196F3] text-white rounded-lg hover:bg-[#1976D2] transition-all duration-150 sign-up-btn">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Add animation styles */}
      <style jsx global>{`
        @keyframes fadeInUpFast {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUpFast {
          animation: fadeInUpFast 0.25s ease forwards;
        }
        
        /* Original CSS hover effects */
        .login-btn:hover {
          color: #0a0891 !important;
        }
        
        .sign-up-btn:hover {
          background-color: #191b1c;
        }
        
        .first-btn:hover {
          color: #2563eb !important;
        }
        
        .main-btn:hover {
          background-color: #043fc1 !important;
        }
        
        /* Mobile menu specific */
        .mobile-close-btn:hover .close-line {
          background-color: #2563EB;
        }
        
        .nav-item:hover {
          color: #2563EB;
        }
        
        /* Toolbar fade out effect */
        body.menu-open .tb {
          opacity: 0.3;
          pointer-events: none;
          transition: opacity 0.15s ease;
        }
        
        /* Hamburger animation when active */
        .hamburger.active .hamburger-line:nth-child(1) {
          transform: translateY(9px) rotate(45deg);
        }
        
        .hamburger.active .hamburger-line:nth-child(2) {
          opacity: 0;
          transform: translateX(-10px);
        }
        
        .hamburger.active .hamburger-line:nth-child(3) {
          transform: translateY(-9px) rotate(-45deg);
        }
        
        /* Hide hamburger when menu is open */
        body.menu-open .hamburger {
          opacity: 0;
          pointer-events: none;
          transition-delay: 0s;
        }
        
        @media (max-width: 768px) {
          body.menu-open {
            overflow: hidden;
            height: 100vh;
          }
          
          .mobile-buttons {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 24px;
            background-color: #2563eb;
            flex-direction: row;
          }
          
          .mobile-buttons button {
            font-size: 14px;
          }
          
          .mobile-menu.active .mobile-close-btn {
            opacity: 1;
            transform: scale(1);
            transition-delay: 0.1s;
          }
          
          .mobile-menu.active .mobile-menu-content {
            opacity: 1;
            transform: translateY(0);
            transition-delay: 0.05s;
          }
          
          .hamburger {
            display: flex;
            position: relative;
            z-index: 1001;
          }
        }
      `}</style>
    </>
  )
}