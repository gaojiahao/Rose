<template>
<!--产品价格-->
  <div class="pages">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <!-- 物料列表 -->
        <apply-matter-part v-model="showMaterielPop" :show-materiel-pop="showMaterielPop" :show-matter-pop="showMatterPop" :filter-list="filterList"
          :actions="actions" :btnInfo="btnInfo" :matter-list="matterList" 
          :matter-pop-config="matterPopConfig" :matter-edit-config="matterEditConfig" :order-list-title="orderListTitle" :matter-params="matterParams"
          :add-matter-fn="addMatter" :sel-matter-fn="selMatter" :sel-items="selItems" :matter-modify-class="matterModifyClass"
          :stop-order-fn="stopOrder" :get-matter-modify-fn="getMatterModify" :show-delete-fn="showDelete" :show-sel-icon-fn="showSelIcon" :del-click-fn="delClick"
          :chosen-matter="matter" :check-amt-fn="checkAmt" :sel-confirm-fn="selConfirm" :btn-is-hide="btnIsHide" @show-down-modify-pop="shutDownModify">
          <template slot="info" slot-scope="{item}">
            <div class='mater_other'>
              <div>
                <span v-if="item.price" class="price">
                  标准价格: <span class="mater_price"><span class="symbol">￥</span>{{item.price}}</span>
                </span>
                <span v-if="item.specialReservePrice" class="price">
                  特批底价: <span class="mater_price"><span class="symbol">￥</span>{{item.specialReservePrice}}</span>
                </span>
              </div>
            </div>
          </template>
        </apply-matter-part>
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <p class="commit-label vux-1px-b">备注栏</p>
          <x-textarea v-model="formData.biComment" placeholder="请输入"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>
    <!-- 底部按钮 -->
    <op-button :is-modify="matterModifyClass" :hide="btnIsHide" :td-amount="tdAmount" :tax-amount="taxAmount"
               :all-check="selItems.length === matterList.length" @on-submit="submitOrder" @on-check-all="checkAll"
               @on-delete="deleteCheckd"></op-button>
  </div>
</template>

<script>
// vux组件引入
import { Icon, XTextarea, dateFormat } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
import { updateData, submitAndCalc, saveAndStartWf, saveAndCommitTask } from 'service/common/commonService'
// mixins 引入
import ApplyCommon from 'mixins/applyCommon'
// 组件引入
import RPicker from 'components/public/RPicker'
import OpButton from 'components/apply/commonPart/OpButton'
import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
import ApplyMatterPart from 'components/apply/commonPart/applyMatterPart'

const DRAFT_KEY = 'CPJG_DATA';
export default {
  mixins: [ApplyCommon],
  data() {
    return {
      transCode: '',
      formData: {},
      priceMap: {},
      matterList: [], // 物料列表
      showMaterielPop: false, // 是否显示物料的popup
      filterList: [
        {
          name: '物料名称',
          value: 'inventoryName',
        }, {
          name: '物料编码',
          value: 'inventoryCode',
        }
      ],
    }
  },
  components: {
    Icon, RPicker, XTextarea, 
    OpButton, PopBaseinfo, ApplyMatterPart
  },
  methods: {
    // 选择要删除的物料
    delClick(sItem, index, key) {
      let arr = this.selItems;
      let delIndex = arr.findIndex(item => item === index);
      //若存在重复的 则清除
      if (delIndex !== -1) {
        arr.splice(delIndex, 1);
        return;
      }
      arr.push(index);
    },
    // 判断是否展示选中图标
    showSelIcon(sItem, index) {
      return this.selItems.includes(index);
    },
    // 点击编辑
    showDelete(){
      this.matterModifyClass = ! this.matterModifyClass;
      this.selItems = [];
    },
    // 全选
    checkAll() {
      if (this.selItems.length === this.matterList.length) {
        this.selItems = [];
        return
      }
      this.selItems = this.matterList.map((item, index) => index);
    },
    // 删除选中的
    deleteCheckd () {
      this.$vux.confirm.show({
        content: '确认删除?',
        // 确定回调
        onConfirm: () => {
          let orderList = {};
          let selItems = this.selItems;
          // 没被删除的
          let remainder = this.matterList.filter((item, index) => !selItems.includes(index)); 
          this.matterList = remainder;
          this.selItems = [];
          this.matterModifyClass = false;
        }
      })
    },
    // 点击增加更多物料
    addMatter () {
      this.showMaterielPop = !this.showMaterielPop
    },
    // 选中物料项
    selMatter (val) {
      let sels = JSON.parse(val);
      let matterList = JSON.parse(JSON.stringify(this.matterList));
      sels.forEach(item => {
        item.price = '';
        item.qtyOnline = '';
        item.qtyDownline = '';
        item.drDealerLabel = '';
        item.specialReservePrice = '';
        matterList.push(item)
      });
      this.priceMap = {};
      this.matterList = matterList;
    },
    // 获取默认图片
    getDefaultImg (item) {
      let url = require('assets/wl_default03.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    // 提交
    submitOrder () {
      let warn = '',
          dataSet = [];
      if (!this.matterList.length){
        warn = '请选择物料'
      }
      if (!warn) {
        this.matterList.every(item => {
          this.matterEditConfig.editPart.every(vItem => {
            if (!vItem.hiddenInRun && !vItem.allowBlank) {
              if ((Array.isArray(item[vItem.fieldCode]) && !item[vItem.fieldCode].length) || (!item[vItem.fieldCode]&&item[vItem.fieldCode].toString()=='')) {
                warn = `${vItem.text}不能为空`;
              }
              return !warn
            }
          });
          let mItem = {
            price: item.price,
            comment: item.comment,
            qtyOnline: item.qtyOnline,
            qtyDownline: item.qtyDownline,
            transObjCode: item.inventoryCode,
            drDealerLabel: item.drDealerLabel,
            specialReservePrice: item.specialReservePrice
          };
          if (this.transCode) {
            mItem.tdId = item.tdId || '';
          }
          dataSet.push(mItem);
          return !warn
        });
      }
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
          let formData = {
            ...this.formData,
            order: { dataSet },
            creator: this.formData.handler,
            modifer: this.formData.handler,
            handlerEntity: this.entity.dealerName,
          };
          let submitData = {
            biComment: '',
            listId: this.listId,
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
              taskId: this.taskId,
              result: 3,
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
          if (this.isModify) {
            operation = updateData;
          }
          this.saveData(operation, submitData);
        }
      });
    },
    // 获取详情
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
        let matterList = [];
        this.attachment = attachment;
        // 获取合计
        let {order} = formData;
        let {dataSet = []} = order;
        for (let item of dataSet) {
          item = {
            ...item,
            inventoryCode: item.transObjCode,
            inventoryName: item.inventoryName_transObjCode,
            measureUnit:item.measureUnit_transObjCode,
            specification: item.specification_transObjCode,
            PopDealerLabel: [item.drDealerLabel],
            inventoryPic: item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
          };
          matterList.push(item);
        }
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
        this.biReferenceId = formData.biReferenceId;
        this.matterList = matterList;
        this.$loading.hide();
      })
    },
    // 是否保存草稿
    hasDraftData () {
      if (!this.matterList.length) {
        return false
      }
      return {
        [DRAFT_KEY]: {
          matter: this.matterList,
          formData: this.formData
        }
      };
    },
  },
  created () {
    let data = sessionStorage.getItem(DRAFT_KEY);
    if (data) {
      this.matterList = JSON.parse(data).matter;
      this.formData = JSON.parse(data).formData;
      sessionStorage.removeItem(DRAFT_KEY)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~scss/biz-app/bizApply';
.price {
  font-size: .12rem;
  & + .price {
    margin-left: .06rem;
  }
}
</style>
