<template>
    <div class="user-detail" v-transfer-dom>
       <popup 
          v-model="showUserDetail" 
          position="right" 
          :show-mask="false"
          width="100%">
          <div>
              <div class="user-header">
                <span @click="goBack">
                  <i class="iconfont icon-back1"></i>
                  <span>返回</span>
                </span>
              </div>
              <div class="user-info">
                  <div class="user-info-left">
                      <img :src="getDefaultPhoto()" />
                  </div>
                  <div class="user-info-right">
                      <p>{{userItem.nickname}}</p>
                      <span>{{userItem.role}}</span>
                  </div>
              </div>
              <div class="user-detail">
                  <p>
                      <span class="label">手机：</span>
                      <span>{{userItem.mobile}}</span>
                  </p>
                  <p>
                      <span class="label">邮箱：</span>
                      <span>{{userItem.email}}</span>
                  </p>
                  <p>
                      <span class="label">部门：</span>
                      <span>{{userItem.group}}</span>
                  </p>
              </div>
              <div class="user-btn" @click="sentMemberMessage">
                  <x-button :gradients="['#39f', '#39f']">发消息</x-button>
              </div>
          </div>
        </popup>
    </div> 
</template>  
<script>
import { Popup,XButton } from 'vux'
import { getGroupByUserId } from '@/service/msgService'
import Bus from '@/common/eventBus.js';
export default{  
    name: "UserDetail",
    components: {
        Popup,
        XButton
    },
    props: {
      userItem: {
        type: Object,
        default:function(){
            return {}
        }
      }
    },
    data() {
        return {
            showUserDetail: false
        }
    },
    watch: {
      
    },
    methods: {
        getDefaultPhoto() {
            let url = require("assets/ava01.png");
            if (this.userItem) {
                this.userItem.photo = url;
            }
            return url;
        },
        goBack() {
          this.showUserDetail = false
        },
        sentMemberMessage() {
          if(this.userItem.userId){
            getGroupByUserId(this.userItem.userId).then(res => {
                Bus.$emit('toMsg',res)
            })
          }
        }
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
          border: 1px solid #ddd;
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