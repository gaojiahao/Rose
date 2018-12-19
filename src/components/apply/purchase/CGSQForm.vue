<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem" 
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 物料列表 -->
        <div class="materiel_list">
          <!-- 没有选择物料 -->
          <template v-if="!Object.keys(orderList).length">
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
              <div class="each_mater" v-for="(oItem, key) in orderList" :key="key">
                <div class="order_code" v-if='oItem.length'>
                  <span class="order_title">物料需求计划号</span>
                  <span class="order_num">{{key}}</span>
                </div>
                <div :class="{'mater_delete' : matterModifyClass}" v-for="(item, index) in oItem" :key="index">
                  <matter-item :item="item" @on-modify="modifyMatter(item, index, key)" :show-delete="matterModifyClass"
                              @click.native="delClick(index, item)">
                    <template slot="info" slot-scope="{item}">
                      <!-- 物料属性和单位 -->
                      <div class="mater_more">
                        <div>
                          <span class='unit'>单位: {{item.measureUnit}}</span>
                          <span class='qty'>全部需求: {{item.allQty}}</span>
                          <span class='qty'>待申请: {{item.qtyBalance}}</span>
                          <span class='qty'>已申请: {{item.qtyed}}</span>
                        </div>
                        <div>
                          <span v-show="item.promDeliTime">计划需求日期: {{item.promDeliTime}}</span>
                        </div>
                      </div>
                      <!-- 物料数量和价格 -->
                      <div class='mater_other' v-if="item.tdQty">
                        <span>
                          本次申请: <span class="mater_price">{{item.tdQty}}</span>
                        </span>
                      </div>
                    </template>
                    <template slot="edit" slot-scope="{item}">
                      <div class='mater_other' @click="modifyMatter(item, index, key)" v-if="!item.tdQty && !matterModifyClass">
                        <div class="edit-tips">
                          <span class="tips-word">点击进行填写</span>
                        </div>
                      </div>
                    </template>
                    <template slot="editPart" slot-scope="{item}">
                      <div class="edit-part vux-1px-l" @click="modifyMatter(item, index, key)" v-show="item.tdQty &&!matterModifyClass">
                        <span class='iconfont icon-bianji1'></span>
                      </div>
                    </template>
                  </matter-item>
                  <div class='delete_icon' @click="delClick(index, item)" v-if='matterModifyClass'>
                    <x-icon type="ios-checkmark" size="20" class="checked" v-show="showSelIcon(item)"></x-icon>
                    <x-icon type="ios-circle-outline" size="20" v-show="!showSelIcon(item)"></x-icon>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <!-- 新增更多 按钮 -->
          <div class="handle_part" v-if="matterList.length && !matterModifyClass">
            <span class="add_more stop" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'
              @click="stopOrder" >终止提交</span>
            <span class="symbol" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>或</span>
            <span class="add_more" v-if="matterList.length" @click="addMatter">新增更多物料</span>
          </div>
          <!-- 物料popup -->
          <pop-matter-list :show="showMaterielPop" v-model="showMaterielPop" @sel-matter="selMatter"
                          :default-value="matterList" get-list-method="getPurchaseInNeeds" :filter-list="filterList"
                          ref="matter">
            <!-- 选择title插槽 -->
            <template slot="titleName" slot-scope="props">
              <span class="order-title">物料需求计划号</span>
            </template>
            <!-- 基本信息插槽 -->
            <template slot="attribute" slot-scope="{item}">
              <div class="mater_classify">
                <span>单位: {{item.measureUnit}}</span>
                <span>物料类型: {{item.invType}}</span>
              </div>
            </template>
            <!-- 其他信息插槽 -->
            <template slot="storage" slot-scope="{item}">
              <div class="mater_material">
                <div>
                  <span>全部需求: {{item.allQty}}</span>
                  <span>已申请: {{item.qtyed}}</span>
                  <span>待申请: {{item.qtyBalance}}</span>
                  <span>采购提前期: {{item.leadtime}}</span>
                </div>
                <div>
                  <p>下单截止日: {{item.shippingTime}}</p>
                  <p>到货截止日: {{item.processingStartDate}}</p>
                </div>
              </div>
            </template>
          </pop-matter-list>
        </div>
        <!-- 物料编辑pop -->
        <pop-matter :modify-matter='matter' :show-pop="showMatterPop" @sel-confirm='selConfirm'
                    v-model='showMatterPop' :btn-is-hide="btnIsHide" :is-show-amount="false">
          <template slot="qtyBal" slot-scope="{modifyMatter}">
            <div>
              <span>全部需求: {{modifyMatter.allQty}}</span>
              <span>已申请: {{modifyMatter.qtyed}}</span>
            </div>
            <div>
              <span>待申请: {{modifyMatter.qtyBalance}}</span>
              <span>采购提前期: {{modifyMatter.leadtime}}</span>
            </div>
          </template>
          <template slot="modify" slot-scope="{modifyMatter}">
            <x-input type="number"  v-model.number='modifyMatter.tdQty' text-align="right"
              @on-blur="checkAmt(modifyMatter)" @on-focus="getFocus($event)" placeholder="请输入">
              <template slot="label">
                <span class='required'>本次申请
                </span>
              </template>
            </x-input>
            <x-input v-model.number='modifyMatter.comment' text-align="right"
                    @on-focus="getFocus($event)" placeholder="请输入">
              <template slot="label">
                <span>申请说明</span>
              </template>
            </x-input>
          </template>
          <template slot="date" slot-scope="{modifyMatter}">
            <cell disabled title="下单截止日" :value="modifyMatter.shippingTime || '无'"></cell>
            <cell disabled title="到货截止日" :value="modifyMatter.promDeliTime"></cell>
          </template>
        </pop-matter>
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class="count_mode vux-1px-t" :class="{btn_hide : btnIsHide}" v-if="!matterModifyClass">
      <span class="count_num">
        <span class="total_price">
          <span style="fontSize:.14rem">合计: </span>{{totalNum}}
        </span>
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
// vux插件 引入
import { Group, XInput, XTextarea, Datetime, Cell } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
import { getBaseInfoData, saveAndStartWf, saveAndCommitTask, submitAndCalc } from 'service/commonService'
// mixins 引入
import common from 'components/mixins/applyCommon'
// 组件 引入
import PopMatterList from 'components/Popup/PopMatterList'
import PopMatter from 'components/apply/commonPart/MatterPop'
import RNumber from 'components/RNumber'
import RPicker from 'components/RPicker'
import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
// 方法 引入
import { accAdd, accMul } from '@/home/pages/maps/decimalsAdd'
import { toFixed } from '@/plugins/calc'
const DRAFT_KEY = 'CGSQ_DATA';

export default {
  data () {
    return {
      listId: '43ccbc27-bbb5-4cfb-997b-6d3823f1c03e',
      orderList: {},
      matterList: [], // 物料列表
      showMaterielPop: false, // 是否显示物料的popup
      formData: {
        biId: '',
        biComment: ''
      },
      applyComment: '',
      numMap: {},
      matterParams: {
        processing: '成品,商品,服务,原料,半成品'
      },
      modifyKey: '',
      filterList: [
        {
          name: '物料名称',
          value: 'invName',
        }, {
          name: '物料编码',
          value: 'matCode',
        },
        {
          name: '交易号',
          value: 'transCode'
        }
      ],
    }
  },
  components: {
    XTextarea, Group, XInput, Datetime, Cell, RNumber,
    PopMatter,  PopMatterList, RPicker, PopBaseinfo
  },
  computed: {
    // 订单物料总数量
    totalNum () {
      let total = 0;
      this.matterList.forEach(item => {
        total = accAdd(total, item.tdQty);
      });
      return Number(total);
    }
  },
  mixins: [common],
  methods: {
    // 选中物料项
    selMatter (val) {
      let sels = JSON.parse(val);
      let orderList = {};
      sels.map(item => {
        item.tdQty = item.qtyBalance;
        item.promDeliTime = item.processingStartDate;
        if(!orderList[item.transCode]) {
          orderList[item.transCode] = [];
        }
        orderList[item.transCode].push(item);
      })
      this.numMap = {};
      this.matterList = sels;
      this.orderList = orderList;
    },
    // 显示物料修改的pop
    modifyMatter (item, index, key) {
      this.matter = JSON.parse(JSON.stringify(item));
      this.showMatterPop = true;
      this.modifyIndex = index;
      this.modifyKey = key;
    },
    // 选择默认图片
    getDefaultImg (item) {
      let url = require('assets/wl_default02.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    // 物料修改确定
    selConfirm (val) {
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
    // 判断是否展示选中图标
    showSelIcon (sItem) {
      return this.selItems.findIndex(item => item.inventoryCode === sItem.inventoryCode && item.transCode === sItem.transCode) !== -1;
    },
    // 全选
    checkAll (){
      if (this.selItems.length === this.matterList.length) {
        this.selItems = [];
        return
      }
      this.selItems = JSON.parse(JSON.stringify(this.matterList));
    },
    // 删除选中的
    deleteCheckd (){
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
    // 新增物料
    addMatter () {
      for (let item of this.matterList) {
        // 存储已输入的价格
        this.numMap[`${item.transCode}_${item.inventoryCode}`] = {...item};
      }
      this.showMaterielPop = !this.showMaterielPop;
    },
    // 检查金额，取正数、保留两位小数
    checkAmt(item){
      let { price, tdQty, qtyBalance} = item;
      // 金额
      if (price) {
        item.price = Math.abs(toFixed(price));
      }
      // 数量
      if (tdQty) {
        item.tdQty = Math.abs(toFixed(tdQty));      
        if (tdQty > qtyBalance) {
          item.tdQty = qtyBalance;
        }
      }
    },
    // 提价订单
    submitOrder (){
      let warn = '',
          dataSet = [];
      if (!this.matterList.length) {
        warn = '请选择物料';
      }
      if (!warn) {
        // 校验
        this.matterList.every(item => {
          if (!item.tdQty) {
            warn = '数量不能为空';
            return false
          }
          // 设置提交参数
          dataSet.push({
            tdId: item.tdId || '',
            transMatchedCode: item.transCode, // 物料需求计划单号
            transObjCode: item.inventoryCode, // 物料编码
            tdProcessing: item.processing , // 加工属性
            assMeasureUnit: item.assMeasureUnit ||'个', // 辅助计量
            assMeasureScale: item.assMeasureScale || null, // 与单位倍数
            assistQty: item.assistQty || 0, // 辅计数量
            productDemandQty: item.allQty, // 全部需求
            thenLockQty: item.qtyed, // 已做需求
            thenQtyBal: item.qtyBalance, // 代申请
            tdQty: item.tdQty, // 待做需求
            shippingTime: item.shippingTime,
            promDeliTime: item.promDeliTime, // 计划需求日期
            comment : item.comment, // 说明
          });
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
          let wfPara = {
            [this.processCode]: {businessKey: "PAPP", createdBy: ""}
          }
          if (this.isResubmit) {
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
            biComment: this.biComment,
            formData: JSON.stringify({
              ...this.formData,
              handlerEntity: this.entity.dealerName,
              order: {
                dataSet
              }
            }),
            wfPara: JSON.stringify(wfPara)
          }
          // 重新提交
          if (this.isResubmit) {
            operation = saveAndCommitTask;
            submitData.biReferenceId = this.biReferenceId;
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
          this.saveData(operation,submitData);
        }
      })
    },
    // 获取订单信息用于重新提交
    async getFormData () {
      await getSOList({
        formViewUniqueId: this.uniqueId,
        transCode: this.transCode
      }).then( (data)=>{
        this.listId = data.listId;
        this.applyComment = data.biComment;
        this.biReferenceId = data.biReferenceId;
        this.attachment = data.attachment;
        let {formData} = data;
        let orderList = {};
        let dataSet = [];
        dataSet = formData.order.dataSet.map(item => {
          item = {
            ...item,
            inventoryPic: item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
            inventoryName: item.inventoryName_transObjCode,
            inventoryCode: item.inventoryCode_transObjCode,
            specification: item.specification_transObjCode,
            processing: item.tdProcessing || '商品',
            measureUnit: item.measureUnit_transObjCode,
            inventoryType: item.inventoryType_transObjCode,
            inventorySubclass: item.inventorySubclass_transObjCode,
            allQty: item.productDemandQty,
            qtyed: item.thenLockQty,
            qtyBalance: item.thenQtyBal,
            transCode: item.transMatchedCode,
          }
          if (!orderList[item.transCode]) {
            orderList[item.transCode] = [];
          }
          orderList[item.transCode].push(item);
          return item;
        });
        this.orderList = orderList;
        this.matterList = dataSet;
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
          ...this.handlerDefault,
          creator: formData.creator,
          modifer: formData.modifer,
          biId: formData.biId,
          biComment: formData.biComment,
          biProcessStatus: formData.biProcessStatus,
        }
        this.$loading.hide();
      })
    },
    // 是否保存草稿
    hasDraftData () {
      if (!Object.values(this.orderList).length) {
        return false
      }
      return {
        [DRAFT_KEY]: {
          orderList: this.orderList,
          formData: this.formData,
        }
      };
    },
  },
  created () {
    let data = sessionStorage.getItem(DRAFT_KEY);
    if (data) {
      this.orderList = JSON.parse(data).orderList;
      this.formData = JSON.parse(data).formData;
      for(let key in this.orderList) {
        this.orderList[key].forEach(item => {
          this.matterList.push(item)
        })
      }
      sessionStorage.removeItem(DRAFT_KEY);
    }
  },
}
</script>

<style lang='scss' scoped>
@import './../../scss/bizApply';

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
.mater_others {
  .mater_type,
  .mater_price {
    height: .18rem;
    line-height: .18rem;
  }
  span {
    font-size: .1rem;
    color: #757575;
    margin-right: 0.04rem;
  }
}
</style>
