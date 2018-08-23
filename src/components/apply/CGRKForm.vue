<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <!-- 用户地址和基本信息-->
        <div class="or_ads mg_auto box_sd" @click="showDealerPop = !showDealerPop">
          <div v-if='dealerInfo'>
            <div class="user_info">
              <span class="user_name">{{dealerInfo.creatorName}}</span>
              <span class="user_tel">{{dealerInfo.dealerMobilePhone}}</span>
            </div>
            <div class="cp_info">
              <p class="cp_name">{{dealerInfo.dealerName}}</p>
              <p class="cp_ads">
                {{dealerInfo.province}}{{dealerInfo.city}}{{dealerInfo.county}}{{dealerInfo.address}}</p>
            </div>
          </div>
          <div v-else>
            <div class="title">往来列表</div>
            <div class="mode">请选择往来</div>
          </div>
          <x-icon class="r_arrow" type="ios-arrow-right" size="20"></x-icon>
        </div>
        <!-- 仓库-->
        <pop-warehouse-list :default-value="warehouse" @sel-item="selWarehouse"></pop-warehouse-list>
        <!-- 结算方式 -->
        <pop-single-select title="结算方式" :data="transMode" :value="crDealerPaymentTerm"
                           v-model="crDealerPaymentTerm"></pop-single-select>
        <!-- 物料列表 -->
        <div class="materiel_list mg_auto box_sd">
          <!-- 没有选择物料 -->
          <template v-if="!listData.length">
            <div @click="showMaterielPop = !showMaterielPop">
              <div class="title">物料列表</div>
              <div class="tips">请选择物料</div>
              <x-icon class="r_arrow" type="ios-arrow-right" size="20"></x-icon>
            </div>
          </template>
          <!-- 已经选择了物料 -->
          <template v-else>
            <div class="title">物料列表</div>
            <div class="mater_list">
              <div class="each_mater vux-1px-b" v-for="(item, index) in listData" :key="index">
                <swipeout>
                  <swipeout-item>
                    <div slot="right-menu">
                      <swipeout-button @click.native="delClick(index,item)" type="warn">删除</swipeout-button>
                    </div>
                    <div class="each_mater_wrapper" slot="content">
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
                          </div>
                        </div>
                        <!-- 物料数量和价格 -->
                        <div class="mater_other">
                          <div class="mater_price">
                            ￥{{item.price | numberComma}}
                          </div>
                          <r-number :num="item.tdQty" v-model="item.tdQty"></r-number>
                        </div>
                      </div>
                    </div>
                  </swipeout-item>
                </swipeout>
              </div>
            </div>
          </template>
          <!-- 新增更多 按钮 -->
          <!-- <div class="add_more" v-if="listData.length" @click="addOrder">新增更多订单</div> -->
          <div class="handle_part" v-if="listData.length">
            <span class="add_more stop" v-if="this.actions.includes('stop')"
              @click="stopOrder" >终止提交</span>
            <span class="symbol" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>或</span>
            <span class="add_more"  @click="addOrder">新增更多物料</span>
          </div>
          <!-- 往来popup -->
          <pop-dealer-list :show="showDealerPop" dealer-label-name="2168" v-model="showDealerPop"
                           @sel-dealer="selDealer" @closePop='showDealerPop = !showDealerPop'></pop-dealer-list>
          <!-- 物料popup -->
          <pop-matter-list :show="showMaterielPop" v-model="showMaterielPop" @sel-matter="selMatter"
                           :default-value="listData" get-list-method="getInventory7502" :params="matterParams"
                           ref="matter"></pop-matter-list>
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
      <span class="count_btn" @click="submitOrder">提交订单</span>
    </div>
  </div>
</template>

<script>
// vux插件引入
import {
  Icon, Cell, Popup, Group, XInput, 
  Swipeout, SwipeoutItem, SwipeoutButton, TransferDom 
} from 'vux'
// 请求 引入
import {getSOList,} from 'service/detailService'
import {saveAndStartWf, getBaseInfoData, saveAndCommitTask, commitTask,} from 'service/commonService'
// mixins 引入
import applyCommon from 'components/mixins/applyCommon'
// 组件引入
import RNumber from 'components/RNumber'
import PopDealerList from 'components/Popup/PopDealerList'
import PopMatterList from 'components/Popup/PopMatterList'
import PopWarehouseList from 'components/Popup/PopWarehouseList'
import PopSingleSelect from 'components/Popup/PopSingleSelect'
export default {
  name: 'ApplyCGRKForm',
  mixins: [applyCommon],
  directives: { TransferDom },
  components: {
    Icon, Cell, Popup, Group,
    XInput, Swipeout, SwipeoutItem, SwipeoutButton,
    PopDealerList, PopWarehouseList, PopMatterList, PopSingleSelect,
    RNumber,
  },
  data() {
    return {
      listId: '1c5896d8-1500-4569-b0c5-6b596d03fb9b',
      srhInpTx: '',                                   // 搜索框内容
      listData: [],                                  // 订单列表
      DealerPaymentTerm: '现付',                        //结算方式
      transMode: ['现付', '预付', '账期', '票据'],          // 结算方式
      showDealerPop: false,                          // 是否显示往来的popup
      dealerInfo: null, // 往来客户信息
      crDealerPaymentTerm: '现付',  //结算方式
      formData: {
        biId: '',
        biComment: '' //备注
      },
      submitSuccess: false, // 是否提交成功
      showWarehousePop: false,
      warehouse: null, // 选中仓库属性
      taxRate: 0.16, // 税率
      numMap: {}, // 用于记录订单物料的数量
      transCode: '',
      formViewUniqueId: 'fed81800-4c34-44a9-b517-c3fd9f2ab57d', // 修改时的UniqueId
      biReferenceId: '',
      actions: [],
      taskId: '',
      showMaterielPop: false,
      matterParams: { // 物料列表的请求参数
        dealerCode: ''
      }
    }
  },
  computed: {
    // 合计金额
    totalAmount() {
      let total = 0;
      this.listData.forEach(item => {
        total += item.tdQty * item.price;
      });
      return Number(total);
    },
    // 税金
    taxAmount() {
      return (this.totalAmount * this.taxRate).toFixed(2)
    },
    tdAmount() {
      return (this.totalAmount + Number(this.taxAmount)).toFixed(2)
    }
  },
  watch: {
    listData(val) {
      let data = {
        CGRK_DATA: {
          matter: this.listData,
          dealer: this.dealerInfo,
          warehouse: this.warehouse
        }
      }
      this.$emit('sel-data', data)

    },
    dealerInfo(val) {
      if (this.listData.length) {
        let data = {
          CGRK_DATA: {
            matter: this.listData,
            dealer: this.dealerInfo,
            warehouse: this.warehouse
          }
        }
        this.$emit('sel-data', data)
      }

    },
    warehouse(val) {
      if (this.listData.length) {
        let data = {
          CGRK_DATA: {
            matter: this.listData,
            dealer: this.dealerInfo,
            warehouse: this.warehouse
          }
        }
        this.$emit('sel-data', data)
      }

    }

  },
  methods: {
    // TODO 选中的往来
    selDealer(val) {
      let [sel] = JSON.parse(val);
      this.dealerInfo = sel;
      this.matterParams = {
        ...this.matterParams,
        dealerCode: sel.dealerCode
      };
      this.listData = [];
    },
    // TODO 选中仓库
    selWarehouse(val) {
      this.warehouse = JSON.parse(val);
    },
    // TODO 选中物料项
    selMatter(val) {
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
      this.listData = sels;
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
      let arr = this.listData;
      arr.splice(index, 1);
      this.$refs.matter.delSelItem(item);
    },
    // TODO 新增更多订单
    addOrder() {
      this.listData.forEach(item => {
        // 存储已输入的价格
        this.numMap[item.inventoryCode] = {
          tdQty: item.tdQty,
          price: item.price
        };
      });
      this.showMaterielPop = !this.showMaterielPop;
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
      if (!warn && !this.listData.length) {
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
              businessKey: 'POPI',
              createdBy: ''
            }
          };
          // 组装dataSet
          this.listData.forEach(item => {
            let oItem = {
              transObjCode: item.inventoryCode, // 物料编码
              tdProcessing: item.processing,
              assMeasureUnit: item.assMeasureUnit !== undefined ? item.assMeasureUnit : null, // 辅助计量（明细）
              assMeasureScale: item.assMeasureScale !== undefined ? item.assMeasureScale : null,  //与主计量单位倍数
              tdQty: item.tdQty, // 明细发生数
              thenQtyBal : item.thenQtyBal ||0, //余额
              tdProcessing :item.processing, //加工属性
              assistQty: item.assistQty || 0, // 辅计数量（明细）
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
            creator: this.transCode ? this.formData.handler : '',
            modifer: this.transCode ? this.formData.handler : '',
            dealerCreditContactPersonName: this.dealerInfo.creatorName || '', // 联系人姓名
            dealerCreditContactInformation: this.dealerInfo.dealerMobilePhone || '', // 联系人手机
            containerInWarehouseManager: this.warehouse.containerInWarehouseManager || null,
            inPut: {
              dealerCodeCredit: this.dealerInfo.dealerCode, // 往来编码
              crDealerLabel: this.dealerInfo.dealerLabelName || '供应商', // 往来页签
              containerCode: this.warehouse.warehouseCode, // 仓库编码
              crDealerPaymentTerm: this.crDealerPaymentTerm,
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
    // TODO 获取详情
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
        let {inPut, dealerDebit} = formData;
        let {dataSet = []} = inPut;
        dataSet = dataSet.map(item => {
          return {
            ...item,
            inventoryPic: item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
            inventoryName: item.inventoryName_transObjCode,
            inventoryCode: item.transObjCode,
            specification: item.specification_transObjCode,
            processing : item.tdProcessing,
          };
        });
        // 供应商信息
        this.dealerInfo = {
          creatorName: formData.dealerCreditContactPersonName, // 客户名
          dealerName: inPut.dealerName_dealerCodeCredit, // 公司名
          dealerMobilePhone: formData.dealerCreditContactInformation, // 手机
          dealerCode: inPut.dealerCode_dealerCodeCredit, // 客户编码
          dealerLabelName: inPut.crDealerLabel, // 关系标签
          province: inPut.province_dealerCodeCredit, // 省份
          city: inPut.city_dealerCodeCredit, // 城市
          county: inPut.county_dealerCodeCredit, // 地区
          address: inPut.address_dealerCodeCredit, // 详细地址
        };
        // 仓库信息
        this.warehouse = {
          warehouseCode: inPut.containerCode,
          warehouseName: inPut.warehouseName_containerCode,
          warehouseType: inPut.warehouseType_containerCode,
          warehouseProvince: inPut.warehouseProvince_containerCode,
          warehouseCity: inPut.warehouseCity_containerCode,
          warehouseDistrict: inPut.warehouseDistrict_containerCode,
          warehouseAddress: inPut.warehouseAddress_containerCode,
          containerInWarehouseManager: inPut.containerInWarehouseManager,
        };
        // 物料请求参数
        this.matterParams = {
          dealerCode: this.dealerInfo.dealerCode
        };

        this.formData = {
          ...this.formData,
          creator: formData.creator,
          biId: formData.biId,
          biComment: formData.biComment,
        };
        this.crDealerPaymentTerm = inPut.crDealerPaymentTerm;
        this.DealerPaymentTerm = formData.crDealerPaymentTerm || '现付';
        this.biReferenceId = formData.biReferenceId;
        this.listData = dataSet;
        this.$emit('input', false);
      })
    },
  },
  created() {
    let data = sessionStorage.getItem('CGRK_DATA');
    if (data) {
      this.listData = JSON.parse(data).matter;
      this.dealerInfo = JSON.parse(data).dealer;
      this.warehouse = JSON.parse(data).warehouse;

    }
  },
}
</script>

<style lang='scss' scoped>
  @import './../scss/bizApply';
</style>
