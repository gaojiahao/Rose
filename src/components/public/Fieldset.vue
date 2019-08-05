<template>
  <div v-if = "!hidden" class="r-fieldset">
    <div class="box" :class="{muti:cfg.isMultiple}">
      <header v-show="!cfg.isMultiple">
        <div class="vux-1px-l">{{cfg.cName}}</div>
        <div class="basic_process_status">
          <span v-if="hasToogleBar" @click="toggleStyleType()" class="barWrapp">
            <i class="style-toogleBar" :class="styleType?'icon-up':'icon-down'"></i>
          </span>
        </div>
      </header>
      <div class="readOnlyPart" v-if="readOnlyParts.length && styleType == 0">
        <template v-for="(item, index) in readOnlyParts">
          <div class="item" :key="index">
            <span >{{item.fieldLabel}}：</span>
            <span >{{formatByType(values[item.fieldCode],item.xtype)}}</span>
          </div>
        </template>
      </div>
      <template v-for="(item, index) in editParts">
        <r2Textfield :cfg="item" :values="values" v-if="item.xtype == 'r2Textfield'" :key="index"/>
        <r2TextArea :cfg="item" :values="values" v-if="item.xtype == 'r2TextArea'" :key="index"/>
        <!-- 暂时用textfield RNumber 还没有只读状态下的视图 -->
        <r2Numberfield
          :cfg="item"
          :values="values"
          v-if="item.xtype == 'r2Numberfield'"
          :key="index"
        />
        <r2Permilfield
          :cfg="item"
          :values="values"
          v-if="item.xtype == 'r2Permilfield'"
          :key="index"
        />
        <r2Datefield :cfg="item" :values="values" v-if="item.xtype == 'r2Datefield'" :key="index"/>
        <r2Combofield
          :cfg="item"
          :values="values"
          v-if="['r2Selector','r2Combo'].indexOf(item.xtype)!=-1"
          :key="index"
        />
        <r-grid
          :cfg="item"
          :values="values[cfg.name]"
          v-if="item.xtype.indexOf('Grid') != -1"
          :key="index"
        />
      </template>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import util from '@/common/util';
var component = {
  props: ["cfg", "values"],
  data() {
    return {
      hidden:false,
      submitValue:true,
      styleType: 0, //0||1，折叠||展开
      title: null,
      pageSize: 5,
      visibleItemsLength: 0, //
      hasToogleBar: false,
      editParts: [],
      readOnlyParts: []
    };
  },
  created: function() {
     var cfg = this.cfg;

     this.name = cfg.name;
     this.hidden = cfg.hiddenInRun;
     this.submitValue = cfg.submitValue;
     this.form = this.$parent.form;
     this.buildItems();
     this.initWatch(cfg.watch);
  },
  methods: {
    buildItems(){
       // *部分应用* 物料详情在审批节点可以重新录入数据 此处进行数据分割
        let cfg = this.cfg,
            { items = [], columns = [] } = cfg,
            formModel = this.form.model;

        let readOnlyParts = [],
            i = 0;
          
        if(cfg.layout != "fit"){

            items.forEach(item => {
              if (item.readOnly == true &&!item.hiddenInRun) {
                readOnlyParts.push(item);
              }
              if (!item.hiddenInRun) i++;
            });

            this.visibleItemsLength = i;
            this.readOnlyParts = readOnlyParts; // 只读部分

            if (formModel == "new" || this.visibleItemsLength <= this.pageSize) {
              this.styleType = 1;
            } else {
              this.styleType = this.readOnlyParts.length > this.pageSize ? 0 : 1;
            }
            this.hasToogleBar = !this.styleType;
        }

        this.editParts = items; // 可编辑部分 
    },
    formatByType(value,type){
      if(value == null) return '无';
      if(~['r2Numberfield','r2Permilfield'].indexOf(type)){
        return util.permilFormat(value);
      } else {
        return value
      }
    },
    getValues(){
      var items = this.$children,
          i,l=items.length,
          item,
          values = {};
      
      for(i=0;i<l;i++){
        item = items[i];
        if (item.submitValue){
            values[item.cfg.fieldCode] = item.getValue();
        }
      }

      return values;
    },
    initWatch(watch){
        var me = this,
            cfgArr;

        if(!watch) return;
        try{
            cfgArr = JSON.parse(watch);
        }catch(e){
            console.log('watch解析bug');
            return null;
        }
        util.each(cfgArr,(cfg)=>{
            var key = cfg.computed,
                bind = util.trim(cfg.bind),
                fn;
            
            if(bind){
                fn = createBindFn(bind);
            }else{
                try{
                    fn = eval('('+ cfg.fn +')');
                } catch(e) {
                    console.log('watch[' + key +']语法bug');
                }
            }
            this.form.$watch(key,fn,{immediate:true});
        });

        function createBindFn(bind){
            return function(value){
                me['set'+ bind[0].toUpperCase()+bind.substr(1)](value);
            }
        }
    },
    setHidden(hidden){
       this.hidden = hidden;
    },
    setSubmitValue(submitValue){
      this.submitValue = submitValue;
    },
    toggleStyleType() {
      this.styleType = this.styleType ? 0 : 1;
      this.$emit("change-styleType", this.styleType);
    },
  }
};
export default Vue.component("RFieldset", component);
</script>

<style lang="scss">
@import "~@/scss/color";
.r-fieldset {
  color: #333;
  margin: 0.1rem;
  border-radius: 0.04rem;
  background-color: #fff;
  width: calc(100% - 0.2rem);
  .box {
    padding: 0.15rem;
    &.muti{
      padding: 0 0.15rem;
    }
  }
  
  header {
    display: flex;
    align-items: center;
    margin-bottom: 0.1rem;
    justify-content: space-between;
    div:first-child {
      font-size: 16px;
      font-weight: 600;
      line-height: 0.16rem;
      &:before {
        left: -0.15rem;
        width: 0.08rem;
        border-left: 0.08rem solid #3296fa;
      }
    }
  }

  .readOnlyPart {
    line-height: 0.22rem;
    font-size: 0.12rem;
    span:nth-child(2n + 1) {
      color: #aaa;
    }
    span:nth-child(2n) {
      font-weight: 400;
      font-size: 0.13rem;
    }
    .item {
      display: inline-flex;
      margin-right: 0.2rem;
    }
  }
  .each_property {
    height: 0.3rem;
    padding: 0;
    font-size: 0.13rem;
    line-height: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    white-space: nowrap;
    overflow: hidden;
    label {
      &.required {
        font-weight: bold;
        color: $main_color;
      }
      &.readonly{
         color: #999;
      }
    }
    :after {
      border-color: #e8e8e8;
      left: 0;
    }
    input {
      flex: 1;
      font-size: 0.14rem;
      margin-left: 0.05rem;
      outline: none;
      border: none;
      text-align: right;
    }
  }
  .barWrapp {
    display: block;
    width: 0.3rem;
  }
  .style-toogleBar {
    width: 0.14rem;
    height: 0.08rem;
    display: inline-block;
  }
}
</style>