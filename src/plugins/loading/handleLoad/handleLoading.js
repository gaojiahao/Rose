import loading from './handleLoading.vue'

let [ instance, HandleLoad ] = [ null, {} ];

HandleLoad.install = (Vue) => {
  if (!instance) {
    // 扩展vue实例，引入loading
    const Loading = Vue.extend(loading); 
    // 创建loading实例并挂载
    instance = new Loading().$mount(); 
    document.body.appendChild(instance.$el)
  }
  // $HandleLoad 即是你后期调用的名称
  Vue.prototype.$HandleLoad = { 
    show() {
      instance.show = true;
    },
    hide() {
      instance.show = false;
    }
  }
}

export default HandleLoad
