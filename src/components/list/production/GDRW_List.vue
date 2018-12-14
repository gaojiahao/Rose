<template>
  <div class="pages" :class="{'no-add': !action.add}" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search='searchList' ref="search"></searchIcon>
        <div class="filter_part">
          <r-sort @on-sort="onSortList" @on-filter="onFilter" :view-id="listViewID" ref="sort"></r-sort>
          <r-tab @on-click="onTabClick"></r-tab>
        </div>
      </div>
      <r-scroll class="list_wrapper has-sort" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <mater-list-item :item="item" v-for="(item, index) in listData" :key="index" @click.native="goDetail(item, index)" 
                          noCount noPrice isMoreDealer></mater-list-item>
      </r-scroll>
    </div>
    <div class="btn vux-1px-t" v-if="action.add">
      <div class="cfm_btn" @click="goEdit">新增</div>
    </div>
    <pop-assignment-task-work-list :show="popShow" v-model="popShow" @sel-task="selTask" ref="taskWork"></pop-assignment-task-work-list>
    <!-- <pop-task-work-list :show="popShow" v-model="popShow" @sel-task="selTask" ref="taskWork"></pop-task-work-list> -->
  </div>
</template>

<script>
import listCommon from 'pageMixins/bizListCommon'
import PopAssignmentTaskWorkList from 'components/Popup/workList/PopAssignmentTaskWorkList'
export default {
  data() {
    return {
      listStatus: [{name: '全部', status: ''}, {name: '已生效', status: '已生效'}, {name: '进行中', status: '进行中'}],
      listViewID: 2363,
      filterList: [ // 过滤列表
        {
          name: '交易号',
          value: 'transCode',
        }, {
          name: '经办人',
          value: 'handlerName',
        }, {
          name: '成品名称',
          value: 'inventoryName_transObjCode',
        },
      ],
      popShow: false,
    }
  },
  components: {
    PopAssignmentTaskWorkList
  },
  mixins: [listCommon],
  methods: {
    goEdit(){
      this.popShow = true;
    },
    selTask(val){
      let arr = [];
      val.forEach(item => {
        // arr.push({
        //   inventoryCode: item.matCode,
        //   transCode: item.transCode
        // })
        arr.push(item.colId)
      })
      let { name, childId } = this.$route.query,
          { fileId, listId } = this.$route.params;
      this.$router.push({
        path: `/fillform/${fileId}/${listId}`,
        query: {
          name,
          childId,
          // orderTransCode: arr,
          orderId: arr,
        }
      })
    }
  }
}
</script>

<style lang='scss' scoped>
  @import './../../scss/bizList';
</style>
