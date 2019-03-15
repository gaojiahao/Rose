<template>
  <div class="pages" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon @search='searchList'></searchIcon>
        <div class="filter_part">
          <tab-item :tabVal="listView" @tab-click='tabClick'></tab-item>
        </div>
      </div>
      <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <!-- 库位库存表 -->
        <template v-if="activeTab.includes('库位库存')">
          <div class="classification-item-wrapper" v-for='(item, index) in listData' :key='index' @click="getFlow(item)">
            <div class="classification-header-wrapper">
              <img class="classification_img" :src="item.inventoryPic" alt="icon">
              <div class="classification_app">
                <div class="app_top">
                  <div class="app_name">{{item.inventoryName}}</div>
                  <div class="app_flow">{{item.invProcessing}}</div>
                </div>
                <div class="classification_detail_item">
                  <span class="classification_detail_title">物料编码: </span>{{item.matCode}}
                </div>
                <div class="classification_detail_item">
                  <span class="classification_detail_title">产品规格: </span>{{item.specification || '无'}}
                  <span class="classification_detail_title">主计量单位: </span>{{item.measureUnit || '无'}}
                </div>
              </div>
            </div>
            <div class="classification-split"></div>
            <div class="mater-info">
              <div class="mater_detail">
                <div class="mater">
                  <span class="title">仓库名称: </span>{{item.warehouseName || '暂无'}}
                </div>
                <div class="mater">
                  <span class="title">仓库编码: </span>{{item.whCode || '无'}}
                </div>
                <div class="mater">
                  <span class="title">仓库关系类型: </span>{{item.warehouseType || '无'}}
                </div>
                <template>
                </template>
                <div class="mater">
                  <span class="title">库位名称: </span>{{item.storehouseName || '无'}}
                </div>
                <div class="mater">
                  <span class="title">库位编码: </span>{{item.storehouseCode || '无'}}
                </div>
              </div>
              <div class="mater_amt_wrapper">
                <div class="mater_amt">{{item.qtyBalance | numberComma}}
                </div>
                <div class="text">数量余额</div>
              </div>
            </div>
            <div class="classification-split"></div>
            <div class="classification-bottom">
              <div class="classification_bottom_item days">
                <div class="classification_bottom_value">{{item.drQty || 0 | numberComma}}</div>
                <div class="classification_bottom_title">增加数量</div>
              </div>
              <div class="classification_bottom_item">
                <div class="classification_bottom_value">{{item.crQty || 0 | numberComma }}</div>
                <div class="classification_bottom_title">减少数量</div>
              </div>
              <div class="classification_bottom_item amt noticed">
                <div class="classification_bottom_value">
                  {{item.qtyLocked | numberComma}}
                </div>
                <div class="classification_bottom_title">工作流占用</div>
              </div>
            </div>
          </div>
        </template>
        <!-- 库存表 -->
        <template v-else-if="activeTab.includes('库存')">
          <div class="classification-item-wrapper" v-for='(item, index) in listData' :key='index'>
            <div class="classification-header-wrapper">
              <img class="classification_img" :src="item.inventoryPic" alt="icon">
              <div class="classification_app">
                <div class="app_top">
                  <div class="app_name">{{item.inventoryName}}</div>
                  <div class="app_flow">{{item.invProcessing}}</div>
                </div>
                <div class="classification_detail_item">
                  <span class="classification_detail_title">物料编码: </span>{{item.matCode}}
                </div>
                <div class="classification_detail_item">
                  <span class="classification_detail_title">产品规格: </span>{{item.specification || '无'}}
                  <span class="classification_detail_title">主计量单位: </span>{{item.measureUnit || '无'}}
                </div>
                <div class="classification_detail_item">
                  <span class="classification_detail_title">仓库名称: </span>{{item.warehouseName || '无'}}
                </div>
                <div class="classification_detail_item">
                  <span class="classification_detail_title">仓库编码: </span>{{item.whCode || '无'}}
                </div>
                <div class="classification_detail_item">
                  <span class="classification_detail_title">仓库关系类型: </span>{{item.warehouseType || '无'}}
                </div>
              </div>
            </div>
            <div class="classification-split"></div>
            <div class="classification-bottom">
              <div class="classification_bottom_item days">
                <div class="classification_bottom_value">{{item.drQty || 0 | numberComma}}</div>
                <div class="classification_bottom_title">入库数量</div>
              </div>
              <div class="classification_bottom_item">
                <div class="classification_bottom_value">{{item.crQty || 0 | numberComma }}</div>
                <div class="classification_bottom_title">出库数</div>
              </div>
              <div class="classification_bottom_item amt noticed">
                <div class="classification_bottom_value">
                  {{item.qtyBalance | numberComma}}
                </div>
                <div class="classification_bottom_title">在库库存</div>
              </div>
            </div>
            <div class="classification-bottom">
              <div class="classification_bottom_item days noticed">
                <div class="classification_bottom_value">{{item.orderQtyLocked || 0 | numberComma }}</div>
                <div class="classification_bottom_title">计划占用</div>
              </div>
              <div class="classification_bottom_item noticed">
                <div class="classification_bottom_value">{{item.qtyLocked || 0 | numberComma}}</div>
                <div class="classification_bottom_title">工作流占用</div>
              </div>
              <div class="classification_bottom_item amt noticed">
                <div class="classification_bottom_value">
                  {{item.useAbleQtyBalance | numberComma}}
                </div>
                <div class="classification_bottom_title">可用库存</div>
              </div>
            </div>
          </div>
        </template>
        <!-- 核销余额表 -->
        <template v-else-if="activeTab.includes('核销余额')">
          <div class="classification-item-wrapper" v-for='(item, index) in listData' :key='index'>
            <div class="classification-header-wrapper">
              <img class="classification_img" :src="item.inventoryPic" alt="icon">
              <div class="classification_app">
                <div class="app_top">
                  <div class="app_name">{{item.inventoryName}}</div>
                  <div class="app_flow">{{item.invProcessing}}</div>
                </div>
                <div class="classification_detail_part">
                  <div class="classification_detail_item">
                    <span class="classification_detail_title">实例编码: </span>{{item.baseTransCode}}
                  </div>
                  <div class="classification_detail_item">
                    <span class="classification_detail_title">应用名称: </span>{{item.appTitle}}
                  </div>
                  <div class="classification_detail_item">
                    <span class="classification_detail_title">应用类型: </span>{{item.transName}}
                  </div>
                  <div class="classification_detail_item">
                    <span class="classification_detail_title">记账日期与时间: </span>{{item.effectiveTime | dateFormat('YYYY-MM-DD')}}
                  </div>
                </div>
                <div class="classification_detail_part">
                  <div class="classification_detail_item">
                    <span class="classification_detail_title">物料编码: </span>{{item.matCode}}
                  </div>
                  <div class="classification_detail_item">
                    <span class="classification_detail_title">产品规格: </span>{{item.specification || '无'}}
                    <span class="classification_detail_title">主计量单位: </span>{{item.measureUnit || '无'}}
                  </div>
                  <div class="classification_detail_item">
                    <span class="classification_detail_title">保质期天数: </span>{{item.keepingDays}}
                    <span class="classification_detail_title">质龄: </span>{{item.qualityAge}}
                    <span class="classification_detail_title">临保: </span>{{item.nearKeepingDays}}
                  </div>
                  <div class="classification_detail_item">
                    <span class="classification_detail_title">生产日期: </span>{{item.productionDate | dateFormat('YYYY-MM-DD')}}
                    <span class="classification_detail_title">到期日期: </span>{{item.validUntil | dateFormat('YYYY-MM-DD')}}
                  </div>
                </div>
                <div class="classification_detail_part">
                  <div class="classification_detail_item">
                    <span class="classification_detail_title">入库数: </span>{{item.drQty || 0 | numberComma}}
                    <span class="classification_detail_title">出库数: </span>{{item.crQty || 0 | numberComma}}
                    <span class="classification_detail_title">工作流占用: </span>{{item.qtyLocked || 0 | numberComma}}
                    <span class="classification_detail_title">计划占用: </span>{{item.orderQtyLocked || 0 | numberComma}}
                  </div>
                  <div class="classification_detail_item">
                    <span class="classification_detail_title">可用库存: </span>{{item.qtyBalance || 0 | numberComma}}
                    <span class="classification_detail_title">账龄天数: </span>{{item.accountAge || 0 | numberComma}}
                    <span class="classification_detail_title">库龄天数: </span>{{item.libraryAge || 0 | numberComma}}
                  </div>
                </div>
              </div>
            </div>
            <div class="classification-split"></div>
            <div class="mater-info">
              <div class="mater_detail">
                <div class="mater">
                  <span class="title">仓库名称: </span>{{item.warehouseName || '暂无'}}
                </div>
                <div class="mater">
                  <span class="title">仓库编码: </span>{{item.whCode || '无'}}
                </div>
                <div class="mater">
                  <span class="title">仓库关系类型: </span>{{item.warehouseType || '无'}}
                </div>
              </div>
              <div class="mater_amt_wrapper">
                <div class="mater_amt">{{item.isNearKeeping}}
                </div>
                <div class="text">是否临保</div>
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="activeTab.includes('加工在制')">
          <div class="classification-item-wrapper" v-for='(item, index) in listData' :key='index'>
            <div class="classification-header-wrapper">
              <img class="classification_img" :src="item.inventoryPic" alt="icon">
              <div class="classification_app">
                <div class="app_top">
                  <div class="app_name">{{item.inventoryName}}</div>
                  <div class="app_flow">{{item.invProcessing}}</div>
                </div>
                <div class="classification_detail_item">
                  <span class="classification_detail_title">物料编码: </span>{{item.matCode}}
                </div>
                <div class="classification_detail_item">
                  <span class="classification_detail_title">产品规格: </span>{{item.specification || '无'}}
                  <span class="classification_detail_title">主计量单位: </span>{{item.measureUnit || '无'}}
                </div>
                <div class="classification_detail_item">
                  <span class="classification_detail_title">仓库名称: </span>{{item.warehouseName || '无'}}
                </div>
                <div class="classification_detail_item">
                  <span class="classification_detail_title">仓库编码: </span>{{item.whCode || '无'}}
                </div>
                <div class="classification_detail_item">
                  <span class="classification_detail_title">仓库关系类型: </span>{{item.warehouseType || '无'}}
                </div>
              </div>
            </div>
            <div class="classification-split"></div>
            <div class="classification-bottom">
              <div class="classification_bottom_item days">
                <div class="classification_bottom_value">{{item.drQty || 0 | numberComma}}</div>
                <div class="classification_bottom_title">入库数量</div>
              </div>
              <div class="classification_bottom_item">
                <div class="classification_bottom_value">{{item.crQty || 0 | numberComma }}</div>
                <div class="classification_bottom_title">出库数</div>
              </div>
              <div class="classification_bottom_item amt">
                <div class="classification_bottom_value">
                  {{item.orderQtyLocked || 0 | numberComma}}
                </div>
                <div class="classification_bottom_title">计划占用</div>
              </div>
            </div>
            <div class="classification-bottom">
              <div class="classification_bottom_item days noticed">
                <div class="classification_bottom_value">{{item.qtyBalance || 0 | numberComma }}</div>
                <div class="classification_bottom_title">可用库存</div>
              </div>
              <div class="classification_bottom_item noticed">
                <div class="classification_bottom_value">{{item.qtyLocked || 0 | numberComma}}</div>
                <div class="classification_bottom_title">工作流占用</div>
              </div>
              <div class="classification_bottom_item amt">
                <div class="classification_bottom_value">
                  {{item.amountBalance | numberComma}}
                </div>
                <div class="classification_bottom_title">金额余额</div>
              </div>
            </div>
          </div>
        </template>
      </r-scroll>
      <!-- 展开状态 -->
      <div v-transfer-dom>
        <popup v-model="flowShow" position="bottom" height="80%">
          <r-scroll class="flow_list_wrapper" ref="flowListWrapper"
                    :options="FlowScrollOptions" :has-next="FlowHasNext"
                    :no-data="!FlowHasNext && !flowData.length" @on-pulling-up="onPullingUpFlow">
            <div class="flow">
              <div class='flow_top'>
                <div class="title">流水详情</div>
                <div class="name">
                  {{flowTitle.inventoryName}}<span class="symbol">[{{flowTitle.invProcessing}}]</span>
                </div>
              </div>
              <div class="flow_list">
                <div class='each_flow' v-for='(Fitem,Findex) in flowData' :key="Findex" @click.stop="Fitem.showList = !Fitem.showList">
                  <!--展开状态-->
                  <div class="duty_top">
                    <!-- 实例编码 -->
                    <div class='transCode'>
                      <span class="order_title">编码</span>
                      <span class="order_num">{{Fitem.transCode}}</span>
                    </div>
                    <!-- 时间 -->
                    <div class="time">
                      {{Fitem.calcTime | dateFormat}}
                    </div>
                  </div>

                  <!-- 数量，金额 -->
                  <div class='show_list'>
                    <!-- 应用名称 -->
                    <div class="app_name">
                      {{Fitem.appTitle}}<span class="symbol">[应用]</span>
                    </div>
                    <div class="num_info">
                      <!-- 数量 -->
                      <div class="count">
                        <div class="num_part" v-if='Fitem.drQty>0'>
                          <span class="symbol">本次数量: </span>
                          <span class="number_incre">+ {{Fitem.drQty}}</span>
                        </div>
                        <div class="num_part" v-else-if='Fitem.crQty>0'>
                          <span class="symbol">本次数量: </span>
                          <span class="number_redu">- {{Fitem.crQty}}</span>
                        </div>
                        <div class="num_part" v-else>
                          <span class="symbol">本次数量: </span>
                          <span>不变</span>
                        </div>
                      </div>
                      <!-- 金额 -->
                      <div class="amount_money">
                        <div class="num_part" v-if='Fitem.drAmnt>0'>
                          <span class="symbol">本次金额: </span>
                          <span class="number_incre">+ {{Fitem.drAmnt}}</span>
                        </div>
                        <div class="num_part" v-else-if='Fitem.crAmnt>0'>
                          <span class="symbol">本次金额: </span>
                          <span class="number_redu">- {{Fitem.crAmnt}}</span>
                        </div>
                        <div class="num_part" v-else>
                          <span class="symbol">本次金额: </span>
                          <span>不变</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="summary_part vux-1px-t">
                    <div class="number">
                      <span class="symbol">当前数量: </span>{{Fitem.qtyBalance}}
                    </div>
                    <div class="price">
                      <span class="symbol">当前余额: ￥</span>{{Fitem.amountBalance}}
                    </div>
                  </div>
                </div>
                <div>
                </div>
              </div>
            <!-- <div class="btn" v-if='flowData.length >= 3'>
              <span class="cfm_btn" @click="flowShow = false">关闭</span>
            </div> -->
            </div>
          </r-scroll>
          <div class="btn when_less">
            <span class="cfm_btn" @click="flowShow = false">关闭</span>
          </div>

        </popup>
      </div>
    </div>
  </div>
</template>

<script>
import listCommon from 'mixins/kmListCommon'
import TabItem from 'components/public/sub-tab'
export default {
  data() {
    return {
      uniqueId : 1400,
    }
  },
  components:{
    TabItem
  },
  mixins: [listCommon]
}
</script>

<style lang='scss' scoped>
  @import '~scss/subject/subList';
  .classification-item-wrapper {
    color: #333;
    margin: .1rem;
    position: relative;
    border-radius: 4px;
    background: #FFF;
    padding: .2rem .15rem;
    box-sizing: border-box;
    width: calc(100% - .2rem);
    box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.1);
    .classification-header-wrapper {
      display: flex;
      .classification_img {
        width: .5rem;
        height: .5rem;
        border-radius: .04rem;
      }
      .classification_app {
        flex: 1;
        margin-left: .12rem;
      }
      .app_top {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .app_name {
        line-height: .18rem;
        font-size: .14rem;
        font-weight: bold;
      }
      .app_flow {
        padding: .04rem .06rem;
        line-height: .12rem;
        border: 1px solid;
        border-radius: .04rem;
        font-size: .1rem;
        &.cashOut {
          color: #FB880B;
        }
        &.cashIn {
          color: #00D38B;
        }
      }
      .iconfont {
        font-size: .1rem;
        font-weight: bold;
      }
      .classification_detail_part {
        & + .classification_detail_part {
          margin-top: .12rem;
        }
      }
      .classification_detail_item {
        margin-top: .1rem;
        line-height: .12rem;
        font-size: .12rem;
        & + .classification_detail_item {
          margin-top: .08rem;
        }
      }
      .classification_detail_title {
        color: #696969;
        & + .classification_detail_title {
          margin-left: .06rem;
        }
      }
    }

    /* 分割线 */
    .classification-split {
      position: relative;
      margin: .17rem 0 .12rem;
      height: 1px;
      border-top: 1px dashed #DEDFE6;
    }

    .mater-info {
      display: flex;
      justify-content: space-between;
      .mater_detail {
        flex: 1;
      }
      .mater {
        line-height: .18rem;
        font-size: .12rem;
        .title {
          color: #999;
        }
        & + .mater {
          margin-top: .02rem;
        }
        span {
          & + span {
            margin-left: .06rem;
          }
        }
      }
      .mater_amt_wrapper {
        text-align: center;
      }
      .mater_amt {
        line-height: .17rem;
        color: #FA7138;
        font-size: .18rem;
        font-weight: 600;
      }
      .symbol {
        font-size: .12rem;
      }
      .text {
        margin-top: .08rem;
        line-height: .12rem;
        color: #999;
        font-size: .12rem;
      }
    }

    .mater-name {
      font-weight: 600;
      font-size: .14rem;
      line-height: .18rem;
    }
    .flow-info {
      margin-top: .12rem;
      line-height: .12rem;
      font-size: .12rem;
      .flow_info_item {
        display: flex;
        & + .flow_info_item {
          margin-top: .08rem;
        }
        /* 账户大类 */
        .flow_account_sub {
          margin-left: .1rem;
          .title {
            color: #696969;
          }
        }
        .title {
          color: #999;
        }
      }
    }
    .classification-bottom {
      font-size: .12rem;
      text-align: center;
      position: relative;
      line-height: .12rem;
      .classification_bottom_item {
        &.days, &.amt {
          position: absolute;
        }
        &.days {
          left: 0;
        }
        &.amt {
          top: -1px;
          right: 0;
        }
        &.noticed {
          .classification_bottom_value {
            font-weight: bold;
            font-size: .16rem;
          }
        }
      }
      .classification_bottom_value {
        font-size: .14rem;
      }
      .classification_bottom_title {
        margin-top: .08rem;
        color: #999;
      }
      .symbol {
        font-size: .12rem;
      }
      & + .classification-bottom {
        margin-top: .2rem;
      }
    }
  }


</style>
