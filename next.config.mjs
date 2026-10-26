/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static HTML export: the whole site is plain files in out/, served as-is by Vercel.
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;
