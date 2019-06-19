<template>
  <div class="r-grid">
    <div class="r-row-ct" v-if="values && values.length">
      <div class="r-row vux-1px-b"  v-for="(row,rIndex) in values" :key="rIndex">
        <template
          v-for="(item, index) in cfg.columns"
          class="cell when-is-right"
        >
          <div class="item" v-if="item.hidden == false" :key="index">
            <span >{{item.text}}：</span>
            <span>{{row[item.fieldCode]||'无'}}</span>
          </div>
        </template>
        <div @click="onShowMore(row,rIndex)" class="show-more">
          查看详情
          <i class="icon-more"></i>
        </div>
      </div><!--row-->
    </div>
    <div v-else class="add_more"  @click="addMatter">
        <span class="icon-add"></span>
        <span class="add_text">新增更多物料</span>
    </div>  
    <grid-picker ref="gridPicker" @on-select="addRecords"/>
    <grid-detail
      :show="showDetail"
      :item="detail"
      :columns="cfg.columns"
      v-model="showDetail"
      @on-confirm="doDetailEdit"
    />
  </div>
</template>
<script>
import Vue from "vue";
import gridPicker from './GridPicker';
import girdMix from 'mixins/grid'
var component = {
  mixins:[girdMix],
  components:{gridPicker},
  props: ["cfg", "values"],
  data() {
    return {
      showDetail: false,
      detail: {}
    };
  },
  methods: {
    doDetailEdit() {},
    checkAmt() {},
    setValue:function(value){
      this.$set(this.form.formData,this.name,value);
    },
    getValue:function(){
       return this.form.formData[this.name];
    },
    addRecords:function(selection){
      var value = this.getValue()||[],
          record, 
          row,i=0,l = selection.length;
  
      for(i;i<l;i++){
        row = selection[i];
        record = this.createRecord(row);
        value.push(record);
      }
      this.setValue(value);
    },
    createRecord:function(row){
       var me = this,
           data = {},
           dataSourceBind = this.dataSourceBind;
          
       if(dataSourceBind){
         data[dataSourceBind.k] = row[dataSourceBind.v];
         this.setValueBindValue(data,dataSourceBind.k,row);
       }
       this.setDefaultValue(data);
       return data;
    },
    addMatter(){
      this.$refs.gridPicker.show();
    },
    initDataSource(cfg){
      var me = this,
          dataSource = cfg.dataSource,
          columns = cfg.columns;

      if(!dataSource){
        dataSource = findDs(cfg.columns);
      }
      this.dataSource = dataSource;
      function findDs(columns){
        var i= 0,
            l = columns.length,
            col;
        for(i;i<l;i++){
          col = columns[i];
          if(col.editorType == 'r2Selector'){
             me.dataSourceBind = {k:col.fieldCode,v:col.valueField};
             return {...col.dataSource.data,...{cols:col.proertyContext.dataSourceCols}}
          }
        }
      }
    },
    onShowMore(row) {
      this.detail = row;
      this.showDetail = true;
    }
  },
  created(){
    var cfg = this.cfg,
        id = cfg.id,
        fieldSet = this.$parent,
        form = fieldSet.form,
        values = this.values,
        name = fieldSet.name;

    form.fieldMap[id] = this;
    this.name = name;
    this.form = form;
    this.initDataSource(cfg);
    this.initDefaultValueCfg();
    this.initValueBindAndExpressionCfg();
  }
};
export default Vue.component("RGrid", component);
</script>

<style lang="scss">
.r-row {
  margin: 0.05rem 0 0.05rem;
  line-height: 0.22rem;
  font-size: 0.12rem;
  span:nth-child(2n + 1) {
    color: #aaa;
  }
  span:nth-child(2n) {
    font-weight: 400;
    font-size: 0.13rem;
  }
  &.vux-1px-b:after {
    border-color: #e8e8e8;
  }
  &.vux-1px-b:last-child:after {
    border: none;
  }
  .show-more {
    text-align: right;
    color: blue;
  }
  .icon-more {
    display: inline-block;
    width: 0.2rem;
    height: 0.04rem;
  }
  .item {
    display: inline-flex;
    margin-right: 0.2rem;
  }
}
.r-row:first-child {
  margin-top: 0rem;
}
.r-row:last-child {
  margin-bottom: 0rem;
}
</style>