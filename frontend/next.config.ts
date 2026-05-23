// // frontend/next.config.ts
// import type { NextConfig } from 'next'

// const nextConfig: NextConfig = {
//   output: 'standalone',
//   poweredByHeader: false,
//   images: { unoptimized: true },
//   typescript: { ignoreBuildErrors: false },

//   // allows access from your network IP
//   allowedDevOrigins: ['192.168.56.1', 'localhost', '127.0.0.1'],

//   async rewrites() {
//     return process.env.NODE_ENV === 'development'
//       ? [
//           {
//             source: '/api/:path*',
//             destination: `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}/:path*`
//           }
//         ]
//       : []
//   }
// }

// export default nextConfig

// frontend/next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: false },
  allowedDevOrigins: ['192.168.56.1', 'localhost', '127.0.0.1'],

  async rewrites() {
    // Always proxy in development (you can keep it for production too)
    return [
      {
        source: '/api/:path*',
        destination: 'http://10.76.45.166:5000/api/:path*' // your backend URL
      }
    ]
  }
}

export default nextConfig
