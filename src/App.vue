<template>
  <div id="app">
    <keep-alive>
      <router-view/>>
    </keep-alive>
      
      
      <nav class="weui-tabbar">
        <router-link class="weui-tabbar__item" v-for="tab in tablist" :to="tab.path">
            <p class="weui-tabbar__label">{{tab.title}}</p>
        </router-link>

      </nav>
  </div>
</template>

<script>
export default {
  data(){
    return {
        tablist:[
            {title:'我的待办',path:'/to_do'},
            {title:'我的已办',path:'/finish'},            
        ]
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
