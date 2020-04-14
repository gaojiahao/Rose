<template>
    <div class="msg-detail page" v-if="group">
        <div class="msg-header">
            <div class="goback" @click="goBack()">
                <-
            </div>
            <div class="groupName body">
                {{group.groupName}}<span v-if="group.groupType == 'G'">({{group.msgCount}})</span>
            </div>
            <div class="toGroupAdmin" @click="$router.push('/msg/group/info')">
                用户
            </div>
        </div>
        <div class="msg-container-wrapper" ref="scoller-wrapper">
            <div class="msg-container">
                <div v-for="(msg,index) in msgList" :key="index" class="singleMsg">
                    <div v-if="msg.imType == 1" v-html="msg.content"></div>
                </div>
            </div>
        </div>
        <div class="msgList-footer">
             <textarea class="msg-input"  v-model="msg" type="text"></textarea>
            <div class="msg-input-wrapper">
               
            </div>
            <button @click="sendTextMsg">发送</button>
        </div>
        <div class="el-fade-in">
            <div class="page-component-up" @click="scrollToTop" v-show="toTopShow">
            <span class="icon icon-scroll-top"></span>
            </div>
        </div>
        <router-view :group="group"></router-view>
    </div>
</template>
<script>
import {sendMsg} from 'service/msgService'
export default {
    props:['group','msgList'],
    data(){
        return {
            msg:'',
            toTopShow:false
        }
    },
    methods:{
        goBack(){
            this.$router.replace('/msg');
        },
        scrollToTop:function(){
            var scroll = this.scroll;
            if(scroll){
                scroll.scrollTo(0, 0, 400);
            }
        },
        sendTextMsg(){
            var  groupId = this.group.groupId,
                 params = {
                     groupId:groupId,
			         content:this.msg,
			         imType:1
                 };
            if (this.msg != ''){
                sendMsg(params).then(rs=>{
                   this.msg = '';
                })
            }
            
        },
        /**
         * 将消息页面滚动到底部
         */
        scrollToButtom(time=400){
            this.$nextTick(()=>{
                var scroll = this.scroll;
                    
                if(scroll){
                    scroll.scrollTo(0,scroll.maxScrollY,time);
                }
            })
        }
    },
    created:function(){
        var parent = this.$parent,
            group = parent.group;
      
        if(this.group != null){
            this.getApp().hasTab = false;
        } else {
            this.$router.replace('/msg');
        }
    },
    mounted() {
        var scrollWrapper = this.$refs.scollerWrapper;

        if(!scrollWrapper)return;

        this.scroll = new this.Bscroll(scrollWrapper, {
            click: true,
            pullUpLoad: true,
            pullDownRefresh: true,
        });
        this.scroll.on('scroll', ({x, y}) => {
            if(Math.abs(y)>1000)
            this.toTopShow = true;
            else if(Math.abs(y)<1000)
            this.toTopShow = false; 
        })
        this.scrollToButtom(0);

        this.getApp().$on('resize',()=>{
            this.scroll.refresh();
        })
    },
    beforeRouteEnter:function(to,form,next){
        next(vm=>{
        })
    },
    beforeRouteLeave:function(to,from,next){
        this.getApp().hasTab = true;
        next();
    }
}
</script>
<style>
.page{
   position:absolute;
   width:100%;
   height:100%;
   background: #fff;
   top:0;
   left:0;
}
.msg-header{
    display: flex;
    background:rgb(26, 146, 236);
    color: #fff;
    justify-content: start;
    height:0.5rem;
    line-height: 0.5rem;
    align-items: flex-start;
}
.msg-header .goback{
    width:0.5rem;
    padding-left:0.2rem;
}
.msg-header .body{
    flex: 1;
}
.msg-header .toGroupAdmin{
    padding-right:0.2rem;
}
.msg-container-wrapper{
    height: calc(100% - 1rem);
    overflow: hidden;
}
.singleMsg img{
    height:100px;
}
.msgList-footer{
    position:absolute;
    width:100%;
    height:0.5rem;
    bottom: 0;
    left:0;
    display: flex;
    border-top: 1px solid rgba(0,0,0,0.1);
}
.msg-input-wrapper{
   /* flex:1*/
}
.msg-input{
    /* width:100%; */
    flex:1
}
.singleMsg{
    margin:0.1rem;
    border:1px solid rgba(0,0,0,0.1);
    border-radius: 0.1rem;
}
</style>