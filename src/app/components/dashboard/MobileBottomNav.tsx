'use client'

import { useState } from 'react'
import Link from 'next/link'

interface MobileBottomNavProps {
  navItems: {
    id: string
    label: string
    href: string
    icon: string
  }[]
  activeNavItem: string
  onNavClick: (itemLabel: string) => void
}

export default function MobileBottomNav({ 
  navItems, 
  activeNavItem, 
  onNavClick 
}: MobileBottomNavProps) {
  const isActive = (itemLabel: string) => activeNavItem === itemLabel
  
  return (
    <div className="xl:hidden fixed bottom-0 left-0 right-0 z-40">
      <div className="flex justify-center gap-2 items-center h-[70px] px-2">
        {navItems.map((item) => {
          const active = isActive(item.label)
          const iconSrc = active 
            ? `/nav/${item.icon}-active.svg`
            : `/nav/${item.icon}.svg`
          
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => onNavClick(item.label)}
              className="flex items-center justify-center no-underline"
            >
              <div 
                className={`w-[50px] h-[50px] flex items-center justify-center rounded-[6px] transition-all duration-200 ${
                  active 
                    ? 'bg-black' 
                    : 'bg-[#F3F3F6] border border-[#EDEDED]'
                }`}
                style={{ padding: '14px' }}
              >
                <img 
                  src={iconSrc}
                  alt={item.label}
                  className="w-6 h-6"
                />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}