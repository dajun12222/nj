module.exports = {
  presets: ['@babel/preset-env', ['@vue/app']],
  plugins: [
    [
      'import',
      { libraryName: '@h3/awesome-ui', libraryDirectory: 'lib', style: true },
    ],
    [
      'import',
      { libraryName: '@h3/antd-vue', libraryDirectory: 'lib', style: true },
      '@h3/antd-vue',
    ],
    [
      'import',
      { libraryName: '@h3/report', libraryDirectory: 'lib', style: true },
      '@h3/report',
    ],
  ],
};
