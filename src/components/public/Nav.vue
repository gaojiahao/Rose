<template>
    <div class="page-navigation">
          <div v-show="goback!=false" class="goback" @click="$router.go(-1)"><i class="iconfont icon-back1"></i></div>
          <div class="body">{{title || $route.meta.title || ''}}</div>
    </div>
</template>
<script>
import Vue from 'vue'
var component = {
  props: ['goback','title']
};
export default Vue.component("RNav", component);
</script>