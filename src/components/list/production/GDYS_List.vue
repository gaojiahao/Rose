<template>
  <div class="pages" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search='searchList'></searchIcon>
        <div class="filter_part">
          <!--<tab :line-width='2' default-color='#757575' active-color='#2c2727'>
            <tab-item v-for="(item, index) in listStatus" :key="index" :selected="index === activeIndex"
                      @on-item-click="tabClick(item, index)">{{item.name}}
            </tab-item>
          </tab>-->
          <r-sort @on-sort="onSortList"></r-sort>
          <r-tab @on-click="onTabClick"></r-tab>
        </div>
      </div>
      <r-scroll class="list_wrapper has-sort" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <mater-list-item :item="item" v-for="(item, index) in listData" :key="index" @click.native="goDetail(item, index)"
                   noCount noPrice></mater-list-item>
      </r-scroll>
    </div>
    <div class="btn vux-1px-t">
      <div class="cfm_btn" @click="goEdit">新增</div>
    </div>
    <pop-task-work-list :show="popShow" v-model="popShow" @sel-task="selTask" :params="requestParams"
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
            value: 'inventoryName_transObjCode',
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
        let {name} = this.$route.query,
          {fileId, listId} = this.$route.params;
        this.$router.push({
          path: `/fillform/${fileId}/${listId}`,
          query: {
            name,
            inventoryCode: val.matCode,
            proPointCode: val.proPointCode,
          }
        })
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizList';
</style>
