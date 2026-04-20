const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add uppercase image extensions so Metro treats them as assets, not JS
config.resolver.assetExts.push('PNG');

module.exports = config;
