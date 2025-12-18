const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Disable Hermes for web platform
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: false,
    },
  }),
  // Don't use Hermes for web
  hermesParser: false,
};

// Add web-specific extensions
config.resolver = {
  ...config.resolver,
  sourceExts: [...(config.resolver?.sourceExts || []), 'jsx', 'js', 'ts', 'tsx', 'json', 'mjs', 'cjs'],
  // Force packages to use CommonJS build instead of ESM (avoids import.meta)
  resolverMainFields: ['react-native', 'browser', 'main'],
  // Use react-native condition to get CJS builds that don't use import.meta
  unstable_conditionNames: ['react-native', 'browser', 'require', 'default'],
};

module.exports = withNativeWind(config, { input: './app/global.css' });