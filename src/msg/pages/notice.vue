<template>
    <div class="notice-container">
        <tab active-color='#2196F3'>
           
        <tab-item 
            :selected="$route.name=='flowTodo'" 
            :badge-label='todoBadge'  
            @on-item-click="onSwitch('flowTodo')"  > 
            待办
        </tab-item>
        <tab-item  
            :selected="$route.name=='comment'" 
            @on-item-click="onSwitch('comment')">
            评论
        </tab-item>
        <tab-item 
            :selected="$route.name=='praise'" 
            @on-item-click="onSwitch('praise')">点赞</tab-item>
        </tab>
        
        <router-view @loadData="loadData"></router-view>
        
    </div>
</template>

<script>
import { Tab, TabItem } from 'vux'
import RScroll from "plugins/scroll/RScroll";
export default {
    components: {
    Tab,
    TabItem,
    RScroll
  },
  data(){
      return {
            todoBadge:'',
            praiseBadge:''
      }
  },
  methods:{
    onSwitch(name){
        this.$router.push({
            name:name
        });
    },
    loadData(val){
        this.todoBadge = String(val);
    }
  },
  mounted(){
    }
}

</script>
<style lang="less" scoped>

.notice-container{
    overflow: hidden;
    .wrapper {
        // height: calc(100% - 0.99rem);
        height: 6.5rem;
    }
}

</style>