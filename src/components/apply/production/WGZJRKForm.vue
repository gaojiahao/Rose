<template>
  <div class="pages wgzjrk-apply-container">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 在制仓库-->
        <pop-warehouse-list title="在制仓库" :default-value="warehouseOut" @sel-item="selWarehouseOut" isRequired
                            get-list-method="getWareHouseType" :params="warehouseOutParams"></pop-warehouse-list>

        <!-- 入库仓库-->
        <pop-warehouse-list title="入库仓库" :default-value="warehouseIn" @sel-item="selWarehouseIn" isRequired
                            get-list-method="getWareHouseType" :params="warehouseInParams"></pop-warehouse-list>
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
              <div class="each_mater" v-for="(oItem, key,index) in orderList" :key="key">
                <div class="order_code" v-if='oItem.length'>
                  <span class="order_title">加工订单号</span>
                  <span class="order_num">{{key}}</span>
                </div>
                <div :class="{'mater_delete' : matterModifyClass}" v-for="(item, index) in oItem" :key="index">
                  <matter-item :item="item" @on-modify="modifyMatter(item,index, key)" :show-delete="matterModifyClass"
                               @click.native="delClick(index,item, key)"
                               :class="{'vux-1px-b' : index < oItem.length-1}">
                    <template slot-scope="{item}" slot="info">
                      <div class="mater_more">
                        <span>车间仓库存: {{item.qtyStock}}</span>
                        <span>待入库数量: {{item.qtyBal}}</span>
                        <span>计划完工日期: {{item.shippingTime}}</span>
                      </div>
                      <div class="mater_more">
                        <span>合格数: {{item.tdQty}}</span>
                        <span>不合格数: {{item.differenceNum}}</span>
                      </div>
                      <div class="mater_other" v-if="item.tdQty">
                        <div class="matter-remain">
                          <span>本次质检: {{item.qualityQty}}</span>
                        </div>
                        <span class='check_bom' @click="checkBom(item,index,key)">查看原料</span>
                      </div>
                    </template>
                    <template slot="edit" slot-scope="{item}">
                      <div class='mater_other' v-if="!item.tdQty && !matterModifyClass">
                        <div class="edit-tips" @click="modifyMatter(item,index, key)">点击进行填写</div>
                        <span class='check_bom' @click="checkBom(item,index,key)">查看原料</span>
                      </div>
                    </template>
                  </matter-item>
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
          <pop-order-xqtj-list :show="showOrderPop" v-model="showOrderPop" @sel-matter="selOrder" :params="orderParams"
                               :default-value="orderList" list-method="getInProcessingStorage" ref="order">
            <template slot="qtyBal" slot-scope="{item}">
              <span>待入库数量: {{item.qtyBal}}</span>
            </template>
            <template slot="qtyStock" slot-scope="{item}">
              <div class="mater-balance">车间仓库存: {{item.qtyStock}}</div>
            </template>
          </pop-order-xqtj-list>
        </div>
        <!-- bom合计-->
        <div class="materiel_list" v-show="UniqueBom.length">
          <bom-list :boms="UniqueBom">
            <template slot-scope="{bom}" slot="number">
              <div class="number-part">
                <span class="main-number">原料需求: {{bom.demandQty}}{{bom.measureUnit}}</span>
                <span class="number-unit">待领料: {{bom.qtyBal}}</span>
                <span class="number-unit">在库余额: {{bom.thenTotalQtyStock}}</span>
              </div>
            </template>
          </bom-list>
        </div>
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment"></upload-file>
        <!--物料编辑pop-->
        <pop-matter :modify-matter='matter' :show-pop="showMatterPop" @sel-confirm='selConfirm'
                    v-model='showMatterPop' :btn-is-hide="btnIsHide" :is-show-amount="false">
          <template slot="qtyBal" slot-scope="{modifyMatter}">
            <div>
              <span>订单数量: {{modifyMatter.productDemandQty}}</span>
              <span>待检仓库存: {{modifyMatter.qtyStock}}</span>
              <span>待入库数量: {{modifyMatter.qtyBal}}</span>
            </div>
            <div>
              <span>制造费用: ￥{{modifyMatter.skinFee | numberComma}}</span>
              <span>工价: ￥{{modifyMatter.wages | numberComma}}</span>
            </div>
          </template>
          <template slot="modify" slot-scope="{modifyMatter}">
            <x-input type="number" v-model.number='modifyMatter.qualityQty' text-align="right"
                     @on-blur="checkAmt(modifyMatter)" @on-focus="getFocus($event)" placeholder="请输入">
              <span class="required" slot="label">本次质检</span>
            </x-input>
            <x-input title="合格数" type="number" v-model.number='modifyMatter.tdQty' text-align="right"
                     @on-blur="checkAmt(modifyMatter)" @on-focus="getFocus($event)" placeholder="请输入">
            </x-input>
            <cell title="不合格数" :value="modifyMatter.differenceNum"></cell>
            <datetime title="计划完工日期" v-model="modifyMatter.shippingTime" placeholder="请选择"></datetime>
          </template>
        </pop-matter>

        <!--原料bom列表-->
        <bom-pop :show="bomPopShow" :bomInfo="bom" v-model="bomPopShow"
                 :btn-is-hide="btnIsHide" :no-specific-loss="true" ref="bomPop">
          <template slot="number" slot-scope="{bom}">
            <div class="number-part">
              <span class="main-number">原料需求: {{bom.demandQty}}{{bom.measureUnit}}</span>
            </div>
            <div class="specific_loss">单位损耗率: {{bom.specificLoss}}</div>
          </template>
        </bom-pop>
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
  // vux组件引入
  import {
    Icon, Cell, Group, XInput, Datetime, XTextarea, dateFormat
  } from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  import {getJGRKBom, getInProcessingStorageSumSource} from 'service/materService'
  import {saveAndStartWf, saveAndCommitTask, submitAndCalc} from 'service/commonService'
  // mixins 引入
  import applyCommon from 'components/mixins/applyCommon'
  // 组件引入
  import PopMatter from 'components/apply/commonPart/MatterPop'
  import PopOrderXqtjList from 'components/Popup/PopOrderXQTJList'
  import PopWarehouseNbjgrkList from 'components/Popup/PopWarehouseNBJDRKList'
  import FormCell from 'components/detail/commonPart/FormCell'
  import BomList from 'components/detail/commonPart/BomList'
  import BomPop from 'components/apply/commonPart/BomPop'
  import RPicker from 'components/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import PopWarehouseList from 'components/Popup/PopWarehouseList'
  // 公共方法
  import {accMul, accAdd, accSub} from '@/home/pages/maps/decimalsAdd'
  import {toFixed} from '@/plugins/calc'

  const DRAFT_KEY = 'NBJGRK_DATA';
  export default {
    name: 'ApplyWLXQTJForm',
    mixins: [applyCommon],
    components: {
      Icon, Cell, Group, XInput, XTextarea,
      PopMatter, PopOrderXqtjList, Datetime,
      FormCell, PopWarehouseNbjgrkList, BomList, BomPop, RPicker, PopBaseinfo, PopWarehouseList
    },
    data() {
      return {
        listId: '5e8d89f1-49a5-4089-9c1a-44dc2ce0ae4b',
        orderList: {}, // 订单列表
        showOrderPop: false, // 是否显示物料的popup
        formData: {
          biProcessStatus: null, // 流程状态
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
        modifyIndex: null, // 修改物料数量或bom损耗率时，物料的index
        modifyKey: null, // 修改物料数量或bom损耗率时，物料的key
        warehouseOut: {
          warehouseName: '待检仓',
          warehouseCode: 'QC0001',
          warehouseType: '一般部门仓',
        },
        warehouseIn: null,
        warehouseOutParams: {
          warehouseType: '一般部门仓',
        },
        warehouseInParams: {
          warehouseType: '一般部门仓,个人仓,加工车间仓',
        },
        orderParams: {
          whCode: 'QC0001',
        },
        DuplicateBoms: [],//有重复项的bom
        UniqueBom: [],//无重复项的bom
        bom: {},//修改的bom
        bomPopShow: false,
        modifyBomTdqty: [], //修改前bom
      }
    },
    /*watch: {
      matter: {
        handler(val) {
          val.boms && val.boms.forEach(bom => {
            // 监听领料需求变化
            let demandQty = this.calcBom(val.differenceNum, bom);
            bom.demandQty = Math.abs(toFixed(demandQty))
          });
          this.mergeBomList();
        },
        deep: true
      },
    },*/
    methods: {
      // TODO 选中在制仓库
      selWarehouseOut(val) {
        this.warehouseOut = JSON.parse(val);
        this.orderParams = {
          ...this.orderParams,
          whCode: this.warehouseOut.warehouseCode,
        };
        this.orderList = {};
      },
      // TODO 选中入库仓库
      selWarehouseIn(val) {
        this.warehouseIn = JSON.parse(val);
      },
      // 检验数量
      checkAmt(item) {
        let {qualityQty = 0, tdQty = 0, qtyStock = 0, qtyBal = 0} = item;
        let maxQty = Math.min(qtyStock, qtyBal); // 最大质检数量
        // 本次质检数量
        if (qualityQty) {
          qualityQty = Math.min(maxQty, qualityQty);
          item.qualityQty = Math.abs(toFixed(qualityQty));
          this.$set(item, 'differenceNum', accSub(qualityQty, tdQty));
        }
        // 合格数量
        if (tdQty) {
          tdQty = Math.min(maxQty, tdQty);
          item.tdQty = Math.abs(toFixed(tdQty));
          this.$set(item, 'differenceNum', accSub(qualityQty, tdQty));
        }
      },
      //查看原料
      checkBom(item, index, key) {
        this.bom = item;
        this.modifyIndex = index;
        this.modifyKey = key;
        this.bomPopShow = true;
        this.modifyBomTdqty = JSON.parse(JSON.stringify(item.boms))
      },
      //修改原料的损耗率
      bomConfirm(val) {
        let matter = JSON.parse(val);
        this.$set(this.orderList[this.modifyKey], this.modifyIndex, matter);
        this.reBuildArr(matter);
      },
      // TODO 显示物料修改的pop
      modifyMatter(item, index, key) {
        this.matter = JSON.parse(JSON.stringify(item));
        this.showMatterPop = true;
        this.modifyIndex = index;
        this.modifyKey = key;
        this.modifyBomTdqty = [...item.boms]
      },
      // TODO 更新修改后的物料信息
      selConfirm(val) {
        let modMatter = JSON.parse(val);
        this.$set(this.orderList[this.modifyKey], this.modifyIndex, modMatter);
        this.reBuildArr(modMatter);
      },
      reBuildArr(matter) {
        let BomArr = matter.boms;
        //修改数量时，bom数量加上修改后减去修改前的差值
        this.modifyBomTdqty.forEach(item => {
          BomArr.forEach(BItem => {
            if (BItem.inventoryCode === item.inventoryCode) {
              BItem.newTdqty = accSub(BItem.demandQty, item.demandQty);
              console.log(BItem.newTdqty)
              this.UniqueBom.forEach(AItem => {
                if (BItem.inventoryCode === AItem.inventoryCode) {
                  AItem.demandQty = accAdd(AItem.demandQty, BItem.newTdqty);
                  return false
                }
              });
              return true
            }
          })
        })
      },
      // TODO 选中物料项
      selOrder(val) {
        let sels = JSON.parse(val);
        let orderList = {};
        let promises = [];
        this.DuplicateBoms = [];
        sels.forEach(item => {
          let key = `${item.transCode}_${item.orderCode}_${item.inventoryCode}`;
          let maxQty = Math.min(item.qtyStock || 0, item.qtyBal || 0); // 最大质检数量
          let {tdQty = maxQty, boms = [], qualityQty = maxQty, shippingTime = dateFormat(item.shippingTime, 'YYYY-MM-DD')} = this.numMap[key] || {};
          item.tdQty = tdQty;
          item.shippingTime = shippingTime;
          item.qualityQty = qualityQty;
          item.differenceNum = accSub(qualityQty, tdQty);
          promises.push(getJGRKBom({parentInvCode: item.inventoryCode,}).then(({tableContent = []}) => {
            tableContent.forEach(bom => {
              let matchedBom = boms.find(item => bom.inventoryCode === item.inventoryCode) || {};
              let {specificLoss = bom.specificLoss, lockQty = 0} = matchedBom;
              bom.specificLoss = parseFloat(specificLoss);
              let demandQty = this.calcBom(item.differenceNum, bom);
              bom.demandQty = Math.abs(toFixed(demandQty));
            });
            this.$set(item, 'boms', tableContent);
            let data = JSON.parse(JSON.stringify(tableContent));
            this.DuplicateBoms = [...this.DuplicateBoms, ...data];
          }));
          if (!orderList[item.transCode]) {
            orderList[item.transCode] = [];
          }
          orderList[item.transCode].push(item);
        });
        Promise.all(promises).then(data => {
          // 合并bom
          this.mergeBomList();
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
      // TODO 匹配相同项的索引
      findIndex(arr, sItem) {
        return arr.findIndex(item => {
          return item.orderCode === sItem.orderCode && item.transCode === sItem.transCode && item.inventoryCode === sItem.inventoryCode
        });
      },
      // TODO 滑动删除
      delClick(index, sItem, key) {
        let arr = this.selItems;
        let delIndex = this.findIndex(arr, sItem);
        // 若存在重复的 则清除
        if (delIndex !== -1) {
          arr.splice(delIndex, 1);
          return;
        }
        arr.push(sItem);
      },
      // TODO 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.findIndex(this.selItems, sItem) !== -1;
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
            let newArr = [];
            let keys = Object.keys(this.orderList);
            keys.forEach(item => {
              newArr = newArr.concat(this.orderList[item]);
            });
            this.selItems.forEach(SItem => {
              newArr.forEach(OItem => {
                if (OItem.orderCode === SItem.orderCode && OItem.inventoryCode === SItem.inventoryCode && OItem.transCode === SItem.transCode) {
                  let delArr = this.orderList[OItem.transCode];
                  let delIndex = this.findIndex(delArr, OItem);
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
            this.numMap[`${item.transCode}_${item.orderCode}_${item.inventoryCode}`] = {...item};
          }
        }
        this.showOrderPop = !this.showOrderPop;
      },
      // TODO 提价订单
      submitOrder() {
        let warn = '';
        let validateMap = [
          {
            key: 'warehouseOut',
            message: '在制仓库',
          },
          {
            key: 'warehouseIn',
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
        if (!warn) {
          for (let value of Object.values(this.orderList)) {
            for (let vItem of value) {
              if (!vItem.tdQty) {
                warn = '请填写本次入库数量'
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
                let oItem = {
                  tdId: item.tdId || null,
                  transMatchedCode: item.transCode, // 交易号
                  orderCode: item.orderCode,
                  transObjCode: item.inventoryCode, // 输出物料
                  inventoryName_transObjCode: item.inventoryName,
                  tdProcessing: item.processing,
                  measureUnit_transObjCode: item.measureUnit,
                  thenQtyStock: item.qtyStock, // 可用库存
                  thenQtyBal: item.qtyBal, // 可验收余额
                  tdQty: item.tdQty, // 下单数量
                  comment: item.comment || '', // 说明
                };
                dataSet.push(oItem);
              }
            }
            formData = {
              ...this.formData,
              modifer: this.transCode ? this.formData.handler : '',
              handlerEntity: this.entity.dealerName,
              inPut: {
                containerCodeOut: this.warehouseOut.warehouseCode,
                containerCode: this.warehouseIn.warehouseCode,
                dataSet
              },
              containerOutWarehouseManager: this.warehouseOut.manager || null,
              containerInWarehouseManager: this.warehouseIn.manager || null,
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
              // biReferenceId: this.biReferenceId,
              formData: JSON.stringify(formData),
              wfPara: JSON.stringify(wfPara)
            };
            // if (!this.transCode) {
            //   delete submitData.biReferenceId
            // }
            if (!this.processCode.length) { // 无工作流
              operation = submitAndCalc;
              delete submitData.wfPara;
              // delete submitData.biReferenceId;
            }
            if (this.transCode) {
              submitData.biReferenceId = this.biReferenceId
            }
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
          let {success = true, formData = {}, attachment = []} = data;
          // http200时提示报错信息
          if (!success) {
            this.$vux.alert.show({
              content: '抱歉，无法支持您查看的交易号，请确认交易号是否正确'
            });
            return;
          }
          this.attachment = attachment;
          let orderList = {};
          // 获取合计
          let {inPut} = formData;
          let {dataSet = []} = inPut;
          for (let item of dataSet) {
            item = {
              ...item,
              transCode: item.transMatchedCode,
              qtyBal: item.thenQtyBal,
              qtyStock: item.thenQtyStock,
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
          this.warehouseOut = {
            warehouseName: inPut.warehouseName_containerCodeOut,
            warehouseType: inPut.warehouseType_containerCodeOut,
            warehouseCode: inPut.containerCodeOut,
            manager: formData.containerOutWarehouseManager
          }
          this.warehouseIn = {
            warehouseName: inPut.warehouseName_containerCode,
            warehouseType: inPut.warehouseType_containerCode,
            warehouseCode: inPut.containerCode,
            manager: formData.containerInWarehouseManager
          }
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
            ...this.formData,
            ...this.handlerDefault,
            biComment: formData.biComment,
            biId: formData.biId,
            biProcessStatus: formData.biProcessStatus,
            creator: formData.creator,
            modifer: formData.modifer,
          };
          this.biReferenceId = formData.biReferenceId;
          this.orderList = orderList;
          this.orderParams = {
            ...this.orderParams,
            whCode: this.warehouseOut.warehouseCode,
          };
          this.$loading.hide();
        })
      },
      // TODO 保存草稿数据
      hasDraftData() {
        // 是否选择订单
        if (!Object.values(this.orderList).length) {
          return false
        }
        return {
          [DRAFT_KEY]: {
            orderList: this.orderList,
            formData: this.formData,
            warehouseIn: this.warehouseIn,
            warehouseOut: this.warehouseOut,
          }
        };
      },
      // TODO 合并bom列表
      mergeBomList() {
        //对合计的bom进行去重合并
        let promise = [];
        let UniqueBom = this.DuplicateBoms.reduce((arr, item) => {
          let matched = arr.find(a => a.inventoryCode === item.inventoryCode);
          if (!matched) {
            !item.thenTotalQtyStock && item.thenTotalQtyStock !== 0
            && promise.push(getInProcessingStorageSumSource({inventoryCode: item.inventoryCode}).then(({tableContent = []}) => {
              let [data = {}] = tableContent;
              item.qtyBal = data.qtyBal || 0;
              item.thenTotalQtyStock = data.thenTotalQtyStock || 0;
            }));
            item.tdQty = item.demandQty;
            arr.push(item);
          } else {
            matched.tdQty = accAdd(matched.tdQty, item.demandQty);
          }
          return arr;
        }, []);
        Promise.all(promise).then(() => {
          this.UniqueBom = UniqueBom;
        });
      },
      // TODO 计算bom的值
      calcBom(qty, bom) {
        // 不合格数量 * bom消耗的原料 * (1 + 损耗率)
        return accMul(qty, bom.qty, (1 + bom.specificLoss));
      },
    },
    created() {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        let draft = JSON.parse(data);
        this.orderList = draft.orderList;
        this.formData = draft.formData;
        this.warehouseOut = draft.warehouseOut;
        this.warehouseIn = draft.warehouseIn;
        this.orderParams = {
          ...this.orderParams,
          whCode: this.warehouseOut.warehouseCode,
        };
        sessionStorage.removeItem(DRAFT_KEY);
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizApply';

  .wgzjrk-apply-container {
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

  .bom-container {
    .number-part {
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
    .shipping-time {
      font-size: .12rem;
      font-weight: bold;
    }
    .specific_loss {
      font-size: .12rem;
      font-weight: bold;
      text-align: right;
      .icon-bianji1 {
        font-size: 0.12rem;
        font-weight: normal;
      }
    }
  }
</style>
