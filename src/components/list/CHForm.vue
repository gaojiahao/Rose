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
      <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <div class='each_duty' v-for='(item,index) in listData' :key='index' @click="getFlow(item)">
          <div class="duty_top">
              <!-- 表单状态 及 编码 -->
              <div class="warehouse_info">
                <!-- 状态 -->
                <span class="warehouse warehouse_name" >仓库编码</span>
                <!-- 编码 -->
                <span class="warehouse warehouse_code">{{item.whCode}}</span>
              </div>
              <!-- 时间 -->
              <div class="warehouse_type">
               {{item.warehouseRelType}}
              </div>
          </div>
          <div class='matter'>
            <div class='matter_name'>{{item.inventoryName}}</div>
            <div class='matter_processing'>
              <!-- 数量余额 -->
              <div class="ForInline" style="display:inline-block">
                <div class="mater_code">
                  <span class="title">数量余额</span>
                  <span class="num">{{item.qtyBalance}}</span>
                </div>
              </div>
            </div>
          </div>
          <!-- 收起状态 -->
          <div class='r-arrow vux-1px-t' v-if='!item.status'>
            <x-icon type="ios-arrow-down" size="30"></x-icon>
          </div>
        </div>
      </r-scroll>
      <!-- 展开状态 -->
      <div v-transfer-dom>
        <popup v-model="flowShow" position="bottom" height="100%">
          <div class="flow">
            <div class='flow_top'>
              <div class="title">流水详情</div>
              <div class="name">{{flowTitle.warehouseName}}-{{flowTitle.inventoryName}}[{{flowTitle.invProcessing}}]</div>
            </div>
            <div class="flow_list">
              <div class='each_flow' v-for='(Fitem,Findex) in flowData' :key="Findex" @click.stop="Fitem.showList = !Fitem.showList">
                <!--展开状态-->
                <!-- 实例编码 -->
                <div class='transCode vux-1px-b'>{{Fitem.transCode}}</div>
                <!-- 数量，金额 -->
                <div class='show_list'>
                  <div class="num">
                    <span>{{Fitem.appTitle}}</span>
                    <span v-if='Fitem.drQty>0'>+{{Fitem.drQty.toFixed(2)}}</span>
                    <span v-else-if='Fitem.crQty>0'>-{{Fitem.crQty.toFixed(2)}}</span>
                    <span v-else>0</span>
                  </div>
                  <div class="num">
                    <span>{{Fitem.calcTime | dateFormat}}</span>
                    <span>￥{{Fitem.amntBalance}}</span>
                  </div>
                </div>
                <!--收起的每个流水明细-->
                <div class='hidden_list' v-if='Fitem.showList'>
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
                </div>
                
                
              </div>
              <div>
              </div>                 
            </div>
          </div>
          <div class="btn">
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
</style>
