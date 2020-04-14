<!--消息页面-->
<template>
    <div>
        <div class = 'group-cells'>
           <div class="group-cell" v-for="group in groups" :key = "group.id" @click="toMsg(group)">
               <div class="group-ava">
                   <img :src="group.groupIcon">
               </div>
               <div class="group-body">
                <h4>
                    {{group.groupName}}
                </h4>
                <div class="msg-lastMsg" v-if="group.lastMsg">
                    <div  v-if="group.lastMsg.imType===1" v-html="group.lastMsg.content"></div>
                    <div  v-if="group.lastMsg.imType===2">文件</div>
                </div> 
               </div>
               <div class="modTime">
                  {{group.modTime | timeChange}}
               </div> 
           </div>
        </div>
        <router-view :group="group" :msgList="msgList" ref="groupMsg"></router-view>
    </div>
</template>
<script>
import {getGroupMsg,getMyGroups} from 'service/msgService'
import commonService from 'service/commonService'
import tokenService from 'service/tokenService'
import util from '@/common/util';
export default {
    created:function(){
        this.initGroup();
        this.initDs();
    },
    data(){
        return {
           groups:[],
           group:null,
           msgList:[]
        }
    },
    methods:{
        initGroup:function(){
            getMyGroups().then(data=>{
                var groupIdToIndex = {};//建立一个映射关系，方便以后使用
                data.forEach((group,index)=>{
                    groupIdToIndex[group.groupId] = index;
                });
                this.groupIdToIndex = groupIdToIndex;
                this.groups = data;
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
                console.log('msg',data);
                this.subscribeMsg(data);
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
        subscribeMsg(msg){
            var type = msg.imType;
            switch(type){
                case '1':
                    this.addTextMsg(msg);
                    break;
                default:
                    break;
            }
        },
        /**
         * 处理文字信息
         */
        addTextMsg(msg){
            var groupId = msg.groupId,
                index,
                vm = this,
                group;

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
                    this.msgList = msgList;
                    this.$router.push('/msg/group')
                });       
            } else {
                this.$router.push('/msg/group')
            }
        },
        
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
<style>
  .group-cell::before{
    content: " ";
    position: absolute;
    left: 92px;
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
      padding:16px;
      position: relative;
      display: flex;
  }
  .group-ava{
      width:60px;
      height:60px;margin-right: 16px;
  }
  .group-ava img{
      width:100%;
      border-radius: 2px;
  }
  .group-cell .modTime{
      position:absolute;
      right:15px;
      top:5px;
  }
</style>