<template>
  <div class="inPage">
    <template v-if="listData">
      <div class='wrapper' ref="bScroll">
        <div class="when_null" v-if="isNull">
          暂无待办消息
        </div>
        <div class="msg_list" v-else>
          <div class="msg"
              @click="goMsglist(value, i)"
              v-for='(value, i) in listData'
              :key='i'>
            <div class='each_msg' :class="{visited: value.visited}">
              <div class="msg_info">
                <!-- 图片 和 应用名称 -->
                <div class="app_info">
                  <span class="app_img">
                    <img :src='value.list[0].pic' alt="appImg" @error='getDefaultImg(value[0])'>
                  </span>
                  <span class="app_name">{{i}}</span>
                </div>
                <!-- 时间 -->
                <div class="msg_time">{{value.list[0] | handleCrt }}</div>
                <badge :text="value.list.length"></badge>
              </div>
              <div class="recv_msg">
                您收到{{value.list.length>1 ? '多' : '一'}}条新的消息
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
// vux组件引入
import { Badge } from 'vux'
// 映射表 引入
import Apps from '@/home/pages/apps/bizApp/maps/Apps'
// 请求 引入
import { getMsgList } from 'service/msgService'
// 组件 引入
import BScroll from 'better-scroll'
export default {
  data(){
    return{
      listData: {},
      isNull: false
    }
  },
  components: {
   Badge
  },
  methods:{
    getDefaultImg(item) {
      let url = require('assets/defaultApp.png');
      if (item) {
        item.pic = url;
      }
      return url
    },
    //获取应用消息数据
    getList() {
      return getMsgList().then(({dataCount = 0, tableContent = []}) => {
        this.$event.$emit('badgeNum',dataCount);
        if(!tableContent.length){
          // 没有数据的时候
          this.isNull = true;
          return;
        }
        tableContent.forEach( item => {
          this.isNull = false;
          // app图标处理
          item.pic = item.icon
            ? `/dist/${item.icon}`
            : this.getDefaultImg();
          // 只针对已经移动化的应用做消息的显示
          if(Apps[item.listId]){
            if (!this.listData[item.title]) {
              // 以 <应用名称> 进行分类
              this.$set(this.listData, item.title, {list:[item]})
            }
            else{
              this.listData[item.title].list.push(item);
            }
          }
        })
        this.$nextTick(()=>{
          this.scroll = new BScroll(this.$refs.bScroll, {
            click:true
          })
        })
      })
    },
    // 前往应用消息列表
    goMsglist(item, name){
      // 高亮点击的应用
      item.visited = true;
      this.$set(this.listData, name, {...item});
       // 等待动画结束后跳转
      setTimeout(() => {
        this.$router.push({
          path :'/msglist', query : { name }
        })
      },200);
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
    this.getList().then(() => {
      this.$loading.hide();
    });
  },
}
</script>

<style lang='scss' scoped>
.when_null {
  top: 50%;
  width: 100%;
  font-size: .24rem;
  color: #c8c8c8;
  font-weight: bold;
  text-align: center;
  position: absolute;
  transform: translate(0, -50%);
}
.inPage{
  overflow: hidden;
}
.wrapper{
  width:100%;
  height: calc(100% - .49rem);
  overflow: hidden;
  .msg_list {
    padding: .04rem 0 .02rem;
  }
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
  transition: background-color 200ms linear;
  &.visited {
    background-color: #e8e8e8;
  }
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
    
    margin-top: .1rem;
  }
}
</style>
