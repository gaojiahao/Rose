<template>
  <div class="pages xmjh-apply-container">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list :defaultValue="dealerInfo" :default-contact="contactInfo"
                         @sel-dealer="selDealer" @sel-contact="selContact"></pop-dealer-list>
        <!-- 物料列表 -->
        <div class="materiel_list">
          <!-- 没有选择物料 -->
          <template v-if="!Object.keys(orderList).length">
            <div @click="getMatter" class='no-matter'>
              <div class="title">{{orderListTitle}}列表</div>
              <div class="required">请选择{{orderListTitle}}</div>
              <span class="iconfont icon-youjiantou r_arrow"></span>
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
                  <matter-item :item="item" @on-modify="modifyMatter(item, index, key)" :show-delete="matterModifyClass"
                               @click.native="delClick(index, item, key)" :config="matterEditConfig.property">
                    <template slot-scope="{item}" slot="info">
                      <!-- 物料属性和单位 -->
                      <!-- <div class='matter-more'>
                        <span class='unit'>属性: {{item.processing}}</span>
                        <span class='unit'>单位: {{item.measureUnit}}</span>
                        <span class='unit'>辅助计量: {{item.assMeasureUnit}}</span>
                        <span class='mater_color' v-if="item.taxRate">税率: {{item.taxRate}}</span>
                      </div>
                      <div class="mater_more">
                        <span class='unit'>辅助计量说明: {{item.assMeasureDescription}}</span>
                        <span>待开票数量: {{item.qtyBal}}</span>
                      </div> -->
                      <!-- 物料数量和价格 -->
                      <div class='mater_other' v-if="item.price && item.tdQty">
                        <div class='mater_price'>
                          <span class="symbol">￥</span>{{item.price}}
                        </div>
                        <div>
                          <r-number :num="item.tdQty" :max="item.qtyBal"
                                    :checkAmt='checkAmt' v-model="item.tdQty"></r-number>
                        </div>
                      </div>
                    </template>
                    <template slot="editPart" slot-scope="{item}">
                      <div class="edit-part vux-1px-l" @click="modifyMatter(item, index, key)"
                           v-show="(item.price && item.tdQty) &&!matterModifyClass">
                        <span class='iconfont icon-bianji1'></span>
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
          <div class="handle_part" v-if="matterList.length && !matterModifyClass">
            <span class="add_more stop" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'
                  @click="stopOrder">终止提交</span>
            <span class="symbol" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>或</span>
            <span class="add_more" v-if="matterList.length" @click="addMatter">新增更多物料</span>
          </div>
          <!-- 物料popup -->
          <pop-matter-list :show="showMaterielPop" v-model="showMaterielPop" :params="matterParams" :config="matterPopConfig" 
                           :requestApi="requestApi" :orderTitle="matterPopOrderTitle"
                           @sel-matter="selMatter" :filter-list="filterList" :default-value="matterList" ref="matter">
            <!-- 抬头 插槽 -->
            <!-- <template slot="titleName" slot-scope="props">
              <span class="order-title">出库单</span>
            </template> -->
            <!-- 基本属性 插槽 -->
            <!-- <template slot="attribute" slot-scope="{item}">
              <div class="mater_classify">
                <span class="type">单位: {{item.measureUnit}}</span>
                <span class="type">辅助计量: {{item.invSubUnitName}}</span>
                <span class="type">辅助计量说明: {{item.invSubUnitComment}}</span>
              </div>
            </template> -->
            <!-- 余额、单价等 插槽 -->
            <!-- <template slot="storage" slot-scope="{item}">
              <div class="mater_material">
                <span>待开票数量: {{item.qtyBal}}</span>
                <span>主计倍数: {{item.invSubUnitMulti}}</span>
              </div>
              <div>
                单价: ￥{{item.price | numberComma}}
              </div>
            </template> -->
          </pop-matter-list>
        </div>
        <!--物料编辑pop-->
        <pop-matter :modify-matter='matter' :show-pop="showMatterPop" @sel-confirm='selConfirm'
                    v-model='showMatterPop' :btn-is-hide="btnIsHide" :show-date-time="true" :config="matterEditConfig">
        </pop-matter>
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>
    <!-- 底部提交确认栏 -->
    <div class="count_mode vux-1px-t" :class="{btn_hide : btnIsHide}" v-if="!matterModifyClass">
      <span class="count_num"
            :class="{nine_up : tdAmount.length  > 8 ,
          ten_up : tdAmount.length  > 9,
          ele_up : tdAmount.length  > 10}"
      >
        <span class="total_price">
          <span class="symbol">￥</span>{{tdAmount | numberComma(3)}}
        </span>
        <span class="taxAmount">[含税: ￥{{taxAmount | numberComma(3)}}]</span>
      </span>
      <span class="count_btn" @click="submitOrder">提交</span>
    </div>
    <!-- 底部删除确认栏 -->
    <div class="count_mode vux-1px-t delete_mode" :class="{btn_hide : btnIsHide}" v-else>
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
    Cell, Group, XInput, dateFormat,
    XTextarea, Datetime, PopupPicker
  } from 'vux'
  // 请求 引入
  import {submitAndCalc, saveAndStartWf, saveAndCommitTask} from 'service/commonService'
  import {getSOList} from 'service/detailService'
  // mixins 引入
  import ApplyCommon from 'pageMixins/applyCommon'
  // 组件引入
  import RNumber from 'components/RNumber'
  import PopDealerList from 'components/Popup/PopDealerList'
  import PopInvoiceList from 'components/Popup/invoice/PopInvoiceList'
  import PopMatterList from 'components/Popup/PopMatterListTest'
  import RPicker from 'components/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import PopMatter from 'components/apply/commonPart/MatterPop'
  // 方法引入
  import {accAdd, accMul, accDiv, accSub} from '@/home/pages/maps/decimalsAdd'
  import { toFixed } from '@/plugins/calc'

  const DRAFT_KEY = 'KPSQ_DATA';
  export default {
    mixins: [ApplyCommon],
    components: {
      Cell, Group, XInput, PopMatterList, PopMatter, RNumber,
      Datetime, XTextarea, PopDealerList, PopupPicker, PopInvoiceList, RPicker, PopBaseinfo
    },
    data() {
      return {
        taxRate: 0.16,
        modifyKey: null,
        showMatterPop: false,
        showMaterielPop: false,
        filterList: [
          {
            name: '物料名称',
            value: 'inventoryName',
          }, {
            name: '物料编码',
            value: 'inventoryCode',
          }, {
            name: '出库单',
            value: 'transCode',
          }
        ],
        listId: 'ebd2225c-9354-4df9-bded-8631e3cac4ac',
        numMap: {},
        orderList: {},
        matterList: [],
        dealerInfo: {}, //客户信息
        contactInfo: {}, // 联系人信息
        matterParams: {
          dealerCode: ''
        },
        formData: {
          biProcessStatus: '',
          biComment: ''
        },
      }
    },
    methods: {
      // 选中的客户
      selDealer(val) {
        this.dealerInfo = JSON.parse(val)[0];
        this.matterParams.dealerCode = this.dealerInfo.dealerCode;
      },
      // TODO 选中联系人
      selContact(item) {
        this.contactInfo = {...item,}
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
      // 选择物料，显示物料pop
      getMatter() {
        if (!this.dealerInfo.dealerCode) {
          this.$vux.alert.show({
            content: '请选择客户'
          })
          return
        }
        this.showMaterielPop = !this.showMaterielPop;
      },
      // TODO 选中物料项
      selMatter(val) {
        let sels = JSON.parse(val);
        let orderList = {};
        sels.forEach(item => {
          let key = `${item.transCode}_${item.inventoryCode}`;
          let {
            tdQty = item.qtyBal,
            price = item.price,
            taxRate = this.taxRate,
            promDeliTime = '',
          } = this.numMap[key] || {};
          item.tdQty = tdQty;
          item.assMeasureUnit = item.assMeasureUnit || item.invSubUnitName || null; // 辅助计量
          item.assMeasureScale = item.assMeasureScale || item.invSubUnitMulti || null; // 与单位倍数
          item.assMeasureDescription =  item.assMeasureDescription || item.invSubUnitComment || null; // 辅助计量说明
          item.price = price;
          item.taxRate = taxRate;
          item.promDeliTime = promDeliTime;
          item.dateActivation = dateFormat(item.dateActivation, 'YYYY-MM-DD');
          item.executionDate = dateFormat(item.executionDate, 'YYYY-MM-DD');
          if (!orderList[item.transCode]) {
            orderList[item.transCode] = [];
          }
          orderList[item.transCode].push(item);
        });
        this.numMap = {};
        this.matterList = sels;
        this.orderList = orderList;
      },
      //选择默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default03.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // 滑动删除
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
                if (OItem.inventoryCode === SItem.inventoryCode && OItem.transCode === SItem.transCode) {
                  let delArr = this.orderList[OItem.transCode];
                  let delIndex = delArr.findIndex(item => item.inventoryCode === OItem.inventoryCode);
                  if (delIndex >= 0) {
                    this.$refs.matter.delSelItem(delArr[delIndex]);
                    delArr.splice(delIndex, 1);
                  }
                  if (!delArr.length) {
                    delete this.orderList[OItem.transCode];
                  }
                }
              });
              this.matterList.forEach((item, index) => {
                if (item.inventoryCode === SItem.inventoryCode) {
                  this.matterList.splice(index, 1);
                  index--;
                }
              })
            });
            this.selItems = [];
            this.matterModifyClass = false;
          }
        })
      },
      // TODO 新增更多物料
      addMatter() {
        for (let items of Object.values(this.orderList)) {
          for (let item of items) {
            // 存储已输入的价格
            this.numMap[`${item.transCode}_${item.inventoryCode}`] = {...item};
          }
        }
        this.showMaterielPop = !this.showMaterielPop;
      },
      // TODO 提交
      submitOrder() {
        let warn = '';
        let dataSet = [];
        if (!this.dealerInfo.dealerCode) {
          warn = '请选择客户信息';
        }
        else if (!Object.keys(this.orderList).length) {
          this.$vux.alert.show({
            content: '请选择物料'
          })
        }
        else {
           let warn = '',
            dataSet = [];
          for (let items of Object.values(this.orderList)) {
            for (let item of items) {
              if (!item.tdQty) {
                warn = '请填写数量';
                break
              }
              if (!item.price) {
                warn = '请填写单价';
                break
              }
              let taxRate = item.taxRate || this.taxRate;
              let taxAmount = toFixed(accMul(item.assistQty, taxRate, item.noTaxPrice));
              let obj = {
                tdId: item.tdId || '',
                transMatchedCode: item.transCode,
                inventoryName_transObjCode: item.inventoryName, // 物料名称
                transObjCode: item.inventoryCode, // 物料编码
                measureUnit_transObjCode: item.measureUnit,
                tdProcessing: item.processing, // 加工属性
                assMeasureUnit: item.assMeasureUnit || null, // 辅助计量
                assMeasureDescription: item.assMeasureDescription || null,
                assMeasureScale: item.assMeasureScale || null, // 与单位倍数
                thenQtyBal: item.qtyBal,
                tdQty: item.tdQty, // 数量
                assistQty: item.assistQty || 0, // 辅计数量
                price: item.price, // 单价
                tdAmount: item.tdAmount, // 价税小计
                taxRate: taxRate, // 税金
                noTaxPrice: item.noTaxPrice,
                taxAmount: taxAmount, // 税金
                comment: item.comment || '', // 说明
              }
              dataSet.push(obj);
            }
          }
          if (warn) {
            this.$vux.alert.show({
              content: warn
            })
            return
          }
          this.$vux.confirm.show({
            content: '确认提交?',
            // 确定回调
            onConfirm: () => {
              this.$HandleLoad.show();
              let operation = saveAndStartWf;
              let wfPara = {
                [this.processCode]: {businessKey: this.businessKey, createdBy: JSON.stringify(this.formData.handler)}
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
                biComment: '',
                formData: JSON.stringify({
                  ...this.formData,
                  handlerEntity: this.entity.dealerName,
                  creator: this.formData.handler,
                  modifer: this.formData.handler,
                  order: {
                    crDealerLabel: '客户',
                    dealerCodeCredit: this.dealerInfo.dealerCode,
                    dataSet: dataSet,
                  },
                  dealerCreditContactPersonName: this.contactInfo.dealerName || null,
                  dealerCreditContactInformation: this.contactInfo.dealerMobilePhone || '',
                }),
                wfPara: JSON.stringify(wfPara)
              };
              // 重新提交
              if (this.isResubmit) {
                submitData.biReferenceId = this.biReferenceId;
                operation = saveAndCommitTask
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
              this.saveData(operation, submitData);
            }
          });
        }

      },
      // 获取订单信息用于重新提交
      getFormData() {
        return getSOList({
          formViewUniqueId: this.uniqueId,
          transCode: this.transCode
        }).then((data) => {
          this.listId = data.listId;
          this.biComment = data.biComment;
          this.biReferenceId = data.biReferenceId;
          this.attachment = data.attachment;
          let orderList = {};
          let {formData} = data;
          let { order = {} } = formData;
          order.dataSet.map(item => {
            item = {
              ...item,
              inventoryPic: item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
              inventoryName: item.inventoryName_transObjCode,
              inventoryCode: item.inventoryCode_transObjCode,
              specification: item.specification_transObjCode,
              processing: item.tdProcessing || '商品',
              measureUnit: item.measureUnit_transObjCode,
              clientInventoryName: item.dealerInventoryName,
              clientInventoryCode: item.dealerInventoryCode,
              qty: item.thenTotalQtyBal,
              stockQty: item.thenLockQty,
              qtyBal: item.thenQtyBal,
              transCode: item.transMatchedCode,
              invSubUnitMulti: item.assMeasureScale,
            };
            this.matterList.push(item);
            if (!orderList[item.transCode]) {
              orderList[item.transCode] = [];
            }
            orderList[item.transCode].push(item);
          });
          this.handlerDefault = {
            handler: formData.handler,
            handlerName: formData.handlerName,
            handlerUnit: formData.handlerUnit,
            handlerUnitName: formData.handlerUnitName,
            handlerRole: formData.handlerRole,
            handlerRoleName: formData.handlerRoleName,
          };
          this.orderList = orderList;
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
          // 客户信息展示
          this.dealerInfo = {
            creatorName: formData.dealerCreditContactPersonName, // 客户名
            dealerName: order.dealerName_dealerCodeCredit, // 公司名
            dealerMobilePhone: formData.dealerCreditContactInformation, // 手机
            dealerContactPersonName: formData.dealerCreditContactPersonName, // 联系人
            dealerCode: order.dealerCodeCredit, // 客户编码
            dealerLabelName: order.crDealerLabel, // 关系标签
            province: order.province_dealerCodeCredit, // 省份
            city: order.city_dealerCodeCredit, // 城市
            county: order.county_dealerCodeCredit, // 地区
            address: order.address_dealerCodeCredit, // 详细地址
          };
          // 订单信息
          this.contactInfo = {
            dealerName: formData.dealerCreditContactPersonName, //联系人
            dealerMobilePhone: formData.dealerCreditContactInformation,//电话
          };
          // 物料列表请求参数
          this.matterParams = {
            dealerCode: this.dealerInfo.dealerCode,
          };
          this.$loading.hide();
        })
      },
      // TODO 保存草稿数据
      hasDraftData() {
        // 是否选择客户
        if (!Object.values(this.dealerInfo).length) {
          return false
        }
        return {
          [DRAFT_KEY]: {
            handlerDefault: this.handlerDefault,
            dealer: this.dealerInfo,
            list: this.orderList,
            contactInfo: this.contactInfo,
          }
        };
      },
    },
    created() {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        let draft = JSON.parse(data);
        this.handlerDefault = draft.handlerDefault;
        this.dealerInfo = draft.dealer;
        this.orderList = draft.list;
        for (let items of Object.values(this.orderList)) {
          for (let item of items) {
            this.matterList.push(item)
          }
        }
        this.contactInfo = draft.contactInfo;
        this.matterParams.dealerCode = this.dealerInfo.dealerCode;
        sessionStorage.removeItem(DRAFT_KEY);
      }
    },
  }
</script>

<style lang="scss" scoped>
  @import './../../scss/bizApply';
  .mater_more {
    color: #757575;
    font-size: 0.1rem;
    margin-top: .02rem;
    word-break: break-all;
    span {
      margin-right: .04rem;
      .mater_color {
        margin-right: 0;
      }
    }
  }
  .xmjh-apply-container {
    /deep/ .weui-cells {
      margin-top: 0;
      font-size: .16rem;
      &:before {
        border-top: none;
      }
      &:after {
        border-bottom: none;
      }
      .weui-cell {
        padding: 10px 0;
        &:before {
          left: 0;
        }
      }
    }
  }

  .vux-cell-box:not(:first-child):before {
    left: 0;
  }

  .XMJH_add {
    text-align: center;
    font-size: 0.12rem;
    padding: 0.1rem 0;
    color: #757575;
    span {
      color: #fff;
      padding: .01rem .04rem;
      border-radius: .12rem;
      &:nth-child(1) {
        background: #5077aa;
      }
      &:nth-child(3) {
        background: #fc3c3c;
      }
    }
    em {
      font-style: normal;
    }
  }
</style>
