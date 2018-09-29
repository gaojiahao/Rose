<template>
  <div class="detail_content kcpd-detail-container">
    <div class="basicPart" v-if='orderInfo && orderInfo.inPut'>
      <div class='related_tips' v-if='HasValRealted' @click="getSwiper">
        <span>其他应用里存在与本条相关联的数据，快去看看</span>
        <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
      </div>
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName"
                  :is-my-task="isMyTask"
                  :no-status="orderInfo.biStatus"></work-flow>
      <!-- 仓库信息 -->
      <div class="warehouse_part">
        <!-- 入库 -->
        <warehouse-content :warehouse="warehouseIn"></warehouse-content>
      </div>
      <!-- 物料列表 -->
      <matter-list :matter-list="orderInfo.inPut.dataSet">
        <div class='mater_other' slot="matterOther" slot-scope="{item}">
          <div class='mater_left'>
            <span class="units">
              账存数量: {{item.thenQtyStock | toFixed}}
            </span>
            <span class="units">
              计量单位: {{item.measureUnit_transObjCode}}
            </span>
          </div>
          <div class='mater_num'>
            盘点数量: <span class="num">{{item.tdQty | toFixed}}</span>
            差异数量: <span class="diff_num">{{item.differenceNum | toFixed}}</span>
          </div>
        </div>
      </matter-list>
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions"
                @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>

<script>
  // 请求 引入
  import {getSOList,} from 'service/detailService'
  // mixins 引入
  import detailCommon from 'components/mixins/detailCommon'
  // 组件 引入
  import RAction from 'components/RAction'
  import workFlow from 'components/workFlow'
  import PopWarehouseList from 'components/Popup/PopWarehouseList'
  import WarehouseContent from 'components/detail/commonPart/WarehouseContent'
  import MatterList from 'components/detail/commonPart/MatterList'

  export default {
    data() {
      return {
        warehouseIn: {}, // 入库仓库详情
        formViewUniqueId: '064e455d-4277-473a-9e54-d9ae4b1f23be'
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
        let url = require('assets/wl_default02.png');
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
            warehouseName: inPut.warehouseName_containerCode,
            warehouseType: inPut.warehouseType_containerCode,
            warehouseProvince: inPut.warehouseProvince_containerCode,
            warehouseCity: inPut.warehouseCity_containerCode,
            warehouseDistrict: inPut.warehouseDistrict_containerCode,
            warehouseAddress: inPut.warehouseAddress_containerCode,
          };
          this.orderInfo = data.formData;
          this.workFlowInfoHandler();
        })
      },
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizDetail';

  .kcpd-detail-container {
    .matter_item {
      .mater_other {
        .mater_left {
          color: #757575;
          font-size: .12rem;
          .units {
            margin-right: .04rem;
          }
        }
        .mater_num {
          color: #111;
          font-size: .14rem;
          font-weight: bold;
          .diff_num {
            color: #ea5455;
          }
        }
      }
    }
  }
</style>
