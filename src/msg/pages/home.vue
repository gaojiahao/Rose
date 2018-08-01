<template>
  <div class="inPage">
    <!-- 搜索框 -->
    <search @search='searchList'></search>
    <div class='wrapper' ref="bScroll">
      <div class='content'>
        <div class="msg_list" v-for='(value,i) in listData' :key='i'>
          <div class="each_msg">
            <div class="msg_info">
              <!-- 图片 和 应用名称 -->
              <div class="app_info">
                <span class="app_img">
                  <img :src='`/dist/${value[0].icon}`' alt="appImg">
                </span>
                <span class="app_name">{{i}}</span>
              </div>
              <!-- 时间 -->
              <div class="msg_time">{{value[0] | handleCrt }}</div>
              <badge :text="value.length"></badge>
            </div>
            <div class="recv_msg">
              您收到{{value.length>1 ? '多' : '一'}}条新的消息
            </div>
          </div>
        </div>
      </div>     
    </div>   
  </div>
</template>
<script>
import { Badge } from 'vux'
import search from 'components/search'
import {getMsgList} from 'service/msgService.js'
import BScroll from 'better-scroll' 
export default {
  data(){
    return{
      defaultImg: require('assets/sales-stock.png'),
      serachVal: '',
      listData: {},     
    }
  },
  components: {
    search,Badge
  },
  methods:{
    searchList(val) {
      this.serachVal = val;
      this.getList();
    },
    //获取销售订单数据
    getList() {
      getMsgList().then(({tableContent}) => {     
        tableContent.forEach(item => {
          if (!this.listData[item.processName]) {
            this.$set(this.listData,item.processName,[item])
          }else{
            this.listData[item.processName].push(item);
          }
        })
      })
    },
  },
  filters:{
    handleCrt(val){
      let date1 = new Date().getTime(),
      date2 = new Date(val.crtTime.replace('-','/')).getTime(),
      date3 = (date1-date2),
      //计算出小时数
      hours=Math.floor(date3/(3600*1000)),
      //计算相差分钟数
      leave2=hours%(3600*1000) ,       //计算小时数后剩余的毫秒数
      minutes=Math.floor(leave2/(60*1000)),
      //计算相差秒数
      leave3=leave2%(60*1000) ,     //计算分钟数后剩余的毫秒数
      seconds=Math.round(leave3/1000);
      return hours<24 ? `${hours}时${minutes}分${seconds}秒` : val.crtTime

    }
  },
  created(){
    this.getList();
  },
  mounted(){
    this.$nextTick(()=>{
      this.scroll = new BScroll(this.$refs.bScroll, {
        click:true

      })
    })
  }
}
</script>

<style lang='scss' scoped>
.search {
  margin: .1rem 0;
}
.wrapper{
  width:100%;
  height: calc(100% - .5rem - .49rem);
}
.msg_list{
  position: relative;
  .vux-badge-single{
    position: absolute;
    right:8px;
    top:0;
  }
}
.each_msg {
  width: 95%;
  padding: .1rem;
  background: #fff;
  margin: 0 auto .1rem;
  box-sizing: border-box;
  border-radius: .08rem;
  box-shadow: 0 2px 10px #e8e8e8;
  // 消息头部信息
  .msg_info {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    span {
      display: inline-block;      
    }
    // 图片、应用名称
    .app_info {
      display: flex;
      align-items: center;
      // 图片
      .app_img {
        width: .24rem;
        height: .24rem;
        img {
          width: 100%;
          border-radius: .06rem;
        }
      }
      // 应用名称
      .app_name {
        font-size: .14rem;
        margin-left: .06rem;
      }
    }
    // 产生时间
    .msg_time {
      font-size: .14rem;
      color: #757575;
    }
  }
  // 消息内容
  .recv_msg {
    color: #3a3a3a;
    font-weight: 200;
    margin-top: .1rem;
  }
}
</style>
