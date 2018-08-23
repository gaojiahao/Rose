<template>
  <div class="pages kcpd-apply-container">
    <div class="basicPart no_count" ref='fill'>
      <div class='fill_wrapper'>
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
                      <swipeout-button @click.native="delClick(item, index)" type="warn">删除</swipeout-button>
                    </div>
                    <div class="each_mater_wrapper" slot="content">
                      <div class="mater_img">
                        <img :src="item.inventoryPic" alt="mater_img" @error="getDefaultImg(item)">
                      </div>
                      <div class="mater_main">
                        <!-- 物料名称 -->
                        <div class="mater_name">
                          <span class="whiNum">#{{index + 1}}</span>
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
                        <div class="matter-remain">
                          <div class="remain">
                            <span class="symbol">库存: </span>
                            <span class="num">{{item.qtyBal}}</span>
                          </div>
                          <r-number :num="item.tdQty" v-model="item.tdQty"></r-number>
                        </div>
                        <!-- 物料数量和价格 -->
                        <div class="mater_other">
                          <span>差异数量: {{Math.floor(item.tdQty - item.qtyBal)}}</span>
                          <!-- <r-number :num="item.tdQty" v-model="item.tdQty"></r-number> -->
                        </div>
                      </div>
                    </div>
                  </swipeout-item>
                </swipeout>
              </div>
            </div>
          </template>
          <!-- 新增更多 按钮 -->
          <!-- <div class="add_more" v-if="matterList.length" @click="addMatter">新增更多物料</div> -->
          <div class="handle_part" v-if="matterList.length">
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
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class='btn-no-amt vux-1px-t'>
      <!-- <div class="btn-item stop" @click="stopOrder" v-if="this.actions.includes('stop')">终止</div> -->
      <div class="btn-item" @click="save">提交</div>
    </div>
  </div>
</template>

<script>
// vux插件引入
import {Icon, Cell, Group, XInput, Swipeout, SwipeoutItem, SwipeoutButton,} from 'vux'
// 请求 引入
import {getSOList} from 'service/detailService'
import {submitAndCalc, saveAndStartWf, saveAndCommitTask,} from 'service/commonService'
// mixins 引入
import ApplyCommon from './../mixins/applyCommon'
// 组件引入
import RNumber from 'components/RNumber'
import PopMatterList from 'components/Popup/PopMatterList'
import PopWarehouseList from 'components/Popup/PopWarehouseList'
export default {
  mixins: [ApplyCommon],
  components: {
    Icon, Cell, Group, XInput,
    Swipeout, SwipeoutItem, SwipeoutButton,
    PopMatterList, PopWarehouseList, RNumber
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
    // TODO 选中入库仓库
    selWarehouseIn(val) {
      this.warehouseIn = JSON.parse(val);
      this.warehouseParams = {
        ...this.warehouseParams,
        whCode: this.warehouseIn.warehouseCode,
      };
      this.matterList = [];
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
        let mItem = {
          transObjCode: item.inventoryCode, // 物料编码
          thenQtyStock: item.qtyBal, // 可用库存
          tdQty: item.tdQty, // 盘点数量
          differenceNum: Math.floor(item.tdQty - item.qtyBal) || 0,
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
          let operation = saveAndStartWf;
          let formData = {
            creator: this.formData.handler,
            ...this.formData,
            modifer: this.formData.handler,
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
        this.$emit('input', false);
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
  @import './../scss/bizApply';
  .kcpd-apply-container {
    .matter-remain {
      margin-top: .04rem;
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
  }
</style>
