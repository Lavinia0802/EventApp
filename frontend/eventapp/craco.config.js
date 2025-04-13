module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Find the source-map-loader rule
      const { rules } = webpackConfig.module;
      const sourceMapRule = rules.find(
        (rule) =>
          rule.use &&
          rule.use.some(
            (use) => use.loader && use.loader.includes("source-map-loader")
          )
      );

      if (sourceMapRule) {
        // Add html5-qrcode to the exclude patterns
        sourceMapRule.exclude = [/node_modules\/html5-qrcode/];
      }

      return webpackConfig;
    },
  },
  // Override webpack-dev-server configuration to remove deprecated options
  devServer: (devServerConfig) => {
    // Remove the deprecated options
    delete devServerConfig.onBeforeSetupMiddleware;
    delete devServerConfig.onAfterSetupMiddleware;

    // Add the new middleware setup function if you need custom middleware
    devServerConfig.setupMiddlewares = (middlewares, devServer) => {
      // You can add your own middleware here if needed
      return middlewares;
    };

    return devServerConfig;
  },
};
