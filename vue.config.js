const webpack = require('webpack');

module.exports = {
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    port: 9000,
  },
  configureWebpack: {
  }
};