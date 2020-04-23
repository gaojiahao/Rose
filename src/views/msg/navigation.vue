<!--消息页面-->
<template>
    <div class="msg-navigation page-wrapper">
        <div class="page-hasTab">
            <div class="page-navigation">
                <div>消息</div>
                <div class="navigation-add" @click="showNavList">+</div>
            </div>
            <div class="navigation-add-list" v-if="showList">
                <p @click="showCreateGroupList">发起群聊</p>
            </div>
            <div class="page-body-hasNav" ref="scrollerWrapper">
                <LoadMore :show-loading="showLoading" v-show="showLoading"></LoadMore>
                <div class = 'group-cells'>
                    <div class="group-cell" v-for="group in groups" :key = "group.id" @click="toMsg(group)">
                        <div class="group-ava">
                            <img :src="group.groupIcon" @error="getDefaultPhoto(group)">
                        </div>
                        <div class="group-body">
                            <div>
                                {{group.groupName}}
                            </div>
                            <div class="msg-lastMsg" v-if="group.lastMsg">
                                <span>{{group.lastMsg.creatorName}}:</span>
                                <span v-if="group.lastMsg.imType===1" v-html="group.lastMsg.content"></span>
                                <span v-if="group.lastMsg.imType===2">文件</span>
                            </div> 
                        </div>
                        <span class="msgCount" v-if="group.msgCount">
                            <sup class="badge-count">{{group.msgCount}}</sup>
                        </span>
                        <div class="modTime">
                            {{group.modTime | timeChange}}
                        </div> 
                    </div>
                </div>
            </div>
        </div><!--page end-->
        <router-view :group="group" :msgList="msgList" ref="groupMsg"></router-view>
        <member-selector 
            ref="memberSelector"
            :confirmCallback="addGroup">
        </member-selector>
    </div><!-- wrapper end-->
</template>
<script>
import { LoadMore } from 'vux'
import { getGroupMsg,getMyGroups,createGroup,getGroupByUserId } from 'service/msgService'
import commonService from 'service/commonService'
import tokenService from 'service/tokenService'
import util from '@/common/util';
import Bus from '@/common/eventBus.js';
import WebContext from 'service/commonService'
import { initWebContext } from 'service/commonService'
import MemberSelector from './msg/memberSelector';
export default {
    created:function(){       
        this.initDs();
        initWebContext().then(() => {
            this.currentUser = WebContext.WebContext.currentUser;
        })
    },
    mounted:function(){
        this.initScoller();
        this.initGroup();
        Bus.$on('toMsg', group => {
            this.toMsg(group)
        })
    },
    activated:function(){
    },
    data(){
        return {
           groups:[],
           group:null,
           msgList:[],
           showLoading:true,
           toTopShow:false,
           showList: false
        }
    },
    components:{
        LoadMore,
        MemberSelector
    },
    methods:{
         getDefaultPhoto(group) {
            let url = require("assets/ava01.png");
            if (group) {
                group.groupIcon = url;
            }
            return url;
        },
        initScoller:function(){
            var scrollWrapper = this.$refs.scrollerWrapper;

            if(!scrollWrapper)return;

            this.scroller = new this.Bscroll(scrollWrapper, {
                click: true,
                pullUpLoad: true,
                pullDownRefresh: true,
            });
            this.scroller.on('scroll', ({x, y}) => {
                if(Math.abs(y)>1000)
                this.toTopShow = true;
                else if(Math.abs(y)<1000)
                this.toTopShow = false; 
            })
        },
        initGroup:function(cb){
            this.showLoading  = true;
            getMyGroups().then(data=>{
                var groupIdToIndex = {};//建立一个映射关系，方便以后使用
                data.forEach((group,index)=>{
                    groupIdToIndex[group.groupId] = index;
                });
                this.groupIdToIndex = groupIdToIndex;
                this.groups = data;
                this.scroller && this.scroller.refresh();
                this.showLoading = false
            })
        },
        initDs:function(){
            var vm = this,
                describe = false,
                app = this.getApp();

            return commonService.getBasicInfo().then(baseInfo => {
                var data = baseInfo.currentUser,
                    deepStreamUrl = baseInfo.deepStreamUrl,
                    userId = data && data.userId;
                
                if(deepStreamUrl && userId){
                    app.getDs(deepStreamUrl,userId).then(ds=>{
                         if (describe == false){//防止断线重连时重复订阅
                             describe = true;
                             vm.describeDs(ds);
                         }
                    });
                }
            })
        },
        describeDs(ds){
            var token = tokenService.getToken();
            ds.event.subscribe('roletaskIm/'+ token, data => {
                this.distributeMsg(data);
            });
        },
        /**
         * 分发消息
         * 1	text
           2	image
            100 group create
            101 add member
            102 del member
            103 im check
            104 group rename
            105 group owner
         */
        distributeMsg(msg){
            var type = msg.imType;
            switch(type){
                case '1':
                    this.addMsg(msg,1);
                    break;
                case '2':
                    this.addMsg(msg,2);
                    break;
                default:
                    break;
            }
        },
        /**
         * 处理文字信息
         */
        addMsg(msg,type){
            var groupId = msg.groupId,
                index,
                vm = this,
                group;

            if(type == 2 || type == 3){
                msg.content = JSON.parse(msg.content);
            }
            if (this.groups.length){
                index = this.groupIdToIndex[groupId];
                group = this.groups[index];
                if (group != null){ //如果群消息页面打开了。
                    group.modTime = msg.crtTime;//修改时间
                    group.lastMsg.content = msg.content;
                    if (this.group && this.group.groupId == groupId){//如果是当前消息页面的消息
                        let l = this.msgList.length;
                        this.$set(this.msgList,l,msg);
                        setTimeout(()=>{
                            this.$refs.groupMsg.scrollToButtom();
                        })
                    }
                } else {//要添加新群了。
                    
                }
            }
        },
        /**
         * 跳转到groupMsg页面
         */
        toMsg:function(group){
            if(group != this.group){
                this.group = group;
                getGroupMsg(group.groupId).then(msgList=>{
                    msgList.msgs.map(msg=>{
                        var json;
                        if(msg.imType == 3 || msg.imType == 2){
                            try{
                                json = JSON.parse(msg.content);
                                msg.content = json;
                            }catch(e){
                                console.log('msg content parse error',msg.content);
                            }
                        }
                    })
                    this.msgList = msgList.msgs;
                    this.$router.push('/msg/group')
                });       
            } else {
                this.$router.push('/msg/group')
            }
        },
        showNavList() {
            this.showList = !this.showList;
        },
        showCreateGroupList() {
            this.$refs["memberSelector"].showMemberSelector = true;
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
                userNames.push(this.currentUser.name);
                userIds.push(this.currentUser.userId);
                params = {
                    groupId: null,
                    users: userIds.join(','),
                    name: userNames.join(',')
                };
            }
            
            requestUrl(params).then(res => {
                res.message && this.$vux.toast.show({text: res.message});
                this.$refs["memberSelector"].showMemberSelector = false;
                this.showList = false;
                this.toMsg(res);
            })
        }
        
    },
    filters:{
       timeChange:function(time){
           var diffTime = (new Date().getTime() - new Date(time))/1000,
               str = '';
           
           if(diffTime < 60){
               str = '刚刚'
           } else if(diffTime < 60*60){
               str = Math.floor(diffTime/60) + '分钟前';
           }else if (diffTime < 60 * 60 * 24)
            {
                str = Math.floor(diffTime/(60*60))+'小时前 ';
            }
            else if (diffTime < 60 * 60 * 24 * 2)
            {
                str = Math.floor(diffTime/(60*60*24)) == 1 ? '昨天 ' : '前天 ';
            }
            else
            {
                str = util.formatDateTime(time);
            }
            return str;
       }
    }
}
</script>
<style lang="scss">
  .msg-navigation{
      .page-navigation{
          display: flex;
          justify-content: space-between;
          align-items: center;
          .navigation-add{
            font-size: .3rem;
            line-height: .16rem;
            text-align: center;
            border: 2px solid #fff;
            border-radius: 50%;
            width: .21rem;
            height: .21rem;
          }
      }
      .navigation-add-list{
        position: absolute;
        top: .42rem;
        z-index: 100;
        background-color: #eee;
        right: .01rem;
        padding: .1rem;
        border-radius: .03rem;
      }
  }
  .scroller-wrapper{
    height: 100%;
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
      padding:5px;
      position: relative;
      display: flex;
      .msgCount{
          position: absolute;
          left:40px;
          top:0;
      }
  }
  .group-body{
      line-height: 28px;
  }
  .group-ava{
      width:60px;
      height:60px;
  }
  .group-ava img{
      width:50px;
      border-radius: 2px;
  }
  .group-cell .modTime{
    position:absolute;
    right:15px;
    top:5px;
    color: #898181;
    font-size: 12px;
  }
  .msg-lastMsg{
    color: #898181;
    font-size: 12px;
    height:18px;
    line-height: 18px;
    width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>