const webpack = require("webpack");

module.exports = {
  devServer: {
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    port: 9000
  },
  configureWebpack: {
    name: "Expressionista",
    module: {
      rules: [
        // wasm files should not be processed but just be emitted and we want
        // to have their public URL.
        {
          test: /WasmModule\.wasm$/,
          // test: /WasmModule\.wasm$|WasmModule\.js$/,
          type: "javascript/auto",
          loader: "file-loader"
        },
        // {
        //   test: /WasmModule\.js$/,
        //   loader: "exports-loader",
        //   options: {
        //     exports: "sayHello"
        //   }
        // }
      ]
    }
  },
  chainWebpack: config => {
    config.resolve.alias.set('vue', '@vue/compat')

    config.module
        .rule('vue')
        .use('vue-loader')
        .tap(options => {
          return {
            ...options,
            compilerOptions: {
              compatConfig: {
                MODE: 2
              }
            }
          }
        })
  }
};