const VueServerRenderer = require('vue-server-renderer')
const KoaRouter = require('koa-router')
const fs = require('fs')
const path = require('path')
const serverBundle = require('../dist/vue-ssr-server-bundle.json')
const clientManifest = require('../dist/vue-ssr-client-manifest.json')

const router = new KoaRouter()

const template = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf-8')
router.get('/(.*)', async ctx => {
  let res
  try {
    res = await new Promise((resolve, reject) => {
      const render = VueServerRenderer.createBundleRenderer(serverBundle, {
        runInNewContext: false,
        template,
        clientManifest,
      })
      const context = { url: ctx.path }
      render.renderToString(context, (err, html) => {
        if (err) {
          reject(err)
        }
        resolve(html)
      })
    })
  } catch (error) {
    res = 404
  }
  ctx.body = res
})

module.exports = router
