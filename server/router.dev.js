const webpack = require('webpack')
const path = require('path')
const MemoryFS = require('memory-fs')
const VueServerRenderer = require('vue-server-renderer')
const fs = require('fs')
const KoaRouter = require('koa-router')
const axios = require('axios')

// 1. 获取webpack配置文件
const webpackConfig = require('@vue/cli-service/webpack.config')
// 2. 编译webpack配置文件
const serverComplier = webpack(webpackConfig)

// 3. 设置webpack打包到内存中
const mfs = new MemoryFS()
serverComplier.outputFileSystem = mfs

// 4.监听文件的修改，获取最新的vue-ssr-server-bundle.json
let bundle
serverComplier.watch({}, (err, stats) => {
  if (err) {
    throw err
  }
  stats = stats.toJson()
  stats.errors.forEach(error => console.error(error))
  stats.warnings.forEach(warning => console.warn(warning))
  const bundlePath = path.join(webpackConfig.output.path, 'vue-ssr-server-bundle.json')
  bundle = JSON.parse(mfs.readFileSync(bundlePath, 'utf-8'))
  console.log('new bundle created')
})

const template = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf-8')

const router = new KoaRouter()
router.get('/(.*)', async ctx => {
  const clientManifestResp = await axios.get(`http://localhost:${process.env.CLIENT_PORT}/vue-ssr-client-manifest.json`)
  if (!bundle) {
    ctx.body = '正在构建中，请稍后刷新重试'
    return
  }
  const render = VueServerRenderer.createBundleRenderer(bundle, {
    runInNewContext: false,
    template, // html模板
    clientManifest: clientManifestResp.data, // 客户端激活
  })
  let res = null
  try {
    res = await new Promise((resolve, reject) => {
      const context = { url: ctx.path }
      render.renderToString(context, (err, html) => {
        if (err) {
          reject(err)
        }
        resolve(html)
      })
    })
  } catch (error) {
    console.log(error)
    res = 404
  }
  ctx.body = res
})

module.exports = router
