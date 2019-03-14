import pageLoading from './Loading.vue'

let pageLoadInstance = null, // 检测页面加载动画实例是否创建的标志位
  Loading = {};
Loading.install = (Vue) => {
  if (!pageLoadInstance) {
    const Loading = Vue.extend(pageLoading); // 扩展vue实例，引入loading
    pageLoadInstance = new Loading().$mount(); // 创建loading实例并挂载
    document.body.appendChild(pageLoadInstance.$el);
  }
  Vue.prototype.$loading = { // $loading即是你后期调用的名称
    show() {
      pageLoadInstance.show = true;
    },
    hide() {
      pageLoadInstance.show = false
    }
  }
}

export default Loading
