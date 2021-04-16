const webpack = require('webpack');

module.exports = {
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      mimeTypes: { 'application/wasm': ['wasm'] },
    },
    port: 9000,
  },
  configureWebpack: {
    name: 'Expressionista',
  }
};