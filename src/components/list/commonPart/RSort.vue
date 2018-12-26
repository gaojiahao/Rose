<template>
  <div class='sort-part vux-1px-b'>
    <div class='each-sort' :class="{'active' : property === SItem.key}" v-for="(SItem, SIndex) in data" :key="SIndex"
         @click="sortClick(SItem, SIndex)">
      <div class='sort_name'>{{SItem.name}}</div>
      <div class='arrow' v-if="SItem.key">
        <span class='arrow_up'
            :class="[property === SItem.key && sort === 'ASC' ? 'icon-up-fill' : 'icon-up']"></span>
        <span class='arrow_down'
            :class="[property === SItem.key && sort === 'DESC' ? 'icon-down-fill' : 'icon-down']"></span>
      </div>
    </div>
    <div class="filter-part" @click="showFilter = true" :class="{ active : this.timeFilter.startDate || this.timeFilter.endDate || Object.keys(this.fieldVlaue).length}"> 
      <span class="filter_name">筛选</span>
      <span class="icon-filter"></span>
    </div>
    <div v-transfer-dom>
      <popup position="right" v-model="showFilter" @on-hide="onHide" @on-show="onShow">
        <div class="filter-container-part">
          <r-scroll class="list_wrapper" :options="scrollOptions" ref="bScroll">
            <!-- 流程状态 -->
            <div class="process-status-container basic-mod" v-if="filtersList.biProcessStatus && filtersList.biProcessStatus.value.length">
              <div class="filter_title vux-1px-b">{{filtersList.biProcessStatus.alias}}</div>
              <div class="process_status">
                <div class="each_status"  :class="{'active vux-1px' : showSelIcon(item,'biProcessStatus')}"
                v-for="(item, index) in filtersList.biProcessStatus.value" :key="index"
                @click="selProcee(item,'biProcessStatus',index)">
                  <div class="status_content">{{item}}</div>
                </div>          
              </div>
            </div>
            <!-- 时间 -->
            <div class="time-filter-container vux-1px-b">
              <div class="filter_title">时间段</div>
              <div class="time_filter">
                <div class="each_time" :class="{'active' : timeFilter.startDate}" @click="getStart">
                  {{timeFilter.startDate || '开始日期'}}
                </div>
                <span class="symbol"></span>
                <div class="each_time" :class="{'active' : timeFilter.endDate}" @click="getEnd">
                  {{timeFilter.endDate || '结束日期'}}
                </div>
              </div>
            </div>
            <div class="process-status-container vux-1px-b" v-for="(val,key,index) in filtersList" :key="index" v-if="val.alias !== '流程状态' && val.value.length">
              <div class="process-wrapper">
                <div class="filter_title " @click="val.showAll = !val.showAll">
                  <span>{{val.alias}}</span>
                  <span class="arrow icon-filter-down" :class="{'icon-filter-up' : val.showAll}"></span>
                </div>
                <div class="process_status">
                  <div class="each_status"  :class="{'active vux-1px' : showSelIcon(item,key)}"
                  v-for="(item, index) in val.value" :key="index"
                  @click="selProcee(item,key)" v-show="index < 3 || val.showAll">
                    <div class="status_content">{{item}}</div>
                  </div>          
                </div>
              </div>  
            </div>
          </r-scroll>
          <div class="handle-part vux-1px-t">
            <span class="reset_btn" @click="filterReset">重置</span>
            <span class="confirm_btn" @click="filterConfirm">确定</span>
          </div>        
        </div>
      </popup>
    </div>
  </div>
</template>

<script>
// vux组件引入
import { Popup, TransferDom, dateFormat } from 'vux'
// 组件引入
import RScroll from 'components/RScroll'
// 请求引入
import { getProcessStatus } from 'service/commonService'
import { filterFields } from 'service/listService'
export default {
  name: "RSort",
  components: { Popup, RScroll},
  props: {
    data: {
      type: Array,
      default() {
        return [
          { name: '综合', key: '' },
          { name: '交易号', key: 'transCode' },
          { name: '修改时间', key: 'modTime' },
          // { name: '流程状态', key: 'processSort' }
        ]
      }
    },
    viewId: {
      type: Number,
      default: 2190
    },
  },
  data() {
    return {
      sort: '',     // 排序机制 （倒序 DESC / 正序 ACS）
      toDay: '',
      preDate: '',
      property: '', // 被选中的字段
      fieldVlaue: {}, // 被选中的流程状态
      showFilter: false,  // 是否展示筛选
      timeFilter: {
        startDate: '',
        endDate: '',
      },
      lastFilter: {}, //上次的过滤条件，用于判断列表是否需要刷新
      scrollOptions: {
        click: true,
      },
      filtersList:{}
    }
  },
  methods: {
    // 排序
    sortClick(item, i) {
      if(this.property === item.key){
        // 排序转变
        this.sort = this.sort === 'ASC' 
          ? 'DESC'
          : 'ASC'
      }
      else{
        // 默认为正序
        this.sort = 'ASC' 
      }
      this.property = item.key;
      this.$emit('on-sort', {
        property: item.key,
        direction: this.sort,
      });
    },
    onShow(){
      this.$nextTick(() => {
        if (this.$refs.bScroll) {
          this.$refs.bScroll.refresh();
        }
      })
      this.lastFilter = {
        timeFilter: JSON.parse(JSON.stringify(this.timeFilter)),
        otherFilter: JSON.parse(JSON.stringify(this.fieldVlaue))
      };
    },
    // pop关闭时，判断过滤条件是否改变，改变则重新请求列表
    onHide() {
      let isRefreshList = false;
      // 时间过滤发生改变
      if(this.timeFilter.startDate !== this.lastFilter.timeFilter.startDate || this.timeFilter.endDate !== this.lastFilter.timeFilter.endDate) {
        isRefreshList = true;
      } 
      let str1 = JSON.stringify(this.fieldVlaue),
          str2 = JSON.stringify(this.lastFilter.otherFilter);
      // 其他过滤发生改变
      if(str1 !== str2) {
        isRefreshList = true;
      }
      if(isRefreshList) {
        this.$emit('on-filter', {
          timeFilter: this.timeFilter,
          otherFilter: this.fieldVlaue
        })
      }
    },
    // TODO 匹配相同项的索引
    showSelIcon(sItem,key) {
      if(this.fieldVlaue[key]){
        return this.fieldVlaue[key].value.findIndex(item => item === sItem) !== -1;
      }
    },
    // 选择流程状态
    selProcee(sItem, key) {
      if(this.fieldVlaue[key]){
        let arr = this.fieldVlaue[key].value;
        let delIndex = arr.findIndex(item => item === sItem);
        // 若存在重复的 则清除
        if (delIndex !== -1) {
          arr.splice(delIndex, 1);
          //当值为空是，删除该过滤条件
          if(!arr.length) { 
            delete this.fieldVlaue[key]
          }
          return;
        }
        arr.push(sItem);
      }
      else{
        let obj = {
          alias: this.filtersList[key].alias,
          value: [sItem]
        }
        this.$set(this.fieldVlaue,key,{...obj})
      }
    },  
    // 起始日期
    getStart() {
      this.$vux.datetime.show({
        cancelText: '取消',
        confirmText: '确定',
        value: this.timeFilter.startDate,
        endDate: this.preDate,
        onConfirm: (val) => {
          this.timeFilter.startDate = val;
        }
      })
    },
    // 截止日期
    getEnd() {
      this.$vux.datetime.show({
        cancelText: '取消',
        confirmText: '确定',
        value: this.timeFilter.endDate,
        endDate: this.toDay,
        onConfirm: (val) => {
          this.timeFilter.endDate = val;
        }
      })
    },
    // 筛选确定
    filterConfirm() {
      this.showFilter = false;
    },
    // 重置筛选
    filterReset() {
      this.timeFilter = {
        startDate: '',
        endDate: ''
      }
      this.fieldVlaue = {}
    },
    // 请求过滤字段
    getFilterFields(){
      filterFields(this.viewId).then(data=>{
        for(let key in data){
          data[key].showValue = data[key].value.slice(0,9);
          data[key].showAll = false;
        }
        this.filtersList = {...data};
      })
    }
  },
  created(){
    let { listId } = this.$route.params;
    this.toDay = dateFormat(new Date(),'YYYY-MM-DD');
    this.preDate = dateFormat(new Date(new Date().getTime() - 24*60*60*1000), 'YYYY-MM-DD');
    this.getFilterFields()
    
  }
}
</script>

<style scoped lang="scss">
.vux-1px-b:after,.vux-1px-t:before {
  border-color: #e8e8e8;
}
.vux-1px:before {
  width: 176%;
  border-radius: .4rem;
  border-color: #5077aa;
}
/deep/ .vux-popup-dialog {
  background: #fff;
  overflow-y: auto;
} 
.sort-part {
  display: flex;
  padding: 0 .2rem;
  justify-content: space-between;
  .each-sort {
    padding: .08rem .05rem .14rem;
    color: #333;     
    display: flex;
    font-size: .14rem;
    line-height: 0.14rem;
    box-sizing: border-box;
    border-bottom: 2px solid #fff;
    .arrow {
      height: 100%;
      position: relative;
      span{
        width: .06rem;
        height: .04rem;
      }
      .arrow_up {
        top: .01rem;
        left: .04rem;
        position: absolute;
      }
      .arrow_down {
        bottom: .01rem;
        position: absolute;
        left: .04rem;
      }
    }
    &.active  {
      color: #3296FA;
      border-color: #3296FA;
    }
  }
  .filter-part {
    @extend .each-sort;
    align-items: center;
    &.active{
      color: #3296FA;
    }
    .icon-filter{
      width: .11rem;
      height: .12rem;
      margin-left: .04rem;
    }
  }
}
.filter-container-part {
  width: 3.05rem;
  height: 100%;
  font-size: .12rem;
  // overflow: auto;
  position: relative;
  box-sizing: border-box;
  .list_wrapper{
    height: calc(100% - 0.48rem);
    overflow: hidden;
  }
  .basic-mod {
    margin-bottom: .15rem;
  }
  .filter_title {
    color: #666;
    font-size: .12rem;
    padding: 0  0 .17rem .06rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .arrow{
      display: inline-block;
      width: .12rem;
      height: .06rem;
      transition: transform 200ms linear;
      &.icon-filter-up {
        transform: rotate(-180deg);
      }
    }
  }
  .process-status-container { 
    .process-wrapper{
      padding: .17rem .23rem .08rem .24rem;
    }
    .process_status {
      overflow: hidden;
      display: flex;
      flex-flow: wrap;
      .each_status {
        width: .7rem;
        height: .36rem;
        border-radius: .04rem;
        color: #333;
        line-height: .36rem;
        text-align: center;
        margin: 0  .16rem .14rem 0;
        box-sizing: border-box;
        background: #F4F4F4;
        .status_content {
          overflow: hidden;
          padding: 0 .05rem;
          white-space: nowrap; 
          text-overflow: ellipsis;
        }    
      }
    }
  }
  .time-filter-container {
    padding: .18rem .39rem .22rem .24rem;
    .time_filter {
      display: flex;
      align-items: center;
      .each_time {
        width: 1.06rem;
        height: .31rem;
        background: #F4F4F4;
        color: #999;
        text-align: center;
        line-height: .31rem;
        border-radius: .04rem;
        &.active {
          color: #111;
          border: 1px solid #3296FA;
          background: #fff;
          color: #3296FA;
        }
      }
      .symbol{
        width: .1rem;
        height: 1px;
        background: #d9d9d9;
        margin: .15rem .1rem;
      }
    }
  }
  .handle-part {
    right: 0;
    bottom: 0;
    display: flex;    
    width: inherit;
    height: .44rem;
    position: absolute;    
    line-height: .44rem;
    span {
      flex: 1;
      text-align: center;
    }
    .reset_btn {
      background: #F4F4F4;
      color: #666;
    }
    .confirm_btn {
      color: #FFF;
      background: #3296FA;
    }
  }
}
</style>
