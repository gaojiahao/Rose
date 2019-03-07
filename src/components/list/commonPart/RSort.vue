<template>
  <div class='sort-part vux-1px-b'>
    <div class='each-sort' :class="{'active vux-1px-b' : property === SItem.key}" v-for="(SItem, SIndex) in data" :key="SIndex"
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
            <div class="process-status-container vux-1px-b" v-for="(val, key, index) in statusList" :key="key">
              <template v-if="val.value.length">
                <div class="process-wrapper">
                  <div class="filter_title">{{statusList[key].alias}}</div>
                  <div class="process_status">
                    <div class="each_status"  :class="{'active vux-1px' : showSelIcon(item, key)}"
                        v-for="(item, index) in statusList[key].value" :key="index"
                        @click="selProcee(item, key, index)">
                      <div class="status_content">{{item}}</div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
            <!-- 时间 -->
            <div class="time-filter-container vux-1px-b">
              <div class="filter_title">时间段</div>
              <div class="specific_time">
                <div class="each_specific_time" 
                     :class="{'active vux-1px': SpecTimeKey === key}"
                     @click="pickSpecTime(key)"
                     v-for="(item, key) in specificTimeList" :key="key">
                  <div class="time_content">{{item}}</div>
                </div>
              </div>
              <div class="time_filter">
                <div class="each_time" :class="{'active vux-1px' : tmpTimeFilter.startDate}" @click="getStart">
                  {{tmpTimeFilter.startDate || '开始日期'}}
                </div>
                <span class="symbol"></span>
                <div class="each_time" :class="{'active vux-1px' : tmpTimeFilter.endDate}" @click="getEnd">
                  {{tmpTimeFilter.endDate || '结束日期'}}
                </div>
              </div>
            </div>
            <div class="process-status-container vux-1px-b" v-for="(val, key, index) in filtersList" :key="index" v-if="key !== 'biProcessStatus' && val.value.length">
              <div class="process-wrapper">
                <div class="filter_title " @click="val.showAll = !val.showAll">
                  <span>{{val.alias}}</span>
                  <span class="arrow icon-filter-down" :class="{'icon-filter-up' : val.showAll}"></span>
                </div>
                <div class="process_status">
                  <div class="each_status"  :class="{'active vux-1px' : showSelIcon(item, key)}"
                  v-for="(item, index) in val.value" :key="index"
                  @click="selProcee(item, key)" v-show="index < 3 || val.showAll">
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
        ]
      }
    },
    listId: {
      type: [String, Number],
      default: 2190
    },
    hasFormStatus: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      sort: '',     // 排序机制 （倒序 DESC / 正序 ACS）
      toDay: '',
      preDate: '',
      property: '', // 被选中的字段
      SpecTimeKey: '',
      lastFilter: {}, // 上次的过滤条件，用于判断列表是否需要刷新
      fieldVlaue: {}, // 被选中的流程状态
      filtersList:{},
      statusList: {}, // 流畅状态列表
      timeFilter: { // 时间栏
        startDate: '',
        endDate: '',
      },
      tmpTimeFilter: {  // 临时时间栏 用于 用户自主选择时间段
        startDate: '',
        endDate: '',
      },
      scrollOptions: {
        click: true,
      },
      showFilter: false,  // 是否展示筛选
      specificTimeList: ['今日', '昨日', '本周'],
    }
  },
  methods: {
    // 排序
    sortClick(item, i) {
      if (this.property === item.key){
        // 排序转变
        this.sort = this.sort === 'ASC'
          ? 'DESC'
          : 'ASC'
      }
      else {
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
      if (this.timeFilter.startDate !== this.lastFilter.timeFilter.startDate || this.timeFilter.endDate !== this.lastFilter.timeFilter.endDate) {
        isRefreshList = true;
      }
      let str1 = JSON.stringify(this.fieldVlaue),
          str2 = JSON.stringify(this.lastFilter.otherFilter);
      // 其他过滤发生改变
      if (str1 !== str2) {
        isRefreshList = true;
      }
      if (isRefreshList) {
        this.$emit('on-filter', {
          timeFilter: this.timeFilter,
          otherFilter: this.fieldVlaue
        })
      }
    },
    // 筛选确定
    filterConfirm() {
      this.showFilter = false;
    },
    // 重置筛选
    filterReset() {
      this.fieldVlaue = {};
      this.SpecTimeKey = '';
      this.timeFilter = Object.assign({}, this.$data.timeFilter, 
        this.$options.data().timeFilter
      );
      this.tmpTimeFilter = Object.assign({}, this.$data.tmpTimeFilter, 
        this.$options.data().tmpTimeFilter
      );
    },    
    // 匹配相同项的索引
    showSelIcon(sItem, key) {
      if (this.fieldVlaue[key]){
        return this.fieldVlaue[key].value.findIndex(item => item === sItem) !== -1;
      }
    },
    // 选择流程状态
    selProcee(sItem, key) {
      if (this.fieldVlaue[key]){
        let arr = this.fieldVlaue[key].value;
        let delIndex = arr.findIndex(item => item === sItem);
        // 若存在重复的 则清除
        if (delIndex !== -1) {
          arr.splice(delIndex, 1);
          //当值为空是，删除该过滤条件
          if (!arr.length) {
            delete this.fieldVlaue[key]
          }
          return;
        }
        arr.push(sItem);
      }
      else {
        let obj = {};
        if (key !== 'biProcessStatus' && key !== 'bugProcessStatus' && key !== 'processStatus'){
          obj = {
            alias: this.filtersList[key].alias,
            value: [sItem]
          }
        }
        else {
          obj = {
            alias: this.statusList[key].alias,
            value: [sItem]
          }
        }
        this.$set(this.fieldVlaue, key, {...obj})
      }
    },
    // 选择 '今日' / '昨日' / '本周'
    pickSpecTime(key) {
      // 消除选中状态
      if (this.SpecTimeKey === key) {
        this.SpecTimeKey = '';
        this.timeFilter = Object.assign({}, this.$data.timeFilter, 
          this.$options.data().timeFilter
        );
        return;
      }
      // 选中状态 并清空 时间栏 数据
      this.SpecTimeKey = key;
      this.tmpTimeFilter = Object.assign({}, this.$data.tmpTimeFilter, 
        this.$options.data().tmpTimeFilter
      );
      if (key < 2) {
        // 获取 今日 / 昨日
        let whichDay = ['toDay', 'preDate'];
        this.pickDate(whichDay[key]);
      }
      else {
        // 获取 本周时间
        let now = new Date(), 
            Day = now.getDate(),
            Month = now.getMonth(), 
            Year = now.getFullYear(), 
            DayOfWeek = now.getDay();
        let timePeriods = {
          startDate: dateFormat(new Date(Year, Month, Day - DayOfWeek), 'YYYY-MM-DD'),
          endDate: dateFormat(new Date(Year, Month, Day + (6 - DayOfWeek)), 'YYYY-MM-DD')
        }
        this.pickDate('', timePeriods);
      }
    },
    pickDate(date = '', timePeriods = {}) {
      if (date) {
        this.timeFilter.startDate = this.timeFilter.endDate = this[date];
      }
      else {
        this.timeFilter = {...timePeriods};
      }
    },
    // 起始日期 (最远日期为 今日)
    getStart() {
      let time = this.timeFilter,
          tmpTime = this.tmpTimeFilter;
      this.$vux.datetime.show({
        cancelText: '取消',
        confirmText: '确定',
        clearText: "重新选择",
        value: tmpTime.startDate,
        endDate: this.toDay,
        onClear: (val) => {
          time.startDate = tmpTime.startDate = '';
        },
        onConfirm: (val) => {
          // 当 '今日' / '昨日' 等按钮处于点亮 但用户想自定义时间 此处重置按钮
          if (this.SpecTimeKey !== '') {
            this.SpecTimeKey = time.endDate = '';
          }
          // 用户先选择了截止日期 如果日期早于起始日期 则清除
          if (time.endDate) {
            let endDate = new Date(Date.parse(time.endDate.replace(/-/g, "/"))),
                startDate = new Date(Date.parse(val.replace(/-/g, "/")));
            if (startDate - endDate > 0) {
              time.endDate = tmpTime.endDate = '';
            }
          }
          time.startDate = tmpTime.startDate = val;
        }
      })
    },
    // 截止日期 (最近日期为 今日)
    getEnd() {
      let time = this.timeFilter,
          tmpTime = this.tmpTimeFilter;
      this.$vux.datetime.show({
        cancelText: '取消',
        confirmText: '确定',
        clearText: "重新选择",
        value: tmpTime.endDate,
        startDate: tmpTime.startDate ? tmpTime.startDate : '',
        onClear: (val) => {
          time.endDate = tmpTime.endDate = '';
        },
        onConfirm: (val) => {
          if (this.SpecTimeKey !== '') {
            this.SpecTimeKey = time.startDate = '';
          } 
          time.endDate = tmpTime.endDate = val;
        }
      })
    },
    // 请求过滤字段
    getFilterFields(){
      filterFields(this.listId).then(data=>{
        let formStatusList = ['进行中', '已生效', '草稿'];
        let filtersList = {}, statusList = {};
        if (this.hasFormStatus){
          filtersList = {
            biStatus: {
              alias: '表单状态',
              showAll: false,
              showValue: formStatusList,
              value: formStatusList,
            }
          }
        }
        for (let key of Object.keys(data)){
          let item = data[key];
          if (key !== 'biProcessStatus' && key !== 'bugProcessStatus' && key !== 'processStatus'){
            filtersList[key] = {
              ...item,
              showValue: item.value.slice(0,9),
              showAll: false,
            };
          }
          else {
            statusList[key] = {
              ...item,
              showValue: item.value.slice(0,9),
              showAll: false,
            }
          }
          
        }
        this.filtersList = {...filtersList};
        this.statusList = {...statusList};
      })
    }
  },
  created(){
    let { listId } = this.$route.params;
    this.toDay = dateFormat(new Date(), 'YYYY-MM-DD');
    this.preDate = dateFormat(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
    this.getFilterFields()
  }
}
</script>

<style scoped lang="scss">
.vux-1px-b:after{
  border-color: #ECEDEC;
}
.vux-1px-t:before {
  border-color: #D9D9D9;
}
.vux-1px:before {
  width: 200%;
  border-radius: .08rem;
  border-color: #3296FA;
}
/deep/ .vux-popup-dialog {
  background: #fff;
  overflow-y: auto;
}
.active  {
  color: #3296FA;
  background: #fff;
}
.sort-part {
  display: flex;
  padding: 0 .2rem;
  justify-content: space-between;
  .each-sort {
    color: #333;
    display: flex;
    font-size: .14rem;
    line-height: 0.14rem;
    box-sizing: border-box;
    padding: .08rem .05rem .14rem;
    &.active {
      color: #3296FA;
    }
    &.vux-1px-b:after {
      border-bottom: .06rem solid #3296FA;
    }
    .arrow {
      height: 100%;
      position: relative;
      span {
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
  }
  .filter-part {
    @extend .each-sort;
    align-items: center;
    .icon-filter {
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
  .list_wrapper {
    height: calc(100% - 0.48rem);
    overflow: hidden;
  }
  .filter_title {
    color: #666;
    font-size: .12rem;
    padding: 0  0 .17rem .06rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .arrow {
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
    .process-wrapper {
      padding: .17rem .23rem .08rem .24rem;
    }
    .process_status {
      overflow: hidden;
      display: flex;
      flex-flow: wrap;
      .each_status {
        width: .7rem;
        height: .36rem;
        color: #333;
        line-height: .36rem;
        text-align: center;
        margin: 0  .16rem .14rem 0;
        box-sizing: border-box;
        background: #F4F4F4;
        border-radius: .04rem;
        .status_content {
          overflow: hidden;
          padding: 0 .05rem;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        &.active {
          @extend .active
        }
      }
    }
  }
  .time-filter-container {
    padding: .18rem .23rem .22rem .24rem;
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
          @extend .active
        }
      }
      .symbol {
        width: .1rem;
        height: 1px;
        background: #d9d9d9;
        margin: .15rem .1rem;
      }
    }
    .specific_time {
      overflow: hidden;
      display: flex;
      flex-flow: wrap;
      .each_specific_time {
        width: .7rem;
        color: #333;
        height: .36rem;
        text-align: center;
        line-height: .36rem;
        background: #F4F4F4;
        border-radius: .04rem;
        box-sizing: border-box;
        margin: 0 .16rem .14rem 0;
        &.active {
          @extend .active
        }        
        .time_content {
          overflow: hidden;
          padding: 0 .05rem;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
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
