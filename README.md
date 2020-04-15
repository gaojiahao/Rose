# role

> A Vue.js project

## 关于样式的开发规范
 1. sass 默认引入了base.scss，所以在vue组件中，不用重复引入mixin，base,variable，里面定义的变量和函数，可以直接调用。
2. 全局样式写到了assets/app.less里（在app.vue里引入）

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
