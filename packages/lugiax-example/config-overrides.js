/**
 *
 * create by ligx
 *
 * @flow
 */
const { getBabelLoader, addBabelPlugin , override,} = require('customize-cra');

module.exports = function(config, env) {
  console.info(getBabelLoader(config));

  const cfg = getBabelLoader(config);

  cfg.options.plugins = [];

  return override(addBabelPlugin(
    [
      'import',
      {
        libraryName: '@lugia/lugia-web',
        libraryDirectory: 'dist',
      },
      '@lugia/lugia-web',
    ],
    'fix-@lugia/lugia-web-imports'
  ))(config);
};
