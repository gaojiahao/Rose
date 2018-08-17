<template>
  <div class="pages" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon @search='searchList'></searchIcon>
        <div class="filter_part">
          <tab :line-width='2' default-color='#757575' active-color='#2c2727'>
            <tab-item v-for="(item, index) in listView" :key="index" :selected="index === activeIndex"
                      @on-item-click="tabClick(item, index)">{{item.view_name}}
            </tab-item>
          </tab>
        </div>
      </div>
      <r-scroll class="list_wrapper":options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <div class='each_duty' v-for='(item,index) in listData' :key='index' @click="getFlow(item)">
          <!-- 仓库名称 仓库编码 -->
          <div class="duty_top">
              <!-- 表单状态 及 编码 -->
              <div class="warehouse_info">
                <!-- <span class="warehouse warehouse_code">{{item.warehouseRelType}}</span> -->
                <!-- 状态 -->
                <span class="warehouse warehouse_name">
                  <!-- 仓库编码 -->
                  {{item.warehouseName}}
                </span>
                <!-- 编码 -->
                <span class="warehouse warehouse_code">{{item.whCode}}</span>
              </div>
              <!-- 数量余额 -->
              <div class="mater_code" v-if="item.qtyBalance !== ''">
                <span class="title">数量剩余</span>
                <span class="num">{{item.qtyBalance}}</span>
              </div>      
          </div>
          <!-- 物料 -->
          <div class='matter'>
            <div class='matter_name'>
              {{item.inventoryName}}<span class="type">[{{item.invProcessing}}]</span>
            </div>
          </div>
          <!-- 仓库类型、金额余额等 -->
          <div class='duty_btm vux-1px-t'>
            <!-- 仓库类型 -->
            <div class="ware_type">
              {{item.warehouseRelType}}<span class="type">[类型]</span>
            </div>
            <!-- 余额 -->
            <div class="balance" v-if="item.amountBalance !== ''">
              <span class="symbol">余额: ￥</span>{{item.amountBalance}}
            </div>
            <!-- <x-icon type="ios-arrow-down" size="30"></x-icon> -->
          </div>
        </div>
      </r-scroll>
      <!-- <div class="">哈哈哈

      </div> -->
      <!-- 展开状态 -->
      <div v-transfer-dom>
        <popup v-model="flowShow" position="bottom" height="80%">
          <r-scroll class="list_wrapper" ref="flowListWrapper">
            <div class="flow">
              <div class='flow_top'>
                <div class="title">流水详情</div>
                <div class="name">{{flowTitle.warehouseName}}-{{flowTitle.inventoryName}}[{{flowTitle.invProcessing}}]</div>
              </div>
              <div class="flow_list">
                <div class='each_flow' v-for='(Fitem,Findex) in flowData' :key="Findex" @click.stop="Fitem.showList = !Fitem.showList">
                  <!--展开状态-->
                  
                  <div class="duty_top">
                    <!-- 实例编码 -->
                    <div class='transCode'>
                      <span class="order_title">编码</span>
                      <span class="order_num">{{Fitem.transCode.replace(/_/g,'')}}</span>
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
                          <span class="number_incre">+ {{Fitem.drQty.toFixed(2)}}</span>
                        </div>
                        <div class="num_part" v-else-if='Fitem.drQty>0'>
                          <span class="symbol">本次数量: </span> 
                          <span class="number_incre">- {{Fitem.crQty.toFixed(2)}}</span>
                        </div>
                        <div class="num_part" v-else>
                          <span class="symbol">本次数量: </span> 
                          <span>不变</span>
                        </div>
                      </div>
                      <!-- 金额 -->
                      <div class="amount_money">
                        <div class="num_part" v-if='Fitem.drQty>0'>
                          <span class="symbol">本次金额: </span> 
                          <span class="number_incre">+ {{Fitem.drAmnt.toFixed(2)}}</span>
                        </div>
                        <div class="num_part" v-else-if='Fitem.drQty>0'>
                          <span class="symbol">本次金额: </span> 
                          <span class="number_incre">- {{Fitem.crAmnt.toFixed(2)}}</span>
                        </div>
                        <div class="num_part" v-else>
                          <span class="symbol">本次金额: </span> 
                          <span>不变</span>
                        </div>                    
                      </div>
                    </div>
                  </div>
                  <div class="summary_part vux-1px-t">
                    <!-- <div class="number">
                      <span class="symbol">数量: </span>{{Fitem.qtyBalance}}
                    </div> -->
                    <div class="price">
                      <span class="symbol">余额: ￥</span>{{Fitem.amntBalance}}
                    </div>                
                  </div>
                  <!--收起的每个流水明细-->
                  <!-- <div class='hidden_list' v-if='Fitem.showList'>
                    <div class='each_property' v-for='(HItem,HIndex) in flowField' :key='HIndex'>
                      <label>{{HItem.text}}:</label>
                      <span v-if='HItem.field === "qtyBalance"'>{{Fitem[HItem.field].toFixed(2)}}</span>    
                      <span v-else>{{Fitem[HItem.field]}}</span>                                
                    </div>
                  </div>
                  <div class='r-arrow vux-1px-t'>
                    <p v-if='Fitem.showList'>
                      <x-icon type="ios-arrow-up" size="30" ></x-icon>
                    </p>                     
                    <p v-else>
                      <x-icon type="ios-arrow-down" size="30" ></x-icon>
                    </p>
                  </div> -->
                  
                  
                </div>
                <div>
                </div>                 
              </div>
            </div>
            <div class="btn" v-if='flowData.length>=3'>
              <span class="cfm_btn" @click="flowShow = false">关闭</span>
            </div>
          </r-scroll>
          <div class="btn when_less" v-if='flowData.length < 3'>
            <span class="cfm_btn" @click="flowShow = false">关闭</span>
          </div>
          
        </popup>
      </div>
    </div>
    <handle-load :submit='handleLoadding'></handle-load>
  </div>
</template>

<script>
  import listCommon from './../mixins/kmListCommon'
  import handleLoad from 'components/submitLoading'
  export default {
    data() {
      return {
        uniqueId : 1400,
        showContent : false,
        handleLoadding : false,
      }
    },
    components:{
      handleLoad
    },
    mixins: [listCommon],
    methods: {     

      
    },
    created(){

    }
  }
</script>

<style lang='scss' scoped>
  @import './../scss/SUB/subList';
  .list_wrapper{
    height:100%;
  }
</style>
