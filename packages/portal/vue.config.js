// const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const mockDir = path.resolve(__dirname, './mock');
const proxy = require('../../config/proxy');
// const defaultCssVars = require('cloudpivot/common/styles/variable').pc;
// const extendLessVars = require('./extends/theme');
// const modifyVars = Object.assign({}, defaultCssVars, extendLessVars);

const CopyWebpackPlugin = require('copy-webpack-plugin');
// const momentIgnore = new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/);
const ThemeColorReplacerPlugin = require('./webpack_theme_plugin');

const Themes = [ThemeColorReplacerPlugin()];

console.log(process.env.NODE_ENV, 'process.env');
const { smp } = require('../../config/common-config');
const report = process.env.npm_config_report;
const copy = new CopyWebpackPlugin([
  {
    from: path.resolve(
      __dirname,
      '../../node_modules/cloudpivot/form/src/renderer/components/pc/input-textarea/tinymcelib',
    ),
    to: 'tinymcelib',
    ignore: ['.*'],
  },
]);
//打包分析
let configureWebpack = () => {
  return {
    devtool:
      process.env.NODE_ENV === 'production' ? false : 'cheap-eval-source-map',
    plugins: [copy, ...Themes],
  };
};
if (report) {
  configureWebpack = smp.wrap({
    plugins: [copy, ...Themes],
  });
}
const pages = {
  main: {
    entry: 'src/main.ts',
    template: 'public/index.html',
    filename: 'index.html',
  },
  /* externalLinkOld: {
      entry: 'src/views/externalLink/externalLink-old/main.ts',
      template: 'src/views/externalLink/externalLink-old/externalLink.html',
      filename: 'externalLink.html'
    }, */
  externalLink: {
    entry: 'src/views/externalLink/externalLink/main.ts',
    template: 'src/views/externalLink/externalLink/el.html',
    filename: 'el.html',
  },
};

module.exports = {
  pages,
  parallel: false,
  filenameHashing: true,
  productionSourceMap: true,
  lintOnSave: process.env.NODE_ENV !== 'production',
  // 处理IE兼容————vuex持久化脚本语法转译
  transpileDependencies: [
    'vuex-persist',
    'flatted',
    'ansi-regex',
    '@h3print/designer',
    '@h3print/excellit',
    '@h3print/runtime',
  ],
  configureWebpack,
  devServer: {
    overlay: {
      warnings: false,
      errors: false,
    },
    port: 9100,
    open: true,
    proxy: proxy,
    before: (app) => {
      (function setMock(mockDir) {
        fs.readdirSync(mockDir).forEach(function (file) {
          const filePath = path.resolve(mockDir, file);
          let mocks;
          if (fs.statSync(filePath).isDirectory()) {
            setMock(filePath);
          } else {
            mocks = require(filePath);
            mocks.forEach((mock) => {
              app.use(mock.api, mock.response);
            });
          }
        });
      })(mockDir);
      /**
       * 支持跨域访问
       */
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
    disableHostCheck: true,
    // cssSourceMap: true,
  },
  css: {
    loaderOptions: {
      less: {
        // modifyVars: modifyVars,
        javascriptEnabled: true,
      },
    },
    sourceMap: true,
  },
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@', path.resolve(__dirname, './src'))
      .set('assets', path.resolve(__dirname, './src/assets'))
      .set('styles', path.resolve(__dirname, './src/styles'))
      .set('components', path.resolve(__dirname, './src/components'));

    // 移除 prefetch 插件
    ['externalLinkOld', 'main', 'externalLink'].forEach((name) =>
      config.plugins.delete(`prefetch-${name}`),
    );

    // config.plugin('ignore').use(momentIgnore);
    // config.module.rule('ts').use('ts-loader').tap(options => Object.assign(options, {
    //   getCustomTransformers: () => ({
    //     before: [tsImportPluginFactory([
    //       {
    //         libraryName: '@h3/awesome-ui',
    //         libraryDirectory: 'lib',
    //         style: true,
    //       }, {
    //         libraryName: '@h3/report',
    //         libraryDirectory: 'lib',
    //         style: true,
    //       }
    //     ])]
    //   }),
    //   // include: path.join(__dirname, 'node_modules/h3-antd-pro/components'),
    // }));

    // 优化打包
    config.optimization.splitChunks({
      minSize: 300000,
      maxInitialRequests: 6,
      cacheGroups: {
        xlsx: {
          name: 'xlsx',
          test: /[\\/]node_modules[\\/]xlsx[\\/]/,
          minSize: 0,
          minChunks: 1,
          reuseExistingChunk: true,
          chunks: 'all',
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

    config.module
      .rule('images')
      .use('url-loader')
      .loader('url-loader')
      .tap((options) => Object.assign(options, { limit: 1024 }));
  },
};
