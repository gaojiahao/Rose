<!--消息页面-->
<template>
    <div class="group-info page">
         <div class="page-navigation flex">
            <div class="goback" @click="goBack()">
                <i class="iconfont icon-back1"></i>
            </div>
            <div class="body">
                聊天信息<span v-if="group.groupType == 'G'">({{allMembers.length}})</span>
            </div>
         </div>                             
         <div class="page-body-hasNav" ref="scrollerWrapper">
             <div class="scroller-body">
                <!-- <div class="weui-cells"></div> -->
                <group v-if="group.groupType=='G'" class="group-name">
                        <cell 
                            title="群聊名称" 
                            is-link
                            :value="group.groupName"
                            @click.native="showUpdateName" />
                    <!-- <cell title="群二维码" is-link ><span slot="value"></span></cell> -->
                    <!-- <cell title="群公号" is-link /> -->
                </group>
                <group>
                    <div @click="showMemberDetail">
                        <cell title="群成员" v-if="group.groupType=='G'" is-link :value="`共${allMembers.length}人`" />
                        <div class="members" v-if="group.groupType=='G'" >
                            <div class="members-item" v-for="(member,index) of allMembers" :key="index">
                                <img 
                                    v-if="index<6"
                                    :src="member.photo || getDefaultPhoto()" 
                                    @error="getDefaultPhoto(member)"/>
                                <i v-if="index===6" class="iconfont icon-more1"></i>
                            </div>
                        </div>
                        <cell  :title="group.groupName" is-link  v-if="group.groupType=='P'">
                            <img slot="icon" width="45" style="display: block;margin-right: 5px;border-radius: .02rem;" :src="group.groupIcon" >
                        </cell>
                    </div>
                    <cell class="add-btn" @click.native="showMemberSelector" title="添加成员">
                        <span class="add-icon" slot="icon">+</span>
                    </cell>
                </group>
                <div class="weui-cells">
                    <div class="weui-cell weui-cell_access">
                        <div class="vux-cell-primary">
                            查找聊天记录
                        </div>
                        <div class="weui-cell__ft" @click="showHistoryAll = true">
                            更多
                        </div>
                    </div> 
                    <div class="weui-cell">
                        <div class="msg-type-item" @click="showHistoryFile = true">
                            <i class="iconfont icon-wenjian"/>
                            <div>文件</div>
                        </div>
                        <div class="msg-type-item" @click="showHistoryImg = true">
                            <i class="iconfont icon-i-img"/>
                            <div>图片</div>
                        </div>
                    </div>
                </div>
                <!-- <group>
                    <cell title="群聊天机器人" is-link value="未添加"/>    
                </group> -->
                <group>
                    <!-- <cell title="消息免打扰"><inline-x-switch slot="value"/></cell> -->
                    <cell title="置顶聊天">
                        <inline-x-switch 
                            v-model="group.focus" 
                            @on-change="onFocusChange" />
                    </cell>
                    <!-- <cell title="保存到通讯录"><inline-x-switch value="true" slot="value"/></cell> -->
                </group>
                <!-- <group>
                    <cell title="邀请群成员语音通话" is-link/>    
                    <cell title="给群成员发邮件" is-link/>    
                </group> -->
             </div><!-- scroller-body-->
         </div>
         <!-- 成员选择器 -->
         <member-selector 
            ref="memberSelector" 
            :selectedMembers="allMembers"
            :confirmCallback="addMember">
         </member-selector>
         <!-- 群成员列表 -->
         <member-list 
            ref="memberList"
            :selectedMembers="allMembers"
            :group="group"
            :currentUser="currentUser"
            @deleteMember="deleteMember"
            @addMembers="showMemberSelector">
         </member-list>
         <!-- 修改群名称 -->
         <update-group-name 
            ref="updateGroupName"
            :group="group">
         </update-group-name>
         <history-all v-if="showHistoryAll">
         </history-all>
         <history-file v-if="showHistoryFile" />
         <history-img v-if="showHistoryImg" />
    </div>
</template>
<script>
import { Group, Cell,InlineXSwitch} from 'vux'
import MemberSelector from './memberSelector';
import MemberList from './memberList';
import HistoryAll from './historyAll';
import HistoryImg from './historyImg';
import HistoryFile from './historyFile';
import WebContext from 'service/commonService'
import { initWebContext } from 'service/commonService'
import { getMembers,addMember,createGroup,setFocus,deleteFocus } from '@/service/msgService'
import Bus from '@/common/eventBus.js';
import UpdateGroupName from './updateGroupName';
export default {
    props:['group'],
    components: {
        Cell,
        Group,
        InlineXSwitch,
        MemberSelector,
        MemberList,
        HistoryAll,
        HistoryImg,
        HistoryFile,
        UpdateGroupName
    },
    data(){
        return {
            allMembers: [],
            currentUser: {},
            showHistoryAll:false,
            showHistoryFile:false,
            showHistoryImg:false
        }
    },
    methods:{
        goBack(){
            this.$router.go(-1);
        },
        showMemberSelector() {
            this.$refs["memberSelector"].showMemberSelector = true;
        },
        showUpdateName() {
            this.$refs["updateGroupName"].showUpdateName = true;
        },
        onFocusChange(currentValue) {
            let requestUrl = setFocus,
                params = {
                    groupId: this.group.groupId
                };
            !currentValue && (requestUrl = deleteFocus);
            requestUrl(params).then(res => {
                if(res.success){
                    this.$vux.toast.show({text: res.message});
                    Bus.$emit('updateGroups');
                }
            })
        },
        showMemberDetail() {
            if(this.group.groupType === "P"){
                this.$refs["memberList"].openUserDetail(this.allMembers[0]);
            }else{
                this.$refs["memberList"].showMemberList = true;
            }
        },
        deleteMember() {
            this.getAllMembers()
        },
        getDefaultPhoto(member) {
            let url = require("assets/ava01.png");
            if (member) {
                member.photo = url;
            }
            return url;
        },
        getAllMembers() {
            if(this.group.groupId){
                getMembers(this.group.groupId).then(res => {
                    this.allMembers = res;
                    if(this.group.groupType === 'P'){
                        for(let i=0;i<this.allMembers.length;i++){
                            if(this.currentUser.userId == this.allMembers[i].userId){
                                this.allMembers.splice(i,1)
                            }
                        }
                    }
                })
            }
        },
        addMember(userList){
            let userIds = [],
                userNames = [],
                params = {},
                requestUrl = addMember;

            userList.forEach(user =>{
                userIds.push(user.userId);
                userNames.push(user.nickname);
            })

            
            params = {
                groupId: this.group.groupId || null,
                users: userIds.join(','),
                name: userNames.join(',')
            };
            if(this.group.groupType === 'G'){
                delete params.name;
            }else{
                requestUrl = createGroup;
                userNames.push(this.currentUser.name);
                userNames.push(this.allMembers[0].nickname);
                userIds.push(this.allMembers[0].userId);
                params.users = userIds.join(',');
                params.name = userNames.join(',');
            }

            requestUrl(params).then(res => {
                res.message && this.$vux.toast.show({text: res.message});
                this.$refs["memberSelector"].showMemberSelector = false;
                if(this.group.groupType === 'G'){
                    this.getAllMembers()
                }else{
                    Bus.$emit('toMsg',res)
                }
            })
        }
    },
    mounted() {
        var scrollWrapper = this.$refs.scrollerWrapper;

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
        this.scrollToButtom && this.scrollToButtom(0);

        this.getApp().$on('resize',()=>{
            this.scroll.refresh();
        })
    },
    created() {
        initWebContext().then(() => {
            this.currentUser = WebContext.WebContext.currentUser
            this.getAllMembers()
        })
    }
}
</script>
<style lang="less" scoped>
  .scroller-body{
      position: relative;
      .members{
          padding:0rem .10rem;
          &-item{
              display: inline-block;
               img{
                    height: .45rem;
                    border-radius: .04rem;
                    margin: .04rem;
                  }
          }
      }
      .group-name{
          /deep/ .weui-cell_access .weui-cell__ft{
                width: 70%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
          }
      }
       .add-btn{
            display: flex;
            align-items: center;
            padding: 0rem .10rem;
            .add-icon {
                color: #39f;
                font-size: 28px;
                margin-right: 5px;
                margin-bottom: 5px;
            }
          }
        .add-btn:hover{
            background-color: #eee;
        }

        .msg-type-item{
            margin-right: .15rem;
            i{
                font-size: .24rem;
                color: #999999;
            }
            div{
                font-size: .14rem;
            }
        }
  }
</style>