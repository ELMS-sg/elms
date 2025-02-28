/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    experimental: {
        serverComponentsExternalPackages: ['@supabase/auth-helpers-nextjs'],
    },
    reactStrictMode: false,
    swcMinify: true,
    staticPageGenerationTimeout: 180,
    productionBrowserSourceMaps: false,
}

module.exports = nextConfig 