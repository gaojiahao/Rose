import pageLoading from './Loading.vue'

let [ Loading, pageLoadInstance ] = [ {}, null ];

Loading.install = (Vue) => {
  if (!pageLoadInstance) {
    // 扩展vue实例，引入loading
    const Loading = Vue.extend(pageLoading); 
    // 创建loading实例并挂载
    pageLoadInstance = new Loading().$mount(); 
    document.body.appendChild(pageLoadInstance.$el);
  }
  // $loading即是你后期调用的名称
  Vue.prototype.$loading = { 
    show() {
      pageLoadInstance.show = true;
    },
    hide() {
      pageLoadInstance.show = false
    }
  }
}

export default Loading
