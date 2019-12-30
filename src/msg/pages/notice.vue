<template>
    <div class="notice-container" >
        <div class="header">
            <div class="search">
                <form class='search_part' action="#" method="post">
                    <i class="icon icon-more2"></i>
                    <input type="search" autocomplete="off" placeholder="任务名称" class="srh_inp">
                    <i class="icon-taskSearch clear_icon"></i>
                </form>
            </div>
        </div>
        <tab :active-color='activeColor'>
        <tab-item 
            :selected="$route.name=='flowTodo'" 
            :badge-label="todoBadge['flowTodo']"  
            @on-item-click="onSwitch('flowTodo')"  > 
            工作流任务
        </tab-item>
        <tab-item  
            :selected="$route.name=='projectTask'" 
            :badge-label="todoBadge['projectTask']"  
            @on-item-click="onSwitch('projectTask')">
            项目任务
        </tab-item>
        <tab-item 
            :selected="$route.name=='dailyTask'" 
            :badge-label="todoBadge['dailyTask']"  
            @on-item-click="onSwitch('dailyTask')">任务日志</tab-item>
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
            todoBadge:{
                'flowTodo':'',
                'projectTask':'',
                'dailyTask':''    
            },
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
        loadData(text,val){
            this.todoBadge[text] = String(val);
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
        },
        search(){

        },
        clearSearch(){

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
input::-webkit-input-placeholder {
    color: #fff;
}
input::-moz-input-placeholder {
    color: #fff;
}
input::-ms-input-placeholder {
    color: #fff;
}
.notice-container{
    overflow: hidden;
    height: 100%;
    .wrapper {
        height: calc(100% - 10.99rem);
        // height: 7.2rem;
    }
    .header {
        // background:linear-gradient(to top, rgb(76,149,136), 50%, rgb(71,215,146));
        background:#3296FA;
        .search {
            width: 100%;
            padding: .08rem 0;
            .search_part {
                width: 100%;
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                height: .34rem;
                position: relative;
                line-height: .34rem;
                -webkit-box-sizing: border-box;
                box-sizing: border-box;
                .icon {
                    top: 50%;
                    z-index: 1;
                    left: .15rem;
                    width: .14rem;
                    height: .20rem;
                    fill: #2d2d2d;
                    position: absolute;
                    -webkit-transform: translate(0, -50%);
                    -ms-transform: translate(0, -50%);
                    transform: translate(0, -50%);
                }
                .srh_inp {
                    -webkit-box-flex: 1;
                    -ms-flex: 1;
                    flex: 1;
                    border: none;
                    outline: none;
                    color: #fff;
                    -moz-appearance: none;
                    appearance: none;
                    font-size: .14rem;
                    margin-left: .39rem;
                    border-radius: .2rem;
                    background: none;
                    -webkit-appearance: none;
                    text-align:center;
                    margin-right: .37rem;
                }
                .clear_icon {
                    top: 50%;
                    right: .15rem;
                    width: .18rem;
                    height: .18rem;
                    display: block;
                    font-size: .12rem;
                    line-height: .3rem;
                    text-align: center;
                    position: absolute;
                    -webkit-transform: translate(0, -50%);
                    -ms-transform: translate(0, -50%);
                    transform: translate(0, -50%);
                }
            }
        }
    }
}
</style>