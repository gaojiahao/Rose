<!--消息页面-->
<template>
    <div class="msg-navigation page-wrapper">
        <div class="page-hasTab">
            <div class="page-navigation">
                <div>消息</div>
                <div :style="{lineHeight:'.1rem'}">
                    <span @click="onSearchClick" class="navigation-search">
                        <span class="iconfont icon-serch"></span>
                    </span>
                    <span class="navigation-add" @click="showNavList">
                        <span class="iconfont icon-add"></span>
                    </span>
                </div>
            <div class="navigation-add-list-mask" v-show="showList" @click="showList = false"></div>
            <div class="navigation-add-list" v-if="showList">  
                <p @click="showCreateGroupList">发起群聊</p>
            </div>
            </div>
                <RScroll 
                    class="page-body-hasNav" 
                    :options="scrollOptions"
                    :has-next="hasNext"
                    ref="bScroll"
                    :hideToast="true"
                    @on-pulling-down="onPullingDown"
                    :no-data="false"
                >
                <LoadMore :show-loading="showLoading" v-show="showLoading"></LoadMore>
                <div class = 'group-cells'>
                    <div class="group-cell" :class="{'isTop':group.focus}" v-for="group in sortedGroup" :key = "group.id">
                        <touch 
                            class="group-body"
                            @menuContext.stop="onNavContextMenu(group)" 
                            @click="toMsg(group)">
                                <div class="group-body-icon">
                                    <span v-if="group.groupType!='N'">
                                        <img class="group-body-icon-ava" 
                                            :src="group.groupIcon|appIconFilter"
                                            @error="getDefaultPhoto(group)">
                                    </span>
                                    <div v-if="group.groupType=='N'" class="notice-group">
                                        <i class="iconfont icon-icyhbynotice" ></i>
                                    </div>
                                    <badge  
                                        class="group-body-icon-msgCount"
                                        :text='group.msgCount' 
                                        v-if="group.msgCount">
                                    </badge>
                                </div>
                                <div  class="group-body-detail">
                                    <div  class="group-body-detail-group">
                                        <div class="group-body-detail-group-name" style="">{{group.groupName}}</div>
                                        <div class="group-body-detail-group-modTime" style="">{{group.modTime | timeChangeFilter}}</div>
                                    </div>
                                    <div class="group-body-detail-lastMsg" v-if="group.lastMsg">
                                    <span style="color: #b90c0c;" v-if="group.lastMsg.content.includes(`@${currentUser.name}`)">[有人@我]</span>
                                    <span>{{group.lastMsg.creatorName}}:</span>
                                    <span v-if="[1,101,102,104].includes(parseInt(group.lastMsg.imType))" v-html="formatToEmotion(group.lastMsg.content)"></span>
                                    <span v-else-if="group.lastMsg.imType==2">[图片]</span>
                                    <span v-else-if="[3,4].includes(group.lastMsg.imType)">[文件]</span>
                                    <span v-else-if="group.groupType=='N'">[通知]</span>
                                    <span v-else-if="group.groupType=='P'">[项目任务通知]</span>
                                    <span v-else-if="group.groupType=='G'">[通知]</span>
                                </div> 
                                </div>
                        </touch>
                    </div>
                </div>
                </RScroll>
        </div><!--page end-->
        <nav-context-menu v-show="showNavContextMenu" :group="navGroup">
        </nav-context-menu>
        <router-view :group="group" :msgList="msgList" ref="groupMsg"></router-view>
        <member-selector 
            ref="memberSelector"
            :confirmCallback="addGroup">
        </member-selector>
        <nav-search ref="navSearch" @searchToMsg="searchToMsg"></nav-search>
    </div><!-- wrapper end-->
</template>
<script>
import { LoadMore,XInput,Icon } from 'vux'
import { getGroupMsg,getMyGroups,createGroup,getGroupByUserId,getMembers,getGroupById,checkMessage} from 'service/msgService'
import commonService from 'service/commonService'
import tokenService from 'service/tokenService'
import util from '@/common/util';
import Bus from '@/common/eventBus.js';
import MemberSelector from './msg/memberSelector';
import NavSearch from './msg/navSearch';
import RScroll from "plugins/scroll/RScroll";
import Touch from "plugins/touch";
import NavContextMenu from "./msg/navContextMenu";
import { Badge} from 'vux'
import MD5 from 'md5.js'
var defaultPhoto = require("assets/ava01.png");
export default {
    created:function(){       
        this.initDs();
        this.initGroup();
        this.uIdToPhoto = {};
        //commonService.scheduled();
    },
    watch: {
        $route(to, from) {
            if(to.name==='MsgNavigation'){
                this.group = null;
            }
        }
    },
    mounted:function(){
        Bus.$on('toMsg', group => {
            this.toMsg(group)
        })
        Bus.$on('updateGroups', () => {
            this.initGroup();
        });
        Bus.$on('refresh',()=>{
             this.refresh = true;//要刷新了。
        })
    },
    beforeUpdate:function(){
        this.checkGroupUpdate();
    },
    computed:{
        sortedGroup:function(){
            var a =  this.sortKey(this.groups,'modTime');
            return a;
        }
    },
    activated:function(){
        if(this.refresh){//如果需要刷新
            this.refresh = false;
            this.groups = [];
            this.initGroup();
            this.group = null;
        }
        console.log('navigation active!');
        this.checkDsConnect();//检查deepstream的连接有没有掉线。
    },
    data(){
        return {
            scrollOptions:{
                click: true,
                pullUpLoad: false,//上拉刷新
                pullDownRefresh: false //下拉刷新
            },
           hasNext:false,
           showNavContextMenu: false,
           currentUser:{},
           navGroup: {},
           groups:[],
           group:null,
           msgList:[],
           showLoading:true,
           toTopShow:false,
           showList: false
        }
    },
    components:{
        RScroll,
        LoadMore,
        MemberSelector,
        NavContextMenu,
        NavSearch,
        XInput,
        Icon,
        Touch,
        Badge
    },
    methods:{
        onPullingDown(){
            this.initGroup();
        },
        getDefaultPhoto(group) {
            let url = defaultPhoto;
            if (group) {
                group.groupIcon = url;
            }
            return url;
        },
        onNavContextMenu(group){
            this.navGroup = group;
            this.showNavContextMenu = true;
        },
        onSearchClick() {
            this.$refs["navSearch"].showSearchList = true;
        },
        searchToMsg(item) {
            this.toMsg(item);
        },
        initGroup:function(cb){
            var groupId = this.$route.params.groupId;
            this.showLoading  = true;
            getMyGroups().then(data=>{
                var groupIdToIndex = {};//建立一个映射关系，方便以后使用
                data.forEach((group,index)=>{
                    groupIdToIndex[group.groupId] = index;
                    if(this.group == null && group.groupId == groupId){
                        this.toMsg(group);
                        this.$nextTick(()=>{ //初始化右键菜单
                            this.$refs.groupMsg.initContextMenu();
                        });
                    }
                });
                this.groupIdToIndex = groupIdToIndex;
                this.groups = data;
                // this.scroller && this.scroller.refresh();
                this.showLoading = false;
                this.setAppNoticeBadge();
                //  this.$nextTick(() => {
                //     this.$refs.bScroll.finishPullDown();
                // });
            }).catch(e=>{
                if(e.message == 'nologin'){//没有登录
                    this.refresh = true;
                }
            })
        },
        //处理通过路由切换 groupId,聊天页面无相应的情况。
        checkGroupUpdate(){
            var groupId = this.$route.params.groupId,
                i,l;

            if(this.groups.length && groupId != null && (this.group == null || this.group.groupId != groupId)){
                 for(i=0, l = this.groups.length; i<l; i++){
                    if(this.groups[i].groupId == groupId){
                        this.toMsg(this.groups[i]);
                        break;
                    }
                 }
            }
        },
        checkDsConnect(){
            var dsClient = window.dsClient,
                status = dsClient && dsClient.getConnectionState();

            if(status == 'CLOSED' || dsClient == null){
               this.describeMsg = false;//如果是关闭状态，则订阅失效了。
               this.initDs();
            }
        },
        initDs:function(){
            var vm = this,
                app = this.getApp();
            
            if(this.dsConnectStart == true)return;//防止建立多条连接。
            this.dsConnectStart = true;
            return commonService.getBasicInfo().then(baseInfo => {
                var data = baseInfo.currentUser,
                    deepStreamUrl = baseInfo.deepStreamUrl,
                    userId = data && data.userId;

                vm.currentUser = data;
                if(deepStreamUrl && userId){
                    app.getDs(deepStreamUrl,userId).then(ds=>{
                         this.dsConnectStart = false;
                         if (this.describeMsg != true){//防止断线重连时重复订阅
                             vm.describeDs(ds,userId);
                             this.describeMsg = true;
                         }
                    });
                }
            }).catch((e)=>{
                this.dsConnectStart = false;
                console.log(e);
            })
        },
        describeDs(ds,userId){
            var md5stream = new MD5(),
                token;

            md5stream.end(''+userId);
            token = md5stream.read().toString('hex');

            console.log('订阅消息');
            ds.event.subscribe('roletaskIm/'+ token, data => {
                console.log('msg',data);
                this.distributeMsg(data); 
            });
        },
         checkMessage:function(){
            var groupId = this.group.groupId;
            // to:签收消息
            checkMessage(groupId).then(res=>{
                console.log('签收成功');
            });
        },
        /**
         * 分发消息
         * 1	text
           2	image
           3    multi
           4    file
            100 group create
            101 add member
            102 del member
            103 im check
            104 group rename
            105 group owner
         */
        distributeMsg(msg){
            var type = String(msg.imType);
             msg.imType = parseInt(type);
            switch(type){
                case '1':
                case '2':
                case '3':
                case '4':
                case '101':
                    this.addMsg(msg);
                    this.setAppNoticeBadge();
                    break;
                case '100':
                   this.addNewGroup(msg);
                    break;
                case '103':
                    this.setMsgReadCount(msg);
                    this.setAppNoticeBadge();
                    break;
                case '104':
                    this.addMsg(msg);
                    this.setGroupName(msg);
                    break;
                default:
                    break;
            }
        },
        setGroupName(msg){
            var groupName = msg.content.split('【').pop().split('】')[0];
            this.groups.map(g=>{
                if(g.groupId ===msg.groupId) g.groupName = groupName;
            });

            if(this.group){
                if(this.group.groupId === msg.groupId){
                    this.group.groupName = groupName;
                }
            }
        },
        setAppNoticeBadge(){

            var c = 0;
            this.groups.map(g=>{
                c = c+g.msgCount;
            });
            
            this.$event.$emit("setMsgCount", c);

            if(!window.isApp) return;
            try {
                if(c){
                    cordova.plugins.notification.badge.set(c);
                }else{
                    cordova.plugins.notification.badge.clear();
                }
            } catch (error) {
                
            }
            
        },
        addNewGroup(msg){
            let isExist = false;

            this.groups.map(g=>{
                if(g.groupId === msg.groupId) isExist = true;
            });
            if(!isExist)this.groups.push(msg);
            
            msg.lastMsg.isMySelf = msg.isMySelf;
            msg.lastMsg.creator = msg.creator;
            this.addMsg({
                ...msg.lastMsg,
                checked:0
            });
        },
        /**
         * 设置消息已读未读数
         */
        setMsgReadCount(msg){
            var group,
                vm = this;

            if (this.group && this.group.groupId == msg.groupId){//如果是当前消息页面的消息
                this.msgList.map(m=>{
                    if(msg.messages.includes(m.id)){
                        if(this.group.groupType ==='G'){
                            m.checked++;
                        }else{
                            m.allRead = true;
                        }
                        
                    }
                });
                    
                if(this.$refs.groupMsg != null){ //如果页面是打开的。
                    setTimeout(function(){
                        vm.$refs.groupMsg.scrollToButtom();
                    });
                }
            }
        },
        /**
         * 处理消息信息
         */
        addMsg(msg){
            var groupId = msg.groupId,
                index,
                vm = this,
                group;

            if (this.groups.length){
                this.groups.map(g=>{
                    if(g.groupId === msg.groupId){
                        group = g;
                    }
                });
                if (group != null){ //如果存在群消息列表里。
                    group.modTime = msg.crtTime;//修改时间
                    if (msg.photo == null){
                        this.setMsgPhoto(msg);
                    }
                    if(group.lastMsg){
                        group.lastMsg.content = msg.content;
                        group.lastMsg.creatorName = msg.creatorName;
                        group.lastMsg.imType = msg.imType;
                    } else {
                        group.lastMsg = msg;
                    }

                    if(!msg.isMySelf ){
                        if(this.group){
                            if(this.group.groupId != msg.groupId)group.msgCount++;
                        }else{
                            group.msgCount++;
                        }
                    }
                    if(window.isApp && !msg.isMySelf  ){ //添加app的消息提醒
                         if(this.group){
                            if(this.group.groupId != msg.groupId) this.addNotification(group,msg);
                        }else{
                            this.addNotification(group,msg);
                        }
                        
                    }
                    if (this.group && this.group.groupId == groupId){//如果是当前消息页面的消息
                        let l = this.msgList.length;
                        this.$set(this.msgList,l,msg);
                        if(this.$refs.groupMsg != null){ //如果页面是打开的。
                            setTimeout(function(){
                                vm.$refs.groupMsg.scrollToButtom();
                                vm.checkMessage();
                            });
                        }
                    }
                } else {//要添加新群了。
                    getGroupById(groupId).then(group=>{
                        group.lastMsg = msg;
                        this.addNewGroup(group);
                    })
                }
            }
        },
        addNotification(g,msg){
            var groupIcon = 'https://lab.roletask.com/resource/common-icon/male.png',
                content = msg.imType == '1' ? msg.content : JSON.parse(msg.content),
                text = '';
            
            msg.imType = String(msg.imType);
      
            switch(msg.imType){
                case '1':
                    text = content;
                    break;
                case '2':
                    text = '[图片]';
                    break;
                case '3':
                    content.forEach(m=>{
                        if (m.imType == '1'){
                            text += m.content;
                        } else if(m.imType == '2'){
                            text += '[图片]';
                        }  else if(m.imType == '4'){
                            text += '[文件]' + m.content;
                        }
                    });
                    break;
                case '4':
                    text = '[文件]' + content.content;
            }
            window.notification.schedule({
                data:msg,
                title: msg.groupName,
                text:`${msg.creatorName}:${text}`,
                foreground: true,
                icon:this.$options.filters.appIconFilter(g.groupIcon) || groupIcon
            });

            navigator.vibrate(300);
        },
        
        /**
         * 跳转到groupMsg页面
         */
        toMsg:function(group){
            var groupId = group.groupId,
                path = '/msg/group/'+ groupId,
                isExist = false;
            
            this.groups.map(g=>{
                if(g.groupId === group.groupId) isExist = true;
            });

            if(!isExist){
                this.groups.push(group);
            }
            
            if(group != this.group){
                this.group = group;
                getGroupMsg(groupId).then(res=>{
                    if(group.groupType !== 'N'){
                        this.handlerTime(res.msgs);
                    }
                    this.msgList = res.msgs;
                    // var data = {
                    //     creator: "1",
                    //     groupId: "b171c44c1e2cffea7f20da05666e1094",
                    //     creatorName: "管理员",
                    //     photo: "/H_roleplay-si/ds/download?width=128&height=128&specify=true&url=/20820e55-6f5c-467c-ac85-da211ab030bb/9535e8c8-904a-49d0-a235-c84efa4b05ac.jpeg",
                    //     crtTime: "2020-09-04 09:00:00",
                    //     imType: 207,
                    //     content: {"groupId":"b171c44c1e2cffea7f20da05666e1094","imType":207,"content":{"projectName":"xxx项目","taskName":"销售合同签订","startTime":"2020-09-04","endTime":"2020-09-24"}},
                    //     allRead: true,
                    //     checked: 0,
                    //     id: "6844e826-fef9-4e4a-8dfa-b41ec87a3dd5",
                    //     replayId: null,
                    //     replayMsg: null,
                    //     isMySelf: 0,
                    // };
                    var data2 = {
                        creator: "1",
                        groupId: "b171c44c1e2cffea7f20da05666e1094",
                        creatorName: "管理员",
                        photo: "/H_roleplay-si/ds/download?width=128&height=128&specify=true&url=/20820e55-6f5c-467c-ac85-da211ab030bb/9535e8c8-904a-49d0-a235-c84efa4b05ac.jpeg",
                        crtTime: "2020-09-04 09:00:00",
                        imType: 209,
                        content: [{"groupId":"b171c44c1e2cffea7f20da05666e1094","imType":209,"content":{"taskName":"任务名称","executor":"执行者","standardWorkingHours":"计划工时","log":[{"jobLogTitle":"日志标题","handlerName":"日志经办人","workingHours":"申报工时","result":"成果"}]}}],
                        allRead: true,
                        checked: 0,
                        id: "6844e826-fef9-4e4a-8dfa-b41ec87a3dd5",
                        replayId: null,
                        replayMsg: null,
                        isMySelf: 0,
                    };
                    // var data3 = {
                    //     creator: "1",
                    //     groupId: "b171c44c1e2cffea7f20da05666e1094",
                    //     creatorName: "管理员",
                    //     photo: "/H_roleplay-si/ds/download?width=128&height=128&specify=true&url=/20820e55-6f5c-467c-ac85-da211ab030bb/9535e8c8-904a-49d0-a235-c84efa4b05ac.jpeg",
                    //     crtTime: "2020-09-04 09:00:00",
                    //     imType: 210,
                    //     content: [{"groupId":"b171c44c1e2cffea7f20da05666e1094","imType":210,"content":[{"taskName":"任务名称","executor":"执行者","endTime":"计划结束日期","overdueDays":"逾期天数"}]}],
                    //     allRead: true,
                    //     checked: 0,
                    //     id: "6844e826-fef9-4e4a-8dfa-b41ec87a3dd5",
                    //     replayId: null,
                    //     replayMsg: null,
                    //     isMySelf: 0,
                    // };
                    // this.msgList.push(data);
                    //this.msgList.push(data2);
                    // this.msgList.push(data3);
                    if (this.$route.params.groupId != groupId){
                        this.$router.push(path);
                    }
                    this.$nextTick(()=>{
                        this.$refs.groupMsg.scrollToButtom(0);
                    })
                });
            } else {
                this.$router.push(path);
                this.$nextTick(()=>{
                    this.$refs.groupMsg.scrollToButtom(0);
                })
            }
        },
        handlerTime(msgs,append){
            var startTime = append == true ? this.lastMsgTime : null,
                showTime = append = true ? this.lastShowTime : null,
                fillTime,
                crtTime,
                msg;

            for(var i = msgs.length-1;i>=0;i--){
               
               msg = msgs[i];
               crtTime = new Date(msg.crtTime).getTime();
               if(startTime == null) {
                   showTime  = startTime = crtTime; 
                   continue;
               }
               if([101,102,104].includes(msg.imType))continue;
               fillTime = startTime - crtTime;
               if(fillTime <= 300000){//5*60*1000 小于5分钟的计为一组有联系的对话。
                   startTime = crtTime;
                   if(crtTime - showTime >= 1800000){//同一组对话，半小时显示一次时间。
                       msgs[i].showTime = true;
                       showTime = startTime;
                   }
               } else {//超过5分钟计为下一组对话
                   if(msgs[i+1]){
                       msgs[i+1].showTime = true;
                   } else {
                       this.msgList[0].showTime = true;
                   }
                   showTime = startTime = crtTime;
               }
            }
            this.lastShowTime = showTime;
            this.lastMsgTime = startTime;
            return msgs;
        },
        showNavList() {
            this.showList = !this.showList;
        },
        showCreateGroupList() {
            var memberSelector = this.$refs["memberSelector"];
            this.showList = false;
            memberSelector.showMemberSelector = true;
        },
        addGroup(userList) {
            let userIds = [],
                userNames = [],
                params = {},
                requestUrl = createGroup;

            userList.forEach(user =>{
                userIds.push(user.userId);
                userNames.push(user.nickname);
            })

            if(userList.length === 1){
                params = userIds.join(',')
                requestUrl = getGroupByUserId;
            }else{
                userNames.push(this.currentUser.nickname);
                params = {
                    groupId: null,
                    users: userIds.join(','),
                    name: userNames.join(',')
                };
            }
            
            requestUrl(params).then(res => {
                res.message && this.$vux.toast.show({text: res.message});
                this.$refs["memberSelector"].showMemberSelector = false;
                this.toMsg(res);
                this.showList = false;
            })
        },
        checkLocalMessage(groupId){
            this.groups.map(g=>{
                if(g.groupId === groupId){
                    g.msgCount = 0;
                }
            });

            this.setAppNoticeBadge();
        },
        setMsgPhoto:function(msg){
            var uIdToPhoto = this.uIdToPhoto,
                photo = uIdToPhoto[msg.creator];

            if ( photo!= null){
                msg.photo = photo;
            } else {
                getMembers(msg.groupId).then(members => {
                   members.forEach(member=>{
                       uIdToPhoto[member.userId] = member.photo || defaultPhoto;
                   })
                   this.$set(msg,'photo', uIdToPhoto[msg.creator]);
                })
            }
        },
        sortKey(array,key){
            array =  array.sort(function(a,b){
                var x = a[key];
                var y = b[key];
                return ((x<y)?1:(x>y)?-1:0)
            })

            return array.sort(function(a,b){
                return (a.focus && !b.focus)?-1:0;
            })
        }
    }
}
</script>
<style lang="less" scoped>
  .msg-navigation{
      .page-navigation{
          display: flex;
          justify-content: space-between;
          align-items: center;
          .navigation-add{
            .icon-add{
                  font-size: .20rem;
              }
          }
          .navigation-search{
              margin-right: .1rem;
              .icon-message-search{
                  width: .25rem;
                  height: .25rem;
                  display: inline-block;
              }
          }
          .navigation-search /deep/ .weui-icon-search{
              font-size: .2rem;
              color: #fff;
              width: 26px;
              height: 26px;
          }
      }
      .navigation-add-list-mask{
          position: absolute;
          top:0;
          left:0;
          right: 0;
          bottom:0;
          z-index: 99;
          background: transparent;
      }
      .navigation-add-list{
        position: absolute;
        top: .6rem;
        z-index: 100;
        background-color: #3296fa;
        right: .05rem;
        padding: .05rem;
        border-radius: .03rem;
        color: white;
        font-size: 14px;
        line-height: 16px;
      }
  }
  .scroller-wrapper{
    height: 100%;
  }
  .isTop{
       background: #ececec;
  }
  .group-cells{
      background: #fff;
  }
  .group-cell::before{
    content: " ";
    position: absolute;
    left: 65px;
    top: 0;
    right: 0;
    height: 1px;
    border-top: 1px solid rgba(0,0,0,0.1);
    color: rgba(0,0,0,0.1);
    -webkit-transform-origin: 0 0;
    transform-origin: 0 0;
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
  }
  .group-cell{
      padding:5px 10px;
      position: relative;
      display: flex;
      
  }
  .group-body{
    width: 100%;
    display: flex;
    &-icon{
        flex: 1;

        .notice-group{
            text-align: center;
            background-color: #f90;
            border-radius: .02rem;
            width: 45px;
            height: 45px;

            .icon-icyhbynotice{
                font-size: .28rem;
                color: #fff;
            }
        }
        &-ava{
            width: .45rem;
            height: .45rem;
            border-radius: .02rem;
        }
        &-msgCount{
            position: absolute;
            left:45px;
            top:0;
        }
    }

    &-detail{
        flex:6;
        padding: .05rem .08rem;
        &-group{
            display:flex;

            &-name{
                flex:4;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                width: 100%;
                max-width: 235px;
                font-size: 14px;
            }

            &-modTime{
                flex:1;
                color: #898181;
                font-size: 12px;
                text-align: right;
            }
        }

        &-lastMsg{
            color: #898181;
            font-size: 12px;
            height:18px;
            line-height: 18px;
            width: 240px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
                
            span{
                /deep/.static-emotion-gif{
                height: .16rem;
                }
                /deep/.face{
                height: .16rem;
                }
            }
        }
    }
  }
  .group-cell .modTime{
    position:absolute;
    right:15px;
    top:5px;
    color: #898181;
    font-size: 12px;
  }
  .msg-lastMsg{
   
  }
</style>