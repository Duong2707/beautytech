const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Bật tính năng package exports (giữ nguyên như bạn đang dùng)
config.resolver.unstable_enablePackageExports = true;

// Ngăn Metro cố gắng phân giải better-sqlite3 (chỉ dùng cho Node.js, không dùng trên mobile)
config.resolver.blockList = [
  /node_modules\/better-sqlite3\/.*/,
];

module.exports = config;