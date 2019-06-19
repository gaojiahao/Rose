<template>
  <!-- 物料popup -->
  <div v-transfer-dom>
    <popup v-model="showPop" height="80%" class="popup-matter-container" @on-show="onShow" @on-hide="onHide">
      <div class="popup-top">
        <i class="icon-close" @click="onHide"></i>
      </div>
      <div class="matter-list-container">
        <m-search :filterList="filterList" @search='searchList'></m-search>
        <!-- 物料列表 -->
        <r-scroll class="matter-list-wrapper" :options="scrollOptions" :has-next="hasNext"
                  :no-data="!hasNext && !data.length" @on-pulling-up="onPullingUp" ref="bScroll">
          <div class="each-matter" :class="{'vux-1px-b': index !== data.length - 1}"
               v-for="(item, index) in data" :key='index' @click.stop="selThis(item, index)">
            <div class="order-code" v-if="item.transCode && !item.transCode.includes(',')">
              <span class="order_title">{{orderTitle}}：</span>
              <span class="order_num">{{item.transCode}}</span>
            </div>
            <div class="order-matter">
              <i class="icon" :class="[showSelIcon(item) ? 'icon-selected' : 'icon-no-select']"></i>
              <div class="mater_img">
                <img :src="item.inventoryPic" alt="mater_img" @error="getDefaultImg(item)">
              </div>
              <div class="mater_main ">
                <!-- 物料名称 -->
                <div class="mater_name">
                  {{item.inventoryName || item.invName || item.facilityName}}
                </div>
                <!-- 物料基本信息 -->
                <div class="matter_info">
                  <div class="matter_info_item" v-for="(fItem, fIndex) in cols" :key="fIndex">
                    <span class="matter_info_title">{{fItem.v}}:</span>
                    <span class="matter_info_value">{{item[fItem.k] != null && item[fItem.k] !== "" ? item[fItem.k] : "无" }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </r-scroll>
      </div>
      <!-- 底部栏 -->
      <div class="count_mode vux-1px-t">
        <span class="count_num"> {{tmpItems.length ? `已选${tmpItems.length}件` : '请选择'}} </span>
        <span class="count_btn" @click="confirm">确定</span>
      </div>
    </popup>
  </div>
</template>

<script>
    import {Icon, Popup, dateFormat} from 'vux'
    import {getManyVATBilling, getManyVATReceipt, getBillingApplication} from 'service/invoiceService'
    import {requestData} from 'service/commonService'
    import RScroll from 'plugins/scroll/RScroll'
    import MSearch from 'components/search/search'
    import { constants } from 'crypto';

  export default {
    name: "GridPicker",
    props: {
      // 默认值
      defaultValue: {
        type: Array,
        default() {
          return []
        }
      }
    },
    components: {
      Icon, Popup, RScroll, MSearch
    },
    data() {
      return {
        showPop: false,
        searchValue: '', // 搜索框内容
        selItems: [], // 哪些被选中了
        tmpItems: [], // 临时存储
        data: [], // 数据列表
        cols:[],//列表信息
        filterList:[],
        limit: 100, // 每页条数
        page: 1, // 当前页码
        hasNext: true, // 是否有下一页
        scrollOptions: { // 滚动配置
          click: true,
          pullUpLoad: true,
        },
        filterProperty: '', // 过滤的key
        requestMethods: null,
      }
    },
    watch: {
      defaultValue: {
        handler(val) {
          // 默认值改变，重新赋值
          this.setDefaultValue();
        }
      }
    },
    methods: {
      // 弹窗展示时调用
      onShow() {
        this.$nextTick(() => {
          if (this.$refs.bScroll) {
            // 弹窗展示时刷新滚动，防止无法拖动问题
            this.$refs.bScroll.refresh();
          }
        })
      },
      show(){
          this.showPop = true;
      },
      // 弹窗隐藏时调用
      onHide() {
        this.tmpItems = [];
        if(this.showPop)this.showPop = false;
        this.$emit('input', false);
        this.$emit('shut-down-outsidePop', false);
        // 组件传值 传回给search组件 强制关闭下拉框
        this.$event.$emit('shut-down-filter', false);
      },
      // 匹配相同项的索引
      findIndex(arr, sItem) {
        return arr.findIndex(item => item.colId === sItem.colId);
      },
      // 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.findIndex(this.tmpItems, sItem) !== -1;
      },
      // 选择物料
      selThis(sItem, sIndex) {
        // 校验库存
        if (this.isShowStock && sItem.qtyStockBal === 0) {
          this.$vux.alert.show({
            content: '当前订单库存为0，请选择其他订单'
          });
          return
        }
        let arr = this.tmpItems;
        let delIndex = this.findIndex(arr, sItem);
        // 若存在重复的 则清除
        if (delIndex !== -1) {
          arr.splice(delIndex, 1);
          return;
        }
        arr.push(sItem);
      },
      // 确定选择项
      confirm() {
        let sels = [];
        this.showPop = false;
        this.tmpItems.sort((a, b) => b.effectiveTime - a.effectiveTime);
        this.selItems = [...this.tmpItems];
        // 触发父组件选中事件
        this.$emit('on-select', this.selItems);
      },
      // 获取默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default03.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      initStore:function(){
          var me = this,
              ds = this.$parent.dataSource,
              cols = ds.cols,
              hFieldKeys =  ds.hFields || [],
              col,
              fields = [],
              store = {
                  url:ds.url,
                  params:{}
              },
              i,l,
              autoLoad = true;
          
          setParams(ds.params);

          this.store = store;

          for(i =0,l= cols.length;i<l;i++){
             col = cols[i];
             if(hFieldKeys.indexOf(col.k) ==-1){
                 fields.push(col);
             }
          }
          this.cols = fields;

          if(autoLoad)this.requestData();

        function setParams(params){
            var  paramCfg,
                    key,
                    valueField,
                    contrl,
                    value,
                    contrlId;

            if(params)for(key in params){
                paramCfg = params[key];
                if(paramCfg.type == 'contrl'){
                    contrlId = paramCfg.value.contrl;
                    valueField = paramCfg.value.valueField;
                    contrl = me.form.fieldMap[contrlId];
                    value = contrl.getExtraFieldValue(valueField);
                    if(value == null){
                    autoLoad = false;
                    }
                    store.params[key] = value;
                    me.form.$on('value-change-' + contrlId,(function(paramKey,valueField){
                    return function(){
                        var arg = Array.prototype.slice.call(arguments);
                        arg.unshift(paramKey,valueField);
                        me.paramChangeHandler.apply(me,arg);
                    }
                    })(key,valueField));
                } else if(paramCfg.type == 'text'){
                    store.params[key] = paramCfg.value;
                }
            }
        }
          
      },
      // 获取物料列表
      requestData() {
        let filter = [];
        //成品,商品,服务
        if (this.searchValue) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.searchValue,
              property: this.filterProperty,
            },
          ];
        }
        let data = {
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
          ...this.store.params,
        }
        return requestData({
          url: this.store.url,
          data
        }).then(this.dataHandler);
      },
      // 搜索物料
      searchList({val = '', property = ''}) {
        this.srhInpTx = val;
        this.filterProperty = property;
        this.resetCondition();
        this.requestData()
      },
      // 删除选中项
      delSelItem(dItem) {
        let delIndex = this.findIndex(this.selItems, dItem);
        if (delIndex !== -1) {
          this.selItems.splice(delIndex, 1);
        }
        this.tmpItems = [...this.selItems];
      },
      // 上拉加载
      onPullingUp() {
        this.page++;
        this.requestData();
      },
      paramChangeHandler(paramKey,valueField,control){
            var value = control.getExtraFieldValue(valueField),
                store = this.store,
                key;

            if(value != null){
               store.params[paramKey] = value;
            }
            for(key in store.params){
                if(store.params[key] == null)return;
            }
            this.data = [];
            this.page = 1;
            this.requestData();
      },
      // 设置默认值
      setDefaultValue() {
        this.tmpItems = [...this.defaultValue];
        this.selItems = [...this.defaultValue];
      },
      // 共用的数据处理方法
      dataHandler({dataCount = 0, tableContent = []}) {
        tableContent.forEach(item => {
          item.inventoryPic = item.inventoryPic ? `/H_roleplay-si/ds/download?url=${item.inventoryPic}&width=400&height=400` : this.getDefaultImg();
        });
        let {relationKey = ''} = this.$route.query;
        if (relationKey) {
          this.selItems = [...tableContent];
          this.$emit('sel-matter', JSON.stringify(this.selItems));
        }
        this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
        this.data = this.page === 1 ? tableContent : [...this.matterList, ...tableContent];
        this.$nextTick(() => {
          this.$refs.bScroll.finishPullUp();
        })
      },
      // 初始化条件
      resetCondition() {
        this.matterList = [];
        this.page = 1;
        this.hasNext = true;
        this.$refs.bScroll.scrollTo(0, 0);
      },
    },
    created() {
      this.form = this.$parent.form;
      this.initStore();
      this.setDefaultValue();
    }
  }
</script>

<style lang="scss">
  @import '~@/scss/color';

  // 弹出层
  .popup-matter-container {
    background: #fff;
    .popup-top {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-bottom: -.08rem;
      padding: 0 .15rem;
      height: .4rem;
      background-color: #fff;
      .icon-close {
        display: inline-block;
        width: .14rem;
        height: .14rem;
      }
    }
    .matter-list-container {
      height: calc(100% - .82rem);
      /deep/ .search_filter {
        top: .8rem;
        .layer {
          background: #ccc;
        }
      }
    }
    // 物料列表
    .matter-list-wrapper {
      width: 100%;
      overflow: hidden;
      box-sizing: border-box;
      height: calc(100% - .5rem);
      /* 使用深度作用选择器进行样式覆盖 */
      /deep/ .scroll-wrapper {
        padding: 0 .15rem;
      }
      // 每个物料
      .each-matter {
        position: relative;
        padding-bottom: .2rem;
        color: #333;
        box-sizing: border-box;
        &:after {
          border-color: #e8e8e8;
        }
        .order-code {
          display: flex;
          margin-top: .18rem;
          line-height: .14rem;
          color: #fff;
          font-size: .12rem;
          .order_title {
            color: #999;
          }
          .order_num {
            color: #696969;
          }
        }
        .order-matter {
          position: relative;
          display: flex;
          margin-top: .16rem;
          padding-left: .35rem;
        }
        .icon {
          position: absolute;
          top: .35rem;
          left: 0;
          z-index: 1;
          display: inline-block;
          width: .2rem;
          height: .2rem;
        }
        // 物料图片
        .mater_img {
          display: inline-block;
          width: .9rem;
          height: .9rem;
          img {
            width: 100%;
            max-height: 100%;
          }
        }
        // 物料主体
        .mater_main {
          flex: 1;
          padding-left: .12rem;
          box-sizing: border-box;
          display: inline-block;
          // 物料名称
          .mater_name {
            line-height: .2rem;
            max-height: .46rem;
            overflow: hidden;
            font-size: .12rem;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            text-overflow: ellipsis;
            -webkit-box-orient: vertical;
          }
          // 物料信息
          .matter_info {
            /*word-break: break-all;*/
            display: flex;
            flex-wrap: wrap;
            line-height: .12rem;
            font-size: .12rem;
          }
          .matter_info_item {
            margin: .08rem .08rem 0 0;
          }
          .matter_info_title {
            color: #999;
          }
          .matter_info_value {
            flex: 1;
          }
        }
      }
    }

    // 底部栏
    .count_mode {
      position: fixed;
      bottom: 0;
      left: 0;
      display: flex;
      width: 100%;
      height: .5rem;
      line-height: .5rem;
      background: #fff;
      &:before {
        border-color: #d9d9d9;
      }
      .count_num {
        flex: 2.5;
        padding-left: .15rem;
        color: #333;
        font-size: .12rem;
      }
      .count_btn {
        flex: 2;
        background-color: $main_color;
        color: #fff;
        text-align: center;
        font-size: .16rem;
      }
    }
  }
</style>
