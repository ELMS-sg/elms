/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'futofgoylaprwlulpuuw.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },
    serverExternalPackages: ['@supabase/auth-helpers-nextjs'],
    reactStrictMode: false,
    staticPageGenerationTimeout: 180,
    productionBrowserSourceMaps: false,
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
    eslint: {
        // Allow production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '5mb'
        }
    }
}

module.exports = nextConfig 