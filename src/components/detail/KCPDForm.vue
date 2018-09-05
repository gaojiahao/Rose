<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.inPut'>
      <div class="swiper-container">
        <!-- 如果需要分页器 -->
        <div class="swiper-pagination" v-if='HasValRealted'></div>
        <div class="swiper-wrapper">
          <div class="swiper-slide">
            <div class='related_tips' v-if='HasValRealted' @click="getSwiper">
              <span>其他应用里存在与本条相关联的数据，快去看看</span>
              <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
            </div>
            <!-- 经办信息 （订单、主体等） -->
            <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
            <!-- 工作流 -->
            <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName"
                       :is-my-task="isMyTask"
                       :no-status="orderInfo.biStatus"></work-flow>
            <!-- 仓库信息 -->
            <div class="contacts_part">
              <!-- 入库 -->
              <warehouse-content :warehouse="warehouseIn"></warehouse-content>
            </div>
            <!-- 物料列表 -->
            <div class="materiel_list">
              <div class="title">物料列表</div>
              <div class="mater_list">
                <matter-item :item="item" :class="{'vux-1px-b' : index !==  orderInfo.inPut.dataSet.length - 1}"
                             v-for="(item, index) in orderInfo.inPut.dataSet" :key='index'>
                  <!-- 物料数量和价格 -->
                  <div class='mater_other' slot="other">
                    <div class='mater_num'>
                      <span class="num">
                        <span class="symbol">盘点数量: </span>
                        {{item.tdQty}}
                      </span>
                      <span class="num">
                        <span class="symbol">差异数量: </span>
                        {{item.differenceNum}}
                      </span>
                    </div>
                  </div>
                </matter-item>
              </div>
            </div>
            <!-- 审批操作 -->
            <r-action :code="transCode" :task-id="taskId" :actions="actions"
                      @on-submit-success="submitSuccessCallback"></r-action>
          </div>
          <div class="swiper-slide" v-if='HasValRealted'>
            <div class='related_apply'>
              <div class="big_title">
                <p class="vux-1px-b">相关实例</p>
              </div>
              <div class="relevant_list">
                <div class="each_app vux-1px-b" v-for='(item,index) in RelatedAppList' :key="index"
                     @click="getRelatedData(item)">
                  <div class="app_info">
                    <div class="title">业务应用</div>
                    <div class="app_name">
                      <span>{{item.listName}}</span>
                    </div>
                    <div class="msg_num">
                      {{item.itemCount}}
                      <span class="msg_tx">关联</span>
                    </div>
                    <div class="r_arrow" v-if='item.itemCount>0'>
                      <x-icon type="ios-arrow-right" size="20"></x-icon>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <pop-related-list :show='showPop' :listId='listId' :filter='filtersData' v-model='showPop'
                          @reload-page='reloadPage'></pop-related-list>
      </div>
    </div>
  </div>
</template>

<script>
  // 请求 引入
  import {getSOList,} from 'service/detailService'
  // mixins 引入
  import detailCommon from 'components/mixins/detailCommon'
  // 组件 引入
  import RAction from 'components/RAction'
  import workFlow from 'components/workFlow'
  import PopWarehouseList from 'components/Popup/PopWarehouseList'
  import PopRelatedList from 'components/Popup/PopRelatedList'
  import WarehouseContent from 'components/detail/commonPart/WarehouseContent'
  import MatterItem from 'components/detail/commonPart/MatterItem'

  export default {
    data() {
      return {
        warehouseIn: {}, // 入库仓库详情
        formViewUniqueId: '064e455d-4277-473a-9e54-d9ae4b1f23be'
      }
    },
    mixins: [detailCommon],
    components: {
      workFlow,
      PopWarehouseList,
      RAction,
      PopRelatedList,
      WarehouseContent,
      MatterItem,
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
      // 获取详情
      getOrderList(transCode = '') {
        return getSOList({
          formViewUniqueId: this.formViewUniqueId,
          transCode
        }).then(data => {
          // http200时提示报错信息
          if (data.success === false) {
            this.$vux.alert.show({
              content: '抱歉，数据有误，暂无法查看',
              onHide: () => {
                this.$router.back();
              }
            });
            return;
          }
          let {inPut = {}} = data.formData;
          let {dataSet} = inPut;
          for (let val of dataSet) {
            val.inventoryPic = val.inventoryPic_transObjCode
              ? `/H_roleplay-si/ds/download?url=${val.inventoryPic_transObjCode}&width=400&height=400`
              : this.getDefaultImg();
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
          this.orderInfo = data.formData;
          this.workFlowInfoHandler();
        })
      },
    }
  }
</script>

<style lang='scss' scoped>
  @import './../scss/bizDetail';

  .contacts_part {
    margin-bottom: .1rem;
    padding: .06rem .1rem 0;
    width: 100%;
    background: #fff;
    box-sizing: border-box;
  }

  .mater_other {
    .mater_num {
      .num {
        color: #5077aa;
        font-size: .16rem;
        font-weight: bold;
        .symbol {
          color: #757575;
        }
      }
    }
  }
</style>
