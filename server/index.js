const Koa = require('koa')
const KoaStatic = require('koa-static')
const server = new Koa()
const port = 5050
const { isProd } = require('../utils/env')
const path = require('path')
const router = isProd ? require('./router.prod') : require('./router.dev')
const koaMount = require('koa-mount')
server.use(koaMount('/assets', KoaStatic(path.join(__dirname, '../dist/assets'))))
server.use(router.routes())
server.use(router.allowedMethods())

server.listen(port, () => {
  console.log(`server started at http://localhost:${port}`)
})
