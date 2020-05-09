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
                      <img :src="getDefaultPhoto()" @error="imgErr" />
                  </div>
                  <div class="user-info-right">
                      <p>{{userItem.nickname || '未知'}}</p>
                      <span>{{userItem.role || '未知'}}</span>
                  </div>
              </div>
              <div class="user-detail">
                  <p>
                      <span class="label">手机：</span>
                      <span>{{userItem.mobile || '未知'}}</span>
                  </p>
                  <p>
                      <span class="label">邮箱：</span>
                      <span>{{userItem.email || '未知'}}</span>
                  </p>
                  <p>
                      <span class="label">部门：</span>
                      <span>{{userItem.group || '未知'}}</span>
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
import { getGroupByUserId,getUserInfoById } from '@/service/msgService'
import Bus from '@/common/eventBus.js';
export default{  
    name: "UserDetail",
    components: {
        Popup,
        XButton
    },
    props: {
      userId: {
        type: String || Number,
        default:function(){
            return ""
        }
      }
    },
    data() {
        return {
            showUserDetail: false,
            userItem: {}
        }
    },
    watch: {
      showUserDetail(value) {
        if(value) this.getUserDetails();
      }
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
          this.showUserDetail = false
        },
        sentMemberMessage() {
          if(this.userItem.userId){
            getGroupByUserId(this.userItem.userId).then(res => {
                Bus.$emit('toMsg',res)
            })
          }
        },
        getUserDetails() {
          if(this.userId) {
            getUserInfoById(this.userId).then(res => {
              this.userItem = res.tableContent[0];
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