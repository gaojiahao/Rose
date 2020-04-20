<template>
    <div class="msg-detail page" v-if="group">
        <div class="msg-header page-navigation">
            <div class="goback" @click="goBack()">
                <i class="iconfont icon-back1" ></i>
            </div>
            <div class="groupName body">
                {{group.groupName}}<span v-if="group.groupType == 'G'">({{group.msgCount}})</span>
            </div>
            <div class="toGroupAdmin" @click="$router.push('/msg/group/info')">
                <i class="iconfont icon-users" ></i>
            </div>
        </div>
        <r-scroll
            class="msg-container-wrapper"
            :options="scrollOptions"
            :has-next="false"
            :no-data="false"
            @on-pulling-down="onPullingDown"
            ref="scroller"
        >
            <div class="msg-container">
                <LoadMore v-if="loading"></LoadMore>
                <div v-for="(msg,index) in msgList" :key="index" class="singleMsg">
                    <MessageTpl :msg="msg"></MessageTpl>
                </div>
            </div>
        </r-scroll>
        <div class="msgList-footer">
            <div class="input-wrapper">
                <textarea class="msg-input"  v-model="msg" type="text" @keyup.enter="sendTextMsg"></textarea>
                <i class="iconfont icon-jia" @click="toggleWrapper"></i>
            </div>
            <div class="extra-input-wrapper" v-show="showExtraInput">
                <i class="iconfont icon-3801wenjian"></i>
                <i class="iconfont icon-file-f"></i>
            </div>
        </div>
        <!-- groupInfo 消息信息页面-->
        <router-view :group="group" ref="groupInfo"></router-view>
        <!-- groupInfo end -->
    </div> <!--page end-->
</template>
<script>
import {LoadMore} from 'vux'
import {sendMsg,getGroupMsg} from 'service/msgService'
import MessageTpl from '@/views/msg/msg/messageTpl'
import RScroll from "plugins/scroll/RScroll";
export default {
    props:['group','msgList'],
    data(){
        return {
            msg:'',
            scrollOptions:{
                
            },
            page:1,
            loading:false,
            hasNext:true,
            showExtraInput:false
        }
    },
    components:{
        MessageTpl,
        RScroll,
        LoadMore
    },
    methods:{
        getDefaultPhoto(msg) {
            let url = require("assets/ava01.png");
            if (msg) {
                msg.photo = url;
            }
            return url;
        },
        goBack(){
            this.$router.replace('/msg');
        },
        scrollToTop:function(){
            var scroll = this.scroller;
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
        toggleWrapper(){
            this.showExtraInput = !this.showExtraInput;
        },
        /**
         * 将消息页面滚动到底部
         */
        scrollToButtom(time=400){
            this.$nextTick(()=>{
                var scroll = this.scroller;
                    
                if(scroll){
                    scroll.scrollTo(0,scroll.maxScrollY,time);
                }
            })
        },
        onPullingDown(){
            if(this.hasNext == false || this.loading == true)return;
            this.loading = true;
            getGroupMsg(this.group.groupId,this.page + 1).then(rs=>{
                var  msgList = this.$parent.msgList;
                this.loading = false;
                if(rs.length){
                    rs.map(msg=>{
                        var json;
                        if(msg.imType == 3 || msg.imType == 2){
                            try{
                                json = JSON.parse(msg.content);
                                msg.content = json;
                            }catch(e){
                                console.log('msg content parse error',msg.content);
                            }
                        }
                    });
                    this.page ++;
                    msgList.unshift(...rs);
                    this.$parent.msgList = msgList;
                } else {
                    this.hasNext = false;
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
    mounted:function(){
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
<style lang="scss">
.msg-detail{
   display: flex;
   flex-direction: column;
}
.msg-header{
    display: flex;
}
.msg-header .body{
    flex: 1;
}
.msg-header .toGroupAdmin i{
    font-size: 24px;
}

.msg-container-wrapper{
    flex:1;
    background-color: #9e9e9e1c;
}
.msgList-footer {
    position: relative;
    .input-wrapper{
        display: flex;
        height: 0.5rem;
        border-top: 1px solid rgba(0,0,0,0.1); 
        textarea{
            flex: 1;
        } 
        i{
            width:0.5rem;
            font-size: 0.3rem;
            text-align: center;
        }
        .icon-jia:before{
            border: 1px solid #000;
            border-radius: 0.5rem;
        }
    }  
}
.extra-input-wrapper{
    display: flex;
    text-align: center;
    i{
        height: 0.6rem;
        font-size:0.4rem;
        width: 0.6rem;
    }
}
.singleMsg{
    margin: 0.2rem 0.1rem;
    clear: both;
}
</style>