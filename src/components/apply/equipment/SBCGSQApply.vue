<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 物料列表 -->
        <div class="materiel_list">
          <!-- 没有选择物料 -->
          <template v-if="!matterList.length">
            <div @click="showFacilityPop = !showFacilityPop">
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
              <div class="each_mater" :class="{mater_delete : matterModifyClass,'vux-1px-b' : index < matterList.length-1 }"
                  v-for="(item, index) in matterList" :key='index'>
                <matter-item :item="item" @on-modify="getMatterModify(item, index)" :show-delete="matterModifyClass"
                              @click.native="delClick(index,item)" :config="matterEditConfig.property">
                  <template slot="info" slot-scope="{item}">
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
                    <template slot="editPart" slot-scope="{item}">
                      <div class="edit-part vux-1px-l" @click="getMatterModify(item, index)"
                           v-show="(item.price && item.tdQty) &&!matterModifyClass">
                        <span class='iconfont icon-bianji1'></span>
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
          <pop-matter-list :show="showFacilityPop" v-model="showFacilityPop" @sel-matter="selMatter" :config="matterPopConfig" 
                           :matter-params="matterParams" :default-value="matterList" :filter-list="filterList" ref="matter">                   
          </pop-matter-list>
          <!-- <pop-facility-list :show="showFacilityPop" v-model="showFacilityPop" @sel-matter="selMatter" :judgeKeys="['facilityCode']"
                             :default-value="matterList" :params="matterParams" ref="matter">
          </pop-facility-list> -->
        </div>
        <!--物料编辑pop-->
        <pop-matter :modify-matter='facility' :show-pop="showMatterPop" @sel-confirm='selConfirm' 
                    v-model='showMatterPop' :btn-is-hide="btnIsHide" :config="matterEditConfig">
        </pop-matter>

        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <p class="commit-label vux-1px-b">备注栏</p>
          <x-textarea v-model="formData.biComment" placeholder="请输入"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
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
  import {XTextarea, Datetime, dateFormat, Cell, XInput, Group} from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  import {
    saveAndStartWf,
    saveAndCommitTask,
    submitAndCalc
  } from 'service/commonService'
  // mixins 引入
  import applyCommon from 'mixins/applyCommon'
  // 组件引入
  import PopFacilityList from 'components/Popup/equipment/PopFacilityList'
  import PopMatterList from 'components/Popup/matter/PopMatterList'
  import PopMatter from 'components/apply/commonPart/MatterPop'
  import RNumber from 'components/public/RNumber'
  import RPicker from 'components/public/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  // 公共方法
  import {accAdd, accMul} from 'plugins/calc/decimalsAdd'
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
        showMatterPop: false,
        selItems: [],
        facility: {},
        checkFieldList: [
          {
            key: 'tdQty',
            message: '请填写本次申请数量'
          },
          {
            key: 'price',
            message: '请填写估计价格'
          },
        ],
        filterList: [
          {
            name: '设施名称',
            value: 'facilityName',
          }, {
            name: '设施编码',
            value: 'facilityCode',
          }
        ],
      }
    },
    mixins: [applyCommon],
    components: {
      XTextarea, Datetime, RNumber, Cell, XInput, Group,
      PopMatter, RPicker, PopBaseinfo, PopFacilityList, PopMatterList
    },
    computed: {
      // 合计金额
      tdAmount() {
        let total = 0;
        this.matterList.forEach(item => {
          this.simpleCalcMatter(item)
          total = accAdd(total, item.tdAmount);
        });
        return total;
      }
    },
    watch:{
      //修改的物料
      facility:{
        handler(val){
          this.simpleCalcMatter(val)
        },
        deep:true
      }
    },
    methods: {
      // 选中物料项
      selMatter(val) {
        let sels = JSON.parse(val);
        sels.map(item => {
          item.tdQty = item.tdQty || '';
          item.price = item.price || '';
        });
        this.matterList = sels;
      },
      //显示物料修改的pop
      getMatterModify(item, index){
        this.facility = JSON.parse(JSON.stringify(item));
        this.showMatterPop = true;
        this.modifyIndex = index;
      },
      // 选择默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default03.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // 选择要删除的物料
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
      // 判断是否展示选中图标
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
      // 新增更多订单
      addOrder() {
        this.showFacilityPop = !this.showFacilityPop;
      },
      // 提价订单
      submitOrder() {
        let warn = '';
        let dataSet = [];
        // 校验
        if (!this.matterList.length){
          warn = '请选择设备'
        }
        else {
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
              handlerEntity: this.entity.dealerName,
              creator: this.formData.handler,
              modifer: this.formData.handler,
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
            biProcessStatus: formData.biProcessStatus
          };
          this.biReferenceId = formData.biReferenceId;
          this.matterList = matterList;
          this.$loading.hide();
        })
      },
      // 是否保存草稿
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
  @import '~scss/biz-app/bizApply';

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
