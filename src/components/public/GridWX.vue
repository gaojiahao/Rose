<template>
  <div class="r-grid-wx">
    <!-- 没有选择物料 -->
    <template v-if="(!values || values.length == 0)&& cfg.readOnly == false && hasDs">
      <div class="no-data-header" @click="showGridPicker">
        <div class="title">交易明细</div>
        <!--row-->
        <div>暂无数据</div>
        <div class="seleted_icon">
          请选择
          <span class="icon-right"></span>
        </div>
      </div>
    </template>
    <!-- 已经选择了物料 -->
    <template v-else>
      <div class="has-data-header">
        <div class="title">明细</div>
        <div v-if="(!values || values.length == 0)">暂无数据</div>
        <div @click="toggleEditStatus" v-if="!cfg.readOnly && values && values.length">
          <div class="edit" v-if="!isEdit">管理</div>
          <div class="edit" v-else>完成</div>
        </div>
      </div>
    </template>
    <div class="detail" v-for="(vitem,vindex) in valueGroups" :key="vindex" v-if="values">
      <div class="title-left">资产:
        <span>{{vitem.facilityStorageAddress}}</span>-{{vitem.facilityName_facilityObjCode}}
        <span>(</span>
        <span>{{vitem.facilityObjCode}}</span>
        <span>)</span>-{{vitem.componentName_tdComponentCode}}
        <span>(</span>
        <span>{{vitem.tdComponentCode}}</span>
        <span>)</span>-
        <span>{{vitem.cardCode}}</span>
      </div>
      <div class="title-right">
        <span class="icon-g-add" @click="addRecord(vindex)" v-show="!isEdit && !cfg.readOnly"></span>
        <span :class="styleTypeStatus[vindex]?'icon-g-up':'icon-g-down'" @click="toggleStyleType(vindex)"></span>
      </div>
      <div class="r-row-ct" v-show="!styleTypeStatus[vindex]">
        <div
          class="r-row"
          v-for="(row,rIndex) in values"
          :key="rIndex"
          :class="{row_delete : isEdit,'vux-1px-b' : rIndex < values.length - 1 }" v-if="(row.facilityObjCode==vitem.facilityObjCode)&&(row.tdComponentCode==vitem.tdComponentCode)&&(row.cardCode==vitem.cardCode)">
          <div class="trans-item">
            <div class="trans-item-img">
              <img  :src="getImgPic(row)" >
            </div>
          
            <div class="trans-item-info">
              <template v-for="(item, index) in keyFiled" class="cell when-is-right">
                <div class="" v-if="item.kField" :key="'keyFiled' + index" >
                  <span>{{item.text}}:</span>
                  <span   v-if="item.editorType=='r2Percentfield'">{{formatByType(row[item.fieldCode],item.editorType)}}%</span>
                  <span v-else  >{{formatByType(row[item.fieldCode],item.editorType)}}</span>
                </div>
              </template>
            </div>
            <div class="edit-btn-wrapper">
              <span class="icon-matter-bianji" @click.stop="onShowDetail(row,rIndex,vindex)" v-show="!isEdit && !cfg.readOnly"></span>
            </div>
          </div>

          <div @click.stop="onShowDetail(row,rIndex)" class="show-more" v-show="!isEdit && cfg.readOnly">
            详情
            <i class="icon-more"></i>
          </div>

          <div class="delete_icon" @click="delClick(rIndex)" v-if="isEdit">
            <x-icon type="ios-checkmark" size="20" class="checked" v-show="isChecked(rIndex)"></x-icon>
            <x-icon type="ios-circle-outline" size="20" v-show="!isChecked(rIndex)"></x-icon>
          </div>
          
        </div>
        <!-- <div class="summary-info" v-if="(values && ((values['outPut']&&values['outPut'].length > 1) || (values.length > 1)))">
          <div class="summarry-info-count">共{{(values['outPut']&&this.values['outPut'].length )|| values.length}}条明细</div>
          <div>
              <template v-for="(item, index) in summaryField" >
                <div class="summary-item" v-if="item.hidden == false" :key="index">
                  <span class="summary-item-label">{{item.text}}：</span>
                  <span class="summary-item-value">{{formatByType(summaryValue[item.fieldCode],item.editorType)}}</span>
                </div>
              </template>
          </div>
        </div> -->
      </div>
    </div>
    <div class="summary-info" v-if="(values && ((values['outPut']&&values['outPut'].length > 1) || (values.length > 1)))">
      <div class="summarry-info-count">共{{(values['outPut']&&this.values['outPut'].length )|| values.length}}条明细</div>
      <div>
          <template v-for="(item, index) in summaryField" >
            <div class="summary-item" v-if="item.hidden == false" :key="index">
              <span class="summary-item-label">{{item.text}}：</span>
              <span class="summary-item-value">{{formatByType(summaryValue[item.fieldCode],item.editorType)}}</span>
            </div>
          </template>
      </div>
    </div>
    <div
      class="add-more-wrapper"
      v-if="!cfg.readOnly && (cfg.allowMutilRow ||cfg.allowAddorDel) && ((values &&values.length) ||!hasDs) && !isEdit"
    >
      <div class="add-more" @click="addGroup">
        <span class="icon-add-iconfont"></span>
        <span class="add_text">新增</span>
      </div>
    </div>

    <grid-picker v-if="!cfg.readOnly && hasDs" ref="gridPicker" @on-select="addRecords"/>
    <div class="grid-detail-wrapper" v-if="showDetail">
      <grid-detail-wx v-model="showDetail" @on-confirm="doDetailEdit" ref="gridDetail" :cfg="cfg" @get-firstselect="getFirstselect" @deal-value-null="dealValueNull"/>
    </div>
    <div
      class="count_mode grid-manger-wrapper vux-1px-t"
      :class="{btn_hide : btnIsHide}"
      v-show="isEdit"
      v-transfer-dom
    >
      <div class="count_num all_checked" @click="checkAll">
        <x-icon type="ios-circle-outline" size="20" class="outline" v-show="!isCheckAll()"></x-icon>
        <x-icon type="ios-checkmark" size="20" class="checked" v-show="isCheckAll()"></x-icon>全选
      </div>
      <div class="delete_btn" @click="doDelete">删除</div>
    </div>
  </div>
  <!--grid-->
</template>



<script>
import Vue from "vue";
import dao from "plugins/ajax";
import gridPicker from "./GridPicker";
import girdMix from "mixins/gridwx";
import objList from '../../common/const/obj-app';
var component = {
  mixins: [girdMix],
  components: { gridPicker },
  props: ["cfg", "values", "btnIsHide"],
  computed:{
    curObj:function() {
      if(!this.values || this.values.length < 1) return;
      let fieldSettingData = JSON.parse(window.sessionStorage.getItem('r2FieldSetting'))||this.$r2FieldSetting,
        obj,
        objKey,
        fKey;
          
      this.keyFiled.map(it=>{
          objKey = it.fieldCode.indexOf('_') > -1 ? it.fieldCode.split('_')[1] : it.fieldCode;
          fKey = it.fieldCode.split('_')[0];

          if(fieldSettingData&&fieldSettingData[objKey]){
              if(fieldSettingData[objKey]['objCode']){
                  obj = objList.getObjectByName(fieldSettingData[objKey]['objCode'])[0];
              }
          }
          if(fieldSettingData&&fieldSettingData[fKey]){
            
              if(fieldSettingData&&fieldSettingData[fKey]['kField']===1){
                  it.kField = 1;
              }
          }
      });
      return obj;
    },
    summaryValue:function(){
      let val = {};
      this.summaryField.map(it=>{
        this.values.map(d=>{
          if(val[it.fieldCode]){
            (val[it.fieldCode] += Number(d[it.fieldCode]));
          }else{
            val[it.fieldCode] = Number(d[it.fieldCode]);
          }
        });
      });

      for(var k in val){
        if(isNaN(val[k])){
          val[k] = '无';
        }else{
          val[k] = val[k].toFixed(2)
        }
      }
      return val;
    }
  },
  data() {
    return {
      showDetail: false,
      detail: {},
      hasDs:false,
      notAddOneRow:false,
      valueGroups:[],
      firstSelect:{},
      group: 0,
      styleTypeStatus:[0],
      keyFiled:[],
    };
  },
  watch:{
    values:{
      handler(val){
        //if(this.form.model!='new'&&(this.flag<3))
        this.dealGroup(val);
      }
    }
  },
  methods: {
    //选择默认图片
    getImgPic(d) {
       let url;
      if(d){
        let pic = this.curObj ? this.curObj.picKey : '',
            defaultUrl = this.curObj ? this.curObj.defaultUrl : 'wl_default03.png';
        url =  d[pic] ? d[pic] : '/static/' + defaultUrl;
      }else{
        url = require('assets/wl_default03.png');
      }
     return url;
    },
    checkAmt() {},
    setValue: function(value) {
      this.$set(this.form.formData, this.name, value);
      this.$event.$emit(`item-event-${this.name}`,value);
    },
    getValue: function() {
      return this.form.formData[this.name];
    },
    hasDataSource: function(cfg) {
      return cfg.xtype != "r2Grid" && cfg.xtype!='r2AutoLoadGrid';
    },
    showGridPicker() {
      this.$refs.gridPicker.show();
    },
    initDataSource(cfg) {
      var me = this;
      
      me.dataSource = me.hasDataSource(cfg)
        ? //适配 r2AccountGrid
          cfg.dataSource
        : findDs(cfg.columns);
      me.hasDs = !!me.dataSource;

      function findDs(columns) {
        var i = 0,
          l = columns.length,
          col;

        for (i; i < l; i++) {
          col = columns[i];
          if (~["r2Selector", "r2SelectorPlus"].indexOf(col.editorType)) {
            me.dataSourceBind = { k: col.fieldCode, v: col.valueField };
            if(col.dataSource && me.cfg.xtype!=='r2AutoLoadGrid') {
              col.dataSource.data.cols = col.proertyContext.dataSourceCols;
              return col.dataSource.data;
            }

            if(me.cfg.xtype=='r2AutoLoadGrid'){
              return {
                ...me.cfg.dataSource.data,
                cols:me.cfg.proertyContext
              }
            }
          }
        }
      }
    },  
    onShowDetail(row, rowIndex,vindex) {
      this.group = vindex;
      this.detail = row;
      this.detailRowNumer = rowIndex;
      this.showDetail = true;
    },
    getFirstselect(val){
      if(!this.judgeValueGroup(val)){
        this.valueGroups[this.group] = val;
      }
    },
    judgeValueGroup(newValues){
      for(var i=0;i<this.valueGroups.length;i++){
        if( (this.valueGroups[i]['facilityObjCode']==newValues['facilityObjCode'])
          &&((this.valueGroups[i]['componentCode_tdComponentCode']==newValues['componentCode_tdComponentCode'])||
          (this.valueGroups[i]['tdComponentCode']==newValues['tdComponentCode']))
          &&(this.valueGroups[i]['cardCode']==newValues['cardCode']) ){
            return true;
        }
      }
      return false;
    },
    toggleStyleType(index) {
      this.$set(this.styleTypeStatus,index,this.styleTypeStatus[index] ? 0 : 1)
    },
    dealValueNull(){
      var rowIndex,
          newValues = [];
      this.values.forEach((row, rowIndex) => {
        if (row['cardCode']) {
            newValues.push(row);
        }
      })
      this.setValue(newValues);
    },
    async initKeyFiled(){
      await this.load();
      //await this.dealKeyFiled();
    },
    dealKeyFiled(){
      let fieldSettingData = JSON.parse(window.sessionStorage.getItem('r2FieldSetting'))||this.$r2FieldSetting,
          obj,
          objKey,
          fKey;
      
      this.keyFiled = this.keyFiled.map(function(it,index,arr) {
        objKey = it.fieldCode.indexOf('_') > -1 ? it.fieldCode.split('_')[1] : it.fieldCode;
        fKey = it.fieldCode.split('_')[0];

        if(fieldSettingData&&fieldSettingData[objKey]){
            if(fieldSettingData[objKey]['objCode']){
              obj = objList.getObjectByName(fieldSettingData[objKey]['objCode'])[0];
            }
        }
        if(fieldSettingData&&fieldSettingData[fKey]){
          if(fieldSettingData&&fieldSettingData[fKey]['kField']===1){
            it.kField = 1;
          }
        }
        return it;
      },this);
    }
  },
  created() {
    var cfg = this.cfg,
      id = cfg.id,
      fieldSet = this.$parent,
      form = fieldSet.form,
      values = this.values,
      name = fieldSet.name,
      notAddOneRow = this.cfg.notAddOneRow;
    
    this.load();
    this.keyFiled = this.cfg.columns.filter(it=>{
      if(!(it['fieldCode']=='price')){
        return !it.hidden;
      }
    });
    this.initKeyFiled();

    this.summaryField = this.cfg.columns.filter(it=>{
      return !it.hidden;
    }).filter((it)=>{
      return ['r2Numberfield','r2Percentfield '].includes(it.editorType) && it.summaryType === 'sum';
    });

    form.fieldMap[id] = this;
    form.fields[this.cfg.fieldCode] = this;
    this.isGrid = true;
    this.name = name;
    this.form = form;
    this.containerCode = fieldSet.cfg.name;
    this.dao = dao;//执行公式用;
    this.initDataSource(cfg);
    this.initDefaultValueCfg();
    this.initValueBindAndExpressionCfg();
    this.initEditorParamsCfg();
    this.valueGroups.push({});
    if(this.cfg.notAddOneRow==false){
      var value = this.getValue() || [],
        record,
        row, i = 0;

      record = this.createRecord();
      value.push(record.data);
      this.setValue(value);
    }
    if(this.cfg.allowAddorDel==false){
      var value = this.getValue() || [],
        record,
        row, i = 0;

      record = this.createRecord();
      value.push(record.data);
      this.setValue(value);
    }
    this.dealGroup(this.values);
  }
};
export default Vue.component("GridWX", component);
</script>

<style lang="scss">

.row_delete {
  position: relative;
  padding-left: 0.3rem;
}
.delete_icon {
  left: 0;
  top: 50%;
  height: 20px;
  fill: #999;
  position: absolute;
  transform: translateY(-50%);
  .checked {
    fill: #fa7138;
  }
}
.no-data{
  text-align:center;
}
.r-grid-wx {
  // 没有物料title样式
  .no-data-header {
    display: flex;
    padding: 0.15rem 0;
    font-size: 0.14rem;
    line-height: 0.14rem;
    justify-content: space-between;
    .title {
      @include font_color();
      font-weight: bold;
    }
    .seleted_icon {
      display: flex;
      align-items: center;
      .icon-right {
        width: 0.08rem;
        height: 0.14rem;
        margin-left: 0.1rem;
      }
    }
  }
  // 有物料的title的样式
  .has-data-header {
    display: flex;
    padding: 0.2rem 0 0.1rem;
    border-bottom:1px solid #eee;
    line-height: 0.14rem;
    justify-content: space-between;
    .title {
      color: #696969;
    }
    .edit {
      @include font_color();
    }
  }
  .detail{
    width: 100%;
    position: relative;
    margin-top: 0.05rem;
    .title-left{
      font-weight: 600;
      font-size: .15rem;
      width: 80%;
    }
    .title-right{
      width: 30%;
      float: right;
      .icon-g-add {
        width: .26rem;
        height: .26rem;
        position: absolute;
        right: .31rem;
        top: .04rem;
      }
      .icon-g-up {
        width: .26rem;
        height: .26rem;
        position: absolute;
        right: 0;
        top: .04rem;
      }
      .icon-g-down {
        width: .26rem;
        height: .26rem;
        position: absolute;
        right: 0;
        top: .04rem;
      }
    }
  }
  .summary-info{
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    font-weight: 600;
    border-top: 1px solid #ddd;
    padding: 0.05rem 0rem;
    color:#605a5a;
    .summary-item{
      display: flex;
      justify-content: space-between;

      .summary-item-label{

      }

      .summary-item-value{
        color: #4CA3FB;
      }

    }
  }
  //明细数据容器
  .r-row-ct{
    .r-row {
      margin: 0.05rem 0 0.05rem;
      line-height: 0.20rem;
      font-size: 0.13rem;

      .trans-item{
        display: flex;
        position: relative;
        .trans-item-img{
          img{
            width: 0.85rem;
          }
        }
        .trans-item-info{
          margin-left: 0.05rem;

          .summary-item{
            display: flex;
            justify-content: space-between;

            .summary-item-value{
              color: #4CA3FB;
              font-weight: bold;
            }
          }
        }
        .edit-btn-wrapper{
          position:absolute;
          float:right;
          right:0;
          .icon-matter-bianji {
            width: .49rem;
            height: .49rem;
            position: absolute;
            right: -.115rem;
            top: .03rem;
          }
        }
      }
      span:nth-child(2n + 1) {
        color: #333;
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
      // .edit-btn-wrapper{
      //   position: relative;
      // }
      // .icon-matter-bianji {
      //   width: .28rem;
      //   height: .28rem;
      //   position: absolute;
      //   right: 0;
      //   top: .03rem;
      // }
      .show-more {
        text-align: right;
        height: 0.25rem;
        line-height: 0.25rem;
        font-size: .14rem;
        @include font_color();
        .icon-more {
          display: inline-block;
          width: 0.2rem;
          height: 0.04rem;
        }
      }
      .item {
        display: inline-flex;
        margin-right: 0.05rem;
      }
    }
    .summary-info{
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 600;
      border-top: 1px solid #ddd;
      padding: 0.05rem 0rem;
      color:#605a5a;
      .summary-item{
        display: flex;
        justify-content: space-between;

        .summary-item-label{

        }

        .summary-item-value{
          color: #4CA3FB;
        }

      }
    }
  }
  .add-more-wrapper {
    margin-top: .05rem;
    width: 100%;
    display: flex;
    text-align: center;
    position: relative;
  }
  .add-more {
    display: flex;
    @include font_color();
    font-weight: bold;
    text-align: center;
    align-items: center;
    margin: 0 auto 0.2rem;
    border-radius: 0.15rem;
    padding: 0.06rem 0.08rem;
    border: 1px solid;
    @include boder_color();
    .icon-add-iconfont {
      width: 0.14rem;
      height: 0.14rem;
      margin-right: 0.05rem;
      box-sizing: border-box;
    }
    .add_text {
      font-size: 0.12rem;
      line-height: 0.12rem;
    }
  }
  
}
.grid-manger-wrapper {
  z-index: 100;
}

</style>