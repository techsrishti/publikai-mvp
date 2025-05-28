/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
    }
    return config
  },
  async rewrites() {
    return [
      {
        source: '/webhooks/:path*',
        destination: '/api/webhooks/:path*',
      },
    ];
  },
}

export default nextConfig
