<template>
  <div class="pages wlxqtj-apply-container">
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
              <div class="title">{{orderListTitle}}列表</div>
              <div class="required">请选择{{orderListTitle}}</div>
              <i class="iconfont icon-youjiantou r_arrow"></i>
            </div>
          </template>
          <!-- 已经选择了物料 -->
          <template v-else>
            <div class="title" @click="showDelete">
              <div>{{orderListTitle}}列表</div>
              <div class='edit' v-if='!matterModifyClass'>编辑</div>
              <div class='finished' v-else>完成</div>
            </div>
            <div class="mater_list">
              <div class="each_mater" :class="{'vux-1px-b' : index < (Object.keys(orderList).length-1)}"
                v-for="(oItem, key, index) in orderList" :key="key">
                <div class="order_code" v-if='oItem.length'>
                  <span class="order_title">{{orderListTitle}}</span>
                  <span class="order_num">{{key}}</span>
                </div>
                <div :class="{mater_delete : matterModifyClass}" v-for="(item, index) in oItem" :key="index">
                  <matter-item :item="item" @on-modify="modifyMatter(item,index, key)" :show-delete="matterModifyClass"
                               @click.native="delClick(index,item, key)" :config="matterEditConfig.property">
                    <template slot-scope="{item}" slot="info">
                      <div class="mater_other" v-show="item.tdQty">
                        <span class="matter-remain">
                          减少数量: {{item.tdQty}}
                        </span>
                      </div>
                    </template>
                    <template slot="edit" slot-scope="{item}">
                      <div class="mater_other" @click="modifyMatter(item,index, key)" v-show="!item.tdQty && !matterModifyClass">
                        <span class="edit-tips">
                          点击进行填写
                        </span>
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
          <pop-matter-list :show="showOrderPop" v-model="showOrderPop" @sel-matter="selOrder" :default-value="matterList" 
                           :config="matterPopConfig" :matter-params="matterParams"
                           :order-title="matterPopOrderTitle" ref="matter" >
          </pop-matter-list>
          <!-- <pop-order-xqtj-list :show="showOrderPop" v-model="showOrderPop" @sel-matter="selOrder"
                               :default-value="orderList" ref="order">
            <template slot="qtyStock" slot-scope="{item}">
              <div>
                <span>保质期天数: {{item.keepingDays || 0}}</span>
                <span>临保天数: {{item.nearKeepingDays || 0}}</span>
                <span>安全库存: {{item.safeStock || 0}}</span>
              </div>
              <div>
                <div class="mater-balance">余额: {{item.qtyBal}}</div>
              </div>
            </template>
          </pop-order-xqtj-list> -->
        </div>
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
        <!--物料编辑pop-->
        <pop-matter :modify-matter='matter' :show-pop="showMatterPop" @sel-confirm='selConfirm' 
                    v-model='showMatterPop' :btn-is-hide="btnIsHide" :config="matterEditConfig">
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
  // vux组件引入
  import {
    Icon, Cell, Group, XInput,XTextarea
  } from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  import {saveAndStartWf, saveAndCommitTask, submitAndCalc} from 'service/commonService'
  // mixins 引入
  import applyCommon from 'components/mixins/applyCommon'
  // 组件引入
  import RPicker from 'components/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import PopMatter from 'components/apply/commonPart/MatterPop'
  import PopOrderXqtjList from 'components/Popup/PopOrderXQTJList'
  import PopMatterList from 'components/Popup/PopMatterListTest'
  const DRAFT_KEY = 'XQTJ_DATA';

  export default {
    name: 'ApplyWLXQTJForm',
    mixins: [applyCommon],
    components: {
      Icon, Cell, Group,XTextarea,
      XInput, PopMatter, PopOrderXqtjList,RPicker, PopBaseinfo, PopMatterList
    },
    data() {
      return {
        orderList: {},                                  // 订单列表
        showOrderPop: false,                         // 是否显示物料的popup
        formData: {
          biComment: '' //备注
        },
        submitSuccess: false, // 是否提交成功
        warehouse: null, // 选中仓库属性
        taxRate: 0.16, // 税率
        numMap: {}, // 用于记录订单物料的数量和价格
        orderParams: { // 订单列表查询参数
          dealerCode: '',
          whCode: '',
        },
        transCode: '',
        formViewUniqueId: '346ede09-ac6a-489a-9242-f385932a4443', // 修改时的UniqueId
        biReferenceId: '',
        actions: [],
        taskId: '',
        matterList: [], // 物料列表，用于计算金额、请求单价
        project: {}, // 项目
        entity: {}, // 经办主体
        tmpItems: {},//选中的订单
        matter: {},
        showMatterPop: false,
        modifyIndex: null,
        modifyKey: null,
        checkFieldList: [
          {
            key: 'tdQty',
            message: '请填写减少数量'
          },
        ]
      }
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
          let key = `${item.transCode}_${item.colId}_${item.inventoryCode}`;
          let {tdQty = ''} = this.numMap[key] || {};
          item.tdQty = tdQty;
          if (!orderList[item.transCode]) {
            orderList[item.transCode] = [];
          }
          orderList[item.transCode].push(item);
        });
        this.numMap = {};
        this.matterList = sels;
        this.orderList = orderList;
      },
      // TODO 选择默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default03.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // TODO 匹配相同项的索引
      findIndex(arr, sItem) {
        return arr.findIndex(item => {
          let isSameColId = true;
          if (item.colId) {
            isSameColId = item.colId === sItem.colId;
          }
          return isSameColId && item.transCode === sItem.transCode && item.inventoryCode === sItem.inventoryCode
        });
      },
      // TODO 滑动删除
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
      // TODO 判断是否展示选中图标
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
                let isSameColId = true;
                if (SItem.colId) {
                  isSameColId = OItem.colId === SItem.colId;
                }
                if (isSameColId && SItem.inventoryCode === SItem.inventoryCode && OItem.transCode === SItem.transCode) {
                  let delArr = this.orderList[OItem.transCode];
                  let delIndex = this.findIndex(delArr, OItem);
                  if (delIndex >= 0) {
                    this.$refs.matter.delSelItem(delArr[delIndex]);
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
            this.numMap[`${item.transCode}_${item.colId}_${item.inventoryCode}`] = {
              tdQty: item.tdQty,
            };
          }
        }
        this.showOrderPop = !this.showOrderPop;
      },
      // TODO 提价订单
      submitOrder() {
        let warn = '';
        let dataSet = [];
        if (!warn && !Object.keys(this.orderList).length) {
          warn = '请选择物料'
        }
        // 组装dataSet
        for (let items of Object.values(this.orderList)) {
          for (let item of items) {
            if(!item.tdQty){
              warn = '请填写减少数量'
              break;
            }
            let oItem = {
              transMatchedCode: item.transCode, // 交易号
              outPutMatCode: item.inventoryCode, // 输出物料
              inventoryType_outPutMatCode: item.inventoryType,
              thenQtyBal: item.qtyBal, // 余额
              tdQty: item.tdQty, // 减少数量
              subjectCode: item.calcRelCode,
              comment: item.comment || '', // 说明
            };
            if (this.transCode) {
              oItem.tdId = item.tdId || '';
            }
            dataSet.push(oItem)
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
          let {outPut} = formData;
          let {dataSet = []} = outPut;
          for (let item of dataSet) {
            item = {
              ...item,
              transCode: item.transMatchedCode,
              qtyBal: item.thenQtyBal,
              inventoryPic: item.inventoryPic_outPutMatCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_outPutMatCode}&width=400&height=400` : this.getDefaultImg(),
              inventoryName: item.inventoryName_outPutMatCode,
              inventoryCode: item.outPutMatCode,
              inventoryType: item.inventoryType_outPutMatCode,
              specification: item.specification_outPutMatCode,
              measureUnit: item.measureUnit_outPutMatCode,
              processing: item.tdProcessing,
              calcRelCode: item.subjectCode,
              inventoryTypen: item.inventoryType_outPutMatCode,
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
          this.biReferenceId = formData.biReferenceId;
          this.orderList = orderList;
          this.$loading.hide();
        })
      },
      // TODO 是否保存草稿
      hasDraftData() {
        if (!Object.values(this.orderList).length) {
          return false
        }
        return {
          [DRAFT_KEY]: {
            orderList : this.orderList,
            formData : this.formData
          }
        };
      },
    },
    created() {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if(data){
        this.orderList = JSON.parse(data).orderList;
        this.formData = JSON.parse(data).formData;
        sessionStorage.removeItem(DRAFT_KEY);
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizApply';

  .wlxqtj-apply-container {
    .basicPart {
      height: 90%;
    }
    .mater_list .each_mater_wrapper {
      flex-direction: column;
    }

    .mater_list .each_mater_wrapper .mater_main {
      padding-right: .38rem;
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
</style>
