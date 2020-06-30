import pageLoading from './Loading2.vue'

let [ Loading2, pageLoadInstance ] = [ {}, null ];

Loading2.install = (Vue) => {
  if (!pageLoadInstance) {
    // 扩展vue实例，引入loading
    const Loading = Vue.extend(pageLoading); 
    // 创建loading实例并挂载
    pageLoadInstance = new Loading().$mount(); 
    document.body.appendChild(pageLoadInstance.$el);
  }
  // $loading即是你后期调用的名称
  Vue.prototype.$loading2 = { 
    show() {
      pageLoadInstance.show = true;
    },
    hide() {
      pageLoadInstance.show = false
    }
  }
}

export default Loading2
