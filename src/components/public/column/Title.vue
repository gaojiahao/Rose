<template>
<div class="matter_name">
    <span>{{title}}</span>
    <span class="iconfont icon-shanchu1" @click="$emit('click')"></span>
</div>
</template>
<script>
import Vue from 'vue'
let  cfg = {
    props:['title']  
}
export default Vue.component('RColumnTitle',cfg);
</script>