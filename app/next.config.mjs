

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mysql2'],
  async rewrites() {
    const API_URL = process.env.API_URL ?? 'http://localhost:3001'
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-select'],
    allowedDevOrigins: ['192.168.100.13'],
  },
  reactStrictMode: true,
}

export default nextConfig

