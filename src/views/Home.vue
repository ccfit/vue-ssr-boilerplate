<template>
  <div class="home"></div>
</template>

<script>
import titleMixins from '../mixins/title-mixin'
export default {
  name: 'home',
  mixins: [titleMixins], // 加入mixins，通过title函数改变标题
  asyncData({ store, route }) {
    // console.log(store, route)
  }, // 服务端和客户端预获取数据
  title() {
    return ''
  },
}
</script>
<style lang="less" scoped>
</style>
