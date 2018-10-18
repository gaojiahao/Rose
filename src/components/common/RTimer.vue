<template>
  <div class='filter_time vux-1px-b'>
    <!--<div class='current_time vux-1px-r'>{{defaultTips}}</div>-->
    <div class='time_pop' @click="dateShow = !dateShow">
      <!--<span class="tips">日期筛选</span>-->
      <span class="tips" :class="{'has_date':defaultTips !== '日期筛选'}">{{defaultTips}}</span>
      <x-icon :class="{'arrow-up': dateShow}" type="ios-arrow-down" size="14"></x-icon>
    </div>
    <div class='date vux-1px-b' v-show='dateShow'>
      <div class='choose_date'>
        <div class='start_date'>
          <span class='date_title'>起始日期</span>
          <span class='date_value vux-1px' @click="getStart">
              {{timeFilter.startDate}}
              </span>
        </div>
        <div class='end_date'>
          <span class='date_title'>截止日期</span>
          <span class='date_value vux-1px-t' @click="getEnd">
              {{timeFilter.EndDate}}
            </span>
        </div>
      </div>
      <div class='time_sel_btn'>
        <span class="reset" @click="resetData">重置</span>
        <span class="confirm" @click="confirm">确认</span>
      </div>
    </div>
  </div>
</template>

<script>
  import {dateFormat} from 'vux'

  export default {
    name: "RTimer",
    props: {},
    data() {
      return {
        toDay: '',
        preDate: '',
        defaultTips: '',
        timeFilter: {
          startDate: '请选择',             // 起始日期
          EndDate: '请选择',               // 截止日期
        },
        dateShow: false,                  // 是否显示时间筛选栏
      }
    },
    methods: {
      // 起始日期
      getStart() {
        this.$vux.datetime.show({
          cancelText: '取消',
          confirmText: '确定',
          value: this.timeFilter.startDate,
          endDate: this.preDate,
          onConfirm: (val) => {
            this.timeFilter.startDate = val;
          },
        })
      },
      // 截止日期
      getEnd() {
        this.$vux.datetime.show({
          cancelText: '取消',
          confirmText: '确定',
          value: this.timeFilter.EndDate,
          endDate: this.toDay,
          onConfirm: (val) => {
            this.timeFilter.EndDate = val;
          },
        })
      },
      // 重置时间筛选
      resetData() {
        this.timeFilter = {startDate: '请选择', EndDate: '请选择',};
      },
      // 时间筛选确定
      confirm() {
        // 两个时间都选择了
        if (this.timeFilter.startDate !== '请选择' && this.timeFilter.EndDate !== '请选择') {
          this.defaultTips = `${this.timeFilter.startDate}~${this.timeFilter.EndDate}`;
        }
        // 只选择了截止时间
        else if (this.timeFilter.EndDate !== '请选择') {
          this.defaultTips = `截止至 ${this.timeFilter.EndDate}`;
        }
        // 只选择了起始日期
        else if (this.timeFilter.startDate !== '请选择') {
          this.defaultTips = `${this.timeFilter.startDate}~${this.toDay} [今日]`;
        }
        // 都没选择
        else {
          // this.defaultTips = `截止至 ${this.toDay}`
          this.defaultTips = '日期筛选'
        }
        // 关闭时间筛选
        this.dateShow = false;
        // 添加时间筛选条件
        let timeFilter = {
          startDate: this.timeFilter.startDate === '请选择' ? '' : this.timeFilter.startDate,
          endDate: this.timeFilter.EndDate === '请选择' ? '' : this.timeFilter.EndDate
        };
        this.$emit('on-select', timeFilter);
      },
    },
    created() {
      this.toDay = dateFormat(new Date(), 'YYYY-MM-DD');
      this.preDate = dateFormat(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
      // this.defaultTips = `截止至 ${this.toDay}`;
      this.defaultTips = '日期筛选';
    }
  }
</script>

<style scoped lang="scss">
  .filter_time {
    background: #fff;
    display: flex;
    width: 50%;
    height: 40px;
    font-size: 14px;
    // font-weight: bold;
    justify-content: center;
    align-items: center;
    .current_time {
      flex: 1;
      text-align: center;
    }
    .time_pop {
      display: flex;
      padding: 0 0.08rem;
      align-items: center;
      justify-content: center;
      .tips {
        // margin-right: .04rem;
        // font-size: 0.12rem;
        &.has_date{
          font-size: 0.12rem;
          font-weight: bold;
        }
      }
      /* 倒三角 */
      .vux-x-icon-ios-arrow-down {
        transition: transform 200ms linear;
        &.arrow-up {
          transform: rotate(-180deg);
        }
      }
    }
    //选择时间弹出框
    .date {
      background: #fff;
      width: 200%;
      box-sizing: border-box;
      position: absolute;
      top: 0.4rem;
      right: 0;
      z-index: 50;
      box-shadow: 0 2px 10px #e8e8e8;
      .choose_date {
        display: flex;
        text-align: center;

        .end_date,
        .start_date {
          flex: 1;
          display: flex;
          flex-direction: column;
          .date_title {
            padding: 10px 0;
            font-weight: bold;
          }
          .date_value {
            padding: 10px;
            color: #757575;
          }
        }
      }
      // 时间选择 确认栏
      .time_sel_btn {
        color: #FFF;
        display: flex;
        text-align: center;
        span {
          flex: 1;
          padding: 10px 0;
        }
        .reset {
          color: #757575;
          background: #F1F1F1;
        }
        .confirm {
          background: #3f72af;
        }
      }
    }
  }
</style>