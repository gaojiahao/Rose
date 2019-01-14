<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list @sel-dealer="selDealer" @sel-contact="selContact" :defaultValue="dealerInfo" :dealer-params="dealerParams"
                         :defaultContact="contact"></pop-dealer-list>
        <!--物流，结算，其他信息-->
        <dealer-other-part :dealer-config="dealerConfig" :dealer-info="dealerInfo" v-model="dealerInfo"></dealer-other-part>
        <!-- 物料列表 -->
        <div class="materiel_list">
          <!-- 没有选择物料 -->
          <template v-if="!matterList.length">
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
              <div class="each_mater"
                   :class="{mater_delete : matterModifyClass,'vux-1px-b' : index < matterList.length-1}"
                   v-for="(item, index) in matterList" :key='index'>
                <matter-item :item="item" @on-modify="modifyMatter(item,index)" :show-delete="matterModifyClass"
                             @click.native="delClick(item,index)" :config="matterEditConfig.property">
                  <template slot="info" slot-scope="{item}">
                    <!-- 物料数量和价格 -->
                    <div class='mater_other' v-if="item.price && item.tdQty">
                      <div class='mater_price'>
                        <span class="symbol">￥</span>{{item.price}}
                      </div>
                      <div>
                        <r-number :num="item.tdQty"
                                  :checkAmt='checkAmt' v-model="item.tdQty"></r-number>
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
            <span class="add_more" v-if="matterList.length" @click="addMatter">新增更多物料</span>
          </div>
          <!-- 物料popup -->
          <pop-matter-list :show="showMaterielPop" v-model="showMaterielPop" @sel-matter="selMatter" :default-value="matterList" 
                          :matter-params="matterParams"  :config="matterPopConfig" :order-title="matterPopOrderTitle" ref="matter">
          </pop-matter-list>
        </div>
        <!--物料编辑pop-->
        <pop-matter :modify-matter='matter' :show-pop="showMatterPop" @sel-confirm='selConfirm' v-model='showMatterPop' 
                    :btn-is-hide="btnIsHide"  :config="matterEditConfig">
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
  import {Popup, TransferDom, Group, Cell, numberComma, Datetime, XInput, XTextarea} from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  import {getBaseInfoData, saveAndStartWf, saveAndCommitTask, getDictByType, submitAndCalc} from 'service/commonService'
  // mixins 引入
  import common from 'components/mixins/applyCommon'
  // 组件引入
  import RNumber from 'components/RNumber'
  import PopMatterList from 'components/Popup/PopMatterListTest'
  import PopDealerList from 'components/Popup/PopDealerListTest'
  import PopSingleSelect from 'components/Popup/PopSingleSelect'
  import DealerOtherPart from 'components/apply/commonPart/dealerOtherPart'
  import PopMatter from 'components/apply/commonPart/MatterPop'
  import RPicker from 'components/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  // 方法引入
  import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd'

  const DRAFT_KEY = 'XSDDYC_DATA';

  export default {
    data() {
      return {
        showMatterPop: false,
        showMaterielPop: false, // 是否显示物料的popup
        matterList: [], // 物料列表
        dealer: {},
        contact: {},
        formData: {},
        dealerInfo: {},
        checkFieldList: [
          {
            key: 'tdQty',
            message: '请填写数量'
          },
          {
            key: 'price',
            message: '请填写含税单价'
          },
          {
            key: 'taxRate',
            message: '请填写税率'
          },
        ]
      }
    },
    directives: {
      TransferDom
    },
    components: {
      XInput, XTextarea, Group, Cell, Popup,
      PopMatter, RNumber, PopMatterList, PopDealerList,
      PopSingleSelect, Datetime, RPicker, PopBaseinfo, DealerOtherPart
    },
    mixins: [common],
    filters: {
      numberComma,
    },
    methods: {
      // 选中的客户
      selDealer(val) {
        this.dealerInfo = JSON.parse(val)[0];
        this.formData.drDealerLogisticsTerms = this.dealerInfo.dealerLogisticsTerms;
        this.dealerInfo.drDealerPaymentTerm = this.dealerInfo.paymentTerm;
        this.dealerInfo.drDealerLogisticsTerms = this.dealerInfo.dealerLogisticsTerms;
      },
      selContact(val) {
        this.contact = {...val};
        // 联系人
        this.formData.dealerDebitContactPersonName = this.contact.dealerName || '';
        // 联系人电话
        this.formData.dealerDebitContactInformation = this.contact.dealerMobilePhone;
      },
      // 选择物料，显示物料pop
      getMatter() {
        this.showMaterielPop = !this.showMaterielPop;
      },
      // TODO 选中物料项
      selMatter(val) {
        let sels = JSON.parse(val);
        sels.map(item => {
          item.tdQty = item.tdQty || '';
          item.price = item.price || '';
          item.taxRate = item.taxRate || 0.16;
          item.promDeliTime = item.promDeliTime || '';
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
      // TODO 新增更多物料
      addMatter() {
        this.showMaterielPop = !this.showMaterielPop;
      },
      // 提价订单
      submitOrder() {
        if (!this.dealerInfo.dealerName) {
          this.$vux.alert.show({
            content: '请选择客户'
          })
        }
        else if (!this.matterList.length) {
          this.$vux.alert.show({
            content: '请选择物料'
          })
        }
        else {
          let warn = '',
            dataSet = [];
          this.matterList.every(item => {
            if (!item.tdQty) {
              warn = "请填写数量";
              return false
            }
            if (!item.price) {
              warn = "请输入含税单价";
              return false;
            }
            let taxRate = item.taxRate || this.taxRate;
            let taxAmount = accMul(item.price, item.tdQty, taxRate);
            let obj = {
              tdId: item.tdId || '',
              inventoryName_transObjCode: item.inventoryName, // 物料名称
              transObjCode: item.inventoryCode, // 物料编码
              tdProcessing: item.processing, // 加工属性
              assMeasureUnit: item.invSubUnitName || null, // 辅助计量
              assMeasureScale: item.invSubUnitMulti || null, // 与单位倍数
              assMeasureDescription: item.invSubUnitComment || null, // 辅助计量说明
              assistQty: item.assistQty || 0, // 辅计数量
              tdQty: item.tdQty, // 数量
              price: item.price, // 单价
              noTaxPrice: item.noTaxPrice,
              taxRate: taxRate, // 税率
              taxAmount: item.taxAmount, // 税金
              tdAmount: item.tdAmount, // 价税小计
              promDeliTime: item.promDeliTime || '', // 预期交货日
              comment: item.comment || '', // 说明
            }
            dataSet.push(obj)
            return true
          })
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
              let operation = saveAndStartWf; // 默认有工作流
              let wfPara = {
                [this.processCode]: {businessKey: this.businessKey, createdBy: ""}
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
                biComment: this.formData.biComment,
                formData: JSON.stringify({
                  ...this.formData,
                  ...this.dealer,
                  handlerEntity: this.entity.dealerName,
                  order: {
                    dealerDebit: this.dealerInfo.dealerCode,
                    drDealerLabel: this.dealerInfo.dealerLabelName,
                    drDealerPaymentTerm: this.dealerInfo.paymentTerm,
                    dataSet
                  }
                }),
                wfPara: JSON.stringify(wfPara)
              }
              if (this.isResubmit) { // 重新提交
                operation = saveAndCommitTask;
                submitData.biReferenceId = this.biReferenceId;
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
          let {formData} = data;
          formData.order.dataSet.map(item => {
            item = {
              ...item,
              inventoryPic: item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
              inventoryName: item.inventoryName_transObjCode,
              inventoryCode: item.inventoryCode_transObjCode,
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
            ...this.handlerDefault,
            creator: formData.creator,
            modifer: formData.modifer,
            dealerDebitContactPersonName: formData.dealerDebitContactPersonName, //联系人
            dealerDebitContactInformation: formData.dealerDebitContactInformation,//电话
            drDealerLogisticsTerms: formData.drDealerLogisticsTerms, //物流条件
            duringDate: formData.duringDate,
            biComment: formData.biComment,
            biId: formData.biId,
            biProcessStatus: formData.biProcessStatus,
          }
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
            paymentTerm: formData.order.drDealerPaymentTerm || '现付', //付款
          }
          this.contact = {
            dealerName: formData.dealerDebitContactPersonName, //联系人
            dealerMobilePhone: formData.dealerDebitContactInformation,//电话
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
            dealer: this.dealer,
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
        this.dealer = draft.dealer;
        this.formData = draft.formData;
        this.contact = draft.contact;
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

  .during-date {
    margin: 0 auto;
    padding: .05rem .1rem;
    width: 95%;
    background-color: #fff;
    box-sizing: border-box;
    /deep/ .weui-label {
      color: #757575;
      font-size: .14rem;
    }
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


</style>
