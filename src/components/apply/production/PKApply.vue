<template>
  <div class="pages kcpd-apply-container">
    <div class="basicPart no_count" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <!-- 入库仓库-->
        <pop-wh-list title="仓库名称" :default-value="warehouse" @sel-item="selWarehouseIn" :default-store="warehouseStoreInfo" 
            @get-store="getStore" :filter-params="filterParams" :ckParams='ckParams' isRequired isShowStore ref='defManager'>
        </pop-wh-list>
        <!-- 物料列表 -->
        <div class="materiel_list">
          <!-- 没有选择物料 -->
          <div class="order-info" @click="showMaterielPop = !showMaterielPop" v-if="!matterList.length">
            <div class="title">{{orderListTitle}}列表</div>
            <div class="required">请选择{{orderListTitle}}</div>
            <span class="iconfont icon-youjiantou r-arrow"></span>
          </div>
          <!-- 已经选择了物料 -->
          <template v-else>
            <div class="title has-matter">
              <div>{{orderListTitle}}列表</div>
              <div class='edit' v-if='!matterModifyClass' @click="matterModifyClass=true">编辑</div>
              <div class='finished' @click="matterModifyClass=false" v-else>完成</div>
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
          <p class="commit-label vux-1px-b">备注栏</p>
          <x-textarea v-model="formData.biComment" placeholder="请输入"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
        <!--物料编辑pop-->
        <pop-matter :chosen-matter='matter' :modify-matter='matter' :show-pop="showMatterPop" @sel-confirm='selConfirm' 
                    v-model='showMatterPop' :btn-is-hide="btnIsHide" :config="matterEditConfig" :check-amt="checkAmt">
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
import { submitAndCalc, saveAndStartWf, saveAndCommitTask, updateData } from 'service/common/commonService'
// mixins 引入
import ApplyCommon from 'mixins/applyCommon'
// 组件引入
import PopMatterList from 'components/Popup/matter/PopMatterList'
import PopMatter from 'components/apply/commonPart/MatterPop'
import RPicker from 'components/public/RPicker'
import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
import PopWhList from 'components/Popup/PopWhList'
// 方法引入
import { accSub } from 'plugins/calc/decimalsAdd'
import { toFixed } from '@/plugins/calc'
const DRAFT_KEY = 'KCPD_DATA';

export default {
  mixins: [ApplyCommon],
  components: {
    Icon, Cell, Group, XInput, XTextarea,
    PopMatterList, PopMatter, RPicker, PopBaseinfo, PopWhList
  },
  data() {
    return {
      listId: 'a0227fde-e366-4554-ae3c-9af3064a3b1b',
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
      ],
      // 显示删除
      showDeleteFn: true,
      // 是否处于编辑物料状态
      matterModifyClass: false,
      btnIsHide: false,
      // 编辑物料时 已选中的物料
      selItems: [],
      chosenMatter: {},
      warehouseStoreInfo: {},     // 库位信息
      filterParams: [],
      ckParams: 'getObjWarehouseInfo',
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
          this.selItems.forEach(item=> {
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
    // 选择的库位
    getStore(val) {
      this.warehouseStoreInfo = {...val};
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
          message: '仓库名称'
        },
        {
          key: 'warehouseStoreInfo',
          message: '库位'
        }
      ];
      validateMap.every(item => {
        if (!this[item.key].warehouseCode) {
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
          locationStock: item.storehouseQtyBal,  //库位库存
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
            containerInWarehouseManager: this.$refs.defManager.defaultManage || null, // 入库管理员
            inPut: {
              containerCode: this.warehouse.warehouseCode,
              storehouseInCode: this.$refs.defManager.defaultStore.warehouseCode,
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
    checkAmt2(item, key, val) {
      let { price, assistQty, priceRange } = item;
      // 不允许存在负数
      item[key] = Math.abs(toFixed(val));
    },
    // 检查金额，取正数、保留两位小数
    checkAmt(item, key, val) {
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
  @import '~scss/biz-app/bizApply';
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
      .weui-cell__ft {
        color:red;
        font-weight: 700;

      }

    }
  }

  .pages {
    .vux-no-group-title {
      margin-top: 0;
    }
    .weui-cells {
      font-size: .14rem;
      &:before {
        border-top: none;
      }
    }
  }
  .materiel_list {
    //width: 95%;
    //margin: .1rem auto;
    background: #fff;
    margin-top: 0.1rem;
    margin-bottom: 0.1rem;
    box-sizing: border-box;
    padding: 0 .15rem;
    .title {
      color: #757575;
      font-size: .12rem;
      .required {
        color: required;
        font-weight: bold;
      }
    }
  }
  .order-info {
    position: relative;
    font-size: .14rem;
    .title {
      font-size: .14rem;
    }
    .r-arrow {
      position: absolute;
      top: 50%;
      right: -1%;
      font-weight: bold;
      transform: translate(0, -50%);
      color: #333;
    }
  }
  .handle_part {
    margin: 0 auto;
    //width: 95%;
    text-align: center;
    position: relative;
    background-color: #fff;
    .add_more {
      display: inline-block;
      width: 1rem;
      color: #fff;
      height: .24rem;
      font-size: .12rem;
      text-align: center;
      line-height: .24rem;
      margin: 0 auto .1rem;
      padding: 0;
      border-radius: .4rem;
      background: #5077aa;
      box-shadow: 0 2px 5px #5077aa;
      box-sizing: border-box;
    }
    .symbol {
      left: 50%;
      bottom: 25%;
      color: #757575;
      font-size: .12rem;
      position: absolute;
      transform: translate(-50%, 0);
    }
    .stop {
      margin-right: .24rem;
      background: #ea5455;
      box-shadow: 0 2px 5px #ea5455;
    }
  }
  // 有物料的title的样式
  .has-matter {
    display: flex;
    padding-top: .2rem;
    line-height: .14rem;
    justify-content: space-between;
    .title {
      color: #696969;
    }
    .edit {
      color: #333;
    }

  }
</style>
