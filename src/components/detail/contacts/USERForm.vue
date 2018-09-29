<template>
  <div class="detail_wrapper user-detail-container">
    <div class="basicPart">
      <div class="user-photo-container">
        <img class="avatar" :src="userData.photo" alt="头像" @error="getDefaultImg">
      </div>
      <!-- 任务信息 -->
      <div class="user-info">
        <div class="info-title vux-1px-b">用户信息</div>
        <div class="project_content">
          <form-cell cellTitle="工号" :cellContent="userData.userCode" :showTopBorder="false"></form-cell>
          <form-cell cellTitle="姓名" :cellContent="userData.nickname"></form-cell>
          <form-cell cellTitle="性别" :cellContent="userData.gender"></form-cell>
          <form-cell cellTitle="手机" :cellContent="userData.mobile"></form-cell>
          <form-cell cellTitle="座机" :cellContent="userData.officePhone"></form-cell>
          <form-cell cellTitle="邮箱" :cellContent="userData.email"></form-cell>
          <form-cell cellTitle="类型" :cellContent="userData.userType"></form-cell>
          <form-cell cellTitle="状态" :cellContent="userData.status"></form-cell>
          <form-cell cellTitle="公司" :cellContent="userData.entityName"></form-cell>
          <form-cell cellTitle="创建者" :cellContent="userData.creatorName"></form-cell>
          <form-cell cellTitle="创建时间" :cellContent="userData.crtTime"></form-cell>
          <form-cell cellTitle="修改者" :cellContent="userData.modifierName"></form-cell>
          <form-cell cellTitle="修改时间" :cellContent="userData.modTime"></form-cell>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  // 请求 引入
  import {getUserDetail} from 'service/Directorys/userService'
  import FormCell from 'components/detail/commonPart/FormCell'

  export default {
    name: "USERForm",
    components: {
      FormCell,
    },
    data() {
      return {
        colId: '',
        userData: {},
      }
    },
    methods: {
      // TODO 获取默认图片
      getDefaultImg() {
        this.userData.photo = require('assets/ava01.png')
      },
      // TODO 获取详情
      loadPage(transCode = '') {
        this.$loading.show();
        return getUserDetail(this.colId).then(({tableContent = []}) => {
          let [data = {}] = tableContent;
          let genders = ['女', '男'];
          let status = ['', '使用中', '未使用', '草稿'];
          let userTypes = ['临时账户', '长期有效'];
          data.gender = genders[data.gender] || '未知';
          data.status = status[data.status] || '停用';
          data.userType = userTypes[data.userType];
          this.userData = data;
          if (!data.photo) {
            this.getDefaultImg();
          }
          this.$loading.hide();
        })
      },
    },
    created() {
      let {colId = ''} = this.$route.query;
      this.colId = colId;
      this.loadPage();
    }
  }
</script>

<style scoped lang="scss">
  @import './../../scss/bizDetail';
  .user-detail-container {
    background: #fff;
    .user-photo-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 2rem;
      .avatar {
        width: 1.2rem;
        height: 1.2rem;
      }
    }
    .user-info {
      margin-bottom: .1rem;
      padding: 0 .1rem;
      width: 100%;
      background: #FFF;
      box-sizing: border-box;
    }
    .info-title {
      padding: .06rem 0;
      font-size: .16rem;
      font-weight: bold;
    }
  }
</style>
