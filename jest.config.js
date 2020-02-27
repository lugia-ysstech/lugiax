module.exports = {
  collectCoverageFrom: ['packages/**/src/**/*.{js,jsx}', '!src/**/demo*.js', '!src/*.js',],
  testMatch: [__dirname + '/packages/**/?(*.)(spec|test).js?(x)',],
  // testEnvironment: 'node',
  testURL: 'http://localhost',
  transform: {
    '.+\\.(js|jsx)$': __dirname + '/node_modules/@lugia/mega-jest/lib/jsTransformer.js',
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$',],
  moduleNameMapper: {
    'react-native$': 'react-native-web',
    '\\.(css|less)$': 'identity-obj-proxy',
  },
  moduleFileExtensions: ['web.js', 'js', 'json', 'web.jsx', 'jsx',],
  globalSetup: __dirname + '/setup.js',
  globalTeardown: __dirname + '/teardown.js',
  testEnvironment: __dirname + '/puppeteer_environment.js',
};
