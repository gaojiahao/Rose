<template>
  <!-- 经办信息 （订单、主体等） -->
  <div class="basic-container">
    <div class="basic-info-main">
      <header class="basic_header">
        <div class="basic_title vux-1px-l">经办信息</div>
        <div class="basic_process_status">{{orderInfo.biProcessStatus || '暂无流程'}}</div>
      </header>
      <div class="basic_top">
        <div class="basic_code">
          <span class="basic_code_title">交易号：</span>{{orderInfo.transCode}}
        </div>
        <div class="basic_status">{{orderInfo.biStatus}}</div>
      </div>
      <div class="basic_detail">
        <div class="basic_detail_left">
          <div class="basic_detail_item">
            <span class="basic_detail_title">经办人:</span>
            <span class="basic_detail_value">{{orderInfo.handlerName}}</span>
          </div>
          <div class="basic_detail_item">
            <span class="basic_detail_title">创建人:</span>
            <span class="basic_detail_value">{{orderInfo.creatorName}}</span>
          </div>
          <div class="basic_detail_item">
            <span class="basic_detail_title">经办主体:</span>
            <span class="basic_detail_value">{{orderInfo.handlerEntityName}}</span>
          </div>
        </div>
        <div class="basic_detail_right">
          <div class="basic_detail_item">
            <span class="basic_detail_title">经办组织:</span>
            <span class="basic_detail_value">{{orderInfo.handlerUnitName}}</span>
          </div>
          <div class="basic_detail_item">
            <span class="basic_detail_title">经办职位:</span>
            <span class="basic_detail_value">{{orderInfo.handlerRoleName}}</span>
          </div>
          <div class="basic_detail_item">
            <span class="basic_detail_title">修改时间:</span>
            <span class="basic_detail_value">{{orderInfo.modTime | dateFormat('YYYY-MM-DD HH:mm')}}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="project-container vux-1px-t" v-if="projectInfo.projectName">
      <div class="project_title">项目信息</div>
      <div class="project_item">
        <i class="icon icon-project"></i>
        <span class="project_item_title">项目名称: </span>
        <span class="project_item_value">{{projectInfo.projectName}}</span>
      </div>
      <div class="project_item">
        <i class="icon icon-type"></i>
        <span class="project_item_title">项目类型: </span>
        <span class="project_item_value">{{projectInfo.projectType}}</span>
      </div>
    </div>
  </div>
</template>

<script>
  import {dateFormat} from 'vux'
  import {fail} from 'assert';

  export default {
    name: "BasicInfo",
    props: {
      workFlowInfo: {
        type: Object,
        default() {
          return {}
        }
      },
      orderInfo: {
        type: Object,
        default() {
          return {}
        }
      },
    },
    data() {
      return {
        showMore: false,
      }
    },
    computed: {
      projectInfo() {
        let {outPut = {}} = this.orderInfo;
        return {
          projectName: outPut.project || '',
          projectType: outPut.projectType_project || '',
        }
      }
    },
    filters: {
      dateFormat
    }
  }
</script>

<style scoped lang="scss">
  // 基本信息 （订单、经办主体等）
  .basic-container {
    margin: .1rem;
    width: calc(100% - .2rem);
    background-color: #fff;
    color: #333;
    .basic-info-main {
      padding: .15rem .15rem .24rem;
      width: 100%;
      box-sizing: border-box;
      .basic_header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .basic_title {
        line-height: .16rem;
        font-size: 16px;
        font-weight: 600;
        &:before {
          left: -.15rem;
          width: .08rem;
          border-left: .08rem solid #3296FA;
        }
      }
      .basic_process_status {
        padding: .04rem .06rem;
        line-height: .12rem;
        border: 1px solid;
        border-radius: .04rem;
        color: #FB880B;
        font-size: .1rem;
      }

      .basic_top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: .1rem;
        padding: .05rem;
        line-height: .12rem;
        background-color: #f7f7f7;
        font-size: .12rem;
      }
      .basic_code_title {
        color: #999;
      }
      .basic_status {
        margin-right: .15rem;
      }

      .basic_detail {
        display: flex;
        margin-top: .24rem;
        line-height: .14rem;
        font-size: .14rem;
      }
      .basic_detail_left {
        flex: 2;
      }
      .basic_detail_right {
        flex: 3;
      }
      .basic_detail_item {
        display: flex;
        margin-top: .1rem;
      }
      .basic_detail_title {
        color: #999;
      }
      .basic_detail_value {
        flex: 1;
        margin-left: .05rem;
        line-height: .16rem;
      }
    }

    .project-container {
      padding: .22rem .15rem .15rem;
      &:before {
        border-color: #e8e8e8;
      }
      .project_title {
        line-height: .16rem;
        font-size: .16rem;
      }
      .project_item {
        display: flex;
        align-items: center;
        margin-top: .14rem;
        line-height: .14rem;
        font-size: .14rem;
        & + .project_item {
          margin-top: .1rem;
        }
      }
      .icon {
        display: inline-block;
        width: .16rem;
        height: .16rem;
        background-size: 100%;
      }
      .project_item_title {
        margin-left: .08rem;
        color: #999;
      }
      .project_item_value {
        margin-left: .05rem;
      }
    }
  }
</style>
