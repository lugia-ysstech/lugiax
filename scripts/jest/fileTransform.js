const path = require('path');

// This is a custom Jest transformer turning file imports into filenames.
// http://facebook.github.io/jest/docs/tutorial-webpack.html

module.exports = {
  process(src, filename) {
    console.info('aaa', path.basename(filename));
    return `module.exports = ${JSON.stringify(path.basename(filename))};`;
  },
};
