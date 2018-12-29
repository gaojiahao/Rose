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
      <div class="warehouse_part">
        <!-- 出库-->
        <warehouse-content class="vux-1px-b" :warehouse="warehouseOut"></warehouse-content>
        <!-- 入库 -->
        <warehouse-content :warehouse="warehouseIn"></warehouse-content>
      </div>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName"
                  :is-my-task="isMyTask"
                  :no-status="orderInfo.biStatus"></work-flow>
      <!-- 物料列表 -->
      <matter-list :matter-list="orderInfo.inPut.dataSet">
        <!-- 调拨数量 -->
         <template slot="matterOther" slot-scope="{item}">
            <div class='mater_other'>
              <div class="mater_attribute">
                <span>属性: {{item.tdProcessing}}</span>
                <span>单位: {{item.measureUnit_transObjCode}}</span>
              </div>
              <div class="mater_num">
                <span class="num">
                  调拨数量: {{item.tdQty | toFixed}}
                </span>
                <span class="units">
                  [可用库存数: {{item.thenQtyStock | toFixed}}]
                </span>
              </div>
            </div>
         </template>
      </matter-list>
      <div class="comment-part">
        <form-cell :showTopBorder="false" cellTitle='备注' :cellContent="orderInfo.biComment || '无'"></form-cell>
      </div>
      <upload-file :default-value="attachment" no-upload :contain-style="uploadStyle" :title-style="uploadTitleStyle"></upload-file>
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
  import PopWarehouseList from 'components/Popup/PopWarehouseList'
  import WarehouseContent from 'components/detail/commonPart/WarehouseContent'
  import MatterList from 'components/detail/commonPart/MatterList'

  export default {
    data() {
      return {
        orderInfo: {},
        warehouseIn: {}, // 入库仓库详情
        warehouseOut: {}, // 出库仓库详情
        formViewUniqueId: 'a8c58e16-48f5-454e-98d8-4f8f9066e513'
      }
    },
    mixins: [detailCommon],
    components: {
      workFlow,
      PopWarehouseList,
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
          this.attachment = data.attachment
          let {inPut = {}} = data.formData;
          let {dataSet} = inPut;
          for (let val of dataSet) {
            val.inventoryPic = val.inventoryPic_transObjCode
              ? `/H_roleplay-si/ds/download?url=${val.inventoryPic_transObjCode}&width=400&height=400`
              : this.getDefaultImg();
          }
          // 入库
          this.warehouseIn = {
            warehouseCode: inPut.containerCode,
            warehouseName: `${inPut.warehouseName_containerCode}`,
            warehouseAction: '入库',
            warehouseIcon: 'icon-ruku',
            warehouseType: inPut.warehouseType_containerCode,
            warehouseProvince: inPut.warehouseProvince_containerCode,
            warehouseCity: inPut.warehouseCity_containerCode,
            warehouseDistrict: inPut.warehouseDistrict_containerCode,
            warehouseAddress: inPut.warehouseAddress_containerCode,
          };
          // 出库
          this.warehouseOut = {
            warehouseCode: inPut.containerCodeOut,
            warehouseName: `${inPut.warehouseName_containerCodeOut}`,
            warehouseAction: '出库',
            warehouseIcon: 'icon-chuku',
            warehouseType: inPut.warehouseType_containerCodeOut,
            warehouseProvince: inPut.warehouseProvince_containerCodeOut,
            warehouseCity: inPut.warehouseCity_containerCodeOut,
            warehouseDistrict: inPut.warehouseDistrict_containerCodeOut,
            warehouseAddress: inPut.warehouseAddress_containerCodeOut,
          };
          this.orderInfo = data.formData;
          this.workFlowInfoHandler();
        })
      },
    },
    created() {
    }
  }
</script>
<style lang='scss' scoped>
  @import './../../scss/bizDetail';
  .mater_other {
    .mater_left {
      color: #757575;
      font-size: .12rem;
      .units {
        margin-right: .04rem;
      }
    }
    .mater_num {
      .num {
        color: #111;
        font-size: .14rem;
        font-weight: bold;
        .symbol {
          color: #757575;
        }
      }
    }
  }
</style>
