<!--消息页面-->
<template>
    <div class="group-info page">
         <div class="page-navigation flex">
            <div class="goback" @click="goBack()">
                <i class="iconfont icon-back1"></i>
            </div>
            <div class="body">
                聊天信息<span v-if="group.groupType == 'G'">({{group.msgCount}})</span>
            </div>
         </div>                             
         <div class="page-body-hasNav" ref="scrollerWrapper">
             <div class="scroller-body">
             <!-- <div class="weui-cells"></div> -->
             <group>
                <cell title="群聊名称" is-link link="/themesetting" :value="group.groupName" />
                <cell title="群二维码" is-link ><span slot="value"></span></cell>
                <cell title="群公号" is-link />
            </group>
            <group>
                <cell title="群成员" is-link />
                <div class="weui-cell">这个部分要放图片</div>
                <div class="add-member">
                    <div class="members">
                        <div class="members-top">
                            <span>群成员</span>
                            <span class="members-top-num">{{allMembers.length}}人</span>
                        </div>
                        <div class="members-bottom">
                            <span v-for="member of allMembers" :key="member.userId">
                                <img 
                                    :src="member.photo || getDefaultPhoto()" 
                                    @error="getDefaultPhoto(member)"/>
                            </span>
                        </div>
                    </div>
                    <div class="add-btn" @click="showMemberSelector">
                        <span class="add-icon">+</span>
                        <span class="add-text">添加成员</span>
                    </div>
                </div>

            </group>
            <div class="weui-cells">
                <div class="weui-cell weui-cell_access">
                    <div class="vux-cell-primary">
                        查找群聊天记录
                    </div>
                    <div class="weui-cell__ft">
                        更多
                    </div>
                </div> 
                <div class="weui-cell">这里要放图标</div>
            </div>
            <group>
                <cell title="群聊天机器人" is-link value="未添加"/>    
            </group>
            <group>
                <cell title="消息免打扰"><inline-x-switch slot="value"/></cell>
                <cell title="置顶聊天"><inline-x-switch value="true" slot="value"/></cell>
                <cell title="保存到通讯录"><inline-x-switch value="true" slot="value"/></cell>
            </group>
            <group>
                <cell title="邀请群成员语音通话" is-link/>    
                <cell title="给群成员发邮件" is-link/>    
            </group>
             </div><!-- scroller-body-->
         </div>
         <member-selector 
            ref="memberSelector" 
            :selectedMembers="allMembers">
         </member-selector>
    </div>
</template>
<script>
import { Group, Cell,InlineXSwitch} from 'vux'
import MemberSelector from './memberSelector';
import { getMembers } from '@/service/msgService'
export default {
    props:['group'],
    components: {
        Cell,
        Group,
        InlineXSwitch,
        MemberSelector
    },
    data(){
        return {
            allMembers: []
        }
    },
    methods:{
        goBack(){
            this.$router.replace('/msg/group');
        },
        showMemberSelector() {
            this.$refs["memberSelector"].showMemberSelector = true;
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
                })
            }
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
        this.getAllMembers()
    }
}
</script>
<style lang="less" scoped>
  .scroller-body{
      position: relative;
      .add-member{
          padding: 10px 15px 10px 0px;
          margin-left: 15px;
          border-top: 1px solid #eee;
          .members{
              margin-bottom: 5px;
              .members-top{
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 5px;
                  &-num{
                      color: #C8C8CD;
                      margin-right: 15px;
                  }
              }
              .members-bottom{
                  img{
                    width: 35px;
                    height: 35px;
                    border-radius: 5px;
                    padding: .02rem;
                  }
              }
              .members-top:after{
                  content: " ";
                display: inline-block;
                height: 6px;
                width: 6px;
                border-width: 2px 2px 0 0;
                border-color: #C8C8CD;
                border-style: solid;
                -webkit-transform: matrix(0.71, 0.71, -0.71, 0.71, 0, 0);
                -ms-transform: matrix(0.71, 0.71, -0.71, 0.71, 0, 0);
                transform: matrix(0.71, 0.71, -0.71, 0.71, 0, 0);
                position: absolute;
                top: 47%;
                right: 15px;
              }
          }
          .members:hover{
              background-color: #eee;
          }
          .add-btn{
            display: flex;
            align-items: center;
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
      }
  }
</style>