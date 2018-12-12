<template>
  <div class="detail_wrapper">
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
      <matter-list :matter-list='orderList' :listTitle="'设施列表'"
                   :count="count">
        <template slot="matterOther" slot-scope="{item}">
          <div class='mater_other'>
            <div class='mater_attribute'>
              <span>类型: {{item.facilityType}}</span>
              <span>单位: {{item.facilityUnit_facilityObjCode || '无'}}</span>
              <span>大类: {{item.facilityBigType_facilityObjCode}}</span>
              <span>子类: {{item.facilitySubclass_facilityObjCode || '无'}}</span>
            </div>
            <div class='mater_num'>
              <span class="num">估计价格: ￥{{item.price | toFixed | numberComma(3)}}</span>
              <span class="num">本次申请: {{item.tdQty | toFixed}}</span>
            </div>
            <div class='mater_price'>
              <span>
                <span class="symbol">￥</span>{{item.tdAmount | toFixed | numberComma(3)}}
              </span>
            </div>
          </div>
        </template>
      </matter-list>
      <div class="comment-part">
        <form-cell :showTopBorder="false" cellTitle='备注' :cellContent="orderInfo.biComment || '无'"></form-cell>
      </div>
      <upload-file :default-value="attachment" no-upload :contain-style="uploadStyle"
                   :title-style="uploadTitleStyle"></upload-file>
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
  import detailCommon from 'components/mixins/detailCommon'
  // 组件 引入
  import RAction from 'components/RAction'
  import workFlow from 'components/workFlow'
  import MatterList from 'components/detail/commonPart/MatterList'
  import FormCell from 'components/detail/commonPart/FormCell'
  //公共方法引入
  import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd.js'
  import {toFixed} from '@/plugins/calc'

  export default {
    data() {
      return {
        count: 0,           // 金额合计
        comment: '',        // 审批备注
        orderList: [], // 物料列表
      }
    },
    mixins: [detailCommon],
    components: {
      workFlow, RAction, MatterList, FormCell
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
          let orderList = [];
          let {order = {}} = formData;
          this.attachment = attachment;
          // 获取合计
          let {dataSet} = formData.order;
          for (let item of dataSet) {
            this.count = accAdd(this.count, item.tdAmount)
            item.inventoryPic = item.inventoryPic_outPutMatCode
              ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_outPutMatCode}&width=400&height=400`
              : this.getDefaultImg();
            orderList.push(item);
          }
          this.orderList = orderList;
          this.orderInfo = formData;
          this.workFlowInfoHandler();
        })
      },
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizDetail';

  .other {
    padding-bottom: .06rem;
    font-size: .14rem;
    .title {
      font-weight: bold;
    }
    .mode {
      color: #454545;
    }
  }

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

  .contacts_part {
    margin-bottom: .1rem;
    padding: .06rem .1rem 0;
    width: 100%;
    background: #fff;
    box-sizing: border-box;
  }
</style>

