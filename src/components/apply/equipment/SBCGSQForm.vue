<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 物料列表 -->
        <div class="materiel_list">
          <!-- 没有选择物料 -->
          <template v-if="!matterList.length">
            <div @click="showFacilityPop = !showFacilityPop">
              <div class="title">设施列表</div>
              <div class="required">请选择设施</div>
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
              <div class="each_mater" :class="{mater_delete : matterModifyClass,'vux-1px-b' : index < matterList.length-1 }"
                  v-for="(item, index) in matterList" :key='index'>
                <matter-item :item="item" @on-modify="modifyMatter(item,index)" :show-delete="matterModifyClass"
                              @click.native="delClick(index,item)">
                  <template slot="info" slot-scope="{item}">
                      <!-- 物料属性和单位 -->
                      <div class="mater_more">
                        <span class="processing">大类: {{item.facilityBigType}}</span>
                        <span class='mater_color'>子类: {{item.facilitySubclass || '无'}}</span>
                        <span class='unit'>单位: {{item.facilityUnit}}</span> 
                        <span>设施类型: {{item.facilityType}}</span>
                      </div>
                      <!-- 物料数量和价格 -->
                      <div class='mater_other' v-if="item.price && item.tdQty">
                        <div class='mater_price'>
                          <span class="symbol">￥</span>{{item.price}}
                        </div>
                        <div>
                          <r-number :num="item.tdQty"
                                    :checkAmt='checkAmt' v-model="item.tdQty" :max="item.qtyBal"></r-number>
                        </div>
                      </div>
                    </template>
                  <template slot="edit" slot-scope="{item}">
                    <div class='mater_other' @click="modifyMatter(item,index)" v-if="!item.price && !matterModifyClass">
                      <div class="edit-tips">
                        <span class="tips-word">点击进行填写</span>
                      </div>
                    </div>
                  </template>
                </matter-item>
                <div class='delete_icon' @click="delClick(index,item)" v-if='matterModifyClass'>
                  <x-icon type="ios-checkmark" size="20" class="checked" v-show="showSelIcon(item)"></x-icon>
                  <x-icon type="ios-circle-outline" size="20" v-show="!showSelIcon(item)"></x-icon>
                </div>
              </div>
            </div>
          </template>
          <!-- 新增更多 按钮 -->
          <div class="handle_part" v-if="matterList.length && !matterModifyClass">
            <span class="add_more stop" v-if="this.actions.includes('stop')"
                  @click="stopOrder">终止提交</span>
            <span class="symbol" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>或</span>
            <span class="add_more" @click="addOrder">新增更多物料</span>
          </div>
          <pop-facility-list :show="showFacilityPop" v-model="showFacilityPop" @sel-matter="selMatter" :judgeKeys="['facilityCode']"
                             :default-value="matterList" :params="matterParams" ref="matter">
            <template slot="storage" slot-scope="{item}">
              <div class="mater_classify"></div>
            </template>
          </pop-facility-list>
        </div>
        <!--物料编辑pop-->
        <pop-matter :modify-matter='matter' :show-pop="showMatterPop" @sel-confirm='selConfirm'
                    v-model='showMatterPop' :btn-is-hide="btnIsHide" :isShowAmount="false">
          <template slot="modify" slot-scope="{modifyMatter}">
            <x-input type="number"  v-model.number='modifyMatter.tdQty' text-align="right"
                     placeholder="请输入" @on-blur="checkAmt(modifyMatter)" @on-focus="getFocus($event)">
              <template slot="label">
                <slot name="qtyName">
                  <span class='required'>本次申请</span>
                </slot>
              </template>
            </x-input>
            <x-input type="number"  v-model.number='modifyMatter.price' text-align="right"
                     @on-blur="checkAmt(modifyMatter)" placeholder="请输入" @on-focus="getFocus($event)">
              <template slot="label">
                <span class='required'>估计价格
                </span>
              </template>
            </x-input>
            <cell :value="modifyMatter.tdAmount">
              <template slot="title">
                <span class='required'>估计金额
                </span>
              </template>
            </cell>
          </template>
        </pop-matter>

        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment"></upload-file>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class="count_mode vux-1px-t" :class="{btn_hide : btnIsHide}" v-if="!matterModifyClass">
      <span class="count_num">
        <span style="fontSize:.14rem">￥</span>{{tdAmount | numberComma}}
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
  // vux插件引入
  import {XTextarea, Datetime, dateFormat, Cell, XInput} from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  import {
    saveAndStartWf,
    saveAndCommitTask,
    submitAndCalc
  } from 'service/commonService'
  // mixins 引入
  import applyCommon from 'components/mixins/applyCommon'
  // 组件引入
  import PopFacilityList from 'components/Popup/equipment/PopFacilityList'
  import PopMatter from 'components/apply/commonPart/MatterPop'
  import RNumber from 'components/RNumber'
  import RPicker from 'components/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  // 公共方法
  import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd'
  import {toFixed} from '@/plugins/calc'

  const DRAFT_KEY = 'SBCGSQ_DATA';

  export default {
    name: 'ApplySBCGSQForm',
    data() {
      return {
        matterList: [], // 订单列表
        formData: {
          biId: '',
          biComment: '',
          biProcessStatus: ''
        },
        numMap: {}, // 用于记录订单物料的数量
        showFacilityPop: false,
        matterParams: { // 物料列表的请求参数
          facilityType: '工程物资,固定资产'
        },
        showMatterPop: false,
        selItems: []
      }
    },
    mixins: [applyCommon],
    components: {
      XTextarea, Datetime, RNumber, Cell, XInput,
      PopMatter, RPicker, PopBaseinfo, PopFacilityList,
    },
    methods: {
      // TODO 选中物料项
      selMatter(val) {
        let sels = JSON.parse(val);
        sels.map(item => {
          let {tdQty = '', price = ''} = this.numMap[item.facilityCode] || {};
          item.tdQty = tdQty;
          item.price = price;
        });
        this.numMap = {};
        this.matterList = sels;
      },
      // TODO 选择默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default02.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // 滑动删除
      delClick(index, sItem) {
        let arr = this.selItems;
        let delIndex = arr.findIndex(item => item.facilityCode === sItem.facilityCode);
        //若存在重复的 则清除
        if (delIndex !== -1) {
          arr.splice(delIndex, 1);
          return;
        }
        arr.push(sItem);
      },
      // TODO 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.selItems.findIndex(item => item.facilityCode === sItem.facilityCode) !== -1;
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
              let index = this.matterList.findIndex(item2 => item2.facilityCode === item.facilityCode);
              if (index >= 0) {
                this.matterList.splice(index, 1);
              }
            })
            this.selItems = [];
            this.matterModifyClass = false;
          }
        })
      },
      // TODO 新增更多订单
      addOrder() {
        for (let item of this.matterList) {
          // 存储已输入的价格
          this.numMap[item.facilityCode] = {...item};
        }
        this.showFacilityPop = !this.showFacilityPop;
      },
      // TODO 提价订单
      submitOrder() {
        let warn = '';
        let dataSet = [];
        // 校验
        this.matterList.every(item => {
          if (!item.price) {
            warn = '单价不能为空';
            return false
          }
          if (!item.tdQty && item.tdQty !== 0) {
            warn = '数量不能为空';
            return false
          }
          let oItem = {
            facilityObjCode: item.facilityCode,
            facilityType: item.facilityType,
            assMeasureUnit: null, // 辅助计量（明细）
            assistQty: item.assistQty || null, // 辅计数量（明细）
            tdQty: item.tdQty, // 明细发生数
            price: item.price, // 明细单价
            tdAmount: item.tdAmount, // 明细发生金
            comment: item.comment || '', // 说明
          };
          if (this.transCode) {
            oItem.tdId = item.tdId || null;
          }
          dataSet.push(oItem);
          return true
        })
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
                businessKey: 'EPAP',
                createdBy: ''
              }
            };
            formData = {
              ...this.formData,
              handlerEntity: this.entity.dealerName,
              creator: this.transCode ? this.formData.handler : '',
              modifer: this.transCode ? this.formData.handler : '',
              order: {
                dataSet
              },
            };
            // 重新提交
            if (this.transCode) {
              operation = saveAndCommitTask;
              wfPara = {
                businessKey: this.transCode,
                createdBy: this.formData.handler,
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
            // 新增
            if (!this.transCode) {
              delete submitData.biReferenceId
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
        })
      },
      // TODO 获取详情
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
          // 获取合计
          let {order} = formData;
          let {dataSet = []} = order;
          let matterList = [];
          for (let item of dataSet) {
            item = {
              ...item,
              facilityName: item.facilityName_facilityObjCode,
              facilityCode: item.facilityCode_facilityObjCode,
              facilityBigType: item.facilityBigType_facilityObjCode,
              facilitySubclass: item.facilitySubclass_facilityObjCode,
              facilityUnit: item.facilityUnit_facilityObjCode,
              facilityName: item.facilityName_facilityObjCode,
              facilityName: item.facilityName_facilityObjCode,
              inventoryPic: item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
            };
            matterList.push(item);
          }
          // 基本信息
          this.handlerDefault = {
            handler: formData.handler,
            handlerName: formData.handlerName,
            handlerUnit: formData.handlerUnit,
            handlerUnitName: formData.handlerUnitName,
            handlerRole: formData.handlerRole,
            handlerRoleName: formData.handlerRoleName,
          };
          this.formData = {
            ...this.handlerDefault,
            creator: formData.creator,
            modifer: formData.modifer,
            biId: formData.biId,
            biComment: formData.biComment,
            biProcessStatus: item.biProcessStatus
          };
          this.biReferenceId = formData.biReferenceId;
          this.matterList = matterList;
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
            formData: this.formData,
          }
        };
      },
    },
    created() {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        let draft = JSON.parse(data);
        this.matterList = draft.matter;
        this.formData = draft.formData;
        sessionStorage.removeItem(DRAFT_KEY);
      }
    },
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizApply';

  .pages {
    /deep/ .vux-no-group-title {
      margin-top: 0;
    }
    /deep/ .weui-cells {
      font-size: .14rem;
      &:before {
        border-top: none;
      }
    }
    .cell-item {
      margin: 0 auto;
      padding: .05rem .1rem;
      width: 95%;
      background-color: #fff;
      box-sizing: border-box;
      /deep/ .vux-label {
        color: #757575;
        font-size: .14rem;
      }
    }
  }

  .edit_matter {
    .r-dropdown {
      width: 1rem;
      /deep/ .r-dropdown-value {
        justify-content: flex-end;
        font-size: .14rem;
      }
      /deep/ .r-dropdown-list {
        text-align: left;
      }
    }
  }
</style>
