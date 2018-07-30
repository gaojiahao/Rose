<template>
  <div class="pages">
    <div class="basicPart">
      <!-- 用户地址和基本信息-->
      <div class="or_ads mg_auto box_sd" @click="showDealerPop = !showDealerPop">
        <div v-if='dealerInfo'>
          <div class="user_info">
            <span class="user_name">{{dealerInfo.creatorName}}</span>
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
      <!-- 仓库-->
      <div class="or_ads mg_auto box_sd" @click="showWarehousePop = !showWarehousePop">
        <div v-if='warehouse'>
          <div class="title">仓库列表</div>
          <div class="user_info">
            <span class="user_name">{{warehouse.warehouseName}}</span>
            <span class="user_tel"></span>
          </div>
          <div class="cp_info">
            <p class="cp_name"></p>
            <!--<span>{{warehouse.warehouseRelType}}</span>-->
            <!--<span>{{warehouse.warehouseProvince}}{{warehouse.warehouseCity}}{{warehouse.warehouseDistrict}}{{warehouse.warehouseAddress}}</span>-->
          </div>
        </div>
        <div v-else>
          <div class="title">仓库列表</div>
          <div class="mode">请选择仓库</div>
        </div>
        <x-icon class="r_arrow" type="ios-arrow-right" size="20"></x-icon>
      </div>
      <!-- 结算方式 -->
      <div class="trade_mode mg_auto box_sd" @click="showTransPop = !showTransPop">
        <p class="title">结算方式</p>
        <p class="mode">{{formData.drDealerPaymentTerm}}</p>
        <span class="iconfont icon-gengduo"></span>
        <!-- 结算popup -->
        <div v-transfer-dom>
          <popup v-model="showTransPop" height="70%" id="trade_pop_part">
            <div class="trade_pop">
              <div class="title">结算方式
                <x-icon class="close_icon" type="ios-close-empty" size="30"
                        @click="showTransPop = !showTransPop"></x-icon>
              </div>
              <span class="each_mode"
                    :class="{choiced : item===DealerPaymentTerm}"
                    v-for="(item, index) in transMode"
                    :key="index"
                    @click="getPayment(item,index)">{{item}}</span>
            </div>
            <div class="cfm_btn" @click="submitPayment">确定</div>
          </popup>
        </div>
      </div>
      <!-- 物流条款 -->
      <div class="trade_mode mg_auto box_sd" @click="showLogPop = !showLogPop">
        <p class="title">物流条款</p>
        <p class="mode">{{formData.drDealerLogisticsTerms}}</p>
        <span class="iconfont icon-gengduo"></span>
        <!-- 结算popup -->
        <div v-transfer-dom>
          <popup v-model="showLogPop" height="60%" id="trade_pop_part">
            <div class="trade_pop">
              <div class="title">物流条款
                <x-icon class="close_icon" type="ios-close-empty" size="30" @click="showLogPop = !showLogPop"></x-icon>
              </div>
              <span class="each_mode"
                    :class="{choiced : item===DealerLogisticsTerms}"
                    v-for="(item, index) in logisticsTerm"
                    :key="index"
                    @click="getLogistics(item,index)">
               {{item}}</span>
            </div>
            <div class="cfm_btn" @click="submitLogistics">确定</div>
          </popup>
        </div>
      </div>
      <!-- 物料列表 -->
      <div class="materiel_list mg_auto box_sd">
        <!-- 没有选择物料 -->
        <template v-if="!orderList.length">
          <div @click="showOrderPop = !showOrderPop">
            <div class="title">订单列表</div>
            <div class="tips">请选择订单</div>
            <x-icon class="r_arrow" type="ios-arrow-right" size="20"></x-icon>
          </div>
        </template>
        <!-- 已经选择了物料 -->
        <template v-else>
          <div class="title">物料列表</div>
          <div class="mater_list">
            <div class="each_mater vux-1px-b" v-for="(item, index) in orderList" :key="index">
              <swipeout>
                <swipeout-item>
                  <div slot="right-menu">
                    <swipeout-button @click.native="delClick(index,item)" type="warn">删除</swipeout-button>
                  </div>
                  <div class="each_mater_wrapper" slot="content">
                    <div class="order-code">{{item.transMatchedCode}}</div>
                    <div class="order-matter">
                      <div class="mater_img">
                        <img :src="item.inventoryPic" alt="mater_img" @error="getDefaultImg(item)">
                      </div>
                      <div class="mater_main">
                        <!-- 物料名称 -->
                        <div class="mater_name">
                          <span class="whiNum">No.{{index + 1}}</span>
                          {{item.inventoryName}}
                        </div>
                        <!-- 物料基本信息 -->
                        <div class="mater_info">
                          <!-- 物料编码、规格 -->
                          <div class="withColor">
                            <!-- 物料编码 -->
                            <div class="ForInline" style="display:inline-block">
                              <div class="mater_code">
                                <span class="title">编码</span>
                                <span class="num">{{item.inventoryCode}}</span>
                              </div>
                            </div>
                            <!-- 物料规格 -->
                            <div class="ForInline" style="display:inline-block">
                              <div class="mater_spec">
                                <span class="title">规格</span>
                                <span class="num">{{item.specification || '无'}}</span>
                              </div>
                            </div>
                            <div class="matter-remain">库存: {{item.qtyStockBal - item.tdQty}}</div>
                          </div>
                        </div>
                        <!-- 物料数量和价格 -->
                        <div class="mater_other">
                          <div class="mater_price">
                            ￥{{item.price}}
                          </div>
                          <div class="mater_num">
                            <span class="handle" @click="subNum(item,index)"
                                  :class="{disabled : item.tdQty<=1}">-</span>
                            <input class="num" type="number" :value="item.tdQty" @change="getNum(item,index,$event)"/>
                            <span class="handle plus" @click="plusNum(item,index)"
                                  :class="{disabled:item.tdQty >= item.qtyStockBal}">+</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </swipeout-item>
              </swipeout>
            </div>
          </div>
        </template>
        <!-- 新增更多 按钮 -->
        <div class="add_more" v-if="orderList.length" @click="addOrder">新增更多订单</div>
        <!-- 往来popup -->
        <pop-dealer-list :show="showDealerPop" v-model="showDealerPop" @sel-dealer="selDealer"></pop-dealer-list>
        <!-- 仓库popup -->
        <pop-warehouse-list :show="showWarehousePop" v-model="showWarehousePop"
                            @sel-item="selWarehouse"></pop-warehouse-list>
        <!-- 订单popup -->
        <pop-order-list :show="showOrderPop" :params="orderParams" v-model="showOrderPop" @sel-matter="selOrder"
                        ref="order"></pop-order-list>
      </div>
      <!--<r-action :code="transCode" @on-resubmit="submitOrder" @on-stop="stop"></r-action>-->
    </div>
    <!-- 底部确认栏 -->
    <div class="count_mode vux-1px-t">
      <span class="count_num">
        <span style="fontSize:.14rem">￥</span>{{totalAmount}}
        <span class="taxAmount">[含税: ￥{{taxAmount}}]</span>
      </span>
      <span class="count_btn stop" @click="stopOrder" v-if="this.actions.includes('stop')">终止</span>
      <span class="count_btn" @click="submitOrder">提交订单</span>
    </div>
  </div>
</template>

<script>
  import {
    Icon,
    Cell,
    Popup,
    Group,
    XInput,
    Swipeout,
    SwipeoutItem,
    SwipeoutButton,
    TransferDom
  } from 'vux'
  import PopDealerList from 'components/PopDealerList'
  import {saveAndStartWf, getBaseInfoData, saveAndCommitTask, commitTask,} from 'service/commonService'
  import {getSOList, getWorkFlow, isMyflow} from 'service/detailService'
  import PopWarehouseList from 'components/PopWarehouseList'
  import PopOrderList from 'components/PopOrderList'
  import RAction from 'components/RAction'
  import applyCommon from 'components/mixins/applyCommon'

  export default {
    name: 'ApplyXSCKForm',
    mixins: [applyCommon],
    directives: {
      TransferDom
    },
    components: {
      Icon,
      Cell,
      Popup,
      Group,
      XInput,
      Swipeout,
      SwipeoutItem,
      SwipeoutButton,
      PopDealerList,
      PopWarehouseList,
      PopOrderList,
      RAction,
    },
    data() {
      return {
        srhInpTx: '',                                   // 搜索框内容
        orderList: [],                                  // 订单列表
        DealerPaymentTerm: '现付',                        //结算方式
        DealerLogisticsTerms: '上门',                      //物流方式
        transMode: ['现付', '预付', '账期', '票据'],          // 结算方式
        logisticsTerm: ['上门', '自提', '离岸', '到港'],      // 物流条款
        showDealerPop: false,                          // 是否显示往来的popup
        showLogPop: false,                              // 是否显示物流条款的popup
        showTransPop: false,                            // 是否显示结算方式的popup
        showOrderPop: false,                         // 是否显示物料的popup
        dealerInfo: null, // 往来客户信息
        formData: {
          drDealerPaymentTerm: '现付',  //结算方式
          drDealerLogisticsTerms: '上门', //物流条件
          biComment: '' //备注
        },
        submitSuccess: false, // 是否提交成功
        showWarehousePop: false,
        warehouse: null, // 选中仓库属性
        taxRate: 0.16, // 税率
        numMap: {}, // 用于记录订单物料的数量
        orderParams: {
          dealerCode: '',
          whCode: '',
        },
        transCode: '',
        formViewUniqueId: '346ede09-ac6a-489a-9242-f385932a4443', // 修改时的UniqueId
        biReferenceId: '',
        actions: [],
        taskId: '',
      }
    },
    computed: {
      // 合计金额
      totalAmount() {
        let total = 0;
        this.orderList.forEach(item => {
          total += item.tdQty * item.price;
        });
        return total;
      },
      // 税金
      taxAmount() {
        return (this.totalAmount * this.taxRate).toFixed(2)
      },
    },
    methods: {
      // TODO 选择结算方式
      getPayment(item, i) {
        this.DealerPaymentTerm = item;
      },
      // TODO 确定结算方式
      submitPayment() {
        this.formData.drDealerPaymentTerm = this.DealerPaymentTerm;
        this.showTransPop = false;
      },
      // TODO 选择物流方式
      getLogistics(item, i) {
        this.DealerLogisticsTerms = item;
      },
      // TODO 确定物流方式
      submitLogistics() {
        this.formData.drDealerLogisticsTerms = this.DealerLogisticsTerms;
        this.showLogPop = false;
      },
      // TODO 选中的往来
      selDealer(val) {
        let [sel] = JSON.parse(val);
        this.dealerInfo = sel;
        this.orderParams = {
          ...this.orderParams,
          dealerCode: sel.dealerCode
        };
        this.orderList = [];
        this.$refs.order.clearSel();
      },
      // TODO 选中仓库
      selWarehouse(val) {
        this.warehouse = JSON.parse(val);
        this.orderParams = {
          ...this.orderParams,
          whCode: this.warehouse.warehouseCode
        };
        this.orderList = [];
        this.$refs.order.clearSel();
      },
      // TODO 选中物料项
      selOrder(val) {
        let sels = JSON.parse(val);
        sels.forEach(item => {
          if (this.numMap[item.inventoryCode]) {
            item.tdQty = this.numMap[item.inventoryCode].tdQty;
            item.price = this.numMap[item.inventoryCode].price;
          } else {
            item.tdQty = 1;
            item.price = 90;
          }
        });
        this.numMap = {};
        this.orderList = sels;
      },
      // TODO 选择默认图片
      getDefaultImg(item) {
        let url = require('assets/wl.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // TODO 滑动删除
      delClick(index, item) {
        let arr = this.orderList;
        arr.splice(index, 1);
        this.$refs.order.delSelItem(item);
      },
      // TODO 数量--
      subNum(item, i) {
        if (item.tdQty === 1) {
          return
        }
        item.tdQty--;
        this.$set(this.orderList, i, item);
      },
      // TODO 数量++
      plusNum(item, i) {
        if (item.tdQty === item.qtyStockBal) {
          return
        }
        item.tdQty++;
        this.$set(this.orderList, i, item);
      },
      // TODO 修改数量
      getNum(item, i, e) {
        let val = e.target.value;
        if (val > item.qtyStockBal) {
          val = item.qtyStockBal;
        }
        item.tdQty = Number(val);
        this.$set(this.orderList, i, item);
      },
      // TODO 新增更多订单
      addOrder() {
        this.orderList.forEach(item => {
          // 存储已输入的价格
          this.numMap[item.inventoryCode] = {
            tdQty: item.tdQty,
            price: item.price
          };
        });
        this.showOrderPop = !this.showOrderPop;
      },
      // TODO 提价订单
      submitOrder() {
        let warn = '';
        let validateMap = [
          {
            key: 'dealerInfo',
            message: '往来信息'
          },
          {
            key: 'warehouse',
            message: '仓库'
          },
        ];
        validateMap.every(item => {
          if (!this[item.key]) {
            warn = `请选择${item.message}`;
            return false
          }
          return true
        });
        if (!warn && !this.orderList.length) {
          warn = '请选择物料'
        }
        if (warn) {
          this.$vux.alert.show({
            content: warn
          });
          return
        }
        this.$vux.confirm.show({
          content: '确认提交?',
          // 确定回调
          onConfirm: () => {
            let dataSet = [];
            let operation = saveAndStartWf;
            let formData = {};
            let wfPara = {
              PROC_1710_0460: {
                businessKey: 'SODL',
                createdBy: ''
              }
            };
            // 组装dataSet
            this.orderList.forEach(item => {
              let oItem = {
                transMatchedCode: item.transMatchedCode, // 明细被核销交易号
                orderCode: item.transMatchedCode, // 销售订单号（明细）
                outPutMatCode: item.inventoryCode, // 输出物料
                orderProCode: item.inventoryCode, // 销售订单产品编码（明细）
                assMeasureUnit: item.assMeasureUnit !== undefined ? item.assMeasureUnit : null, // 辅助计量（明细）
                assMeasureScale: item.assMeasureScale !== undefined ? item.assMeasureScale : null,  //与主计量单位倍数
                tdQty: item.tdQty, // 明细发生数
                assistQty: item.assistQty || 0, // 辅计数量（明细）
                thenQtyStock: item.qtyStockBal, // 当时可用库存
                thenQtyBal: item.qtyBal, // 待交付数量
                price: item.price, // 明细单价
                taxRate: this.taxRate, // 税率
                taxAmount: this.taxAmount, // 税金
                tdAmount: item.price * item.tdQty * (100 + 16) / 100, // 明细发生金额
                promDeliTime: item.promDeliTime || '', // 承诺交付时间
                comment: "", // 说明
              };
              if (this.transCode) {
                oItem.tdId = item.tdId;
              }
              dataSet.push(oItem);
            });
            formData = {
              ...this.formData,
              modifer: this.transCode ? this.formData.handler : '',
              dealerDebitContactPersonName: this.dealerInfo.creatorName || '', // 联系人姓名
              dealerDebitContactInformation: this.dealerInfo.dealerMobilePhone || '', // 联系人手机
              containerOutWarehouseManager: null,
              outPut: {
                dealerDebit: this.dealerInfo.dealerCode, // 往来编码
                drAccountSub: this.dealerInfo.dealerLabelName || '客户', // 往来页签
                containerCodeOut: this.warehouse.warehouseCode, // 仓库编码
                dataSet
              }
            };
            // 重新提交
            if (this.transCode) {
              operation = saveAndCommitTask;
              wfPara = {
                businessKey: this.transCode,
                createdBy: this.formData.handler,
                transCode: this.transCode,
                result: 3,
                taskId: this.taskId,
                comment: ''
              };
            }
            let submitData = {
              listId: 'a1e8592f-63c2-4a31-ba22-9d654484db1d',
              biComment: '',
              biReferenceId: this.biReferenceId,
              formData: JSON.stringify(formData),
              wfPara: JSON.stringify(wfPara)
            };
            if (!this.transCode) {
              delete submitData.biReferenceId
            }
            console.log(submitData)
            operation(submitData).then(data => {
              //this.showLoading = false;
              let {success = false, message = '提交失败'} = data;
              if (success) {
                message = '订单提交成功';
                this.$emit('change', true);
              }
              this.$vux.alert.show({
                content: message,
                onHide: () => {
                  if (success) {
                    this.$router.go(-1);
                  }
                }
              });
            })
          }
        })
      },
      // TODO 终止订单
      stop() {
        this.$vux.confirm.prompt('', {
          title: '终止原因',
          onConfirm: (value) => {
            if (value) {
              this.comment = value;
            }
            let submitData = {
              taskId: this.taskId,
              taskData: JSON.stringify({
                result: -1,
                transCode: this.transCode,
                comment: value
              })
            };
            commitTask(submitData).then(data => {
              let {success = false, message = '提交失败'} = data;
              if (success) {
                message = '终止成功';
                this.$emit('change', true);
              }
              this.$vux.alert.show({
                content: message,
                onHide: () => {
                  if (success) {
                    this.$router.go(-1);
                  }
                }
              });
            })
          }
        });
      },
      // TODO 获取用户基本信息
      getBaseInfoData() {
        getBaseInfoData().then(data => {
          this.formData = {
            ...this.formData,
            ...data,
          };
        })
      },
      // 获取详情
      getOrderList() {
        return getSOList({
          formViewUniqueId: this.formViewUniqueId,
          transCode: this.transCode
        }).then(data => {
          let {success = true, formData = {}} = data;
          // http200时提示报错信息
          if (!success) {
            this.$vux.alert.show({
              content: '抱歉，无法支持您查看的交易号，请确认交易号是否正确'
            });
            return;
          }
          // 获取合计
          let {outPut, dealerDebit} = formData;
          let {dataSet = []} = outPut;
          dataSet = dataSet.map(item => {
            return {
              ...item,
              qtyBal: item.thenQtyBal,
              qtyStockBal: item.thenQtyStock,
              inventoryPic: item.inventoryPic ? `/H_roleplay-si/ds/download?url=${item.inventoryPic}` : this.getDefaultImg(),
              inventoryName: item.inventoryName_outPutMatCode,
              inventoryCode: item.outPutMatCode,
              specification: item.specification_outPutMatCode,
            };
          });
          this.dealerInfo = {
            creatorName: formData.dealerDebitContactPersonName,
            dealerName: outPut.dealerName_dealerDebit,
            dealerMobilePhone: formData.dealerDebitContactInformation,
            dealerCode: outPut.dealerDebit,
          };
          this.orderParams = {
            dealerCode: outPut.dealerDebit,
            whCode: outPut.warehouseCode_containerCodeOut,
          };
          this.warehouse = {
            warehouseName: outPut.warehouseName_containerCodeOut,
            warehouseCode: outPut.warehouseCode_containerCodeOut,
          };
          this.formData = {
            ...this.formData,
            handler: formData.handler,
            handlerName: formData.handlerName,
            handlerUnit: formData.handlerUnit,
            handlerUnitName: formData.handlerUnitName,
            handlerRole: formData.handlerRole,
            handlerRoleName: formData.handlerRoleName,
            drDealerLogisticsTerms: formData.drDealerLogisticsTerms,
            drDealerPaymentTerm: formData.drDealerPaymentTerm,
          };
          this.DealerPaymentTerm = formData.drDealerPaymentTerm;
          this.DealerLogisticsTerms = formData.drDealerLogisticsTerms;
          this.biReferenceId = formData.biReferenceId;
          this.orderList = dataSet;
        })
      },
      // 流程节点是否与<我>有关
      isMyflow() {
        return isMyflow({
          _dc: Date.now(),
          transCode: this.transCode,
        }).then(({tableContent = []}) => {
          let [action = {}] = tableContent;
          let {actions = '', isMyTask = 0, taskId} = action;
          this.actions = actions.split(',');
          this.taskId = taskId;
          console.log(this.taskId)
        })
      },
    },
    created() {
      let {transCode} = this.$route.query;
      if (transCode.indexOf('SODL') !== -1) {
        this.transCode = transCode;
        this.isMyflow();
        this.getOrderList();
      } else {
        this.getBaseInfoData();
      }
    }
  }
</script>

<style lang='scss' scoped>
  // 居中
  .mg_auto {
    width: 95%;
    margin: 10px auto;
  }

  // 阴影
  .box_sd {
    box-sizing: border-box;
    box-shadow: 0 0 8px #e8e8e8;
  }

  .basicPart {
    overflow: auto;
    height: 93%;
  }

  // 地址栏
  .or_ads {
    position: relative;
    padding: .06rem .4rem .06rem .08rem;
    .title {
      color: #757575;
      font-weight: 200;
      font-size: .12rem;
    }
    .mode {
      color: #111;
      font-weight: 500;
    }
    .r_arrow {
      top: 50%;
      right: .04rem;
      position: absolute;
      transform: translate(0, -50%);
    }
    // 用户信息
    .user_info {
      color: #111;
      font-size: .2rem;
      font-weight: 500;
      // 用户姓名
      .user_name {
        margin-right: .08rem;
      }
      // 用户电话
      .user_tel {
        font-family: sans-serif, -apple-system-font;
      }
    }
    // 公司信息
    .cp_info {
      .cp_name {
        color: #111;
        font-weight: 500;
      }
      .cp_ads {
        font-weight: 200;
        color: #757575;
      }
    }
  }

  // 结算方式
  .trade_mode {
    position: relative;
    padding: .06rem .08rem;
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

  // 物料列表
  .materiel_list {
    position: relative;
    padding: .06rem .08rem;
    .title {
      color: #757575;
      font-weight: 200;
      font-size: .12rem;
    }
    .tips {
      color: #111;
      font-weight: 500;
    }
    // 右箭头
    .r_arrow {
      top: 50%;
      right: .04rem;
      position: absolute;
      transform: translate(0, -50%);
    }
    // 物料列表
    .mater_list {
      width: 100%;
      box-sizing: border-box;
      .vux-1px-b:after {
        border-bottom: 1px solid #e8e8e8;
      }
      // 每个物料
      .each_mater {
        padding: 0.08rem;
        position: relative;
        margin-bottom: .2rem;
        box-sizing: border-box;
        .each_mater_wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          .order-code {
            font-size: .14rem;
          }
          .order-matter {
            display: flex;
            margin-top: .1rem;
          }
          // 物料图片
          .mater_img {
            display: inline-block;
            width: .75rem;
            height: .75rem;
            img {
              width: 100%;
              max-height: 100%;
            }
          }
          // 物料主体
          .mater_main {
            flex: 1;
            padding-left: .1rem;
            box-sizing: border-box;
            display: inline-block;
            // 物料名称
            .mater_name {
              color: #111;
              overflow: hidden;
              font-size: .14rem;
              font-weight: bold;
              max-height: .46rem;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              text-overflow: ellipsis;
              -webkit-box-orient: vertical;
              // 每个物料的索引
              .whiNum {
                color: #fff;
                font-weight: 200;
                padding: 0 .1rem;
                font-size: .1rem;
                display: inline-block;
                background: #ea5455;
                vertical-align: middle;
                margin: -.01rem .04rem 0 0;
              }
            }
            // 物料信息
            .mater_info {
              color: #757575;
              font-size: .12rem;
              // 有颜色包裹的
              .withColor {
                // 物料编码
                .mater_code {
                  display: flex;
                  .title,
                  .num {
                    font-size: .1rem;
                    display: inline-block;
                    padding: .01rem .04rem;
                  }
                  .title {
                    color: #fff;
                    background: #3f72af;
                  }
                  .num {
                    color: #111;
                    max-width: .9rem;
                    overflow: hidden;
                    white-space: nowrap;
                    background: #dbe2ef;
                    text-overflow: ellipsis;
                  }
                }
                // 规格
                .mater_spec {
                  @extend .mater_code;
                  margin-left: .1rem;
                  .title {
                    color: #fff;
                    background: #537791;
                  }
                  .num {
                    color: #fff;
                    max-width: .6rem;
                    overflow: hidden;
                    white-space: nowrap;
                    background: #ff7f50;
                    text-overflow: ellipsis;
                  }
                }
              }
              // 没颜色包裹的
              .withoutColor {
                // 物料分类
                .mater_classify {
                  // color: #111;
                  // font-weight: bold;
                  font-size: .14rem;
                  margin-top: .04rem;
                  .father {
                    margin-right: .1rem;
                  }
                }
                // 物料颜色 材质
                .mater_material {
                  font-size: .12rem;
                  margin-top: .1rem;
                  .unit,
                  .color {
                    margin-right: .06rem;
                  }
                }
              }
            }
            //物料价格，数量
            .mater_other {
              margin-top: 0.08rem;
              align-items: center;
              .mater_price {
                display: inline-block;
                font-weight: bold;
                font-size: 0.16rem;
                line-height: 0.2rem;
                color: #ea5455;
                margin-right: 0.9rem;
              }
              .mater_num {
                display: flex;
                // justify-content: flex-start;
                float: right;
                input {
                  border: none;
                  outline: none;
                }
                .handle {
                  display: inline-block;
                  width: 0.2rem;
                  height: 0.2rem;
                  text-align: center;
                  line-height: 0.2rem;
                  font-size: .18rem;
                }
                .disabled {
                  color: #eee;
                }
                .plus {
                  vertical-align: middle;
                  margin-top: -.01rem;
                }
                .num {
                  width: 0.4rem;
                  height: 0.2rem;
                  background: #e8e8e8;
                  text-align: center;
                  line-height: 0.2rem;
                  font-size: 0.12rem;
                  border-radius: 0 !important;
                }
              }
            }
          }
          // 下划线
          .vux-1px-b:after {
            border-bottom: 1px solid #e8e8e8;
          }
        }
      }
    }
    // 新增更多
    .add_more {
      width: 1rem;
      color: #fff;
      height: .24rem;
      font-size: .12rem;
      text-align: center;
      line-height: .24rem;
      margin: 0 auto .1rem;
      border-radius: .4rem;
      background: #5077aa;
      box-shadow: 0 2px 5px #5077aa;
    }
  }

  #trade_pop_part {
    background: #fff;
    .trade_pop {
      padding: 0 .08rem;
      // 顶部
      .title {
        font-size: .2rem;
        position: relative;
        padding: 0.08rem 0 .14rem;
        // 搜索
        .search_part {
          width: 100%;
          display: flex;
          height: .3rem;
          line-height: .3rem;
          position: relative;
          // 搜索输入框
          .srh_inp {
            flex: 5;
            outline: none;
            border: none;
            color: #2D2D2D;
            font-size: .16rem;
            padding: 0 .3rem 0 .4rem;
            background: #F3F1F2;
            border-top-left-radius: .3rem;
            border-bottom-left-radius: .3rem;
          }
          // 取消 按钮
          .pop_cancel {
            flex: 1;
            color: #fff;
            font-size: .14rem;
            text-align: center;
            background: #fc3c3c;
            border-top-right-radius: .3rem;
            border-bottom-right-radius: .3rem;
          }
          // 搜索icon
          .serach_icon {
            top: 50%;
            left: 10px;
            fill: #2D2D2D;
            position: absolute;
            transform: translate(0, -50%);
          }
          // 清除icon
          .clear_icon {
            top: 50%;
            right: 14%;
            width: .3rem;
            height: .3rem;
            z-index: 100;
            display: block;
            font-size: .12rem;
            line-height: .3rem;
            text-align: center;
            position: absolute;
            transform: translate(0, -50%);
          }
        }
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

  // 底部栏
  .count_mode {
    left: 0;
    bottom: 0;
    width: 100%;
    display: flex;
    height: .44rem;
    position: fixed;
    line-height: .44rem;
    background: #fff;
    .count_num {
      flex: 2.5;
      color: #5077aa;
      font-size: .24rem;
      padding-left: .1rem;
      .taxAmount {
        color: #757575;
        font-size: .1rem;
        display: inline-block;
      }
    }
    .count_btn {
      flex: 1.5;
      color: #fff;
      text-align: center;
      background: #5077aa;
      &.stop {
        background: #ea5455;
      }
    }
  }

  .vux-1px-t:before {
    border-top: 1px solid #e8e8e8;
  }

</style>
