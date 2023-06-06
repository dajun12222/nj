module.exports = {
  moduleFileExtensions: ['js', 'jsx', 'json', 'vue', 'ts', 'tsx'],

  transform: {
    '^.+\\.vue$': 'vue-jest',
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$':
      'jest-transform-stub',
    '^.+\\.tsx?$': 'ts-jest',
  },

  snapshotSerializers: ['jest-serializer-vue'],

  testMatch: [
    '**/tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)',
  ],

  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/tests/__mocks__/fileMock.js', // 配置这一行主要是担心css文件中有.png等其他文件的引入
    '\\.(css|less)$': '<rootDir>/tests/__mocks__/styleMock.js',
  },

  testURL: 'http://localhost/',
  collectCoverage: false,
  coverageDirectory: '<rootDir>/test/coverage',

  collectCoverageFrom: [
    '**/src/**',
    '**/*.{js,ts,vue}',
    '!**/src/icons/**',
    '!**/src/styles/**',
    '!**/src/directives/**',
    '!**/src/locale/**',
    '!**/src/typings/**',
    '!**/node_modules/**',
    '!**/packages/**',
    '!**/dist/**',
    '!**/src/assets/**',
    '!**/src/router/**',
    '!**/src/views/login/**',
    '!**/src/views/oauth/**',
  ],

  coverageReporters: ['html', 'text-summary'],
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  setupFiles: ['<rootDir>/tests/__mocks__/mainMock.js'], //启动jest需要的文件
};
