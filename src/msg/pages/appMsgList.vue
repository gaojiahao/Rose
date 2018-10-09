<template>
  <div class="pages">
    <div class="list_top">
      <search class="search" @search='searchList'></search>
    </div>
    <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <div class='each_task' v-for='(item,index) in listData' :key='index' @click='goDetail(item,index)'>
          <div class="todo_msg" :class="{visited: item.visited}">
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
                <img :src="item.lastNode.photoUrl || DefaultImg" alt="avatar">
              </div>
              <div class="info">
                <div class="handle_part">
                  <span class="name">{{item.lastNode.userName}}</span>
                  <span class="handle">进行了操作</span>
                  <span class="tips">[上个节点]</span>
                </div>
                <div class="handle_result">
                  <span>操作动作:</span>
                  <span class="result" 
                  :class='{reject_c : item.lastNode.status === "同意" || 
                  item.lastNode.status === "提交"  }'>
                  {{item.lastNode.status}}
                  </span>
                </div>
              </div>
            </div>
            <!-- 用户需要进行的操作 -->
            <div class="user_handle">
              <div class="tips">此单你需要进行:</div>
              <div class="info">{{item.nodeName}}</div>
            </div>
          </div>
        </div>
    </r-scroll>
   <router-view></router-view>
  </div>
</template>

<script>
// 请求引入
import { isMyflow } from 'service/detailService'
import { getAllMsgList } from 'service/msgService'
import { getWorkFlow } from 'service/detailService'
// 组件引入
import search from 'components/search'
import RScroll from 'components/RScroll'

export default {
  data(){
    return{
      serachVal: '',
      title : '',
      listData: [],
      page: 1,
      limit: 10,
      hasNext: true,
      DefaultImg : require('assets/ava03.png'),
      scrollOptions: {
        click: true,
        pullDownRefresh: true,
        pullUpLoad: true,
      },
    }
  },
  components: {
    search, RScroll, 
  },
  methods:{
    goDetail(item, index){
      // 获取 listID
      let { listId, title } = item;
      // 高亮 点击过的模块
      item.visited = true;
      this.$set(this.listData, index, {...item});
      let start = Date.now();
      const TRANSITION_TIME = 200; // 动画时间
      //判断是否是重新提交，如果是，跳转到创建订单页面
      isMyflow({transCode : item.businessKey}).then(({tableContent}) => {
        let jump = () => {
          let path = '';
          if (tableContent.length > 0) {
            let {isMyTask, nodeName} = tableContent[0];
            if (isMyTask === 1 && nodeName === '重新提交') {
              path = `/fillform/${item.typeID}/${item.listId}`;
            } else {
              path = `/detail/${item.typeID}/${item.listId}`;
            }
          } else {
            path = `/detail/${item.typeID}/${item.listId}`;
          }
          this.$router.push({
            path,
            query: {
              name: title,
              transCode : item.businessKey,
            }
          })
        };
        let calcTime = Date.now() - start;
        // 请求结束时间大于动画时间则直接跳转到详情页
        if (calcTime > TRANSITION_TIME) {
          jump();
        } else {
          // 等待动画结束后跳转
          setTimeout(() => {
            jump();
          }, TRANSITION_TIME - calcTime);
        }
      }).catch(e => {
        item.visited = false;
        this.$set(this.listData, index, {...item});
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
          title : this.title,
          businessKey: this.serachVal,
          crtName: this.serachVal
        };
        return getAllMsgList({
          limit: this.limit,
          page: this.page,
          filter: JSON.stringify(filter),
        }).then(({total = 0, tasks = [], success = true}) => {
          tasks.forEach(item => {           
            item.status = "待处理"
            item.transCode = item.businessKey;
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
      this.getList().then(() => {
        this.$loading.hide();
      });
    }
  },
  filters:{
    handleCrt(val){
      let date = val.duration,
      //计算出小时数
      hours = parseInt(date / (3600)),
      //计算相差分钟数
      leave2 = date - (hours*3600) ,       //计算小时数后剩余的毫秒数
      minutes = Math.floor(leave2/(60)),
      backTime;
      if(hours > 0){
        backTime = `${hours}小时前`;
      }
      else{
         backTime = minutes === 0 ? '1分钟前' :`${minutes}分钟前`;
      }
      return hours < 24 ? backTime : `${val.crtTime.split(' ')[0]}`;
    }
  },
  created(){
    this.$loading.show();
    this.title = this.$route.query.name;
    this.getList().then(() => {
      this.$loading.hide();
    });
  },
  activated(){
    let reload = this.$route.meta.reload;
    this.title = this.$route.query.name;
    setTimeout(() => {
      let tmp = [...this.listData];
      tmp.forEach(item => {
        // 还原被选中的背景色
        item.visited = false;
      });
      this.listData = tmp;
    },200);
    if(reload){
      this.$loading.show();
      this.reloadData();
      this.$route.meta.reload = false;
    }
  },
  beforeRouteEnter (to, from, next) {
    to.meta.title = to.query.name ;
    next();
  },
  beforeRouteLeave (to, from, next) {
    if(to.name === 'MSGHOME'){
      from.meta.reload = true;
    }
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
  position: relative;
  margin: 0 auto .2rem;
  border-radius: .08rem;
  box-sizing: border-box;
  padding: .06rem .08rem .04rem;
  box-shadow: 0 2px 10px #e8e8e8;
  // 背景动画
  transition: background-color 200ms linear;
  &.visited {
    background-color: #e8e8e8;
  }
  // 消息顶部
  .msg_top {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
          font-size: .12rem;
          color: #cd5555;
          font-weight: bold;
        }
        .reject_c{
          color: #5077aa
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
    }
    .info {
      font-size: .18rem;
      color: #111;
      font-weight: bold;
    }
  }
}


</style>
