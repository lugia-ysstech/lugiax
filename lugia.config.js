export default {
  disableCSSModules: true,
  cssModulesWithAffix: true,
  applyWebpack(webpackConfig, { webpack, merge }) {
    return webpackConfig;
  },
  extraBabelPlugins: [
    [require.resolve('@babel/plugin-proposal-export-default-from')],
  ],
};
