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
              <div class="each_mater" v-for="(oItem, key,index) in orderList" :key="key">
                <div class="order_code" v-if='oItem.length'>
                  <span class="order_title">计划号</span>
                  <span class="order_num">{{key}}</span>
                </div>
                <div :class="{mater_delete : matterModifyClass}" v-for="(item, index) in oItem" :key="index">
                  <matter-item :item="item" @on-modify="getMatterModify(item, index, key)" :show-delete="matterModifyClass"
                               @click.native="delClick(index,item, key)" :class="{'vux-1px-b' : index < oItem.length-1 }">
                    <template slot-scope="{item}" slot="info">
                      <div class='mater_more'>
                        <span>单位: {{item.measureUnit}}</span>
                        <span>待下单余额: {{item.qtyBal}}</span>
                      </div>
                      <div class="mater_more" v-show="item.shippingTime">
                        <span>成品计划验收日期:{{item.shippingTime}}</span>
                      </div>
                      <div class="mater_other" v-if="item.tdQty">
                        <div class="matter-remain">
                          本次下单: {{item.tdQty}}
                        </div>
                        <span class='check_bom' @click="checkBom(item, index,key)">查看原料</span>
                      </div>
                    </template>
                    <template slot="edit" slot-scope="{item}">
                      <div class='mater_other' v-if="!item.tdQty && !matterModifyClass">
                        <div class="edit-tips" @click="getMatterModify(item, index, key)" >点击进行填写</div>
                        <span class='check_bom' @click="checkBom(item, index,key)">查看原料</span>
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
          <pop-order-xqtj-list :show="showOrderPop" v-model="showOrderPop" @sel-matter="selOrder"
                               :default-value="orderList" list-method="getInProcessingOrder"
                               ref="order"></pop-order-xqtj-list>
        </div>
        <!-- bom合计-->
        <div class="materiel_list" v-show="UniqueBom.length">
          <bom-list :boms="UniqueBom">
            <template slot-scope="{bom}" slot="number">
              <div class="number-part">
                <span class="main-number">领料需求: {{bom.tdQty}}{{bom.measureUnit}}</span>
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
            <x-input title="本次下单" type="number" v-model.number='modifyMatter.tdQty' text-align="right"
                     @on-blur="checkAmt(modifyMatter)"  @on-focus="getFocus($event)" placeholder="请输入"></x-input>
            <datetime title="主计划完工入库日" v-model="modifyMatter.shippingTime" placeholder="请选择"></datetime>
            <cell title="待下单余额" text-align='right' placeholder='请填写' :value="modifyMatter.qtyBal"></cell>
          </template>
        </pop-matter>
        <!--原料bom列表-->
        <bom-pop :show="bomPopShow" :bomInfo="bom" @bom-confirm="bomConfirm" v-model="bomPopShow" class="bom_pop" :btn-is-hide="btnIsHide">
          <template slot-scope="{bom}" slot="number">
            <div class="number-part">
              <span class="main-number">领料需求: {{bom.tdQty}}{{bom.measureUnit}}</span>
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
    Icon, Cell, Group, XInput, Datetime,XTextarea
  } from 'vux'
  // 请求 引入
  import { getSOList } from 'service/detailService'
  import { getJGDDBom } from 'service/materService'
  import { saveAndStartWf, saveAndCommitTask, submitAndCalc } from 'service/common/commonService'
  // mixins 引入
  import applyCommon from 'mixins/applyCommon'
  // 组件引入
  import PopMatter from 'components/apply/commonPart/MatterPop'
  import PopOrderXqtjList from 'components/Popup/PopOrderXQTJList'
  import FormCell from 'components/detail/commonPart/form-part/FormCell'
  import BomList from 'components/detail/commonPart/BomList'
  import BomPop from 'components/apply/commonPart/BomPop'
  import RPicker from 'components/public/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  // 公共方法
  import { accMul,accAdd,accSub } from 'plugins/calc/decimalsAdd'
  import { toFixed } from '@/plugins/calc'

  const DRAFT_KEY = 'NBJGDD_DATA';
  export default {
    name: 'ApplyWLXQTJForm',
    mixins: [applyCommon],
    components: {
      Icon, Cell, Group, XInput,XTextarea,
      PopMatter, PopOrderXqtjList, Datetime,
      FormCell, BomList,BomPop, RPicker, PopBaseinfo
    },
    data() {
      return {
        listId: '65ceb5a6-a120-11e8-862a-005056a136d0',
        orderList: {}, // 订单列表
        showOrderPop: false, // 是否显示物料的popup
        DuplicateBoms: [], // 有重复项的bom
        UniqueBom: [], // 无重复项的bom
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
        selItems:[], // 点击选中要删除的物料，用来判断时候选中
        matter: {}, // 选来存储要进行编辑的物料
        showMatterPop: false,
        modifyIndex: null, // 修改物料数量或bom损耗率时，物料的index
        modifyKey: null, // 修改物料数量或bom损耗率时，物料的key
        bomPopShow: false,
        bom: {}, // 修改的bom
        modifyBomTdqty : [] // 修改前bom
      }
    },
    watch: {
      matter: {
        handler (val) {
          val.boms && val.boms.forEach(item => {
            // 监听领料需求变化
            let tdQty = accMul(val.tdQty, item.qty, (1 + item.specificLoss))
            item.tdQty = Math.abs(toFixed(tdQty))
          });
        },
        deep: true
      }
    },
    methods: {
      // 查看原料
      checkBom (item, index,key) {
        this.bom = item;
        this.modifyIndex = index;
        this.modifyKey = key;
        this.bomPopShow = true;
        this.modifyBomTdqty = JSON.parse(JSON.stringify(item.boms))
      },
      // 修改原料的损耗率
      bomConfirm (val) {
        let matter = JSON.parse(val);
        this.$set(this.orderList[this.modifyKey], this.modifyIndex, matter);
        this.reBuildArr(matter);
      },
      // 显示物料修改的pop
      modifyMatter (item, index, key) {
        this.matter = JSON.parse(JSON.stringify(item));
        this.showMatterPop = true;
        this.modifyIndex = index;
        this.modifyKey = key;
        this.modifyBomTdqty = [...item.boms]
      },
      // 更新修改后的物料信息
      selConfirm (val) {
        let modMatter = JSON.parse(val);
        this.$set(this.orderList[this.modifyKey], this.modifyIndex, modMatter);
        this.reBuildArr(modMatter);
      },
      reBuildArr (matter) {
        let BomArr = matter.boms;
        //修改数量时，bom数量加上修改后减去修改前的差值
        this.modifyBomTdqty.forEach(item=> {
          BomArr.forEach(BItem=> {
            if (BItem.inventoryCode === item.inventoryCode) {
              BItem.newTdqty = accSub(BItem.tdQty, item.tdQty);
              this.UniqueBom.forEach(AItem=> {
                if (BItem.inventoryCode === AItem.inventoryCode) {
                  AItem.tdQty = accAdd( AItem.tdQty, BItem.newTdqty);
                  return false
                }
              })
              return true
            }
          })
        })
      },
      // 选中物料项
      selOrder (val) {
        let sels = JSON.parse(val);
        let orderList = {};
        let promises = [];
        this.DuplicateBoms = []
        sels.forEach(item => {
          let key = `${item.transCode}_${item.orderCode}_${item.inventoryCode}`;
          let {tdQty = '', shippingTime = '', boms = []} = this.numMap[key] || {};
          item.tdQty = tdQty;
          item.shippingTime = shippingTime;
          if (!orderList[item.transCode]) {
            orderList[item.transCode] = [];
          }
          promises.push(getJGDDBom({parentInvCode: item.inventoryCode}).then(({tableContent = []}) => {
            tableContent.forEach(bom => {
              let matchedBom = boms.find(item => bom.inventoryCode === item.inventoryCode) || {};
              let {specificLoss = bom.specificLoss} = matchedBom;
              let tdQty = accMul(item.tdQty, bom.qty, (1 + specificLoss));
              bom.specificLoss = specificLoss;
              bom.tdQty = Math.abs(toFixed(tdQty))

            });
            this.$set(item, 'boms', tableContent);
            let data = JSON.parse(JSON.stringify(tableContent));
            this.DuplicateBoms = [...this.DuplicateBoms, ...data];
          }));
          orderList[item.transCode].push(item);
        });
        Promise.all(promises).then(data => {
          // 对合计的bom进行去重合并
          this.mergeBomList();
        })
        this.numMap = {};
        this.matterList = sels;
        this.orderList = orderList;
      },
      // 选择默认图片
      getDefaultImg (item) {
        let url = require('assets/wl_default03.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // 匹配相同项的索引
      findIndex (arr, sItem) {
        return arr.findIndex(item => {
          return item.orderCode === sItem.orderCode && item.transCode === sItem.transCode && item.inventoryCode === sItem.inventoryCode
        });
      },
      // 选择要删除的物料
      delClick (index, sItem, key) {
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
      showSelIcon (sItem) {
        return this.findIndex(this.selItems, sItem) !== -1;
      },
      // 全选
      checkAll () {
        if (this.selItems.length === this.matterList.length) {
          this.selItems = [];
          return
        }
        this.selItems = JSON.parse(JSON.stringify(this.matterList));
      },
      //删除选中的
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
            //删除orderList
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
            // 删除bom
            this.selItems.forEach(item=> {
              item.boms.forEach(BItem=> {
                this.UniqueBom.forEach((Aitem, index) => {
                  if (BItem.inventoryCode === AItem.inventoryCode) {
                    let tdQty = accSub(AItem.tdQty,BItem.tdQty)
                    AItem.tdQty = toFixed(tdQty);
                    if (AItem.tdQty<=0) {
                      this.UniqueBom.splice(index,1)
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
      addOrder () {
        for (let items of Object.values(this.orderList)) {
          for (let item of items) {
            // 存储已输入的价格
            this.numMap[`${item.transCode}_${item.orderCode}_${item.inventoryCode}`] = {...item};
          }
        }
        this.showOrderPop = !this.showOrderPop;
      },
      // 提价订单
      submitOrder () {
        let warn = '';
        let dataSet = [];
        if (!warn && !Object.keys(this.orderList).length) {
          warn = '请选择物料'
        }
        // 检验，组装dataSet
        for (let items of Object.values(this.orderList)) {
          for (let item of items) {
            if (!item.tdQty){
              warn = '请填写减少数量'
              break
            }
            let boms = [];
            for (let bom of item.boms) {
              let obj = {
                tdId: bom.tdId || null,
                transMatchedCode: item.transCode,
                tdQty: bom.tdQty, // 领料需求
                orderCode: item.orderCode,
                bomSpecificLoss: bom.specificLoss || bom.bomSpecificLoss,
                tdProcessing: bom.processing || bom.tdProcessing,
                inventoryName: bom.inventoryName,
                transObjCode: bom.inventoryCode || bom.transObjCode,
                measureUnit: bom.measureUnit,
                bomType: bom.bomType,
                bomQty: bom.qty || bom.bomQty,
                specification: bom.specification,
                parentId: bom.parentId  || null
              }
              if (this.transCode) {
                delete obj.orderCode;
              }
              boms.push(obj);
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
          this.attachment = attachment;
          let orderList = {};
          // 获取合计
          let {order} = formData;
          let {dataSet = []} = order;
          for (let item of dataSet) {
            // bom合计
            item.boms.forEach(item => {
              item.inventoryCode = item.transObjCode;
              item.specificLoss = item.bomSpecificLoss
            });
            if (item.boms) {
              this.DuplicateBoms = this.DuplicateBoms.concat(JSON.parse(JSON.stringify(item.boms)));
            }
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
      mergeBomList () {
        // 对合计的bom进行去重合并
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
      hasDraftData () {
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
      // 获取关联数据
      getRelationData () {

      },
    },
    created () {
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
    .check_bom {
      text-align: center;
      font-size: 0.14rem;
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
      color: #111;
      font-size: .14rem;
      font-weight: bold;
      .symbol {
        color: #757575;
      }
    }
  }
  .bom_pop{
    .number-part {
      display: flex;
      font-size: .1rem;
      text-align: right;
      flex-direction: column;
      .main-number {
        font-size: .12rem;
        font-weight: bold;
        //  color: #757575;
      }
      .number-unit {
        color: #757575;
      }
    }
  }
</style>
