
<template>
  <div class='filter_part'>
    <div class='sort_part vux-1px-b'>
      <div class='each_sort' v-for="(SItem,SIndex) in sortList" :key="SIndex" @click="sortClick(SItem,SIndex)">
        <div class='sort_name'>{{SItem.name}}
          <div class='arrow'>
            <span class='iconfont icon-shangsanjiao arrow_up' v-show="!SItem.Updirection"></span>
            <span class='iconfont icon-shangsanjiao-copy arrow_up active' v-show="SItem.Updirection"></span>
            <span class='iconfont icon-xiasanjiao1 arrow_down' v-show="!SItem.Downdirection"></span>
            <span class='iconfont icon-sort-up-copy-copy arrow_down active' v-show="SItem.Downdirection"></span>
          </div>
            
          
        </div>
        <!-- <span class='arrow'>
          
        </span>   -->
      </div>
    </div>
    <div class="tab_part vux-1px-b">
      <div class='each_tab' v-for="(TItem,TIndex) in tab" :key="TIndex" @click="switchTab(TItem,TIndex)">
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
            {name:'交易号', key:'transCode',Updirection:false,Downdirection:false},
            {name:'修改时间',key:'modTime',Updirection:false,Downdirection:false},
            {name:'客户名称',key:'modTime',Updirection:false,Downdirection:false},
            {name:'流程状态',key:'modTime',Updirection:false,Downdirection:false}
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
      sortClick(val,i){
        this.sortList.forEach((item,index)=>{
          if(index === i){
            if(!item.Updirection && !item.Downdirection){
              item.Updirection = true;
            }
            else{
              item.Updirection = !item.Updirection;
              item.Downdirection = !item.Downdirection;
            }
          }
          else{
            item.Updirection = false;
            item.Downdirection = false;
          }
        })
        
        let obj = {
          property : val.key,
          direction : val.Updirection ? 'ASC' : 'DESC'
        }
        this.$emit('sort-click',obj)

      }
    },
    watch: {
      
    },
    created() {
      
    }
  }
</script>

<style lang="scss" scoped>
  .vux-1px-b:after,.vux-1px-t:before {
    border-color: #e8e8e8;
  }
  .filter_part{
    color:#757575;
    .sort_part{
      padding: 0.1rem 0.15rem 0.1rem 0.05rem;
      display: flex;
      height: 0.24rem;
      line-height: 0.24rem;
      // align-items: center;
      .each_sort{
        flex: 1;
        padding: 0 0.05rem; 
        font-size:0.14rem;
        text-align: center;
        box-sizing: border-box;
        .sort_name{
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          box-sizing: border-box;
          position: relative;
          display: inline-block;
          max-width: 100%;
          padding-right: 0.08rem;
          .arrow{
            display: inline-block;
            
          }
          .iconfont{
            font-size:0.1rem;
            color:#757575;
            // height: 50%;
            &.active{
              color: #5077aa;
            }
          }
          .arrow_up{
            position: absolute;
            right: 0;
            top:-8%;
            // transform: translateY(-1%)
          }
          .arrow_down{
            position: absolute;
            top:15%;
            right: 0;
            
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


