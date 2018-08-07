<template>
  <div class="pages">
    <div class="basicPart">
      <!-- 用户地址和基本信息-->
      <div class="or_ads mg_auto box_sd" @click="showDealerPop = !showDealerPop">
        <div v-if='dealerInfo.dealerName'>
          <div class="user_info" v-if="dealerInfo.creatorName">
            <span class="user_name">{{dealerInfo.creatorName || ''}}</span>
            <span class="user_tel">{{dealerInfo.dealerMobilePhone}}</span>
          </div>
          <div class="cp_info">
            <p class="cp_name">{{dealerInfo.dealerName}}</p>
            <p class="cp_ads">{{dealerInfo.province}}{{dealerInfo.city}}{{dealerInfo.county}}{{dealerInfo.address}}</p>
          </div>
        </div>
        <div v-else>
          <div class="title">往来列表</div>
          <div class="mode">请选择往来</div>
        </div>    
        <x-icon class="r_arrow" type="ios-arrow-right" size="20"></x-icon>
      </div>
      <div class="basicPart">
        <!-- 商机列表 -->
        <div class="materiel_list mg_auto box_sd">
          <!-- 没有选择商机 -->
          <div v-if="!CostList.length">
            <div @click="showMaterielPop = !showMaterielPop">
              <div class="title">商机列表</div>
              <div class="tips">请选择商机</div>
              <x-icon class="r_arrow" type="ios-arrow-right" size="20"></x-icon>
            </div>
          </div>
          <!-- 已经选择了商机 -->
          <div v-else>
            <div class="title">商机列表</div>
            <div class="mater_list">
              <div class="each_mater" v-for="(item, index) in CostList" :key='index'>
                <swipeout>
                  <swipeout-item>
                    <div slot="right-menu">
                      <swipeout-button @click.native="delClick(item, index)" type="warn">删除</swipeout-button>
                    </div>
                    <div class="each_mater_wrapper" slot="content">
                      <div class="mater_main">
                        <!-- 物料名称 -->
                        <div class="mater_name">
                          <span class="whiNum">标题</span>
                          {{item.opportunityTitle}}
                        </div>
                        <!-- 物料基本信息 -->
                        <div class="mater_info">
                          <!-- 物料编码、规格 -->
                          <div class="withColor">
                            <!-- 物料编码 -->
                            <div class="ForInline" style="display:inline-block">
                              <div class="mater_code">
                                <span class="title">编码</span>
                                <span class="num">{{item.dealerCode}}</span>
                              </div>
                            </div>
                            <!-- 物料规格 -->
                            <div class="ForInline" style="display:inline-block">
                              <div class="mater_spec">
                                <span class="title">类型</span>
                                <span class="num">{{item.categoryLabels || '无'}}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="userInp_mode">
                          <group>
                            <x-input  title="金额" text-align='right' placeholder='请填写'
                                    :value='item.tdAmount?item.tdAmount : "0" | numberComma(3)'
                                    @on-blur="getValue(item,$event)"></x-input>
                          </group>
                        </div>
                      </div>
                    </div>
                  </swipeout-item>
                </swipeout>
                <!-- 物料输入内容 -->
                
              </div>
            </div>
          </div>
          <!-- 新增更多 按钮 -->
          <!-- <div class="add_more" v-if="CostList.length" @click="addMatter">新增更多商机</div> -->
          <!-- 商机popup -->
          <pop-business-list :show="showMaterielPop" v-model="showMaterielPop" @sel-matter="selMatter"
                          ref="matter"></pop-business-list>
        </div>
      </div>
      <!-- 物料列表 -->
      <div class=" mg_auto box_sd">
        <!-- 往来popup -->
        <pop-dealer-list :show="showDealerPop" v-model="showDealerPop"
                         @sel-dealer="selDealer" :dealerLabelName="'2167'">
        </pop-dealer-list  ref="matter">
      </div>
    </div>
    <!-- 底部确认栏 -->
    <!-- <div class="count_mode vux-1px-t">
      <span class="count_num">
        <span style="fontSize:.14rem">￥</span>{{totalAmount}}
        <span class="taxAmount">[含税: ￥{{taxAmount}}]</span>
      </span>
      <span class="count_btn stop" @click="stopOrder"
            v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>终止</span>
      <span class="count_btn">提交订单</span>
    </div> -->
    <!-- 底部确认栏 -->
    <div class="count_mode vux-1px-t">
      <span class="count_num">
        <span style="fontSize:.14rem">￥</span>{{count | numberComma(3)}}
      </span>
      <span class="count_btn stop" @click="stopOrder" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>终止</span>
      <span class="count_btn" @click="submitOrder">提交订单</span>
    </div>
  </div>
</template>

<script>
  import {Popup,TransferDom,Cell ,Group,XInput, Swipeout, SwipeoutItem, SwipeoutButton,numberComma} from 'vux'
  import PopDealerList from 'components/PopDealerList'
  import {getBaseInfoData, saveAndStartWf, saveAndCommitTask,submitAndCalc} from 'service/commonService'
  import common from 'components/mixins/applyCommon.js'
  import PopBusinessList from 'components/PopBusinessList'

  export default {
    directives: {
      TransferDom
    },
    filters:{
      numberComma
    },
    components: {
      Popup,
      PopDealerList,
      Cell ,
      Group, 
      XInput,
      Swipeout,
      SwipeoutItem,
      SwipeoutButton,
      PopBusinessList,
    },
    data() {
      return {
        listId: 'a4897429-f4f2-44a4-ade7-2fe8dc67c3cf',
        showDealerPop: false,                          // 是否显示往来的popup
        dealerInfo: {},
        count: 0,   // 总价
        dealer: {
          drDealerPaymentTerm: '现付',  //结算方式
          drDealerLogisticsTerms: '上门', //物流条件
          biComment: '' //备注
        },
        numMap: {}, // 用于记录订单物料的数量和价格

        showMaterielPop :false,
        CostList: [],  // 物料列表
        transCode: '',
        formData: {
          biComment: ''
        },
        showPop: false,
        count : 0,
        tmp: '',
      }
    },
    computed: {
      // 合计金额
      totalAmount() {
        let total = 0;
        return total;
      },
      // 税金
      taxAmount() {
        return (this.totalAmount * 0.16).toFixed(2)
      },
    },
    mixins: [common],
    methods: {
      //选中的往来
      selDealer(val) {
        this.dealerInfo = JSON.parse(val)[0];
        this.dealer.dealerDebitContactPersonName = this.dealerInfo.creatorName || '';
        this.dealer.dealerDebitContactInformation = this.dealerInfo.dealerMobilePhone;
      },
            confirm(){
        this.showPop = false;
      },
      // TODO 滑动删除
      delClick(item, index) {
        let arr = this.CostList;
        arr.splice(index, 1);
      },
      // TODO 选中物料项
      selMatter(val) {
        this.CostList.length = 0;
        let sels = JSON.parse(val);
        this.CostList.push(sels[0]);
      },
      getValue(item,e){
        item.tdAmount = '';
        item.tdAmount = Number(e.split(',').join(''));
        this.count += item.tdAmount;

      },
      // TODO 提交
      submitOrder() {
        let warn = '';
        let dataSet = [];
        if (!warn && !this.CostList.length) {
          warn = '请选择费用';
        }
        this.CostList.every(item => {
          if (!item.tdAmount) {
            warn = '请输入报销金额';
            return false
          }
          // dataSet.push({
          //   costName_expCode: item.COST_NAME,
          //   expCode: item.COST_CODE,
          //   costType_expCode: item.COST_TYPE || null,
          //   tdAmount: item.tdAmount,
          //   comment : null
          // });
          return true
        });
        if (warn) {
          this.$vux.alert.show({
            content: warn,
          });
          return
        }
        this.$vux.confirm.show({
          content: '确认提交?',
          // 确定回调
          onConfirm: () => {
            let operation = submitAndCalc;
            let submitData = {
              listId: '32a2c333-02a3-416f-a133-95c7a32da678',
              biComment: '',
              formData:''
              // formData: JSON.stringify({
              //   ...this.formData,
              //   creator: this.transCode ? this.formData.handler : '',
              //   modifer: this.transCode ? this.formData.handler : '',
              //   order: {
              //     dealerDebit: this.formData.handler,
              //     dataSet
              //   }
              // }),
            };
            for(let i = 0 ; i<this.CostList.length ; i++){
              this.CostList[i].creator = this.transCode ? this.formData.handler : '',
              this.CostList[i].modifer = this.transCode ? this.formData.handler : '',
              this.CostList[i].dealerDebit = this.CostList[i].dealerCode,
              submitData.formData = JSON.stringify(Object.assign(this.formData, this.CostList[i]))
            }
            if (this.transCode) {
              operation = saveAndCommitTask
            }
            this.saveData(operation, submitData);
          }
        });
      },
      //修改数量
      // getNum(item, i, e) {
      //   let oldNum = item.tdQty;
      //   item.tdQty = Number(e.target.value);
      //   let total = item.tdQty * item.price;
      //   this.count = this.count - item.price * oldNum + total;
      // },
    },
    created() {
    }
  }
</script>

<style lang="scss" scoped>
  @import '../scss/bizApply.scss';
  // @import '~components/scss/bizDetail.scss';
  .weui-cell{
    padding: 10px 0;
    &:before{
      left:0;
    }
  }
  .pop-single-container {
    position: relative;
    margin: 10px auto;
    padding: .06rem .08rem;
    width: 95%;
    box-sizing: border-box;
    box-shadow: 0 0 8px #e8e8e8;
    .icon-gengduo {
      top: 50%;
      right: .1rem;
      font-size: .24rem;
      position: absolute;
      transform: translate(0, -50%);
    }
    .title {
      color: #757575;
      font-weight: 200;
      font-size: .12rem;
    }
    .mode {
      color: #111;
      font-weight: 500;
    }
  }

  /* 弹出框 */
  .trade_pop_part {
    background: #fff;
    .trade_pop {
      padding: 0 .08rem;
      // 顶部
      .title {
        font-size: .2rem;
        position: relative;
        padding: 0.08rem 0 .14rem;
        // 关闭icon
        .close_icon {
          top: 50%;
          right: -2%;
          position: absolute;
          transform: translate(0, -50%);
        }
      }
      .each_mode {
        margin-right: .1rem;
        margin-bottom : .1rem;
        display: inline-block;
        padding: .04rem .2rem;
        border: 1px solid #C7C7C7;
        border-radius: 40px;
      }
      .choiced {
        background: #5077aa;
        color: #fff;
      }
      .vux-1px:before {
        border-radius: 40px;
      }
    }
    // 确定
    .cfm_btn {
      left: 50%;
      bottom: 5%;
      width: 2.8rem;
      color: #fff;
      height: .44rem;
      line-height: .44rem;
      position: absolute;
      text-align: center;
      background: #5077aa;
      border-radius: .4rem;
      transform: translate(-50%, 0);
      box-shadow: 0 2px 12px #5077aa;
    }
  }
</style>