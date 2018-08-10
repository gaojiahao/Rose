<template>
  <div class="pages">
    <div class="list_top">
      <search class="search" @search='searchList'></search>
    </div>
    <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <div class='each_task' v-for='(item,index) in listData' :key='index' @click='goDetail(item)'>
          <div class="todo_msg" v-if='item.status === "待处理"'>
            <div class="msg_top">
              <!-- 表单状态 及 编码 -->
              <div class="work_info">
                <!-- 状态 -->
                <span class="work_status doing_work" >{{item.status}}</span>
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
                <img src="../../assets/ava03.png" alt="avatar">
              </div>
              <div class="info">
                <div class="handle_part">
                  <span class="name">{{item.lastNode.userName}}</span>
                  <span class="handle">进行了审批</span>
                  <span class="tips">[上个节点]</span>
                </div>
                <div class="handle_result">
                  审批结果：<span class="result" :class='{reject_c : item.lastNode.status === "同意" || item.lastNode.status === "提交"  }'>{{item.lastNode.status}}</span>
                </div>
              </div>
            </div>
            <!-- 用户需要进行的操作 -->
            <div class="user_handle">
              <div class="tips">此单你需要进行:</div>
              <div class="info">{{item.nodeName}}</div>
            </div>
          </div>
          <div class="todo_msg" v-else>
            <div class="msg_top">
              <!-- 表单状态 及 编码 -->
              <div class="work_info">
                <!-- 状态 -->
                <span class="work_status " >{{item.status}}</span>
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
              <div class="info">
                <div class="handle_part">
                  <span class="handle">已进行了</span>
                  <span class="result" :class='{reject_c : item.nodeName === "拒绝" || item.nodeName === "撤回" || item.nodeName === "重新提交" }'>{{item.nodeName}}</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      
    </r-scroll>
    <loading-form :show='showLoadding'></loading-form>
   <router-view></router-view>
  </div>
</template>

<script>
import search from 'components/search'
import {getAllMsgList} from 'service/msgService.js'
import {getWorkFlow} from 'service/detailService.js'
import {isMyflow} from 'service/detailService'
import businessMap from '@/home/pages/maps/detail.js'
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
      showLoadding : true,
      processName : '',
    }
  },
  components: {
    search,RScroll,LoadingForm
  },
  methods:{
    goDetail(item){
      let code = businessMap[item.businessKey.split('_')[0]] ;
      //判断是否是重新提交，如果是，跳转到创建订单页面
      isMyflow({transCode : item.businessKey}).then(({tableContent}) => {
        if (tableContent.length > 0) {
          let {isMyTask, nodeName} = tableContent[0];
          if (isMyTask === 1 && nodeName === '重新提交') {
            this.$router.push({
              // path: `/list/${code}/fillform`,
               path: `/notice/msglist/${code}/fillform`,
              query: {
                transCode: item.businessKey
              }
            })
          } else {
            this.$router.push({
              path: `/notice/msglist/${code}/detail`,
              query: {
                transCode: item.businessKey
              }
            })
          }
        } else {
          this.$router.push({
            path: `/notice/msglist/${code}/detail`,
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
        let filter = {
          processName : this.processName,
          businessKey: this.serachVal,
          crtName: this.serachVal
        };
        return getAllMsgList({
          limit: this.limit,
          page: this.page,
          filter: JSON.stringify(filter),
        }).then(({total = 0, tasks = []}) => {         
          tasks.forEach(item => {
            if(!item.endTime){
              item.status = "待处理"
            }else{
              item.status = '已处理'
            }
            item.transCode = item.businessKey.replace(/_/g,'');
          });
          this.hasNext = total > (this.page - 1) * this.limit + tasks.length;
          this.listData = this.page === 1 ? tasks : [...this.listData, ...tasks];
          if (!noReset) {
            this.$nextTick(() => {
              this.resetScroll();
            })
          }
        }).catch(e => {
          this.resetScroll();
        })
      },
      // //获取工作流
      // async getWorkFlow(transCode){
      //   await getWorkFlow({transCode}).then(({agenda})=>{
      //     let lastNode;
      //     lastNode = agenda[agenda.length-2];
      //     console.log(lastNode);
      //     return  lastNode

      //   })
      // },
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
         backTime = minutes === 0 ? '1分钟前' :`${minutes}分钟前`;  
      }
      return hours<24 ? backTime : `${val.crtTime.split(' ')[0]}`;
      
    }
  },
  watch: {
    $route: {
      handler(to, from) {
        // 判断是否重新请求页面
        if (to.meta.reload && to.path.indexOf('/notice/msglist') !== -1) {
          console.log("进入")
          to.meta.reload = false;
          this.reloadData();
        }
      },
    }
  },
  created(){
    // this.processName = this.$route.params.name;
    this.processName = this.$route.query.name;
    this.getList();
    setTimeout(()=>{
      this.showLoadding = false;

    },1000)
  },
  beforeRouteEnter (to, from, next) {
    to.meta.title = to.query.name ;
    next();
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
        .result {
          color: #757575;
          font-size: .12rem;
          color: #fff;
          background: #53d397;
               
          padding: 0 .04rem;
          display: inline-block;
        }
        .reject_c{
           background: #c93d1b;   
        }
      }
      // 审批结果
      .handle_result {
        color: #757575;
        font-size: .12rem;
        .result {
          color: #fff;
          background: #c93d1b;
         
          padding: 0 .04rem;
          display: inline-block;
        }
        .reject_c{
          background: #53d397;
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
