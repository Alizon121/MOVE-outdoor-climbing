const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow importing drizzle migration .sql files.
config.resolver.sourceExts.push('sql');

module.exports = config;
