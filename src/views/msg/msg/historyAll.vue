<template>
    <div class="page msg-history-all">
        <div class="page-navigation flex">
            <div class="goback" @click="$parent.showHistoryAll=false">
                <i class="iconfont icon-back1"></i>
            </div>
            <div class="body history-input-wrapper">
                <input class="weui-input history-input" placeholder="搜索" @keyup="inputChange" v-model="searchKey"/>
            </div>
         </div>
         <div class="page-body-hasNav" ref="scrollerWrapper">
             <div v-if="searchKey == ''">
                 <P>快速查找聊天内容</P>
                 <div class="history-link flex">
                     <span @click="$parent.showHistoryImg=true">图片</span>
                     <span @click="$parent.showHistoryFile=true">文件</span>
                 </div>
             </div>
             <div v-if="msgList.length==0 && showLoading == false && loaded == true">
                 无搜索结果
             </div>
            <div v-if="msgList.length">
                <div v-for="(msg,index) in msgList" :key="index" class="history-item">
                    <img :src="msg.photo"  @error="getDefaultPhoto(msg)">
                    <div class="history-item-info">
                        <p>{{msg.creatorName}}</p>
                        <div v-html="msg.content"></div>
                    </div>
                    <div>{{msg.crtTime}}</div>
                </div>
            </div>
            <div class="weui-loadmore" v-show="showLoading">
                <i class="weui-loading"></i>
                <span class="weui-loadmore__tips">正在加载</span>
            </div>
         </div>
    </div>
</template>
<script>
import {searchGroupMsg} from 'service/msgService'
export default {
    data(){
        return {
            msgList:[],
            searchKey:'',
            pageParam:{
                page:1,
                limit:30
            },
            showLoading:false,
            loaded:false,
            hasNext:false
        }
    },
    created(){
    },
    methods:{
        inputChange(){
            var key = this.searchKey,
                timer = this.searchTimer;
            
            this.msgList=[];
            if (key != ''){
               this.showLoading = true;
               if (timer)clearTimeout(timer);
               this.searchTimer = setTimeout(()=>{
                   this.pageParam.page = 1;
                   this.getMsg();
               },500)
            } else {
               if (timer)clearTimeout(timer);
               this.showLoading = false;
               this.loaded = false;
            }
        },
        getDefaultPhoto(msg) {
            let url = require("assets/ava01.png");
            if (msg) {
                msg.photo = url;
            }
            return url;
        },
        getMsg(){
            var key = this.searchKey;
            
            if (key == ''){
                this.showLoading = false;
                this.loaded = false;
                this.msgList = [];
                return;
            }
            searchGroupMsg({
                ...this.pageParam,
                content:key,
                groupId:this.$route.params.groupId
            }).then(res=>{
                this.showLoading = false;
                this.loaded = true;
                if(res.msgs.length>=this.pageParam.limit){
                    this.hasNext = true;
                }
                if(this.pageParam.page == 1){
                    this.msgList= res.msgs;
                }else{
                    this.msgList.unshift(...res.msgs);
                }
            });
        }
    }
}
</script>
<style lang='less'>
.msg-history-all{
   p{
    text-align: center;
    color: #ddd;
    line-height: 50px;
   }
}
.history-link span{
   padding:0.2rem;
   color: #1761aa;
}
.history-input-wrapper{
  flex:1;
}
.history-input{
    width: 100%;
    height: 75%;
    border-bottom: 0.5px solid rgb(117, 109, 109);
}
.history-input::-webkit-input-placeholder{
    color:rgb(117, 109, 109);
}
.history-item{
  display: flex;
  position: relative;
  &::before{
    content: " ";
    position: absolute;
    top: 0;
    right: 0;
    left:0;
    height: 1px;
    border-top: 1px solid rgba(0,0,0,0.1);
    color: rgba(0,0,0,0.1);
    -webkit-transform-origin: 0 0;
    transform-origin: 0 0;
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
  }
  img{
    height: 40px;
    border-radius: .01rem;
  }
  &-info{
      flex: 1;
      margin-left: .15rem;
  }
}
</style>