import { withPayload } from '@payloadcms/next/withPayload';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'image.tmdb.org' },
      { protocol: 'https', hostname: 's4.anilist.co' },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['mongoose', 'ioredis'],
  },
};

export default withPayload(nextConfig);
