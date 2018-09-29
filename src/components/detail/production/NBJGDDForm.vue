<template>
  <div class="detail_wrapper nbjdgg-detail-container">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>
      <div class='related_tips' v-if='HasValRealted' @click="getSwiper">
        <span>其他应用里存在与本条相关联的数据，快去看看</span>
        <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
      </div>
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <!-- 物料列表 -->
      <div class="materiel_list">
        <div class="title">
          <span class="iconfont icon-Shape"></span>物料列表
        </div>
        <div class="mater_list">
          <div class="each_mater"
               v-for="(oItem, key) in orderList" :key='key'>
            <div class="order_code">
              <span class="order_title">计划号</span>
              <span class="order_num">{{key}}</span>
            </div>
            <div class="order_matter">
              <template v-for="(item, index) in oItem">
                <matter-item class="vux-1px-b" :item="item">
                  <!-- 调拨数量 -->
                  <div class="mater_other" slot="other" slot-scope="{item}">
                    <div class="mater_num">
                      <span class="num">
                        本次下单: {{item.tdQty | toFixed}}
                      </span>
                      <span class="units">
                        [待下单余额: {{item.thenQtyBal | toFixed}}]
                      </span>
                    </div>
                    <div class="mater_num">
                      <span class="num">
                        成品计划验收日期: {{item.shippingTime}}
                      </span>
                    </div>
                  </div>
                </matter-item>
                <div class="bom-container" v-if="item.boms && item.boms.length">
                  <div class="title">原料</div>
                  <template v-for="(bom, bIndex) in item.boms">
                    <form-cell cellTitle="原料编码" :cellContent="bom.transObjCode"
                               :style="{'margin-top': bIndex > 0 ? '.05rem' : '0'}"></form-cell>
                    <form-cell cellTitle="原料名称" :cellContent="bom.inventoryName"></form-cell>
                    <form-cell cellTitle="计量单位" :cellContent="bom.measureUnit"></form-cell>
                    <form-cell cellTitle="领料需求" :cellContent="bom.tdQty"></form-cell>
                  </template>
                </div>
              </template>
            </div>
          </div>
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
  import {getSOList} from 'service/detailService'
  // mixins 引入
  import detailCommon from 'components/mixins/detailCommon'
  import common from 'mixins/common'
  //公共方法引入
  // 组件 引入
  import RAction from 'components/RAction'
  import workFlow from 'components/workFlow'
  import MatterItem from 'components/detail/commonPart/MatterItem'

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
    mixins: [detailCommon, common],
    components: {
      workFlow, RAction, MatterItem,
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
        }).then(({success = true, formData = {}}) => {
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
          let {order = {}} = formData;
          // 获取合计
          let {dataSet} = formData.order;
          for (let item of dataSet) {
            item.inventoryPic = item.inventoryPic_transObjCode
              ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400`
              : this.getDefaultImg();
            item.shippingTime = this.changeDate(item.shippingTime);
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
  @import './../../scss/bizDetail';

  .nbjdgg-detail-container {
    // 计划号
    .order_code {
      display: flex;
      color: #fff;
      font-size: .12rem;
      font-weight: bold;
      > span {
        display: inline-block;
        padding: 0 .04rem;
      }
      .order_title {
        background: #1160aa;
      }
      // 订单号
      .order_num {
        background: #9bb4da;
        border-top-right-radius: .08rem;
      }
    }
    .order_matter {
      margin-top: .04rem;
      .bom-container {
        background-color: #f8f8f8;
        .title {
          padding: .06rem 0;
          background-color: #fff;
        }
      }
      .each_cell {
        background-color: #fff;
      }
    }
    .mater_other {
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
  }

</style>
