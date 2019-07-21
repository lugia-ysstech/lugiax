const vfs = require('vinyl-fs');
const babel = require('@babel/core');
const through = require('through2');
const Terser = require('terser');
const chalk = require('chalk');
const rimraf = require('rimraf');
const { readdirSync, readFileSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');
const chokidar = require('chokidar');
const slash = require('slash');
const { packagesDirName, igronPkgs } = require('./config.json');

const cwd = process.cwd();

const nodeBabelConfig = {
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        targets: {
          browsers: ['last 2 versions', 'ie 10'],
        },
      },
    ],
    require.resolve('@babel/preset-flow'),
    require.resolve('@babel/preset-react'),
  ],
  plugins: [
    [require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
    [
      require.resolve('@babel/plugin-proposal-class-properties'),
      { loose: true },
    ],
    [require.resolve('babel-plugin-add-module-exports')],
    [
      require.resolve('@babel/plugin-transform-runtime'),
      {
        corejs: false,
        helpers: true,
        regenerator: true,
        useESModules: false,
      },
    ],
  ],
};

// need Webpack
const browserBabelConfig = {
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        targets: {
          ie: 9,
        },
        ignoreBrowserslistConfig: true,
        useBuiltIns: false, // use @babel/polyfill
        modules: false,
      },
    ],
    require.resolve('@babel/preset-react'),
  ],
  plugins: [
    [require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
    [
      require.resolve('@babel/plugin-proposal-class-properties'),
      { loose: true },
    ],
    [require.resolve('babel-plugin-add-module-exports')],
    [
      require.resolve('@babel/plugin-transform-runtime'),
      {
        corejs: false,
        helpers: true,
        regenerator: true,
        useESModules: true,
      },
    ],
  ],
};

// const BROWSER_FILES = ['packages/mega-utils/src/stripLastSlash.js'];
const BROWSER_FILES = [];

function isBrowserTransform(path) {
  return BROWSER_FILES.includes(path.replace(`${slash(cwd)}/`, ''));
}

function transform(opts = {}) {
  const { content, path } = opts;
  const winPath = slash(path);
  const isBrowser = isBrowserTransform(winPath);
  console.log(
    chalk[isBrowser ? 'yellow' : 'green'](
      `[TRANSFORM] ${winPath.replace(`${cwd}/`, '')}`,
    ),
  );
  const config = isBrowser ? browserBabelConfig : nodeBabelConfig;
  return babel.transform(content, config).code;
}

function buildPkg(pkg, minify = false) {
  const pkgPath = join(cwd, packagesDirName, pkg);
  if (!existsSync(pkgPath)) {
    chalk.yellow(`[${pkg}] was not found`);
    return;
  }
  if (~igronPkgs.indexOf(pkg)) {
    chalk.green(`[${pkg}] is igrone.`);
    return;
  }
  rimraf.sync(join(pkgPath, 'lib'));

  vfs
    .src([
      `./${packagesDirName}/${pkg}/src/**/*.js`,
      `!./${packagesDirName}/${pkg}/src/**/fixtures/**/*.js`,
      `!./${packagesDirName}/${pkg}/src/**/*.test.js`,
    ])
    .pipe(
      through.obj((f, enc, cb) => {
        let tcode = transform({
          content: f.contents,
          path: f.path,
        });
        if (minify) {
          tcode = Terser.minify(tcode, { sourceMap: true }).code;
        }
        f.contents = Buffer.from(tcode);
        cb(null, f);
      }),
    )
    .pipe(vfs.dest(join('./', packagesDirName, pkg, './lib')));
}

function watch(pkg) {
  const watcher = chokidar.watch(join(cwd, packagesDirName, pkg, 'src'), {
    ignoreInitial: true,
  });
  watcher.on('all', (event, fullPath) => {
    fullPath = slash(fullPath);
    if (!existsSync(fullPath)) return;
    const relPath = fullPath.replace(
      slash(`${cwd}/${packagesDirName}/${pkg}/src/`),
      '',
    );
    const content = readFileSync(fullPath, 'utf-8');
    try {
      const code = transform({
        content,
        path: fullPath,
      });
      writeFileSync(
        join(cwd, packagesDirName, pkg, 'lib', relPath),
        code,
        'utf-8',
      );
    } catch (e) {
      console.log(chalk.red('Compiled failed.'));
      console.log(chalk.red(e.message));
    }
  });
}

function build() {
  const dirs = readdirSync(join(cwd, packagesDirName));
  const { argv } = process;
  const isWatch = argv.includes('-w') || argv.includes('--watch');
  const minify = argv.includes('-m') || argv.includes('--minify');
  dirs
    .filter(pkg => {
      return igronPkgs.indexOf(pkg) === -1;
    })
    .forEach(pkg => {
      if (pkg.charAt(0) === '.') return;
      buildPkg(pkg, minify);
      if (isWatch) watch(pkg);
    });
}

module.exports = { buildPkg, build, watch };
