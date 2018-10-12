<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list @sel-dealer="selDealer" :defaultValue="dealerInfo" dealer-label-name="供应商"></pop-dealer-list>
        <!-- 结算方式 -->
        <pop-single-select title="结算方式" :data="transMode" :value="crDealerPaymentTerm"
                           v-model="crDealerPaymentTerm"></pop-single-select>
        <!-- 仓库-->
        <pop-warehouse-list isRequired title="入库仓库" :default-value="warehouse" @sel-item="selWarehouse"></pop-warehouse-list>
        <!-- 物料列表 -->
        <div class="materiel_list">
          <!-- 没有选择物料 -->
          <template v-if="!matterList.length">
            <div @click="showMaterielPop = !showMaterielPop">
              <div class="title">物料列表</div>
              <div class="required">请选择物料</div>
              <i class="iconfont icon-youjiantou r_arrow"></i>
            </div>
          </template>
          <!-- 已经选择了物料 -->
          <template v-else>
            <div class="title" @click="showDelete">
              <div>物料列表</div>
              <div class='edit' v-if='!matterModifyClass'>编辑</div>
              <div class='finished' v-else>完成</div>
            </div>
            <div class="mater_list">
              <div class="each_mater" :class="{mater_delete : matterModifyClass,'vux-1px-b' : index < matterList.length-1}" 
                    v-for="(item, index) in matterList" :key="index">
                <matter-item :item="item" @on-modify="modifyMatter(item,index)" :show-delete="matterModifyClass"
                            @click.native="delClick(index,item)">
                  <template slot="info" slot-scope="{item}">
                    <!-- 物料属性和单位 -->
                    <div class="mater_more">
                        <span class="processing">属性：{{item.processing}}</span>
                        <span class='unit'>单位：{{item.measureUnit}}</span>
                        <span class='mater_color'>颜色：{{item.inventoryColor || '无'}}</span>
                        <span class='qty' v-show="item.qtyBal">余额: {{item.qtyBal}}</span>
                        <span v-show="item.taxRate">税率：{{item.taxRate}}</span>
                        <span v-show="item.promDeliTime">预期交货日：{{item.promDeliTime}}</span>
                    </div>
                    <!-- 物料数量和价格 -->
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
              </div>
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
          <pop-matter-list :show="showMaterielPop" v-model="showMaterielPop" @sel-matter="selMatter"
                           :default-value="matterList" get-list-method="getInventory7502" :params="matterParams"
                           ref="matter"></pop-matter-list>
        </div>
        <!--物料编辑pop-->
        <pop-matter :modify-matter='matter' :show-pop="showMatterPop" @sel-confirm='selConfirm' 
                    v-model='showMatterPop' :btn-is-hide="btnIsHide"></pop-matter>
       
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
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
import {XTextarea} from 'vux'
// 请求 引入
import {getSOList,} from 'service/detailService'
import {saveAndStartWf, getBaseInfoData, saveAndCommitTask, commitTask, getDictByType, submitAndCalc} from 'service/commonService'
// mixins 引入
import applyCommon from 'components/mixins/applyCommon'
// 组件引入
import PopDealerList from 'components/Popup/PopDealerList'
import PopMatterList from 'components/Popup/PopMatterList'
import PopWarehouseList from 'components/Popup/PopWarehouseList'
import PopSingleSelect from 'components/Popup/PopSingleSelect'
import PopMatter from 'components/apply/commonPart/MatterPop'
import RNumber from 'components/RNumber'
// 公共方法
import {accAdd,accMul} from '@/home/pages/maps/decimalsAdd'
import {toFixed} from '@/plugins/calc'

export default {
  name: 'ApplyCGRKForm',
  mixins: [applyCommon],
  components: {
    XTextarea,
    PopDealerList, PopWarehouseList, PopMatterList, PopSingleSelect,PopMatter,RNumber
  },
  data() {
    return {
      listId: '1c5896d8-1500-4569-b0c5-6b596d03fb9b',
      srhInpTx: '',                                   // 搜索框内容
      matterList: [],                                  // 订单列表
      DealerPaymentTerm: '现付',                        //结算方式
      transMode: ['现付', '预付', '账期', '票据'],          // 结算方式
      showDealerPop: false,                          // 是否显示供应商的popup
      dealerInfo: null, // 供应商客户信息
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
  watch: {
    matterList(val) {
      let data = {
        CGRK_DATA: {
          matter: this.matterList,
          dealer: this.dealerInfo,
          warehouse: this.warehouse
        }
      }
      this.$emit('sel-data', data)

    },
    dealerInfo(val) {
      if (this.matterList.length) {
        let data = {
          CGRK_DATA: {
            matter: this.matterList,
            dealer: this.dealerInfo,
            warehouse: this.warehouse
          }
        }
        this.$emit('sel-data', data)
      }

    },
    warehouse(val) {
      if (this.matterList.length) {
        let data = {
          CGRK_DATA: {
            matter: this.matterList,
            dealer: this.dealerInfo,
            warehouse: this.warehouse
          }
        }
        this.$emit('sel-data', data)
      }

    }
  },
  methods: {
    // 获取 结算方式
    getPaymentTerm(){
      return getDictByType('paymentTerm').then(({ tableContent }) => {
        this.transMode = tableContent;
      })
    },  
    // TODO 选中的供应商
    selDealer(val) {
      let [sel] = JSON.parse(val);
      this.dealerInfo = sel;
      this.matterParams = {
        ...this.matterParams,
        dealerCode: sel.dealerCode
      };
      this.crDealerPaymentTerm = this.dealerInfo.paymentTerm;
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
          item.tdQty = '';
          item.price = '';
        }
        item.taxRate = 0.16;
        item.promDeliTime = ''
      });
      this.numMap = {};
      this.matterList = sels;
    },
    // TODO 选择默认图片
    getDefaultImg(item) {
      let url = require('assets/wl_default02.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    // 滑动删除
    delClick(index, sItem) {
      let arr = this.selItems;
      let delIndex = arr.findIndex(item => item.inventoryCode === sItem.inventoryCode);
      //若存在重复的 则清除
      if (delIndex !== -1) {
        arr.splice(delIndex, 1);
        return;
      }
      arr.push(sItem);
    },
    // TODO 判断是否展示选中图标
    showSelIcon(sItem) {
      return this.selItems.findIndex(item => item.inventoryCode === sItem.inventoryCode) !== -1;
    },
    //全选
    checkAll(){
      if(this.selItems.length === this.matterList.length){
        this.selItems = [];
        return
      }
      this.selItems = JSON.parse(JSON.stringify(this.matterList));
    },
    //删除选中的
    deleteCheckd(){
      this.$vux.confirm.show({
        content: '确认删除?',
        // 确定回调
        onConfirm: () => {
          this.selItems.forEach(item=>{
              let index = this.matterList.findIndex(item2=>item2.inventoryCode === item.inventoryCode);
              if(index >= 0){
                this.matterList.splice(index,1);
              }
            })
          this.selItems = [];
          this.matterModifyClass = false;
        }
      })

    },
    // TODO 新增更多订单
    addOrder() {
      this.matterList.forEach(item => {
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
      if (!warn && !this.matterList.length) {
        warn = '请选择物料'
      }
      if (!warn) {
        // 校验
        this.matterList.every(item => {
          if (!item.price) {
            warn = '单价不能为空';
            return false
          }
          if (!item.tdQty) {
            warn = '数量不能为空';
            return false
          }
          // 设置提交参数
          let taxRate = item.taxRate || this.taxRate;
          let taxAmount = accMul(item.price, item.tdQty, taxRate);
          let oItem = {
            transObjCode: item.inventoryCode, // 物料编码
            assMeasureUnit: item.assMeasureUnit !== undefined ? item.assMeasureUnit : null, // 辅助计量（明细）
            assMeasureScale: item.assMeasureScale !== undefined ? item.assMeasureScale : null,  //与主计量单位倍数
            tdQty: item.tdQty, // 明细发生数
            thenQtyBal: item.thenQtyBal || 0, //余额
            tdProcessing: item.processing, //加工属性
            assistQty: item.assistQty || 0, // 辅计数量（明细）
            price: item.price, // 明细单价
            taxRate: taxRate, // 税率
            taxAmount: taxAmount, // 税金
            tdAmount: accAdd(accMul(item.price, item.tdQty), taxAmount), // 明细发生金额
            promDeliTime: item.promDeliTime , // 承诺交付时间
            comment: item.comment || '', // 说明
          };
          if (this.transCode) {
            oItem.tdId = item.tdId || null;
          }
          dataSet.push(oItem);
          return true
        })
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
              businessKey: 'POPI',
              createdBy: ''
            }
          };

          formData = {
            ...this.formData,
            handlerEntity: this.entity.dealerName,
            creator: this.transCode ? this.formData.handler : '',
            modifer: this.transCode ? this.formData.handler : '',
            dealerCreditContactPersonName: this.dealerInfo.creatorName || '', // 联系人姓名
            dealerCreditContactInformation: this.dealerInfo.dealerMobilePhone || '', // 联系人手机
            containerInWarehouseManager: this.warehouse.containerInWarehouseManager || null,
            inPut: {
              dealerCodeCredit: this.dealerInfo.dealerCode, // 供应商编码
              crDealerLabel: this.dealerInfo.dealerLabelName || '供应商', // 供应商页签
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
          //新增
          if (!this.transCode) {
            delete submitData.biReferenceId
          }
          //无工作流
          if(!this.processCode.length){
            operation = submitAndCalc;
            delete submitData.wfPara;
            delete submitData.biReferenceId;
          }
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
        this.matterList = dataSet;
        this.$loading.hide();
      })
    }
  },
  created() {
    let data = sessionStorage.getItem('CGRK_DATA');
    if (data) {
      this.matterList = JSON.parse(data).matter;
      this.dealerInfo = JSON.parse(data).dealer;
      this.warehouse = JSON.parse(data).warehouse;

    }
  },
}
</script>

<style lang='scss' scoped>
  @import './../../scss/bizApply';
  
  .pages {
  /deep/ .vux-no-group-title{
    margin-top:0;
  }
    /deep/ .weui-cells {
      font-size: .14rem;
      &:before {
        border-top: none;
      }
    }
  }
</style>
