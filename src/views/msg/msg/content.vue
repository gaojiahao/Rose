<template>
    <div class="msg-detail page" v-if="group">
        <div class="msg-header page-navigation">
            <div class="goback" @click="goBack()">
                <i class="iconfont icon-back1" ></i>
            </div>
            <div class="groupName body">
                {{group.groupName}}<span v-if="group.groupType == 'G'">({{group.msgCount}})</span>
            </div>
            <div class="toGroupAdmin" @click="$router.push('/msg/group/'+ group.groupId +'/info')">
                <i class="iconfont icon-users" ></i>
            </div>
        </div>
        <r-scroll
            class="msg-container-wrapper"
            id="msg-container-wrapper"
            :options="scrollOptions"
            :has-next="false"
            :no-data="false"
            @on-pulling-down="onPullingDown"
            ref="scroller"
        >
            <div class="msg-container" ref="msg-container">
                <LoadMore v-if="loading"></LoadMore>
                <div v-for="(msg,index) in msgList" :key="index" class="singleMsg" :class="{ 'isMySelf': msg.isMySelf,'focus-msg': msg.id == focusMsgId }" :id="'msg-'+msg.id">
                    <touch @menuContext="onAvaContextMenu(msg.creatorName)">
                    <img 
                    :src="msg.photo" 
                    :style="{float: msg.isMySelf?'right':'left'}"  
                    class="message-ava" 
                    @error="getDefaultPhoto(msg)">
                    </touch>
                    <span class ="message-creator"
                        v-if="!msg.isMySelf">{{msg.creatorName}}
                    </span>
                    <touch @menuContext="onMsgContextMenu(msg,$event)">
                        <div class="message-content" :class="[msg.isMySelf==1?'rightarrow':'leftarrow']" ref="contextMenu">
                            <div v-if="msg.replayMsg" style="border-left: 3px solid rgb(153, 153, 153); padding: 0px 8px; cursor: pointer;" @click="goTop(msg.replayMsg.id)">
                                <MessageTplText :msg="msg.replayMsg" v-if="msg.replayMsg.imType == 1"></MessageTplText>
                                <MessageTplImg :msg="msg.replayMsg" v-else-if="msg.replayMsg.imType == 2"></MessageTplImg>
                                <MessageTplMult :msg="msg.replayMsg" v-else-if="msg.replayMsg.imType == 3"></MessageTplMult>
                                <MessageTplFile :msg="msg.replayMsg" v-else-if="msg.replayMsg.imType == 4"></MessageTplFile>
                            </div>
                            <MessageTplText :msg="msg" v-if="msg.imType == 1"></MessageTplText>
                            <MessageTplImg :msg="msg" v-else-if="msg.imType == 2"></MessageTplImg>
                            <MessageTplMult :msg="msg" v-else-if="msg.imType == 3"></MessageTplMult>
                            <MessageTplFile :msg="msg" v-else-if="msg.imType == 4"></MessageTplFile>
                        </div>
                    </touch>
                </div>
            </div>
        </r-scroll>
        <ContextMenu v-show="showContextMenu" ref="contextMenu"/>
        <div class="msgList-footer">
            <div class="replayMsg" v-if="replayMsg">
                <span>{{replayMsg.creatorName}}:</span>
                <div class="replayMsg-content">{{replayMsg|replayContent}}</div>
                <span class="icon-close" @click="replayMsg = null">
                </span>
            </div> 
            <div class="input-wrapper">
                <textarea class="msg-input"  v-model="msg" type="text" ref="msgInput" @focus="showExtraInput=false"></textarea>
                <i class="icon-emotion" @click="showEmotion = !showEmotion;showExtraInput=false;"></i>
                <i class="icon-add-more" @click="toggleWrapper" v-show="!msg"></i>
                <span class="btn-send" v-if="msg" @click="sendTextMsg">发送</span>
            </div>
            <div class="extra-input-wrapper" v-show="showExtraInput">
                <div>
                    <i class="iconfont icon-i-img uploader">
                        <input id="uploaderInput" class="weui-uploader__input" type="file" accept="image/*" multiple="" @change="sendImgMsg">
                    </i>  
                    <div class="extra-input-item-text">
                        图片
                    </div>
                    
                </div>
                <div>
                    <i class="iconfont icon-file-f uploader">
                        <input id="uploaderInput" class="weui-uploader__input" type="file" accept="*" multiple="" @change="showFileConfirm">
                    </i>  
                     <div class="extra-input-item-text">
                         文件
                     </div>
                    
                </div>
            </div>
            <r-emotion :show = "showEmotion" @on-select="emotionSelected" ref="emotion"></r-emotion>
            <FileDialog v-if="fileDlgContext" @cancel="cancleFile" @todo="sendFileMsg" :content="fileDlgContext">
                 <div class="file-dialog-sendTo">
                    <img :src="group.groupIcon" @error="getDefaultPhoto(group)">
                    <div>
                        <span v-html="group.groupName"></span>
                    </div>
                 </div>
            </FileDialog>
            
        </div><!-- footer-->
        <!-- groupInfo 消息信息页面-->
        <router-view :group="group" ref="groupInfo"></router-view>
        <!-- groupInfo end -->
    </div> <!--page end-->
</template>
<script>
import {LoadMore} from 'vux'
import util from '@/common/util'
import {upload} from 'service/commonService'
import {sendMsg,getGroupMsg,checkMessage,getGroupMsgById} from 'service/msgService'
import MessageTplText from '@/views/msg/msg/messageTplText'
import MessageTplImg from '@/views/msg/msg/messageTplImg'
import MessageTplMult from '@/views/msg/msg/messageTplMult'
import MessageTplFile from '@/views/msg/msg/messageTplFile'
import RScroll from "plugins/scroll/RScroll";
import Touch from "plugins/touch";
import FileDialog from  "./fileDialog"
import ContextMenu from './contextMenu'
import REmotion from 'homePage/components/comment-related/REmotion'
export default {
    props:['group','msgList'],
    data(){
        return {
            msg:'',
            scrollOptions:{
                
            },
            showEmotion:false,
            page:1,
            loading:false,
            replayMsg:false,//回复消息
            hasNext:true,
            showExtraInput:false,//图片和文件输入框
            showContextMenu:false,//右键菜单
            fileDlgContext:null,//文件消息框,
            focusMsgId:null//得到焦点的消息id
        }
    },
    components:{
        MessageTplText,
        MessageTplImg,
        MessageTplMult,
        MessageTplFile,
        RScroll,
        LoadMore,
        FileDialog,
        ContextMenu,
        REmotion,
        Touch
    },
    filters:{
        replayContent(msg){
            var content = msg.content,
                str = '';
            if (+msg.imType != 1){
                try{
                    content = JSON.parse(content);
                }catch(e){
                    return '';
                }
            }
            switch (+msg.imType){
                case 1:
                    return  msg.content;
                    break;
                case 4://文件
                case 2://图片
                    return content.content;
                    break;
                case 3://混合格式
                    if(content.length == 1){
                        return content[0].content;
                    } else{
                        content.forEach((file)=>{
                           str += '[文件]';
                        })
                    }
                    break;
            }
            return str;
        }
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
        goTop(msgId){
            var container = this.$refs['msg-container'],
                target = container.querySelector('#msg-'+msgId);

            if(target){
               this.scrollToTarget(target,msgId);
            }else{
                getGroupMsgById(this.$route.params.groupId,msgId).then(res=>{
                    var  msgList = this.$parent.msgList;

                    msgList.unshift(...res.msgs);

                    this.$nextTick(() => {
                        target = container.querySelector('#msg-'+msgId);
                        this.scrollToTarget(target,msgId);
                    });
                });
            }
        },
        scrollToTarget(target,msgId){
            var msgBody = target.querySelector('.message-content');
            this.focusMsgId = msgId;
            setTimeout(() => {
                this.focusMsgId = null;
            }, 2000);
            this.scroller.scrollToElement(target);
        },
        scrollToTop:function(){
            var scroll = this.scroller;
            if(scroll){
                scroll.scrollTo(0, 0, 400);
            }
        },
         // 选中表情
        emotionSelected(val) {
            this.msg += val;
        },
        sendTextMsg(){
            var  groupId = this.group.groupId,
                 params = {
                     groupId:groupId,
			         content:this.msg,
			         imType:1
                 };

            
            if (this.msg != ''){
                if(this.replayMsg){
                   params.replayId = this.replayMsg.id;
                   params.repalyMsg = util.clone(this.replayMsg);//replayMsg内容只在ds 推送时有用，后端保存时不会用这个。
                   delete params.replayMsg.replayMsg;//不想发送那么多消息;
                }
                sendMsg(params).then(rs=>{
                   this.msg = '';
                   this.replayMsg = null;
                })
            }
            
        },
        sendImgMsg(e){
            var files = e.target.files,
                groupId = this.group.groupId,
                size,
                name2Size = {},
                params = {
                    groupId:groupId,
                    imType:2
                },file;
            
            if (!files) {
               return;
            }
            
            for(var i= 0,l= files.length;i < l; i++){
                file = files[i];
                size = (file.size/1024).toFixed(2);
                if(size > 2048){
                    alert('文件' + file.name + '大于2M');
                    return;
                }
                name2Size[file.name] = size;
            }
            this.showExtraInput = false;
            upload({
                file:files
            }).then(rs=>{
                if (rs.success){
                   e.target.value = null;
                   rs.data.forEach(file=>{
                       var fileName = file.attr1;
                       params.content=JSON.stringify({
                            id:file.id,
                            content:fileName,
                            size:name2Size[fileName]
                       });
                       sendMsg(params);
                   });                   
                }
            })
        },
        showFileConfirm(e){
            var files = e.target.files,
                size,
                countSize = 0,
                name2Size = {},
                file;
            
            if (!files) {
               return;
            }
            this.fileInput = e.target;
            for(var i= 0,l= files.length;i < l; i++){
                file = files[i];
                size = (file.size/1024).toFixed(2);
                if(size > 2048){
                    alert('文件' + file.name + '大于2M');
                    return;
                }
                countSize += file.size;
                name2Size[file.name] = size;
            }
            this.showExtraInput = false;
            this.name2Size = name2Size;
            this.fileDlgContext = files.length == 1?
                    [files[0].name,'(',util.formatFileSize(files[0].size,1),')'].join('')
                    :['已选',files.length,'个，共',util.formatFileSize(countSize,1)].join('')
        },
        cancleFile(){
            this.fileInput.value = null;
            this.fileDlgContext= null;
        },
        sendFileMsg(text){
            var name2Size = this.name2Size;
                
            upload({
                file:this.fileInput.files
            }).then(rs=>{
                var params = {
                        groupId:this.group.groupId,
                        content:[],
                        imType:5
                    };

                if (rs.success){
                    rs.data.forEach((file,index)=>{
                        var fileName = file.attr1;
                        params.content.push({
                            content:{
                                id:file.id,
                                content:fileName,
                                size:name2Size[fileName]
                            },
                            imType:4
                        });    
                    });
                    if(text != '')params.content.push({
                        content:text,
                        imType:1
                    });
                    params.content = JSON.stringify(params.content);
                    sendMsg(params).then(rs=>{
                        this.fileDlgContext = null;
                        this.fileInput.value = null;
                    })
                }
            });
        },
        onMsgContextMenu(msg,event){
            var tag = event.target.tagName.toLowerCase();

            if(tag == 'a') return;
            this.contextMenuMsg = msg;
            this.showContextMenu = true;
        },
        onAvaContextMenu(creatorName){
            if (this.group.groupType == 'G'){
                this.msg += '@'+creatorName+' ';
            }
        },
        initContextMenu(){
            var contextMenu = this.$refs.contextMenu;

            if(contextMenu)contextMenu.$on('replay',()=>{
                this.showContextMenu = false;
                if(this.contextMenuMsg){
                    this.replay(this.contextMenuMsg);
                    this.contextMenuMsg = null;
                }
            });
        },
        replay(msg){
            this.replayMsg = msg;
            if(this.group.groupType != 'P')this.msg += '@'+msg.creatorName+' ';
        },
        /**
         * 显示或隐藏图片和文件发送面板
         */
        toggleWrapper(){
            var input = this.$refs.msgInput;
            this.showExtraInput = !this.showExtraInput;
            if(this.showExtraInput){
                input.blur();
            }else{
                input.focus();
            }
            this.showEmotion = false;
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
        /**
         * 下拉翻页
         */
        onPullingDown(){
            if(this.hasNext == false || this.loading == true)return;
            this.loading = true;
            getGroupMsg(this.group.groupId,this.page + 1).then(rs=>{
                var  msgList = this.$parent.msgList;
                this.loading = false;
                if(rs.msgs.length < rs.pageSize){
                    this.page ++;
                    msgList.unshift(...rs.msgs);
                    this.$parent.msgList = msgList;
                } else {
                    this.hasNext = false;
                }
            })
        },
        checkMessage:function(){
            var groupId = this.group.groupId;
            // to:签收消息
            checkMessage(groupId).then(res=>{
                if(res.success){
                    this.$parent.checkLocalMessage(groupId);
                }
            });
        },
    },
    created:function(){
         this.getApp().hasTab = false;
    },
    mounted:function(){
        this.initContextMenu();
    },
    beforeRouteEnter:function(to,form,next){
        next(vm=>{
            if(vm.group != null){
                vm.checkMessage();//处理未读信息
            }
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
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}
.msg-header .toGroupAdmin i{
    font-size: 24px;
}

#msg-container-wrapper{
    flex:1;
    position: relative;
    background-color: #9e9e9e1c;
    .page-component-up{
        position:absolute;
        bottom:0.2rem;
        span{
            background-color:$weui-BG-1;
        }
    }
}
.msgList-footer {
    position: relative;
    .replayMsg{
        display:flex;
        padding:15px;
        .replayMsg-content{
            flex:1
        }
        .icon-close{
            width:.25rem;
            height:.25rem;
        }
    }
    .input-wrapper{
        padding: .08rem .1rem;
        height: .5rem;
        background-color: #f3f1f2;
        font-size: 0;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        .icon-emotion{
            display: inline-block;
            margin-left: .1rem;
            width: .3rem;
            height: .3rem;
            background: url(~@/assets/emotion.png) no-repeat;
            background-size: 100% 100%;
            vertical-align: top;
        }
        .icon-add-more{
            display: inline-block;
            margin-left: .2rem;
            width: .3rem;
            height: .3rem;
            background: url(~@/assets/iconfont/add.png) no-repeat;
            background-size: 100% 100%;
            vertical-align: top;
        }
        textarea{
            display: inline-block;
            padding: .05rem .1rem;
            width: calc(100% - 1rem);
            height: 100%;
            outline: none;
            border-radius: 0.05rem;
            border: none;
            background-color: #fff;
            color: #2d2d2d;
            font-size: .16rem;
            resize: none;
            -webkit-box-sizing: border-box;
            box-sizing: border-box;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
        } 
        .btn-send{
            display: inline-block;
            margin-left: .1rem;
            width: .5rem;
            line-height: .34rem;
            border-radius: .03rem;
            background-color: #5077aa;
            color: #fff;
            text-align: center;
            vertical-align: top;
            font-size: .16rem;
        }
    }  
}
.extra-input-wrapper{
    display: flex;
    text-align: center;
    i{
        font-size:0.4rem;
        margin:0 0.1rem;
        &.uploader{
           position: relative;
            background-color: white;
            border-radius: .03rem;
            padding: .08rem;
            color: #999999;
        }
    }
    .weui-uploader__input{
        position:absolute;
        width:100%;
        height:100%;
        opacity: 0;
        left:0;
        top:0;
    }
    .extra-input-item-text{
        font-size: .12rem;
        color: #353535;
    }
}
.file-msg-input-wrapper{
    padding-top: 16px;
    border-bottom:1px solid $weui-BG-0;
}
.singleMsg{
    margin: 0.2rem 0.1rem;
    clear: both;
}
.message{
    &-ava{
        height: 40px;
        border-radius: .01rem;
    }

    &-creator{
        display: block;
        margin-left: .50rem;
        font-size: 10px;
        color: #9E9E9E;
    }
    &-content{
        border-radius: 5px;
        padding: .05rem;
        position: relative;
        margin: .02rem .06rem;
        display: inline-block;
        max-width: 70%;
        background-color: #ffffff;
        &.rightarrow:after{
            content: " ";
            border-width: 7px;
            position: absolute;
            display: block;
            width: 0;
            height: 0;
            border-color: transparent;
            border-style: solid;
            top: 10px;
            margin-left: 1px;
            border-right-width: 0;
            border-left-color: rgb(191, 221, 255);
            right: -6px;
        }

        &.leftarrow:after{
            content: " ";
            border-width: 7px;
            position: absolute;
            display: block;
            width: 0;
            height: 0;
            border-color: transparent;
            border-style: solid;
            top: 3px;
            margin-left: 1px;
            border-left-width: 0;
            border-right-color: rgb(255, 255, 255);
            left: -8px;
        }
    }
}
.isMySelf{
    text-align: right;
    .message-content{
        background-color: rgb(191, 221, 255);
    }
}
.focus-msg .message-content{
    &.rightarrow:after{
        border-left-color:#f9b24757;
    }
    &.leftarrow:after{
        border-right-color:#f9b24757;
    }
    background: #f9b24757;
}
.file-dialog-sendTo{
   display: flex;
   img{
       width:42px;
       height:42px;
   }
   div{  
       flex:1;  
       overflow: hidden;
       span{
           text-overflow: ellipsis;
            -o-text-overflow: ellipsis;
            max-width:200px;
            white-space: nowrap;
            overflow: hidden;
            display: inline-block;
       } 
   }
}
</style>