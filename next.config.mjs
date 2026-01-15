import { createMDX } from 'fumadocs-mdx/next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts', {
  // Enable TypeScript type generation for translation keys
  typeGeneration: true
});
const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: ''
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '64321'
      },
      {
        protocol: 'https',
        hostname: 'llmgwifgtszjgjlzlwjq.supabase.co',
        port: ''
      }
    ]
  }
};

export default withNextIntl(withMDX(config));


