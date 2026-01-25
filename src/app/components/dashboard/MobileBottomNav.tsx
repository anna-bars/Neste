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
    <div className="xl:hidden fixed border-t border-[#1a1a1a] bottom-0 left-0 right-0 z-40 bg-[#1a1a1a] py-1">
      <img src="/nav/mob-right-top.svg" className='absolute -top-[28.5px] right-0' alt="" />
      <img src="/nav/mob-left-top.svg" className='absolute -top-[28.5px] left-0' alt="" />
      <div className="flex justify-between items-center h-[70px] px-4">
        {navItems.map((item) => {
          const active = isActive(item.label)
          const iconSrc = active 
            ? `/nav/icons/${item.icon}-active.svg`
            : `/nav/icons/${item.icon}.svg`
          
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => onNavClick(item.label)}
              className="flex flex-col items-center justify-center no-underline flex-1"
            >
              <div className="flex flex-col items-center justify-center">
                <img 
                  src={iconSrc}
                  alt={item.label}
                  className="w-6 h-6 mb-1"
                />
                <span className={`text-[10px] font-medium transition-all duration-200 ${
                  active ? 'text-white' : 'text-gray-400'
                }`}>
                  {item.label}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}