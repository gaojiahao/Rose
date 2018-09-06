<template>
  <div class="detail_wrapper">
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
      <div class="contacts_part">
        <!-- 出库-->
        <warehouse-content class="vux-1px-b" :warehouse="warehouseOut"></warehouse-content>
        <!-- 入库 -->
        <warehouse-content :warehouse="warehouseIn"></warehouse-content>
      </div>
      <!-- 物料列表 -->
      <div class="materiel_list">
        <div class="title">物料列表</div>
        <div class="mater_list">
          <matter-item :item="item" :class="{'vux-1px-b' : index !==  orderInfo.inPut.dataSet.length - 1}"
                        v-for="(item, index) in orderInfo.inPut.dataSet" :key='index'>
            <!-- 调拨数量 -->
            <div class='mater_other' slot="other">
              <div class='mater_num'>
                <span class="num">
                  <span class="symbol">调拨数量: </span>
                  {{item.tdQty}}
                </span>
              </div>
            </div>
          </matter-item>
        </div>
      </div>
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
  // 组件引入
  import RAction from 'components/RAction'
  import workFlow from 'components/workFlow'
  import PopWarehouseList from 'components/Popup/PopWarehouseList'
  import WarehouseContent from 'components/detail/commonPart/WarehouseContent'
  import MatterItem from 'components/detail/commonPart/MatterItem'

  export default {
    data() {
      return {
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
      MatterItem,
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
            warehouseName: `${inPut.warehouseName_containerCode}(入库)`,
            warehouseType: inPut.warehouseType_containerCode,
            warehouseProvince: inPut.warehouseProvince_containerCode,
            warehouseCity: inPut.warehouseCity_containerCode,
            warehouseDistrict: inPut.warehouseDistrict_containerCode,
            warehouseAddress: inPut.warehouseAddress_containerCode,
          };
          // 出库
          this.warehouseOut = {
            warehouseCode: inPut.containerCodeOut,
            warehouseName: `${inPut.warehouseName_containerCodeOut}(出库)`,
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
  @import './../scss/bizDetail';

  .contacts_part {
    margin-bottom: .1rem;
    padding: .06rem .1rem 0;
    width: 100%;
    background: #fff;
    box-sizing: border-box;
  }

  .mater_other {
    .mater_num {
      .num {
        color: #5077aa;
        font-size: .16rem;
        font-weight: bold;
        .symbol {
          color: #757575;
        }
      }
    }
  }
</style>
