<template>
  <div class="inPage">
    <template v-if="listData">
      <!-- 搜索框 -->
      <search @search='searchList'></search>
      <div class='wrapper' ref="bScroll">
        <div class='content'>
          <div class="msg_list" >
            <div class="each_msg"
                @click="goMsglist(value[0])" 
                v-for='(value,i) in listData' 
                :key='i'>
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
    </template>
    <router-view></router-view>
  </div>
</template>
<script>
import { Badge } from 'vux'
import {getMsgList} from 'service/msgService.js'
import search from 'components/search'
import BScroll from 'better-scroll' 
export default {
  data(){
    return{
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
    //获取应用消息数据
    getList() {
      getMsgList().then(({ tableContent }) => {     
        tableContent.forEach(item => {
          if (!this.listData[item.processName]) {
             // 以 <应用名称> 进行分类
            this.$set(this.listData, item.processName, [item])
          }
          else{
            this.listData[item.processName].push(item);
          }
        })
      })
    },
    // 前往应用消息列表
    goMsglist(item){
      this.$router.push({ path : `/notice/msglist/${item.processName}`})
    }
  },
  filters:{
    handleCrt(val){
      let date = val.duration,
      //计算出小时数
      hours = parseInt( date / (3600) ),
      //计算相差分钟数
      leave2 = date - ( hours * 3600 ) ,       //计算小时数后剩余的毫秒数
      minutes = Math.floor( leave2 / (60) ),
      //计算相差秒数
      leave3 = leave2 - ( minutes * 60 ) ,     //计算分钟数后剩余的毫秒数
      seconds = Math.round(leave3),
      backTime;
      if(hours>0){
        backTime = `${hours}小时前`;
      }
      else{       
        backTime = `${minutes}分钟前`;        
      }
      return hours<24 ? backTime : `${val.crtTime.split(' ')[0]}`;
      
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
  overflow: hidden;
}
.each_msg{
  position: relative;
  .vux-badge{
    position: absolute;
    right:0;
    top:-.1rem;
  }
}
.each_msg {
  width: 95%;
  padding: .1rem;
  background: #fff;
  margin: .1rem auto .2rem;
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
