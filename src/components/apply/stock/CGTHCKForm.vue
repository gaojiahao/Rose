<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list  @sel-dealer="selDealer" :defaultValue="dealerInfo" dealer-label-name="原厂供应商,经销供应商" 
                          dealerTitle="供应商" @sel-contact="selContact" :defaultContact="contactInfo"></pop-dealer-list>
        <!-- 仓库-->
        <pop-warehouse-list title="出库仓库" :default-value="warehouse" @sel-item="selWarehouse" :is-required="true"></pop-warehouse-list>
        <!-- 结算方式 -->
        <pop-single-select title="结算方式" :data="transMode" :value="crDealerPaymentTerm" isRequired
                           v-model="crDealerPaymentTerm"></pop-single-select>
        <!-- 物料列表 -->
        <div class="materiel_list">
          <!-- 没有选择物料 -->
          <template v-if="!Object.keys(orderList).length">
            <div @click="showMaterielPop = !showMaterielPop">
              <div class="title">订单列表</div>
              <div class="required">请选择订单</div>
              <i class="iconfont icon-youjiantou r_arrow"></i>
            </div>
          </template>
          <!-- 已经选择了物料 -->
          <template v-else>
            <div class="title" @click="showDelete">
              <div>订单列表</div>
              <div class='edit' v-if='!matterModifyClass'>编辑</div>
              <div class='finished' v-else>完成</div>
            </div>
            <div class="mater_list">
              <div class="each_mater" :class="{'vux-1px-b' : index < (Object.keys(orderList).length-1)}"
                   v-for="(oItem, key, index) in orderList" :key="key">
                <div class="order_code" v-if='oItem.length'>
                  <span class="order_title">订单号</span>
                  <span class="order_num">{{key}}</span>
                </div>
                <div :class="{mater_delete : matterModifyClass}" v-for="(item, index) in oItem" :key="index">
                  <matter-item :item="item" @on-modify="modifyMatter(item, index, key)" :show-delete="matterModifyClass"
                               @click.native="delClick(index, item, key)">
                    <template slot="info" slot-scope="{item}">
                      <!-- 物料属性和单位 -->
                      <div class="mater_more">
                        <span class="processing">属性: {{item.processing}}</span>
                        <span class='unit'>单位: {{item.measureUnit_outPutMatCode}}</span>
                        <span class='mater_color'>颜色: {{item.inventoryColor || '无'}}</span>
                      </div>
                      <div class="mater_more">
                        <span class='qty' v-show="item.qtyBal">可退货数量: {{item.qtyBal}}</span>
                        <span v-show="item.taxRate">税率: {{item.taxRate}}</span>
                      </div>
                      <!-- 物料数量和价格 -->
                      <div class='mater_other' v-if="item.price && item.tdQty">                      
                        <div class='mater_price'>
                          <span class="symbol">￥</span>{{item.price}}
                        </div>
                        <div>
                          <r-number :num="item.tdQty"
                                    :checkAmt='checkAmt' v-model="item.tdQty" :max="item.qtyStockBal"></r-number>
                        </div>                     
                      </div>
                    </template>
                    <template slot="editPart" slot-scope="{item}">
                      <div class="edit-part vux-1px-l" @click="modifyMatter(item, index, key)"
                           v-show="(item.price && item.tdQty) &&!matterModifyClass">
                        <span class='iconfont icon-bianji1'></span>
                      </div>
                    </template>
                  </matter-item>
                  <div class='delete_icon' @click="delClick(index,item, key)" v-if='matterModifyClass'>
                    <x-icon type="ios-checkmark" size="20" class="checked" v-show="showSelIcon(item)"></x-icon>
                    <x-icon type="ios-circle-outline" size="20" v-show="!showSelIcon(item)"></x-icon>
                  </div>
                </div>
              </div>
              <!-- <div class="each_mater" :class="{mater_delete : matterModifyClass,'vux-1px-b' : index < matterList.length-1}" 
                v-for="(item, index) in matterList" :key="index" >
                <matter-item :item="item" @on-modify="modifyMatter(item,index)" :show-delete="matterModifyClass"
                            @click.native="delClick(index,item)">
                  <template slot="info" slot-scope="{item}">
                    <div class="mater_more">
                      <span class="processing">属性: {{item.processing}}</span>
                      <span class='unit'>单位: {{item.measureUnit_outPutMatCode}}</span>
                      <span class='mater_color'>颜色: {{item.inventoryColor || '无'}}</span>
                    </div>
                    <div class="mater_more">
                      <span class='qty' v-show="item.qtyBal">可退货数量: {{item.qtyBal}}</span>
                      <span v-show="item.taxRate">税率: {{item.taxRate}}</span>
                    </div>
                    <div class='mater_other' v-if="item.price && item.tdQty">                      
                      <div class='mater_price'>
                        <span class="symbol">￥</span>{{item.price}}
                      </div>
                      <div>
                        <r-number :num="item.tdQty"
                                  :checkAmt='checkAmt' v-model="item.tdQty"></r-number>
                      </div>                     
                    </div>
                  </template>
                  <template slot="editPart" slot-scope="{item}">
                    <div class="edit-part vux-1px-l" @click="modifyMatter(item,index)" v-show="(item.price && item.tdQty) &&!matterModifyClass">
                      <span class='iconfont icon-bianji1'></span>
                    </div>
                  </template>
                </matter-item>
                <div class='delete_icon' @click="delClick(index,item)" v-if='matterModifyClass'>
                  <x-icon type="ios-checkmark" size="20" class="checked" v-show="showSelIcon(item)"></x-icon>
                  <x-icon type="ios-circle-outline" size="20" v-show="!showSelIcon(item)"></x-icon>
                </div>
              </div> -->
            </div>
          </template>
          <!-- 新增更多 按钮 -->
          <div class="handle_part" v-if="matterList.length && !matterModifyClass">
            <span class="add_more stop" v-if="this.actions.includes('stop')"
              @click="stopOrder" >终止提交</span>
            <span class="symbol" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>或</span>
            <span class="add_more"  @click="addOrder">新增更多物料</span>
          </div>
          <!-- 物料popup -->
          <pop-matter-list :show="showMaterielPop" v-model="showMaterielPop" @sel-matter="selMatter" :filterList="filterList"
                           :default-value="matterList" get-list-method="getCKTHCKList" :params="matterParams" 
                           isShowStock ref="matter">
            <template slot="titleName">
              <span class="order-title">订单号</span>
            </template>
            <template slot="storage" slot-scope="{item}">
              <div class="mater_material">
                <span class="spec">可用库存: {{item.qtyStockBal}}</span>
              </div>
            </template>
          </pop-matter-list>
        </div>
        <!--物料编辑pop-->
        <pop-matter :modify-matter='matter' :show-pop="showMatterPop" @sel-confirm='selConfirm' v-model='showMatterPop' :btn-is-hide="btnIsHide">
          <template slot="qtyBal" slot-scope="{modifyMatter}">
            <p v-show="modifyMatter.qtyBal">可退货数量: {{modifyMatter.qtyBal}}</p>
            <p v-show="modifyMatter.qtyStockBal">可用库存: {{modifyMatter.qtyStockBal}}</p>
          </template>
          <template slot="modify" slot-scope="{modifyMatter}">
            <x-input title="退货数量" type="number"  v-model.number='modifyMatter.tdQty' text-align="right" 
              @on-blur="checkAmt(modifyMatter)" @on-focus="getFocus($event)" placeholder="请输入">
            </x-input>
            <x-input title="退货单价" type="number"  v-model.number='modifyMatter.price' text-align="right" 
            @on-blur="checkAmt(modifyMatter)" @on-focus="getFocus($event)" placeholder="请输入"></x-input>
            <x-input title="税率" type="number"  v-model.number='modifyMatter.taxRate' text-align="right" 
              @on-blur="checkAmt(modifyMatter)" @on-focus="getFocus($event)" placeholder="请输入">
            </x-input>
          </template>
          <template slot="modifyTitle">
            <label>退货金额</label>
          </template>
        </pop-matter>
       
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment"></upload-file>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class="count_mode vux-1px-t" :class="{btn_hide : btnIsHide}" v-if="!matterModifyClass">
      <span class="count_num">
        <span style="fontSize:.14rem">￥</span>{{tdAmount | numberComma}}
        <span class="taxAmount">[含税: ￥{{taxAmount | numberComma}}]</span>
      </span>
      <span class="count_btn" @click="submitOrder">提交</span>
    </div>
    <!-- 底部删除确认栏 -->
    <div class="count_mode vux-1px-t delete_mode" :class="{btn_hide : btnIsHide}" v-else>
      <div class='count_num all_checked' @click="checkAll">
        <x-icon type="ios-circle-outline" size="20" class='outline' v-show="selItems.length !== matterList.length"></x-icon>
        <x-icon type="ios-checkmark" size="20" class="checked" v-show="selItems.length === matterList.length"></x-icon>
        全选
      </div>
      <div class='delete_btn' @click="deleteCheckd">删除</div>
    </div>
  </div>
</template>

<script>
// vux插件引入
import { XTextarea, XInput } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
import { saveAndStartWf, getBaseInfoData, saveAndCommitTask, commitTask, getDictByType, submitAndCalc } from 'service/commonService'
// mixins 引入
import applyCommon from 'components/mixins/applyCommon'
// 组件引入
import PopDealerList from 'components/Popup/PopDealerList'
import PopMatterList from 'components/Popup/PopMatterList'
import PopWarehouseList from 'components/Popup/PopWarehouseList'
import PopSingleSelect from 'components/Popup/PopSingleSelect'
import PopMatter from 'components/apply/commonPart/MatterPop'
import RNumber from 'components/RNumber'
import RPicker from 'components/RPicker'
import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
// 公共方法
import { accAdd, accMul } from '@/home/pages/maps/decimalsAdd'
import { toFixed } from '@/plugins/calc'
const DRAFT_KEY = 'CGTHCK_DATA';

export default {
  data () {
    return {
      listId: '482b7468-06eb-40c7-842a-f7ea6edb1c37',
      srhInpTx: '', // 搜索框内容
      orderList: {},
      matterList: [], // 订单列表
      transMode: ['现付', '预付', '账期', '票据'], // 结算方式
      showDealerPop: false, // 是否显示供应商的popup
      dealerInfo: null, // 供应商客户信息
      crDealerPaymentTerm: '现付', //结算方式
      formData: {
        biId: '',
        biComment: '' //备注
      },
      submitSuccess: false, // 是否提交成功
      showWarehousePop: false,
      warehouse: null, // 选中仓库属性
      numMap: {}, // 用于记录订单物料的数量
      transCode: '',
      biReferenceId: '',
      actions: [],
      taskId: '',
      showMaterielPop: false,
      showMatterPop: false,
      modifyIndex: null,
      modifyKey: null,
      selItems: [],
      matterParams: { // 物料列表的请求参数
        whCode: ''
      },
      contactInfo: {},
      filterList: [
        {
          name: '物料名称',
          value: 'inventoryName',
        }, {
          name: '物料编码',
          value: 'inventoryCode',
        },{
          name: '订单号',
          value: 'transCode',
        },
      ]
    }
  },
  components: {
    XTextarea, XInput, RNumber,
    PopDealerList, PopWarehouseList, PopMatterList, PopSingleSelect,PopMatter, RPicker, PopBaseinfo
  },
  mixins: [applyCommon],
  methods: {
    // 获取 结算方式
    getPaymentTerm () {
      return getDictByType('paymentTerm').then(({ tableContent }) => {
        this.transMode = tableContent;
      })
    }, 
    // TODO 选中的供应商
    selDealer (val) {
      let [sel] = JSON.parse(val);
      this.dealerInfo = sel;
      this.crDealerPaymentTerm = this.dealerInfo.paymentTerm;
      this.matterParams = {
        ...this.matterParams,
        dealerCode: this.dealerInfo.dealerCode,
      };
    },
    selContact (val) {
      this.dealerInfo.dealerDebitContactPersonName = val.dealerName;
      this.dealerInfo.dealerMobilePhone = val.dealerMobilePhone;
    },
    // TODO 选中仓库
    selWarehouse (val) {
      this.warehouse = JSON.parse(val);
      this.matterParams = {
        ...this.matterParams,
        whCode: this.warehouse.warehouseCode,
      };
      this.matterList = []
    },
    // TODO 选中物料项
    selMatter (val) {
      let sels = JSON.parse(val);
      let orderList = {};
      sels.forEach(item => {
        let key = `${item.transCode}_${item.inventoryCode}`;
        let { tdQty = item.currQty || '', price = item.price, taxRate = 0.16 } = this.numMap[key] || {};
        item.tdQty = tdQty;
        if (price.length) {
          item.price = price;
        }
        item.taxRate = taxRate;
        if (!orderList[item.transCode]) {
          orderList[item.transCode] = [];
        }
        orderList[item.transCode].push(item);
      });
      this.numMap = {};
      this.matterList = sels;
      this.orderList = orderList;
      // let sels = JSON.parse(val);
      // sels.forEach(item => {
      //   if (this.numMap[item.inventoryCode]) {
      //     item.tdQty = this.numMap[item.inventoryCode].tdQty;
      //     item.price = this.numMap[item.inventoryCode].price;
      //   } 
      //   else {
      //     item.tdQty = '';
      //     item.price = '';
      //   }
      //   item.taxRate = 0.16;
      // });
      // this.numMap = {};
      // this.matterList = sels;
    },
    // TODO 显示物料修改的pop
      modifyMatter(item, index, key) {
        this.matter = JSON.parse(JSON.stringify(item));
        this.showMatterPop = true;
        this.modifyIndex = index;
        this.modifyKey = key;
      },
    // TODO 更新修改后的物料信息
    selConfirm(val) {
      let modMatter = JSON.parse(val);
      this.matterList.every((item, index) => {
        // 修改matterList，触发合计金额计算
        if (modMatter.transCode === item.transCode && modMatter.inventoryCode === item.inventoryCode) {
          this.$set(this.matterList, index, modMatter);
          return false
        }
        return true
      });
      this.$set(this.orderList[this.modifyKey], this.modifyIndex, modMatter);
    },
    // TODO 选择默认图片
    getDefaultImg (item) {
      let url = require('assets/wl_default02.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    // 滑动删除
    delClick (index, sItem) {
      let arr = this.selItems;
      let delIndex = arr.findIndex(item => item.inventoryCode === sItem.inventoryCode && item.transCode === sItem.transCode);
      // 若存在重复的 则清除
      if (delIndex !== -1) {
        arr.splice(delIndex, 1);
        return;
      }
      arr.push(sItem);
    },
    // TODO 判断是否展示选中图标
    showSelIcon (sItem) {
      return this.selItems.findIndex(item => item.inventoryCode === sItem.inventoryCode && item.transCode === sItem.transCode) !== -1;
    },
    // 全选
    checkAll () {
      if (this.selItems.length === this.matterList.length) {
        this.selItems = [];
        return
      }
      this.selItems = JSON.parse(JSON.stringify(this.matterList));
    },
    // 删除选中的
    deleteCheckd () {
      this.$vux.confirm.show({
        content: '确认删除?',
        // 确定回调
        onConfirm: () => {
          let newArr = [];
            let keys = Object.keys(this.orderList);
            keys.forEach(item => {
              newArr = newArr.concat(this.orderList[item]);
            })
            this.selItems.forEach(SItem => {
              newArr.forEach(OItem => {
                if (OItem.inventoryCode === SItem.inventoryCode && OItem.transCode === SItem.transCode) {
                  let delArr = this.orderList[OItem.transCode];
                  let delIndex = delArr.findIndex(item => item.inventoryCode === OItem.inventoryCode);
                  if (delIndex >= 0) {
                    delArr.splice(delIndex, 1);
                  }
                  if (!delArr.length) {
                    delete this.orderList[OItem.transCode];
                  }

                }

              })
              this.matterList.forEach((item, index) => {
                if (item.inventoryCode === SItem.inventoryCode) {
                  this.matterList.splice(index, 1);
                  index--;
                }
              })
            })
            this.selItems = [];
            this.matterModifyClass = false;
        }
      })

    },
    // TODO 新增更多订单
    addOrder () {
      for (let items of Object.values(this.orderList)) {
        for (let item of items) {
          // 存储已输入的价格
          this.numMap[`${item.transCode}_${item.inventoryCode}`] = {
            tdQty: item.tdQty,
            price: item.price,
            taxRate: item.taxRate,
          };
        }
      }
      this.showMaterielPop = !this.showMaterielPop;
    },
    // TODO 提价订单
    submitOrder () {
      let warn = '';
      let dataSet = [];
      let validateMap = [
        {
          key: 'dealerInfo',
          message: '供应商信息'
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
      if(!warn && !this.crDealerPaymentTerm){
        warn = '请选择结算方式'
      }
      if (!warn && !Object.keys(this.orderList).length) {
        warn = '请选择物料'
      }
      // 组装dataSet
      for (let items of Object.values(this.orderList)) {
        for (let item of items) {
          if (!item.tdQty) {
            warn = '请填写数量'
            break
          }
          if (!item.price) {
            warn = '请填写单价'
            break
          }
          let taxRate = item.taxRate || this.taxRate;
          let taxAmount = accMul(item.price, item.tdQty, taxRate);
          let oItem = {
            tdId: item.tdId || null,
            orderCode: item.transCode, // 实例编码
            outPutMatCode: item.inventoryCode, // 物料编码
            tdProcessing: item.processing, // 加工属性
            assMeasureUnit: item.assMeasureUnit !== undefined ? item.assMeasureUnit : null, // 辅助计量（明细）
            assMeasureScale: item.assMeasureScale !== undefined ? item.assMeasureScale : null, // 与单位倍数
            assistQty: item.assistQty || 0, // 辅计数量（明细）
            thenQtyBal: item.qtyBal,
			      thenQtyStock: item.qtyStockBal,
            tdQty: item.tdQty, // 明细发生
            price: item.price, // 明细单价
            taxRate: taxRate, // 税率
            taxAmount: taxAmount, // 税金
            tdAmount: accAdd(accMul(item.price, item.tdQty), taxAmount), // 明细发生金额
            comment: item.comment || '', // 说明
          };
          if (this.transCode) {
            oItem.tdId = item.tdId || '';
          }
          dataSet.push(oItem);
        }
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
          this.$HandleLoad.show();
          let operation = saveAndStartWf;
          let formData = {};
          let wfPara = {
            [this.processCode]: {
              businessKey: 'PORT',
              createdBy: this.formData.handler
            }
          };
          formData = {
            ...this.formData,
            handlerEntity: this.entity.dealerName,
            creator: this.transCode ? this.formData.handler : '',
            modifer: this.transCode ? this.formData.handler : '',
            dealerDebitContactPersonName: this.dealerInfo.dealerDebitContactPersonName || '', // 联系人姓名
            dealerDebitContactInformation: this.dealerInfo.dealerMobilePhone || '', // 联系人手机
            containerOutWarehouseManager: this.warehouse.containerInWarehouseManager || null,
            outPut: {
              dealerDebit: this.dealerInfo.dealerCode, // 供应商编码
              drDealerLabel: this.dealerInfo.dealerLabelName || '供应商', // 供应商页签
              containerCodeOut: this.warehouse.warehouseCode, // 仓库编码
              drDealerPaymentTerm: this.crDealerPaymentTerm,
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
          // 新增
          if (!this.transCode) {
            delete submitData.biReferenceId
          }
          // 无工作流
          if (!this.processCode.length) {
            operation = submitAndCalc;
            delete submitData.wfPara;
            delete submitData.biReferenceId;
          }
          if (this.biReferenceId) {
            submitData.biReferenceId = this.biReferenceId;
          }
          this.saveData(operation, submitData);
        }
      })
    },
    // TODO 获取详情
    getFormData () {
      return getSOList({
        formViewUniqueId: this.formViewUniqueId,
        transCode: this.transCode
      }).then(data => {
        let {success = true, formData = {},attachment = []} = data;
        // http200时提示报错信息
        if (!success) {
          this.$vux.alert.show({
            content: '抱歉，无法支持您查看的交易号，请确认交易号是否正确'
          });
          return;
        }
        this.attachment = attachment;
        let orderList = {};
        // 获取合计
        let {outPut, dealerDebit} = formData;
        let {dataSet = []} = outPut;
        for (let item of dataSet) {
          item = {
             ...item,
            inventoryPic: item.inventoryPic_outPutMatCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_outPutMatCode}&width=400&height=400` : this.getDefaultImg(),
            inventoryName: item.inventoryName_outPutMatCode,
            inventoryCode: item.outPutMatCode,
            specification: item.specification_outPutMatCode,
            processing: item.tdProcessing,
            qtyStockBal: item.thenQtyStock, // 可用库存
            qtyBal: item.thenQtyBal, // 可退货数量
            transCode: item.orderCode
          };
          if (!orderList[item.orderCode]) {
            orderList[item.orderCode] = [];
          }
          orderList[item.orderCode].push(item);
        };
        this.matterList = dataSet;
        // 供应商信息
        this.dealerInfo = {
          creatorName: formData.dealerName_dealerDebit, // 客户名
          dealerName: outPut.dealerName_dealerDebit, // 公司名
          dealerMobilePhone: formData.dealerDebitContactInformation, // 手机
          dealerDebitContactPersonName: formData.dealerDebitContactPersonName, // 联系人
          dealerCode: outPut.dealerDebit, // 客户编码
          dealerLabelName: outPut.drDealerLabel, // 关系标签
          province: outPut.province_dealerCodeCredit, // 省份
          city: outPut.city_dealerCodeCredit, // 城市
          county: outPut.county_dealerCodeCredit, // 地区
          address: outPut.address_dealerCodeCredit, // 详细地址
        };
        // 供应商联系人信息
        this.contactInfo = {
          dealerName: formData.dealerDebitContactPersonName,
          dealerMobilePhone: formData.dealerDebitContactInformation
        }
        // 仓库信息
        this.warehouse = {
          warehouseCode: outPut.containerCodeOut,
          warehouseName: outPut.warehouseName_containerCodeOut,
          warehouseType: outPut.warehouseType_containerCodeOut,
          warehouseProvince: outPut.warehouseProvince_containerCodeOut,
          warehouseCity: outPut.warehouseCity_containerCodeOut,
          warehouseDistrict: outPut.warehouseDistrict_containerCodeOut,
          warehouseAddress: outPut.warehouseAddress_containerCodeOut,
          containerInWarehouseManager: outPut.containerInWarehouseManagerOut,
        };
        // 物料请求参数
        this.matterParams = {
          dealerCode: this.dealerInfo.dealerCode
        };
        this.handlerDefault = {
          handler: formData.handler,
          handlerName: formData.handlerName,
          handlerUnit: formData.handlerUnit,
          handlerUnitName: formData.handlerUnitName,
          handlerRole: formData.handlerRole,
          handlerRoleName: formData.handlerRoleName,
        };
        // 基本信息
        this.formData = {
          ...this.formData,
          ...this.handlerDefault,
          biComment: formData.biComment,
          biId: formData.biId,
          biProcessStatus: formData.biProcessStatus,
          creator: formData.creator,
          modifer: formData.modifer,
        }
        this.crDealerPaymentTerm = outPut.drDealerPaymentTerm;
        console.log(outPut.drDealerPaymentTerm)
        this.biReferenceId = formData.biReferenceId;
        this.orderList = orderList;
        this.$loading.hide();
      })
    },
    // TODO 是否保存草稿
    hasDraftData () {
      if (!this.matterList.length) {
        return false
      }
      return {
        [DRAFT_KEY]: {
          matter: this.matterList,
          dealer: this.dealerInfo,
          warehouse: this.warehouse,
          formData: this.formData,
          orderList: this.orderList,
        }
      };
    },
     // TODO 获取关联数据
    getRelationData () {
      let {uniqueId} = this.$route.query;
      return getSOList({
        formViewUniqueId: uniqueId,
        transCode: this.relationKey
      }).then(data => {
        let {success = true, formData = {},attachment = []} = data;
        // http200时提示报错信息
        if (!success) {
          this.$vux.alert.show({
            content: '抱歉，无法支持您查看的交易号，请确认交易号是否正确'
          });
          return;
        }
        // 获取合计
        let {inPut} = formData;
        let {dataSet = []} = inPut;
        dataSet = dataSet.map(item => {
          return {
            ...item,
            inventoryPic: item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
            inventoryName: item.inventoryName_transObjCode,
            inventoryCode: item.inventoryCode_transObjCode,
            specification: item.specification_transObjCode,
            processing: item.tdProcessing || '商品',
            measureUnit: item.measureUnit_transObjCode,
            transCode: this.relationKey,
            qtyBal: item.tdQty,
            tdQty: '',

          };
        });
        // 供应商信息
        this.dealerInfo = {
          creatorName: formData.dealerCreditContactPersonName, // 客户名
          dealerName: outPut.dealerName_dealerCodeCredit, // 公司名
          dealerMobilePhone: formData.dealerCreditContactInformation, // 手机
          dealerCode: outPut.dealerCode_dealerCodeCredit, // 客户编码
          dealerLabelName: outPut.crDealerLabel, // 关系标签
          province: outPut.province_dealerCodeCredit, // 省份
          city: outPut.city_dealerCodeCredit, // 城市
          county: outPut.county_dealerCodeCredit, // 地区
          address: outPut.address_dealerCodeCredit, // 详细地址
        };
        // 物料请求参数
        this.matterParams = {
          dealerCode: this.dealerInfo.dealerCode
        };

        this.matterList = dataSet;
        this.orderList = {
          [this.relationKey]: dataSet,
        };
        this.DealerPaymentTerm = formData.drDealerPaymentTerm || '现付';
        this.$loading.hide();       
      })
    },
  },
  created () {
    let data = sessionStorage.getItem(DRAFT_KEY);
    if (data) {
      this.matterList = JSON.parse(data).matter;
      this.orderList = JSON.parse(data).orderList;
      this.dealerInfo = JSON.parse(data).dealer;
      this.warehouse = JSON.parse(data).warehouse;
      this.formData = JSON.parse(data).formData;
      this.crDealerPaymentTerm = this.dealerInfo.paymentTerm;
      sessionStorage.removeItem(DRAFT_KEY);
    }
  },
}
</script>

<style lang='scss' scoped>
  @import './../../scss/bizApply';
  .basicPart{
    background: #f8f8f8;
  }
  .pages {
  /deep/ .vux-no-group-title{
    margin-top: 0;
  }
    /deep/ .weui-cells {
      font-size: .14rem;
      &:before {
        border-top: none;
      }
    }
  }
</style>
