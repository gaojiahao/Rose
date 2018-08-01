<template>
  <div class="pages">
    <div class="list_top">
      <search class="search" @search='searchList'></search>
    </div>
    <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
      <div class="todo_msg" v-for='(item,index) in listData' :key='index' @click='goDetail(item)'>
        <div class="msg_top">
          <!-- 表单状态 及 编码 -->
          <div class="work_info">
            <!-- 状态 -->
            <span class="work_status doing_work" :class='{invalid_work : item.status==="已处理"}'>{{item.status}}</span>
            <!-- 编码 -->
            <span class="work_code doing_code">{{item.transCode}}</span>
          </div>
          <!-- 时间 -->
          <div class="time">
            {{item | handleCrt}}
          </div>
        </div>
        <!-- 上个节点审批信息 -->
        <div class="handle_info vux-1px-b">
          <div class="handle_avatar">
            <img src="../../assets/avatar.png" alt="avatar">
          </div>
          <div class="info" v-if='item.workFlow'>
            <div class="handle_part">
              <span class="name">{{item.workFlow.userName}}</span>
              <span class="handle">进行了审批</span>
              <span class="tips">[上个节点]</span>
            </div>
            <div class="handle_result">
              审批结果：<span class="result" :class='{reject_c : item.workFlow.status === "撤回" || item.workFlow.status === "拒绝" }'>{{item.workFlow.status}}</span>
            </div>
          </div>
        </div>
        <!-- 用户需要进行的操作 -->
        <div class="user_handle" v-if='item.workFlow'>
          <div class="tips">此单你需要进行:</div>
          <div class="info">{{item.workFlow.nodeName}}</div>
        </div>
      </div>
      <!-- <div class="todo_msg">
        <div class="msg_top"> -->
          <!-- 表单状态 及 编码 -->
          <!-- <div class="work_info"> -->
            <!-- 状态 -->
            <!-- <span class="work_status doing_work">待处理</span> -->
            <!-- 编码 -->
            <!-- <span class="work_code doing_code">SO18080005</span> -->
          <!-- </div> -->
          <!-- 时间 -->
          <!-- <div class="time">
            两个小时前
          </div>
        </div> -->
        <!-- 上个节点审批信息 -->
        <!-- <div class="handle_info vux-1px-b">
          <div class="handle_avatar">
            <img src="../../assets/io.jpg" alt="avatar">
          </div>
          <div class="info">
            <div class="handle_part">
              <span class="name">瑞福登-002</span>
              <span class="handle">进行了审批</span>
              <span class="tips">[上个节点]</span>
            </div>
            <div class="handle_result">
              审批结果：<span class="result" style="background:#c93d1b">不同意</span>
            </div>
          </div>
        </div> -->
        <!-- 用户需要进行的操作 -->
        <!-- <div class="user_handle">
          <div class="tips">此单你需要进行:</div>
          <div class="info">重新提交</div>
        </div> -->
      <!-- </div> -->
    </r-scroll>
    <loading-form :show='showLoadding'></loading-form>
  </div>
</template>

<script>
import search from 'components/search'
import {getAllMsgList} from 'service/msgService.js'
import {getWorkFlow} from 'service/detailService.js'
import {isMyflow} from 'service/detailService'
import businessMap from '@/home/pages/maps/business.js'
import RScroll from 'components/RScroll'
import LoadingForm from 'components/Loading'
export default {
  data(){
    return{
      page: 1,
      limit: 10,
      hasNext: true,
      scrollOptions: {
        click: true,
        pullDownRefresh: true,
        pullUpLoad: true,
      },
      serachVal: '',
      listData: [],
      showLoadding : true
    }
  },
  components: {
    search,RScroll,LoadingForm
  },
  methods:{
    goDetail(item){
      let code = businessMap[item.processName] ;
      //判断是否是重新提交，如果是，跳转到创建订单页面
      isMyflow({transCode : item.businessKey}).then(({tableContent}) => {
        if (tableContent.length > 0) {
          let {isMyTask, nodeName} = tableContent[0];
          if (isMyTask === 1 && nodeName === '重新提交') {
            this.$router.push({
              path: `/list/${code}/fillform`,
              query: {
                transCode: item.businessKey
              }
            })
          } else {
            this.$router.push({
              path: `/list/${code}/detail`,
              query: {
                transCode: item.businessKey
              }
            })
          }
        } else {
          this.$router.push({
            path: `/list/${code}/detail`,
            query: {
              transCode: item.businessKey
            }
          })
        }
      })
    },
    // TODO 重置列表条件
    resetCondition() {
      this.listData = [];
      this.page = 1;
      this.hasNext = true;
      this.$refs.bScroll.scrollTo(0, 0);
      this.$refs.bScroll.resetPullDown();
    },
    searchList(val) {
      this.serachVal = val;
      this.resetCondition();
      this.getList();
    },
    //获取销售订单数据
    getList(noReset = false) {
      // let filter  = [];
      // if(this.serachVal){
      //   filter = [
      //     {
      //       operator: 'like',
      //       value: this.serachVal,
      //       property: 'businessKey',
      //       attendedOperation: 'or'
      //     },
      //     {
      //       operator: 'like',
      //       value: this.serachVal,
      //       property: 'crtName',
      //     }
      //   ]
      // }
        let filter = {
          businessKey: this.serachVal,
          crtName: this.serachVal
        };
        return getAllMsgList({
          entityId: "20000" ,
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
        }).then(({dataCount = 0, tableContent = []}) => {         
          tableContent.forEach(item => {
            if(!item.endTime){
              item.status = "待处理"
            }else{
              item.status = '已处理'
            }
            getWorkFlow({transCode : item.businessKey}).then(({tableContent})=>{
              item.workFlow = tableContent[tableContent.length-2];
            })
            item.transCode = item.businessKey.replace(/_/g,'');

          });
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.listData = this.page === 1 ? tableContent : [...this.listData, ...tableContent];
          if (!noReset) {
            this.$nextTick(() => {
              this.resetScroll();
            })
          }
        }).catch(e => {
          this.resetScroll();
        })
      },
      //获取工作流
      async getWorkFlow(transCode){
        await getWorkFlow({transCode}).then(({tableContent})=>{
          let lastNode;
          lastNode = tableContent[tableContent.length-2];
          console.log(lastNode);
          return  lastNode

        })
      },
      // TODO 获取默认图片
      getDefaultImg(item) {
        let url = require('assets/avatar.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
    // TODO 重置下拉刷新、上拉加载的状态
    resetScroll() {
      this.$refs.bScroll.finishPullDown();
      this.$refs.bScroll.finishPullUp();
    },
    // TODO 上拉加载
    onPullingUp() {
      this.page++;
      this.getList();
    },
    // TODO 下拉刷新
    onPullingDown() {
      this.page = 1;
      this.getList(true).then(() => {
        this.$nextTick(() => {
          this.$refs.bScroll.finishPullDown().then(() => {
            this.$refs.bScroll.finishPullUp();
          });
        })
      });
    },
    //重置数据
    reloadData() {
      this.serachVal = '';
      this.resetCondition();
      this.getList();
    }
  },
  filters:{
    handleCrt(val){
      let date = val.duration,
      //计算出小时数
      hours=parseInt(date/(3600)),
      //计算相差分钟数
      leave2= date-(hours*3600) ,       //计算小时数后剩余的毫秒数
      minutes=Math.floor(leave2/(60)),
      backTime;
      if(hours>0){
        backTime = `${hours}小时前`;
      }
      else{        
        backTime = `${minutes}分钟前`;
      }
      return hours<24 ? backTime : `${val.crtTime.split(' ')[0]} ${hours}小时前`;
      
    }
  },
  created(){
    this.getList();
    setTimeout(()=>{
      this.showLoadding = false;

    },1000)
  }
}
</script>

<style lang='scss' scoped>
.vux-1px-b:after {
  border-color: #e8e8e8;
}
.list_top {
  padding: .1rem 0;
}
.list_wrapper{
  position: relative;
  width:100%;
  height: calc(100% - .5rem );
  overflow: hidden;
}
// 待处理消息
.todo_msg {
  width: 95%;
  margin: 0 auto .2rem;
  position: relative;
  padding: .06rem .08rem .04rem;
  box-sizing: border-box;
  box-shadow: 0 2px 10px #e8e8e8;
  // 消息顶部
  .msg_top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    // 表单基本信息
    .work_info {
      display: flex;
      .work_status,
      .work_code {
        font-weight: bold;
        font-size: .14rem;
        padding: 0 .06rem;
        display: inline-block;
      }
      // 表单状态
      .work_status {
        color: #fff;
        background: #53d397;
        border-top-left-radius: .12rem;
      }
      
      // 进行中
      .doing_work {
        background: #5077aa;
      }
      // 已失效
      .invalid_work {
        background: #c93d1b;
      }
      // 表单编码
      .work_code {
        display: inline-block;
        background: #455d7a;
        color: #fff;
      }
      // 进行中 编码 {
      .doing_code {
        color: #111;
        background: #dbe2ef;
      }

    }
    // 时间
    .time {
      font-size: .12rem;
      color: #757575;
    }
  }
  // 上个节点经办人
  .handle_info {
    margin-top: .06rem;
    display: flex;
    align-items: center;
    padding-bottom: .1rem;
    // 经办人头像
    .handle_avatar {
      width: .5rem;
      height: .5rem;
      img {
        width: 100%;
        border-radius: .08rem;
      }
    }
    //
    .info {
      margin-left: .04rem;
      // 节点操作信息
      .handle_part {
        margin-bottom: .02rem;
        // 操作人名称
        .name {
          font-size: .18rem;
          font-weight: 500;
        }
        // 操作
        .handle {
          font-size: .14rem;
          font-weight: 200;
        }
        .tips {
          color: #757575;
          font-size: .1rem;
        }
      }
      // 审批结果
      .handle_result {
        color: #757575;
        font-size: .12rem;
        .result {
          color: #fff;
          background: #53d397;
          padding: 0 .04rem;
          display: inline-block;
        }
        .reject_c{
          background: #c93d1b;
        }
      }
    }
  }
  // 用户操作部分
  .user_handle {
    width: 100%;
    text-align: center; 
    margin-top: .04rem;   
    .tips {
      color: #757575;
      font-size: .14rem;
      font-weight: 200;
    }
    .info {
      font-size: .18rem;
      color: #111;
      font-weight: bold;
    }
  }
    
  
}


</style>
