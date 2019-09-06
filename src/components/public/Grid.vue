<template>
  <div class="r-grid">
    <!-- 没有选择物料 -->
    <template v-if="(!values || values.length == 0)&& cfg.readOnly == false && hasDs">
      <div class="no-data-header" @click="showGridPicker">
        <div class="title">{{listTitle||'物料列表'}}</div>
        <div class="seleted_icon">
          请选择
          <span class="icon-right"></span>
        </div>
      </div>
    </template>
    <!-- 已经选择了物料 -->
    <template v-else>
      <div class="has-data-header" @click="toggleEditStatus">
        <div class="title">{{listTitle||'物料列表'}}</div>
        <div v-if="!cfg.readOnly && values && values.length">
          <div class="edit" v-if="!isEdit">管理</div>
          <div class="edit" v-else>完成</div>
        </div>
      </div>
    </template>
    <div class="r-row-ct">
      <div
        class="r-row"
        v-for="(row,rIndex) in values"
        :key="rIndex"
        :class="{row_delete : isEdit,'vux-1px-b' : rIndex < values.length - 1 }"
      >
        <div class="edit-btn-wrapper">
         <span class="icon-matter-bianji" @click.stop="onShowDetail(row,rIndex)" v-show="!isEdit && !cfg.readOnly"></span>
         </div>
        <template v-for="(item, index) in cfg.columns" class="cell when-is-right">
         
          <div class="item" v-if="item.hidden == false" :key="index">
            <span>{{item.text}}：</span>
            <span>{{formatByType(row[item.fieldCode],item.editorType)}}</span>
          </div>
        </template>
        <div @click.stop="onShowDetail(row,rIndex)" class="show-more" v-show="!isEdit && cfg.readOnly">
          查看详情
          <i class="icon-more"></i>
        </div>
        <div class="delete_icon" @click="delClick(rIndex)" v-if="isEdit">
          <x-icon type="ios-checkmark" size="20" class="checked" v-show="isChecked(rIndex)"></x-icon>
          <x-icon type="ios-circle-outline" size="20" v-show="!isChecked(rIndex)"></x-icon>
        </div>
        
      </div>
      <!--row-->
      <div v-show="(!values || values.length == 0) && hasDs" class="no-data">无</div>
    </div>
    <div
      class="add-more-wrapper"
      v-if="!cfg.readOnly && (cfg.allowMutilRow ||cfg.allowAddorDel) && ((values &&values.length) ||!hasDs) && !isEdit"
    >
      <div class="add-more" @click="addRecord">
        <span class="icon-add"></span>
        <span class="add_text">新增</span>
      </div>
    </div>

    <grid-picker v-if="!cfg.readOnly && hasDs" ref="gridPicker" @on-select="addRecords"/>
    <div class="grid-detail-wrapper" v-if="showDetail">
      <grid-detail v-model="showDetail" @on-confirm="doDetailEdit" ref="gridDetail"/>
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
import girdMix from "mixins/grid";
var component = {
  mixins: [girdMix],
  components: { gridPicker },
  props: ["cfg", "values", "btnIsHide"],
  data() {
    return {
      showDetail: false,
      listTitle: "",
      detail: {},
      hasDs:false
    };
  },
  methods: {
    checkAmt() {},
    setValue: function(value) {
      this.$set(this.form.formData, this.name, value);
    },
    getValue: function() {
      return this.form.formData[this.name];
    },
    hasDataSource: function(cfg) {
      return cfg.xtype != "r2Grid";
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
            if(col.dataSource) {
              col.dataSource.data.cols = col.proertyContext.dataSourceCols;
              return col.dataSource.data;
            }
          }
        }
      }
    },
    onShowDetail(row, rowIndex) {
      this.detail = row;
      this.detailRowNumer = rowIndex;
      this.showDetail = true;
    }
  },
  created() {
    var cfg = this.cfg,
      id = cfg.id,
      fieldSet = this.$parent,
      form = fieldSet.form,
      values = this.values,
      name = fieldSet.name;

    form.fieldMap[id] = this;
    this.isGrid = true;
    this.name = name;
    this.listTitle = fieldSet.cfg.cName;
    this.form = form;
    this.containerCode = fieldSet.cfg.name;
    this.dao = dao;//执行公式用;
    this.initDataSource(cfg);
    this.initDefaultValueCfg();
    this.initValueBindAndExpressionCfg();
    this.initEditorParamsCfg();
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
  .edit-btn-wrapper{
    position: relative;
  }
  .icon-matter-bianji {
    width: .28rem;
    height: .28rem;
    position: absolute;
    right: 0;
    top: .03rem;
  }
  .show-more {
    text-align: right;
    color: blue;
    .icon-more {
      display: inline-block;
      width: 0.2rem;
      height: 0.04rem;
    }
  }
  .item {
    display: inline-flex;
    margin-right: 0.2rem;
  }
}
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
.r-grid {
  // 没有物料title样式
  .no-data-header {
    display: flex;
    padding: 0.18rem 0;
    font-size: 0.14rem;
    line-height: 0.14rem;
    justify-content: space-between;
    .title {
      color: #3296fa;
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
      color: #333;
    }
  }
  .add-more-wrapper {
    width: 100%;
    display: flex;
    text-align: center;
    position: relative;
  }
  .add-more {
    display: flex;
    color: #3296fa;
    font-weight: bold;
    text-align: center;
    align-items: center;
    margin: 0 auto 0.2rem;
    border-radius: 0.15rem;
    padding: 0.06rem 0.08rem;
    border: 1px solid #3296fa;
    .icon-add {
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