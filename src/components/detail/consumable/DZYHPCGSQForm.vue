<template>
  <div class="detail_wrapper xsbj-detail-container">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>

      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <!-- 物料列表 -->
      <matter-list :matter-list="matterList" @on-show-more="onShowMore"></matter-list>
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
  // vux 组件引入
  import {dateFormat} from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  // mixins 引入
  import detailCommon from 'mixins/detailCommon'
  // 组件 引入
  import workFlow from 'components/public/workFlow'
  import RAction from 'components/public/RAction'
  import contactPart from 'components/detail/commonPart/ContactPart'
  import MatterList from 'components/detail/commonPart/MatterList'
  import UploadFile from 'components/upload/UploadFile'
  import {accAdd, accMul} from 'plugins/calc/decimalsAdd'

  export default {
    data() {
      return {
        orderInfo: {},      // 表单内容
        formViewUniqueId: 'a8c58e16-48f5-454e-98d8-4f8f9066e513',
        attachment: [],
        count: 0,
      }
    },
    mixins: [detailCommon],
    components: {
      workFlow, RAction, contactPart, MatterList, UploadFile,
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
          let {order} = formData;
          // 获取合计
          let {dataSet} = order;
          for (let val of dataSet) {
            this.count = accAdd(this.count, val.tdAmount);
            val.inventoryPic = val.inventoryPic_transObjCode
              ? `/H_roleplay-si/ds/download?url=${val.inventoryPic_transObjCode}&width=400&height=400`
              : this.getDefaultImg();
          }
          this.attachment = attachment;
          this.matterList = dataSet;
          formData.validUntil = dateFormat(formData.validUntil, 'YYYY-MM-DD');
          this.orderInfo = {
            ...formData,
            ...order,
          };
          this.workFlowInfoHandler();
        })
      },
    }
  }
</script>

<style lang='scss' scoped>
  @import '~scss/biz-app/bizDetail';
</style>
