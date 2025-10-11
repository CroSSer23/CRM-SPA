/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/sign-in',
        destination: '/',
        permanent: false,
      },
      {
        source: '/sign-up',
        destination: '/',
        permanent: false,
      },
      {
        source: '/sign-in/:path*',
        destination: '/',
        permanent: false,
      },
      {
        source: '/sign-up/:path*',
        destination: '/',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig

