<template>
  <div class="person-info-container">
    <img class="user_img" :src="avatar">
    <div class="user_part">
      <div class="user_name_part">
        <span class="user_name" v-if="userInfo.nickname">{{userInfo.nickname}}</span>
        <span class="user_level" v-if="userInfo.position">{{userInfo.position}}</span>
      </div>
      <div class="user_info_part">
        <span class="user_bank" v-if="userInfo.homeBank">{{userInfo.homeBank}}</span>
        <span class="user_dp" v-if="userInfo.groupName">{{userInfo.groupName}}</span>
      </div>
    </div>
  </div>
</template>

<script>
  import tokenService from 'service/tokenService'

  export default {
    name: "PersonInfo",
    props: {},
    data() {
      return {
        avatar: '',
        userInfo: {}
      }
    },
    methods: {
      // TODO 获取当前用户信息
      getUser() {
        return tokenService.getUser().then(data => {
          this.userInfo = data;
        })
      },
    },
    created() {
      let {avatar = ''} = JSON.parse(sessionStorage.getItem('ROSE_LOGIN_TOKEN') || '{}');
      this.getUser();
    }
  }
</script>

<style scoped lang="scss">
  .person-info-container {
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
</style>