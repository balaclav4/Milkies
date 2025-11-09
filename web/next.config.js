/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimized for static export - works on Netlify/Vercel
  output: 'standalone',
}

module.exports = nextConfig
