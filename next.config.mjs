import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mysql2'],
  webpack: (config) => {
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      path.join(__dirname, 'node_modules'),
    ]
    return config
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
