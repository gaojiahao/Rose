<template>
  <div class='sort-part vux-1px-b'>
    <div class='each-sort' :class="{'active' : property === SItem.key}" v-for="(SItem, SIndex) in data" :key="SIndex"
         @click="sortClick(SItem, SIndex)">
      <span class='sort_name'>{{SItem.name}}</span>
      <span class='arrow' v-if="SItem.key">
          <i class='iconfont arrow_up'
             :class="[property === SItem.key && sort === 'ASC' ? 'active icon-shangsanjiao-copy' : 'icon-shangsanjiao']"></i>
          <i class='iconfont arrow_down'
             :class="[property === SItem.key && sort === 'DESC' ? 'active icon-sort-up-copy-copy' : 'icon-xiasanjiao1']"></i>
      </span>
    </div>
    <div class="filter-part" @click="showFilter = true" :class="{ active : this.timeFilter.startDate || this.timeFilter.endDate || Object.keys(this.fieldVlaue).length}"> 
      <span class="filter_name">筛选</span>
      <span class="iconfont icon-shaixuan"></span>
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
            <div class="time-filter-container basic-mod">
              <div class="filter_title vux-1px-b">时间段</div>
              <div class="time_filter">
                <div class="each_time" :class="{'active' : timeFilter.startDate}" @click="getStart">
                  {{timeFilter.startDate || '开始日期'}}
                </div>
                <div class="placeholder-part vux-1px-t"></div>
                <div class="each_time" :class="{'active' : timeFilter.endDate}" @click="getEnd">
                  {{timeFilter.endDate || '结束日期'}}
                </div>
              </div>
            </div>
            <div class="process-status-container basic-mod" v-for="(val,key,index) in filtersList" :key="index" v-if="val.alias !== '流程状态' && val.value.length">
              <div>
                <div class="filter_title vux-1px-b" @click="val.showAll = !val.showAll">
                  <div>{{val.alias}}</div>
                  <div class="arrow">
                   <span>全部</span>
                   <span class="iconfont icon-xia" :class="{'arrow-up' : val.showAll}"></span>
                  </div>  
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
          <div class="handle-part">
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
.vux-1px-b:after {
  border-color: #e8e8e8;
}
.vux-1px:before {
  width: 176%;
  border-radius: .4rem;
  border-color: #5077aa;
}
/deep/ .vux-popup-dialog {
  background: #F6F6F6;
  overflow-y: auto;
} 
.active  {
  color: #5077aa;
  font-weight: bold;
}  
.sort-part {
  display: flex;
  padding: .1rem;
  height: 0.24rem;
  line-height: 0.24rem;
  .each-sort {
    flex: 1;
    color: #111;      
    display: flex;
    font-size: .14rem;
    font-weight: bold;
    box-sizing: border-box;
    justify-content: center;
    .arrow {
      height: 100%;
      position: relative;
      .iconfont {
        font-size: .1rem;
        color: #757575;
        &.active {
          color: #5077aa;
          font-weight: bold;
        }
      }
      .arrow_up {
        top: -.02rem;
        position: absolute;
      }
      .arrow_down {
        top: .04rem;
        position: absolute;
      }
    }
    span + span {
      margin-left: .02rem;
      color: #757575;
    }
    &.active  {
      color: #5077aa;
      font-weight: bold;
    }
    &:first-child{
      flex: 0.6;
    } 
    // &:nth-child(2){
    //   flex: 0.8;
    // }
  }
  .filter-part {
    @extend .each-sort;
    // flex: 0.7;
    // justify-content: flex-end;
    &.active{
      color: #5077aa;
    }
  }
}
.filter-container-part {
  width: 3rem;
  height: 100%;
  // overflow: auto;
  position: relative;
  box-sizing: border-box;
  .list_wrapper{
    height: calc(100% - 0.6rem);
    overflow: hidden;
  }
  .basic-mod {
    margin-bottom: .15rem;
  }
  .filter_title {
    color: #111;
    font-size: .18rem;
    font-weight: bold;
    margin-bottom: .1rem;
    padding-bottom: .04rem;
    padding-right: .07rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .arrow{
      font-size: .12rem;
      color: #757575;
      font-weight: normal;
      display: flex;
      align-items: center;
      // align-content: flex-end;
      .icon-xia{
        display: inline-block;
        color: #757575;
        font-size: .12rem;
        margin-left: .05rem;
        transition: transform 200ms linear;
        &.arrow-up {
          transform: rotate(-180deg);
        }
      }
    }
  }
  .process-status-container {
    padding: .1rem 0 0 .1rem;
    .process_status {
      overflow: hidden;
      .each_status {
        float: left;
        width: 33.33%;
        font-size: .12rem;
        font-weight: bold;
        line-height: .3rem;
        text-align: center;
        padding-right: .1rem;
        margin-bottom: .1rem;
        box-sizing: border-box;
        .status_content {
          overflow: hidden;
          padding: 0 .05rem;
          white-space: nowrap;
          border-radius: .3rem;  
          background: #E8E8E8;
          text-overflow: ellipsis;
        }    
      }
    }
  }
  .time-filter-container {
    padding: .1rem;
    .time_filter {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .placeholder-part {
        width: .1rem;
      }
      .each_time {
        width: 45%;
        color: #c7c7c7;
        padding: .1rem 0;
        font-size: .12rem;
        font-weight: bold;
        text-align: center;
        border-radius: .3rem;
        background: #e8e8e8;
        &.active {
          color: #111;
        }
      }
      .each_time + .each_time {
        margin-left: .15rem;
      }
    }
  }
  .handle-part {
    right: 0;
    bottom: 0;
    display: flex;    
    width: inherit;
    height: .54rem;
    position: absolute;    
    line-height: .54rem;
    span {
      flex: 1;
      text-align: center;
    }
    .reset_btn {
      background: #EEE;
    }
    .confirm_btn {
      color: #FFF;
      background: #5077aa;
    }
  }
}
</style>
