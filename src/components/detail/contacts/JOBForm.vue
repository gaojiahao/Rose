<template>
  <div class='pages'>
    <div class="job-container">
      <!-- 职位信息 -->
      <div class="job-info">
        <form-cell cellTitle="职位名称" :cellContent="jobInfo.name" :showTopBorder="false"></form-cell>
        <form-cell cellTitle="职能类型" :cellContent="jobInfo.functionType"></form-cell>
        <form-cell cellTitle="职能" :cellContent="jobInfo.function"></form-cell>
        <form-cell cellTitle="职级通道" :cellContent="jobInfo.rankPass"></form-cell>
        <form-cell cellTitle="职级" :cellContent="jobInfo.rankName"></form-cell>
        <form-cell cellTitle="小时成本" :cellContent="jobInfo.hourCost"></form-cell>
        <form-cell cellTitle="职责描述" :cellContent="jobInfo.describe"></form-cell>
      </div>
      <!-- 基本信息 -->
      <div class="basis-info">
        <form-cell cellTitle="创建者" :cellContent="jobInfo.creator" :showTopBorder="false"></form-cell>
        <form-cell cellTitle="创建时间" :cellContent="jobInfo.crtTime"></form-cell>
        <form-cell cellTitle="修改者" :cellContent="jobInfo.modifier"></form-cell>
        <form-cell cellTitle="修改时间" :cellContent="jobInfo.modTime"></form-cell>
      </div>
      <!-- 编辑 -->
      <div class="edit-btn" @click.stop="goEdit" v-if="action.update">编辑</div>
    </div>
  </div>
</template>
<script>
// 请求 引入
import { getJobList } from 'service/Directorys/jobService'
import { getAppDetail } from 'service/app-basic/appSettingService'
// 组件 引入
import FormCell from 'components/detail/commonPart/form-part/FormCell'
export default {
  components: { FormCell },
  data() {
    return {
      jobId:'',
      action: {},
      jobInfo : {},
    }
  },
  methods: {
    //职位信息
    findData() {
      return getJobList({
        filter: JSON.stringify([{operator:"eq",value:this.jobId,property:"id"}])
      }).then(({tableContent = []}) => {
        tableContent.forEach(item => {
          switch (item.type) {
            case 'Y':
              item.type = '营销类';
              break;
            case 'Z':
              item.type = '专业类';
              break;
            case 'J':
              item.type = '技术类';
              break;
            case 'C':
              item.type = '操作类';
              break;
            case 'M':
              item.type = '管理类';
              break;
              
          }
          switch (item.status) {
            case 1:
              item.status = '使用中';
              break;
            case 2:
              item.status = '未使用';
              break;
            case 3:
              item.status = '草稿';
              break;
            case -1:
              item.status = '停用';
              break;
          }
        })
        this.jobInfo = tableContent[0];
        this.$loading.hide();
      }).catch(e=> {
        this.$loading.hide();
        this.$vux.alert.show({
          content:e.message
        })
      });
    },
    // 获取应用详情
    getAppDetail() {
      let {listId = ''} = this.$route.query;
      return getAppDetail(listId).then(([data = {}]) => {
        let {action} = data;
        this.action = action;
      })
    },
    // 编辑
    goEdit(){
      let { name,folder, fileName } = this.$route.query;
      this.$router.push({
        path: `/fillForm/${folder}/${fileName}`,
        query: { name, id: this.jobId,folder, fileName }
      })
    },
  },
  created() {
    this.$loading.show();
    (async () => {
      let {id = ''} = this.$route.query;
      this.jobId = id;
      await this.getAppDetail();
      this.findData();
    })()
  }
}
</script>
<style lang="scss" scoped>
@import '~scss/biz-app/bizDetail';
.job-container {
  width: 100%;
  box-sizing: border-box;
  .job-info {
    padding: 0 .1rem;
    background: #FFF;
  }
  .basis-info {
    @extend .job-info;
    margin-top: .1rem;
  }
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
</style>


