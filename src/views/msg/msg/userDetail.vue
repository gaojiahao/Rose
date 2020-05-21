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
                  <p>
                      <span class="label">手机</span>
                      <span>{{userItem.mobile || '未知'}}</span>
                  </p>
                  <p>
                      <span class="label">邮箱</span>
                      <span>{{userItem.email || '未知'}}</span>
                  </p>
                  <p>
                      <span class="label">部门</span>
                      <span>{{userItem.groupName || '未知'}}</span>
                  </p>
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
          var uId = this.$route.query.uId;
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
          font-size: .2rem;
        }
        span{
          color: #999;
        }
      }
    }
    .user-detail{
      background-color: #fff;
      margin-top: .1rem;
      p{
        padding: .1rem;
      }
    }
    .user-btn{
        margin-top: .3rem;
    }
    .user-header{
      padding: .1rem;
      background: #39f;
      color: #fff;
      font-weight: bold;
    }
  }
</style>