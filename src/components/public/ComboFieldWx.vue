<template>
<div v-show="!hidden" class="cell each_property vux-1px-b combo" >
  <label :class="{'required':!cfg.allowBlank,'readonly':cfg.readOnly}">{{cfg.fieldLabel}}</label>
  <div v-if="cfg.readOnly == false && (!selection2['facilityCode'])" class="content" @click="clickShowPop">
    <span class='mater_nature' :class="{placeholder:!values[cfg.fieldCode]}">{{displaysValue || displaysEmptyDatasourceValue || "请选择"}}</span>
    <span v-if="cfg.dataSource" class="icon-right"></span>
  </div>
  <span v-else >{{values[cfg.fieldCode] == null ? '无' : displaysValue || displaysEmptyDatasourceValue}}</span>
  <div v-transfer-dom>
      <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide" style="z-index: 502;">
        <div class="trade_pop">
          <d-search @search="searchList" @turn-off="onHide" :isFill="true" :searchBoxShows="searchBoxShow" :filterList="fields"></d-search>
          <!-- 往来列表 -->
          <r-scroll class="pop-list-container" :options="scrollOptions" :has-next="hasNext"
                    :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown" @search-box-show="searchBox" ref="bScroll">
            <div class="pop-list-item" v-for="(item, index) in listData" :key='index' @click.stop="selItem(item,true)" :class="{selected: showSelIcon(item)}">
              <div class="trans-item-img">
                <img  :src="getImgPic(item)" >
              </div>
              <div class="main">
                  <div class="name">
                     <span class="name">{{item[cfg.displayField]}}</span>
                     <span class="label" v-if="cfg.valueField != cfg.displayField">{{item[cfg.valueField]}}</span>
                  </div>
                  <div class="info">
                     <template v-for="(field, index) in fields">
                        <span class="label" :key='index'>{{field.v}}</span>
                        <span class="value">{{item[field.k] }}</span>
                     </template>
                  </div>
              </div>
            </div>
          </r-scroll>
        </div>
      </popup>
  </div>
</div>
</template>
<script>
import Vue from 'vue'
import fieldBase from 'mixins/fieldBase'
import $flyio from 'plugins/ajax'
import {Icon, Popup, LoadMore, AlertModule, numberComma} from 'vux'
import DSearch from 'components/search/search'
import RScroll from 'plugins/scroll/RScroll'
import {
    getDisplayValues
} from "service/commonService";

let cfg = {
  mixins:[fieldBase],
    props:['cfg','values'],
    components: {
        Icon, Popup, DSearch, RScroll
    },
    data(){
      return {
        page: 1,
        limit: 50,
        showPop:false,
        store:null,
        searchValue:null,
        displaysValue: '',
        listData:[],
        fields:[],//可以显示的列。
        hasNext: true,
        selection:null,
        scrollOptions: { // 滚动配置
          pullUpLoad: true,
          pullDownRefresh: true,
        },
        searchBoxShow:true,
        property:'',
        selection2:{},
      }
    },
    watch: {
      values: function(value){
        if(value){
          value[this.cfg.fieldCode] && this.displayRealValue();
        }
      },
      listData: function(value){
        let me = this,
            data = {
              page: 1,
              start: 0
            };
        if(value.length > 0){
          if(this.form.model === 'revise'){
            if(me.cfg.fieldCode === 'handlerName'){
              data.filter = JSON.stringify([{operator: 'eq',value: this.values[this.cfg.fieldCode],property: this.cfg.valueField}]);
              $flyio.ajax({
                  url: me.cfg.dataSource.data.url,
                  data
              }).then(({dataCount = 0, tableContent = []}) => {
                tableContent[0] && me.selItem(tableContent[0]);
              })
            }
          }
        }
      }
    },
    computed: {
      displaysEmptyDatasourceValue: function(){
        if(!this.cfg.dataSource)  
        return this.values[this.cfg.fieldCode];
      }
    },
    methods:{
      displayRealValue() {
        if(this.form.model !== 'new' && (this.cfg.dataSource && this.cfg.dataSource.type !== 'staticData')){
          if(this.cfg.dataSource){
            let filter,
                store = this.store||{},
                data = {
                  limit: this.limit,
                  page: this.page,
                  start: 0
                };

            filter = [{operator: 'eq',value: this.values[this.cfg.fieldCode],property: this.cfg.valueField}];
            data.filter = JSON.stringify(filter);
            data = {...data,...store.params};

            if(store.url){
              if(this.cfg.xtype=='r2Combo'&&this.cfg.readOnly!=true){
                delete data.filter;
              }
              this.getDisplay(data).then(res => {
                if(res){
                  this.displaysValue = res[this.cfg.displayField];
                  this.selection = res;
                  this.form.$emit(this.valueChangeKey,this);
                }else{
                  this.displaysValue = this.values[this.cfg.fieldCode];
                }
                this.$loading2.hide();
              })
            }
          }else{
            this.displaysValue = this.values[this.cfg.fieldCode];
          }
        }else{
          if(this.listData.length === 0){
            this.displaysValue = '';
            return;
          }
          this.listData.forEach(k => {
            if(k[this.cfg.valueField] === this.values[this.cfg.fieldCode]){
              this.displaysValue = k[this.cfg.displayField];
            }
          })
        }
      },
      async getDisplay(data) {
        const displayValue = await $flyio.ajax({
                  url: this.cfg.dataSource.data.url,
                  data
              }).then(({dataCount = 0, tableContent = []}) => {
                if(tableContent.length > 0){
                  return tableContent[0];
                }
              })
        return displayValue;
      },
      clickShowPop() {
        this.cfg.dataSource && (this.showPop = true);
      },
      buildStore:function(){
        var cfg = this.cfg,
            ds = cfg.dataSource;

        if(ds.type == 'remoteData'){
            this.buildRemoteStore(ds);
        } else if(ds.type == 'staticData'){
            this.buildStaticDataStore(ds.data);
        }
      },
    buildRemoteStore(ds){
      var me = this,
          store = {
            url:ds.data.url,
            params:{}
          },
          hFieldKeys = ds.data.hFields || [],
          fields = [],
          dataSourceCols = this.cfg.proertyContext.dataSourceCols||[],
          i,l,
          col,
          autoLoad = true;

      
      if(me.cfg.valueBind&&me.cfg.valueBind.length) {
        var ctrl = me.cfg.valueBind[0].data.contrl,
            field = me.cfg.valueBind[0].data.valueField;
        ds.data.params[field] = me.cfg.valueBind[0];
      }

      setParams(ds.data.params);

      this.store = store;

      if(me.cfg.xtype == 'r2Selector'){
          for(i =0,l= dataSourceCols.length;i<l;i++){
            col = dataSourceCols[i];
            col['name'] = dataSourceCols[i].v;
            col['value'] = dataSourceCols[i].k;
            if(col['value']=='facilityName'){
              col['sort'] = 0;
            } else if (col['value']=='whCode'){
              col['sort'] = 1;   
            } else {
              col['sort'] = 2;  
            }
            if(hFieldKeys.indexOf(col.k) ==-1){
                fields.push(col);
            }
          }
          fields.sort(function(a, b){return a['sort'] - b['sort']}); 
          this.fields = fields;
      }

      if(autoLoad)this.load();
      function setParams(params){
        var paramCfg,
            reg = /\{([\w|\.])*}/ig,
            key,
            valueField,
            contrl,
            value,
            isParamInRow,
            contrlId;
        
        if(params)for(key in params){
          paramCfg = params[key];
          if(paramCfg.type == 'contrl'){
              contrlId = paramCfg.value.contrl;
              valueField = paramCfg.value.valueField;
              contrl = me.form.fieldMap[contrlId];
              if(contrl){
                value = me.getContrlParamValue(contrl,valueField);
                if(value == null){
                    autoLoad = false;
                }
                store.params[key] = value;
                if(!me.isGridEditor()){
                    me.form.$on('value-change-' + contrlId,(function(paramKey,valueField){
                          return function(){
                            var arg = Array.prototype.slice.call(arguments);
                            arg.unshift(paramKey,valueField);
                            me.paramChangeHandler.apply(me,arg);
                          }
                    })(key,valueField));
                } else if(contrl.isGrid == true){
                    me.form.$on('field-change-' + paramCfg.value.dataIndex,(function(paramKey,valueField,contrl){
                          return function(){
                            var arg = Array.prototype.slice.call(arguments);
                            arg.unshift(paramKey,valueField,contrl);
                            me.paramChangeHandler.apply(me,arg);
                          }
                    })(key,valueField,contrl))
                }
              }
          } else if(paramCfg.type == 'text'){
              value = paramCfg.value;
              if (value.match(reg)) {
                value = me.getRegParam(value,reg);
              }
              store.params[key] = value;
          } else if(paramCfg.type == 'formData') {
            contrlId = paramCfg.data.contrl;
            valueField = paramCfg.data.valueField;
            contrl = me.form.fieldMap[contrlId];  
            if(contrl){
              value = me.getContrlParamValue(contrl,valueField);  
              if(value == null){
                autoLoad = false;
              }
              me.form.$on('value-change-' + contrlId,(function(paramKey,valueField){
                return function(){
                  var arg = Array.prototype.slice.call(arguments);
                  arg.unshift(paramKey,valueField);
                  me.paramChangeHandler.apply(me,arg);
                }
              })(key,valueField));
            }
          }
        }
      }
    },
    buildStaticDataStore(data){
      var listData = [];
      
      data.forEach(function(text){
          listData.push({
            text:text
          })
      });
      this.listData = listData;
      this.hasNext = false;
    },
    checkValueOnLoad:function(listData){
      var  value = this.getValue(),
            valueField = this.cfg.valueField,
            selection;

      selection = listData.find(function(item){
          return item[valueField] === value;
      });
      if(selection == null){
          this.reSet();
      }else{
          this.selItem(selection);
      }
    },
    getExtraFieldValue:function(valueField){
      if(this.selection){
          return this.selection[valueField];
      } else {
          return null;
      }
    },
    getContrlParamValue:function(contrl,valueField){
      return contrl.isGrid == true ? this.form.getRowParam(valueField) : contrl.getExtraFieldValue(valueField)
    },
    initCombo(){
      var cfg = this.cfg,
          value = this.getValue();

      this.property = this.cfg.displayField;
      this.blankText = '请选择'+cfg.fieldLabel;
      if(value != null){
          if(cfg.xtype != 'r2Combo')this.searchValue = ''+value;
          this.$once('load',this.checkValueOnLoad)
      }

      // if(cfg.valueBind.length){
      //   cfg.valueBind.map(v=>{
      //     if(v.type==='formData')
      //     this.initValueBind([v.data]);
      //   });
      // }
    },
    load:function(cb,valueBind){
      var store = this.store||{},
          filter,
          data = {
            limit: this.limit,
            page: this.page,
            start: (this.page - 1) * this.limit
                    },
          pArr=[];
      
      if (this.searchValue&&this.searchValue[0]) {
        filter = [
          {
          operator: 'like',
          value: this.searchValue,
          // property: this.cfg.displayField,
          property: this.property,
          }
        ];
        if(this.property.searchValue === Object){
          filter.value = this.searchValue[0]
        }
        pArr = Object.values(this.property);
        if(this.property.constructor === Object){
          filter = [];
          for(var i=0;i<pArr.length;i++){
            if(this.searchValue[i]){
              var a = {
                operator: 'like',
                value: this.searchValue[i],
                // property: this.cfg.displayField,
                property: pArr[i]['value'],
              }
            }
            filter.push(a);
          }
        }
        data.filter = JSON.stringify(filter);
      };
      if(this.cfg.valueBind&&valueBind&&this.cfg.xtype=='r2Selector'&&valueBind.value&&this.cfg.readOnly){
        data = {
          limit: 1,
        }
        filter = [
          {
          operator: 'eq',
          value: valueBind.value,
          property: valueBind.valueField,
          }
        ];
        data.filter = JSON.stringify(filter);  
      }
      this.value = valueBind&&valueBind.value;
      data = {...data,...store.params};
      if(store.url){
        $flyio.ajax({
            url: this.store.url,
            data
        }).then(({dataCount = 0, tableContent = []}) => {
            this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
            this.listDataAll = tableContent;
            this.listData = this.page === 1 ? tableContent : [...this.listData, ...tableContent];
            this.$nextTick(() => {
                if (this.$refs.bScroll) {
                  this.$refs.bScroll.finishPullUp();
                }
            });
            this.$emit('load',this.listData);
            if(cb)cb();
        })
      }
    },
    // 弹窗展示时调用
    onShow() {
      this.$nextTick(() => {
          if (this.$refs.bScroll) {
            // 弹窗展示时刷新滚动，防止无法拖动问题
            this.$refs.bScroll.refresh();
          }
      });
    },
    
    onPullingUp() {
      this.page++;
      this.load();
    },
    onPullingDown() {
      this.page=1;
      this.load();
    },
    // 弹窗隐藏时调用
    onHide() {
      this.showPop = false;
    },
    paramChangeHandler:function(paramKey,valueField,control){
      var value = this.getContrlParamValue(control,valueField),
          store = this.store,
          key;

      if(value != null){
          store.params[paramKey] = value;
      }
      for(key in store.params){
          if(store.params[key] == null)return;
      }
      this.listData = [];
      this.page = 1;
      this.load(this.validOrSetSelection,{'valueField':valueField,'value':value});
    },
    reSet:function(){
      this.selection = null;
      this.value = null;
      this.setValue(null);
      if(!this.cfg.defaultValue){
        this.displaysValue = '';
      }
    },

    searchList({val,property}){
      this.searchValue = val? this.stringToObject(val):'';
      this.property = property;
      this.page = 1;
      if(!this.selection2['facilityCode']){
        this.load();
      }
    },
    stringToObject(str){
      var s = str;
      s = s.replace(/\s/g,",");
      s = s.replace(/，/g,",");
      return s.split(',');
    },
    selItem(item,status){
      this.selection = item;
      this.showPop = false;
      this.$loading2.show();
      this.value = item && item[this.cfg.valueField];
      //重复项与单一项的默认展示数据需求不一样
      if(this.$parent.cfg.xtype != "r2GridColumn") {
        this.setValue(this.value);  
      } else {
        if(this.value != this.values[this.cfg.fieldCode]) {
          this.setValue(this.value);
        }
      }
      this.displayRealValue();
      this.$emit('getSelect',item);
    },
    
    showSelIcon(item){
      return this.selection == item;
    },
    validOrSetSelection(){
      var value = this.value,
          selection,
          valueField = this.cfg.valueField,
          listData = this.listData;

      if(value != null){
          if(this.cfg.valueBind){
            selection = listData.find(function(item){
                if(item[valueField] == value)
                  return item;
            });
            if(selection){
              this.selItem(selection);  
              return ;
            } else {
              // this.reSet();    
              // this.displaysValue = '';    
            }
          } 
          if(this.cfg.defaultValue){
            selection = listData[0];
            this.selItem(selection);
            return ;
          }
          // if(selection == null&&!this.cfg.valueBind) {
          //   this.reSet();
          //   this.displaysValue = '';
          // }
      } else {
        if(listData.length&&this.cfg.defaultValue){
          selection = listData[0];
          this.selItem(selection);
        } else {
          this.reSet();
          this.displaysValue = '';  
        }
      }
    },
    searchBox(data){
      this.searchBoxShow = data;
    },
    //原料采购订单先选明细后选供应商自动设置税率和含税单价方法
    setTaxPrice(matCodeParms,dealerCode){
      let data = {matCodes:matCodeParms,dealerCode:dealerCode};
      return $flyio.ajax({
        type: 'POST',
        contentType: 'application/json',
        url: '/H_roleplay-si/formAPI/getPriceFromProcurementContract',
        data: JSON.stringify(data)
      }).then(res => {
        return res;
      })
    },
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
  },
  created(){
    this.initCombo();
    this.buildStore();
    this.values[this.cfg.fieldCode] && this.displayRealValue();
    var selection =this.$parent.$parent.$parent.$parent.$parent.valueGroups[this.$parent.$parent.$parent.$parent.$parent.group];
    if(selection&&selection['componentName_tdComponentCode']){
       this.selection2 = {
        //...selection,
        //componentName:selection.componentName_tdComponentCode,
        facilityCode: selection.facilityObjCode,
        //facilityResidualRatio: selection.componentName_tdComponentCode,
        departMentId: selection.departmentId,
        dealerName: selection.dealerName_dealerDebit,
        componentCode: selection.tdComponentCode,
        facilityType: selection.facilityTypebase_facilityObjCode,
        facilitySubclass: selection.facilitySubclass_facilityObjCode,
        //facilitySpecification: selection.componentName_tdComponentCode,
        //facilityDepreciation: selection.componentName_tdComponentCode,
        dealerCode: selection.dealerDebit,
        cardCode: selection.cardCode,
        //facilityStatus: selection.componentName_tdComponentCode,
        departMent: selection.departmentName,
        facilityBigType: selection.facilityBigType_facilityObjCode,
        whCode: selection.facilityStorageAddress,
        //facilityManufacturer: selection.componentName_tdComponentCode,
        dateActivation: selection.dateActivation,
        facilityName: selection.facilityName_facilityObjCode,
        componentName: selection.componentName_tdComponentCode,
        //colId: selection.componentName_tdComponentCode,
        //tdAmount: selection.componentName_tdComponentCode,
        facilityUnit: selection.facilityUnit_facilityObjCode,
      };
      this.selItem(this.selection2);  
    }
  }
}
export default Vue.component('R2CombofieldWx',cfg);
</script>
<style lang="scss">
@import '~@/scss/color';
.combo {
  .content{
    display: flex;
    align-items: center;
  .mater_nature{
      max-width:2.5rem;
      text-overflow:ellipsis;
      overflow: hidden;
  }
  .placeholder{
    color: #757575;
  }
      .icon-right{
         width: .08rem;
         height: .14rem;
         margin-left: .1rem;
    }
  }
}
.trade_pop_part {
  background: #fff !important;
  .trade_pop{
      height:100%;
  }
   // 列表容器
  .pop-list-container {
      width: 100%;
      overflow: hidden;
      box-sizing: border-box;
      height: calc(100% - .46rem);
      /deep/ .scroll-wrapper {
         padding: .05rem .15rem 0;
      }
      // 列表项
      .pop-list-item {
         position: relative;
         display: flex;
         padding: .1rem;
         margin-bottom: .05rem;
         border-radius: .04rem;
         color: #333;
         box-sizing: border-box;
         border-radius: .04rem;
         box-shadow: 0 2px 10px 0 rgba(228, 228, 232, 0.5);
         &.selected {
         border: 1px solid; 
         @include boder_color();
         }
         .trans-item-img{
           width: 1rem;
           margin-right: .1rem;
           img{
             width: .85rem;
           }
         }
         .main {
            // width: 70%;
            .name {
               .name {
                  font-weight: bold;
                  @include font_color();
               }
            }
            .info {
               .label {
                  font-size: .12rem;
                  color: #999; 
                  line-height: .12rem;  
               }
               .value {
                  font-size: .12rem;
                  margin-right: .1rem;
                  line-height: .12rem;
               } 
            }
         }
      }
  }
}
</style>