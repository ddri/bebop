const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Keep any existing experimental features
  },
  // Enable source maps for better debugging in production
  productionBrowserSourceMaps: false,
  // Optimize images
  images: {
    domains: ['example.com'], // Add your domains here
  },
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Optimize bundle splitting
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
          },
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|shadcn-ui)[\\/]/,
            name: 'ui',
            priority: 20,
            chunks: 'all',
          },
          codemirror: {
            test: /[\\/]node_modules[\\/](@codemirror|@uiw\/react-codemirror)[\\/]/,
            name: 'codemirror',
            priority: 20,
            chunks: 'all',
          },
        },
      };
    }

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);