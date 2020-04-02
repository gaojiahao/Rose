<!--消息页面-->
<template>
    <div>
        <div class = 'group-cells'>
           <div class="group-cell" v-for="group in groups" :key = "group.id" @click="toMsg(group)">
               <div class="group-ava">
                   <img :src="group.img">
               </div>
               <div class="group-body">
                <h4>
                    {{group.groupName}}
                </h4>
                <div class="msg-lastMsg">
                    {{group.lastMsg}}
                </div> 
               </div>
               <div class="modTime">
                  {{group.modTime | timeChange}}
               </div> 
           </div>
        </div>
        <router-view></router-view>
    </div>
</template>
<script>
import {getGroupMsg,getMyGroups} from 'service/msgService'
import util from '@/common/util';
export default {
    created:function(){
        this.initGroup();
    },
    data(){
        return {
           groups:[{
                groupType: "G",
                groupName: "hehehe",
                modTime: 1585656282000,
                groupId: "123456",
                focus: false,
                msgCount: 0,
                lastMsg:'好的',
                img:require('assets/ava01.png'),
           },{
                groupType: "P",
                groupName: "黄孝辉",
                modTime: 1585656534000,
                groupId: "4fb52de88f72694edbf64c2438a5f024",
                focus: false,
                msgCount: 0,
                lastMsg:'http://192.168.100.85/roleplay/eletas……',
                img:require('assets/ava02.png')
           }]
        }
    },
    methods:{
        initGroup:function(){
            getMyGroups().then(data=>{
                console.log(data);
            })
        },
        toMsg:function(group){
            this.$router.push('/msg/group/'+group.groupId)
        }
    },
    filters:{
       timeChange:function(time){
           var diffTime = (new Date().getTime() - time)/1000,
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
      width:60px;height:60px;margin-right: 16px;
  }
  .group-ava img{
      width:100%;
  }
  .group-cell .modTime{
      position:absolute;
      right:15px;
      top:5px;
  }
</style>