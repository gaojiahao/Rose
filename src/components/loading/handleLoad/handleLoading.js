import loading  from './handleLoading.vue'
let instance = null // 检测实例是否创建的标志位
let HandleLoad = {}
HandleLoad.install = (Vue) => {
  Vue.prototype.$HandleLoad = { // $loading即是你后期调用的名称
    show () {
      const Loading = Vue.extend(loading) // 扩展vue实例，引入loading
      instance = new Loading().$mount() // 创建loading实例并挂载
      document.body.appendChild(instance.$el)
      // root.appendChild(instance.$el) // 向指定目录添加dom
    },
    hide () {
      // 只有实例存在，才会隐藏
      if (!instance) return
      instance.handle = false
    }
  }
}
export default HandleLoad