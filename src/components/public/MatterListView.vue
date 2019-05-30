<template>
  <!-- 物料列表 -->
  <div class="materiel_ct_list">
    <!-- 传入的物料是数组 -->
    <div class="mater_list" v-if="matterList">
      <matter-item :item="item" v-for="(item, index) in matterList" :key='index' @on-show-more="onShowMore(item, index)"
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
import PopMatterDetail from 'components/Public/PopMatterDetail'
var component = {
  name: 'MatterList',
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
        if(hasDataIndexMap){
            // 匹配 *映射表字段
            isMapItem = dataIndexMap[item.fieldCode];
            if (isMapItem != null){// 判断是否存在映射关系
               // 根据 *数据源* 查询映射表中存在字段 
               dataSouceCol = dataSouceCols.find(col => col.k === key);
               if (dataSouceCol == null) return false //如果数据源没有相关列映射到该字段，该字段不显示。
            }
        }
        if (item.editorType === 'r2Datefield') {
            dates.push(item);
            return false;
        } 
        else if (item.fieldCode === 'comment') {
            comment = item;
           return false
        }
        return true;
      });
      this.columns = columns;
      this.dates = datas;
      this.comment = comment;
    },
    //获取物料配置
    // getMatterConfig(data) {
    //     let {config = [], dataSource = '[]', reconfig = {}} = data;
    //     let matterData = {};
    //     let matterSource = matterData.dataSource && JSON.parse(matterData.dataSource.source) || {};
    //     let matterCols = matterSource.cols || []; // 数据源列
    //     let dataIndexMap = {}; // 映射表
    //     let hasDataIndexMap = false; // 是否存在映射表
    //     let matterConfig = [];
    //     if(dataSource) {
    //         matterData = JSON.parse(dataSource).matterData;
    //     }
    //     config.forEach(item => {
    //         if (!item.hiddenInRun && item.isMultiple) {
    //             if (item.name === 'order' || item.name === 'outPut' || item.name === 'inPut') {
    //                 if (item.r2GridXtype) {
    //                     item.items.forEach(each => {
    //                     each['r2GridXtype'] = item.r2GridXtype;
    //                     })
    //                 }
    //                 if (item.xtype === 'r2BomGridWTSK') {
    //                     item.items.forEach(each => {
    //                     each['isBomGrid'] = true;
    //                     })
    //                 }
    //                 if (item.xtype === 'r2BomGridIPPO') {
    //                     this.uniqueBom = this.formData.outPut;
    //                 }
    //                 matterConfig = item.items;
    //                 dataIndexMap = item.dataIndexMap || {};
    //                 hasDataIndexMap = !!Object.keys(dataIndexMap).length;
    //                 this.matterList = this.formData[item.name];
    //             }
    //             matterConfig = matterConfig.reduce((arr, item, index) => {
    //                 // 匹配 *映射表字段*
    //                 let key = dataIndexMap[item.fieldCode];
    //                 // 根据 *数据源* 查询映射表中存在字段 
    //                 let matchedCol = matterCols.find(col => col.k === key);
    //                 // 判断是否存在映射关系，若有映射关系，则判断是否有该字段且判断字段是否隐藏，没有映射关系则直接展示
    //                 let needShow = key ? (matchedCol ? !item.hidden : false) : true;
    //                 if (matterCols.length) {
    //                     if (!item.hidden && needShow) {
    //                     arr.push(item);
    //                     }
    //                 }
    //                 else {
    //                     if (!item.hidden) {
    //                         arr.push(item) 
    //                     }
    //                 }          
    //                 return arr
    //             }, []);
    //             this.matterConfig = matterConfig;
    //             this.setMatterConfig(this.matterList);
    //         }
    //     });
    // },
    //设置物料的动态渲染部分
    // setMatterConfig(arr) {
    //   let numTypeList = ['r2Numberfield', 'r2Percentfield', 'r2Permilfield'];
    //   let matterConfig = this.matterConfig;
    //   arr.forEach(matter => {
    //     let others = [];
    //     let dates = [];
    //     let matterComment = {};
    //     matterConfig.forEach(item => {
    //       item = {...item};

    //       item.value = numTypeList.includes(item.editorType) 
    //         ? numberComma(matter[item.fieldCode]) || '0' 
    //         : matter[item.fieldCode] || '无';

    //       if (item.editorType === 'r2Datefield') {
    //         dates.push(item);
    //       } 
    //       else if (item.fieldCode === 'comment') {
    //         matterComment = item;
    //       } 
    //       else {
    //         others.push(item);
    //       }
    //     });
    //     matter.others = others;
    //     matter.dates = dates;
    //     matter.matterComment = matterComment;
    //   });
    // },
    onShowMore(item, index, key) {
      this.matterDetail = Vue.clone(item);
      this.showMatterDetail = true;
      this.matterDetailIndex = index;
      if (key) {
        this.matterDetailKey = key;
      }
      //this.$emit('on-show-more', item, index, key);
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