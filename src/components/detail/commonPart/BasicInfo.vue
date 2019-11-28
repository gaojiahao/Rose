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
        <!-- <div class="basic_status" >{{orderInfo.biStatus}}</div> -->
        <span class="biStatus" v-instanceStateDirective="{status:orderInfo.biStatus}" >12312</span>
      </div>
      <div class="basic_detail">
        <div class="basic_detail_wrapper">
          <div class="basic_detail_item">
            <span class="basic_detail_title">经办主体:</span>
            <span class="basic_detail_value">{{orderInfo.handlerEntityName}}</span>
          </div>
        </div>
        <div class="basic_detail_wrapper">
          <div class="basic_detail_item">
            <span class="basic_detail_title">经办人:</span>
            <span class="basic_detail_value">{{orderInfo.handlerName}}</span>
          </div>
          <div class="basic_detail_item">
            <span class="basic_detail_title">经办组织:</span>
            <span class="basic_detail_value">{{orderInfo.handlerUnitName}}</span>
          </div>
        </div>
        <div class="basic_detail_wrapper">
          <div class="basic_detail_item">
            <span class="basic_detail_title">创建者:</span>
            <span class="basic_detail_value">{{orderInfo.creatorName}}</span>
          </div>
          <div class="basic_detail_item">
            <span class="basic_detail_title">经办职位:</span>
            <span class="basic_detail_value">{{orderInfo.handlerRoleName}}</span>
          </div>
        </div>
        <div class="basic_detail_wrapper spec_part">
          <div class="basic_detail_item">
            <span class="basic_detail_title">修改者:</span>
            <span class="basic_detail_value">{{orderInfo.modiferName}}</span>
          </div>
          <div class="basic_detail_item">
            <span class="basic_detail_title">修改时间:</span>
            <span class="basic_detail_value">{{orderInfo.modTime | dateFormat }}</span>
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
  import { dateFormat } from 'vux'
  import { fail } from 'assert';

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
    computed: {
      projectInfo() {
        let {outPut = {}, inPut = {}} = this.orderInfo;
        let project = outPut.project || inPut.project || '';
        let projectType = outPut.projectType_project || inPut.projectType_project || '';
        return {
          projectName: project,
          projectType,
        }
      }
    },
    filters: { dateFormat },
    data() {
      return {
        showMore: false,
      }
    }
  }
</script>

<style scoped lang="scss">
  // 基本信息 （订单、经办主体等）
  .basic-container {
    color: #333;
    margin: .1rem;
    border-radius: .04rem;
    background-color: #fff;
    width: calc(100% - .2rem);
    .basic-info-main {
      width: 100%;
      padding: .15rem .15rem;
      box-sizing: border-box;
      .basic_header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .basic_title {
        font-size: 16px;
        font-weight: 600;
        line-height: .16rem;
        &:before {
          left: -.15rem;
          width: .08rem;
          border-left: .08rem solid #3296FA;
        }
      }
      .basic_process_status {
        color: #FB880B;
        font-size: .1rem;
        border: 1px solid;
        line-height: .12rem;
        border-radius: .04rem;
        padding: .04rem .06rem;
      }

      .basic_top {
        display: flex;
        padding: .05rem;
        font-size: .12rem;
        margin-top: .1rem;
        align-items: center;
        line-height: .12rem;
        background-color: #f7f7f7;
        justify-content: space-between;
      }
      .basic_code_title {
        color: #999;
      }
      .basic_detail {
        margin-top: .2rem;
        font-size: .14rem;
        line-height: .14rem;
      }
      .basic_detail_wrapper {
        display: flex;
        margin-top: .1rem;
        &.spec_part {
          margin-top: .2rem;
        }
      }
      .basic_detail_item {
        display: flex;
        & + .basic_detail_item {
          margin-left: .2rem;
        }
      }
      .basic_detail_title {
        color: #999;
      }
      .basic_detail_value {
        flex: 1;
        margin-left: .05rem;
      }
    }

    .project-container {
      padding: .22rem .15rem .15rem;
      &:before {
        border-color: #e8e8e8;
      }
      .project_title {
        font-size: .16rem;
        line-height: .16rem;
      }
      .project_item {
        display: flex;
        font-size: .14rem;
        margin-top: .14rem;
        align-items: center;
        line-height: .14rem;
        & + .project_item {
          margin-top: .1rem;
        }
      }
      .icon {
        width: .16rem;
        height: .16rem;
        display: inline-block;
        background-size: 100%;
      }
      .project_item_title {
        color: #999;
        margin-left: .08rem;
      }
      .project_item_value {
        margin-left: .05rem;
      }
    }
  }

.biStatus{
    color: white;
    padding: 0.02rem 0.04rem;
    border-radius: 0.10rem;
    font-size: 0.12rem;
  }
</style>
