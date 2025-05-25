/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
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
