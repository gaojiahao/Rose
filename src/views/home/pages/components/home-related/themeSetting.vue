<!--
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: Gabriel.gaojiahao
 * @Date: 2019-11-29 16:43:54
 * @LastEditors: Gabriel.gaojiahao
 * @LastEditTime: 2019-11-29 18:01:15
 -->
<template>
  <div class="app-root">
    <slot name="nav"></slot>
    <div class="app-container">
        <group title="主题设置">
            <radio :options="themes" @on-change="change" v-model="theme"></radio>
        </group>
    </div>
  </div>
</template>
<script>
import { Radio, Group } from 'vux'
export default {
    name: "THEMESETTING",
    data() {
        return {
            themes: [ 'default-theme', 're-theme', 'gr-theme', 'ye-theme', 'pu-theme' ],
            theme: ''
        }
    },
    components: {
        Radio,
        Group
    },
    computed: {
    },
    methods:{
        change (value, label) {
            this.$parent.setTheme(value);
            this.theme = value;
        },
        getTheme(){
            this.theme = this.$parent.theme;
        }
    },
    created(){
        this.getTheme();
    }
}
</script>
<style lang='scss' scoped>

</style>