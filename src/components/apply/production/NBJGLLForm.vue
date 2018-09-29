<template>
  <div class="pages bdkcdb-apply-container">
    <div class="basicPart no_count" ref='fill'>
      <div class='fill_wrapper'>
        <!-- 出库仓库-->
        <pop-warehouse-list title="出库仓库" :default-value="warehouseOut" @sel-item="selWarehouseOut"></pop-warehouse-list>
        <!-- 入库仓库-->
        <pop-warehouse-list title="入库仓库" :default-value="warehouseIn" @sel-item="selWarehouseIn"></pop-warehouse-list>
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
              <div class="each_mater vux-1px-b" v-for="(oItem, key) in orderList" :key="key">
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
                          <span>待领料: {{item.qtyBal}}</span>
                        </div>
                        <div class="mater_other">
                          <div class="matter-remain" v-if="item.warehouseName">
                            <i class="iconfont icon--"></i>
                            <span>{{item.warehouseName}}</span>
                          </div>
                          <div class="matter-remain">
                            <span class="symbol">本次领料: </span>{{item.tdQty}}
                          </div>
                        </div>
                        <!-- 编辑图标 -->
                        <div class="edit-part vux-1px-l" @click="modifyMatter(item,index, key)">
                          <span class='iconfont icon-bianji1'></span>
                        </div>
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
          <pop-order-list :show="showOrderPop" :params="warehouseParams" v-model="showOrderPop" @sel-matter="selOrder"
                          :default-value="orderList" list-method="getInProcessingStorage" :is-mater-proccing="true"
                               ref="order"></pop-order-list>
        </div>

        <!--物料编辑pop-->
        <pop-matter :modify-matter='matter' :show-pop="showMatterPop" @sel-confirm='selConfirm' v-model='showMatterPop'
                    :btn-is-hide="btnIsHide">
          <template slot="modify" slot-scope="{modifyMatter}">
            <x-input title="本次领料" type="number" v-model='modifyMatter.tdQty' text-align="right"
                     @on-blur="checkAmt(modifyMatter)"></x-input>
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
// vux插件引入
import {Icon, Cell, Group, XInput, Swipeout, SwipeoutItem, SwipeoutButton,} from 'vux'
// 请求 引入
import {getSOList} from 'service/detailService'
import {submitAndCalc, saveAndStartWf, saveAndCommitTask,} from 'service/commonService'
// minxins 引入
import ApplyCommon from 'pageMixins/applyCommon'
// 组件引入
import RNumber from 'components/RNumber'
import PopWarehouseList from 'components/Popup/PopWarehouseList'
import PopMatter from 'components/apply/commonPart/MatterPop'
import PopOrderList from 'components/Popup/PopOrderList'
export default {
  mixins: [ApplyCommon],
  components: {
    Icon, Cell, Group, XInput,
    RNumber,
    PopOrderList, PopWarehouseList, PopMatter,
  },
  data() {
    return {
      listId: '762b8df4-2555-4325-884a-355f34355832',
      orderList: {},                                  // 订单列表
      matterList: [],  // 物料列表
      showOrderPop: false, // 是否显示物料的popup
      transCode: '',
      formData: {
        biComment: '',
      },
      numMap: {},
      warehouseOut: null,
      warehouseIn: null,
      warehouseParams: {
        whCode: '',
      },
      matter:{},
      showMatterPop :false,
      modifyIndex:null,
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
    // TODO 选中出库仓库
    selWarehouseOut(val) {
      this.warehouseOut = JSON.parse(val);
      this.warehouseParams = {
        ...this.warehouseParams,
        whCode: this.warehouseOut.warehouseCode,
      };
      this.orderList = {};
    },
    // TODO 选中入库仓库
    selWarehouseIn(val) {
      this.warehouseIn = JSON.parse(val);
    },
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
      console.log(modMatter);
      console.log(this.modifyKey)
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
        orderList[item.transCode].push(item);
      });
      this.numMap = {};
      this.matterList = sels;
      this.orderList = orderList;
    },
    // TODO 获取默认图片
    getDefaultImg(item) {
      let url = require('assets/wl_default02.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
   // TODO 提价订单
    submitOrder() {
      let warn = '';
      let dataSet = [];
      let validateMap = [
        {
          key: 'warehouseOut',
          message: '出库仓库'
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
              let oItem = {
                transMatchedCode: item.transCode, // 明细被核销交易号
                outPutMatCode: item.inventoryCode, // 输出物料
                tdProcessing: item.processing, //加工属性
                thenQtyBal: item.qtyBal, // 待交付数量
                thenQtyStock: item.qtyStockBal, // 当时可用库存
                tdQty: item.tdQty, // 明细发生数
                comment: item.comment || '', // 说明
              };
              if (this.transCode) {
                oItem.tdId = item.tdId || '';
              }
              dataSet.push(oItem);
            }
          }
          formData = {
            ...this.formData,
            modifer: this.transCode ? this.formData.handler : '',
            handlerEntity: this.entity.dealerName,
            outPut: {
              containerCodeOut: this.warehouseOut.warehouseCode,
              containerCode: this.warehouseIn.warehouseCode,
              dataSet
            },
            containerOutWarehouseManager: this.warehouseOut.containerOutWarehouseManager || null, // 出库管理员
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
            qtyStockBal: item.thenQtyStock,
            inventoryPic: item.inventoryPic_outPutMatCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_outPutMatCode}&width=400&height=400` : this.getDefaultImg(),
            inventoryName: item.inventoryName_outPutMatCode,
            inventoryCode: item.outPutMatCode,
            specification: item.specification_outPutMatCode,
            processing: item.tdProcessing
          };
          if (!orderList[item.transCode]) {
            orderList[item.transCode] = [];
          }
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
        // 出库
        this.warehouseOut = {
          warehouseCode: outPut.containerCodeOut,
          warehouseName: outPut.warehouseName_containerCodeOut,
          warehouseType: outPut.warehouseType_containerCodeOut,
          warehouseProvince: outPut.warehouseProvince_containerCodeOut,
          warehouseCity: outPut.warehouseCity_containerCodeOut,
          warehouseDistrict: outPut.warehouseDistrict_containerCodeOut,
          warehouseAddress: outPut.warehouseAddress_containerCodeOut,
        };
        this.warehouseParams = {
          whCode: this.warehouseOut.warehouseCode,
        };
        this.formData = {
          ...this.formData,
          creator: formData.creator,
          biComment: formData.biComment,
        };
        this.biReferenceId = formData.biReferenceId;
        this.matterList = matterList;
        this.$loading.hide();
      })
    },
  },
  created() {
    let data = sessionStorage.getItem('KCDB_DATA');
    if (data) {
      this.matterList = JSON.parse(data).matter;
      this.warehouseOut = JSON.parse(data).warehouseOut;
      this.warehouseIn = JSON.parse(data).warehouseIn;
    }
  },
}
</script>

<style lang="scss" scoped>
  @import './../../scss/bizApply';

  .bdkcdb-apply-container {
    .matter-remain {
      color: #5077aa;
      font-size: .16rem;
      font-weight: bold;
      .symbol {
        color: #757575;
      }
    }
  }
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
</style>
