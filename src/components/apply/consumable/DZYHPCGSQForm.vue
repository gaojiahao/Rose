<template>
  <div class="pages xsbj-apply-container">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 物料列表 -->
        <div class="materiel_list">
          <!-- 没有选择物料 -->
          <template v-if="!matterList.length">
            <div @click="showMaterielPop = !showMaterielPop">
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
              <div class="each_mater"
                   :class="{mater_delete : matterModifyClass,'vux-1px-b' : index < matterList.length-1 }"
                   v-for="(item, index) in matterList" :key='index'>
                <matter-item :item="item" @on-modify="modifyMatter(item,index)" :show-delete="matterModifyClass"
                             @click.native="delClick(index,item)" :config="matterEditConfig.property">
                  <template slot="info" slot-scope="{item}">
                    <!-- 物料数量和价格 -->
                    <div class='mater_other' v-if="item.price && item.tdQty">
                      <div class='mater_price'>
                        <span class="symbol">￥</span>{{item.price}}
                      </div>
                      <div>
                        <r-number :num="item.tdQty" :checkAmt='checkAmt(item)' v-model="item.tdQty"></r-number>
                      </div>
                    </div>
                  </template>
                  <template slot="edit" slot-scope="{item}">
                    <div class='mater_other' @click="modifyMatter(item,index)" v-if="!item.tdQty && !matterModifyClass">
                      <div class="edit-tips">
                        <span class="tips-word">点击进行填写</span>
                      </div>
                    </div>
                  </template>
                  <template slot="editPart" slot-scope="{item}">
                    <div class="edit-part vux-1px-l" @click="modifyMatter(item,index)"
                         v-show="item.tdQty && !matterModifyClass">
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
          <div class="handle_part vx-1px-t" v-if="matterList.length && !matterModifyClass">
            <span class="add_more stop" v-if="this.actions.includes('stop')"
                  @click="stopOrder">终止提交</span>
            <span class="symbol" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>或</span>
            <span class="add_more" v-if="matterList.length" @click="addMatter">新增更多物料</span>
          </div>
          <!-- 物料popup -->
          <pop-matter-list :show="showMaterielPop" v-model="showMaterielPop" @sel-matter="selMatter"
                           :default-value="matterList" :config="matterPopConfig" :matter-params="matterParams"
                           ref="matter">
          </pop-matter-list>
        </div>
        <!--物料编辑pop-->
        <pop-matter :modify-matter='consumables' :show-pop="showMatterPop" @sel-confirm='selConfirm'
                    v-model='showMatterPop' :btn-is-hide="btnIsHide" :config="matterEditConfig">
        </pop-matter>
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class="count_mode vux-1px-t" :class="{btn_hide : btnIsHide}" v-if="!matterModifyClass">
      <span class="count_num">
        <span style="fontSize:.14rem">￥</span>{{tdAmount | numberComma(3)}}
        <!--<span class="taxAmount">[含税: ￥{{taxAmount |numberComma(3)}}]</span>-->
      </span>
      <span class="count_btn" @click="save">提交</span>
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
  import {Icon, XInput, XTextarea, Cell, Group} from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  import {submitAndCalc, saveAndStartWf, getDictByType, saveAndCommitTask} from 'service/commonService'
  // mixins 引入
  import ApplyCommon from 'pageMixins/applyCommon'
  // 组件引入
  import RPicker from 'components/RPicker'
  import PopMatterList from 'components/Popup/PopMatterListTest'
  import PopDealerList from 'components/Popup/PopDealerListTest'
  import PopSingleSelect from 'components/Popup/PopSingleSelect'
  import PopMatter from 'components/apply/commonPart/MatterPop'
  import UploadFile from 'components/upload/UploadFile'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import RNumber from 'components/RNumber'

  // 方法引入
  import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd'
  import {toFixed} from '@/plugins/calc'

  const DRAFT_KEY = 'DZYHPCGSQ_DATA';

  export default {
    data() {
      return {
        listId: '4472a646-f2c8-4a07-bad6-4c01f0b9292f',
        matterList: [], // 物料列表
        showMaterielPop: false, // 是否显示物料的popup
        transCode: '',
        formData: {
          biComment: '',
        },
        priceMap: {},
        consumables: {},
        checkFieldList: [
          {
            key: 'tdQty',
            message: '请填写本次申请数量'
          },
          {
            key: 'price',
            message: '请填写估计价格'
          },
        ]
      }
    },
    components: {
      Icon, XInput, RPicker, XTextarea, Group,
      PopMatterList, PopMatter, UploadFile,
      PopBaseinfo, Cell, RNumber,
    },
    mixins: [ApplyCommon],
    computed: {
      // 合计金额
      totalAmount() {
        let total = 0;
        this.matterList.forEach(item => {
          this.simpleCalcMatter(item);
          total = accAdd(total, item.noTaxAmount);
        });
        return Number(total);
      },
      // 税金
      taxAmount() {
        let total = 0;
        this.matterList.forEach(item => {
          total = toFixed(accAdd(total, item.taxAmount));
        });
        return total;
      },
      tdAmount() {
        return parseFloat(accAdd(this.totalAmount, Number(this.taxAmount)).toFixed(2))
      },
    },
    watch:{
      //修改的物料
      consumables:{
        handler(val){
          this.simpleCalcMatter(val)
        },
        deep:true
      }
    },
    methods: {
      // TODO 显示物料修改的pop
      modifyMatter(item, index, key) {
        this.consumables = JSON.parse(JSON.stringify(item));
        this.showMatterPop = true;
        this.modifyIndex = index;
        this.modifyKey = key;
      },
      // 滑动删除
      delClick(index, sItem) {
        let arr = this.selItems;
        let delIndex = arr.findIndex(item => item.inventoryCode === sItem.inventoryCode);
        // 若存在重复的 则清除
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
      // TODO 点击增加更多物料
      addMatter() {
        this.showMaterielPop = !this.showMaterielPop
      },
      // TODO 选中物料项
      selMatter(val) {
        let sels = JSON.parse(val);
        sels.forEach(item => {
          item.price = item.price || '';
          item.tdQty = item.tdQty || '';
        });
        this.matterList = [...sels];
      },
      // TODO 获取默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default03.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // TODO 提交
      save() {
        let warn = '',
          dataSet = [];
        let validateMap = [
          {
            key: 'matterList',
            message: '物料'
          }
        ];
        validateMap.every(item => {
          if (!Object.values(this[item.key]).length) {
            warn = `请选择${item.message}`;
            return false
          }
          return true
        });
        this.matterList.every(item => {
          if (!item.tdQty) {
            warn = '请输入本次申请数量';
            return false
          }
          if(!item.price){
            warn = '请输入估计价格';
            return false
          }
          let mItem = {
            transObjCode: item.inventoryCode,
            inventoryName_transObjCode: item.inventoryName,
            tdProcessing: item.processing,
            specification_transObjCode: item.specification,
            measureUnit_transObjCode: item.measureUnit,
            assMeasureUnit: item.assMeasureUnit || null,
            assMeasureScale: item.assMeasureScale || null,
            assistQty: item.assistQty || 0,
            tdQty: item.tdQty,
            price: item.price,
            tdAmount: item.tdAmount,
            comment: item.comment || null
          };
          if (this.transCode) {
            mItem.tdId = item.tdId || '';
          }
          dataSet.push(mItem);
          return true
        });
        if (warn) {
          this.$vux.alert.show({
            content: warn,
          });
          return
        }
        this.$vux.confirm.show({
          content: '确认提交?',
          // 确定回调
          onConfirm: () => {
            this.$HandleLoad.show();
            let operation = saveAndStartWf;
            let formData = {
              creator: this.formData.handler,
              ...this.formData,
              modifer: this.formData.handler,
              handlerEntity: this.entity.dealerName,
              order: {
                dataSet
              }
            };
            let submitData = {
              listId: this.listId,
              biComment: '',
              formData: JSON.stringify(formData),
              wfPara: JSON.stringify({
                [this.processCode]: {
                  businessKey: this.businessKey,
                  createdBy: formData.creator,
                }
              }),
            };
            // 若为重新提交，则修改提交参数
            if (this.transCode) {
              operation = saveAndCommitTask;
              submitData.biReferenceId = this.biReferenceId;
              submitData.wfPara = JSON.stringify({
                businessKey: this.transCode,
                createdBy: formData.creator,
                transCode: this.transCode,
                result: 3,
                taskId: this.taskId,
                comment: ''
              });
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
          let matterList = [];
          this.attachment = attachment;
          // 获取合计
          let {order} = formData;
          let {dataSet = []} = order;
          for (let item of dataSet) {
            item = {
              ...item,
              inventoryPic: item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
              inventoryName: item.inventoryName_transObjCode,
              inventoryCode: item.inventoryCode_transObjCode,
              specification: item.specification_transObjCode,
              processing: item.tdProcessing,
              measureUnit: item.measureUnit_transObjCode,
              inventoryColor: item.inventoryColor_transObjCode,
            };
            matterList.push(item);
          }
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
          }
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
            formData: this.formData
          }
        };
      },
      // TODO 检查本次申请和估计价格，并计算估计金额
      checkAmt(item) {
        let {tdQty, price} = item;
        tdQty = Math.abs(toFixed(tdQty));
        price = Math.abs(toFixed(price));
        if (tdQty) {
          item.tdQty = tdQty;
          item.tdAmount = toFixed(accMul(tdQty, price));
        }
        if (price) {
          item.price = price;
          item.tdAmount = toFixed(accMul(tdQty, price));
        }
      },
    },
    created() {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        this.matterList = JSON.parse(data).matter;
        this.formData = JSON.parse(data).formData;
        sessionStorage.removeItem(DRAFT_KEY)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import './../../scss/bizApply';

</style>
