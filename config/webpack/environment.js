const { environment } = require('@rails/webpacker');
const typescript =  require('./loaders/typescript');
const webpack = require('webpack');
const dotenv = require('dotenv');
const fs = require('fs');

const pathname = `./${process.env.NODE_ENV}.env`;

try {
  if (fs.existsSync(pathname)) {
    dotenv.config({ path: pathname, silent: true });
  }
} catch (e) {
  console.log(e);
}

environment.plugins.prepend('Environment', new webpack.EnvironmentPlugin(JSON.parse(JSON.stringify(process.env))));

environment.loaders.append('typescript', typescript);
environment.loaders.append('html', {
  test: /\.html$/,
  use: [{
    loader: 'html-loader',
    options: {
      minimize: true,
      removeAttributeQuotes: false,
      caseSensitive: true,
      customAttrSurround: [[/#/, /(?:)/], [/\*/, /(?:)/], [/\[?\(?/, /(?:)/]],
      customAttrAssign: [/\)?\]?=/]
    }
  }]
});
module.exports = environment;