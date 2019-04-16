<template>
<!--开票申请-->
  <div class="pages xmjh-apply-container">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list :defaultValue="dealerInfo" :default-contact="contactInfo" :dealer-params="dealerParams"
                         @sel-dealer="selDealer" @sel-contact="selContact"></pop-dealer-list>
        <!-- 物料列表 -->
         <apply-matter-part v-model="showMaterielPop" :show-materiel-pop="showMaterielPop" :show-matter-pop="showMatterPop" :filter-list="filterList"
          :actions="actions" :btnInfo="btnInfo" :matter-list="orderList" 
          :matter-pop-config="matterPopConfig" :matter-edit-config="matterEditConfig" :order-list-title="orderListTitle" :matter-params="matterParams"
          :add-matter-fn="addMatter" :sel-matter-fn="selMatter" :matter-modify-class="matterModifyClass"
          :stop-order-fn="stopOrder" :get-matter-modify-fn="getMatterModify" :show-delete-fn="showDelete" :show-sel-icon-fn="showSelIcon" :del-click-fn="delClick"
          :chosen-matter="matter" :check-amt-fn="checkAmt" :sel-confirm-fn="selConfirm" :btn-is-hide="btnIsHide" @show-down-modify-pop="shutDownModify">
        </apply-matter-part>
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <p class="commit-label vux-1px-b">备注栏</p>
          <x-textarea v-model="formData.biComment" placeholder="请输入"></x-textarea>
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
  import {
   dateFormat, XTextarea, 
  } from 'vux'
  // 请求 引入
  import {submitAndCalc, saveAndStartWf, saveAndCommitTask, updateData} from 'service/common/commonService'
  import {getSOList} from 'service/detailService'
  // mixins 引入
  import ApplyCommon from 'mixins/applyCommon'
  // 组件引入
  import RNumber from 'components/public/RNumber'
  import PopDealerList from 'components/Popup/PopDealerList'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import OpButton from 'components/apply/commonPart/OpButton'
  // 方法引入
  import {accAdd, accMul, accDiv, accSub} from 'plugins/calc/decimalsAdd'
  import { toFixed } from '@/plugins/calc'
  import ApplyMatterPart from 'components/apply/commonPart/applyMatterPart'
  const DRAFT_KEY = 'KPSQ_DATA';
  export default {
    mixins: [ApplyCommon],
    components: {
      ApplyMatterPart,
      RNumber,
      XTextarea, PopDealerList, PopBaseinfo, OpButton
    },
    data() {
      return {
        taxRate: 0.16,
        modifyKey: null,
        showMatterPop: false,
        showMaterielPop: false,
        filterList: [
          {
            name: '物料名称',
            value: 'inventoryName',
          }, {
            name: '物料编码',
            value: 'inventoryCode',
          }, {
            name: '出库单',
            value: 'transCode',
          }
        ],
        orderList: {},
        dealerInfo: {}, //客户信息
        contactInfo: {}, // 联系人信息
        formData: {
          biProcessStatus: '',
          biComment: ''
        },
        selItems: {}
      }
    },
    computed: {
      // 基于 orderList 此处重组 matterList 数据
      matterList() {
        let arr = [];
        for (let items of Object.values(this.orderList)) {
          for (let item of items) {
            arr.push(item);
          }
        }
        return arr;
      },
    },
    methods: {
      // 选中的客户
      selDealer(val) {
        this.dealerInfo = JSON.parse(val)[0];
        if (this.matterParams.data.dealerCode != null) {
          this.matterParams.data.dealerCode = this.dealerInfo.dealerCode;
          this.orderList = {}
        }  
      },
      // 选中联系人
      selContact(item) {
        this.contactInfo = {...item,}
      },
      // 显示物料修改的pop
      getMatterModify(item, index, key) {
        this.matter = JSON.parse(JSON.stringify(item));
        this.showMatterPop = true;
        this.modifyIndex = index;
        this.modifyKey = key;
      },
      // 更新修改后的物料信息
      selConfirm(val) {
        let modMatter = JSON.parse(val);
        this.$set(this.orderList[this.modifyKey], this.modifyIndex, modMatter);
      },
      // 选中物料项
      selMatter(val) {
        let sels = JSON.parse(val);
        let orderList = JSON.parse(JSON.stringify(this.orderList));
        sels.forEach(item => {
          let orderListKey = item.transCode ? item.transCode : 'noCode';
          item.tdQty = item.qtyBal || '';
          item.taxRate = this.taxRate;
          item.assMeasureUnit = item.assMeasureUnit || item.invSubUnitName || null; // 辅助计量
          item.assMeasureScale = item.assMeasureScale || item.invSubUnitMulti || null; // 与单位倍数
          item.assMeasureDescription =  item.assMeasureDescription || item.invSubUnitComment || null; // 辅助计量说明
          item.promDeliTime = '';
          item.dateActivation = dateFormat(item.dateActivation, 'YYYY-MM-DD');
          item.executionDate = dateFormat(item.executionDate, 'YYYY-MM-DD');
          // 如果有单号
          if (item.transCode){
            if (!orderList[orderListKey]) {
              orderList[orderListKey] = [];
            }
            orderList[orderListKey].push(item);
          }
          else {
            if (!orderList['noCode']) {
              orderList['noCode'] = []
            }
            orderList['noCode'].push(item);
          }
        });
        this.orderList = orderList;
      },
      //选择默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default03.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // 展开可删除状态
      showDelete(){
        this.matterModifyClass = ! this.matterModifyClass;
        this.selItems = {};
      },
      // 选择要删除的物料
      delClick(sItem, index, key) {
        if (this.selItems[key]){
          let arr = this.selItems[key];
          let delIndex = arr.findIndex(item => item === index);
          if (delIndex !== -1) {
            arr.splice(delIndex, 1);
            if (!arr.length) delete this.selItems[key]
            return;
          }
          arr.push(index);
        }
        else {
          this.$set(this.selItems, key, [index])
        }
         
      },
      // 判断是否展示选中图标
      showSelIcon(sItem, index) {
        return this.selItems[sItem.transCode] && this.selItems[sItem.transCode].length
              && this.selItems[sItem.transCode].findIndex(item => item === index) !== -1;
      },
      // 全选
      checkAll() {
        // 要删除的物料数量等于当前物料数量
        if (this.checkList.length === this.consumableList.length){
          this.selItems = {};
          return
        }
        let obj = {};
        for (let key in this.orderList){
          this.orderList[key].foeEach((item, index) => {
            if (!obj[item.transCode]){
              obj[item.transCode] = [];
            }
            obj[item.transCode].push(index)
          })
        }
        this.selItems = obj;
      },
      // 删除选中的
      deleteCheckd() {
        this.$vux.confirm.show({
          content: '确认删除?',
          // 确定回调
          onConfirm: () => {
            for (let key in this.selItems){
              var newIndexs =   this.selItems[key].map((val, idx) => {return val - idx})
              // 将orderList中对应交易号的物料列表按照selItems中的索引删除
              newIndexs.forEach((sItem, sIndex) => {
                this.orderList[key].splice(sItem, 1)
                if (!this.orderList[key].length){
                  delete this.orderList[key]
                }  
              }) 
            }
            this.selItems = {};
            this.matterModifyClass = false;
          }
        })
      },
      // 新增更多物料
      addMatter() {
        this.showMaterielPop = !this.showMaterielPop;
      },
      // 提交
      submitOrder() {
        /** 
         * @warn    提示文字
         * @dateSet   提交数据
         * 
         */ 
      
        let warn = '', dataSet = [];
        if (!this.dealerInfo.dealerCode) {
          warn = '请选择客户信息';
        }
        // 校验 <物料部分> 必填字段 同时动态组装dateSet
        if (!warn) {
          // 校验 是否已选择 <物料部分>
          let [ matterPart = {} ] = this.submitMatterField;
          if (!Object.keys(this.orderList).length) warn = `请选择${matterPart.text}`;
          // 动态组装 dataSet
          for (let items of Object.values(this.orderList)) {
            for (let item of items) {
              let oItem = {};
              for (let sItem of this.submitMatterField){
                let val = item[sItem.fieldCode] || item[sItem.displayField] || item[sItem.showFieldCode];
                if (sItem.text){
                  if (!sItem.hidden && !sItem.allowBlank && !val && val !== undefined){
                    if (sItem.text) warn = `${sItem.text}不为空`;
                    break;
                  }
                  oItem[sItem.fieldCode] = val !== undefined ? val : '';
                } 
              }
              dataSet.push(oItem);
            }
          }
        }
        if (warn) {
          this.$vux.alert.show({
            content: warn
          })
          return
        }
        this.$vux.confirm.show({
          content: '确认提交?',
          onConfirm: () => {
            this.$HandleLoad.show();
            let operation = saveAndStartWf;
            let wfPara = {
              [this.processCode]: {
                businessKey: this.businessKey, 
                createdBy: JSON.stringify(this.formData.handler)
              }
            }
            if (this.isResubmit && !this.isModify) {
              wfPara = {
                businessKey: this.transCode,
                createdBy: this.formData.handler,
                transCode: this.transCode,
                result: 3,
                taskId: this.taskId,
                comment: ""
              }
            }
            let submitData = {
              listId: this.listId,
              biComment: '',
              formData: JSON.stringify({
                ...this.formData,
                handlerEntity: this.entity.dealerName,
                creator: this.formData.handler,
                modifer: this.formData.handler,
                order: {
                  crDealerLabel: '客户',
                  dealerCodeCredit: this.dealerInfo.dealerCode,
                  dataSet: dataSet,
                },
                dealerCreditContactPersonName: this.contactInfo.dealerName || null,
                dealerCreditContactInformation: this.contactInfo.dealerMobilePhone || '',
              }),
              wfPara: JSON.stringify(wfPara)
            };
            // 重新提交
            if (this.isResubmit) {
              submitData.biReferenceId = this.biReferenceId;
              operation = saveAndCommitTask
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
            if (this.isModify) {
              operation = updateData;
            }
            this.saveData(operation, submitData);
          }
        });
      },
      // 获取订单信息用于重新提交
      getFormData() {
        return getSOList({
          formViewUniqueId: this.formViewUniqueId,
          transCode: this.transCode
        }).then((data) => {
          this.listId = data.listId;
          this.biComment = data.biComment;
          this.biReferenceId = data.biReferenceId;
          this.attachment = data.attachment;
          let orderList = {};
          let {formData} = data;
          let { order = {} } = formData;
          order.dataSet.map(item => {
            item = {
              ...item,
              inventoryPic: item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
              inventoryName: item.inventoryName_transObjCode,
              inventoryCode: item.inventoryCode_transObjCode,
              specification: item.specification_transObjCode,
              processing: item.tdProcessing || '商品',
              measureUnit: item.measureUnit_transObjCode,
              clientInventoryName: item.dealerInventoryName,
              clientInventoryCode: item.dealerInventoryCode,
              qty: item.thenTotalQtyBal,
              stockQty: item.thenLockQty,
              qtyBal: item.thenQtyBal,
              transCode: item.transMatchedCode,
              invSubUnitMulti: item.assMeasureScale,
            };
            this.matterList.push(item);
            if (!orderList[item.transCode]) {
              orderList[item.transCode] = [];
            }
            orderList[item.transCode].push(item);
          });
          this.handlerDefault = {
            handler: formData.handler,
            handlerName: formData.handlerName,
            handlerUnit: formData.handlerUnit,
            handlerUnitName: formData.handlerUnitName,
            handlerRole: formData.handlerRole,
            handlerRoleName: formData.handlerRoleName,
          };
          this.orderList = orderList;
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
          // 客户信息展示
          this.dealerInfo = {
            creatorName: formData.dealerCreditContactPersonName, // 客户名
            dealerName: order.dealerName_dealerCodeCredit, // 公司名
            dealerMobilePhone: formData.dealerCreditContactInformation, // 手机
            dealerContactPersonName: formData.dealerCreditContactPersonName, // 联系人
            dealerCode: order.dealerCodeCredit, // 客户编码
            dealerLabelName: order.crDealerLabel, // 关系标签
            province: order.province_dealerCodeCredit, // 省份
            city: order.city_dealerCodeCredit, // 城市
            county: order.county_dealerCodeCredit, // 地区
            address: order.address_dealerCodeCredit, // 详细地址
          };
          // 订单信息
          this.contactInfo = {
            dealerName: formData.dealerCreditContactPersonName, //联系人
            dealerMobilePhone: formData.dealerCreditContactInformation,//电话
          };
          // 物料列表请求参数
          this.matterParams.data.dealerCode = this.dealerInfo.dealerCode,
          this.$loading.hide();
        })
      },
      // 保存草稿数据
      hasDraftData() {
        // 是否选择客户
        if (!Object.values(this.dealerInfo).length) {
          return false
        }
        return {
          [DRAFT_KEY]: {
            handlerDefault: this.handlerDefault,
            dealer: this.dealerInfo,
            list: this.orderList,
            contactInfo: this.contactInfo,
          }
        };
      },
    },
    created() {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        let draft = JSON.parse(data);
        this.handlerDefault = draft.handlerDefault;
        this.dealerInfo = draft.dealer;
        this.orderList = draft.list;
        this.contactInfo = draft.contactInfo;
        this.matterParams.data.dealerCode = this.dealerInfo.dealerCode;
        sessionStorage.removeItem(DRAFT_KEY);
      }
    },
  }
</script>

<style lang="scss" scoped>
  @import '~scss/biz-app/bizApply';
  .mater_more {
    color: #757575;
    font-size: 0.1rem;
    margin-top: .02rem;
    word-break: break-all;
    span {
      margin-right: .04rem;
      .mater_color {
        margin-right: 0;
      }
    }
  }
  .xmjh-apply-container {
    /deep/ .weui-cells {
      margin-top: 0;
      font-size: .16rem;
      &:before {
        border-top: none;
      }
      &:after {
        border-bottom: none;
      }
      .weui-cell {
        padding: 10px 0;
        &:before {
          left: 0;
        }
      }
    }
  }

  .vux-cell-box:not(:first-child):before {
    left: 0;
  }

  .XMJH_add {
    text-align: center;
    font-size: 0.12rem;
    padding: 0.1rem 0;
    color: #757575;
    span {
      color: #fff;
      padding: .01rem .04rem;
      border-radius: .12rem;
      &:nth-child(1) {
        background: #5077aa;
      }
      &:nth-child(3) {
        background: #fc3c3c;
      }
    }
    em {
      font-style: normal;
    }
  }
</style>
