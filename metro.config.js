const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const emptyModulePath = path.resolve(__dirname, 'empty-module.js');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Nếu Metro cố gắng tìm better-sqlite3, hãy trỏ nó tới file rỗng
  if (moduleName === 'better-sqlite3') {
    return {
      filePath: emptyModulePath,
      type: 'sourceFile',
    };
  }
  // Các module khác vẫn resolve bình thường
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;