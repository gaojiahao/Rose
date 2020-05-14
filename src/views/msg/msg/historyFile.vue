<template>
    <div class="page msg-history-file">
        <div class="page-navigation flex">
            <div class="goback" @click="$parent.showHistoryFile=false">
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
            <div v-if="msgList.length" class="file-container">
                <div v-for="(msg,index) in msgList" :key="index" class="history-file-item" @click="fileClick(msg.content)">
                    {{msg.creatorName}}
                    <div class="history-file-item-info">
                        <img class="file-img" :src="msg.content|filedTypeFilter" @error= "getFileImg()">
                        <div class="history-file-item-info-content">
                            <p>{{msg.content.content}}</p>
                            <p>{{msg.content.size}}</p>
                        </div>
                    </div>
                    <div class="crtTime">{{msg.crtTime}}</div>
                </div>
            </div>
         </div>
    </div>
</template>
<script>
import {getMessagesByImType} from 'service/msgService';
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
            hasNext:false
        }
    },
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
        },
        down(id){
            window.location.href='/H_roleplay-si/ds/downloadById?id='+id;
        },
        fileClick(content){
            var fileName = content.content,
                isImg = /.jpg|.png/.test(fileName.toLowerCase());
            
            if(isImg){
                this.$router.push({name:'imgInfo',params:{id:content.id},query:{name:fileName}});
            } else {
                this.down(content.id);
            }
        }
    }
}
</script>
<style lang='less'>
.file-container{
    padding: 0 0.1rem;
    background: #fff;
}
.history-file-item{
    position: relative;
    padding:0.1rem 0;
    .crtTime{
        position:absolute;
        right:0;
        top:0.1rem;
    }
    border-bottom:1px solid #dedede;
}
.history-file-item-info{
  display: flex;
  position: relative;
  img{
    height: 40px;
    border-radius: .01rem;
  }
  &-content{
      flex: 1;
      margin-left: .15rem;
  }
}
</style>