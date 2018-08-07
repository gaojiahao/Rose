<template>
  <div class="pages bdkcdb-apply-container">
    <div class="basicPart">

      <!-- 出库仓库-->
      <pop-warehouse-list title="出库仓库" :default-value="warehouseOut" @sel-item="selWarehouseOut"></pop-warehouse-list>

      <!-- 入库仓库-->
      <pop-warehouse-list title="入库仓库" :default-value="warehouseIn" @sel-item="selWarehouseIn"></pop-warehouse-list>

      <!-- 物料列表 -->
      <div class="materiel_list mg_auto box_sd">
        <!-- 没有选择物料 -->
        <template v-if="!matterList.length">
          <div @click="showMaterielPop = !showMaterielPop">
            <div class="title">物料列表</div>
            <div class="tips">请选择物料</div>
            <x-icon class="r_arrow" type="ios-arrow-right" size="20"></x-icon>
          </div>
        </template>
        <!-- 已经选择了物料 -->
        <template v-else>
          <div class="title">物料列表</div>
          <div class="mater_list">
            <div class="each_mater vux-1px-b" v-for="(item, index) in matterList" :key="index">
              <swipeout>
                <swipeout-item>
                  <div slot="right-menu">
                    <swipeout-button @click.native="delClick(index,item)" type="warn">删除</swipeout-button>
                  </div>
                  <div class="each_mater_wrapper" slot="content">
                    <div class="mater_img">
                      <img :src="item.inventoryPic" alt="mater_img" @error="getDefaultImg(item)">
                    </div>
                    <div class="mater_main">
                      <!-- 物料名称 -->
                      <div class="mater_name">
                        <span class="whiNum">No.{{index + 1}}</span>
                        {{item.inventoryName}}
                      </div>
                      <!-- 物料基本信息 -->
                      <div class="mater_info">
                        <!-- 物料编码、规格 -->
                        <div class="withColor">
                          <!-- 物料编码 -->
                          <div class="ForInline" style="display:inline-block">
                            <div class="mater_code">
                              <span class="title">编码</span>
                              <span class="num">{{item.inventoryCode}}</span>
                            </div>
                          </div>
                          <!-- 物料规格 -->
                          <div class="ForInline" style="display:inline-block">
                            <div class="mater_spec">
                              <span class="title">规格</span>
                              <span class="num">{{item.specification || '无'}}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- 物料数量和价格 -->
                      <div class="mater_other">
                        <span class="matter-remain">库存: {{item.qtyBal}}</span>
                        <r-number :num="item.tdQty" :max="item.qtyBal" v-model="item.tdQty"></r-number>
                      </div>
                    </div>
                  </div>
                </swipeout-item>
              </swipeout>
            </div>
          </div>
        </template>
        <!-- 新增更多 按钮 -->
        <div class="add_more" v-if="matterList.length" @click="addMatter">新增更多物料</div>
        <!-- 物料popup -->
        <pop-matter-list :show="showMaterielPop" v-model="showMaterielPop" @sel-matter="selMatter"
                         :default-value="matterList" get-list-method="getSumInvBalance" :params="warehouseParams"
                         ref="matter"></pop-matter-list>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class='btn vux-1px-t'>
      <div class="cfm_btn" @click="save">提交</div>
    </div>
  </div>
</template>

<script>
  import {Icon, Cell, Group, XInput, Swipeout, SwipeoutItem, SwipeoutButton,} from 'vux'
  import PopMatterList from 'components/PopMatterList'
  import {submitAndCalc, saveAndStartWf, saveAndCommitTask,} from 'service/commonService'
  import ApplyCommon from './../mixins/applyCommon'
  import PopWarehouseList from 'components/PopWarehouseList'
  import RNumber from 'components/RNumber'

  export default {
    mixins: [ApplyCommon],
    components: {
      Icon,
      Cell,
      Group,
      XInput,
      Swipeout,
      SwipeoutItem,
      SwipeoutButton,
      PopMatterList,
      PopWarehouseList,
      RNumber,
    },
    data() {
      return {
        matterList: [],  // 物料列表
        showMaterielPop: false, // 是否显示物料的popup
        transCode: '',
        formData: {
          biComment: '',
        },
        numMap: {},
        warehouseOut: null,
        warehouseIn: null,
        warehouseParams: {
          whCode: '',
        }
      }
    },
    methods: {
      // TODO 滑动删除
      delClick(item, index) {
        let arr = this.matterList;
        arr.splice(index, 1);
        // 删除输入过的价格
        delete this.numMap[item.inventoryCode];
        this.$refs.matter.delSelItem(item);
      },
      // TODO 点击增加更多物料
      addMatter() {
        this.matterList.forEach(item => {
          // 存储已输入的价格
          this.numMap[item.inventoryCode] = item.tdQty;
        });
        this.showMaterielPop = !this.showMaterielPop
      },
      // TODO 选中出库仓库
      selWarehouseOut(val) {
        this.warehouseOut = JSON.parse(val);
        this.warehouseParams = {
          ...this.warehouseParams,
          whCode: this.warehouseOut.warehouseCode,
        };
        this.matterList = [];
      },
      // TODO 选中入库仓库
      selWarehouseIn(val) {
        this.warehouseIn = JSON.parse(val);
      },
      // TODO 选中物料项
      selMatter(val) {
        let sels = JSON.parse(val);
        sels.forEach(item => {
          item.tdQty = this.numMap[item.inventoryCode] || 1
        });
        this.numMap = {};
        this.matterList = [...sels];
      },
      // TODO 获取默认图片
      getDefaultImg(item) {
        let url = require('assets/wl.png');
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
            key: 'warehouseOut',
            message: '出库仓库'
          },
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
          dataSet.push({
            inventoryName_transObjCode: item.inventoryName,
            transObjCode: item.inventoryCode,
            thenQtyStock: item.qtyBal,
            tdQty: item.tdQty,
            assistQty: item.assistQty || 0,
            assMeasureScale: item.assMeasureScale || null,
            assMeasureUnit: item.assMeasureUnit || null,
            comment: item.comment || null,
          });
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
            let operation = submitAndCalc;
            let submitData = {
              listId: '4d9a7f8f-9a88-47b6-a1f4-3faed6423615',
              biComment: '',
              formData: JSON.stringify({
                ...this.formData,
                creator: this.transCode ? this.formData.handler : '',
                modifer: this.transCode ? this.formData.handler : '',
                containerOutWarehouseManager: this.warehouseOut.containerOutWarehouseManager || null, // 出库管理员
                containerInWarehouseManager: this.warehouseIn.containerInWarehouseManager || null, // 入库管理员
                inPut: {
                  containerCodeOut: this.warehouseOut.warehouseCode,
                  containerCode: this.warehouseIn.warehouseCode,
                  dataSet
                }
              }),
            };

            if (this.transCode) {
              operation = saveAndCommitTask
            }
            console.log(submitData)
            this.saveData(operation, submitData);
          }
        });
      },
    },
    created() {
    },
  }
</script>

<style lang="scss" scoped>
  @import './../scss/bizApply';

  .bdkcdb-apply-container {
    .matter-remain {
      color: #757575;
      font-size: 0.12rem;
    }
  }
</style>
