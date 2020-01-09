<template>
    <div class="notice-container" >
        <tab :active-color='activeColor'>
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
            praiseBadge:'',
            activeColor:'#2196F3',
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
        },
        getTheme(){
            this.activeColor = '#3296FA';
            var theme = window.localStorage.getItem('theme');
            switch(theme){
                case 'default-theme':
                    this.activeColor = '#3296FA';
                    break;
                case 're-theme':
                    this.activeColor = '#720e05';
                    break;
                case 'gr-theme':
                    this.activeColor = '#3f8e4d';
                    break;
                case 'ye-theme':
                    this.activeColor = '#edc148';
                    break;
                case 'pu-theme':
                    this.activeColor = '#652BF5';
                    break;
            }
        }
    },
    created(){
        this.getTheme();
    },
    activated(){
        this.getTheme();
    },
    mounted(){
    }
}

</script>
<style lang="less" scoped>

.notice-container{
    overflow: hidden;
    height: 100%;
    .wrapper {
        height: calc(100% - 10.99rem);
        // height: 7.2rem;
    }
}

</style>