module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Ensure resolve.fallback exists
      if (!webpackConfig.resolve) {
        webpackConfig.resolve = {};
      }
      
      if (!webpackConfig.resolve.fallback) {
        webpackConfig.resolve.fallback = {};
      }

      // Add fallback for Node.js modules that aren't available in the browser
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "fs": false,
        "path": false,
        "crypto": false,
        "stream": false,
        "util": false,
        "buffer": false,
        "process": false,
      };

      // Add support for WASM files
      if (!webpackConfig.experiments) {
        webpackConfig.experiments = {};
      }
      
      webpackConfig.experiments = {
        ...webpackConfig.experiments,
        asyncWebAssembly: true,
        syncWebAssembly: true,
      };

      // Add rule for .wasm files
      webpackConfig.module.rules.push({
        test: /\.wasm$/,
        type: 'webassembly/async',
      });

      // Ignore specific warnings about node modules
      if (!webpackConfig.ignoreWarnings) {
        webpackConfig.ignoreWarnings = [];
      }
      
      webpackConfig.ignoreWarnings.push(/Failed to parse source map/);

      return webpackConfig;
    },
  },
};
