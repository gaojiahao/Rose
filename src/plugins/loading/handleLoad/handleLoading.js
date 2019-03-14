import loading from './handleLoading.vue'

let instance = null; // 检测实例是否创建的标志位
let HandleLoad = {};
HandleLoad.install = (Vue) => {
  if (!instance) {
    const Loading = Vue.extend(loading); // 扩展vue实例，引入loading
    instance = new Loading().$mount(); // 创建loading实例并挂载
    document.body.appendChild(instance.$el)
  }
  Vue.prototype.$HandleLoad = { // $loading即是你后期调用的名称
    show() {
      instance.show = true;
    },
    hide() {
      instance.show = false;
    }
  }
}
export default HandleLoad
