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
            id="msg-container-wrapper"
            :options="scrollOptions"
            :has-next="false"
            :no-data="false"
            @on-pulling-down="onPullingDown"
            ref="scroller"
        >
            <div class="msg-container">
                <LoadMore v-if="loading"></LoadMore>
                <div v-for="(msg,index) in msgList" :key="index" class="singleMsg">
                    <MessageTplText :msg="msg" v-if="msg.imType == 1"></MessageTplText>
                    <MessageTplImg :msg="msg" v-else-if="msg.imType == 2"></MessageTplImg>
                    <MessageTplMult :msg="msg" v-else-if="msg.imType == 3"></MessageTplMult>
                    <MessageTplFile :msg="msg" v-else-if="msg.imType == 4"></MessageTplFile>
                </div>
            </div>
        </r-scroll>
        <div class="msgList-footer">
            <div class="input-wrapper">
                
                <textarea class="msg-input"  v-model="msg" type="text" @keyup.enter="sendTextMsg"></textarea>
                <i class="icon-emotion" @click="showEmotion = !showEmotion;showExtraInput=false;"></i>
                <i class="icon-add-more" @click="toggleWrapper" v-if="!msg"></i>
                <span class="btn-send" v-if="msg" @click="sendTextMsg">发送</span>
            </div>
            <div class="extra-input-wrapper" v-show="showExtraInput">
                <div>
                
                    <i class="iconfont icon-3801wenjian uploader">
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
            <r-emotion :show="showEmotion" @on-select="emotionSelected" ref="emotion"></r-emotion>
            <FileDialog v-if="fileDlgContext" @cancel="cancleFile" @todo="sendFileMsg" :msg="fileDlgContext"></FileDialog>
        </div>
        <!-- groupInfo 消息信息页面-->
        <router-view :group="group" ref="groupInfo"></router-view>
        <!-- groupInfo end -->
    </div> <!--page end-->
</template>
<script>
import {LoadMore} from 'vux'
import util from '@/common/util'
import {upload} from 'service/commonService'
import {sendMsg,getGroupMsg} from 'service/msgService'
import MessageTplText from '@/views/msg/msg/messageTplText'
import MessageTplImg from '@/views/msg/msg/messageTplImg'
import MessageTplMult from '@/views/msg/msg/messageTplMult'
import MessageTplFile from '@/views/msg/msg/messageTplFile'
import RScroll from "plugins/scroll/RScroll";
import FileDialog from  "./fileDialog"
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
            hasNext:true,
            showExtraInput:false,
            fileDlgContext:null,//文件消息框
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
        REmotion
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
                sendMsg(params).then(rs=>{
                //    this.msg = '';
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
                    content:[],
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
                var fileName;
                if (rs.success){
                   e.target.value = null;
                   rs.data.forEach(file=>{
                       fileName = file.attr1;
                       params.content.push({
                            id:file.id,
                            name:fileName,
                            imType:2,
                            size:name2Size[fileName]
                       })
                   });
                   params.content = JSON.stringify(params.content);
                   sendMsg(params).then(rs=>{
                       e.target.value = null;
                   })
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
            this.fileDlgContext = {
                to:'test',
                content:files.length == 1?
                    [files[0].name,'，',util.formatFileSize(files[0].size,1)].join('')
                    :['已选',files.length,'个，共',util.formatFileSize(countSize,1)].join('')
            }
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
                var fileName,
                    params = {
                        groupId:this.group.groupId,
                        content:[],
                        imType:4
                    };

                if (rs.success){
                   rs.data.forEach(file=>{
                       fileName = file.attr1;
                       params.content.push({
                            id:file.id,
                            content:fileName,
                            imType:4,
                            size:name2Size[fileName]
                       })
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
        checkAndUpload(){

        },
        toggleWrapper(){
            this.showExtraInput = !this.showExtraInput;
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
</style>