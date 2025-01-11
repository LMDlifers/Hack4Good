const { defineConfig } = require('@vue/cli-service');
const path = require('path');

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    entry: path.resolve(__dirname, 'src/main.js'),
  },
});
