<template>
    <div class="user-detail page">
          <div class="user-header">
            <span @click="goBack">
              <i class="iconfont icon-back1"></i>
              <span>返回</span>
            </span>
          </div>
          <div class="page-body-hasNav">
              <div class="user-info">
                  <div class="user-info-left">
                      <img :src="getDefaultPhoto()" @error="imgErr" />
                  </div>
                  <div class="user-info-right">
                      <p>{{userItem.nickname || '未知'}}</p>
                      <span>{{userItem.roleName || '未知'}}</span>
                  </div>
              </div>
              <div class="user-detail">
                  <div class="user-detail-item">
                      <div class="user-detail-item-label ">手机</div>
                      <div class="user-detail-item-value mobile">{{userItem.mobile || '未知'}}</div>
                  </div>
                  <div  class="user-detail-item">
                      <div class="user-detail-item-label ">邮箱</div>
                      <div  class="user-detail-item-value email">{{userItem.email || '未知'}}</div>
                  </div>
                  <div  class="user-detail-item">
                      <div class="user-detail-item-label">部门</div>
                      <div  class="user-detail-item-value">{{userItem.groupName || '未知'}}</div>
                  </div>
              </div>
              <div class="user-btn" @click="sentMemberMessage">
                  <x-button :gradients="['#39f', '#39f']">发消息</x-button>
              </div>
          </div>
    </div> 
</template>  
<script>
import {XButton } from 'vux'
import { getGroupByUserId,getUserInfoById } from '@/service/msgService'
import Bus from '@/common/eventBus.js';
export default{  
    name: "UserDetail",
    components: {
        XButton
    },
    data() {
        return {
            userItem: {}
        }
    },
    created(){
      this.getUserDetails();
    },
    methods: {
        getDefaultPhoto() {
            let url = require("assets/ava01.png");
            if (this.userItem.photo) {
                url = this.userItem.photo
            }
            return url;
        },
        imgErr() {
          let url = require("assets/ava01.png");
          this.userItem.photo = url;
        },
        goBack() {
          this.$router.go(-1);
        },
        sentMemberMessage() {
          if(this.userItem.userId){
            getGroupByUserId(this.userItem.userId).then(res => {
                Bus.$emit('toMsg',res)
            })
          }
        },
        getUserDetails() {
          var uId = this.$route.params.uId;
          if(uId) {
            getUserInfoById(uId).then(res => {
              this.userItem = res.tableContent[0];
            })
          }
        }
    },
    beforeRouteEnter:function(to,form,next){
        next((vm)=>{
           vm.getApp().hasTab = false;
        })
    },
    beforeRouteLeave:function(to,from,next){
        this.getApp().hasTab = true;
        next();
    }
}  
</script>  
<style lang="less" scoped>
  .user-detail{
    
    .user-info{
      display: flex;
      padding: .1rem;
      background-color: #fff;
      margin-top: .1rem;
      &-left{
        img{
          width: .7rem;
          height: .7rem;
        }
      }
      &-right{
        margin-left: .1rem;
        p{
          font-size: .16rem;
        }
        span{
          color: #999;
          font-size: .14rem;
        }
      }
    }
    .user-detail{
      background-color: #fff;
      margin-top: .1rem;
      p{
        padding: .1rem;
        position: relative;
      }
      &-item::before{
        content: " ";
        position: absolute;
        left: 65px;
        top: 0;
        right: 0;
        height: 1px;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        color: rgba(0, 0, 0, 0.1);
        -webkit-transform-origin: 0 0;
        -ms-transform-origin: 0 0;
        transform-origin: 0 0;
        -webkit-transform: scaleY(0.5);
        -ms-transform: scaleY(0.5);
        transform: scaleY(0.5);
      }
      &-item{
        display: flex;
        position: relative;
        padding: .1rem .15rem;
        &-label{
          flex: 1;
        }
        &-value{
          flex: 6;

          .mobile .email{
            color: #1063b7;
          }
        }
      }
    }
    .user-btn{
      padding: 0rem .1rem;
      margin-top: .3rem;
    }
    .user-header{
      padding: .1rem;
      background: #39f;
      color: #fff;
    }
  }
</style>