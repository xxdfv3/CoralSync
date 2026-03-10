import { withPayload } from '@payloadcms/next/withPayload';

/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: async () => [
    { source: "/sing-in", destination: "/sign-in", permanent: true },
    { source: "/sing-up", destination: "/sign-up", permanent: true },
  ],
  images: {
    remotePatterns: [
      // Payload Media на том же origin (dev: localhost) — иначе next/image падает на /api/media/file/...
      { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/api/media/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '3000', pathname: '/api/media/**' },
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'image.tmdb.org' },
      { protocol: 'https', hostname: 's4.anilist.co' },
    ],
  },
  serverExternalPackages: ['mongoose'],
};

export default withPayload(nextConfig);
