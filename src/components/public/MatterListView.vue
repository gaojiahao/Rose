<template>
  <!-- 物料列表 -->
  <div class="materiel_ct_list">
    <!-- 传入的物料是数组 -->
    <div class="mater_list" v-if="matterList">
      <header class="mater_list_header">
        <div class="mater_list_title vux-1px-l">{{cfg.cName}}明细</div>
      </header>
      <matter-item :columns="columns" :item="item" v-for="(item, index) in matterList" :key='index' @on-show-more="onShowMore(item, index)"
                   v-show="showAllMatter || index < 3"></matter-item>
      <div class="matter-more-wrapper" v-show="matterList.length > 3 && !showAllMatter">
        <div class="matter-more" @click="clickMore('')">
          <span>更多</span>
          <i class="icon-filter-down"></i>
        </div>
      </div>
    </div>
    <pop-matter-detail :show="showMatterDetail" :item="matterDetail" :columns="columns" :dates="dates" :comment="commit" :check-amt="checkAmt" v-model="showMatterDetail" @on-confirm="doDetailEdit"></pop-matter-detail>
    <bom-list-view :boms="uniqueBom" v-if="cfg.bomDataIndexMap"></bom-list-view>
  </div>
</template>

<script>
// vux组件引入
import {numberComma} from 'vux'
// 方法引入
import {toFixed} from '@/plugins/calc'
import Vue from 'vue';
import PopMatterDetail from 'components/public/PopMatterDetail'
var component = {
  props: {
    values: {
      type: Object,
      default() {
        return {}
      }
    },
    cfg: {
      type: Object,
      default() {
        return {}
      }
    },
    btnIsHide: {
        type: Boolean,
        default: false
    },
    checkAmt: {
        type: Function
    }
  },
  components: { PopMatterDetail },
  filters: { toFixed, numberComma },
  data() {
    return {
      orderListMap: {},
      showAllMatter: false,
      showMatterDetail:false,
      matterDetail:{},
      matterDetailIndex:0,
      matterDetailKey:0,
      matterList: {},
      columns:[],
      dates:[],
      commit:null,
      uniqueBom: [],            //合并去重后的bom
    }
  },
  watch: {
    values: {
      handler(val){
        // console.log('cfg',this.cfg);
        // console.log('values',this.values);
        // console.log('name',this.name);
        this.matterList = this.values[this.cfg.name];
        this.getMatterConfig();
      }
    }   
  },
  methods: {
    //获取物料配置
    getMatterConfig() {
      this.uniqueBom = this.values.outPut;
      this.setMatterConfig();
    },
    //设置物料的动态渲染部分
    setMatterConfig() {
      let numTypeList = ['r2Numberfield', 'r2Percentfield', 'r2Permilfield'],
          cfg = this.cfg,
          values = this.values[cfg.name],
          grid = cfg.items && cfg.items[0],//bom没有items
          columns = (grid && grid.columns)||cfg.columns|| []; //grid||bom||[]

      let dataSource = cfg.dataSource || {},
          dataIndexMap = cfg.dataIndexMap || {},
          hasDataIndexMap = !!Object.keys(dataIndexMap).length, // 映射表
          dataSouceCols = dataSource.cols || []; // 数据源列

      let others = [];
      let dates = [];
      let comment;

      columns = columns.filter((item, index) => {
        let isMapItem,
            dataSouceCol;
        
        if(item.hidden) return false;
        // if(hasDataIndexMap){
        //     // 匹配 *映射表字段
        //     isMapItem = dataIndexMap[item.fieldCode];
        //     console.log('isMapItem',isMapItem)
        //     if (isMapItem != null){// 判断是否存在映射关系
        //        // 根据 *数据源* 查询映射表中存在字段 
        //        dataSouceCol = dataSouceCols.find(col => col.k === key);
        //        if (dataSouceCol == null) return false //如果数据源没有相关列映射到该字段，该字段不显示。
        //     }
        // }
        dates.push(item);
        return true;
      });
      this.columns = columns;
      this.dates = dates;
      this.comment = comment;
    },
    onShowMore(item, index, key) {
      this.matterDetail = Vue.clone(item);
      this.showMatterDetail = true;
      this.matterDetailIndex = index;
      if (key) {
        this.matterDetailKey = key;
      }
    },
    doDetailEdit:function(detail){
        this.$emit('on-detailEdit',detail,this.matterDetailIndex,this.matterDetailKey)
    },
    clickMore(key) {
      // 显示更多物料
      if (key) {
        this.orderListMap[key] = true;
      } else {
        this.showAllMatter = true;
      }
    },
  },
  created () {
  }
}
export default Vue.component('MatterListView',component)
</script>
<style scoped lang="scss">
  .materiel_ct_list {
    color: #333;
    margin: .1rem;
    position: relative;
    box-sizing: border-box;
    background-color: #fff;
    width: calc(100% - .2rem);
    //padding: .15rem;
    .mater_list_header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: .15rem 0 0.15rem 0.15rem;
      .mater_list_title {
        line-height: .16rem;
        font-size: 16px;
        font-weight: 600;
        &:before {
          left: -.15rem;
          width: .08rem;
          border-left: .08rem solid #3296FA;
        }
      }
    }
    .title {
      color: #111;
      font-weight: bold;
      font-size: .16rem;
      .icon-Shape {
        font-size: .14rem;
        font-weight: normal;
      }
    }
    .each_mater {
      position: relative;
      box-sizing: border-box;
    }
    .order_code {
      display: flex;
      position: relative;
      padding: .15rem .15rem 0;
      line-height: .16rem;
      color: #999;
      font-size: .12rem;
      > span {
        display: inline-block;
      }
      .order_title {
        position: relative;
        &:before {
          top: 0;
          bottom: 0;
          content: " ";
          width: .08rem;
          left: -.15rem;
          color: #3296FA;
          position: absolute;
          transform-origin: 0 0;
          transform: scaleX(0.5);
          border-left: .08rem solid #3296FA;
        }
      }
      // 订单号
      .order_num {
        color: #696969;
      }
    }
    .matter-more-wrapper {
      display: flex;
      padding-bottom: .15rem;
      justify-content: center;
      .matter-more {
        display: flex;
        font-size: .14rem;
        align-items: center;
        line-height: .14rem;
        padding: .1rem .15rem;
        border-radius: .17rem;
        border: 1px solid rgba(151, 151, 151, 1);
      }
      .icon-filter-down {
        width: .11rem;
        height: .05rem;
        margin-left: .05rem;
        display: inline-block;
      }
    }
  }
</style>