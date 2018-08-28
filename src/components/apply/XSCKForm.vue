<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <!-- 经办主体 -->
        <pop-entity-list :value="entity" v-model="entity"></pop-entity-list>
        <!-- 用户地址和基本信息-->
        <div class="or_ads mg_auto box_sd" @click="showDealerPop = !showDealerPop">
          <div v-if='dealerInfo'>
            <div class="user_info">
              <span class="user_name">{{dealerInfo.dealerName || ''}}</span>
            </div>
            <div class="cp_info">
              <span class="user_tel" v-if="dealerInfo.dealerMobilePhone">{{dealerInfo.dealerMobilePhone}}</span>
              <span class="user_tel" v-if="dealerInfo.dealerPhone">{{dealerInfo.dealerPhone}}</span>
              <p class="cp_ads">
                {{dealerInfo.province}}{{dealerInfo.city}}{{dealerInfo.county}}{{dealerInfo.address}}</p>
            </div>
          </div>
          <div v-else>
            <div class="title">客户列表</div>
            <div class="mode">请选择客户</div>
          </div>
          <x-icon class="r_arrow" type="ios-arrow-right" size="20"></x-icon>
        </div>

        <!-- 仓库-->
        <pop-warehouse-list :default-value="warehouse" @sel-item="selWarehouse"></pop-warehouse-list>

        <!-- 结算方式 -->
        <pop-single-select title="结算方式" :data="transMode" :value="drDealerPaymentTerm"
                           v-model="drDealerPaymentTerm"></pop-single-select>
        <!-- 物流条款 -->
        <pop-single-select title="物流条款" :data="logisticsTerm" :value="formData.drDealerLogisticsTerms"
                           v-model="formData.drDealerLogisticsTerms"></pop-single-select>
        <!-- 项目 -->
        <pop-sodl-projectList :value="project" v-model="project"></pop-sodl-projectList>
        <!-- 物料列表 -->
        <div class="materiel_list mg_auto box_sd">
          <!-- 没有选择物料 -->
          <template v-if="!Object.keys(orderList).length">
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
              <div class="each_mater vux-1px-b" v-for="(oItem, key) in orderList" :key="key">
                <div class="order_code">
                  <span class="order_title">所属订单</span>
                  <span class="order_num">{{key.replace(/_/g,'')}}</span>
                </div>
                <swipeout v-for="(item, index) in oItem" :key="index">
                  <swipeout-item>
                    <div slot="right-menu">
                      <swipeout-button @click.native="delClick(index,item, key)" type="warn">删除</swipeout-button>
                    </div>
                    <div class="each_mater_wrapper" slot="content">
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
                              <div class="matter-remain">库存: {{item.qtyStockBal}}</div>
                            </div>
                          </div>
                          <!-- 物料数量和价格 -->
                          <div class="mater_other">
                            <div class="mater_price">
                              ￥{{item.price | numberComma}}
                            </div>
                            <r-number :num="item.tdQty" :max="item.qtyStockBal" v-model="item.tdQty"></r-number>
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
          <!-- <div class="add_more" v-if="Object.keys(orderList).length" @click="addOrder">新增更多订单</div> -->
          <div class="handle_part" v-if="Object.keys(orderList).length">
            <span class="add_more stop" v-if="this.actions.includes('stop')"
                  @click="stopOrder">终止提交</span>
            <span class="symbol" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>或</span>
            <span class="add_more" @click="addOrder">新增更多物料</span>
          </div>
          <!-- 客户popup -->
          <pop-dealer-list :show="showDealerPop" v-model="showDealerPop"
                           @sel-dealer="selDealer" @closePop='showDealerPop = !showDealerPop'></pop-dealer-list>
          <!-- 订单popup -->
          <pop-order-list :show="showOrderPop" :params="orderParams" v-model="showOrderPop" @sel-matter="selOrder"
                          :default-value="orderList" ref="order"></pop-order-list>
        </div>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class="count_mode vux-1px-t">
      <span class="count_num">
        <span style="fontSize:.14rem">￥</span>{{tdAmount | numberComma}}
        <span class="taxAmount">[含税: ￥{{taxAmount | numberComma}}]</span>
      </span>
      <!-- <span class="count_btn stop" @click="stopOrder" v-if="this.actions.includes('stop')">终止</span> -->
      <span class="count_btn" @click="submitOrder">提交</span>
    </div>
  </div>
</template>

<script>
  // vux组件引入
  import {
    Icon, Cell, Popup, Group, XInput,
    Swipeout, SwipeoutItem, SwipeoutButton, TransferDom,
  } from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  import {commitTask, saveAndStartWf, getBaseInfoData, saveAndCommitTask} from 'service/commonService'
  // mixins 引入
  import applyCommon from 'components/mixins/applyCommon'
  // 组件引入
  import RAction from 'components/RAction'
  import RNumber from 'components/RNumber'
  import PopDealerList from 'components/Popup/PopDealerList'
  import PopOrderList from 'components/Popup/PopOrderList'
  import PopSingleSelect from 'components/Popup/PopSingleSelect'
  import PopWarehouseList from 'components/Popup/PopWarehouseList'
  import PopSodlProjectList from 'components/Popup/PopSODLProjectList'
  import PopEntityList from 'components/Popup/PopEntityList'
  // 公共方法
  import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd'
  import {toFixed} from '@/plugins/calc'

  export default {
    name: 'ApplyXSCKForm',
    mixins: [applyCommon],
    directives: {TransferDom},
    components: {
      Icon, Cell, Popup, Group,
      XInput, RAction, RNumber, Swipeout,
      PopOrderList, SwipeoutItem, PopDealerList,
      SwipeoutButton, PopSingleSelect, PopWarehouseList,
      PopSodlProjectList, PopEntityList,
    },
    data() {
      return {
        listId: 'a1e8592f-63c2-4a31-ba22-9d654484db1d',
        orderList: {},                                  // 订单列表
        transMode: ['现付', '预付', '账期', '票据'],          // 结算方式
        logisticsTerm: ['上门', '自提', '离岸', '到港'],      // 物流条款
        showDealerPop: false,                          // 是否显示客户的popup
        showOrderPop: false,                         // 是否显示物料的popup
        dealerInfo: null, // 客户客户信息
        drDealerPaymentTerm: '现付',  //结算方式
        formData: {
          drDealerLogisticsTerms: '上门', //物流条件
          biComment: '' //备注
        },
        submitSuccess: false, // 是否提交成功
        warehouse: null, // 选中仓库属性
        taxRate: 0.16, // 税率
        numMap: {}, // 用于记录订单物料的数量和价格
        orderParams: { // 订单列表查询参数
          dealerCode: '',
          whCode: '',
        },
        transCode: '',
        formViewUniqueId: '346ede09-ac6a-489a-9242-f385932a4443', // 修改时的UniqueId
        biReferenceId: '',
        actions: [],
        taskId: '',
        matterList: [], // 物料列表，用于计算金额、请求单价
        project: {}, // 项目
        entity: {}, // 经办主体
      }
    },
    watch: {
      orderList(val) {
        let arr = Object.keys(val);
        if (arr.length) {
          console.log(val);
          let data = {
            XSCK_DATA: {
              orderList: this.orderList,
              warehouse: this.warehouse,
              dealer: this.dealerInfo
            }
          }
          this.$emit('sel-data', data)
        }
      }

    },
    methods: {
      // TODO 选中的客户
      selDealer(val) {
        let [sel] = JSON.parse(val);
        this.dealerInfo = sel;
        this.orderParams = {
          ...this.orderParams,
          dealerCode: sel.dealerCode
        };
        this.orderList = {};
        this.$refs.order.clearSel();
        this.getMatPrice();
      },
      // TODO 选中仓库
      selWarehouse(val) {
        this.warehouse = JSON.parse(val);
        this.orderParams = {
          ...this.orderParams,
          whCode: this.warehouse.warehouseCode
        };
        this.orderList = {};
        this.$refs.order.clearSel();
      },
      // TODO 选中物料项
      selOrder(val) {
        let sels = JSON.parse(val);
        let orderList = {};
        sels.forEach(item => {
          let key = `${item.transCode}_${item.inventoryCode}`;
          if (this.numMap[key]) {
            item.tdQty = this.numMap[key].tdQty;
            item.price = this.numMap[key].price;
          } else {
            item.tdQty = 1;
            item.price = 0;
          }
          if (!orderList[item.transCode]) {
            orderList[item.transCode] = [];
          }
          orderList[item.transCode].push(item);
        });
        this.numMap = {};
        this.matterList = sels;
        this.orderList = orderList;
        this.getMatPrice();
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
      delClick(index, item, key) {
        let arr = this.orderList[key];
        arr.splice(index, 1);
        if (!arr.length) {
          delete this.orderList[key];
        }
        this.$refs.order.delSelItem(item);
      },
      // TODO 新增更多订单
      addOrder() {
        for (let items of Object.values(this.orderList)) {
          for (let item of items) {
            // 存储已输入的价格
            this.numMap[`${item.transCode}_${item.inventoryCode}`] = {
              tdQty: item.tdQty,
              price: item.price
            };
          }
        }
        this.showOrderPop = !this.showOrderPop;
      },
      // TODO 提价订单
      submitOrder() {
        let warn = '';
        let validateMap = [
          {
            key: 'dealerInfo',
            message: '客户信息'
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
        if (!warn && !Object.keys(this.orderList).length) {
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
              [this.processCode]: {
                businessKey: 'SODL',
                createdBy: ''
              }
            };
            // 组装dataSet
            for (let items of Object.values(this.orderList)) {
              for (let item of items) {
                let taxRate = item.taxRate || this.taxRate;
                let taxAmount = accMul(item.price, item.tdQty, taxRate);
                let oItem = {
                  transMatchedCode: item.transCode, // 明细被核销交易号
                  orderCode: item.transCode, // 销售订单号（明细）
                  outPutMatCode: item.inventoryCode, // 输出物料
                  orderProCode: item.inventoryCode, // 销售订单产品编码（明细）
                  assMeasureUnit: item.assMeasureUnit !== undefined ? item.assMeasureUnit : null, // 辅助计量（明细）
                  assMeasureScale: item.assMeasureScale !== undefined ? item.assMeasureScale : null,  //与主计量单位倍数
                  tdQty: item.tdQty, // 明细发生数
                  assistQty: item.assistQty || 0, // 辅计数量（明细）
                  thenQtyStock: item.qtyStockBal, // 当时可用库存
                  thenQtyBal: item.qtyBal, // 待交付数量
                  tdProcessing: item.processing, //加工属性
                  price: item.price, // 明细单价
                  taxRate: taxRate, // 税率
                  taxAmount: taxAmount, // 税金
                  tdAmount: accAdd(accMul(item.price, item.tdQty), taxAmount), // 明细发生金额
                  promDeliTime: item.promDeliTime || '', // 承诺交付时间
                  comment: item.comment || '', // 说明
                };
                if (this.transCode) {
                  oItem.tdId = item.tdId || '';
                }
                dataSet.push(oItem);
              }
            }
            formData = {
              ...this.formData,
              modifer: this.transCode ? this.formData.handler : '',
              dealerDebitContactPersonName: this.dealerInfo.creatorName || '', // 联系人姓名
              dealerDebitContactInformation: this.dealerInfo.dealerMobilePhone || '', // 联系人手机
              containerOutWarehouseManager: this.warehouse.containerOutWarehouseManager || null, // 仓库管理员
              handlerEntity: this.entity.dealerName,
              outPut: {
                dealerDebit: this.dealerInfo.dealerCode, // 客户编码
                drDealerLabel: this.dealerInfo.dealerLabelName || '客户', // 客户页签
                containerCodeOut: this.warehouse.warehouseCode, // 仓库编码
                drDealerPaymentTerm: this.drDealerPaymentTerm || '现付',
                project: this.project.projectName,//项目
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
              listId: this.listId,
              biComment: '',
              biReferenceId: this.biReferenceId,
              formData: JSON.stringify(formData),
              wfPara: JSON.stringify(wfPara)
            };
            if (!this.transCode) {
              delete submitData.biReferenceId
            }
            console.log(submitData)
            this.saveData(operation, submitData);
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
          let orderList = {};
          // 获取合计
          let {outPut} = formData;
          let {dataSet = []} = outPut;
          for (let item of dataSet) {
            item = {
              ...item,
              transCode: item.transMatchedCode,
              qtyBal: item.thenQtyBal,
              qtyStockBal: item.thenQtyStock,
              inventoryPic: item.inventoryPic_outPutMatCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_outPutMatCode}&width=400&height=400` : this.getDefaultImg(),
              inventoryName: item.inventoryName_outPutMatCode,
              inventoryCode: item.outPutMatCode,
              specification: item.specification_outPutMatCode,
              processing: item.tdProcessing
            };
            if (!orderList[item.transCode]) {
              orderList[item.transCode] = [];
            }
            orderList[item.transCode].push(item);
          }
          this.matterList = dataSet;
          // 客户信息
          this.dealerInfo = {
            creatorName: formData.dealerDebitContactPersonName, // 客户名
            dealerName: outPut.dealerName_dealerDebit, // 公司名
            dealerMobilePhone: formData.dealerDebitContactInformation, // 手机
            dealerCode: outPut.dealerDebit, // 客户编码
            dealerLabelName: outPut.drDealerLabel, // 关系标签
            province: outPut.province_dealerDebit, // 省份
            city: outPut.city_dealerDebit, // 城市
            county: outPut.county_dealerDebit, // 地区
            address: outPut.address_dealerDebit, // 详细地址
          };
          // 仓库信息
          this.warehouse = {
            warehouseCode: outPut.containerCodeOut,
            warehouseName: outPut.warehouseName_containerCodeOut,
            warehouseType: outPut.warehouseType_containerCodeOut,
            warehouseProvince: outPut.warehouseProvince_containerCodeOut,
            warehouseCity: outPut.warehouseCity_containerCodeOut,
            warehouseDistrict: outPut.warehouseDistrict_containerCodeOut,
            warehouseAddress: outPut.warehouseAddress_containerCodeOut,
            containerOutWarehouseManager: formData.containerOutWarehouseManager, // 仓库管理员
          };
          // 订单请求参数
          this.orderParams = {
            dealerCode: this.dealerInfo.dealerCode,
            whCode: this.warehouse.warehouseCode,
          };
          this.formData = {
            ...this.formData,
            creator: formData.creator,
            biComment: formData.biComment,
            drDealerLogisticsTerms: formData.drDealerLogisticsTerms,
          };
          this.drDealerPaymentTerm = outPut.drDealerPaymentTerm;
          this.entity = {
            dealerName: formData.handlerEntity
          };
          this.project = {
            projectName: outPut.project
          };
          this.biReferenceId = formData.biReferenceId;
          this.orderList = orderList;
          this.$emit('input', false);
        })
      },
    },
    created() {
      let data = sessionStorage.getItem('CGSQ_DATA');
      if (data) {
        this.orderList = JSON.parse(data).orderList;
        this.warehouse = JSON.parse(data).warehouse;
        this.dealerInfo = JSON.parse(data).dealer;
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import './../scss/bizApply';
  // 所属订单
  .order_code {
    display: flex;
    color: #fff;
    font-size: .12rem;
    > span {
      display: inline-block;
      padding: 0 .04rem;
    }
    .order_title {
      background: #455d7a;
    }
    .order_num {
      background: #c93d1b;
    }
  }

  .materiel_list .mater_list .each_mater_wrapper {
    flex-direction: column;
  }
</style>
