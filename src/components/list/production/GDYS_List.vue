<template>
  <div class="pages" :class="{'no-add': !action.add}" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search='searchList' ref="search"></searchIcon>
        <div class="filter_part">
          <r-sort @on-sort="onSortList" @on-filter="onFilter" :list-id="listId" ref="sort"></r-sort>
        </div>
      </div>
      <r-scroll class="list_wrapper " :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <mater-list-item :item="item" v-for="(item, index) in listData" :key="index" @click.native="goDetail(item, index)"
                   noCount noPrice :isDealer="false"></mater-list-item>
      </r-scroll>
    </div>
    <add-btn :action="action" :goEdit="goEdit"></add-btn>    <pop-task-work-list :show="popShow" v-model="popShow" @sel-task="selTask" :params="requestParams"
                        work-type="验收" ref="taskWork"></pop-task-work-list>
  </div>
</template>

<script>
  import listCommon from 'pageMixins/bizListCommon'
  import PopTaskWorkList from 'components/Popup/workList/PopTaskWorkList'

  export default {
    components: {
      PopTaskWorkList,
    },
    data() {
      return {
        listStatus: [{name: '全部', status: ''}, {name: '已生效', status: '已生效'}, {name: '进行中', status: '进行中'}],
        listViewID: 2361,
        filterList: [ // 过滤列表
          {
            name: '交易号',
            value: 'transCode',
          }, {
            name: '经办人',
            value: 'handlerName',
          }, {
            name: '成品名称',
            value: 'inventoryName_outPutMatCode',
          },
        ],
        popShow: false,
        requestParams: {
          calc_rel_code: 8051,
          view_id: 'view_96',
        }
      }
    },
    mixins: [listCommon],
    methods: {
      goEdit() {
        this.popShow = true;
      },
      selTask(val) {
        let { name } = this.$route.query,
            { folder, fileName } = this.$route.params;
        this.$router.push({
          path: `/fillform/${folder}/${fileName}`,
          query: {
            name,
            childId,
            inventoryCode: val[0].matCode,
            orderCode: val[0].transCode,
          }
        })
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizList';
</style>
