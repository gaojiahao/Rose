<template>
<div v-show="!hidden" class="cell each_property vux-1px-b combo" >
  <label :class="{'required':!cfg.allowBlank,'readonly':cfg.readOnly}">{{cfg.fieldLabel}}</label>
    <div v-if="cfg.readOnly == false" class="content" @click="showPop = true">
      <span class='mater_nature' :class="{placeholder:!values[cfg.fieldCode]}">{{values[cfg.fieldCode] || "请选择"}}</span>
      <span class="icon-right"></span>
    </div>
    <span v-else >{{values[cfg.fieldCode] == null ? '无' : values[cfg.fieldCode]}}</span>
    <div v-transfer-dom>
      <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
        <div class="trade_pop">
          <d-search @search="searchList" @turn-off="onHide" :isFill="true" :defaultValue="searchValue" :searchBoxShows="searchBoxShow"></d-search>
          <!-- 往来列表 -->
          <r-scroll class="pop-list-container" :options="scrollOptions" :has-next="hasNext"
                    :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown" @search-box-show="searchBox" ref="bScroll">
            <div class="pop-list-item" v-for="(item, index) in listData" :key='index' @click.stop="selItem(item, index)" :class="{selected: showSelIcon(item)}">
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
        listData:[],
        fields:[],//可以显示的列。
        hasNext: true,
        selection:null,
        scrollOptions: { // 滚动配置
          pullUpLoad: true,
          pullDownRefresh: true,
        },
        searchBoxShow:true,
      }
    },
    methods:{
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

      
      setParams(ds.data.params);

      this.store = store;

      if(me.cfg.xtype == 'r2Selector'){
          for(i =0,l= dataSourceCols.length;i<l;i++){
            col = dataSourceCols[i];
            if(hFieldKeys.indexOf(col.k) ==-1){
                fields.push(col);
            }
          }
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
                    me.form.$on('field-change-' + paramCfg.value.dataIndex,(function(paramKey,valueField){
                          return function(){
                            var arg = Array.prototype.slice.call(arguments);
                            arg.unshift(paramKey,valueField);
                            me.paramChangeHandler.apply(me,arg);
                          }
                    })(key,valueField))
                }
              }
          } else if(paramCfg.type == 'text'){
              value = paramCfg.value;
              if (value.match(reg)) {
                value = me.getRegParam(value,reg);
              }
              store.params[key] = value;
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

      this.blankText = '请选择'+cfg.fieldLabel;
      if(value != null){
          if(cfg.xtype != 'r2Combo')this.searchValue = ''+value;
          this.$once('load',this.checkValueOnLoad)
      }
    },
    load:function(cb){
      var store = this.store,
          filter,
          data = {
            limit: this.limit,
            page: this.page,
            start: (this.page - 1) * this.limit
          }
      
      if (this.searchValue) {
          filter = [
            {
            operator: 'like',
            value: this.searchValue,
            property: this.cfg.displayField,
            }
          ];
          data.filter = JSON.stringify(filter);
      };
      data = {...data,...store.params};
      $flyio.ajax({
          url: this.store.url,
          data
      }).then(({dataCount = 0, tableContent = []}) => {
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.listData = this.page === 1 ? tableContent : [...this.listData, ...tableContent];
          this.$nextTick(() => {
              if (this.$refs.bScroll) {
                this.$refs.bScroll.finishPullUp();
              }
          });
          this.$emit('load',this.listData);
          if(cb)cb();
      })
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
      this.load(this.validOrSetSelection);
    },
    reSet:function(){
      this.selection = null;
      this.value = null;
      this.setValue(null);
    },

    searchList({val}){
      this.searchValue = val;
      this.page = 1;
      this.load();
    },
    selItem(item){
      this.selection = item;
      this.showPop = false;
      this.value = item[this.cfg.valueField];
      this.setValue(this.value);
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
          // selection = listData.find(function(item){
          //   console.log('valueField',valueField)
          //     return item[valueField] === value;
          // });
          selection = listData[0];
          this.selItem(selection);
          if(selection == null) {
            this.reSet();
            if(listData.length) {
              selection = listData[0];
              this.selItem(selection);
            }
          }
      } else if(listData.length){
          selection = listData[0];
          this.selItem(selection);
      }
    },
    searchBox(data){
      this.searchBoxShow = data;
    }
  },
  created(){
    this.initCombo();
    this.buildStore();
  } 
}
export default Vue.component('R2Combofield',cfg);
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
    color: #999
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
         padding: .15rem;
         margin-bottom: .2rem;
         border-radius: .04rem;
         color: #333;
         box-sizing: border-box;
         border-radius: .04rem;
         box-shadow: 0 2px 10px 0 rgba(228, 228, 232, 0.5);
         &.selected {
         border: 1px solid $main_color; 
         }
         .main {
            .name {
               .name {
                  font-weight: bold;
                  color: #3296FA;   
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