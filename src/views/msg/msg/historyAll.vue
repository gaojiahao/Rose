<template>
    <div class="page msg-history-all">
        <div class="page-navigation flex">
            <div class="goback" @click="$router.go(-1)">
                <i class="iconfont icon-back1"></i>
            </div>
            <div class="body history-input-wrapper">
                <input class="weui-input history-input" placeholder="搜索" @keyup="inputChange" v-model="searchKey"/>
            </div>
         </div>
         <div class="page-body-hasNav" ref="scrollerWrapper">
             <div v-if="searchKey == ''">
                 <p class="notice">快速查找聊天内容</p>
                 <div class="history-link flex">
                     <span @click="goto('historyImg')">图片</span>
                     <span @click="goto('historyFile')">文件</span>
                 </div>
             </div>
             <div v-if="msgList.length==0 && showLoading == false && loaded == true">
                 无搜索结果
             </div>
             <r-scroll
                 :options="scrollOptions"
                 :has-next="false"
                 :no-data="false"
                 :hideToast="true"
                 v-if="msgList.length" class="msg-history-container"
                >
                <div v-for="(msg,index) in msgList" :key="index" class="history-item">
                    <img :src="msg.photo"  @error="getDefaultPhoto(msg)">
                    <div class="history-item-info">
                        <p>{{msg.creatorName}}</p>
                        <div v-html="formatToEmotion(msg.content)" v-if="msg.imType == 1"></div>
                        <historyFileItem v-else-if="msg.imType==4 || msg.imType == 2" :content="msg.content"></historyFileItem>
                    </div>
                    <div>{{msg.crtTime}}</div>
                </div>
             </r-scroll>
            <div class="weui-loadmore" v-show="showLoading">
                <i class="weui-loading"></i>
                <span class="weui-loadmore__tips">正在加载</span>
            </div>
         </div>
    </div>
</template>
<script>
import RScroll from "plugins/scroll/RScroll";
import {searchGroupMsg} from 'service/msgService'
import historyFileItem from './historyFileItem'
export default {
    data(){
        return {
            msgList:[],
            searchKey:'',
            pageParam:{
                page:1,
                limit:30
            },
            scrollOptions:{},
            showLoading:false,
            loaded:false,
            hasNext:false
        }
    },
    components:{RScroll,historyFileItem},
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
        goto(name){
           this.$router.push({name:name,params:{groupId:this.$route.params.groupId}});
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
            })
            // getMessagesByImType({
            //     ...this.pageParam,
            //     content:key,
            //     imType:1,
            //     groupId:this.$route.params.groupId,
            //     sort:JSON.stringify([{"property":"crtTime","direction":"DESC"}])
            // })
            .then(res=>{
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
.msg-history-all{
    display: flex;
    flex-direction: column;
   .notice{
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
.msg-history-container{
    height: 100%;
    background: #fff;
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
      div{
         color:#dedede;
      }
  }
}
</style>