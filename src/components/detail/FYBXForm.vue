<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>
      <div class="swiper-container">
        <!-- 如果需要分页器 -->
        <div class="swiper-pagination" v-if='HasValRealted'></div>
        <div class="swiper-wrapper">
          <div class="swiper-slide">
            <div class='related_tips' v-if='HasValRealted' @click="getSwiper">
              <span>其他应用里存在与本条相关联的数据，快去看看</span>
              <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
            </div>
            <!-- 经办信息 （订单、主体等） -->
            <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
            <!-- 项目信息 -->
            <project-part :project-info="orderInfo.order"></project-part>
            <!-- 工作流 -->
            <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                      :no-status="orderInfo.biStatus"></work-flow>
            <!-- <div class="trade_mode mg_auto box_sd">
              <p class="title">报销人</p>
              <p class="mode">{{orderInfo.creatorName }}</p>
            </div> -->
            <!-- 物料列表 -->
            <div class="materiel_list">
              <div class="title">
                <span class="iconfont icon-mingxi1"></span>
                <span>费用列表</span>
              </div>
              <div class="mater_list">
                <div class="each_mater" v-for="(item, index) in orderInfo.order.dataSet" :key='index'>
                  <div class="each_mater_wrapper">
                    <div class="mater_main">
                      <div class="which_part">第{{ index + 1 }}个</div>
                      <form-cell cellTitle='名称' :cellContent="item.costName_expCode" ></form-cell>
                      <form-cell cellTitle='申请金额' :cellContent="item.tdAmount | toFixed | numberComma(3)"></form-cell>
                      <form-cell cellTitle='报销事由' :cellContent="item.expCause"></form-cell>
                    </div>
                  </div>
                </div>
                <!-- 金额合计栏 -->
                <div class="price_list">
                  <div class='title'><span>合计</span></div>
                  <div class="num"><span style="fontSize:.12rem;">￥</span>{{count | toFixed | numberComma(3)}}</div>
                </div>
              </div>
            </div>
            <!-- 审批操作 -->
            <r-action :code="transCode" :task-id="taskId" :actions="actions" @on-submit-success="submitSuccessCallback"></r-action>
          </div>
          <div class="swiper-slide" v-if='HasValRealted'>
            <div class='related_apply'>
              <div class="big_title">
                <p class="vux-1px-b">相关实例</p>
              </div>
              <div class="relevant_list">
                <div class="each_app vux-1px-b" v-for='(item,index) in RelatedAppList' :key="index" @click="getRelatedData(item)">
                  <div class="app_info">
                    <div class="title">业务应用</div>
                    <div class="app_name">
                      <span>{{item.listName}}</span>
                    </div>
                    <div class="msg_num">
                      {{item.itemCount}}
                      <span class="msg_tx">关联</span>
                    </div>
                    <div class="r_arrow" v-if='item.itemCount>0'>
                      <x-icon type="ios-arrow-right" size="20" ></x-icon>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <pop-related-list :show='showPop' :listId='listId' :filter='filtersData' v-model='showPop' @reload-page='reloadPage'></pop-related-list>
      </div>
    </div>
  </div>
</template>

<script>
// vux组件引入
import { dateFormat } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
// mixins 引入
import detailCommon from 'components/mixins/detailCommon'
// 组件引入
// 组件 引入
import RAction from 'components/RAction'
import workFlow from 'components/workFlow'
import PopRelatedList from 'components/Popup/PopRelatedList'
import ProjectPart from 'components/detail/commonPart/Project'
//公共方法引入
import {accAdd} from '@/home/pages/maps/decimalsAdd.js'
export default {
  data() {
    return {
      count: 0,          // 金额合计
      formViewUniqueId: '7aa1ae41-77a0-4905-84b4-9fa09926be70'
    }
  },
  mixins: [detailCommon],
  components: {
    workFlow,RAction,PopRelatedList,ProjectPart
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
              onHide:()=>{
              this.$router.back();
            }
          });
          return;
        }
        // 获取合计
        let {dataSet} = data.formData.order;
        for (let val of dataSet) {
          this.count = accAdd(this.count,val.tdAmount);
        }
        data.formData.validUntil = dateFormat(data.formData.validUntil, 'YYYY-MM-DD');
        this.orderInfo = data.formData;
        this.workFlowInfoHandler();
      })
    }
  }
}
</script>

<style lang='scss' scoped>
  @import './../scss/bizDetail';
</style>
