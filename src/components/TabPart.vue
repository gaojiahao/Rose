
<template>
  <div class='filter_part'>
    <div class='sort_part vux-1px-b'>
      <div class='each_sort' v-for="(SItem, SIndex) in sortList" :key="SIndex" @click="sortClick(SItem)">
        <span class='sort_name'>{{SItem.name}}</span>
        <span class='arrow'>
          <span class='iconfont arrow_up' 
          :class="[SItem.Updirection ? 'icon-shangsanjiao-copy' : 'icon-shangsanjiao']"></span>
          <span class='iconfont arrow_down' 
          :class="[SItem.Downdirection ? 'icon-sort-up-copy-copy' : 'icon-xiasanjiao1']"></span>
        </span>  
      </div>
    </div>
    <div class="tab_part vux-1px-b">
      <div class='each_tab' v-for="(TItem, TIndex) in tab" :key="TIndex" @click="switchTab(TItem,TIndex)">
        <span :class="{'active' : TIndex === activeTabIndex}">{{TItem.name}}</span>
      </div>
    </div>    
  </div>
</template>
<script>
  export default {
    data() {
      return {
        tab:[
          {name: '全部', status: ''}, 
          {name: '已生效', status: '已生效'}, 
          {name: '进行中', status: '进行中'}
        ],
        activeTabIndex : 0,
      }
    },
    props: {
      sortList : {
        type: Array,
        default() {
          return [
            { name: '交易号', key: 'transCode', Updirection: false, Downdirection: false },
            { name: '修改时间', key: 'modTime', Updirection: false, Downdirection: false },
            { name: '客户名称', key: 'modTime', Updirection: false, Downdirection: false },
            { name: '流程状态', key: 'modTime', Updirection: false, Downdirection: false }
          ]
        }
      }
    },
    methods: {
      //切换tab传值
      switchTab(item, index) {
        this.activeTabIndex = index;
        this.$emit('tab-click', item)
      },
      //排序
      sortClick(item, index){
        if(!item.Updirection && !item.Downdirection){
          item.Updirection = true;
        }
        else{
          item.Updirection = !item.Updirection;
          item.Downdirection = !item.Downdirection;
        }
        let obj = {
          property : item.key,
          direction : item.Updirection ? 'ASC' : 'DESC'
        }
        this.$emit('sort-click', obj);
      }
    }
  }
</script>

<style lang="scss" scoped>
  .vux-1px-b:after,.vux-1px-t:before {
    border-color: #e8e8e8;
  }
  .filter_part{
    // padding: 0 0.2rem;
    color:#757575;
    .sort_part{
      padding: 0.1rem 0.15rem 0.1rem 0.05rem;
      display: flex;
      align-items: center;
      .each_sort{
        flex: 1;
        display: flex;
        font-size: .14rem;
        box-sizing: border-box;
        justify-content: center;
        .arrow{
          height: 100%;
          position: relative;
          .iconfont{
            font-size:0.1rem;
            color:#757575;
            &.active{
              color: #5077aa;
            }
          }
          .arrow_up{
            top: 0;
            position: absolute;
          }
          .arrow_down{
            top: .06rem;
            position: absolute;
          }
        }
      }
    }
    .tab_part{
      padding : 0.08rem 0.1rem;
      display: flex;
      justify-content: space-between;
      .each_tab{
        width:28%;
        text-align: center;
        span{
          display: block;
          height: 0.3rem;
          line-height: 0.3rem;
          // color: #666;
          background-color: #f2f2f7;
          border-radius: 0.3rem;
          font-size:0.14rem;
          word-break: break-all;
          &.active{
            background-color: #5077aa;
            color:#fff;
          }
        }
      }
    }
  }
</style>


