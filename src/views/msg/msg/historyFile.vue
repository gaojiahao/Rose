<template>
    <div class="page msg-history-file">
        <div class="page-navigation flex">
            <div class="goback" @click="$router.go(-1)">
                <i class="iconfont icon-back1"></i>
            </div>
            <div style="margin-right:10px">文件</div>
            <div class="body history-input-wrapper">
                <input class="weui-input history-input" placeholder="搜索" @keydown="inputChange" v-model="searchKey"/>
            </div>
         </div>
         <div class="page-body-hasNav" ref="scrollerWrapper">
             <div v-if="msgList.length==0 && showLoading == false">
                 无搜索结果
             </div>
             <r-scroll
                 :options="scrollOptions"
                 :has-next="false"
                 :no-data="false"
                 :hideToast="true"
                 v-if="msgList.length" class="file-container"
                >
                <div v-for="(msg,index) in msgList" :key="index" class="history-file-item" @click="fileClick(msg.content)">
                    <span class="creatorName">{{msg.creatorName}}</span>
                    <div class="history-file-item-info">
                        <img class="file-img" :src="msg.content|filedTypeFilter" @error= "getFileImg()">
                        <div class="history-file-item-info-content">
                            <p>{{msg.content.content}}</p>
                            <p>{{msg.content.size}}KB</p>
                        </div>
                    </div>
                    <div class="crtTime">{{msg.crtTime | timeChangeFilter}}</div>
                </div>
             </r-scroll>
         </div>
    </div>
</template>
<script>
import RScroll from "plugins/scroll/RScroll";
import util from '@/common/util';
import {getMessagesByImType} from 'service/msgService';
export default {
    data(){
        return {
            msgList:[],
            searchKey:'',
            pageParam:{
                page:1,
                limit:100
            },
            scrollOptions:{},
            showLoading:false,
            hasNext:false
        }
    },
    components:{RScroll},
    created(){
        this.getMsg();
    },
    methods:{
        inputChange(){
            var key = this.searchKey,
                timer = this.searchTimer;
            
            this.showLoading = true;
            if (timer)clearTimeout(timer);
            this.searchTimer = setTimeout(()=>{
                this.pageParam.page = 1;
                this.getMsg();
            },500);
          
        },
        getDefaultPhoto(msg) {
            let url = require("assets/ava01.png");
            if (msg) {
                msg.photo = url;
            }
            return url;
        },
         getFileImg(){
            let img = event.srcElement;
            img.src = this.defaultFileImg;
            img.onerror = null; //防止闪图
        },
        getMsg(){
            var key = this.searchKey;
            
            getMessagesByImType({
                ...this.pageParam,
                content:key,
                imType:4,
                groupId:this.$route.params.groupId,
                sort:JSON.stringify([{"property":"crtTime","direction":"DESC"}])
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
        },
        
        fileClick(content){
            var fileName = content.content,
                isImg = /.jpg|.png/.test(fileName.toLowerCase());
            
            if(isImg){
                this.$router.push({name:'imgInfo',params:{id:content.id},query:{name:fileName}});
            } else {
                util.down(content,()=>{
                    
                });
            }
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
.msg-history-file{
   display: flex;
   flex-direction: column;
}
.file-container{
    padding: 0 0.1rem;
    height:100%;
    background: #fff;
}
.history-file-item{
    position: relative;
    padding: 0.1rem 0;
    font-size: 14px;
    border-bottom: 0.5px solid #ddd;
    .creatorName{
        font-size: 12px;
    }
    .crtTime{
        position:absolute;
        right:0;
        top:0.1rem;
        font-size: 12px;
    }
    
}
.history-file-item:last-child{
    border-bottom: none;
}
.history-file-item-info{
  display: flex;
  position: relative;
  img{
    height: 50px;
    border-radius: .01rem;
  }
  &-content{
      flex: 1;
      margin-left: .15rem;
  }
}
.history-input::-webkit-input-placeholder{
    color:white;
}

.history-input-wrapper{
    width: 80%;
    .history-input{
        border-bottom: 0.5px solid;
    }
}
</style>