<template>
  <div class="detail_wrapper user-detail-container">
    <div class="basicPart" ref="detail">
      <div class="user-info-container">
        <div class="user-info">
          <img class="avatar" :src="userData.photo" alt="头像" @error="getDefaultImg">
          <span class="user-name">{{userData.nickname}}</span>
          <div class="user-status-part">
            <span class="user-status" :class="userData.statusClass">{{userData.status}}</span>
            <span class="user-type" :class="userData.typeClass">{{userData.userType}}</span>
          </div>
        </div>
      </div>
      <div class="user-info-part">
        <div class="user-info-list">
          <form-cell cellTitle="公司" :cellContent="userData.entityName" :showTopBorder="false"></form-cell>
          <form-cell cellTitle="工号" :cellContent="userData.userCode"></form-cell>
          <form-cell cellTitle="手机" :cellContent="userData.mobile"></form-cell>
          <form-cell cellTitle="座机" :cellContent="userData.officePhone"></form-cell>
          <form-cell cellTitle="邮箱" :cellContent="userData.email"></form-cell>
        </div>
        <div class="user-info-list">
          <form-cell cellTitle="创建者" :cellContent="userData.creatorName" :showTopBorder="false"></form-cell>
          <form-cell cellTitle="创建时间" :cellContent="userData.crtTime"></form-cell>
          <form-cell cellTitle="修改者" :cellContent="userData.modifierName"></form-cell>
          <form-cell cellTitle="修改时间" :cellContent="userData.modTime"></form-cell>
        </div>
      </div>
      <div class="edit-btn" @click.stop="goEdit" v-if="action.update">编辑</div>
    </div>
  </div>

</template>

<script>
// 请求 引入
import {getUserDetail} from 'service/Directorys/userService'
import {getAppDetail} from 'service/app-basic/appSettingService'
import FormCell from 'components/detail/commonPart/form-part/FormCell'

export default {
  name: "USERForm",
  components: {
    FormCell,
  },
  data() {
    return {
      colId: '',
      userData: {},
      action: {}, // 表单允许的操作
    }
  },
  methods: {
    // 获取默认图片
    getDefaultImg(gender) {
      this.userData.photo = gender === '男'
        ? require('assets/ava01.png')
        : require('assets/ava02.png')
    },
    // 获取详情
    loadPage(transCode = '') {
      this.$loading.show();
      return getUserDetail(this.colId).then(({tableContent = []}) => {
        let [data = {}] = tableContent;
        let genders = ['女', '男'],
            userTypes = ['临时账户', '长期有效'],
            typeClass = ['shortTerm', 'longTerm'],
            status = ['', '使用中', '未使用', '草稿'],
            statusClass = ['', 'inUse', 'unUse'];
        // 性别、状态等
        data.gender = genders[data.gender] || '未知';
        data.statusClass = statusClass[data.status];
        data.status = status[data.status] || '停用';
        data.typeClass = typeClass[data.userType];
        data.userType = userTypes[data.userType];
        this.userData = data;
        if (!data.photo) {
          this.getDefaultImg(data.gender);
        }
        this.$loading.hide();
      })
    },
    // 编辑
    goEdit(){
      let { name } = this.$route.query,
          { folder, fileName } = this.$route.params;
      this.$router.push({
        path: `/fillForm/${folder}/${fileName}`,
        query: { name, colId: this.colId }
      })
    },
    // 获取应用详情
    getAppDetail() {
      let {listId = ''} = this.$route.query;
      return getAppDetail(listId).then(([data = {}]) => {
        let {action} = data;
        this.action = action;
      })
    },
  },
  created() {
    (async () => {
      let {colId = ''} = this.$route.query;
      this.colId = colId;
      await this.getAppDetail();
      this.loadPage();
    })()
  }
}
</script>

<style scoped lang="scss">
@import '~scss/biz-app/bizDetail';
.user-detail-container {
  .user-info-container {
    display: flex;
    height: 1.6rem;
    line-height: .24rem;
    background: #FFF;
    text-align: center;
    align-items: center;
    justify-content: center;
    .user-info {
      display: flex;
      align-items: center;
      flex-direction: column;
      .avatar {
        width: .8rem;
        height: .8rem;
        margin: .1rem 0;
        border-radius: 50%;
      }
      .user-name {
        font-size: .18rem;
        font-weight: bold;
      }
      .user-status-part {
        font-size: 0;
        .user-status,
        .user-type {
          font-size: .12rem;
          font-weight: bold;
          border-radius: .1rem;
          padding: .01rem .04rem;
        }
        .user-status {
          color: #FFF;
          background: #474a56;
          margin: 0 .08rem;
          &.inUse {
            background: #53d397;
          }
          &.unUse {
            background: #c7b198;
          }
        }
        .user-type {
          &.shortTerm {
            color: #FFF;
            background: #5c636e;
          }
          &.longTerm {
            color: #333;
            background: #b1cbfa;
          }
        }
      }
    }
  }
  .user-info-list {
    width: 100%;
    padding: 0 .1rem;
    margin-top: .1rem;
    background: #FFF;
    box-sizing: border-box;
  }
  .edit-btn {
    width: 100%;
    height: .4rem;
    color: #4F90F9;
    line-height: .4rem;
    margin-top: .1rem;
    font-size: .16rem;
    font-weight: bold;
    text-align: center;
    background: #FFF;
  }
}
</style>
