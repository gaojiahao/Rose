<template>
  <div class="change_log vux-1px-b">
    <div class="title" >
      <span>更新日志</span>
      <span class="history" @click="popupShow = true" v-show="changeLogList.length">历史记录</span>
    </div>
    <div class="no_data" v-if="!changeLogList.length">暂无数据</div>
    <div class="latest_change" v-else @click="popupShow = true">
      <div class="change_time">
        <span class="version">v{{latestLog.VERSION}}</span>
        <span>{{latestLog.CRT_TIME | handerTime}}</span>
      </div>
      <div class="change_content">
        <div class="each_change">
          <span>{{latestLog.CREATOR_NAME}}</span>
          <span style="margin-left:0.1rem;">耗用时间:{{latestLog.TIME_CONSUMING}}</span>
        </div>
        <div class="each_change">
          <span class="change_title">更新范围: </span>
          <span class="content">{{latestLog.CHANGE_RANGE}}</span>
        </div>
        <div class="each_change">
          <span class="change_title">备注: </span>
          <span v-html="latestLog.CONTENT" class="content"></span>
        </div>
      </div>
    </div>
    <div class="edit_log" @click="EditLog" v-if="handle">
      <span class="iconfont icon-bianji"></span>
      <span>撰写日志</span>
    </div>
    <!--变更历史列表-->
    <div v-transfer-dom>
      <popup v-model="popupShow" position="bottom" height="100%" @on-show="onShow">
        <r-scroll class="full-flow-container" :options="scrollOptions" :has-next="hasNext"
                  :no-data="!hasNext && !changeLogList.length" @on-pulling-up="onPullingUp"
                   ref="bScroll">
          <div class="change_list">
            <div class="title vux-1px-b">
              更新日志历史记录
            </div>
            <div class="latest_change vux-1px-b" v-for="(item, index) in changeLogList" :key="index">
              <div class="change_time">
                <span class="version">v{{item.VERSION}}</span>
                <span>{{item.CRT_TIME | handerTime}}</span>
              </div>
              <div class="change_content">
                <div>{{item.CREATOR_NAME}}&nbsp;&nbsp;耗用时间:{{item.TIME_CONSUMING}}</div>
                <div>更新范围: {{item.CHANGE_RANGE}}</div>
                <div>备注: <span v-html="item.CONTENT"></span></div>
              </div>
            </div>
          </div>
        </r-scroll>
         <div class="btn when_less vux-1px-t">
          <span class="cfm_btn" @click="closePop">关闭</span>
        </div>
      </popup>
    </div>
  </div>    
</template>

<script>
// vux插件引入
import {TransferDom, Popup, Group, Icon, XButton,dateFormat} from 'vux'
import RScroll from 'components/RScroll'
//请求 引入
import {getChangeLog,saveLog} from 'service/appSettingService.js'
export default {
  name:'ChangeLog',
  props:{
    handle: { //是否显示撰写
      type: Boolean,
      default : false
    }
  },
  data(){
    return {
      latestLog : {},
      changeLogList : [],
      listId : 'a4897429-f4f2-44a4-ade7-2fe8dc67c3cf',
      popupShow : false,
      page : 1,
      limit : 10,
      hasNext: true,
      scrollOptions: {
        click: true,
        pullUpLoad: true,
      },            
    }
  },
  directives: {
    TransferDom
  },
  components: {
    Popup,
    Group,
    Icon,
    XButton,
    RScroll,
  },
  filters:{
    handerTime(val){
      let time  = dateFormat(val,'YYYY-MM-DD');
      return time

    }
  },
  methods:{
    //获取更新日志日志列表
    getChangeList(){
      return getChangeLog({
        listId: this.listId,
        limit: this.limit,
        page: this.page
      }).then(({dataCount = 0, tableContent = []}) =>{
        if(this.page === 1){
          this.latestLog = tableContent[0];
        }
        this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
        this.changeLogList = this.page === 1 ? tableContent : [...this.changeLogList, ...tableContent];
        this.$nextTick(() => {
          this.$refs.bScroll.finishPullUp();
        })
      })
    },
    // TODO 上拉加载
    onPullingUp() {
      this.page++;
      this.getChangeList();
    },
    closePop(){
      this.popupShow = false;
    },
    onShow() {
      this.$nextTick(() => {
        if (this.$refs.bScroll) {
          // 弹窗展示时刷新滚动，防止无法拖动问题
          this.$refs.bScroll.refresh();
        }
      })
    },
    EditLog(){
      this.$router.push({
        path:`/appDetail/${this.listId}/addLog`,
      })
    }
  },
  created(){
    let { listId } = this.$route.params;
    if(listId){
      // this.$loading.show();
      this.listId = listId;
      this.getChangeList();
    }

  }

}
</script>

<style lang='scss' scoped>
  .vux-1px-b:after,.vux-1px-t:before{
    border-color: #e8e8e8;
  }
  .latest_change{
    .change_time{
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size:0.12rem;
      color:#757575; 
      padding: 0.03rem 0; 
    }
    .change_content{
      color: #111;
      font-size: 0.14rem;
      line-height: 0.24rem;
    }
  }
  .change_log{
    width: 90%;
    margin: 0 auto;
    box-sizing: border-box;
    padding: 0.1rem 0;
    .title{
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.18rem;
      // padding-bottom: 0.05rem;
      font-weight: bold;
      color: #111;
      .history{
        font-size: 0.14rem;
        font-weight: normal;
        color: #3c7bcb;
      }
    }
    .latest_change{
      @extend .latest_change
    }
    .no_data{
      padding: 0.05rem 0;
      font-size: 0.12rem;
      color: #757575;
    }
    .edit_log{
      margin-top:0.02rem;
      color: #3c7bcb;
      font-size: 0.14rem;
      display: flex;
      align-items: center;
      .iconfont{
        font-size: 0.14rem;
        margin-right: 0.03rem;
      }
    }
  }
  //更新日子列表pop
  .vux-popup-dialog {
    background: #fff;
    height: 100%;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    .full-flow-container {
      height: calc(100% - 0.62rem);
      /deep/ .scroll-wrapper {
        overflow: visible;
        padding-bottom: .01rem;
      }
      .change_list{
        padding: 0 0.1rem;
        .title{
          padding: 0.05rem 0;
          color: #111;
          font-weight: bold;
          font-size: .24rem;
        }
        .latest_change{
          padding: 0.05rem 0 0.1rem 0;
          @extend .latest_change;          
          .version{
            font-size : 0.14rem;
            color: #111;
            font-weight: bold;
          }
          
          
        }
      }
    }
    // 确定
    .btn {
      left: 0;
      bottom: 0;
      position: fixed;
      width: 100%;
      background: #fff;
      text-align: center;
      padding: .1rem 0;
      box-sizing: border-box;
      .cfm_btn {
        width: 2.8rem;
        color: #fff;
        height: .44rem;
        line-height: .44rem;
        text-align: center;
        background: #5077aa;
        display: inline-block;
        border-radius: .4rem;
        box-shadow: 0 2px 5px #5077aa;
      }
    }
    // 工作流数据少的时候 按钮固定在底部
    .when_less {
      left: 0;
      bottom: 0;
      position: fixed;
    }
  }

</style>
