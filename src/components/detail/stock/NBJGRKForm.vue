<template>
  <div class="detail_wrapper nbjdgg-detail-container">
    <div class="basicPart" v-if='orderInfo && orderInfo.inPut'>
      <div class='related_tips' v-if='HasValRealted' @click="getSwiper">
        <span>其他应用里存在与本条相关联的数据，快去看看</span>
        <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
      </div>
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <div class="warehouse_part">
        <!-- 出库-->
        <warehouse-content class="vux-1px-b" :warehouse="warehouseOut"></warehouse-content>
        <!-- 入库 -->
        <warehouse-content :warehouse="warehouseIn"></warehouse-content>
      </div>
      <!-- 物料列表 -->
      <matter-list :order-list='orderList'>
         <template slot="matterOther" slot-scope="{item}">
           <div class='mater_other'>
              <div class="mater_attribute">
                <span>计量单位: {{item.measureUnit_transObjCode}}</span>
                <span>可用库存: {{item.thenQtyStock}}</span>
              </div>
             <div class="mater_num">
                <span class="num">
                  本次完工入库: {{item.tdQty | toFixed}}
                </span>
                <span class="units">
                  [待验收余额: {{item.thenQtyBal | toFixed}}]
                </span>
              </div>
           </div>
         </template>
      </matter-list>
      <!-- <div class="materiel_list">
        <div class="title">
          <span class="iconfont icon-Shape"></span>物料列表
        </div>
        <div class="mater_list">
          <div class="each_mater"
               v-for="(oItem, key) in orderList" :key='key'>
            <div class="order_code">
              <span class="order_title">加工订单号</span>
              <span class="order_num">{{key}}</span>
            </div>
            <div class="order_matter">
              <template v-for="(item, index) in oItem">
                <matter-item :class="{'vux-1px-b': item.bom}" :item="item" >
                  
                  <div class="mater_other" slot="other" slot-scope="{item}">
                    <div class="mater_num">
                      <i class="iconfont icon--"></i>
                      <span class="num">{{item.warehouseName_containerCode}}</span>
                    </div>
                    <div class="mater_num">
                      <span class="num">
                        本次完工入库: {{item.tdQty | toFixed}}
                      </span>
                      <span class="units">
                        [待验收余额: {{item.thenQtyBal | toFixed}}]
                      </span>
                      <span class='get_bom' @click="checkBom(item)">查看原料</span>
                    </div>
                  </div>
                </matter-item>
                <bom-list :boms="item.boms"></bom-list>
              </template>
            </div>
          </div>
        </div>
      </div> -->
      <!-- bom合计 -->
      <!-- <div class="bom_list">
        <bom-list :boms="UniqueBom"></bom-list>
      </div> -->
      <div class="comment-part">
        <form-cell :showTopBorder="false" cellTitle='备注' :cellContent="orderInfo.biComment || '无'"></form-cell>
      </div>
      <!--原料bom列表-->
      <!-- <bom-pop :show="bomPopShow" :bomInfo="bom" v-model="bomPopShow" class="bom_pop" :is-edit="false">
      </bom-pop> -->
      <upload-file :default-value="attachment" no-upload :contain-style="uploadStyle" :title-style="uploadTitleStyle"></upload-file>
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions"
                :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>
<script>
  // 请求 引入
  import {getSOList} from 'service/detailService'
  // mixins 引入
  import detailCommon from 'components/mixins/detailCommon'
  import common from 'mixins/common'
  //公共方法引入
  import {accMul,accAdd} from '@/home/pages/maps/decimalsAdd'
  // 组件 引入
  import RAction from 'components/RAction'
  import workFlow from 'components/workFlow'
  import MatterItem from 'components/detail/commonPart/MatterItem'
  import BomList from 'components/detail/commonPart/BomList'
  import FormCell from 'components/detail/commonPart/FormCell'
  import BomPop from 'components/apply/commonPart/BomPop'
  import WarehouseContent from 'components/detail/commonPart/WarehouseContent'
  export default {
    data() {
      return {
        count: 0, // 金额合计
        orderInfo: {}, // 表单内容
        formViewUniqueId: 'a8c58e16-48f5-454e-98d8-4f8f9066e513',
        orderList: {}, // 物料列表
        basicInfo: {}, // 存放基本信息
        DuplicateBoms:[], // 有重复项的bom
        UniqueBom:[], // 合并去重后的bom
        bomPopShow :false, // bom展示
        bom:{}, // bomPop中要展示的bom
        warehouseIn: {}, // 入库仓库详情
        warehouseOut: {}, // 出库仓库详情
      }
    },
    mixins: [detailCommon, common],
    components: {
      workFlow, RAction, MatterItem, BomList, FormCell, BomPop, WarehouseContent
    },
    watch:{
      DuplicateBoms:{
        handler(val){
          var isEqual = (a, b) => a.inventoryCode === b.inventoryCode;
          var getNew = old => old.reduce((acc, cur) => {
              let hasItem = acc.some(e => {
                let temp = isEqual(e, cur);
                if (temp){
                  e.tdQty = accAdd(e.tdQty, cur.tdQty);
                }
                return temp;
              });
              if (!hasItem) acc.push(cur)
              return acc;
          }, []);
          this.UniqueBom = getNew(this.DuplicateBoms);
        }
      }

    },
    methods: {
      //选择默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default02.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      //查看原料
      checkBom(item){
        this.bom = item;
        this.bomPopShow = true;
      },
      // 获取详情
      getOrderList(transCode = '') {
        return getSOList({
          formViewUniqueId: this.formViewUniqueId,
          transCode
        }).then(({success = true, formData = {},attachment = []}) => {
          // http200时提示报错信息
          if (success === false) {
            this.$vux.alert.show({
              content: '抱歉，数据有误，暂无法查看',
              onHide: () => {
                this.$router.back();
              }
            });
            return;
          }
          let orderList = {};
          let {order = {}} = formData;
          this.attachment = attachment;
          // 获取合计
          let {inPut = {}} = formData;
          let {dataSet} = inPut;
          for (let item of dataSet) {
            item.inventoryPic = item.inventoryPic_transObjCode
              ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400`
              : this.getDefaultImg();
            if (item.boms) {
              for (let bom of item.boms) {
                bom.inventoryCode = bom.transObjCode;
                bom.warehouseName = bom.warehouseName_containerCodeOut;
                bom.warehouseCode = bom.containerCodeOut;
                bom.qtyStock = bom.thenQtyStock;
                // 接口返回的tdQty有误，自己手动计算
                bom.tdQty = accMul(bom.bomQty, item.tdQty,(1+bom.bomSpecificLoss));
              }
              this.DuplicateBoms = this.DuplicateBoms.concat(JSON.parse(JSON.stringify(item.boms)));
            }
            
            if (!orderList[item.transMatchedCode]) {
              orderList[item.transMatchedCode] = [];
            }
            orderList[item.transMatchedCode].push(item);
          }
          this.warehouseIn = {
            warehouseCode: inPut.containerCode,
            warehouseName: inPut.warehouseName_containerCode,
            warehouseAction: '入库',
            warehouseIcon: 'icon-ruku',
            warehouseType: inPut.warehouseType_containerCode,
            warehouseProvince: inPut.warehouseProvince_containerCode,
            warehouseCity: inPut.warehouseCity_containerCode,
            warehouseDistrict: inPut.warehouseDistrict_containerCode,
            warehouseAddress: inPut.warehouseAddress_containerCode,
          };
          // 出库
          this.warehouseOut = {
            warehouseCode: inPut.containerCodeOut,
            warehouseName: `${inPut.warehouseName_containerCodeOut}`,
            warehouseAction: '出库',
            warehouseIcon: 'icon-chuku',
            warehouseType: inPut.warehouseType_containerCodeOut,
            warehouseProvince: inPut.warehouseProvince_containerCodeOut,
            warehouseCity: inPut.warehouseCity_containerCodeOut,
            warehouseDistrict: inPut.warehouseDistrict_containerCodeOut,
            warehouseAddress: inPut.warehouseAddress_containerCodeOut,
          };
          this.orderList = orderList;
          this.orderInfo = formData;
          this.workFlowInfoHandler();
        })
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizDetail';

  .nbjdgg-detail-container {
    // 加工订单号
    .order_code {
      display: flex;
      color: #fff;
      font-size: .12rem;
      font-weight: bold;
      > span {
        display: inline-block;
        padding: 0 .04rem;
      }
      .order_title {
        background: #1160aa;
      }
      // 订单号
      .order_num {
        background: #9bb4da;
        border-top-right-radius: .08rem;
      }
    }
    .order_matter {
      .each_cell {
        background-color: #fff;
      }
    }
    .mater_other {
      .mater_num {
        .num {
          color: #111;
          font-size: .14rem;
          font-weight: bold;
          .symbol {
            color: #757575;
          }
        }
      }
    }
    //bom合计
    .bom_list{
      position: relative;
      background: #FFF;
      padding: .06rem .08rem;
      margin-top:0.1rem;
    }
    .comment-part{
      background: #fff;
      padding: .06rem .08rem;
    }
    .get_bom{
      margin-left: 0.2rem;
      font-size: 0.12rem;
      font-weight: bold;
    }
  }
  .bom_pop{
    .number-part {
      display: flex;
      font-size: .1rem;
      text-align: right;
      flex-direction: column;
      .main-number {
        font-size: .12rem;
        font-weight: bold;
        //  color: #757575;
      }
      .number-unit {
        color: #757575;
      }
    }
  }

</style>
