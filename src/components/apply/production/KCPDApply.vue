<template>
  <div class="pages kcpd-apply-container">
    <div class="basicPart no_count" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 入库仓库-->
        <pop-warehouse-list title="仓库名称" :default-value="warehouse" @sel-item="selWarehouseIn" isRequired></pop-warehouse-list>

        <!-- 物料列表 -->
        <div class="materiel_list">
          <!-- 没有选择物料 -->
          <template v-if="!matterList.length">
            <div @click="showMaterielPop = !showMaterielPop">
              <div class="title">{{orderListTitle}}列表</div>
              <div class="tips">请选择{{orderListTitle}}</div>
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
              <div class="each_mater" :class="{mater_delete : matterModifyClass,'vux-1px-b' : index < matterList.length-1}"
                   v-for="(item, index) in matterList" :key="index">
                <matter-item :item="item" @on-modify="getMatterModify(item, index)" :show-delete="matterModifyClass"
                             @click.native="delClick(index, item)" :config="matterEditConfig.property">
                  <template slot-scope="{item}" slot="info">
                    <div class='mater_num' v-show="item.tdQty">
                      盘点数量: <span class="num">{{item.tdQty}}</span>
                      差异数量: <span class="diff_num">{{item.differenceNum}}</span>
                    </div>
                  </template>
                  <template slot="edit" slot-scope="{item}">
                    <div class='mater_other' @click="getMatterModify(item, index)" v-if="!item.tdQty && !matterModifyClass">
                      <div class="edit-tips" >点击进行填写</div>
                    </div>
                  </template>
                </matter-item>
                <div class='delete_icon' @click="delClick(index, item)" v-if='matterModifyClass'>
                  <x-icon type="ios-checkmark" size="20" class="checked" v-show="showSelIcon(item)"></x-icon>
                  <x-icon type="ios-circle-outline" size="20" v-show="!showSelIcon(item)"></x-icon>
                </div>
              </div>
            </div>
          </template>
          <!-- 新增更多 按钮 -->
          <div class="handle_part" v-if="matterList.length && !matterModifyClass">
            <span class="add_more stop" v-if="this.actions.includes('stop')"
              @click="stopOrder" >终止提交</span>
            <span class="symbol" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>或</span>
            <span class="add_more" v-if="matterList.length" @click="addMatter">新增更多物料</span>
          </div>
          <!-- 物料popup -->
          <pop-matter-list :show="showMaterielPop" v-model="showMaterielPop" @sel-matter="selMatter"
                           :default-value="matterList" :config="matterPopConfig" :matter-params="matterParams"
                           ref="matter">
          </pop-matter-list>
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
      <div class="btn-item" @click="save">提交</div>
    </div>
    <!-- 底部删除确认栏 -->
    <div class="count_mode vux-1px-t delete_mode" v-else>
      <div class='count_num all_checked' @click="checkAll">
        <x-icon type="ios-circle-outline" size="20" class='outline' v-show="selItems.length !== matterList.length"></x-icon>
        <x-icon type="ios-checkmark" size="20" class="checked" v-show="selItems.length === matterList.length"></x-icon>
        全选
      </div>
      <div class='delete_btn' @click="deleteCheckd">删除</div>
    </div>
  </div>
</template>

<script>
// vux插件引入
import { Icon, Cell, Group, XInput, XTextarea } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
import { submitAndCalc, saveAndStartWf, saveAndCommitTask, updateData } from 'service/commonService'
// mixins 引入
import ApplyCommon from 'pageMixins/applyCommon'
// 组件引入
import PopMatterList from 'components/Popup/matter/PopMatterList'
import PopWarehouseList from 'components/Popup/PopWarehouseList'
import PopMatter from 'components/apply/commonPart/MatterPop'
import RPicker from 'components/RPicker'
import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
// 方法引入
import { accSub } from '@/home/pages/maps/decimalsAdd'
import { toFixed } from '@/plugins/calc'
const DRAFT_KEY = 'KCPD_DATA';

export default {
  mixins: [ApplyCommon],
  components: {
    Icon, Cell, Group, XInput, XTextarea,
    PopMatterList, PopWarehouseList, PopMatter, RPicker, PopBaseinfo
  },
  data() {
    return {
      listId: 'edf7b34b-8916-410f-801f-2db7e97efbde',
      matterList: [], // 物料列表
      showMaterielPop: false, // 是否显示物料的popup
      transCode: '',
      formData: {
        biComment: '',
      },
      numMap: {},
      warehouse: {},
      matter:{},
      showMatterPop :false,
      modifyIndex:null,
      checkFieldList: [
        {
          key: 'tdQty',
          message: '请填写盘点数量'
        }
      ]
    }
  },
  watch: {
    matter: {
      handler (val) {
        val.differenceNum = accSub(val.tdQty, val.qtyBal);
      },
      deep: true
    },
  },
  methods: {
    // 选择要删除的物料
    delClick (index, sItem) {
      let arr = this.selItems;
      let delIndex = arr.findIndex(item => item.inventoryCode === sItem.inventoryCode);
      // 若存在重复的 则清除
      if (delIndex !== -1) {
        arr.splice(delIndex, 1);
        return;
      }
      arr.push(sItem);
    },
    // 判断是否展示选中图标
    showSelIcon (sItem) {
      return this.selItems.findIndex(item => item.inventoryCode === sItem.inventoryCode) !== -1;
    },
    // 全选
    checkAll (){
      if (this.selItems.length === this.matterList.length) {
        this.selItems = [];
        return
      }
      this.selItems = JSON.parse(JSON.stringify(this.matterList));
    },
    // 删除选中的
    deleteCheckd () {
      this.$vux.confirm.show({
        content: '确认删除?',
        // 确定回调
        onConfirm: () => {
          this.selItems.forEach(item=>{
            let index = this.matterList.findIndex(item2=>item2.inventoryCode === item.inventoryCode);
            if (index >= 0){
              this.matterList.splice(index,1);
            }
          })
          this.selItems = [];
          this.matterModifyClass = false;
        }
      })

    },
    // 点击增加更多物料
    addMatter () {
      this.showMaterielPop = !this.showMaterielPop
    },
    // 选中入库仓库
    selWarehouseIn (val) {
      this.warehouse = JSON.parse(val);
      if (this.matterParams.data.whCode != null) {
        this.matterParams.data.whCode = this.warehouse.warehouseCode;
        this.matterList = [];
      }
    },
    // 显示物料修改的pop
    modifyMatter (item, index) {
      this.matter = JSON.parse(JSON.stringify(item));
      this.showMatterPop = true;
      this.modifyIndex = index;
    },
    // 更新修改后的物料信息
    selConfirm (val) {
      let modMatter = JSON.parse(val);
      this.$set(this.matterList, this.modifyIndex, modMatter);
    },
    // 选中物料项
    selMatter (val) {
      let sels = JSON.parse(val);
      sels.forEach(item => {
        item.tdQty = item.tdQty || 0;
        item.differenceNum = accSub(item.tdQty, item.qtyBal);
        item.thenQtyStock = toFixed(accSub(item.qtyBal, item.qtyLock))
      });
      this.numMap = {};
      this.matterList = [...sels];
    },
    // 获取默认图片
    getDefaultImg (item) {
      let url = require('assets/wl_default03.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    // 提交
    save () {
      let warn = '',
          dataSet = [];
      let validateMap = [
        {
          key: 'warehouse',
          message: '入库仓库'
        },
      ];
      validateMap.every(item => {
        if (!this[item.key]) {
          warn = `请选择${item.message}`;
          return false
        }
        return true
      });
      if (!warn && !this.matterList.length) {
        warn = '请选择物料';
      }
      this.matterList.every(item => {
        if (!item.tdQty){
          warn = '请填写盘点数量'
          return false
        }
        let mItem = {
          transObjCode: item.inventoryCode, // 物料编码
          thenQtyStock: item.thenQtyStock, // 可用库存
          tdQty: item.tdQty, // 盘点数量
          differenceNum: item.differenceNum || 0,
          tdProcessing: item.processing, // 物料加工属性
          assistQty: item.assistQty || 0, // 辅计数量（明细）
          assMeasureScale: item.assMeasureScale || null, // 与单位倍数（明细）
          assMeasureUnit: item.assMeasureUnit || null, // 辅助计量（明细）
          thenLockQtyStock: item.qtyLock, // 计划占用
          thenTotalQtyStock:item.qtyBal, // 库存余额
          comment: item.comment || null,
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
            containerInWarehouseManager: this.warehouse.containerInWarehouseManager || null, // 入库管理员
            inPut: {
              containerCode: this.warehouse.warehouseCode,
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
          if (this.transCode && !this.isModify) {
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
          if (this.isModify) {
            operation = updateData;
          }
          this.saveData(operation, submitData);
        }
      });
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
        let matterList = [];
        this.attachment = attachment;
        // 获取合计
        let {inPut} = formData;
        let {dataSet = []} = inPut;
        for (let item of dataSet) {
          item = {
            ...item,
            qtyBal: item.thenTotalQtyStock,
            qtyLock: item.thenLockQtyStock,
            inventoryPic: item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
            inventoryName: item.inventoryName_transObjCode,
            inventoryCode: item.transObjCode,
            specification: item.specification_transObjCode,
            measureUnit: item.measureUnit_transObjCode,
            processing: item.tdProcessing
          };
          matterList.push(item);
        }
        // 入库
        this.warehouse = {
          warehouseCode: inPut.containerCode,
          warehouseName: inPut.warehouseName_containerCode,
          warehouseType: inPut.warehouseType_containerCode,
          warehouseProvince: inPut.warehouseProvince_containerCode,
          warehouseCity: inPut.warehouseCity_containerCode,
          warehouseDistrict: inPut.warehouseDistrict_containerCode,
          warehouseAddress: inPut.warehouseAddress_containerCode,
        };
        this.warehouseParams = {
          whCode: this.warehouse.warehouseCode,
        };
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
    // 检查金额，取正数、保留两位小数
    checkAmt (item) {
      let {tdQty = 0} = item;
      if (typeof tdQty !== 'number') {
        tdQty = 0;
      }
      item.tdQty = Math.abs(toFixed(tdQty));
    },
    // 是否保存草稿
    hasDraftData () {
      if (!this.matterList.length) {
        return false
      }
      return {
        [DRAFT_KEY]: {
          matter: this.matterList,
          warehouse: this.warehouse,
          formData: this.formData,
        }
      };
    },
  },
  created () {
    let data = sessionStorage.getItem(DRAFT_KEY);
    if (data) {
      let draft = JSON.parse(data);
      this.matterList = draft.matter;
      this.warehouse = draft.warehouse;
      this.formData = draft.formData;
      this.warehouseParams = {
        whCode: this.warehouse.warehouseCode,
      };
      sessionStorage.removeItem(DRAFT_KEY);
    }
  },
}
</script>

<style lang="scss" scoped>
  @import './../../scss/bizApply';
  .kcpd-apply-container {
    .matter-remain {
      // margin-top: .04rem;
      color: #757575;
      font-size: .14rem;
      display: flex;
      justify-content: space-between;
      .remain {
        .num {
          color: #5077aa;
          font-size: .16rem;
          font-weight: bold;
        }
      }
    }
    .high_light {
      /deep/ .weui-cell__ft {
        color:red;
        font-weight: 700;

      }

    }
  }

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
  }
  .materiel_list .mater_list .each_mater_wrapper .mater_main {
    padding-right: .38rem;
  }
</style>
