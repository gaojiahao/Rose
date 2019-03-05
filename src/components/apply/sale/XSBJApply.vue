<template>
  <div class="pages">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list @sel-dealer="selDealer" @sel-contact="selContact" :defaultValue="dealerInfo" :dealer-params="dealerParams"
                         :defaultContact="contactInfo"></pop-dealer-list>
        <dealer-other-part :dealer-config="dealerConfig" :dealer-info="dealerInfo" v-model="dealerInfo"></dealer-other-part>
        <!-- 物料列表 -->
        <apply-matter-part v-model="showMaterielPop" :show-materiel-pop="showMaterielPop" :show-matter-pop="showMatterPop" :filter-list="filterList"
          :actions="actions" :btnInfo="btnInfo" :matter-list="matterList" :default-value="[]"
          :matter-pop-config="matterPopConfig" :matter-edit-config="matterEditConfig" :order-list-title="orderListTitle" :matter-params="matterParams"
          :add-matter-fn="addMatter" :sel-matter-fn="selMatter" :sel-items="selItems" :matter-modify-class="matterModifyClass"
          :stop-order-fn="stopOrder" :get-matter-modify-fn="getMatterModify" :show-delete-fn="showDelete" :show-sel-icon-fn="showSelIcon" :del-click-fn="delClick"
          :chosen-matter="matter" :check-amt-fn="checkAmt" :sel-confirm-fn="selConfirm" :btn-is-hide="btnIsHide" @show-down-modify-pop="shutDownModify">
          <template slot="info" slot-scope="{item}">
            <!-- 物料数量和价格 -->
            <div class='mater_other' v-if="item.price && item.tdQty">
              <div class='mater_price'>
                <span class="symbol">￥</span>{{item.price}}
              </div>
              <r-number :num="item.tdQty" :min="Number(item.qtyDownline)" :max="Number(item.qtyOnline)"
                        :checkAmt='checkQty' v-model="item.tdQty"></r-number>
            </div>
          </template>
        </apply-matter-part>
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>
    <op-button :is-modify="matterModifyClass" :hide="btnIsHide" :td-amount="tdAmount" :tax-amount="taxAmount"
               :all-check="selItems.length === matterList.length" @on-submit="submitOrder" @on-check-all="checkAll"
               @on-delete="deleteCheckd"></op-button>
  </div>
</template>

<script>
// vux组件引入
import {XTextarea, dateFormat} from 'vux'
// 请求 引入
import {getSOList} from 'service/detailService'
import {submitAndCalc, saveAndStartWf, getDictByType, saveAndCommitTask, updateData} from 'service/commonService'
import {getPriceRange} from 'service/materService'
// mixins 引入
import ApplyCommon from 'pageMixins/applyCommon'
// 组件引入
import RNumber from 'components/RNumber'
import UploadFile from 'components/upload/UploadFile'
import PopDealerList from 'components/Popup/PopDealerList'
import OpButton from 'components/apply/commonPart/OpButton'
import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
import ApplyMatterPart from 'components/apply/commonPart/applyMatterPart'
import DealerOtherPart from 'components/apply/commonPart/dealerOtherPart'
// 方法引入
import {toFixed} from '@/plugins/calc'
import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd'

const DRAFT_KEY = 'XSBJ_DATA';

export default {
  data() {
    return {
      taxRate: 0.16,
      listId: '58a607ce-fe93-4d26-a42e-a374f4662f1c',
      filterList: [
        {
          name: '物料名称',
          value: 'inventoryName',
        }, {
          name: '物料编码',
          value: 'inventoryCode',
        }
      ],
      transCode: '',
      formData: {},
      dealerInfo: {},
      contactInfo: {},
      transMode: [], // 结算方式 数组
      matterList: [], // 物料列表
      logisticsTerm: [], // 物流条款 数组
      showMaterielPop: false, // 是否显示物料的popup
    }
  },
  components: {
    XTextarea, RNumber, OpButton, 
    UploadFile, PopBaseinfo, PopDealerList, 
    DealerOtherPart, ApplyMatterPart
  },
  mixins: [ApplyCommon],
  methods: {
    // 获取 结算方式
    getPaymentTerm() {
      return getDictByType('paymentTerm').then(({tableContent}) => {
        this.transMode = tableContent;
      })
    },
    // 获取 物流条款
    getLogisticsTerms() {
      return getDictByType('dealerLogisticsTerms').then(({tableContent}) => {
        this.logisticsTerm = tableContent;
      })
    },
    // 展开可删除状态
    showDelete(){
      this.matterModifyClass = ! this.matterModifyClass;
      this.selItems = [];
    },
    // 选择要删除的物料
    delClick(sItem, index, key) {
      let arr = this.selItems;
      let delIndex = arr.findIndex(item => item.inventoryCode === sItem.inventoryCode);
      // 若存在重复的 则清除
      if (delIndex !== -1) {
        arr.splice(delIndex, 1);
        return;
      }
      arr.push(sItem);
    },
    // 判断是否展示选中图标
    showSelIcon(sItem, index) {
      return this.selItems.findIndex(item => item.inventoryCode === sItem.inventoryCode) !== -1;
    },
    // 全选
    checkAll() {
      if (this.selItems.length === this.matterList.length) {
        this.selItems = [];
        return
      }
      this.selItems = JSON.parse(JSON.stringify(this.matterList));
    },
    // 删除选中的
    deleteCheckd() {
      this.$vux.confirm.show({
        content: '确认删除?',
        // 确定回调
        onConfirm: () => {
          this.selItems.forEach(item => {
            let index = this.matterList.findIndex(item2 => item2.inventoryCode === item.inventoryCode);
            if (index >= 0) {
              this.matterList.splice(index, 1);
            }
          })
          this.selItems = [];
          this.matterModifyClass = false;
        }
      })
    },
    // 点击增加更多物料
    addMatter() {
      this.showMaterielPop = !this.showMaterielPop
    },
    // 选中往来项
    selDealer(val) {
      let [sels] = JSON.parse(val);
      this.dealerInfo = sels;
    },
    selContact(val) {
      this.contactInfo = {...val};
    },
    // 选中物料项
    selMatter(val) {
      let sels = JSON.parse(val);
      let matterList = JSON.parse(JSON.stringify(this.matterList))
      sels.forEach((item, index) => {
        this.getPriceRange(item, index);
        item.tdQty = '';
        item.price = '';
        item.taxRate = this.taxRate;
        item.assMeasureUnit = item.assMeasureUnit || item.invSubUnitName || null; // 辅助计量
        item.assMeasureScale = item.assMeasureScale || item.invSubUnitMulti || null; // 与单位倍数
        item.assMeasureDescription =  item.assMeasureDescription || item.invSubUnitComment || null; // 辅助计量说明
        matterList.push(item)
      });
      this.matterList = matterList;
    },
    // 获取默认图片
    getDefaultImg(item) {
      let url = require('assets/wl_default03.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    // 提交
    submitOrder() {
      let warn = '',
        dataSet = [];
      let validateMap = [
        {
          key: 'dealerInfo',
          message: '客户'
        },
        {
          key: 'matterList',
          message: '物料'
        }
      ];
      validateMap.every(item => {
        if (!Object.values(this[item.key]).length) {
          warn = `请选择${item.message}`;
          return false
        }
        return true
      });
      this.matterList.every(item => {
        let {tdQty, price} = item;
        if (!tdQty && tdQty !== 0) {
          warn = "请输入需求数量";
          return false;
        } else if (tdQty < item.qtyDownline) {
          warn = "需求数量不能小于最小需求数量";
          return false;
        } else if (tdQty > item.qtyOnline) {
          warn = "需求数量不能大于最大需求数量";
          return false;
        }
        if (!price) {
          warn = '请输入本次报价';
          return false
        } else if (price < item.specialReservePrice) {
          warn = "需求数量不能小于特批底价";
          return false;
        } else if (price > item.standardPrice) {
          warn = "需求数量不能大于标准价格";
          return false;
        }
        let taxRate = item.taxRate || this.taxRate;
        let taxAmount = accMul(item.price, item.tdQty, taxRate);
        let mItem = {
          inventoryName_transObjCode: item.inventoryName,
          transObjCode: item.inventoryCode,
          tdProcessing: item.processing,
          assMeasureUnit: item.assMeasureUnit || null, // 辅助计量
          assMeasureDescription: item.assMeasureDescription || null, // 辅助计量说明
          assMeasureScale: item.assMeasureScale || null, // 与单位倍数
          tdQty: item.tdQty,
          assistQty: item.assistQty,
          standardPrice: item.standardPrice,
          specialReservePrice: item.specialReservePrice,
          price: item.price,
          tdAmount: item.tdAmount, // 价税小计
          taxRate: taxRate, // 税金
          noTaxPrice: item.noTaxPrice,
          taxAmount: item.taxAmount, // 税金
          comment: item.comment || null,
        };
        if (this.transCode) {
          mItem.tdId = item.tdId || '';
        }
        dataSet.push(mItem);
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
          this.$HandleLoad.show();
          let operation = saveAndStartWf;
          let [first = {}] = this.matterList;
          let formData = {
            creator: this.formData.handler,
            ...this.formData,
            modifer: this.formData.handler,
            handlerEntity: this.entity.dealerName,
            dealerDebitContactPersonName: this.contactInfo.dealerName || '',
            dealerDebitContactInformation: this.contactInfo.dealerMobilePhone || '',
            drDealerLogisticsTerms: this.dealerInfo.dealerLogisticsTerms,
            order: {
              dealerDebit: this.dealerInfo.dealerCode || '',
              drDealerLabel: this.dealerInfo.dealerLabelName,
              drDealerPaymentTerm: this.dealerInfo.paymentTerm,
              validUntil: this.formData.validUntil,
              dataSet
            },
          };
          let submitData = {
            listId: this.listId,
            biComment: '',
            formData: JSON.stringify(formData),
            wfPara: JSON.stringify({
              [this.processCode]: {
                businessKey: this.businessKey,
                createdBy: formData.creator,
              }
            }),
          };
          // 若为重新提交，则修改提交参数
          if (this.transCode && !this.isModify) {
            operation = saveAndCommitTask;
            submitData.biReferenceId = this.biReferenceId;
            submitData.wfPara = JSON.stringify({
              businessKey: this.transCode,
              createdBy: formData.creator,
              transCode: this.transCode,
              result: 3,
              taskId: this.taskId,
              comment: ''
            });
          }
          // 无工作流
          if (!this.processCode.length) {
            operation = submitAndCalc;
            delete submitData.wfPara;
            delete submitData.biReferenceId;
          }
          if (this.biReferenceId) {
            submitData.biReferenceId = this.biReferenceId
          }
          if(this.isModify) {
            operation = updateData;
          }
          this.saveData(operation, submitData);
        }
      });
    },
    // 获取详情
    getFormData() {
      return getSOList({
        formViewUniqueId: this.formViewUniqueId,
        transCode: this.transCode
      }).then(data => {
        let {success = true, formData = {}, attachment = []} = data;
        // http200时提示报错信息
        if (!success) {
          this.$vux.alert.show({
            content: '抱歉，无法支持您查看的交易号，请确认交易号是否正确'
          });
          return;
        }
        let matterList = [];
        this.attachment = attachment;
        // 获取合计
        let {order} = formData;
        let {dataSet = []} = order;
        for (let item of dataSet) {
          item = {
            ...item,
            inventoryPic: item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
            inventoryName: item.inventoryName_transObjCode,
            inventoryCode: item.inventoryCode_transObjCode,
            specification: item.specification_transObjCode,
            processing: item.processing_transObjCode,
            inventoryType: item.inventoryType_transObjCode,
            inventorySubclass: item.inventorySubclass_transObjCode,
            measureUnit: item.measureUnit_transObjCode,
            inventoryColor: item.inventoryColor_transObjCode,
            material: item.material_transObjCode,
          };
          matterList.push(item);
        }
        // 客户信息
        this.dealerInfo = {
          creatorName: formData.dealerDebitContactPersonName || '', // 客户名
          dealerName: order.dealerName_dealerDebit || '', // 公司名
          dealerMobilePhone: formData.dealerDebitContactInformation || '', // 手机
          dealerCode: order.dealerDebit || '', // 客户编码
          dealerLabelName: order.drDealerLabel || '客户', // 关系标签
          province: order.province_dealerDebit || '', // 省份
          city: order.city_dealerDebit || '', // 城市
          county: order.county_dealerDebit || '', // 地区
          address: order.address_dealerDebit || '', // 详细地址
          paymentTerm: order.drDealerPaymentTerm,
          dealerLogisticsTerms: formData.drDealerLogisticsTerms,
        };
        this.contactInfo = {
          dealerName: formData.dealerDebitContactPersonName,
          dealerMobilePhone: formData.dealerDebitContactInformation,
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
          validUntil: dateFormat(formData.validUntil, 'YYYY-MM-DD'),
        }
        this.biReferenceId = formData.biReferenceId;
        this.matterList = matterList;
        this.$loading.hide();
      })
    },
    // 是否保存草稿
    hasDraftData() {
      if (!this.matterList.length) {
        return false
      }
      return {
        [DRAFT_KEY]: {
          matter: this.matterList,
          dealer: this.dealerInfo,
          formData: this.formData,
          contactInfo: this.contactInfo,
        }
      };
    },
    // 获取物料价格区间
    getPriceRange(item, index) {
      return getPriceRange({
        inventoryCode: item.inventoryCode,
      }).then(({tableContent}) => {
        let [data = {}] = tableContent;
        let defaultKey = ['qtyOnline', 'qtyDownline']
        // 动态添加字段
        for(let key in data) {
          // 针对已定义的字段进行赋值
          if(defaultKey.includes(key)) {
            item[key] = data[key]
            delete data[key];
          }
          else if(!item.hasOwnProperty(key)){
            this.$set(item, key, '');
          }
        }
        item.otherField = {...data};
      })
    },
    // 校验数量
    checkQty(item) {
      let {qtyDownline = 0, qtyOnline = 0, tdQty} = item;
      if (tdQty < qtyDownline) {
        tdQty = qtyDownline;
      }
      if (tdQty > qtyOnline) {
        tdQty = qtyOnline;
      }
      item.tdQty = Math.abs(toFixed(tdQty));
    },
    // 校验单价
    checkAmt(item, key, val) {
      console.log('item:', item);
      let {standardPrice = 0, specialReservePrice = 0, price} = item;
      console.log('price:', price)
      if (price < specialReservePrice) {
        price = specialReservePrice;
      }
      else if (price > standardPrice) {
        price = standardPrice;
      }
      item.price = Math.abs(toFixed(price));
    },
    // 校验税率
    checkRate(item) {
      item.taxRate = Math.abs(toFixed(item.taxRate));
    },
  },
  created() {
    let data = sessionStorage.getItem(DRAFT_KEY);
    if (data) {
      this.matterList = JSON.parse(data).matter;
      this.dealerInfo = JSON.parse(data).dealer;
      this.formData = JSON.parse(data).formData;
      this.contactInfo = JSON.parse(data).contactInfo;
      sessionStorage.removeItem(DRAFT_KEY)
    }
  }
}
</script>

<style lang="scss" scoped>
  @import './../../scss/bizApply';
</style>
