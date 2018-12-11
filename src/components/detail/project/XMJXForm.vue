<template>
  <div class="detail_wrapper xmjx-detail-container">
    <div class="basicPart">
      <div class='related_tips' v-if='HasValRealted' @click="getSwiper">
        <span>其他应用里存在与本条相关联的数据，快去看看</span>
        <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
      </div>
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="orderInfo" :order-info="orderInfo"></basic-info>
      <!-- 项目信息 -->
      <div class="project_info">
        <div class="info_title vux-1px-b"><span class="iconfont icon-xiangmu"></span>项目信息</div>
        <div class="project_content">
          <form-cell cellTitle="名称" :cellContent="projectApproval.projectName" :showTopBorder=false></form-cell>
          <form-cell cellTitle="大类" :cellContent="projectApproval.projectType"></form-cell>
          <form-cell cellTitle="子类" :cellContent="projectApproval.projectSubclass"></form-cell>
          <form-cell cellTitle="经理" :cellContent="projectApproval.projectManager"></form-cell>
          <form-cell cellTitle="经理电话" :cellContent="projectApproval.phoneNumber"></form-cell>
          <form-cell cellTitle="说明" :cellContent="projectApproval.comment || '无'"></form-cell>
          <form-cell cellTitle="预期开始日期" :cellContent="projectApproval.expectStartDate | dateFormat('YYYY-MM-DD')"></form-cell>
          <form-cell cellTitle="预期截止日期" :cellContent="projectApproval.expectEndDate | dateFormat('YYYY-MM-DD')"></form-cell>
        </div>
      </div>
      <!-- 资金明细 -->
      <div class="project_info project-amt" v-show="projectConclusion.length">
        <div class="info_title vux-1px-b"><span class="iconfont icon-yusuan2"></span>资金明细</div>
        <div class="project_content" :class="{'vux-1px-b': index !== projectConclusion.length - 1}"
             v-for="(item, index) in projectConclusion">
          <form-cell :cellTitle="`实际${item.conclusionName}`" showSymbol textRight
                     :cellContent="numberComma(item.actual)" :showTopBorder="false"></form-cell>
          <form-cell :cellTitle="`预算${item.conclusionName}`" showSymbol textRight
                     :cellContent="numberComma(item.budget)" :showTopBorder="false"></form-cell>
          <form-cell :cellTitle="`差额${item.conclusionName}`" showSymbol textRight
                     :cellContent="numberComma(item.difference)" :showTopBorder="false"></form-cell>
        </div>
      </div>
      <div class="comment-part">
        <form-cell :showTopBorder="false" cellTitle='备注' :cellContent="comment.biComment || '无'"></form-cell>
      </div>
      <upload-file :default-value="attachment" no-upload :contain-style="uploadStyle" :title-style="uploadTitleStyle"></upload-file>

    </div>
  </div>
</template>

<script>
  // vux组件引入
  import {Cell, Group, dateFormat, numberComma} from 'vux'
  // 请求 引入
  import {findProjectConclusion} from 'service/projectService'
  // mixins 引入
  import detailCommon from 'components/mixins/detailCommon'

  export default {
    data() {
      return {
        comment: {},
        projectApproval: {}, // 项目相关
        projectTime: {}, // 实际日期
        projectConclusion: {},
      }
    },
    filters: {
      dateFormat
    },
    mixins: [detailCommon],
    components: {
      Group,
      Cell,
    },
    methods: {
      // 获取详情
      getOrderList(transCode = '') {
        return findProjectConclusion(transCode).then(({formData = {},attachment = []}) => {
          this.comment = formData.comment;
          this.attachment = attachment;
          this.projectApproval = formData.projectApproval;
          this.projectTime = formData.projectTime;
          this.projectConclusion = formData.projectConclusion;
          this.orderInfo = {
            ...formData.baseinfo,
            biStatus: '已生效'
          };
        })
      },
      // TODO 使用千分符
      numberComma(val) {
        if (!val && val !== 0) {
          return '无';
        }
        return numberComma(val);
      },
    },
    created() {
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizDetail';

  .xmjx-detail-container {
    .project-amt {
      .project_content {
        padding: .05rem 0;
      }
      .each_cell {
        padding: 0;
      }
    }
    /deep/ .weui-cells {
      margin-top: 0;
      font-size: .16rem;
      &:before {
        border-top: none;
      }
      &:after {
        border-bottom: none;
      }
      .weui-cell {
        padding: 10px 0;
        &:before {
          left: 0;
        }
      }
    }
  }
</style>

