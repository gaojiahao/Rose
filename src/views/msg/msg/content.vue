<template>
    <div class="msg-detail page" v-if="group">
        <div class="msg-header page-navigation">
            <div class="goback" @click="goBack()">
                <i class="iconfont icon-back1" ></i>
            </div>
            <div class="groupName body">
                {{group.groupName}}
            </div>
            <div v-if="group.groupType !== 'N'" class="toGroupAdmin" @click="$router.push('/msg/group/'+ group.groupId +'/info')">
                <i class="iconfont" :class="[group.groupType == 'G' ? 'icon-users':'icon-me']"></i>
            </div>
        </div>
        <r-scroll
            id="msg-container-wrapper"
            :options="scrollOptions"
            :has-next="false"
            :no-data="false"
            :hideToast="true"
            :disableToTop="true"
            @on-pulling-down="onPullingDown"
            @click.native="onMsgContainerClick"
            ref="scroller"
        >
            <div class="msg-container" ref="msg-container">
                <LoadMore v-if="loading"></LoadMore>
                <div v-for="(msg,index) in msgList" :key="index" class="singleMsg" :class="{ 'isMySelf': msg.isMySelf,'focus-msg': msg.id == focusMsgId }" :id="'msg-'+msg.id">
                    <div class="otherMessage" v-if="msg.showTime & [1,2,3,4].includes(msg.imType)">{{msg.crtTime}}</div>
                    <touch 
                        @menuContext="onAvaContextMenu(msg.creatorName)" 
                        @click="showCreator(msg.creator)">
                    <img 
                    v-if="[1,2,3,4].includes(msg.imType)"
                    :src="msg.photo|appIconFilter" 
                    :style="{float: msg.isMySelf?'right':'left'}"  
                    class="message-ava" 
                    @error="getDefaultPhoto(msg)">
                    </touch>
                    <span class ="message-creator"
                        v-if="!msg.isMySelf && [1,2,3,4].includes(msg.imType)">{{msg.creatorName}}
                    </span>
                    
                    <touch @menuContext="onMsgContextMenu(msg,$event)" v-if="[1,2,3,4].includes(msg.imType)">
                        <span class="read-message" v-if="msg.isMySelf==1">
                            <span v-if="msg.allRead" class="message-allread">✓</span>
                            <span v-else-if="msg.checked === 0" class="message-noread"></span>
                            <span
                                v-else
                                class="message-read" 
                                @click="openMessageDetail(msg)"
                                :style="{color:'#3296fa',cursor:'pointer',borderColor: '#3296fa'}">
                                {{ msg.checked }}
                            </span>
                        </span>
                        <div class="message-content" :class="[msg.isMySelf==1?'rightarrow':'leftarrow']" >
                            <div v-if="msg.replayMsg" style="border-left: 3px solid rgb(153, 153, 153);padding: 0px 8px;cursor: pointer;background-color: rgba(0, 0, 0, 0.1);text-align: left;color: rgba(0, 0, 0, 0.6);" @click="goTop(msg.replayMsg.id)">
                               {{msg.replayMsg.creatorName}}:
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

                    <div class="otherMessage" v-if="[101,102,104].includes(msg.imType)">
                        <div>{{msg.crtTime}}</div>
                        <div><span>{{msg.content}}</span></div>
                    </div>

                    <div class="otherMessage" v-if="[201].includes(msg.imType)">
                         <div>{{msg.crtTime}}</div>
                        <MessageTplTaskLog :msg="msg"></MessageTplTaskLog>
                    </div>
                    <div class="otherMessage" v-if="[202,203,204].includes(msg.imType)">
                         <div>{{msg.crtTime}}</div>
                        <MessageTplTaskOverdue :msg="msg"></MessageTplTaskOverdue>
                    </div>
                    <div class="otherMessage" v-if="[205].includes(msg.imType)">
                         <div>{{msg.crtTime}}</div>
                        <MessageTplWeekSummary :msg="msg"></MessageTplWeekSummary>
                    </div>
                    <div class="otherMessage" v-if="[207].includes(msg.imType)">
                         <div>{{msg.crtTime}}</div>
                        <MessageTplProjectNewTask :msg="msg"></MessageTplProjectNewTask>
                    </div>
                    <div class="otherMessage" v-if="[208].includes(msg.imType)">
                         <div>{{msg.crtTime}}</div>
                        <MessageTplDayReport :msg="msg"></MessageTplDayReport>
                    </div>
                    <div class="otherMessage" v-if="[209].includes(msg.imType)">
                         <div>{{msg.crtTime}}</div>
                        <MessageTplTaskDayReport :msg="msg"></MessageTplTaskDayReport>
                    </div>
                    <div class="otherMessage" v-if="[210].includes(msg.imType)">
                         <div>{{msg.crtTime}}</div>
                        <MessageTplProjectTaskOverdue :msg="msg"></MessageTplProjectTaskOverdue>
                    </div>
                    <div class="otherMessage" v-if="[213].includes(msg.imType)">
                         <div>{{msg.crtTime}}</div>
                        <MessageTplProjectDiscuss :msg="msg"></MessageTplProjectDiscuss>
                    </div>
                    <div class="otherMessage" v-if="[211].includes(msg.imType)">
                         <div>{{msg.crtTime}}</div>
                        <MessageTplProjectFileUpload :msg="msg"></MessageTplProjectFileUpload>
                    </div>
                    <div class="otherMessage" v-if="[212].includes(msg.imType)">
                         <div>{{msg.crtTime}}</div>
                        <MessageTplProjectNewTaskMes :msg="msg"></MessageTplProjectNewTaskMes>
                    </div>
                </div>
            </div><!--msg-container-->
        </r-scroll>
        <ContextMenu v-show="showContextMenu" ref="contextMenu"/>
        <div v-if="group.groupType !== 'N'" class="msgList-footer">
            <div class="replayMsg" v-if="replayMsg">
                <span>{{replayMsg.creatorName}}:</span>
                <div class="replayMsg-content">
                    <MessageTplText :msg="replayMsg" v-if="replayMsg.imType == 1"></MessageTplText>
                    <MessageTplImg :msg="replayMsg" v-else-if="replayMsg.imType == 2"></MessageTplImg>
                    <MessageTplMult :msg="replayMsg" v-else-if="replayMsg.imType == 3"></MessageTplMult>
                    <MessageTplFile :msg="replayMsg" v-else-if="replayMsg.imType == 4"></MessageTplFile>
                </div>
                <span class="iconfont icon-close" @click="replayMsg = null">
                </span>
            </div> 
            <div class="input-wrapper">
                <textarea class="msg-input" v-model="msg" type="text" ref="msgInput" @focus="onMsgInputFocus" @blur="msgInputFocus=false;" @keyup="checkAt"></textarea>
                <i class="icon-emotion" @click="showEmotion = !showEmotion;showExtraInput=false;"></i>
                <i class="icon-add-more" @click="toggleWrapper" v-show="!msg.trim()"></i>
                <span class="btn-send" v-if="msg.trim()" @click="sendTextMsg" tabIndex="-1">发送</span>
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
                        <input id="uploaderInputfile" class="weui-uploader__input" type="file" accept="*/*" multiple="" @change="showFileConfirm">
                    </i>  
                     <div class="extra-input-item-text">
                         文件
                     </div>
                    
                </div>
            </div>
            <r-emotion :show = "showEmotion" @on-select="emotionSelected" ref="emotion"></r-emotion>
            <FileDialog v-if="fileDlgContext" @cancel="cancleFile" @todo="sendFileMsg" :content="fileDlgContext">
                 <div class="file-dialog-sendTo">
                    <img :src="group.groupIcon|appIconFilter" @error="getDefaultPhoto(group)">
                    <div>
                        <span v-html="group.groupName"></span>
                    </div>
                 </div>
            </FileDialog>
            
        </div><!-- footer-->
        <!-- groupInfo 消息信息页面-->
        <router-view :group="group" ref="groupInfo"></router-view>
        <!-- groupInfo end -->
        <at-member-list v-if="showAtMemberList" @select="selectAtMember"/>
        <!-- 消息已读未读详情 -->
        <message-read-detail ref="detailMessage" :detailMessage="detailMessage"></message-read-detail>
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
import MessageTplTaskLog from './messageTplTaskLog'
import MessageTplTaskOverdue from './messageTplTaskOverdue'
import MessageTplWeekSummary from './messageTplWeekSummary'
import MessageTplProjectNewTask from './messageTplProjectNewTask'
import MessageTplProjectTaskOverdue from './messageTplProjectTaskOverdue'
import MessageTplDayReport from './messageTplDayReport'
import MessageTplTaskDayReport from './messageTplTaskDayReport'
import MessageTplProjectDiscuss from './messageTplProjectDiscuss'
import MessageTplProjectNewTaskMes from './messageTplProjectNewTaskMes'
import MessageReadDetail from './messageReadDetail'
import MessageTplProjectFileUpload from './messageTplProjectFileUpload'
import RScroll from "plugins/scroll/RScroll";
import Touch from "plugins/touch";
import FileDialog from  "./fileDialog"
import ContextMenu from './contextMenu'
import AtMemberList from './atMemberList'
import REmotion from 'homePage/components/comment-related/REmotion'
export default {
    props:['group','msgList'],
    data(){
        return {
            msg:'',
            detailMessage: {},
            scrollOptions:{
            },
            showEmotion:false,
            page:1,
            loading:false,
            replayMsg:false,//回复消息
            hasNext:true,
            showExtraInput:false,//图片和文件输入框
            showContextMenu:false,//右键菜单
            showAtMemberList:false,//@群成员
            msgInputFocus:false,
            fileDlgContext:null,//文件消息框,
            focusMsgId:null//得到焦点的消息id
        }
    },
    components:{
        MessageTplText,
        MessageTplImg,
        MessageTplMult,
        MessageTplFile,
        MessageTplTaskLog,
        MessageTplTaskOverdue,
        MessageTplWeekSummary,
        MessageTplProjectNewTask,
        MessageTplProjectTaskOverdue,
        MessageTplDayReport,
        MessageTplTaskDayReport,
        MessageTplProjectDiscuss,
        MessageTplProjectNewTaskMes,
        MessageTplProjectFileUpload,
        RScroll,
        LoadMore,
        FileDialog,
        ContextMenu,
        REmotion,
        Touch,
        AtMemberList,
        MessageReadDetail
    },
    filters:{
        replayContent(msg){
            var content = msg.content,
                regex = /(<([^>]+)>)/ig,
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
                    str = msg.content;
                    break;
                case 4://文件
                case 2://图片
                    str = content.content;
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
            return str.replace(regex, "");
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
        openMessageDetail(msg) {
            this.detailMessage = msg;
            this.$refs["detailMessage"].showReadDetailModal = true;
        },
        goBack(){
            this.$router.replace('/msg');
        },
        goTop(msgId){
            var container = this.$refs['msg-container'],
                target = container.querySelector('#msg-'+msgId);

            if(target){
               this.sparkleMsg(msgId);//闪烁效果
               this.scroller.scrollToElement(target);
            }else{
                getGroupMsgById(this.$route.params.groupId,msgId).then(res=>{
                    var  msgList = this.$parent.msgList;

                    msgList.unshift(...res.msgs);

                    this.$nextTick(() => {
                        target = container.querySelector('#msg-'+msgId);
                        this.sparkleMsg(msgId);//闪烁效果
                        this.scroller.scrollToElement(target);
                    });
                });
            }
        },
        scrollToTarget(msgId){
             var container = this.$refs['msg-container'],
                 target = container.querySelector('#msg-'+msgId);

            this.scroller.scrollToElement(target);
        },
        sparkleMsg(msgId){
            var timer = 3,
                time = 300,
                vm = this;

            this.focusMsgId = msgId;
            loop();
            function loop(){
                setTimeout(()=>{
                    vm.focusMsgId = vm.focusMsgId == msgId ? null : msgId;
                    if(vm.focusMsgId != msgId){
                        timer --;
                    }
                    if(timer){
                        loop();
                    }
                },time)
            }
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
            setTimeout(() => { //处理高度增长
               this.autoGrow(); 
            });
        },
        sendTextMsg(){
            var  groupId = this.group.groupId,
                 input = this.$refs.msgInput,
                 params = {
                     groupId:groupId,
			         content:this.msg,
			         imType:1
                 };

            input.focus();
            
            if (this.msg.trim() != '' && this.sending != true){
                if(this.replayMsg){
                   params.replayId = this.replayMsg.id;
                   params.replayMsg = util.clone(this.replayMsg);//replayMsg内容只在ds 推送时有用，后端保存时不会用这个。
                   delete params.replayMsg.replayMsg;//不想发送那么多消息;
                }
                this.sending = true;
                sendMsg(params).then(rs=>{
                   this.sending = false;
                   this.msg = '';
                   setTimeout(()=>{
                       this.autoGrow();
                   })
                   this.replayMsg = null;
                }).catch(e=>{
                    this.sending = false;
                })
            }
            
        },
        sendImgMsg(e){
            var files = e.target.files,
                groupId = this.group.groupId,
                size,
                name2Size = {},
                file;
            
            if (!files) {
               return;
            }
            
            for(var i= 0,l= files.length;i < l; i++){
                file = files[i];
                size = (file.size/1024).toFixed(2);
                if(size > 1024*this.maxSize){
                    this.$vux.alert.show({
                       content: '图片' + file.name + '大于' + this.maxSize + 'M',
                    });
                    return;
                } else if(file.type.indexOf('image/') != 0){
                    this.$vux.alert.show({
                       content: '文件' + file.name + '不是图片！',
                    });
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
                       var fileName = file.attr1,
                           params = {
                              groupId:groupId,
                              imType:2,
                              content:JSON.stringify({
                                        id:file.id,
                                        content:fileName,
                                        size:name2Size[fileName]
                              })
                           };

                       sendMsg(params);
                   });                   
                }
            })
        },
        showCreator(uId){
           this.$router.push({name:'userInfo',params:{uId:uId}});
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
                if(size > 1024*this.maxSize){
                     this.$vux.alert.show({
                       content: '文件' + file.name + '大于' + this.maxSize + 'M',
                    });
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
        onMsgInputFocus(){
            this.showExtraInput=false;
            this.showEmotion = false;
            this.msgInputFocus=true;
            this.$parent.checkDsConnect();//检查ds的连接情况
        },
        onMsgContainerClick(){
            this.$refs.msgInput && this.$refs.msgInput.blur();
            this.showExtraInput=false;
            this.showEmotion = false;
        },
        //检查有没有@符号
        checkAt(e){
            var msg = this.msg,
                lastkey = msg&&msg[msg.length-1];

           // console.log(e);
            this.autoGrow();
            if (this.group.groupType != 'G') return;

            if (e.key == '@' || (e.key != 'Backspace' && lastkey == '@')){//手机端是拿不到e.key的。
                this.showAtMemberList = true;
            } else if(e.key == 'Backspace'){//处理@退格

            }
        },
        autoGrow(){
            var elem = this.$refs.msgInput,
                extra = 10,
                maxHeight = 150,
                height = elem.offsetHeight,
                newHeight,
                style = elem.style,
                minHeight = 36,
                padding = parseInt(getStyle('paddingTop')) + parseInt(getStyle('paddingBottom'));
            
            if (elem._length === elem.value.length) return;
                elem._length = elem.value.length;

            style.height = minHeight + 'px';
            if(elem.scrollHeight > minHeight){
                if (maxHeight && elem.scrollHeight > maxHeight) {
                    newHeight = maxHeight - padding;
                    style.overflowY = 'auto';
                } else {
                    newHeight = elem.scrollHeight - padding;
                    style.overflowY = 'hidden';
                };
                style.height = newHeight + extra + 'px';
            }
            function getStyle(name){
                 return getComputedStyle(elem, null)[name];
            }
        },
        
        selectAtMember(nickName){
             this.msg += nickName+' ';
             this.showAtMemberList = false;
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
                var  msgList = this.$parent.msgList,
                     msgId,
                     msgLength = rs.msgs.length;

                this.loading = false;
                if(msgLength == rs.pageSize){
                    this.page ++;
                } else {
                    this.hasNext = false;
                }
                if (msgLength){
                    if(this.group.groupType !== 'N')this.$parent.handlerTime(rs.msgs,true);
                    msgList.unshift(...rs.msgs);
                    this.$parent.msgList = msgList;
                    if(this.hasNext == false)msgList[0].showTime = true;
                    msgId = rs.msgs[msgLength - 1].id;
                    this.$nextTick(()=>{
                        this.scrollToTarget(msgId);
                    })
                } else {
                    this.$parent.msgList[0].showTime = true;
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
         this.$parent.checkDsConnect();
         this.maxSize = 20;
    },
    mounted:function(){
        this.initContextMenu();//初始化右键菜单
        this.getApp().$on('resize',()=>{
            var scroller = this.scroller;
            if(this.msgInputFocus== true){
                scroller.refresh();//内部重新计算宽高
                setTimeout(()=>{//refresh不会立马在dom中响应并计算。
                    scroller.scrollTo(0,scroller.maxScrollY,0);
                })
            }  
        });
    },
    beforeRouteEnter:function(to,form,next){
        next(vm=>{
            if(vm.group != null){
                vm.checkMessage();//处理未读信息
                vm.getApp().hasTab = false;
            }
        });
        
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
.read-message{
    .message-noread{
      border:2px solid #d2cfcf;
      width: .13rem;
      height: .13rem;
      display: inline-block;
      border-radius: 50%;
    }
    .message-read, 
    .message-allread
    {
      border:1px solid #d2cfcf;
      width: .13rem;
      height: .13rem;
      display: inline-block;
      border-radius: 50%;
      font-size: 10px;
      color: #d2cfcf;
      text-align: center;
      line-height: .13rem;
    }
    .add-select{
      background-color: #39f !important;
    }
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
    // flex:1;
    // position: relative;
    background-color: #ededed;
    font-size: 14px;
    .page-component-up{
        position:absolute;
        bottom:0.2rem;
        span{
            background-color:$weui-BG-1;
        }
    }
}
.scroll-wrapper {
    height: calc(100% - .76rem);
    font-size: 0;
}
/deep/ .scroll-content {
    display: flex;
}
.msgList-footer {
    position: relative;
    .replayMsg{
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        padding: .10rem;
        color: #999999;
        border-top: 0.5px solid #ddd;
        .replayMsg-content{
            flex:1
        }
        .icon-close{
            width:.16rem;
            height:.16rem;
        }
    }
    .input-wrapper{
        padding: .08rem .1rem;
        background-color: #f3f1f2;
        font-size: 0;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;

        pre{
            width: calc(100% - 1rem);
            min-height: 30px;
            overflow: hidden;
        }
        textarea{
            display: inline-block;
            padding: .05rem .1rem;
            width: calc(100% - 1rem);
            outline: none;
            vertical-align:baseline;
            border-radius: 0.05rem;
            border: none;
            background-color: #fff;
            color: #2d2d2d;
            font-size: .16rem;
            height: 36px;
            resize: none;
            -webkit-box-sizing: border-box;
            box-sizing: border-box;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
        } 
        .icon-emotion{
            display: inline-block;
            margin-left: .1rem;
            width: .3rem;
            height: .3rem;
            background: url(~@/assets/emotion.png) no-repeat;
            background-size: 100% 100%;
        }
        .icon-add-more{
            display: inline-block;
            margin-left: .2rem;
            width: .3rem;
            height: .3rem;
            background: url(~@/assets/iconfont/add.png) no-repeat;
            background-size: 100% 100%;
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
            vertical-align: bottom;
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
        width: .45rem;
        height: .45rem;
        border-radius: .02rem;
    }

    &-creator{
        display: block;
        margin-left: .50rem;
        font-size: 10px;
        color: #9E9E9E;
    }
    &-content{
        border-radius: 5px;
        padding: .08rem;
        position: relative;
        margin: .02rem .06rem;
        display: inline-block;
        max-width: 70%;
        background-color: #ffffff;
        word-break: break-all;
        /deep/ img{
            max-width: 100%;
            max-height: 1rem;
        }
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
        background-color:rgb(191, 221, 255);
    }
}
.focus-msg{
    .message-content{
        background-color:rgb(255, 206, 191);
    }
     .rightarrow:after{
        border-left-color: rgb(255, 206, 191);
     }
     .leftarrow:after{
        border-right-color: rgb(255, 206, 191);
     }
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

.otherMessage{
    text-align: center;
    color: #999999;
}
</style>