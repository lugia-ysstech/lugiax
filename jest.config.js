module.exports = {
  collectCoverageFrom: [
    'packages/**/src/**/*.{js,jsx}',
    '!src/**/demo*.js',
    '!src/*.js',
  ],
  testMatch: ['<rootDir>/packages/**/?(*.)(spec|test).js?(x)'],
  testEnvironment: 'node',
  testURL: 'http://localhost',
  transform: {
    '.+\\.(js|jsx)$':
      '<rootDir>/node_modules/@lugia/mega-jest/lib/jsTransformer.js',
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  moduleNameMapper: {
    'react-native$': 'react-native-web',
    '\\.(css|less)$': 'identity-obj-proxy',
  },
  moduleFileExtensions: ['web.js', 'js', 'json', 'web.jsx', 'jsx'],
};
