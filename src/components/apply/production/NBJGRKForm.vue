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
              <div class="each_mater" v-for="(oItem, key) in orderList" :key="key">
                <div class="order_code" v-if='oItem.length'>
                  <span class="order_title">加工订单号</span>
                  <span class="order_num">{{key}}</span>
                </div>
                <div :class="{mater_delete : matterModifyClass}" v-for="(item, index) in oItem" :key="index">
                  <div class="each_mater_wrapper">
                    <div class="order-matter">
                      <div class="mater_img">
                        <img :src="item.inventoryPic" alt="mater_img" @error="getDefaultImg(item)">
                      </div>
                      <div class="mater_main">
                        <!-- 物料名称 -->
                        <div class="mater_name">
                          {{item.inventoryName}}
                        </div>
                        <!-- 物料基本信息 -->
                        <div class="mater_info">
                          <!-- 物料编码、规格 -->
                          <div class="withColor">
                            <!-- 物料编码 -->
                            <div class="ForInline" style="display:inline-block">
                              <div class="mater_code">
                                <span class="title">编码</span>
                                <span class="num">{{item.inventoryCode}}</span>
                              </div>
                            </div>
                            <!-- 物料规格 -->
                            <div class="ForInline" style="display:inline-block">
                              <div class="mater_spec">
                                <span class="title">规格</span>
                                <span class="num">{{item.specification || '无'}}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <!-- 物料属性和单位 -->
                        <div class='mater_more'>
                          <span>单位: {{item.measureUnit}}</span>
                          <span>待验收余额: {{item.qtyBal}}</span>
                        </div>
                        <div class="mater_more"  v-if="item.warehouseName">
                          仓库: {{item.warehouseName}}
                        </div>
                        <div class="matter-remain">
                          本次完工入库: {{item.tdQty}}
                        </div>                        
                        <!-- 编辑图标 -->
                        <div class="edit-part vux-1px-l" @click="modifyMatter(item,index, key)">
                          <span class='iconfont icon-bianji1'></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="bom-container" v-if="item.boms && item.boms.length">
                    <div class="title vux-1px-b">原料</div>
                    <div class="each-bom-part vux-1px-b" v-for="(bom, bIndex) in item.boms">
                      <div class="main-info-part">
                        <div class="main-top" v-if="bom.warehouseName || bom.warehouseCode">
                          <span class="content-title" v-if="bom.warehouseName">{{bom.warehouseName}}</span>
                          <span class="side-bar vux-1px-r" v-if="bom.warehouseName"></span>
                          <span class="content-info" v-if="bom.warehouseCode">{{bom.warehouseCode}}</span>
                        </div>
                        <div class="main-content">
                          <div class="content-unit">
                            <span class="iconfont icon-bianma"></span>
                            <span>原料编码：{{item.inventoryCode}}</span>
                          </div>
                          <div class="content-name">
                            {{bom.inventoryName}}
                          </div>
                        </div>
                      </div>
                      <div class="number-part">
                        <span class="main-number">本次扣料: {{bom.tdQty}}{{bom.measureUnit}}</span>
                        <span class="number-unit">可用余额: {{bom.qtyStock}}</span>
                      </div>
                    </div>
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
          <div class="handle_part" v-if="Object.keys(orderList).length">
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
                    v-model='showMatterPop' :btn-is-hide="btnIsHide">
          <template slot="modify" slot-scope="{modifyMatter}">
            <x-input title="本次完工入库" type="number" v-model.number='modifyMatter.tdQty' text-align="right"
                     @on-blur="checkAmt(modifyMatter)"></x-input>
            <pop-warehouse-nbjgrk-list :default-value="tmpWarehouse"
                                       @on-show="showWarehouse" @sel-item="selWarehouse"></pop-warehouse-nbjgrk-list>
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
  // 公共方法
  import {accMul} from '@/home/pages/maps/decimalsAdd'

  export default {
    name: 'ApplyWLXQTJForm',
    mixins: [applyCommon],
    components: {
      Icon, Cell, Group, XInput,
      PopMatter, PopOrderXqtjList, Datetime,
      FormCell, PopWarehouseNbjgrkList
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
          let {tdQty = 1, shippingTime = ''} = this.numMap[key] || {};
          item.tdQty = tdQty;
          item.shippingTime = shippingTime;
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
      // TODO 选中仓库
      selWarehouse(item) {
        this.tmpWarehouse = {
          warehouseName: item.warehouseName,
          warehouseCode: item.warehouseCode,
        };
        this.showMatterPop = true;
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
      color: #111;
      font-size: .14rem;
      font-weight: bold;
      .symbol, .icon-- {
        color: #757575;
      }
    }
    /* 原料 */
    .bom-container {
      width: 100%;
      .title {
        padding-bottom: .02rem;
      }
      .each-bom-part {
        width: 100%;
        display: flex;
        padding: .06rem 0;
        align-items: center;
        box-sizing: border-box;
        .main-info-part {
          flex: 2;
          .main-top {
            font-size: 0;
            display: flex;
            align-items: center;
            padding-bottom: .02rem;
            .content-title {
              color: #005792;
              font-size: .1rem;
              font-weight: bold;
            }
            .side-bar {
              height: .1rem;
              margin: 0 .04rem;
              display: inline-block;
            }
            .content-info {
              @extend .content-title;
            }
          }
          .main-content {
            .content-unit {
              color: #757575;
              font-size: .1rem;
              word-break: break-all;
              .icon-bianma {
                font-size: .1rem;
              }
            }
            .content-name {
              font-size: .12rem;
              font-weight: bold;
              word-break: break-all;
            }
          }
        }
        .number-part {
          flex: 1;
          display: flex;
          font-size: .1rem;
          text-align: right;
          flex-direction: column;
          .main-number {
            font-size: .12rem;
            font-weight: bold;
          }
          .number-unit {
            color: #757575;
          }
        }
      }
    }
  }
</style>
