<template>
  <div class="pages nbjgdd-apply-container">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <!-- 物料列表 -->
        <div class="materiel_list">
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
            <div class="title" @click="showDelete">
              <div>订单列表</div>
              <div class='edit' v-if='!matterModifyClass'>编辑</div>
              <div class='finished' v-else>完成</div>
            </div>
            <div class="mater_list">
              <div class="each_mater" :class="{'vux-1px-b' : index < (Object.keys(orderList).length-1)}"
                  v-for="(oItem, key,index) in orderList" :key="key">
                <div class="order_code" v-if='oItem.length'>
                  <span class="order_title">计划号</span>
                  <span class="order_num">{{key}}</span>
                </div>
                <div :class="{mater_delete : matterModifyClass}" v-for="(item, index) in oItem" :key="index">
                  <matter-item :item="item" @on-modify="modifyMatter(item,index, key)">
                    <template slot-scope="{item}" slot="info">
                      <div class='matter-more'>
                        <span>单位: {{item.measureUnit}}</span>
                        <span>待下单余额: {{item.qtyBal}}</span>
                      </div>
                      <div class="mater_other">
                        <div class="matter-remain">
                          <span class="symbol">成品计划验收日期: </span>{{item.shippingTime || '无'}}
                        </div>
                        <div class="matter-remain">
                          <span class="symbol">本次下单: </span>{{item.tdQty}}
                        </div>
                      </div>
                    </template>
                  </matter-item>
                  <div class="bom-container" v-if="item.boms && item.boms.length">
                    <div class="title">原料</div>
                    <template v-for="(bom, bIndex) in item.boms">
                      <form-cell cellTitle="原料编码" :cellContent="bom.inventoryCode"
                                 :style="{'margin-top': bIndex > 0 ? '.05rem' : '0'}"></form-cell>
                      <form-cell cellTitle="原料名称" :cellContent="bom.inventoryName"></form-cell>
                      <form-cell cellTitle="计量单位" :cellContent="bom.measureUnit"></form-cell>
                      <form-cell cellTitle="领料需求" :cellContent="bom.tdQty"></form-cell>
                    </template>
                  </div>
                  <div class='delete_icon' @click="delClick(index,item, key)" v-if='matterModifyClass'>
                    <x-icon type="ios-checkmark" size="20" class="checked" v-show="showSelIcon(item)"></x-icon>
                    <x-icon type="ios-circle-outline" size="20" v-show="!showSelIcon(item)"></x-icon>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <!-- 新增更多 按钮 -->
          <div class="handle_part vux-1px-b" v-if="Object.keys(orderList).length && !matterModifyClass">
            <span class="add_more stop" v-if="this.actions.includes('stop')"
                  @click="stopOrder">终止提交</span>
            <span class="symbol" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>或</span>
            <span class="add_more" @click="addOrder">新增更多物料</span>
          </div>
          <!-- 订单popup -->
          <pop-order-xqtj-list :show="showOrderPop" v-model="showOrderPop" @sel-matter="selOrder"
                               :default-value="orderList" list-method="getInProcessingOrder"
                               ref="order"></pop-order-xqtj-list>
        </div>

        <!--物料编辑pop-->
        <pop-matter :modify-matter='matter' :show-pop="showMatterPop" @sel-confirm='selConfirm'
                    v-model='showMatterPop' :btn-is-hide="btnIsHide">
          <template slot="modify" slot-scope="{modifyMatter}">
            <x-input title="本次下单" type="number" v-model.number='modifyMatter.tdQty' text-align="right"
                     @on-blur="checkAmt(modifyMatter)"></x-input>
            <datetime title="成品计划验收日期" v-model="modifyMatter.shippingTime" placeholder="请选择"></datetime>
            <cell title="待下单余额" text-align='right' placeholder='请填写' :value="modifyMatter.qtyBal"></cell>
          </template>
        </pop-matter>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class='btn-no-amt vux-1px-t' v-if="!matterModifyClass">
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
  // vux组件引入
  import {
    Icon, Cell, Group, XInput, Datetime,
  } from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  import {getJGDDBom} from 'service/materService'
  import {saveAndStartWf, saveAndCommitTask, submitAndCalc} from 'service/commonService'
  // mixins 引入
  import applyCommon from 'components/mixins/applyCommon'
  // 组件引入
  import PopMatter from 'components/apply/commonPart/MatterPop'
  import PopOrderXqtjList from 'components/Popup/PopOrderXQTJList'
  import FormCell from 'components/detail/commonPart/FormCell'
  import MatterItem from 'components/apply/commonPart/MatterItem'
  // 公共方法
  import {accMul} from '@/home/pages/maps/decimalsAdd'

  export default {
    name: 'ApplyWLXQTJForm',
    mixins: [applyCommon],
    components: {
      Icon, Cell, Group, XInput,
      PopMatter, PopOrderXqtjList, Datetime,
      FormCell, MatterItem,
    },
    data() {
      return {
        listId: '65ceb5a6-a120-11e8-862a-005056a136d0',
        orderList: {},                                  // 订单列表
        showOrderPop: false,                         // 是否显示物料的popup
        formData: {
          biComment: '' //备注
        },
        submitSuccess: false, // 是否提交成功
        numMap: {}, // 用于记录订单物料的数量和价格
        transCode: '',
        formViewUniqueId: '346ede09-ac6a-489a-9242-f385932a4443', // 修改时的UniqueId
        biReferenceId: '',
        actions: [],
        taskId: '',
        matterList: [], // 物料列表，用于计算金额、请求单价
        entity: {}, // 经办主体
        tmpItems: {},//选中的订单
        matter: {},
        showMatterPop: false,
        modifyIndex: null,
        modifyKey: null,
      }
    },
    watch: {
      matter: {
        handler(val) {
          val.boms && val.boms.forEach(item => {
            item.tdQty = accMul(val.tdQty, item.qty)
          });
        },
        deep: true
      },
    },
    methods: {
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
        this.$set(this.orderList[this.modifyKey], this.modifyIndex, modMatter);
      },
      // TODO 选中物料项
      selOrder(val) {
        let sels = JSON.parse(val);
        let orderList = {};
        sels.forEach(item => {
          let key = `${item.transCode}_${item.inventoryCode}`;
          let {tdQty = item.qtyBal, shippingTime = ''} = this.numMap[key] || {};
          item.tdQty = tdQty;
          item.shippingTime = shippingTime;
          if (!orderList[item.transCode]) {
            orderList[item.transCode] = [];
          }
          getJGDDBom({parentInvCode: item.inventoryCode}).then(({tableContent = []}) => {
            tableContent.forEach(bom => {
              bom.tdQty = accMul(item.tdQty, bom.qty)
            });
            this.$set(item, 'boms', tableContent);
          });
          orderList[item.transCode].push(item);
        });
        this.numMap = {};
        this.matterList = sels;
        this.orderList = orderList;
      },
      // TODO 选择默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default02.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // TODO 滑动删除
      delClick(index, sItem, key) {
        let arr = this.selItems;
        let delIndex = arr.findIndex(item => item.inventoryCode === sItem.inventoryCode && item.transCode === sItem.transCode);
        //若存在重复的 则清除
        if (delIndex !== -1) {
          arr.splice(delIndex, 1);
          return;
        }
        arr.push(sItem);
      },
      // TODO 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.selItems.findIndex(item => item.inventoryCode === sItem.inventoryCode && item.transCode === sItem.transCode) !== -1;
      },
      //全选
      checkAll() {
        if (this.selItems.length === this.matterList.length) {
          this.selItems = [];
          return
        }
        this.selItems = JSON.parse(JSON.stringify(this.matterList));
      },
      //删除选中的
      deleteCheckd() {
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
      addOrder() {
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
      // TODO 提价订单
      submitOrder() {
        let warn = '';
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
            this.$HandleLoad.show();
            let dataSet = [];
            let operation = saveAndStartWf;
            let formData = {};
            let wfPara = {
              [this.processCode]: {
                businessKey: 'IPPO',
                createdBy: ''
              }
            };
            // 组装dataSet
            for (let items of Object.values(this.orderList)) {
              for (let item of items) {
                let boms = [];
                for (let bom of item.boms) {
                  boms.push({
                    transMatchedCode: item.transCode,
                    tdQty: accMul(item.tdQty, bom.qty), // 领料需求
                    orderCode: item.orderCode,
                    bomSpecificLoss: bom.specificLoss,
                    tdProcessing: bom.processing,
                    inventoryName: bom.inventoryName,
                    transObjCode: bom.inventoryCode,
                    measureUnit: bom.measureUnit,
                    bomType: bom.bomType,
                    bomQty: bom.qty,
                  })
                }
                let oItem = {
                  tdId: item.tdId || null,
                  transMatchedCode: item.transCode, // 交易号
                  orderCode: item.orderCode,
                  transObjCode: item.inventoryCode, // 输出物料
                  inventoryName_transObjCode: item.inventoryName,
                  tdProcessing: item.processing,
                  measureUnit_transObjCode: item.measureUnit,
                  thenQtyBal: item.qtyBal, // 余额
                  shippingTime: item.shippingTime,
                  tdQty: item.tdQty, // 下单数量
                  comment: item.comment || '', // 说明
                  boms
                };
                dataSet.push(oItem);
              }
            }
            formData = {
              ...this.formData,
              modifer: this.transCode ? this.formData.handler : '',
              handlerEntity: this.entity.dealerName,
              order: {
                dataSet
              }
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
            if (!this.processCode.length) { //无工作流
              operation = submitAndCalc;
              delete submitData.wfPara;
              delete submitData.biReferenceId;
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
          let {order} = formData;
          let {dataSet = []} = order;
          for (let item of dataSet) {
            item = {
              ...item,
              transCode: item.transMatchedCode,
              qtyBal: item.thenQtyBal,
              inventoryPic: item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
              inventoryName: item.inventoryName_transObjCode,
              inventoryCode: item.transObjCode,
              specification: item.specification_transObjCode,
              processing: item.tdProcessing,
            };
            if (!orderList[item.transCode]) {
              orderList[item.transCode] = [];
            }
            orderList[item.transCode].push(item);
          }
          this.matterList = dataSet;
          this.formData = {
            ...this.formData,
            creator: formData.creator,
            biComment: formData.biComment,
            drDealerLogisticsTerms: formData.drDealerLogisticsTerms,
          };
          this.entity = {
            dealerName: formData.handlerEntity
          };
          this.biReferenceId = formData.biReferenceId;
          this.orderList = orderList;
          this.$loading.hide();
        })
      },
    },
    created() {
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizApply';

  .nbjgdd-apply-container {
    .basicPart {
      height: 90%;
    }
    // 计划号
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

    .mater_list .each_mater_wrapper {
      flex-direction: column;
    }

    .mater_list .each_mater_wrapper .mater_main {
      padding-right: .38rem;
    }
    .mater_list .each_mater_wrapper .mater_main .mater_other {
      flex-direction: column;
      align-items: flex-start;
    }
    .matter-remain {
      color: #5077aa;
      font-size: .16rem;
      font-weight: bold;
      .symbol {
        color: #757575;
      }
    }
    /* 原料 */
    .bom-container {
      background-color: #f8f8f8;
      .title {
        background-color: #fff;
      }
      .each_cell {
        background-color: #fff;
      }
    }
  }
</style>
