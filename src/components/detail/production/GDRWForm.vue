<template>
  <div class="detail_wrapper xsbj-detail-container">
    <div class="basicPart" v-if='orderInfo'>
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>   
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                :no-status="orderInfo.biStatus"></work-flow> 
      <div class="form_content">
        <div class="form_title">
          <span class="iconfont icon-mingxi1"></span>
          <span>工单信息</span>
        </div>
        <div class="main_content">
          <form-cell cellTitle='工序名称' :cellContent="workInfo.procedureName_proPointCode"></form-cell>
          <form-cell cellTitle='工序编码' :cellContent="workInfo.proPointCode"></form-cell>
          <form-cell cellTitle='工序待验收' :cellContent="workInfo.thenQtyStock"></form-cell>
          <form-cell cellTitle='工序可派工' :cellContent="workInfo.thenQtyBal"></form-cell>
          <form-cell cellTitle='派工数量' :cellContent="workInfo.tdQty"></form-cell>
          <form-cell cellTitle='工人' :cellContent="workInfo.dealerName_dealerDebit"></form-cell>
          <form-cell cellTitle='设施' :cellContent="workInfo.facilityName_facilityObjCode || '无'"></form-cell>
        </div>
      </div>
      <div class="form_content" style="marginTop: .1rem">
        <div class="form_title">
          <span class="iconfont icon-mingxi1"></span>
          <span>加工订单信息</span>
        </div>
        <div class="main_content">
          <form-cell cellTitle='加工订单号' :cellContent="workInfo.processCode"></form-cell>
          <form-cell cellTitle='成品名称' :cellContent="workInfo.inventoryName_transObjCode"></form-cell>
          <form-cell cellTitle='订单加工数' :cellContent="workInfo.processProQty"></form-cell>
        </div>
      </div>
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions"
                :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>

<script>
// vux组件引入
import { Cell, Group,dateFormat } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
// mixins 引入
import detailCommon from 'components/mixins/detailCommon'
// 组件 引入
import { toFixed } from '@/plugins/calc'
import RAction from 'components/RAction'
import workFlow from 'components/workFlow'
import contactPart from 'components/detail/commonPart/ContactPart'


export default {
  data() {
    return {
      workInfo: {},       // 工单内容
      orderInfo: {},      // 表单内容
      formViewUniqueId: 'c5acfe84-3478-431b-bb18-93809e19cb62'
    }
  },
  mixins: [detailCommon],
  components: {
    Cell, Group, RAction, workFlow, contactPart
  },
  methods: {
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
        data.formData.validUntil = dateFormat(data.formData.validUntil, 'YYYY-MM-DD');
        this.orderInfo = data.formData;
        this.workInfo = data.formData.order.dataSet[0];
        this.workFlowInfoHandler();
      })
    },
  }
}
</script>

<style lang='scss' scoped>
  @import './../../scss/bizDetail';
  .xsbj-detail-container{
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
  .xsbj-detail-container {
    .price_type {
      margin-top: .04rem;
      color: #757575;
      font-size: .12rem;
    }
  }
  .materiel_list {
    .title {
      padding-bottom: .06rem;
      .iconfont {
        font-size: .14rem;
        margin-left: .03rem;
      }
    }
    .mater_list {
      .each_mater {
        padding: unset;
        .each_mater_wrapper
          .mater_main {
            width: 100%;
            max-width: inherit;
            margin-left: inherit;
            .mater_title {
              font-size: .18rem;
            }
            .mater_other {
              margin-top: -.04rem;
            }
            .mater_spec {
              margin-right: .04rem;
              .content {
                font-size: .12rem;
              }
            }
            .mater_reimb {
              margin-top: .04rem;
            }
          }
      }

    }
  }

        
  .materiel_list
    .mater_list
      .each_mater
        .each_mater_wrapper
          .mater_main
            .mater_info
              .withColor
                .mater_code
                  .num {
                    border-top-right-radius: .08rem;
                  }
</style>
