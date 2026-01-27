'use client'

import Link from 'next/link'

interface DesktopNavProps {
  navItems: {
    id: string
    label: string
    href: string
    icon: string
  }[]
  activeNavItem: string
  onNavClick: (itemLabel: string) => void
}

export default function DesktopNav({ 
  navItems, 
  activeNavItem, 
  onNavClick 
}: DesktopNavProps) {
  const isActive = (itemLabel: string) => activeNavItem === itemLabel
  
  return (
    <nav className="hidden xl:flex items-center gap-1">
      
      
      {navItems.map((item) => (
        <Link 
          key={item.id}
          href={item.href}
          onClick={() => onNavClick(item.label)}
          className={`h-[54px] flex items-center justify-center px-9 rounded-lg transition-all duration-300 cursor-pointer group no-underline ${
            isActive(item.label) ? 'bg-white shadow-sm' : 'bg-[#f7f7f7] border border-white/22 hover:bg-white'
          }`}
        >
          <span className={`font-inter text-[16px] font-normal transition-all duration-300 ${
            isActive(item.label) ? 'text-black' : 'text-black group-hover:text-black/80'
          }`}>
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  )
}