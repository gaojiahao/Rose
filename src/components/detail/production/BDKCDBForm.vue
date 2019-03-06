<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.inPut'>
      <!-- <div class='related_tips' v-if='HasValRealted' @click="getSwiper">
        <span>其他应用里存在与本条相关联的数据，快去看看</span>
        <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
      </div> -->
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 仓库信息 -->
      <warehouse-content :warehouse-config="warehouseConfig"></warehouse-content>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName"
                  :is-my-task="isMyTask" :no-status="orderInfo.biStatus"></work-flow>
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
  // 请求 引入
  import {getSOList,} from 'service/detailService'
  // mixins 引入
  import detailCommon from 'components/mixins/detailCommon'
  // 组件引入
  import RAction from 'components/RAction'
  import workFlow from 'components/workFlow'
  import WarehouseContent from 'components/detail/commonPart/WarehouseContent'
  import MatterList from 'components/detail/commonPart/MatterList'

  export default {
    data() {
      return {
        orderInfo: {},
        warehouse: {}, // 仓库信息
        warehouseConfig: [],
        formViewUniqueId: 'a8c58e16-48f5-454e-98d8-4f8f9066e513',
      }
    },
    mixins: [detailCommon],
    components: {
      workFlow,
      RAction,
      WarehouseContent,
      MatterList,
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
        }).then(data => {
          // http200时提示报错信息
          if (data.success === false) {
            this.$vux.alert.show({
              content: '抱歉，数据有误，暂无法查看',
              onHide: () => {
                this.$router.back();
              }
            });
            return;
          }
          let {attachment = [], formData = {}} = data;
          let {inPut = {}} = formData;
          let {dataSet} = inPut;
          for (let val of dataSet) {
            val.inventoryPic = val.inventoryPic_transObjCode
              ? `/H_roleplay-si/ds/download?url=${val.inventoryPic_transObjCode}&width=400&height=400`
              : this.getDefaultImg();
          }
          // 动态获取 仓库信息
          this.setWarehouseInfo(formData);
          this.setWarehouseInfo(inPut);
          this.attachment = attachment;
          this.matterList = inPut.dataSet;
          this.orderInfo = formData;
          this.workFlowInfoHandler();
        })
      },
      // 动态获取 仓库信息
      setWarehouseInfo(data) {
        for(let key in data) {
          if(key.includes('warehouse') || key.includes('storehouse') || key.includes('containerCode')) {
            this.warehouse[key] = data[key];
          }
        }
      }
    }
  }
</script>
<style lang='scss' scoped>
  @import './../../scss/bizDetail';
</style>
