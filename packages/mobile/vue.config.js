// const webpack = require('webpack');
const path = require('path');
const defaultCssVars = require('cloudpivot/common/styles/variable').mobile;
const extendLessVars = require('./extends/theme');
const modifyVars = Object.assign({}, defaultCssVars, extendLessVars);
// const momentIgnore = new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/);
const proxy = require('../../config/proxy');
const { smp } = require('../../config/common-config');
const pages = {
  main: {
    entry: 'src/main.ts',
    template: 'public/index.html',
    filename: 'index.html',
    chunks: ['chunk-vendors', 'chunk-common', 'chunk-echarts', 'main'],
  },
  externalLink: {
    entry: 'src/views/externalLink/apps.ts',
    template: 'src/views/externalLink/el.html',
    filename: 'el.html',
    chunks: ['chunk-vendors', 'chunk-common', 'chunk-echarts', 'externalLink'],
  },
};
console.log(process.env.NODE_ENV, 'process.env');
const report = process.env.npm_config_report;
let configureWebpack = () => {
  return {
    devtool:
      process.env.NODE_ENV === 'production' ? false : 'cheap-eval-source-map',
    plugins: [],
  };
};
if (report) {
  configureWebpack = smp.wrap({
    plugins: [],
  });
}
module.exports = {
  publicPath: '/mobile/',
  pages,
  filenameHashing: true,
  lintOnSave: process.env.NODE_ENV !== 'production',
  // 处理IE兼容————vuex持久化脚本语法转译
  transpileDependencies: ['vuex-persist', 'flatted', 'ansi-regex'], // /cloudpivot\/[\w-]+/],
  configureWebpack,
  devServer: {
    port: 8089,
    open: true,
    disableHostCheck: true,
    overlay: {
      warnings: true,
      errors: true,
    },
    proxy: proxy,
    before: (app) => {
      app.all('*', function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With');
        res.header(
          'Access-Control-Allow-Methods',
          'PUT,POST,GET,DELETE,OPTIONS',
        );
        res.header('X-Powered-By', '3.2.1');
        if (req.method === 'OPTIONS') {
          res.sendStatus(200);
        } else {
          next();
        }
      });
    },
  },
  css: {
    loaderOptions: {
      less: {
        modifyVars: modifyVars,
        javascriptEnabled: true,
      },
    },
    extract:
      process.env.NODE_ENV === 'production'
        ? {
            ignoreOrder: true,
          }
        : false,
  },
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@', path.resolve(__dirname, './src'))
      .set('assets', path.resolve(__dirname, './src/assets'))
      .set('styles', path.resolve(__dirname, './src/styles'));
    // 删除预加载, preload删除方式一样
    ['main', 'externalLink'].forEach((name) =>
      config.plugins.delete(`prefetch-${name}`),
    );
    // 优化打包
    config.optimization.splitChunks({
      minSize: 300000,
      maxInitialRequests: 6,
      cacheGroups: {
        echarts: {
          name: 'chunk-echarts',
          test: /[/]node_modules[/]echarts[/]/,
          chunks: 'all',
          priority: 4,
          reuseExistingChunk: true,
          enforce: true,
        },
        vendors: {
          name: 'chunk-vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          chunks: 'initial',
        },
        common: {
          name: 'chunk-common',
          minChunks: 2,
          priority: -20,
          chunks: 'initial',
          reuseExistingChunk: true,
        },
      },
    });
  },
};
