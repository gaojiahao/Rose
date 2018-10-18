<template>
  <div class="pages kcpd-apply-container">
    <div class="basicPart no_count" ref='fill'>
      <div class='fill_wrapper'>
        <!-- 入库仓库-->
        <pop-warehouse-list title="仓库名称" :default-value="warehouseIn" @sel-item="selWarehouseIn"></pop-warehouse-list>

        <!-- 物料列表 -->
        <div class="materiel_list">
          <!-- 没有选择物料 -->
          <template v-if="!matterList.length">
            <div @click="showMaterielPop = !showMaterielPop">
              <div class="title">物料列表</div>
              <div class="tips">请选择物料</div>
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
              <div class="each_mater" :class="{mater_delete : matterModifyClass,'vux-1px-b' : index < matterList.length-1}"
                   v-for="(item, index) in matterList" :key="index">
                <matter-item :item="item" @on-modify="modifyMatter(item,index)" :show-delete="matterModifyClass"
                             @click.native="delClick(index, item)">
                  <template slot-scope="{item}" slot="info">
                    <!--单位，属性，颜色-->
                    <div class="mater_more">
                      <span class="processing">属性: {{item.processing}}</span>
                      <span class='mater_color'>颜色: {{item.inventoryColor || '无'}}</span>
                      <span class='unit'>单位: {{item.measureUnit}}</span>
                    </div>
                    <div class="mater_more">
                      <span class="symbol">账存数量: {{item.qtyBal}}</span>
                    </div>
                    <div class='mater_num' v-show="item.tdQty">
                      盘点数量: <span class="num">{{item.tdQty}}</span>
                      差异数量: <span class="diff_num">{{item.differenceNum}}</span>
                    </div>
                  </template>
                  <template slot="edit" slot-scope="{item}">
                    <div class='mater_other' @click="modifyMatter(item,index)" v-if="!item.tdQty && !matterModifyClass">
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
                           :default-value="matterList" get-list-method="getSumInvBalance" :params="warehouseParams"
                           ref="matter"></pop-matter-list>
        </div>
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <!--物料编辑pop-->
        <pop-matter :modify-matter='matter' :show-pop="showMatterPop" @sel-confirm='selConfirm' v-model='showMatterPop'
                    :btn-is-hide="btnIsHide" :is-show-amount="false">
          <template slot="modify" slot-scope="{modifyMatter}">
            <x-input title="盘点数量" type="number" v-model='modifyMatter.tdQty' text-align="right"
                     @on-blur="checkAmt(modifyMatter)" placeholder="请输入" @on-focus="getFocus($event)"></x-input>
            <cell title="差异数量" text-align='right' placeholder='请填写'
                  :value="modifyMatter.differenceNum"
                  :class='{high_light : modifyMatter.differenceNum !== 0}'></cell>
          </template>
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
import {Icon, Cell, Group, XInput,XTextarea} from 'vux'
// 请求 引入
import {getSOList} from 'service/detailService'
import {submitAndCalc, saveAndStartWf, saveAndCommitTask,} from 'service/commonService'
// mixins 引入
import ApplyCommon from 'pageMixins/applyCommon'
// 组件引入
import PopMatterList from 'components/Popup/PopMatterList'
import PopWarehouseList from 'components/Popup/PopWarehouseList'
import PopMatter from 'components/apply/commonPart/MatterPop'


// 方法引入
import {accSub} from '@/home/pages/maps/decimalsAdd'
export default {
  mixins: [ApplyCommon],
  components: {
    Icon, Cell, Group, XInput,XTextarea,
    PopMatterList, PopWarehouseList, PopMatter
  },
  data() {
    return {
      listId: 'edf7b34b-8916-410f-801f-2db7e97efbde',
      matterList: [],  // 物料列表
      showMaterielPop: false, // 是否显示物料的popup
      transCode: '',
      formData: {
        biComment: '',
      },
      numMap: {},
      warehouseIn: null,
      warehouseParams: {
        whCode: '',
      },
      matter:{},
      showMatterPop :false,
      modifyIndex:null,
    }
  },
  watch: {
    matterList(val) {
      if (val.length) {
        let data = {
          KCPD_DATA: {
            matter: this.matterList,
            warehouseIn: this.warehouseIn
          }
        };
        this.$emit('sel-data', data)
      }
    },
    matter:{
      handler(val) {
        val.differenceNum = accSub(val.tdQty, val.qtyBal);
      },
      deep:true
    },
  },
  methods: {
    // 滑动删除
    delClick(index, sItem) {
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
    //全选
    checkAll(){
      if(this.selItems.length === this.matterList.length){
        this.selItems = [];
        return
      }
      this.selItems = JSON.parse(JSON.stringify(this.matterList));
    },
    //删除选中的
    deleteCheckd(){
      this.$vux.confirm.show({
        content: '确认删除?',
        // 确定回调
        onConfirm: () => {
          this.selItems.forEach(item=>{
            let index = this.matterList.findIndex(item2=>item2.inventoryCode === item.inventoryCode);
            if(index >= 0){
              this.matterList.splice(index,1);
            }
          })
          this.selItems = [];
          this.matterModifyClass = false;
        }
      })

    },
    // TODO 点击增加更多物料
    addMatter() {
      this.matterList.forEach(item => {
        // 存储已输入的价格
        this.numMap[item.inventoryCode] = item.tdQty;
      });
      this.showMaterielPop = !this.showMaterielPop
    },
    // TODO 选中入库仓库
    selWarehouseIn(val) {
      this.warehouseIn = JSON.parse(val);
      this.warehouseParams = {
        ...this.warehouseParams,
        whCode: this.warehouseIn.warehouseCode,
      };
      this.matterList = [];
    },
    // TODO 显示物料修改的pop
    modifyMatter(item, index) {
      this.matter = JSON.parse(JSON.stringify(item));
      this.showMatterPop = true;
      this.modifyIndex = index;
    },
    // TODO 更新修改后的物料信息
    selConfirm(val) {
      let modMatter = JSON.parse(val);
      this.$set(this.matterList, this.modifyIndex, modMatter);
    },
    // TODO 选中物料项
    selMatter(val) {
      let sels = JSON.parse(val);
      sels.forEach(item => {
        item.tdQty = this.numMap[item.inventoryCode] || 0;
        item.differenceNum = accSub(item.tdQty, item.qtyBal);
      });
      this.numMap = {};
      this.matterList = [...sels];
    },
    // TODO 获取默认图片
    getDefaultImg(item) {
      let url = require('assets/wl_default02.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    // TODO 提交
    save() {
      let warn = '';
      let dataSet = [];
      let validateMap = [
        {
          key: 'warehouseIn',
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
        if(!item.tdQty){
          warn = '请填写盘点数量'
          return false
        }
        let mItem = {
          transObjCode: item.inventoryCode, // 物料编码
          thenQtyStock: item.qtyBal, // 可用库存
          tdQty: item.tdQty, // 盘点数量
          differenceNum: item.differenceNum || 0,
          tdProcessing: item.processing,  // 物料加工属性
          assistQty: item.assistQty || 0, // 辅计数量（明细）
          assMeasureScale: item.assMeasureScale || null, // 与主计量单位倍数（明细）
          assMeasureUnit: item.assMeasureUnit || null, // 辅助计量（明细）
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
            containerInWarehouseManager: this.warehouseIn.containerInWarehouseManager || null, // 入库管理员
            inPut: {
              containerCode: this.warehouseIn.warehouseCode,
              dataSet
            }
          };
          let submitData = {
            listId: this.listId,
            biComment: '',
            formData: JSON.stringify(formData),
            wfPara: JSON.stringify({
              [this.processCode]: {
                businessKey: 'STCK',
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
          //无工作流
          if(!this.processCode.length){
            operation = submitAndCalc;
            delete submitData.wfPara;
            delete submitData.biReferenceId;
          }
          console.log(submitData)
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
        let {success = true, formData = {}} = data;
        // http200时提示报错信息
        if (!success) {
          this.$vux.alert.show({
            content: '抱歉，无法支持您查看的交易号，请确认交易号是否正确'
          });
          return;
        }
        let matterList = [];
        // 获取合计
        let {inPut} = formData;
        let {dataSet = []} = inPut;
        for (let item of dataSet) {
          item = {
            ...item,
            qtyBal: item.thenQtyStock,
            inventoryPic: item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
            inventoryName: item.inventoryName_transObjCode,
            // inventoryCode: item.inventoryCode_transObjCode,
            inventoryCode: item.transObjCode,
            specification: item.specification_transObjCode,
            measureUnit: item.measureUnit_transObjCode,
          };
          matterList.push(item);
        }
        // 入库
        this.warehouseIn = {
          warehouseCode: inPut.containerCode,
          warehouseName: inPut.warehouseName_containerCode,
          warehouseType: inPut.warehouseType_containerCode,
          warehouseProvince: inPut.warehouseProvince_containerCode,
          warehouseCity: inPut.warehouseCity_containerCode,
          warehouseDistrict: inPut.warehouseDistrict_containerCode,
          warehouseAddress: inPut.warehouseAddress_containerCode,
        };
        this.warehouseParams = {
          whCode: this.warehouseIn.warehouseCode,
        };
        this.formData = {
          ...this.formData,
          creator: formData.creator,
          biComment: formData.biComment,
        };
        this.biReferenceId = formData.biReferenceId;
        this.matterList = matterList;
        this.$loading.hide();
      })
    },
  },
  created() {
    let data = sessionStorage.getItem('KCPD_DATA');
    if (data) {
      this.matterList = JSON.parse(data).matter;
      this.warehouseIn = JSON.parse(data).warehouseIn
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
    .high_light{
      /deep/ .weui-cell__ft{
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
