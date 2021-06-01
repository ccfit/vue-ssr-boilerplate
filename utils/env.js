const isProd = process.env.NODE_ENV === 'production'
const isDev = process.env.NODE_ENV === 'development'
const isServer = process.env.VUE_ENV === 'server'
module.exports = {
  isServer,
  isDev,
  isProd,
}