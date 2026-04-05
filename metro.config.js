const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("obj", "ttf", "wav", "mp3");

config.resolver.alias = {
  ...(config.resolver.alias || {}),
  "@": path.resolve(__dirname, "src"),
};

module.exports = config;
