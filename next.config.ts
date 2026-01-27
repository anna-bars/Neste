// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nezqmciisxrdcaggmjjs.supabase.co',
        pathname: '/storage/v1/object/public/avatars/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
    ],
  },
  
  // Ավելացրեք TypeScript կարգավորումները
  typescript: {
    ignoreBuildErrors: true, // Սա կանջատի TypeScript սխալները
  },
  
  
}

export default nextConfig