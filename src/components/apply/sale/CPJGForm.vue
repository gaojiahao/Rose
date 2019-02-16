<template>
  <div class="pages">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <!-- 物料列表 -->
        <apply-matter-part v-model="showMaterielPop" :show-materiel-pop="showMaterielPop"
          :actions="actions" :btnInfo="btnInfo" :matter-list="matterList" :default-value="matterList" 
          :matter-pop-config="matterPopConfig" :matter-edit-config="matterEditConfig" :order-list-title="orderListTitle" :matter-params="matterParams"
          :addMatter="addMatter" :sel-matter="selMatter" :sel-items="selItems" :matter-modify-class="matterModifyClass"
          :modify-matter="modifyMatter" :show-delete="showDelete" :show-sel-icon="showSelIcon" :del-click="delClick">
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
        <!--物料编辑pop-->
        <pop-matter :modify-matter='matter' :show-pop="showMatterPop" @sel-confirm='selConfirm'
                    v-model='showMatterPop' :btn-is-hide="btnIsHide" :config="matterEditConfig">
        </pop-matter>
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class='btn-no-amt vux-1px-t' :class="{btn_hide : btnIsHide}" v-if="!matterModifyClass">
      <div class="btn-item" @click="save">提交</div>
    </div>
    <!-- 底部删除确认栏 -->
    <div class="count_mode vux-1px-t delete_mode" :class="{btn_hide : btnIsHide}" v-else>
      <div class='count_num all_checked' @click="checkAll">
        <x-icon type="ios-circle-outline" size="20" class='outline'
                v-show="selItems.length !== matterList.length"></x-icon>
        <x-icon type="ios-checkmark" size="20" class="checked" v-show="selItems.length === matterList.length"></x-icon>
        全选
      </div>
      <div class='delete_btn' @click="deleteCheckd">删除</div>
    </div>
  </div>
</template>

<script>
// vux组件引入
import { Icon, XTextarea, dateFormat } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
import { submitAndCalc, saveAndStartWf, saveAndCommitTask } from 'service/commonService'
// mixins 引入
import ApplyCommon from 'pageMixins/applyCommon'
// 组件引入
import RPicker from 'components/RPicker'
import PopMatter from 'components/apply/commonPart/MatterPop'
import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
import ApplyMatterPart from 'components/apply/commonPart/applyMatterPart'

// import { toFixed } from '@/plugins/calc'
const DRAFT_KEY = 'CPJG_DATA';
export default {
  mixins: [ApplyCommon],
  data() {
    return {
      showPop: false,
      transCode: '',
      formData: {
        biId: '',
        biComment: '',
        biProcessStatus: ''
      },
      priceMap: {},
      matterList: [], // 物料列表
      showMaterielPop: false, // 是否显示物料的popup
    }
  },
  components: {
    Icon, RPicker, XTextarea, 
    PopMatter, PopBaseinfo, ApplyMatterPart
  },
  methods: {
    // 选择要删除的物料
    delClick (index, sItem) {
      let arr = this.selItems;
      let delIndex = arr.findIndex(item => item.inventoryCode === sItem.inventoryCode);
      // 若存在重复的 则清除
      if (delIndex !== -1) {
        arr.splice(delIndex, 1);
        return;
      }
      arr.push(sItem);
    },
    // TODO 判断是否展示选中图标
    showSelIcon (sItem) {
      return this.selItems.findIndex(item => item.inventoryCode === sItem.inventoryCode) !== -1;
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
    // TODO 点击增加更多物料
    addMatter () {
      this.matterList.forEach(item => {
        // 存储已输入的价格
        this.priceMap[item.inventoryCode] = {
          price: item.price,  // 标准价格
          qtyOnline: item.qtyOnline,  // 数量上线
          qtyDownline: item.qtyDownline,  // 数量下线
          drDealerLabel: item.drDealerLabel,  // 客户类型
          specialReservePrice: item.specialReservePrice,
        };
      });
      // this.showPop = !this.showPop;
      this.showMaterielPop = !this.showMaterielPop
    },
    // TODO 选中物料项
    selMatter (val) {
      let sels = JSON.parse(val);
      sels.forEach(item => {
        let defaultValue = this.priceMap[item.inventoryCode] || {};
        item.price = defaultValue.price || '';
        item.qtyOnline = defaultValue.qtyOnline || '';
        item.qtyDownline = defaultValue.qtyDownline || '';
        item.drDealerLabel = defaultValue.drDealerLabel || [];
        item.specialReservePrice = defaultValue.specialReservePrice || '';
      });
      this.priceMap = {};
      this.matterList = [...sels];
    },
    // TODO 获取默认图片
    getDefaultImg (item) {
      let url = require('assets/wl_default03.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    // TODO 提交
    save () {
      let warn = '',
          dataSet = [];
      if(!this.matterList.length){
        warn = '请选择物料'
      }
      if (!warn) {
        this.matterList.every(item => {
          this.matterEditConfig.editPart.every(vItem => {
            if(!vItem.hiddenInRun && !vItem.allowBlank) {
              if ((Array.isArray(item[vItem.fieldCode]) && !item[vItem.fieldCode].length) || !item[vItem.fieldCode]) {
                warn = `${vItem.text}不能为空`;
              }
              return !warn
            }
          });
          let mItem = {
            comment: '',
            price: item.price,
            qtyOnline: item.qtyOnline,
            qtyDownline: item.qtyDownline,
            transObjCode: item.inventoryCode,
            drDealerLabel: item.drDealerLabel[0],
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
          if (this.transCode) {
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
          this.saveData(operation, submitData);
        }
      });
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
    // TODO 是否保存草稿
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
@import './../../scss/bizApply';
</style>
