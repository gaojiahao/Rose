<template>
  <div class="project_ct_info" v-if="projectInfo.project">
    <div class="info_title vux-1px-b"><span class="iconfont icon-xiangmu"></span>项目信息</div>
    <div class="info_content">
      <div class="each_info">
        <span class="title">项目名称: </span>
        <span class="content">{{projectInfo.project || '无'}}</span>
      </div>
      <div class="each_info">
        <span class="title">项目类型: </span>
        <span class="content">{{projectInfo.projectType_project || '无'}}</span>
      </div> 
    </div>
  </div> 
</template>

<script>
export default {
  name : 'Project',
  props:{
    projectInfo : {
      type : Object,
      default() {
        return {}
      }
    }
  },
  data(){
    return{

    }
  },

}
</script>

<style lang="scss" scoped>
.vux-1px-b:after {
  border-color: #e8e8e8;
}
// 项目信息
.project_ct_info {
  width: 100%;
  padding: 0 .1rem;
  background: #FFF;
  margin-bottom: .1rem;
  box-sizing: border-box;
  .info_title {
    padding: .06rem 0;
    font-size: .16rem;
    font-weight: bold;
    .iconfont {
      font-weight: normal;
      margin-right: .03rem;
    }
  }
  .info_content {
    padding: .06rem 0;
    .each_info {
      margin: .04rem 0;
      font-size: .14rem;
      .title {
        font-weight: bold;
      }
      .content {
        
      }
    }
  }
}

</style>
