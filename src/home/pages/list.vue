<template>
  <!-- <transition 
    enter-active-class="fadeInRight"
		leave-to-class="fadeOutRight"> -->
    <transition 
    name="fade">
    <div class="pages">
        <div class="m_top">
            <img class="user_img" :src="userinfo.avatar" alt="aspect">
            <div class="user_part">
                <div class="user_name_part">
                    <span class="user_name" >{{userinfo.name}}</span>
                    <span class="user_level" >{{userinfo.position}}</span>
                </div>
                <div class="user_info_part">
                    <span class="user_bank">{{userinfo.department}}</span>
                    <!-- <span class="user_dp" v-if="userDept!=''">{{userDept}}</span> -->
                </div>
            </div>
        </div>
        <tab bar-active-color="#5077AA" active-color="#5077AA" :line-width=1 >
            <tab-item  @on-item-click="onItemClick" selected>待处理</tab-item>
            <tab-item  @on-item-click="onItemClick">进行中</tab-item>
            <tab-item  @on-item-click="onItemClick">已完成</tab-item>
        </tab>
        <div class="m_list">
            <!-- 待处理 -->          
            <div  class="wrapper mescroll"  id='mescroll'>
              <div id='dataList'>
                  <div class="each_list" v-for="(val,idx) in showTaskList" :key="idx" @click="goDetail(val)">
                    <div class="e_top">
                        <span class="e_status " :class="taskClass">{{taskStatus}}</span><span class="e_name">{{val.processName}}</span>
                    </div>
                    <div class="e_main">
                        <span class="e_code">
                            {{val.businessKey || val.transId}}
                            <span class="e_crtname">{{val.crtName || val.creatorName}}</span>
                        </span>
                        <span class="e_time">{{val.crtTime}}</span>
                    </div>
                </div>   
              </div>
                
            </div>   
    
        </div>
        <div class='m_btn'>
          <p @click="createdTask()">新增</p>
        </div>
    </div>
  </transition>
</template>

<script>
import { Tab, TabItem, LoadMore , AlertModule } from "vux";
import Bscroll from "better-scroll";
import getTaskService from '../service/getTaskService.js'
import businessMap from './maps/business'
export default {
  data() {
    return {
      userinfo:{},      //用户信息
      DoList : [],
      DoingList : [],
      DoneList : [],
      showTaskList : [],
      page : 1,
      listId : '',
      taskStatus : '待处理',
      taskClass : 'wait_c',
      todoScroll : null,
      transcode : '',
    };
  },
   components: {
    Tab,
    TabItem,
    LoadMore,
  },
  methods: {
    onItemClick(i) {
      if (i == 0) {
        this.taskClass = 'wait_c';
        this.taskStatus = '待处理';
        this.todoScroll.resetUpScroll();
        
      }
      else if (i == 1) {
        this.taskClass = 'ing_c',
        this.taskStatus = '进行中';
        this.todoScroll.resetUpScroll();
       
      }
      else if (i == 2) {
        this.taskClass = 'done_c';
        this.taskStatus = '已完成';
        this.todoScroll.resetUpScroll();
        
      }

      }, 
      goDetail(val){
        this.$router.push({
          path:'/detail',
          query:{
            transCode : val.businessKey || val.transId
          }
        })
        
      },
      getDo(){
        return new Promise((resolve,reject)=>{
          if(this.page === 1){
            this.showTaskList = []
          }
          getTaskService.getDoList(this.listId,this.page).then( data=>{
            this.showTaskList = this.page === 1 ? data.tableContent : this.showTaskList.concat(data.tableContent);
            resolve (data.tableContent)
          }).catch(e => {
            AlertModule.show({
              content:e.message
            })
          });
        })
      },
      getDoing(){
        return new Promise((resolve,reject)=>{
          if(this.page === 1){
            this.showTaskList = []
          }
          getTaskService.getList(this.listId,this.page,2).then( data=>{
            this.showTaskList = this.page === 1 ? data.tableContent : this.showTaskList.concat(data.tableContent);
            resolve (data.tableContent);
          }).catch(e => {
            AlertModule.show({
              content:e.message
            })
          });
        })
      },
      getDone(){
        return new Promise((resolve,reject)=>{
          if(this.page === 1){
            this.showTaskList = []
          }
          getTaskService.getList(this.listId,this.page,1).then( data=>{
            this.showTaskList = this.page === 1 ? data.tableContent : this.showTaskList.concat(data.tableContent);
            resolve (data.tableContent);
          }).catch(e => {
            AlertModule.show({
              content:e.message
            })
          });
        })
      },
      createdTask(){
        this.$router.push({
          path:'/create',
          query:{
            transCode : this.transcode,
            list : this.listId
          }
        })
      },    
  },
  created() {
    let query = this.$route.query;
    if(query){
      this.listId = query.listId;
      this.transcode = businessMap[query.title];
    }
    let info = localStorage.getItem('ROSE_LOGIN_TOKEN');
    info = JSON.parse(info);
    this.userinfo = {
      name: info.name,
      avatar: info.avatar,
      department: info.department,
      position : info.position
    }
  },
  mounted() {
    let Mescroll = this.Mescroll;
      this.$nextTick(() => {
          this.todoScroll = new Mescroll("mescroll", {
            up: {
              use: true,
              isBounce: false,
              auto: true,
              isBoth: false,
              empty:{
                tip: "暂无相关数据~", 
                warpId  : 'dataList'
              },
              callback: (page,mescroll)=>{
                this.page = page.num;
                if(this.taskStatus === '待处理'){
                  this.getDo().then(data => {
                    console.log()
                    let len = data.length;
                    let hasNext = len >= page.size;
                    mescroll.endSuccess(len, hasNext)
                  })

                }
                else if(this.taskStatus === '进行中'){
                  this.getDoing().then(data => {
                    let len = data.length;
                    let hasNext = len >= page.size;
                    mescroll.endSuccess(len, hasNext)
                  })
                }
                else if(this.taskStatus === '已完成'){
                  this.getDone().then(data => {
                    let len = data.length;
                    let hasNext = len >= page.size;
                    mescroll.endSuccess(len, hasNext)
                  })

                }

              }
            },
            down: {
              use: false,
              isBoth: false,
              auto: false,
            }
          })
      })
   
  }
 
};
</script>

<style lang='scss' scoped>
.fade-enter-active{
  transition: opacity .5s;
}
// .fade-enter-active, .fade-leave-active {
//   transition: opacity .5s;
// }
// .fade-leave-active {
//   position:absolute;
//   left:0;
//   top:0;
//   z-index:100;
// }
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
// .fade-enter-active {
//   animation: fadeInRight 0.5s  ;
//   -webkit-animation : fadeInRight 0.5s ;
// }
// .fade-leave-active {
//   animation:fadeOutRight 0.5s ;
//   -webkit-animation:fadeOutRight 0.5s ;  
// }
@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translate3d(100%, 0, 0);
  }

  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes fadeOutRight {
  from {
    opacity: 1;
    position:absolute;
    left:0;
    top:0;
    z-index:100;
  }

  to {
    position:absolute;
    left:0;
    top:0;
    z-index:100;
    opacity: 0;
    transform: translate3d(100%, 0, 0);
  }
}
.m_top {
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  background: #5077aa;
  .user_img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin-right: 10px;
    margin-left: 20px;
  }
  .user_name {
    color: #fff;
    font-weight: bold;
  }
  .user_level {
    font-size: 10px;
    background: #fff;
    color: #333;
    border-radius: 24px;
    padding: 0 6px;
    display: inline-block;
    vertical-align: middle;
    margin-top: -4px;
  }
  .user_bank,
  .user_dp {
    font-size: 12px;
    background: rgba(17, 17, 17, 0.5);
    color: #fff;
    border-radius: 24px;
    padding: 1px 6px;
  }
}
.m_list {
  width:100%;
  position:absolute;
  top:144px;
  left:0;
  bottom:50px;
  .wrapper{
    width: 100%;
  }
  .each_list {
    width: 90%;
    padding: 4px 10px;
    margin: 20px auto;
    box-sizing: border-box;
    box-shadow: 0 2px 10px #e8e8e8;
    border-radius: 4px;
    .e_top {
      .e_status {
        //审批状态
        color: #fff;
        padding: 0 2px;
        border-radius: 4px;
        font-size: 12px;
        display: inline-block;
        vertical-align: middle;
        margin-top: -2px;
      }
      .e_name {
        //审批名字
        margin-left: 4px;
        font-weight: bold;
      }
      .wait_c {
        background: #e34e43;
      }
      .ing_c {
        background: #5077aa;
      }
      .done_c {
        background: #26ab28;
      }
    }
    .e_main {
      height: 24px;
      line-height: 24px;
      .e_code {
        float: left;
        font-size: 14px;
        color: #7d7d7d;
        .e_crtname {
          position: relative;
          background: #333;
          font-size: 12px;
          color: #fdf6a4;
          padding: 2px;
        }
        .e_crtname:before {
          position: absolute;
          content: "";
          width: 0;
          height: 0;
          top: 0;
          left: -3px;
          border-right: 4px solid #333;
          border-bottom: 4px solid transparent;
        }
      }
      .e_time {
        width:30%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        float: right;
        font-size: 14px;
        color: #7d7d7d;
        font-weight: 200;
      }
    }
  }
}
.spinner_container {
  margin-top: 50vw;
}
.m_btn{
  position: fixed;
  left:0;
  bottom:0;
  height:46px;
  width:100%;
  p{
    line-height: 46px;
    text-align: center;
    background: #5077aa;
    color:#fff;
    font-size:16px;
  }
}
</style>
