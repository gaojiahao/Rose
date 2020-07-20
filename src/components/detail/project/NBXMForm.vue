<template>
  <div class="detail_wrapper xmlw-detail-container" style="height:100%;">
    <div class="basicPart swiper-container task-form" ref="fill">
      <div class="wrapper">
        <div class="slide">
          <!-- 经办信息 （订单、主体等） -->
          <basic-info :work-flow-info="orderInfo" :order-info="orderInfo"></basic-info>
          <!-- 项目信息 -->
          <only-word :config="otherConfig" :info="approval"></only-word>
          <!-- 备注 -->
          <other-part :other-info="orderInfo" :attachment="attachment"></other-part>
          <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
          <!-- 操作栏 -->
          <!-- <r-action :code="transCode" :task-id="taskId" :actions="actions"
                    :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action> -->
        </div>
      </div>
    </div>
    <r2-action v-if="showAction" :workFlowLogs="workflowLogs" :formStatus="formStatusArr"/>
  </div>
</template>

<script>
// vux组件引入
import {Cell, Group, numberComma} from 'vux'
// 请求 引入
import {findProjectApproval} from 'service/projectService'
// 组件 引入
import RAction from 'components/public/RAction'
import onlyWord from 'components/detail/commonPart/form-part/onlyWord'
// mixins 引入
import detailCommon from 'mixins/detailCommon'
// 插件引入
import {accMul} from 'plugins/calc/decimalsAdd'
// 插件 引入
import Bscroll from "better-scroll";

export default {
  data() {
    return {
      approval: {},
      comment: {},
      biReferenceId:'',
      showAction: false,
      workflowLogs:[],
    }
  },
  filters: {
    timeSplit(val) {
      return val ? val.split(' ')[0] : '';
    }
  },
  mixins: [detailCommon],
  components: { Cell, Group, RAction, onlyWord },
  methods: {
    // 获取详情
    getOrderList(transCode = '') {
      return findProjectApproval(transCode).then(({formData = {},attachment = []}) => {
        this.approval = formData.projectApproval;
        this.attachment = attachment;
        this.comment = formData.comment;
        this.orderInfo = {
          ...formData.baseinfo,
          ...formData.comment,
          biStatus: '已生效'
        };
        this.biReferenceId = formData.biReferenceId;
      })
    },
    // 使用千分符
    numberComma(val) {
      if (!val && val !== 0) {
        return '无';
      }
      return numberComma(val);
    },
    // 转为百分比
    percent(val) {
      if (!val && val !== 0) {
        return '无';
      }
      let budget = accMul(val,100);
      return `${budget}%`;
      // return `${val * 100}%`;
    },
  },
  created() {
    this.$nextTick(() => {
    this.$parent.detailScroll.destroy();
      this.fillBscroll = new Bscroll(this.$refs.fill, {
        click: true
      });
    });  
  }
}
</script>

<style lang='scss' scoped>
  @import '~scss/biz-app/bizDetail';
  .task-form{
    height:calc(100% - 1.02rem)
  }
</style>
