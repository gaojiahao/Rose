<template>
    <div class="page msg-history-all">
        <div class="page-navigation flex">
            <div class="goback" @click="$parent.showHistoryImg=false">
                <i class="iconfont icon-back1"></i>
            </div>
            <div class="body history-input-wrapper">
                图片
            </div>
         </div>
         <div class="page-body-hasNav" ref="scrollerWrapper">
            <div v-if="msgList.length">
                <div v-for="(msg,index) in msgList" :key="index" class="history-img-item">
                    <img :src="baseURL+'/H_roleplay-si/ds/downloadById?id='+ msg.content.id">
                </div>
            </div>
         </div>
    </div>
</template>
<script>
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
            showLoading:false,
            hasNext:false
        }
    },
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
    }
}
</script>
<style lang='less'>
.msg-history-all{
   h2{
      text-align: center;
      font-size:16px;
      line-height: 32px;
      color:#dedede;
   }
}
.history-link span{
   padding:0.2rem;
}
.history-input-wrapper{
  flex:1;
  border-bottom:1px solid #dedede;
}
.history-img-item{
  width:25%;
  img{
    height: 40px;
    border-radius: .01rem;
  }
}
</style>