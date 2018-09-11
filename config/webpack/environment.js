const { environment } = require('@rails/webpacker')
const typescript =  require('./loaders/typescript')
const webpack = require('webpack')

environment.plugins.prepend('Environment', new webpack.DefinePlugin({
  'process.env.DOMAIN': JSON.stringify("http://localhost:3002")
}));

environment.loaders.append('typescript', typescript)
module.exports = environment