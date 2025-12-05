/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/SimplrTask00' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/SimplrTask00' : '',
};

export default nextConfig;
