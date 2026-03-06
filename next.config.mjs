/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'axpbqctscvosoufbfvst.supabase.co',
      },
    ],
  },
}

export default nextConfig