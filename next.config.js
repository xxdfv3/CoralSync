import { withPayload } from '@payloadcms/next/withPayload';

/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: async () => [
    { source: "/sing-in", destination: "/sign-in", permanent: true },
    { source: "/sing-up", destination: "/sign-up", permanent: true },
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'image.tmdb.org' },
      { protocol: 'https', hostname: 's4.anilist.co' },
    ],
  },
  serverExternalPackages: ['mongoose', 'ioredis'],
};

export default withPayload(nextConfig);
