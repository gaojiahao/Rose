import pageLoading  from './Loading.vue'
let pageLoadInstance = null, // 检测页面加载动画实例是否创建的标志位
    Loading = {};
Loading.install = (Vue) => {
  Vue.prototype.$loading = { // $loading即是你后期调用的名称
    show () {
      const Loading = Vue.extend(pageLoading) // 扩展vue实例，引入loading
      pageLoadInstance = new Loading().$mount() // 创建loading实例并挂载
      document.body.appendChild(pageLoadInstance.$el)

    },
    hide () {
      // 只有实例存在，才会隐藏
      if (!pageLoadInstance) return
      pageLoadInstance.show = false
    }
  }
}

export default Loading