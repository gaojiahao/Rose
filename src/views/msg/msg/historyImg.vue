<template>
    <div class="page msg-history-img">
        <div class="page-navigation flex">
            <div class="goback" @click="$router.go(-1)">
                <i class="iconfont icon-back1"></i>
            </div>
            <div class="body history-input-wrapper">
                图片
            </div>
         </div>
         <div class="page-body-hasNav" ref="scrollerWrapper">
             <r-scroll
                 :options="scrollOptions"
                 :has-next="false"
                 :no-data="false"
                 :hideToast="true"
                 v-if="msgList.length" class="img-container-wrapper"
                >
                <div class="img-container">
                    <div v-for="(msg,index) in msgList" :key="index" class="history-img-item">
                        <img preview="1" :src="baseURL+'/H_roleplay-si/ds/downloadById?id='+ msg.content.id">
                    </div>
                    <div class="history-img-item-fill" v-for="count in (4-msgList.length%4)"></div>
                </div>
             </r-scroll>
         </div>
    </div>
</template>
<script>
import RScroll from "plugins/scroll/RScroll";
import {getMessagesByImType} from 'service/msgService'
export default {
    data(){
        return {
            baseURL:window.baseURL||'',
            msgList:[],
            pageParam:{
                page:1,
                limit:30
            },
            scrollOptions:{},
            perviewImg:null,
            showLoading:false,
            hasNext:false
        }
    },
    components:{RScroll},
    created(){
        this.getMsg();
    },
    methods:{
        getDefaultPhoto(msg) {
            let url = require("assets/ava01.png");
            if (msg) {
                msg.photo = url;
            }
            return url;
        },
        getMsg(){
            var key = this.searchKey;
            
            if (key == '')return;
            getMessagesByImType({
                ...this.pageParam,
                imType:2,
                groupId:this.$route.params.groupId
            }).then(res=>{
                this.showLoading = false;
                if(res.length>=this.pageParam.limit){
                    this.hasNext = true;
                }
                res.forEach(msg => {
                    msg.content = JSON.parse(msg.content);
                });
                if(this.pageParam.page == 1){
                    this.msgList= res;
                }else{
                    this.msgList.unshift(...res);
                }
            });
        }
    },
    beforeRouteEnter:function(to,form,next){
        next(vm=>{
                vm.getApp().hasTab = false;
        });
        
    },
    beforeRouteLeave:function(to,from,next){
        this.getApp().hasTab = true;
        next();
    }
}
</script>
<style lang='less'>
.msg-history-img{
    display: flex;
    flex-direction: column;
    .page-body-hasNav{
        position: relative;
        background-color: white;
    }
    .img-container{
        display: flex;
        flex-wrap: wrap;
        justify-content:space-around;
    }
}
.img-container-wrapper{
    height:100%;
}
.history-img-item{
    width: 23%;
    overflow: hidden;
    display: inline-block;
    margin: .01rem;
    border: 1px solid #ddd;
    img{
        width:100%;
        height:65px;
        border-radius: .01rem;
    }
}
.history-img-item-fill{
    width: 23%;
}
</style>