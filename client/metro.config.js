const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Fix for Apollo Client tslib compatibility
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

// Configure path alias for @ -> . (current directory)
config.resolver.extraNodeModules = {
  '@': __dirname,
};

module.exports = withNativeWind(config, { input: './global.css' });
