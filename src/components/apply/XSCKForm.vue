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
            <span class="user_tel">{{warehouse.warehouseRelType}}</span>
          </div>
          <div class="cp_info">
            <p class="cp_name"></p>
            <span>{{warehouse.warehouseProvince}}{{warehouse.warehouseCity}}{{warehouse.warehouseDistrict}}{{warehouse.warehouseAddress}}</span>
          </div>
        </div>
        <div v-else>
          <div class="title">仓库列表</div>
          <div class="mode">请选择仓库</div>
        </div>
        <x-icon class="r_arrow" type="ios-arrow-right" size="20"></x-icon>
      </div>
      <!-- 结算方式 -->
      <pop-single-select title="结算方式" :data="transMode" :value="formData.drDealerPaymentTerm"
                         v-model="formData.drDealerPaymentTerm"></pop-single-select>
      <!-- 物流条款 -->
      <pop-single-select title="物流条款" :data="logisticsTerm" :value="formData.drDealerLogisticsTerms"
                         v-model="formData.drDealerLogisticsTerms"></pop-single-select>
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
                        :default-value="orderList" ref="order"></pop-order-list>
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
  import {getSOList} from 'service/detailService'
  import PopWarehouseList from 'components/PopWarehouseList'
  import PopOrderList from 'components/PopOrderList'
  import RAction from 'components/RAction'
  import applyCommon from 'components/mixins/applyCommon'
  import PopSingleSelect from 'components/PopSingleSelect'

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
      PopSingleSelect,
    },
    data() {
      return {
        srhInpTx: '',                                   // 搜索框内容
        orderList: [],                                  // 订单列表
        transMode: ['现付', '预付', '账期', '票据'],          // 结算方式
        logisticsTerm: ['上门', '自提', '离岸', '到港'],      // 物流条款
        showDealerPop: false,                          // 是否显示往来的popup
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
                oItem.tdId = item.tdId || '';
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
                drDealerLabel: this.dealerInfo.dealerLabelName || '客户', // 往来页签
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
            // this.saveData(operation,submitData);
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
      // 获取详情
      getFormData() {
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
              inventoryPic: item.inventoryPic_outPutMatCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_outPutMatCode}` : this.getDefaultImg(),
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
            drDealerLogisticsTerms: formData.drDealerLogisticsTerms,
            drDealerPaymentTerm: formData.drDealerPaymentTerm,
          };
          this.DealerPaymentTerm = formData.drDealerPaymentTerm;
          this.DealerLogisticsTerms = formData.drDealerLogisticsTerms;
          this.biReferenceId = formData.biReferenceId;
          this.orderList = dataSet;
        })
      },
    },
    created() {
    }
  }
</script>

<style lang='scss' scoped>
  @import './../scss/bizApply';

  .materiel_list .mater_list .each_mater_wrapper {
    flex-direction: column;
  }
</style>
