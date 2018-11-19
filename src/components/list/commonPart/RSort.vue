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
    <div class="filter-part" @click="showFilter = true"> 
      <span class="filter_name">筛选</span>
      <span class="iconfont icon-shaixuan"></span>
    </div>
    <div v-transfer-dom>
      <popup position="right" v-model="showFilter">
        <div class="filter-container-part">
          <!-- 流程状态 -->
          <div class="process-status-container basic-mod">
            <div class="filter_title vux-1px-b">流程状态</div>
            <div class="process_status">
              <div class="each_status" :class="{'active vux-1px' : fieldVlaue === item.fieldVlaue}"
              v-for="(item, index) in PcesStaList" :key="index"
              @click="selProcee(item, index)">
                <div class="status_content">{{item.fieldVlaue}}</div>
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
          <div class="handle-part">
            <span class="reset_btn">重置</span>
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
// 请求引入
import { getProcessStatus } from 'service/commonService'
export default {
  name: "RSort",
  components: { Popup },
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
    }
  },
  data() {
    return {
      sort: '',     // 排序机制 （倒序 DESC / 正序 ACS）
      toDay: '',
      preDate: '',
      property: '', // 被选中的字段
      fieldVlaue: '', // 被选中的流程状态
      PcesStaList: [],  // 流程状态数组
      showFilter: false,  // 是否展示筛选
      timeFilter: {
        startDate: '',
        endDate: ''
      }
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
    // 选择流程状态
    selProcee(item, index){
      console.log(item);
      this.fieldVlaue = item.fieldVlaue;
    },
    // 起始日期
    getStart(){
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
    getEnd(){
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
    filterConfirm(){
      this.showFilter = false;
      this.$emit('on-filter', {
        timeFilter: this.timeFilter
      })
    }
  },
  created(){
    let { listId } = this.$route.params;
    this.toDay = dateFormat(new Date(),'YYYY-MM-DD');
    this.preDate = dateFormat(new Date(new Date().getTime() - 24*60*60*1000), 'YYYY-MM-DD');
    getProcessStatus(listId).then(({ tableContent }) => {
      this.PcesStaList = tableContent;
    })
  }
}
</script>

<style scoped lang="scss">
.vux-1px-b:after {
  border-color: #e8e8e8;
}
.vux-1px:before {
  width: 197%;
  border-radius: .4rem;
  border-color: #5077aa;
}
/deep/ .vux-popup-dialog {
  background: #F6F6F6;
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
    }
    &.active  {
      color: #5077aa;
      font-weight: bold;
    }  
  }
  .filter-part {
    @extend .each-sort;
  }
}
.filter-container-part {
  width: 3rem;
  height: 100%;
  padding: .1rem;
  overflow: auto;
  position: relative;
  box-sizing: border-box;
  .basic-mod {
    margin-bottom: .15rem;
  }
  .filter_title {
    color: #111;
    font-size: .18rem;
    font-weight: bold;
    margin-bottom: .1rem;
    padding-bottom: .04rem;
  }
  .process-status-container {
    .process_status {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      .each_status {
        width: 30%;
        font-size: .12rem;
        font-weight: bold;
        text-align: center;
        margin-bottom: .1rem;
        border-radius: .3rem;
        background: #e8e8e8;
        padding: .1rem .06rem;
        box-sizing: border-box;
        // margin-right: .1rem;
        .status_content {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }    
      }
      // .each_status + .each_status {
      //   margin-right: .1rem;
      // }
    }
  }
  .time-filter-container {
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
    position: fixed;    
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
