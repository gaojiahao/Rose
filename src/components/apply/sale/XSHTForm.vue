<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list @sel-dealer="selDealer" @sel-contact="selContact" :defaultValue="dealerInfo"
                         :defaultContact="contact"></pop-dealer-list>
        <!-- 结算方式 -->
        <pop-single-select title="结算方式" :data="transMode" :value="dealerInfo.paymentTerm"
                           v-model="dealerInfo.paymentTerm"></pop-single-select>
        <!-- 物流条款 -->
        <pop-single-select title="物流条款" :data="logisticsTerm" :value="dealerInfo.dealerLogisticsTerms"
                           v-model="dealerInfo.dealerLogisticsTerms"></pop-single-select>
        <!-- 有效期至 -->
        <div class="mg_auto no_top">
          <div class="cell-item">
            <div class="title">账期天数</div>
            <div class="mode">
              <span class="mode_content">{{dealerInfo.pamentDays || "无"}}</span>
            </div>
          </div>
        </div>
        <div class="mg_auto no_top">
          <div class="cell-item">
            <div class="title required">合同总金额</div>
            <div class="mode">
              <span class="mode_content">￥{{thenTotalAmntBal | numberComma}}</span>
            </div>
          </div>
          <div class="cell-item" @click="dateSelect('validUntil')">
            <div class="title required">合同到期日</div>
            <div class="mode">
              <span class="mode_content">{{dealerInfo.validUntil || '请选择'}}</span>
              <span class="iconfont icon-shenglve"></span>
            </div>
          </div>
          <x-input title="预收款" class="cell-item" type="number" text-align='right' placeholder='请填写'
                   v-model.number='dealerInfo.tdAmountCopy1' v-show="hasAdvance" @on-blur="checkAmt(dealerInfo)">
          </x-input>
          <div class="cell-item" @click="dateSelect('advancePaymentDueDate')" v-show="hasAdvance">
            <div class="title">预收到期日</div>
            <div class="mode">
              <span class="mode_content">{{dealerInfo.advancePaymentDueDate || '请选择'}}</span>
              <span class="iconfont icon-shenglve"></span>
            </div>
          </div>        
        </div>
        <!-- 物料列表 -->
        <div class="materiel_list">
          <!-- 没有选择物料 -->
          <template v-if="!matterList.length">
            <div @click="showMaterielPop = !showMaterielPop" class='no-matter'>
              <div class="title">物料列表</div>
              <div class="required">请选择物料</div>
              <span class="iconfont icon-youjiantou r_arrow"></span>
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
              <div class="each_mater"
                   :class="{mater_delete : matterModifyClass,'vux-1px-b' : index < matterList.length-1}"
                   v-for="(item, index) in matterList" :key='index'>
                <matter-item :item="item" @on-modify="modifyMatter(item,index)" :show-delete="matterModifyClass"
                             @click.native="delClick(item,index)">
                  <template slot="info" slot-scope="{item}">
                    <!-- 物料属性和单位 -->
                    <div class="mater_more">
                      <span class="processing">属性: {{item.processing}}</span>
                      <span class='unit'>单位: {{item.measureUnit}}</span>
                      <span class='unit'>辅助计量: {{item.assMeasureUnit}}</span>
                      <span class='unit'>辅助计量说明: {{item.assMeasureDescription}}</span>
                    </div>
                    <div class="mater_more">
                      <span class="processing" v-show="item.dateActivation">交付开始日: {{item.dateActivation}}</span>
                      <span class='unit' v-show="item.executionDate">交付截止日: {{item.executionDate}}</span>
                    </div>
                    <!-- 物料数量和价格 -->
                    <div class='mater_other' v-if="item.price && item.tdQty">
                      <div class='mater_price'>
                        <span class="symbol">￥</span>{{item.price}}
                      </div>
                      <div>
                        <r-number :num="item.tdQty" :checkAmt='checkAmt' v-model="item.tdQty"></r-number>
                      </div>
                    </div>
                  </template>
                  <template slot="editPart" slot-scope="{item}">
                    <div class="edit-part vux-1px-l" @click="modifyMatter(item,index)"
                         v-show="(item.price && item.tdQty) &&!matterModifyClass">
                      <span class='iconfont icon-bianji1'></span>
                    </div>
                  </template>
                </matter-item>
                <div class='delete_icon' @click="delClick(item,index)" v-if='matterModifyClass'>
                  <x-icon type="ios-checkmark" size="20" class="checked" v-show="showSelIcon(item)"></x-icon>
                  <x-icon type="ios-circle-outline" size="20" v-show="!showSelIcon(item)"></x-icon>
                </div>
              </div>
            </div>
          </template>

          <!-- 新增更多 按钮 -->
          <div class="handle_part" v-if="matterList.length && !matterModifyClass">
            <span class="add_more stop" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'
                  @click="stopOrder">终止提交</span>
            <span class="symbol" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>或</span>
            <span class="add_more" v-if="matterList.length" @click="showMaterielPop = !showMaterielPop">新增更多物料</span>
          </div>
          <!-- 物料popup -->
          <pop-matter-list :show="showMaterielPop" v-model="showMaterielPop" @sel-matter="selMatter"
                           :default-value="matterList" get-list-method="getSalesContract" :params="matterParams"
                           ref="matter"></pop-matter-list>
        </div>
        <!--物料编辑pop-->
        <pop-matter :modify-matter='matter' :validate-map="validateMap" :show-pop="showMatterPop" @sel-confirm='selConfirm'
                    v-model='showMatterPop' :btn-is-hide="btnIsHide" :show-date-time="true">
          <template slot="date" slot-scope="{modifyMatter}">
            <datetime v-model="modifyMatter.dateActivation"
                      :end-date="modifyMatter.executionDate || dealerInfo.validUntil" placeholder="请选择">
              <template slot="title">
                <span class="required">交付开始日</span>
              </template>
            </datetime>
            <datetime v-model="modifyMatter.executionDate" :start-date="modifyMatter.dateActivation"
                      :end-date="dealerInfo.validUntil" placeholder="请选择">
              <template slot="title">
                <span class="required">交付截止日</span>
              </template>
            </datetime>
          </template>
        </pop-matter>
        <!--备注-->
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
          ele_up : tdAmount.length  > 10}">
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
import {Popup, Group, Cell, numberComma, Datetime, XInput, XTextarea} from 'vux'
// 请求 引入
import {getSOList} from 'service/detailService'
import {getBaseInfoData, saveAndStartWf, saveAndCommitTask, getDictByType, submitAndCalc} from 'service/commonService'
// mixins 引入
import common from 'components/mixins/applyCommon'
// 组件引入
import RNumber from 'components/RNumber'
import PopMatterList from 'components/Popup/PopMatterList'
import PopDealerList from 'components/Popup/PopDealerList'
import PopSingleSelect from 'components/Popup/PopSingleSelect'
import PopMatter from 'components/apply/commonPart/MatterPop'
import RPicker from 'components/RPicker'
import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
// 方法引入
import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd'
import {toFixed} from '@/plugins/calc'
const DRAFT_KEY = 'XSHT_DATA';
export default {
  data() {
    return {
      listId: '525bee48-d2d4-11e8-b8ca-0279b2c6a380',
      showMatterPop: false,
      showMaterielPop: false, // 是否显示物料的popup
        // matterPop组件 必填项
      validateMap: [
        {
          key: 'tdQty',
          message: '请填写数量'
        },
        {
          key: 'price',
          message: '请填写含税单价'
        },
        {
          key: 'dateActivation',
          message: '请选择交付开始日'
        },
        {
          key: 'executionDate',
          message: '请选择交付截止日'
        }          
      ],
      transMode: [], // 结算方式 数组
      matterList: [], // 物料列表
      logisticsTerm: [], // 物流条款 数组
      numMap: {}, // 用于记录订单物料的数量和价格
      contact: {},
      formData: {},
      dealerInfo: {
        validUntil: '',
        advancePaymentDueDate: '',
      },
      matterParams: { // 请求物料的参数
        processing: '成品,商品,服务',
      }, 
    }
  },
  computed: {
    // 合同总金额
    thenTotalAmntBal() {
      let total = 0;
      this.matterList.forEach(item => {
        let {assistQty, price} = item;
        let tdAmount = accMul(assistQty, price);
        total = accAdd(total, tdAmount);
      });
      return toFixed(total);
    },
    // 是否含预收
    hasAdvance() {
      let { paymentTerm } = this.dealerInfo;
      return paymentTerm && paymentTerm.includes('预收');
    }
  },
  components: {
    XInput, XTextarea, Group, Cell, Popup,
    PopMatter, RNumber, PopMatterList, PopDealerList,
    PopSingleSelect, Datetime, RPicker, PopBaseinfo
  },
  mixins: [common],
  filters: {
    numberComma,
  },
  methods: {
    // 选中的客户
    selDealer(val) {
      let sel = JSON.parse(val)[0];
      this.dealerInfo = {
        ...this.dealerInfo,
        ...sel,
      };
      this.matterParams = {
        ...this.matterParams,
        drDealerCode: this.dealerInfo.dealerCode,
      };
      this.matterList = [];
    },
    selContact(val) {
      this.contact = {...val};
    },
    // 获取 结算方式
    getPaymentTerm() {
      return getDictByType('paymentTerm').then(({tableContent}) => {
        this.transMode = tableContent;
      })
    },
    // 获取 物流条款
    getLogisticsTerms() {
      return getDictByType('dealerLogisticsTerms').then(({tableContent}) => {
        this.logisticsTerm = tableContent;
      })
    },
    // TODO 展示时间选择器
    dateSelect(key = '') {
      this.$vux.datetime.show({
        confirmText: '确定',
        cancelText: '取消',
        value: this.dealerInfo[key],
        onConfirm: (value) => {
          this.dealerInfo[key] = value;
        }
      })
    },
    // TODO 选中物料项
    selMatter(val) {
      let sels = JSON.parse(val); 
      sels.map(item => {
        item.tdQty = item.tdQty || '';
        item.price = item.price || '';
        item.taxRate = item.taxRate || 0.16;
        item.dateActivation = item.dateActivation || '';
        item.executionDate = item.executionDate || '';
        item.assMeasureUnit = item.assMeasureUnit || item.invSubUnitName || null; // 辅助计量
        item.assMeasureScale = item.assMeasureScale || item.invSubUnitMulti || null; // 与单位倍数
        item.assMeasureDescription =  item.assMeasureDescription || item.invSubUnitComment || null; // 辅助计量说明
      });
      this.matterList = sels;
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
    delClick(sItem, index) {
      let arr = this.selItems;
      let delIndex = arr.findIndex(item => item.inventoryCode === sItem.inventoryCode);
      //若存在重复的 则清除
      if (delIndex !== -1) {
        arr.splice(delIndex, 1);
        return;
      }
      arr.push(sItem);
    },
    // TODO 判断是否展示选中图标
    showSelIcon(sItem) {
      return this.selItems.findIndex(item => item.inventoryCode === sItem.inventoryCode) !== -1;
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
          this.selItems.forEach(item => {
            let index = this.matterList.findIndex(item2 => item2.inventoryCode === item.inventoryCode);
            if (index >= 0) {
              this.matterList.splice(index, 1);
            }
          })
          this.selItems = [];
          this.matterModifyClass = false;
        }
      })
    },
    checkAmt(item) {
      let {tdQty, tdAmountCopy1} = item;
      if (tdQty) {
        item.tdQty = Math.abs(toFixed(tdQty));
      }
      if (tdAmountCopy1) {
        item.tdAmountCopy1 = Math.abs(toFixed(tdAmountCopy1));
      }
    },
    // 提价订单
    submitOrder() {
      let warn = '',
          dataSet = [];
      // 表单校验字段
      let verifyField = [
        /*
         * key -> 第一层校验字段
         * childKey -> 第二层校验字段 （非必填，如果只有一层，此处可以为空）
        */ 
        {
          key: 'dealerInfo',
          childKey: 'dealerName',
          message: '请选择客户'
        }, 
        {
          key: 'dealerInfo',
          childKey: 'validUntil',
          message: '请选择合同到期日'
        },
        // {
        //   key: 'dealerInfo',
        //   childKey: 'tdAmountCopy1',
        //   message: '请填写预收款'
        // },
        // {
        //   key: 'dealerInfo',
        //   childKey: 'advancePaymentDueDate',
        //   message: '请选择预收到期日'
        // },     
        {
          key: 'matterList',
          childKey: 'length',
          message: '请选择物料'
        }, 
      ]
      if (!warn) {
        // 校验 最外层表单必填项
        verifyField.every( item => {
          if(item.childKey && !this[item.key][item.childKey]) {
            warn = item.message;
            return false;
          }
          else if(!this[item.key]) {
            warn = item.message;
            return false;
          }  
          return true;
        })
        this.matterList.every(item => {
          this.validateMap.every( val => {
            if(!item[val.key]) {
              warn = val.message;
              return false;
            }
            return true;
          })
          let obj = {
            tdId: item.tdId || '',
            inventoryName_transObjCode: item.inventoryName, // 物料名称
            transObjCode: item.inventoryCode, // 物料编码
            tdProcessing: item.processing, // 加工属性
            assMeasureUnit: item.assMeasureUnit,
            assMeasureDescription: item.assMeasureDescription,
            assMeasureScale: item.assMeasureScale,
            tdQty: item.tdQty, // 数量
            assistQty: item.assistQty,
            price: item.price, // 单价
            tdAmount: item.tdAmount,
            taxRate: item.taxRate, // 税金
            noTaxPrice: item.noTaxPrice,
            taxAmount: item.taxAmount, // 税金
            noTaxAmount: item.noTaxAmount,
            dateActivation: item.dateActivation,  // 交付开始日
            executionDate: item.executionDate,  // 交付截止日
            comment: item.comment || '', // 说明
          };
          dataSet.push(obj);
          return true
        });
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
          let operation = saveAndStartWf; // 默认有工作流
          let wfPara = {
            [this.processCode]: {businessKey: this.businessKey, createdBy: ""}
          };
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
          let common = {
            dealerDebit: this.dealerInfo.dealerCode,
            drDealerLabel: this.dealerInfo.dealerLabelName,
            drDealerPaymentTerm: this.dealerInfo.paymentTerm,
            daysOfAccount: this.dealerInfo.pamentDays,
          };
          let submitData = {
            listId: this.listId,
            biComment: this.formData.biComment,
            formData: JSON.stringify({
              ...this.formData,
              handlerEntity: this.entity.dealerName,
              dealerDebitContactPersonName: this.contact.dealerName, // 联系人
              dealerDebitContactInformation: this.contact.dealerMobilePhone, // 联系人电话
              drDealerLogisticsTerms: this.dealerInfo.dealerLogisticsTerms,
              order: {
                ...common,
                dataSet
              },
              inPut: {
                ...common,
                validUntil: this.dealerInfo.validUntil, // 合同到期日
                dataSet: [{
                  thenTotalAmntBal: this.thenTotalAmntBal, // 合同总金额 
                  tdAmountCopy1: this.dealerInfo.tdAmountCopy1, // 预收款
                  advancePaymentDueDate: this.dealerInfo.advancePaymentDueDate, // 预收到期日
                }]
              },
              promDeliTime: '', // 预期交货日
            }),
            wfPara: JSON.stringify(wfPara)
          }
          if (this.isResubmit) { // 重新提交
            operation = saveAndCommitTask;
            submitData.biReferenceId = this.biReferenceId;
            console.log('submitData.biReferenceId:', submitData.biReferenceId);
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
        let {formData} = data;
        formData.order.dataSet.map(item => {
          item = {
            ...item,
            inventoryPic: item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
            inventoryName: item.inventoryName_transObjCode,
            inventoryCode: item.transObjCode,
            specification: item.specification_transObjCode,
            processing: item.tdProcessing || '商品',
            measureUnit: item.measureUnit_transObjCode,
          }
          this.matterList.push(item);
        })
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
        // 客户信息展示
        this.dealerInfo = {
          creatorName: formData.dealerDebitContactPersonName,
          dealerMobilePhone: formData.dealerDebitContactInformation,
          dealerCode: formData.order.dealerDebit,
          dealerSubclass: formData.order.drAccountSub,
          dealerLabelName: formData.order.drDealerLabel,
          dealerName: formData.order.dealerName_dealerDebit,
          province: formData.order.province_dealerDebit,
          city: formData.order.city_dealerDebit,
          county: formData.order.county_dealerDebit,
          address: formData.order.address_dealerDebit,
          paymentTerm: formData.order.drDealerPaymentTerm,
          dealerLogisticsTerms: formData.drDealerLogisticsTerms,
          pamentDays: formData.inPut.daysOfAccount,
          validUntil: formData.inPut.validUntil,
          tdAmountCopy1: formData.inPut.dataSet[0].tdAmountCopy1,
          advancePaymentDueDate: formData.inPut.dataSet[0].advancePaymentDueDate,
        };
        // 订单信息
        this.contact = {
          dealerName: formData.dealerDebitContactPersonName, //联系人
          dealerMobilePhone: formData.dealerDebitContactInformation,//电话
        };
        // 物料列表请求参数
        this.matterParams = {
          ...this.matterParams,
          drDealerCode: this.dealerInfo.dealerCode,
        };
        this.$loading.hide();
      })
    },
    // TODO 是否保存草稿
    hasDraftData() {
      if (!this.matterList.length) {
        return false
      }
      return {
        [DRAFT_KEY]: {
          matter: this.matterList,
          dealerInfo: this.dealerInfo,
          formData: this.formData,
          contact: this.contact,
        }
      };
    },
  },
  created() {
    let data = sessionStorage.getItem(DRAFT_KEY);
    if (data) {
      let draft = JSON.parse(data);
      this.matterList = draft.matter;
      this.dealerInfo = draft.dealerInfo;
      this.formData = draft.formData;
      this.contact = draft.contact;
      // 物料列表请求参数
      this.matterParams = {
        ...this.matterParams,
        drDealerCode: this.dealerInfo.dealerCode,
      };
      sessionStorage.removeItem(DRAFT_KEY);
    }
  }
}
</script>

<style lang='scss' scoped>
  @import './../../scss/bizApply';

  .vux-1px-b:after,
  .vux-1px-t:before {
    border-color: #e8e8e8;
  }

  .comment {
    width: 95%;
    margin: 0 auto;
    background: #fff;
    // margin-top: .1rem;
    padding: .06rem .1rem;
    box-sizing: border-box;

    .weui-cell {
      padding: 0;
    }
  }

  .no_margin {
    margin-top: 0;
  }

  .materiel_list
  .mater_list
  .each_mater_wrapper
  .has_padding {
    padding-right: .38rem;
  }

  //有效期
  .no_top {
    margin-top: 0;
    margin-bottom: 0.1rem;
    background: #fff;
  }

  .cell-item {
    background: #fff;
    box-sizing: border-box;
    padding: .02rem .1rem;
    display: flex;
    font-size: .14rem;
    align-items: center;
    justify-content: space-between;
    height: .36rem;
    line-height: .32rem;
    /deep/ .weui-cell__hd {
      color: #757575;
    }
    &:before {
      display: none;
    }
    .title {
      color: #757575;
      &.required {
        color: #5077aa;
      }
    }
    .mode {
      color: #111;
      font-weight: 500;
      display: flex;
      align-items: center;
      .mode_content {
        margin-right: .06rem;
      }
      .icon-shenglve {
        font-size: .2rem;
        color: #707070;
      }
    }
  }

</style>
