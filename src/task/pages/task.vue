<template>
    <div class="notice-container" >
        <!-- <div class="list_top">
          <div class='search'>
            <form class="search_part" :class="'has-filter'" action="" @submit.prevent= "searchMenu">
                <i class="icon-more icon-more2" @click="showFilter = true"></i>
              <i class="icon icon-search"></i>
              <input ref="searchInp" class="srh_inp" type="search" autocomplete="off"
                    placeholder="任务名称" @input='getSearchValue($event)' :value='searchValue'>
              <div class="pop_cfm" @click="searchMenu">搜索</div>
              <i class="icon-clear clear_icon" @click="clearSearch"></i>
              <span class="srh_text">{{fieldText}}</span>
            </form>
          </div>
        </div> -->
        <tab :active-color='activeColor'>
        <tab-item 
            :selected="$route.name=='flowTodo'" 
            :badge-label="todoBadge['flowTodo']"  
            @on-item-click="onSwitch('flowTodo')"  > 
            工作流任务
        </tab-item>
        <tab-item  
            :selected="$route.name=='projectTask'" 
            :badge-label="todoBadge['projectTask']"  
            @on-item-click="onSwitch('projectTask')">
            项目任务
        </tab-item>
        <tab-item 
            :selected="$route.name=='dailyTask'" 
            :badge-label="todoBadge['dailyTask']"  
            @on-item-click="onSwitch('dailyTask')">日志任务</tab-item>
        </tab>
        
        <router-view @loadData="loadData" :filterList="fieldValue" :isFealter="isFealter" @colseFilter="colseFilter"></router-view>
        <div v-transfer-dom>
            <popup position="right" v-model="showFilter" @on-hide="onHide" @on-show="onShow">
                <div class="filter-container-part">
                    <r-scroll class="list_wrapper" :options="scrollOptions" ref="bScroll">
                        <div class="process-status-container vux-1px-b">
                          <div class="process-wrapper">
                            <div class="filter_title">筛选</div>
                            <div class="process_status">
                              <div class="each_status"  :class="{'active vux-1px' : showFilterSelIcon(value)}" v-for="(value, vindex) in filterFiled" :key="vindex">
                                  <div class="status_content" @click="selFilter(value)" >{{value.name}}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                    </r-scroll>
                    <div class="handle-part vux-1px-t">
                        <!-- <span class="reset_btn" @click="filterReset">重置</span> -->
                        <span class="confirm_btn" @click="filterConfirm">确定</span>
                    </div>
                </div>
            </popup>
        </div>
    </div>
</template>

<script>
import { Tab, TabItem, Popup } from 'vux'
import RScroll from "plugins/scroll/RScroll";
export default {
    components: {
    Tab,
    TabItem,
    RScroll,
    Popup
  },
    data(){
        return {
            todoBadge:{
                'flowTodo':'',
                'projectTask':'',
                'dailyTask':''    
            },
            praiseBadge:'',
            activeColor:'#0099CC', //2196F3
            searchValue: '',
            showFilter:false,
            scrollOptions: {
                click: true,
            },
            filterFiled:[
              {name:'昨日',value:'$yesterday$'},
              {name:'本日',value:'$today$'},
              {name:'本周',value:'$thisWeek$'},
              {name:'本月',value:'$thisMonth$'},
              {name:'本季度',value:'$thisQuarter$'},
              {name:'本年',value:'$thisYear$'},
              {name:'上周',value:'$preWeek$'},
              {name:'上月',value:'$preMonth$'},
              {name:'上季度',value:'$preQuarter$'},
              {name:'上年',value:'$preYear$'},
            ],
            fieldValue:'$thisWeek$',
            fieldObj:{},
            fieldText:'本周',
            isFealter: false,
        }
    },
    methods:{
        onSwitch(name){
            this.$router.push({
                name:name
            });
        },
        loadData(text,val){
            this.todoBadge[text] = String(val);
        },
        getTheme(){
            this.activeColor = '#0099CC';
            var theme = window.localStorage.getItem('theme');
            switch(theme){
                case 'default-theme':
                    this.activeColor = '#0099CC';
                    break;
                case 're-theme':
                    this.activeColor = '#720e05';
                    break;
                case 'gr-theme':
                    this.activeColor = '#3f8e4d';
                    break;
                case 'ye-theme':
                    this.activeColor = '#edc148';
                    break;
                case 'pu-theme':
                    this.activeColor = '#652BF5';
                    break;
            }
        },
        searchMenu(){

        },
        clearSearch(){

        },
        getSearchValue($event){

        },
        onHide() {

        },
        onShow(){

        },
        filterReset(){
        },
        filterConfirm(){
          this.showFilter = false;
          this.isFealter = true;
          this.fieldText = this.fieldObj.name;
        },
        showFilterSelIcon(key) {
          if (this.fieldValue==key.value){
            return true;
          } 
        },
        selFilter(value){
          this.fieldValue = value.value;
          this.fieldObj = value;
        },
        colseFilter(val){
          this.isFealter = val;
        }
    },
    created(){
        this.getTheme();
        this.onSwitch('flowTodo');
    },
    activated(){
        this.getTheme();
    },
    mounted(){
    }
}

</script>
<style lang="less" scoped>
@blue:#0099CC;
@font:#fff;
@gray:#CCCCCC;
.notice-container{
    overflow: hidden;
    height: 100%;
    .wrapper {
        height: calc(100% - 10.99rem);
        // height: 7.2rem;
    }
    .list_top {
        width: 100%;
        background-color: @blue;
        }
        .search {
        width: 100%;
        padding: .08rem 0;
        .search_part {
            width: 100%;
            display: flex;
            height: .34rem;
            position: relative;
            line-height: .34rem;
            box-sizing: border-box;
            // 搜索输入框
            .srh_inp {
              flex: 1;
              border: none;
              outline: none;
              color: #333;
              appearance: none;
              font-size: .14rem;
              margin-left: .35rem;
              padding-left: .35rem;
              border-radius: .2rem;
              background: #F6F6F6;
              -webkit-appearance: none;
              &::-webkit-search-cancel-button {
                  display: none;
              }
            }
            .srh_text{
              flex: 1;
              border: none;
              outline: none;
              color: #fff;
              appearance: none;
              font-size: .14rem;
              text-align: center;
              border-radius: .2rem;
              background: none;
              -webkit-appearance: none;
              &::-webkit-search-cancel-button {
                  display: none;
              }
            }
            // 搜索 按钮
            .pop_cfm {
            color: @font;
            font-size: .14rem;
            margin: 0 .15rem 0 .12rem;
            }
            // 返回 按钮
            .pop_cancel {
            color: #fc3c3c;
            }
            // 搜索icon
            .icon {
            top: 50%;
            z-index: 1;
            left: .45rem;
            width: .14rem;
            height: .16rem;
            fill: #2d2d2d;
            position: absolute;
            transform: translate(0, -50%);
            }
            // 清除icon
            .clear_icon {
            top: 50%;
            right: .64rem;
            width: .18rem;
            height: .18rem;
            display: block;
            font-size: .12rem;
            line-height: .3rem;
            text-align: center;
            position: absolute;
            transform: translate(0, -50%);
            }
            .icon-more {
                top: 50%;
                z-index: 1;
                left: .10rem;
                width: .14rem;
                height: .2rem;
                fill: #2d2d2d;
                position: absolute;
                -webkit-transform: translate(0, -50%);
                -ms-transform: translate(0, -50%);
                transform: translate(0, -50%);
                color: black;
            }
        }
        .search_filter {
            left: 0;
            bottom: 0;
            top: .49rem;
            width: 100%;
            z-index: 100;
            font-size: .14rem;
            position: absolute;
            overflow: hidden;
            .layer {
            opacity: .5;
            height: 100%;
            background: #000;
            }
        }
    }
}
</style>
<style lang="scss" scoped>
.active  {
  @include font_color();
  background: #fff;
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
    font-size: .14rem;
    font-weight: 600;
    padding: 0  0 .06rem .06rem;
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
      padding: .06rem .23rem .08rem .24rem;
    }
    .process_status {
      overflow: hidden;
      display: flex;
      flex-flow: wrap;
      font-size: .12rem;
      .each_status {
        width: .7rem;
        height: .26rem;
        color: #333;
        line-height: .26rem;
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
      }
      .active {
          @include font_color();
        }
      .vux-1px:before {
        @include boder_color();
        border-radius: .08rem;
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
      @include bg_color();
    }
  }
}
</style>