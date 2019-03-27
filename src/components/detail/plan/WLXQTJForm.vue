<template>
  <div class="detail_wrapper wlxqtj-detail-container">
    <div class="basicPart" v-if='orderInfo && orderInfo.outPut'>

      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <!-- 物料列表 -->
      <matter-list :order-list='orderList' :order-title="orderTitle" @on-show-more="onShowMore"></matter-list>
      <!-- 备注 -->
      <other-part :other-info="orderInfo" :attachment="attachment"></other-part>
      <!-- 物料详情 -->
      <pop-matter-detail :show="showMatterDetail" :item="matterDetail" v-model="showMatterDetail"></pop-matter-detail>
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions"
                :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>
<script>
  // 请求 引入
  import {getSOList} from 'service/detailService'
  // mixins 引入
  import detailCommon from 'mixins/detailCommon'
  //公共方法引入
  // 组件 引入
  import RAction from 'components/public/RAction'
  import workFlow from 'components/public/workFlow'
  import MatterItem from 'components/detail/commonPart/MatterItem'
  import FormCell from 'components/detail/commonPart/form-part/FormCell'

  export default {
    data() {
      return {
        count: 0,          // 金额合计
        orderInfo: {},      // 表单内容
        formViewUniqueId: 'a8c58e16-48f5-454e-98d8-4f8f9066e513',
        orderList: {}, // 物料列表
        basicInfo: {},//存放基本信息
      }
    },
    mixins: [detailCommon],
    components: {
      workFlow, RAction, MatterItem, FormCell
    },
    methods: {
      //选择默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default03.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // 获取详情
      getOrderList(transCode = '') {
        return getSOList({
          formViewUniqueId: this.formViewUniqueId,
          transCode
        }).then(({success = true, formData = {}, attachment = []}) => {
          // http200时提示报错信息
          if (success === false) {
            this.$vux.alert.show({
              content: '抱歉，数据有误，暂无法查看',
              onHide: () => {
                this.$router.back();
              }
            });
            return;
          }
          let orderList = {};
          let {outPut = {}} = formData;
          this.attachment = attachment;
          // 获取合计
          let {dataSet} = formData.outPut;
          for (let item of dataSet) {
            item.inventoryPic = item.inventoryPic_outPutMatCode
              ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_outPutMatCode}&width=400&height=400`
              : this.getDefaultImg();
            item.inventoryName_transObjCode = item.inventoryName_outPutMatCode;
            item.transObjCode = item.outPutMatCode;
            if (!orderList[item.transMatchedCode]) {
              orderList[item.transMatchedCode] = [];
            }
            orderList[item.transMatchedCode].push(item);
          }
          this.orderList = orderList;
          this.orderInfo = formData;
          this.workFlowInfoHandler();
        })
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import '~scss/biz-app/bizDetail';
</style>
