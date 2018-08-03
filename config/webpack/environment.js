const { environment } = require('@rails/webpacker')
const typescript =  require('./loaders/typescript')

environment.loaders.append('typescript', typescript)
module.exports = environment
environment.config.set('resolve.extensions', ['.ts', '.tsx', '.js', '.jsx', 'scss', '.ico', '.svg'])
environment.config.set('resolve.modules', ['../../app/javascript', '../../node_modules'])