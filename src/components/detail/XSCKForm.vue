<template>
  <div class="pages">
    <div class="basicPart" v-if='orderInfo && orderInfo.outPut'>
      <!-- 工作流 -->
      <div class="work_flow mg_auto box_sd" @click="workFlowPop = true" :class="{hidden : simpleWL.length<=0}">
        <!-- 右箭头 -->
        <x-icon class="r_arrow" type="ios-arrow-down" size="30"></x-icon>
        <!-- 表单状态 及 编码 -->
        <div class="work_info">
          <!-- 状态 -->
          <span class="work_status"
                :class="orderInfo.dyClass">
                  {{orderInfo.biStatus}}
                </span>
          <!-- 编码 -->
          <span class="work_code"
                :class="orderInfo.coClass">
                  {{orderInfo.transCode.replace(/_/g,'')}}
                </span>
        </div>
        <!-- 简化版工作流 -->
        <div class="flow_list">
          <div class="each_msg vux-1px-b"
               v-for="(item, index) in simpleWL"
               :key=index>
            <!-- 头像 -->
            <div class="user_avatar">
              <img :src='index % 2 ? defaulImg2: defaulImg' alt="avatar">
            </div>
            <!-- 操作信息 -->
            <div class="handle_info">
              <div class="handle_name">
                <!-- 操作动作 -->
                <span>{{item.nodeName}}</span>
                <!-- 操作状态 A(没有返回状态) -->
                <span class="status"
                      v-if="!item.status && index % 2">
                        {{orderInfo.biStatus}}
                      </span>
                <!-- 操作状态 B(有返回状态) -->
                <span class="status"
                      :class=item.dyClass
                      v-else-if="item.status && index % 2">
                        {{item.status}}
                      </span>
              </div>
              <!-- 流程节点 用户名 -->
              <div class="user_name">
                {{item.userName}}
              </div>
              <!-- 备注 -->
              <div class="remark">备注: {{item.message || '无'}}</div>
            </div>
          </div>
        </div>
      </div>
      <!-- 用户地址和基本信息-->
      <div class="or_ads mg_auto box_sd">
        <div class="user_info">
          <span class="user_name">{{orderInfo.dealerDebitContactPersonName}}</span>
          <span class="user_tel">{{orderInfo.dealerDebitContactInformation}}</span>
        </div>
        <div class="cp_info">
          <p class="cp_name">{{orderInfo.outPut.dealerName_dealerDebit}}</p>
          <p class="cp_ads">
            {{orderInfo.outPut.province_dealerDebit}}{{orderInfo.outPut.city_dealerDebit}}{{orderInfo.outPut.county_dealerDebit}}{{orderInfo.outPut.address_dealerDebit}}</p>
        </div>
      </div>
      <div class="or_ads mg_auto box_sd">
        <div class="title">仓库</div>
        <div class="user_info">
          <span class="user_name">{{orderInfo.outPut.warehouseName_containerCodeOut}}</span>
          <span class="user_tel"></span>
        </div>
        <div class="cp_info">
          <p class="cp_name"></p>
          <p class="cp_ads"></p>
        </div>
      </div>
      <!-- 结算方式 -->
      <div class="trade_mode mg_auto box_sd">
        <p class="title">结算方式</p>
        <p class="mode">{{orderInfo.drDealerPaymentTerm || '无'}}</p>
      </div>
      <!-- 物流条款 -->
      <div class="trade_mode mg_auto box_sd" @click="showLogPop = !showLogPop">
        <p class="title">物流条款</p>
        <p class="mode">{{orderInfo.drDealerLogisticsTerms || '无'}}</p>
      </div>
      <!-- 物料列表 -->
      <div class="materiel_list mg_auto box_sd">
        <div class="title">物料列表</div>
        <div class="mater_list">
          <div class="each_mater vux-1px-b" v-for="(item, index) in orderInfo.outPut.dataSet" :key='index'>
            <div class="each_mater_wrapper">
              <div class="order-code">{{item.transMatchedCode}}</div>
              <div class="order-matter">
                <div class="mater_img">
                  <img :src="item.inventoryPic_outPutMatCode" alt="mater_img" @error="getDefaultImg(item)">
                </div>
                <div class="mater_main">
                  <!-- 物料名称 -->
                  <div class="mater_name">
                    {{item.inventoryName_transObjCode}}
                  </div>
                  <!-- 物料基本信息 -->
                  <div class="mater_info">
                    <!-- 物料编码、规格 -->
                    <div class="withColor">
                      <!-- 物料编码 -->
                      <div class="ForInline" style="display:inline-block">
                        <div class="mater_code">
                          <span class="title">编码</span>
                          <span class="num">{{item.inventoryCode_outPutMatCode}}</span>
                        </div>
                      </div>
                      <!-- 物料规格 -->
                      <div class="ForInline" style="display:inline-block">
                        <div class="mater_spec">
                          <span class="title">规格</span>
                          <span class="num">{{item.specification_transObjCode || '无'}}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 物料数量和价格 -->
                  <div class='mater_other'>
                    <div class='mater_num'>
                      <span class="num">单价: ￥{{item.price | numberComma(3)}}</span>
                      <span class='num'>数量: {{item.tdQty}}</span>
                      <span>税率: {{item.taxRate}}</span>
                    </div>
                    <div class='mater_price'>
                      ￥{{item.tdAmount | numberComma(3)}}
                      <span class="num"
                            :style="{display:(item.tdAmount && item.tdAmount.toString().length >= 7 ? 'block' : '')}">
                              [金额: ￥{{item.noTaxAmount | numberComma(3)}} + 税金: ￥{{item.taxAmount | numberComma(3)}}]
                            </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 金额合计栏 -->
          <div class="price_list">
            <div class='title'>合计<span style="fontSize:.12rem;">(含税)</span></div>
            <div class="num"><span style="fontSize:.12rem;">￥</span>{{count | numberComma(3)}}</div>
          </div>
        </div>
      </div>
      <!-- 审批操作 -->
      <div class="handle_btn" v-if="isMyTask || (cancelStatus && cancelStatus1)">
        <span class='reject' @click="taskCancel" v-if='cancelStatus && cancelStatus1'>撤回</span>
        <span class="reject" v-if='nodeName.indexOf("disagree")>=0 && (!cancelStatus ||!cancelStatus1)'
              @click="taskReject">拒绝</span>
        <span class="agree" v-if='nodeName.indexOf("agree")>=0' @click="taskAgree">同意</span>
      </div>
      <work-flow :popupShow="workFlowPop" v-model="workFlowPop" :noStatus="orderInfo.biStatus"></work-flow>
    </div>
  </div>
</template>

<script>
  import {numberComma} from 'vux'
  import {getSOList,} from 'service/detailService'
  import {saveAndCommitTask, commitTask} from 'service/commonService'
  import workFlow from 'components/workFlow'
  import detailCommon from 'components/mixins/detailCommon'

  export default {
    data() {
      return {
        count: 0,          // 金额合计
        fullWL: [],         // 完整版工作流
        simpleWL: [],       // 简化版工作流(只包含最后两个)
        orderInfo: {},      // 表单内容
        nodeName: '',        // 操作名称
        isMyTask: '',        // 是否与我有关
        formViewUniqueId: 'a8c58e16-48f5-454e-98d8-4f8f9066e513',
        defaulImg: require('assets/avatar.png'),   // 默认图片1
        defaulImg2: require('assets/io.jpg'),       // 默认图片2
        workFlowPop: false,
        comment: '',//审批备注
        submitInfo: {},
        taskId: '',
        userId: '',
        cancelStatus: false,
      }
    },
    mixins: [detailCommon],
    components: {
      workFlow,
    },
    filters: {
      numberComma
    },
    methods: {
      //选择默认图片
      getDefaultImg(item) {
        let url = require('assets/wl.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      //随机ID
      randomID() {
        function S4() {
          return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }

        return (S4() + S4() + S4());
      },
      // 获取详情
      getOrderList(transCode = '') {
        getSOList({
          formViewUniqueId: this.formViewUniqueId,
          transCode
        }).then(data => {
          this.submitInfo = JSON.parse(JSON.stringify(data));
          // http200时提示报错信息
          if (data.success === false) {
            this.$vux.alert.show({
              content: '抱歉，无法支持您查看的交易号，请确认交易号是否正确'
            })
            return;
          }
          // 获取合计
          let {dataSet} = data.formData.outPut;
          for (let val of dataSet) {
            this.count += val.tdAmount;
            val.inventoryPic_outPutMatCode = val.inventoryPic_outPutMatCode ? `/H_roleplay-si/ds/download?url=${val.inventoryPic_outPutMatCode}` : this.getDefaultImg();
          }
          // 动态添加class
          for (let key in data.formData) {
            switch (data.formData[key]) {
              case '进行中':
                let newkey = 'dyClass',
                  cokey = 'coClass';
                data.formData[newkey] = 'doing_work';
                data.formData[cokey] = 'doing_code';
                break;
              case '已失效':
                newkey = 'dyClass';
                data.formData[newkey] = 'invalid_work';
                break;
            }
          }
          this.orderInfo = data.formData;
        })
      },
    },
    created() {
    }
  }
</script>

<style lang='scss' scoped>
  @import './../scss/bizDetail';

  .materiel_list .mater_list .each_mater_wrapper {
    flex-direction: column;
  }
</style>
