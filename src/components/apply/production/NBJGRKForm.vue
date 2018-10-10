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
              <div class="each_mater" v-for="(oItem, key,index) in orderList" :key="key">
                <div class="order_code" v-if='oItem.length'>
                  <span class="order_title">加工订单号</span>
                  <span class="order_num">{{key}}</span>
                </div>
                <div :class="{'mater_delete' : matterModifyClass, 'vux-1px-b': item.boms && !item.boms.length}" v-for="(item, index) in oItem" :key="index">
                  <matter-item :item="item" @on-modify="modifyMatter(item,index, key)" :show-delete="matterModifyClass"
                               @click.native="delClick(index,item, key)">
                    <template slot-scope="{item}" slot="info">
                      <div class='mater_more'>
                        <span>仓库: {{item.warehouseName || '暂未指定'}}</span>
                      </div>
                      <div class="mater_other" v-if="item.tdQty">
                        <div class="matter-remain">
                          <span>本次完工入库: {{item.tdQty}}{{item.measureUnit}}</span>
                          <span class="symbol">[余额: {{item.qtyBal}}]</span>
                        </div>
                      </div>
                    </template>
                    <template slot="edit" slot-scope="{item}">
                      <div class='mater_other' @click="modifyMatter(item,index, key)" v-if="!item.tdQty && !matterModifyClass">
                        <div class="edit_tips" >点击编辑</div>
                      </div>
                    </template>
                  </matter-item>
                  <bom-list :boms="item.boms"></bom-list>
                  <div class='delete_icon' @click="delClick(index,item, key)" v-show='matterModifyClass'>
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
          <!-- 订单popup -->
          <pop-order-xqtj-list :show="showOrderPop" v-model="showOrderPop" @sel-matter="selOrder"
                               :default-value="orderList" list-method="getInProcessingStorage"
                               ref="order"></pop-order-xqtj-list>
        </div>
        <!--物料编辑pop-->
        <pop-matter :modify-matter='matter' :show-pop="showMatterPop" @sel-confirm='selConfirm'
                    v-model='showMatterPop' :btn-is-hide="btnIsHide" :is-show-amount="false">
          <template slot="modify" slot-scope="{modifyMatter}">
            <x-input title="本次完工入库" type="number" v-model.number='modifyMatter.tdQty' text-align="right"
                     @on-blur="checkAmt(modifyMatter)"  @on-focus="getFocus($event)" placeholder="请输入"></x-input>
            <pop-warehouse-nbjgrk-list :default-value="tmpWarehouse"
                                       @on-hide="hideWarehouse" @sel-item="selWarehouse"></pop-warehouse-nbjgrk-list>
            <cell title="待验收余额" text-align='right' placeholder='请填写' :value="modifyMatter.qtyBal"></cell>
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
  import {getJGRKBom} from 'service/materService'
  import {saveAndStartWf, saveAndCommitTask, submitAndCalc} from 'service/commonService'
  // mixins 引入
  import applyCommon from 'components/mixins/applyCommon'
  // 组件引入
  import PopMatter from 'components/apply/commonPart/MatterPop'
  import PopOrderXqtjList from 'components/Popup/PopOrderXQTJList'
  import PopWarehouseNbjgrkList from 'components/Popup/PopWarehouseNBJDRKList'
  import FormCell from 'components/detail/commonPart/FormCell'
  
  import BomList from 'components/detail/commonPart/BomList'
  // 公共方法
  import {accMul} from '@/home/pages/maps/decimalsAdd'

  export default {
    name: 'ApplyWLXQTJForm',
    mixins: [applyCommon],
    components: {
      Icon, Cell, Group, XInput,
      PopMatter, PopOrderXqtjList, Datetime,
      FormCell, PopWarehouseNbjgrkList, BomList
    },
    data() {
      return {
        listId: '5e8d89f1-49a5-4089-9c1a-44dc2ce0ae4b',
        orderList: {},                                  // 订单列表
        showOrderPop: false,                         // 是否显示物料的popup
        formData: {
          biComment: '' //备注
        },
        submitSuccess: false, // 是否提交成功
        warehouse: null, // 选中仓库属性
        numMap: {}, // 用于记录订单物料的数量和价格
        transCode: '',
        formViewUniqueId: '82784823-ded5-4a58-a746-d32514f7d26f', // 修改时的UniqueId
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
        tmpWarehouse: {},
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
        this.tmpWarehouse = {
          warehouseName: item.warehouseName,
          warehouseCode: item.warehouseCode,
        };
        this.showMatterPop = true;
        this.modifyIndex = index;
        this.modifyKey = key;
      },
      // TODO 更新修改后的物料信息
      selConfirm(val) {
        let modMatter = JSON.parse(val);
        modMatter = {
          ...modMatter,
          ...this.tmpWarehouse,
        };
        this.$set(this.orderList[this.modifyKey], this.modifyIndex, modMatter);
      },
      // TODO 选中物料项
      selOrder(val) {
        let sels = JSON.parse(val);
        let orderList = {};
        sels.forEach(item => {
          let key = `${item.transCode}_${item.inventoryCode}`;
          let {tdQty = '', warehouseName = item.warehouseName, warehouseCode = item.warehouseCode} = this.numMap[key] || {};
          item.tdQty = tdQty;
          item.warehouseName = warehouseName;
          item.warehouseCode = warehouseCode;
          if (!orderList[item.transCode]) {
            orderList[item.transCode] = [];
          }
          getJGRKBom({parentInvCode: item.inventoryCode,}).then(({tableContent = []}) => {
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
            this.numMap[`${item.transCode}_${item.inventoryCode}`] = {...item};
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
        if (!warn) {
          for (let value of Object.values(this.orderList)) {
            for (let vItem of value) {
              for (let item of vItem.boms) {
                // 校验数量
                if (item.qtyStock < item.tdQty) {
                  warn = '可用余额不能少于本次扣料，请重新输入入库数量';
                  break;
                }
              }
              if (warn) {
                break;
              }
            }
            if (warn) {
              break;
            }
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
            let dataSet = [];
            let operation = saveAndStartWf;
            let formData = {};
            let wfPara = {
              [this.processCode]: {
                businessKey: 'IPPI',
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
                    thenQtyStock: bom.qtyStock,
                    bomSpecificLoss: bom.specificLoss,
                    tdProcessing: bom.processing,
                    containerCodeOut: bom.warehouseCode,
                    inventoryName: bom.inventoryName,
                    transObjCode: bom.inventoryCode,
                    measureUnit: bom.measureUnit,
                    warehouseName_containerCodeOut: bom.warehouseName,
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
                  tdQty: item.tdQty, // 下单数量
                  warehouseName_containerCode: item.warehouseName,
                  containerCode: item.warehouseCode,
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
              inPut: {
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
      // TODO 展示仓库弹窗
      showWarehouse() {
        this.showMatterPop = false;
      },
      // TODO 仓库弹窗隐藏
      hideWarehouse() {
        this.showMatterPop = true;
      },
      // TODO 选中仓库
      selWarehouse(item) {
        this.tmpWarehouse = {
          warehouseName: item.warehouseName,
          warehouseCode: item.warehouseCode,
        };
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
    // 加工订单号
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
  }
</style>
