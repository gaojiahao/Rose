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
      <div class="materiel_list">
        <div class="title">
          <span class="iconfont icon-Shape"></span>物料列表
        </div>
        <div class="mater_list">
          <div class="each_mater"
              v-for="(oItem, key) in orderList" :key='key'>
            <div class="order_code">
              <span class="order_title">所属订单</span>
              <span class="order_num">{{key}}</span>
            </div>
            <div class="order_matter">
              <matter-item class="vux-1px-b" :item="item" v-for="(item, index) in oItem" :key="index"></matter-item>
            </div>
          </div>
        </div>
        <div class="comment-part">
          <form-cell cellTitle='备注' :cellContent="orderInfo.biComment || '无'"></form-cell>
        </div>
      </div>
      <!-- <matter-list :matter-list="orderInfo.order.dataSet" :order-remarks="orderInfo.biComment"></matter-list> -->
      <!-- 金额合计栏 -->
      <price-total :count="count" noAmt noTaxAmt></price-total>
      <upload-file :default-value="attachment" no-upload :contain-style="uploadStyle" :title-style="uploadTitleStyle"></upload-file>
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions" 
                :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>

<script>
// 请求 引入
import { isMyflow, getSOList, getWorkFlow, getListId } from 'service/detailService'
import { commitTask, saveAndCommitTask } from 'service/commonService'
// mixins 引入
import common from 'components/mixins/detailCommon'
// 组件 引入
import RAction from 'components/RAction'
import workFlow from 'components/workFlow'
import PriceTotal from 'components/detail/commonPart/PriceTotal'
import MatterList from 'components/detail/commonPart/MatterList'
import MatterItem from 'components/detail/commonPart/MatterItem'
//公共方法引入
import {accAdd,accMul} from '@/home/pages/maps/decimalsAdd.js'
export default {
  data() {
    return {
      count: 0,          // 金额合计
      formViewUniqueId: '',
    }
  },
  components: {
    workFlow, RAction,PriceTotal,MatterList,MatterItem
  },
  mixins: [common],
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
      }).then(({success = true, formData = {},attachment = []}) => {
        // http200时提示报错信息
        if (success === false) {
          this.$vux.alert.show({
            content: '抱歉，数据有误，暂无法查看',
              onHide:()=>{
              this.$router.back();
            }
          })
          return;
        }
        let orderList = {};
        let {order = {}} = formData;
        this.attachment = attachment;
        // 获取合计
        let {dataSet} = formData.order;
        for (let item of dataSet) {
          item.tdAmount = accMul(item.tdQty,item.price)
          this.count = accAdd(this.count,item.tdAmount)
          item.inventoryPic = item.inventoryPic_transObjCode
            ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400`
            : this.getDefaultImg();
          item.transObjCode = item.inventoryCode_transObjCode;
          if (!orderList[item.transMatchedCode]) {
            orderList[item.transMatchedCode] = [];
          }
          orderList[item.transMatchedCode].push(item);
        }
        // this.count = (this.count/100).toFixed(2);
        this.orderList = orderList;
        // 获取合计
        // let {dataSet} = data.formData.order;
        // this.attachment = data.attachment;
        // dataSet.forEach(item=>{
        //   item.tdAmount = accMul(item.tdQty,item.price)
        //   this.count = accAdd(this.count,item.tdAmount);
        //   item.inventoryPic = item.inventoryPic_transObjCode
        //     ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400`
        //     : this.getDefaultImg();

        // })
        this.orderInfo = formData;
        this.workFlowInfoHandler();
      })

    },
  }
}
</script>

<style lang='scss' scoped>
  @import './../../scss/bizDetail';
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
    }
</style>
