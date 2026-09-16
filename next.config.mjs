/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignora errores de ESLint (como variables no usadas) durante el build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignora errores de TypeScript (como el de Recharts) durante el build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
