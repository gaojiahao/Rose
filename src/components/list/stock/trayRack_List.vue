<template>
  <div class="pages bdkcdb-list-conatiner" :class="{'no-add': !action.add}" ref="list">
    <div class="content">
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search="searchList" ref="search"></searchIcon>
        <div class="filter_part">
          <r-sort @on-sort="onSortList" @on-filter="onFilter" :list-id="listId" ref="sort"></r-sort>
        </div>
      </div>
      <r-scroll
        class="list_wrapper"
        :options="scrollOptions"
        :has-next="hasNext"
        :no-data="!hasNext && !listData.length"
        @on-pulling-up="onPullingUp"
        @on-pulling-down="onPullingDown"
        ref="bScroll"
      >
        <div  
          class="list_item"
          v-for="(item, index) in listData" 
          @click="goDetail(item, index)"
          :key="index">
          <div class="trans_info">
            <div >
              <label>交易号：</label>
              <span>{{item.transCode}}</span>
            </div>
            <div style="color: #03A9F4;">
              {{item.biStatus}}
            </div>
          </div>
          <div class="main_info">
            <strong>{{item.whether?'上架':'下架'}}</strong>
          </div>
          <div class="detail_info">
            <div v-for="(d,i) in item.detailItem" :key="i" class="detail_info_item" v-if="i<3">
              <div class="detail_info_item_piccontain">
                <img class="matter_img" :src="getMatterDefault()"  style="width: 85px;display: inline-block;" alt="mater_img">
              </div>
              <div class="detail_info_item_content">
                <div><label>托盘码:</label>{{d.cardCode}}</div>
                <div><label>库区:</label>{{d.warehouseName_storehouseOutCode}}</div>
                <div><label>库位编码:</label>{{d.库位编码}}</div>
              </div>
            </div>
          </div>
          <div class="handler_info vux-1px-t" >
            <div>
              <label>经办人:</label>
              <span>{{item.handlerName}}</span>
            </div>
            <div>
              <div>
              <label>修改时间:</label>
              <span>{{item.modTime}}</span>
            </div>
            </div>
          </div>
        </div>

      </r-scroll>
    </div>
    <add-btn :action="action" :goEdit="goEdit"></add-btn>
  </div>
</template>

<script>
import { getList } from "service/commonService";
import listCommon from "mixins/bizListCommon";

export default {
  data() {
    return {
      listStatus: [
        { name: "全部", status: "" },
        { name: "已生效", status: "已生效" },
        { name: "进行中", status: "进行中" }
      ],
      listViewID: 2310,
      filterList: [
        // 过滤列表
        {
          name: "交易号",
          value: "transCode"
        },
        {
          name: "经办人",
          value: "handlerName"
        },
        {
          name: "物料名称",
          value: "inventoryName_transObjCode"
        }
      ]
    };
  },
  mixins: [listCommon],
  methods: {
     //选择默认图片
      getMatterDefault() {
        let url = require('assets/wl_default03.png');
        return url
      },
     
  },
  created() {}
};
</script>

<style lang='scss' scoped>
@import "~scss/biz-app/bizList";

.list_item{
  color: #333;
  overflow: hidden;
  font-size: .12rem;
  background: #fff;
  position: relative;
  margin: .15rem .1rem;
  border-radius: .04rem;
  box-sizing: border-box;
  padding: .1rem 0 .15rem;
  transition: background-color 200ms linear;
  box-shadow: 0 2px 10px 0 rgba(232, 232, 232, 0.7);

  label{
    color: #9E9E9E;
  }

  .trans_info{
    display: flex;
    justify-content: space-between;
    padding: 0 .10rem;
  }
  .main_info{
    padding: .10rem;
  }
  .detail_info{
    padding:.10rem;
    &_item{
        display: flex;
      &_piccontain{
        .matter_img{
          width: 0.85rem;
        }
      }
      &_content{
        margin-left: .1rem;
        width:calc(100% - 0.95rem);
        line-height: .22rem;
      }
    }
  }
  .handler_info{
    display: flex;
    justify-content: space-between;
    padding: .10rem .10rem 0 .10rem;
  }
}
</style>
