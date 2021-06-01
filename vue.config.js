const path = require('path')
const nodeExternals = require('webpack-node-externals')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const { isDev, isServer } = require('./utils/env')
function resolve(pathParams) {
  return path.join(__dirname, pathParams)
}
let output = {}
let entry = ''
let target = ''
let externals
const plugins = []
const optimization = {}

if (isServer) {
  output = {
    libraryTarget: 'commonjs2', //  node commonjs风格
  }
  entry = resolve('./src/entry-server.js')
  target = 'node'
  // 处理css文件
  externals = nodeExternals({
    allowlist: /\.css$/,
  })
  optimization.splitChunks = false // 关掉分割文件
  plugins.push(new VueSSRServerPlugin())
} else {
  target = 'web'
  entry = resolve('./src/entry-client.js')
  plugins.push(new VueSSRClientPlugin())
}
let url = `http://localhost:${process.env.CLIENT_PORT}`
let publicPath = isDev ? url : undefined // 设置静态资源文件地址
module.exports = {
  publicPath,
  assetsDir: 'assets', // 静态资源
  css: {
    extract: true, // 生产环境开启提取css文件
    sourceMap: false, //是否增加sourcemap
  },
  productionSourceMap: false,
  devServer: {
    port: process.env.CLIENT_PORT, // 改变本地开发服务器端口
    headers: { 'Access-Control-Allow-Origin': '*' }, // 解决跨域
    historyApiFallback: true, // 找不到返回index.html
    // proxy: {
    //   '/': {  // 匹配路径
    //     target: '', // 请求接口地址
    //     changeOrigin: true, // 设置之后访问的接口地址是可以是域名
    //   },
    // },
  },
  configureWebpack: () => ({
    output,
    entry,
    target,
    externals,
    plugins,
    optimization,
  }),
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => {
        if (isServer) {
          options.cacheIdentifier += '-server'
          options.cacheDirectory += '-server'
        }
        options.optimizeSSR = isServer
        return options
      })
    // const langs = ['css', 'postcss', 'scss', 'sass', 'less', 'stylus']
    const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
    // 此处增加全局css文件
    types.forEach(type => addStyleResource(config.module.rule('less').oneOf(type)))
    // fix ssr hot update bug
    if (isServer) {
      config.plugins.delete('hmr')
    }
  },
}

function addStyleResource(rule) {
  rule
    .use('style-resource')
    .loader('style-resources-loader')
    .options({
      patterns: [path.resolve(__dirname, './src/assets/css/global.less')],
    })
}
