import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import { UserProvider } from '@/app/context/UserContext';
import { Toaster } from 'react-hot-toast'
import './globals.css'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400','500','600','700'] })


export const metadata: Metadata = {
  title: 'Cargo Guard - Logistics Insurance',
  description: 'Instant cargo insurance quotes for global logistics',
  icons: {
    icon: '/favicon.png', // կամ '/favicon.svg'
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
         <UserProvider >
          {children}
        <Toaster position="top-right" />
         </UserProvider>
        
      </body>
    </html>
  )
}