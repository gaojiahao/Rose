<template>
  <div class="pages nbjgdd-apply-container">
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
              <div class="each_mater" v-for="(oItem, key) in orderList" :key="key">
                <div class="order_code" v-if='oItem.length'>
                  <span class="order_title">加工订单号</span>
                  <span class="order_num">{{key}}</span>
                </div>
                <div :class="{'mater_delete' : matterModifyClass}" v-for="(item, index) in oItem" :key="index">
                  <matter-item :item="item" @on-modify="getMatterModify(item, index, key)" :show-delete="matterModifyClass"
                               @click.native="delClick(index,item, key)"
                               :class="{'vux-1px-b' : index < oItem.length-1}">
                    <template slot-scope="{item}" slot="info">
                      <div class='mater_more'>
                        <span v-if="item.promDeliTime">承诺交付日期: {{item.promDeliTime | dateFormat('YYYY-MM-DD')}}</span>
                        <span>库存: {{item.qtyStock}}</span>
                      </div>
                      <div class="mater_more" v-show="item.tdQty && item.shippingTime">
                        <span>主计划截止验收日:{{item.shippingTime}}</span>
                      </div>
                      <div class="mater_other" v-if="item.tdQty">
                        <div class="matter-remain">
                          <div>待计划余额: {{item.qtyBal}}</div>
                          <div>库存计划: {{item.lockQty}}</div>
                          <div>加工计划: {{item.processQty}}</div>
                        </div>
                        <span class='check_bom' @click="checkBom(item, index,key)">查看原料</span>
                      </div>
                    </template>
                    <template slot="edit" slot-scope="{item}">
                      <div class='mater_other' v-if="!item.tdQty && !matterModifyClass">
                        <div class="edit-tips" @click="getMatterModify(item, index, key)">点击进行填写</div>
                        <span class='check_bom' @click="checkBom(item, index,key)">查看原料</span>
                      </div>
                    </template>
                  </matter-item>
                  <!-- <bom-list :boms="item.boms"></bom-list> -->
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
          <pop-order-list :show="showOrderPop" v-model="showOrderPop" @sel-matter="selOrder"
                          :default-value="orderList" ref="order" is-mater-order>
            <template slot="materInfo" slot-scope="{item}">
              <div class="mater_material">
                <span class="matter-info-item">库存:{{item.qtyStock}}</span>
                <span class="matter-info-item">余额:{{item.qtyBal}}</span>
              </div>
            </template>
          </pop-order-list>
        </div>
        <!-- bom合计-->
        <div class="materiel_list" v-show="UniqueBom.length">
          <bom-list :boms="UniqueBom">
            <template slot-scope="{bom}" slot="number">
              <div class="number-part">
                <span class="main-number">原料需求: {{bom.tdQty}}{{bom.measureUnit}}</span>
                <span class="number-unit">库存余额: {{bom.qtyStock || bom.thenQtyStock}}</span>
              </div>
            </template>
          </bom-list>
        </div>
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <p class="commit-label vux-1px-b">备注栏</p>
          <x-textarea v-model="formData.biComment" placeholder="请输入"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
        <!--物料编辑pop-->
        <pop-matter :modify-matter='matter' :show-pop="showMatterPop" @sel-confirm='selConfirm'
                    v-model='showMatterPop' :btn-is-hide="btnIsHide" :is-show-amount="false">
          <template slot="modify" slot-scope="{modifyMatter}">
            <x-input title="待计划余额" type="number" v-model.number='modifyMatter.qtyBal' text-align="right"
                     @on-blur="checkQtyBal(modifyMatter)" @on-focus="getFocus($event)" placeholder="请输入"></x-input>
            <x-input title="库存计划" type="number" v-model.number='modifyMatter.lockQty' text-align="right"
                     @on-blur="checklockQty(modifyMatter)" @on-focus="getFocus($event)" placeholder="请输入"></x-input>
            <x-input title="加工计划" type="number" v-model.number='modifyMatter.processQty' text-align="right"
                     @on-blur="checkprocessQty(modifyMatter)" @on-focus="getFocus($event)" placeholder="请输入"></x-input>
            <datetime title="主计划截止验收日" v-model="modifyMatter.shippingTime" placeholder="请选择"></datetime>
            <cell title="库存" text-align='right' :value="modifyMatter.qtyStock"></cell>
          </template>
        </pop-matter>
        <!--原料bom列表-->
        <bom-pop :show="bomPopShow" :bomInfo="bom" @bom-confirm="bomConfirm" v-model="bomPopShow"
                 :btn-is-hide="btnIsHide" :no-specific-loss="true" ref="bomPop">
          <template slot="bom-left" slot-scope="{bom}">
            <div class="shipping-time" @click="modifyBomDate(bom)">
              采购交货日期: {{bom.shippingTime}}<span class="iconfont icon-bianji1"></span>
            </div>
          </template>
          <template slot="number" slot-scope="{bom}">
            <div class="number-part">
              <span class="main-number">原料需求: {{bom.tdQty}}{{bom.measureUnit}}</span>
              <span class="number-unit">库存余额: {{bom.qtyStock}}</span>
            </div>
            <div class="specific_loss" @click="modifyBomLockQty(bom)">
              原料库存计划: {{bom.lockQty}}<span class="iconfont icon-bianji1"></span>
            </div>
            <div class="specific_loss">
              单位损耗率: {{bom.specificLoss}}<!--<span class="iconfont icon-bianji1"></span>-->
            </div>
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
    Icon, Cell, Group, XInput, Datetime, XTextarea, dateFormat,
  } from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  import {getJGRKBom} from 'service/materService'
  import {saveAndStartWf, saveAndCommitTask, submitAndCalc} from 'service/common/commonService'
  // mixins 引入
  import applyCommon from 'mixins/applyCommon'
  // 组件引入
  import PopMatter from 'components/apply/commonPart/MatterPop'
  import PopOrderList from 'components/Popup/PopOrderList'
  import FormCell from 'components/detail/commonPart/form-part/FormCell'
  import BomList from 'components/detail/commonPart/BomList'
  import BomPop from 'components/apply/commonPart/BomPop'
  import RPicker from 'components/public/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  // 公共方法
  import {accMul, accAdd, accSub} from 'plugins/calc/decimalsAdd'
  import {toFixed} from '@/plugins/calc'

  const DRAFT_KEY = 'WLXQJH_DATA';
  export default {
    name: 'ApplyWLXQJHForm',
    mixins: [applyCommon],
    components: {
      Icon, Cell, Group, XInput, XTextarea,
      PopMatter, PopOrderList, Datetime,
      FormCell, BomList, BomPop, RPicker, PopBaseinfo
    },
    data() {
      return {
        listId: '867e0b4f-548f-4e08-873a-1b8e54333630',
        orderList: {},                                  // 订单列表
        showOrderPop: false,                         // 是否显示物料的popup
        formData: {
          biComment: '' //备注
        },
        submitSuccess: false, // 是否提交成功
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
        DuplicateBoms: [],//有重复项的bom
        UniqueBom: [],//无重复项的bom
        modifyIndex: null, //修改物料数量或bom损耗率时，物料的index
        modifyKey: null,//修改物料数量或bom损耗率时，物料的key
        bomPopShow: false,
        bom: {},//修改的bom
        modifyBomTdqty: [], //修改前bom
      }
    },
    watch: {
      matter: {
        handler(val) {
          val.boms && val.boms.forEach(bom => {
            // 监听领料需求变化
            let tdQty = this.calcBom(val.processQty, bom);
            bom.tdQty = Math.abs(toFixed(tdQty))
          });
        },
        deep: true
      },
    },
    methods: {
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
      // 显示物料修改的pop
      getMatterModify(item, index, key) {
        this.matter = JSON.parse(JSON.stringify(item));
        this.showMatterPop = true;
        this.modifyIndex = index;
        this.modifyKey = key;
        this.modifyBomTdqty = [...item.boms]
      },
      // 更新修改后的物料信息
      selConfirm(val) {
        let modMatter = JSON.parse(val);
        if (!modMatter.processQty) {
          modMatter.tdQty = '';
        } else {
          modMatter.tdQty = accAdd(modMatter.lockQty, modMatter.processQty);
        }
        this.$set(this.orderList[this.modifyKey], this.modifyIndex, modMatter);
        this.reBuildArr(modMatter);
      },
      reBuildArr(matter) {
        let BomArr = matter.boms;
        //修改数量时，bom数量加上修改后减去修改前的差值
        this.modifyBomTdqty.forEach(item => {
          BomArr.forEach(BItem => {
            if (BItem.inventoryCode === item.inventoryCode) {
              BItem.newTdqty = accSub(BItem.tdQty, item.tdQty);
              this.UniqueBom.forEach(AItem => {
                if (BItem.inventoryCode === AItem.inventoryCode) {
                  AItem.tdQty = accAdd(AItem.tdQty, BItem.newTdqty);
                  return false
                }
              })
              return true
            }
          })
        })
      },
      // 选中物料项
      selOrder(val) {
        let sels = JSON.parse(val);
        let orderList = {};
        let promises = [];
        this.DuplicateBoms = [];
        sels.forEach(item => {
          let key = `${item.transCode}_${item.inventoryCode}`;
          // 若有承诺交付日期，则主计划截止验收日默认取交付日期三天前的时间
          let defaultShippingTime = item.promDeliTime ? dateFormat(new Date(item.promDeliTime) - 3 * 24 * 3600 * 1000, 'YYYY-MM-DD') : '';
          let {tdQty = '', processQty = '', lockQty = item.qtyBal, shippingTime = defaultShippingTime, boms = []} = this.numMap[key] || {};
          item.tdQty = tdQty;
          item.processQty = processQty;
          item.lockQty = lockQty;
          item.shippingTime = shippingTime;
          if (!orderList[item.transCode]) {
            orderList[item.transCode] = [];
          }
          promises.push(getJGRKBom({parentInvCode: item.inventoryCode,}).then(({tableContent = []}) => {
            tableContent.forEach(bom => {
              let matchedBom = boms.find(item => bom.inventoryCode === item.inventoryCode) || {};
              let {specificLoss = bom.specificLoss, lockQty = 0, shippingTime = defaultShippingTime} = matchedBom;
              bom.specificLoss = parseFloat(specificLoss);
              bom.lockQty = lockQty;
              bom.shippingTime = shippingTime;
              let tdQty = this.calcBom(item.processQty, bom);
              bom.tdQty = Math.abs(toFixed(tdQty))
            });
            this.$set(item, 'boms', tableContent);
            let data = JSON.parse(JSON.stringify(tableContent));
            this.DuplicateBoms = [...this.DuplicateBoms, ...data];
          }));
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
      // 选择默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default03.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // 匹配相同项的索引
      findIndex(arr, sItem) {
        return arr.findIndex(item => {
          return item.orderCode === sItem.orderCode && item.transCode === sItem.transCode && item.inventoryCode === sItem.inventoryCode
        });
      },
      // 选择要删除的物料
      delClick(index, sItem, key) {
        let arr = this.selItems;
        let delIndex = this.findIndex(arr, sItem);
        //若存在重复的 则清除
        if (delIndex !== -1) {
          arr.splice(delIndex, 1);
          return;
        }
        arr.push(sItem);
      },
      // 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.findIndex(this.selItems, sItem) !== -1;
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
            //删除bom
            this.selItems.forEach(item => {
              item.boms.forEach(BItem => {
                this.UniqueBom.forEach((AItem, index) => {
                  if (BItem.inventoryCode === AItem.inventoryCode) {
                    let tdQty = accSub(AItem.tdQty, BItem.tdQty)
                    AItem.tdQty = toFixed(tdQty);
                    if (AItem.tdQty <= 0) {
                      this.UniqueBom.splice(index, 1)
                    }
                    return false
                  }
                })
                return true
              })
            })
            this.selItems = [];
            this.matterModifyClass = false;
          }
        })
      },
      // 新增更多订单
      addOrder() {
        for (let items of Object.values(this.orderList)) {
          for (let item of items) {
            // 存储已输入的价格
            this.numMap[`${item.transCode}_${item.inventoryCode}`] = {...item};
          }
        }
        this.showOrderPop = !this.showOrderPop;
      },
      // 提价订单
      submitOrder() {
        let warn = '';
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
                businessKey: this.businessKey,
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
                    tdQty: bom.tdQty, // 原料采购计划
                    lockQty: bom.lockQty, // 原料库存计划
                    demandQty: bom.qty, // 原料需求
                    thenQtyStock: bom.qtyStock,
                    bomSpecificLoss: bom.specificLoss,
                    inventoryType: bom.inventoryType,
                    tdProcessing: bom.processing || bom.tdProcessing,
                    containerCodeOut: bom.warehouseCode,
                    material: bom.material,
                    inventoryName: bom.inventoryName,
                    specification: bom.specification,
                    transObjCode: bom.inventoryCode,
                    measureUnit: bom.measureUnit,
                    bomType: bom.bomType,
                    bomQty: bom.qty || bom.bomQty,
                    shippingTime: bom.shippingTime,
                  })
                }
                let oItem = {
                  tdId: item.tdId || null,
                  transMatchedCode: item.transCode,
                  transObjCode: item.inventoryCode,
                  inventoryName_transObjCode: item.inventoryName,
                  tdProcessing: item.processing,
                  containerCodeOut: item.warehouseCode,
                  measureUnit_transObjCode: item.measureUnit,
                  thenQtyBal: item.qtyBal,
                  promDeliTime: item.promDeliTime,
                  thenQtyStock: item.qtyStock,
                  lockQty: item.lockQty,
                  processQty: item.processQty,
                  tdQty: item.tdQty,
                  leadTime: item.comment || null,
                  shippingTime: item.shippingTime || null,
                  comment: item.comment || null,
                  boms
                };
                dataSet.push(oItem);
              }
            }
            formData = {
              ...this.formData,
              modifer: this.transCode ? this.formData.handler : '',
              handlerEntity: this.entity.dealerName,
              biProcessStatus: this.currentStage,
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
            if (this.biReferenceId) {
              submitData.biReferenceId = this.biReferenceId
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
          let {success = true, formData = {},attachment = []} = data;
          // http200时提示报错信息
          if (!success) {
            this.$vux.alert.show({
              content: '抱歉，无法支持您查看的交易号，请确认交易号是否正确'
            });
            return;
          }
          let orderList = {};
          this.attachment = attachment;
          // 获取合计
          let {inPut} = formData;
          let {dataSet = []} = inPut;
          for (let item of dataSet) {
            //bom合计
            item.boms.forEach(bom => {
              bom.inventoryCode = bom.transObjCode;
              bom.specificLoss = bom.bomSpecificLoss;
              bom.qty = bom.bomQty;
            })
            this.DuplicateBoms = this.DuplicateBoms.concat(JSON.parse(JSON.stringify(item.boms)));
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
            drDealerLogisticsTerms: formData.drDealerLogisticsTerms,
          }
          this.mergeBomList();
          this.biReferenceId = formData.biReferenceId;
          this.orderList = orderList;
          this.$loading.hide();
        })
      },
      // 合并bom列表
      mergeBomList() {
        //对合计的bom进行去重合并
        let isEqual = (a, b) => a.inventoryCode === b.inventoryCode;
        let getNew = old => old.reduce((acc, cur) => {
          let hasItem = acc.some(e => {
            let temp = isEqual(e, cur);
            if (temp) {
              e.tdQty = accAdd(e.tdQty, cur.tdQty);
            }
            return temp;
          });
          if (!hasItem) acc.push(cur);
          return acc;
        }, []);
        this.UniqueBom = getNew(this.DuplicateBoms);
      },
      // 保存草稿数据
      hasDraftData() {
        // 是否选择订单
        if (!Object.values(this.orderList).length) {
          return false
        }
        return {
          [DRAFT_KEY]: {
            orderList: this.orderList,
            formData: this.formData,
            DuplicateBoms: this.DuplicateBoms,
          }
        };
      },
      // 检查待计划余额数量
      checkQtyBal(item) {
        let {qtyBal, qtyStock} = item;
        qtyBal = Math.abs(toFixed(qtyBal));
        // 待计划余额不能超过库存
        if (qtyBal > qtyStock) {
          qtyBal = qtyStock;
        }
        item.qtyBal = qtyBal;
      },
      // 检查库存计划数量
      checklockQty(item) {
        let {qtyBal, lockQty, processQty} = item;
        lockQty = Math.abs(toFixed(lockQty));
        // 当库存计划 + 加工计划 > 待计划余额时，库存计划取待计划余额和加工计划的差值
        if (accAdd(lockQty, processQty) > qtyBal) {
          lockQty = accSub(qtyBal, processQty);
        }
        item.lockQty = lockQty;
      },
      // 检查加工计划数量
      checkprocessQty(item) {
        let {qtyBal, lockQty, processQty} = item;
        processQty = Math.abs(toFixed(processQty));
        // 当库存计划 + 加工计划 > 待计划余额时，加工计划取待计划余额和库存计划的差值
        if (accAdd(lockQty, processQty) > qtyBal) {
          processQty = accSub(qtyBal, lockQty);
        }
        item.processQty = processQty;
      },
      // 修改原料库存计划
      modifyBomLockQty(bom) {
        this.$vux.confirm.prompt(bom.lockQty, {
          title: '原料库存计划',
          onConfirm: (val) => {
            if (val) {
              this.$refs.bomPop.changeToConfirm();
              bom.lockQty = Math.abs(toFixed(val));
              let tdQty = this.calcBom(this.bom.processQty, bom);
              bom.tdQty = Math.abs(toFixed(tdQty));
            }
          }
        })
      },
      // 修改单位损耗率
      modifyBomSpecificLoss(bom) {
        this.$vux.confirm.prompt(item.specificLoss, {
          title: '单位损耗率',
          onConfirm: (val) => {
            if (val) {
              this.$refs.bomPop.changeToConfirm();
              bom.specificLoss = Math.abs(toFixed(val));
              let tdQty = this.calcBom(this.bom.processQty, bom);
              bom.tdQty = Math.abs(toFixed(tdQty));
            }
          }
        })
      },
      // 修改采购交货日期
      modifyBomDate(bom) {
        this.$vux.datetime.show({
          cancelText: '取消',
          confirmText: '确定',
          value: bom.shippingTime,
          onConfirm: (val) => {
            this.$refs.bomPop.changeToConfirm();
            bom.shippingTime = val;
          },
        });
      },
      // 计算bom的值
      calcBom(qty, bom) {
        // 加工计划数量 * bom消耗的原料 * (1 + 损耗率) - 原料库存计划
        return accSub(accMul(qty, bom.qty, (1 + bom.specificLoss)), bom.lockQty);
      },
    },
    filters: {
      dateFormat,
    },
    created() {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        let draft = JSON.parse(data);
        this.orderList = draft.orderList;
        this.formData = draft.formData;
        this.DuplicateBoms = draft.DuplicateBoms;
        this.mergeBomList();
        sessionStorage.removeItem(DRAFT_KEY);
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import '~scss/biz-app/bizApply';

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

  /* 订单弹窗 */
  .trade_pop_part {
    .mater_material {
      font-size: 0;
      .matter-info-item {
        margin-right: .06rem;
        font-size: .12rem;
        &:last-child {
          margin-right: 0;
        }
      }
    }
  }
</style>
