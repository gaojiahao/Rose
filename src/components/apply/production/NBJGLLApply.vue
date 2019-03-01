<template>
  <div class="pages nbjgll-apply-container">
    <div class="basicPart no_count" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 入库仓库-->
        <pop-warehouse-list isRequired title="入库仓库" :default-value="warehouseIn" @sel-item="selWarehouseIn"></pop-warehouse-list>
        <!-- 物料列表 -->
        <div class="materiel_list">
          <!-- 没有选择物料 -->
          <template v-if="!Object.keys(orderList).length">
            <div @click="showOrderPop = !showOrderPop">
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
              <div class="each_mater" :class="{'vux-1px-b' : index < (Object.keys(orderList).length - 1)}" v-for="(oItem, key,index) in orderList" :key="key">
                <div class="order_code" v-if='oItem.length'>
                  <span class="order_title">加工订单号</span>
                  <span class="order_num">{{key}}</span>
                </div>
                <div :class="{mater_delete : matterModifyClass}" v-for="(item, index) in oItem" :key="index">
                  <matter-item :item="item" @on-modify="getMatterModify(item, index, key)" :show-delete="matterModifyClass"
                              @click.native="delClick(index, item, key)">
                    <template slot-scope="{item}" slot="info">
                      <!-- 物料属性和单位 -->
                      <div class='mater_more'>
                        <span>单位: {{item.measureUnit}}</span>
                        <span>待领料: {{item.qtyBal}}</span>
                        <span>可用库存: {{item.qtyStock}}</span>
                      </div>
                      <div class="mater_other">
                        <div class="matter-remain" v-if="item.warehouseName">
                          <i class="iconfont icon--"></i>
                          <span>{{item.warehouseName}}</span>
                        </div>
                        <div class="matter-remain" v-if="item.tdQty">
                          <span class="symbol">本次领料: </span>{{item.tdQty}}
                        </div>
                      </div>
                    </template>
                    <template slot="edit" slot-scope="{item}">
                      <div class='mater_other' @click="getMatterModify(item, index, key)" v-if="!item.tdQty && !matterModifyClass">
                        <div class="edit-tips" >点击进行填写</div>
                      </div>
                    </template>
                  </matter-item>
                  <div class='delete_icon' @click="delClick(index, item, key)" v-if='matterModifyClass'>
                    <x-icon type="ios-checkmark" size="20" class="checked" v-show="showSelIcon(item)"></x-icon>
                    <x-icon type="ios-circle-outline" size="20" v-show="!showSelIcon(item)"></x-icon>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <!-- 新增更多 按钮 -->
          <div class="handle_part" v-if="Object.keys(orderList).length && !matterModifyClass">
            <span class="add_more stop" v-if="this.actions.includes('stop')"
                  @click="stopOrder">终止提交</span>
            <span class="symbol" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>或</span>
            <span class="add_more" @click="addOrder">新增更多物料</span>
          </div>
          <!-- 物料popup -->
          <pop-order-xqtj-list :show="showOrderPop" v-model="showOrderPop" @sel-matter="selOrder"
                               :default-value="orderList" list-method="getManyWhProcessingPicking"
                               ref="order">
            <template slot="qtyBal" slot-scope="{item}">
              <span>待领料余额: {{item.qtyBal}}</span>
            </template>
            <template slot="qtyStock" slot-scope="{item}">
              <div class="mater-balance">可用库存: {{item.qtyStock}}{{item.measureUnit}}</div>
            </template>
          </pop-order-xqtj-list>
        </div>
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
        <!--物料编辑pop-->
        <pop-matter :modify-matter='matter' :show-pop="showMatterPop" @sel-confirm='selConfirm' v-model='showMatterPop'
                    :btn-is-hide="btnIsHide" :is-show-amount="false">
          <template slot="qtyBal" slot-scope="{modifyMatter}">
            <span></span>
          </template>
          <template slot="modify" slot-scope="{modifyMatter}">
            <group class="mg_auto">
              <x-input title="本次领料" type="number" v-model.number='modifyMatter.tdQty' text-align="right"
                      @on-blur="checkAmt(modifyMatter)" @on-focus="getFocus($event)" placeholder="请输入"></x-input>
              <cell title="可用库存" :value="modifyMatter.qtyStock"></cell>
              <cell title="待领料" :value="modifyMatter.qtyBal"></cell>
            </group>
          </template>
        </pop-matter>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class='btn-no-amt vux-1px-t' :class="{'btn_hide' : btnIsHide}" v-if="!matterModifyClass">
      <div class="btn-item" @click="submitOrder">提交</div>
    </div>
    <!-- 底部删除确认栏 -->
    <div class="count_mode vux-1px-t delete_mode" v-else>
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
// vux插件引入
import { Icon, Cell, Group, XInput, XTextarea } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
import { submitAndCalc, saveAndStartWf, saveAndCommitTask } from 'service/commonService'
// minxins 引入
import ApplyCommon from 'pageMixins/applyCommon'
// 组件引入
import RNumber from 'components/RNumber'
import PopWarehouseList from 'components/Popup/PopWarehouseList'
import PopMatter from 'components/apply/commonPart/MatterPop'
import PopOrderList from 'components/Popup/PopOrderList'
import PopOrderXqtjList from 'components/Popup/PopOrderXQTJList'
import RPicker from 'components/RPicker'
import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
import {toFixed} from '@/plugins/calc'

const DRAFT_KEY = 'NBJGLL_DATA';
export default {
  mixins: [ApplyCommon],
  components: {
    Icon, Cell, Group, XInput, XTextarea,
    RNumber, PopOrderList, PopWarehouseList, PopMatter, RPicker, PopBaseinfo, PopOrderXqtjList
  },
  data() {
    return {
      listId: '762b8df4-2555-4325-884a-355f34355832',
      orderList: {}, // 订单列表
      matterList: [], // 物料列表
      showOrderPop: false, // 是否显示物料的popup
      transCode: '',
      formData: {
        biComment: '',
      },
      numMap: {},
      warehouseIn: null,
      matter: {},
      showMatterPop :false,
      modifyIndex: null,
    }
  },
  methods: {
    // TODO 检查金额，取正数、保留两位小数
    checkAmt(item){
      let {tdQty, qtyBal} = item;
      // 数量
      if (tdQty) {
        item.tdQty = Math.abs(toFixed(tdQty));
        if(tdQty > qtyBal){
          item.tdQty = qtyBal;
        }
      }
    },
    // TODO 选择要删除的物料
    delClick (index, sItem, key) {
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
          });
          this.selItems.forEach(SItem => {
            newArr.forEach(OItem => {
              if (OItem.inventoryCode === SItem.inventoryCode && OItem.transCode === SItem.transCode) {
                let delArr = this.orderList[OItem.transCode];
                let delIndex = delArr.findIndex(item => item.inventoryCode === OItem.inventoryCode);
                if (delIndex >= 0) {
                  this.$refs.order.delSelItem(delArr[delIndex]);
                  delArr.splice(delIndex, 1);
                }
                if (!delArr.length) {
                  delete this.orderList[OItem.transCode];
                }
              }
            })
          });
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
            shippingTime: item.shippingTime
          };
        }
      }
      this.showOrderPop = !this.showOrderPop;
    },
    // TODO 选中入库仓库
    selWarehouseIn (val) {
      this.warehouseIn = JSON.parse(val);
    },
    // TODO 显示物料修改的pop
    modifyMatter (item, index, key) {
      this.matter = JSON.parse(JSON.stringify(item));
      this.showMatterPop = true;
      this.modifyIndex = index;
      this.modifyKey = key;
    },
    // TODO 更新修改后的物料信息
    selConfirm (val) {
      let modMatter = JSON.parse(val);
      this.$set(this.orderList[this.modifyKey], this.modifyIndex, modMatter);
    },
    // TODO 选中物料项
    selOrder (val) {
      let sels = JSON.parse(val);
      let orderList = {};
      sels.forEach(item => {
        let key = `${item.transCode}_${item.inventoryCode}`;
        let {tdQty = '', shippingTime = ''} = this.numMap[key] || {};
        item.tdQty = tdQty;
        item.shippingTime = shippingTime;
        if (!orderList[item.transCode]) {
          orderList[item.transCode] = [];
        }
        orderList[item.transCode].push(item);
      });
      this.numMap = {};
      this.matterList = sels;
      this.orderList = orderList;
    },
    // TODO 获取默认图片
    getDefaultImg (item) {
      let url = require('assets/wl_default03.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    // TODO 提价订单
    submitOrder () {
      let warn = '';
      let dataSet = [];
      let validateMap = [
        {
          key : 'warehouseIn',
          message: '入库仓库',
        }
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
      // 组装dataSet
      for (let items of Object.values(this.orderList)) {
        for (let item of items) {
          if(!item.tdQty){
            warn = '请填写数量'
            break
          }
          let oItem = {
            transMatchedCode: item.transCode, // 明细被核销交易号
            outPutMatCode: item.inventoryCode, // 输出物料
            containerCodeOut: this.warehouseIn.warehouseCode, // 入库仓编码
			      warehouseType_containerCodeOut: this.warehouseIn.warehouseType, // 仓库类型
            tdProcessing: item.processing, // 加工属性
            thenQtyBal: item.qtyBal, // 待交付数量
            thenQtyStock: item.qtyStock, // 当时可用库存
            tdQty: item.tdQty, // 明细发生数
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
              businessKey: this.businessKey,
              createdBy: ''
            }
          };
          formData = {
            ...this.formData,
            modifer: this.transCode ? this.formData.handler : '',
            handlerEntity: this.entity.dealerName,
            outPut: {
              containerCode: this.warehouseIn.warehouseCode,
              dataSet
            },
            containerInWarehouseManager: this.warehouseIn.containerInWarehouseManager || null, // 入库管理员
          };
          // 重新提交
          if (this.transCode) {
            operation = saveAndCommitTask;
            wfPara = {
              businessKey: this.transCode,
              createdBy: formData.creator || formData.handler,
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
          if (!this.processCode.length) { // 无工作流
            operation = submitAndCalc;
            delete submitData.wfPara;
            delete submitData.biReferenceId;
          }
          if (this.biReferenceId) {
            submitData.biReferenceId = this.biReferenceId
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
        let matterList = [];
        let orderList = {};
        // 获取合计
        let {outPut} = formData;
        let {dataSet = []} = outPut;
        for (let item of dataSet) {
          item = {
            ...item,
            transCode: item.transMatchedCode,
            qtyBal: item.thenQtyBal,
            qtyStock: item.thenQtyStock,
            inventoryPic: item.inventoryPic_outPutMatCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_outPutMatCode}&width=400&height=400` : this.getDefaultImg(),
            inventoryName: item.inventoryName_outPutMatCode,
            inventoryCode: item.outPutMatCode,
            specification: item.specification_outPutMatCode,
            processing: item.tdProcessing
          };
          if (!orderList[item.transCode]) {
            orderList[item.transCode] = [];
          }
          matterList.push(item);
          orderList[item.transCode].push(item);
        }
        // 入库
        this.warehouseIn = {
          warehouseCode: outPut.containerCode,
          warehouseName: outPut.warehouseName_containerCode,
          warehouseType: outPut.warehouseType_containerCode,
          warehouseProvince: outPut.warehouseProvince_containerCode,
          warehouseCity: outPut.warehouseCity_containerCode,
          warehouseDistrict: outPut.warehouseDistrict_containerCode,
          warehouseAddress: outPut.warehouseAddress_containerCode,
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
        this.biReferenceId = formData.biReferenceId;
        this.matterList = matterList;
        this.orderList = orderList;
        this.$loading.hide();
      })
    },
    // TODO 组装matterList数据
    assembMatterList () {
      for (let matters of Object.values(this.orderList)) {
        for (let item of matters) {
          this.matterList.push(item);
        }
      }
    },
    // TODO 保存草稿数据
    hasDraftData () {
      // 是否选择订单
      if (!Object.values(this.orderList).length) {
        return false
      }
      return {
        [DRAFT_KEY]: {
          orderList : this.orderList,
          warehouseIn : this.warehouseIn,
          formData: this.formData,
        }
      };
    },
  },
  created () {
    let data = sessionStorage.getItem(DRAFT_KEY);
    if (data) {
      let draft = JSON.parse(data);
      this.orderList = draft.orderList;
      this.assembMatterList();
      this.formData = draft.formData;
      this.warehouseIn = draft.warehouseIn;
      sessionStorage.removeItem(DRAFT_KEY);
    }
  }
}
</script>

<style lang="scss" scoped>
  @import './../../scss/bizApply';
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
  .materiel_list .mater_list .each_mater_wrapper .mater_main {
    padding-right: .38rem;
  }
  //插槽里面物料信息
  .mater_material {
    font-size: .1rem;
    span {
        margin-right: .06rem;
    }
  }
  .mater-balance {
    font-size: .14rem;
    font-weight: bold;
    color: #454545;
  }
</style>
