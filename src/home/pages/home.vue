<template>
  <div class="inPage">
    <div class="content" ref='home'>
      <div>
        <!-- 用户头像部分 -->
        <div class="user_part">
          <div class="user_avatar vux-1px-b">
            <img src="../../assets/ava03.png" alt="avatar">
            <div class="tips">欢迎,瑞福登</div>
          </div>
        </div>
        <!-- 基础应用部分 -->
        <basic-app :BSarray='BSarray' :goBasic='goBasic'></basic-app>
        <!-- 销售应用部分 -->
        <sale-app :XSarray='XSarray' :goList='goList'></sale-app>
        <!-- 采购应用部分 -->
        <buy-app :PURarray='PURarray' :goList='goList'></buy-app>
        <!-- 调拨应用部分 -->
        <alloca-app :ACAarray='ACAarray' :goList='goList'></alloca-app>
      </div>   
    </div>
    <loadding :show='showLoadding'></loadding>
  </div>
</template>

<script>
// 接口引入
import homeService from 'service/homeservice'
// 映射表引入
import basicMap from './maps/basic'
import businessMap from './maps/business'
// 组件引入
import buyApp from 'components/home/buyApp'            // 采购应用
import saleApp from 'components/home/saleApp'          // 销售应用
import basicApp from 'components/home/basicApp'        // 基础应用
import allocaApp from 'components/home/allocationApp'  // 调拨应用
// 插件引入
import Bscroll from 'better-scroll'
import Loadding from 'components/Loading'
export default {
  data(){
    return{
      BSarray : [],        // 基础对象 数组
      XSarray : [],        // 销售 数组
      PURarray: [],        // 采购 数组
      ACAarray: [],        // 调拨 数组
      FINarray: [],        // 财务 数组
      homeScroll : null,
      showLoadding : true,
    }
  },
  components:{ buyApp, saleApp, basicApp, allocaApp, Loadding },
  methods:{
    // 基础应用
    goBasic(item){
      this.$router.push({ path : `${basicMap[item]}`})
    },
    // 前往列表
    goList(item){
      this.$router.push({ path:`/list/${item}`})
    }
  },
  created(){
    (async() => {
      // 获取首页应用列表
      await homeService.getMeau().then( res => {
        for(let val of res){
          // 获取基础对象
          if(val.text === '基础对象'){
            for(let item of val.children ){
              // 基础对象
              if(basicMap[item.text]){
                // 动态添加对应的背景底色
                switch(item.text){
                  case '仓库':
                    item.bgColor = '#D85656';
                    item.boxShadow = '#D85656';
                    break;
                  case '物料':
                    item.bgColor = '#F29C35';
                    item.boxShadow = '#F29C35';
                    break;
                  case '往来':
                    item.bgColor = '#338183';
                    item.boxShadow = '#338183';
                    break;
                }
                // 图片处理
                item.icon = item.icon
                  ? `/dist/${item.icon}`
                  : ''
                this.BSarray.push(item);
              }
            }
          }
          // 获取业务应用
          else if(val.text === '业务应用'){
            for(let item of val.children){
              // 获取 业务应用-销售 应用
              if(item.text === '销售'){
                for(let ite of item.children){
                  //映射表 赋值
                  if(businessMap[ite.text]){
                    ite.code = businessMap[ite.text]
                    ite.icon = ite.icon
                      ? `/dist/${ite.icon}`
                      : ''                    
                    this.XSarray.push(ite);
                  }
                }
              }
              // 获取 采购应用
              if(item.text === '采购'){
                for(let val of item.children){
                  if(businessMap[val.text]){
                    val.code = businessMap[val.text]
                    val.icon = val.icon
                      ? `/dist/${val.icon}`
                      : ''                    
                    this.PURarray.push(val);
                  }
                }
              }
              // 获取 调拨应用
              if(item.text === '库存' || item.text === '财务'){
                for(let val of item.children){
                  if(businessMap[val.text]){
                    val.code = businessMap[val.text]
                    val.icon = val.icon
                      ? `/dist/${val.icon}`
                      : ''                    
                    this.ACAarray.push(val);
                  }
                }
              }
            }
          }
        }
        this.showLoadding = false;
      }).catch( err => {
        this.$vux.alert.show({
          content: err.message
        })
      })
    })()
  },
  mounted(){
    this.homeScroll = new Bscroll(this.$refs.home,{
      click:true
    })
  }
}
</script>

<style lang='scss' scoped>
.inPage {
  background: #F5F5F5;
}
.vux-1px-b:after {
  border-color: #e8e8e8;
}
.content {
  width: 100%;
  height: calc(100% - .49rem);
  overflow: hidden;
}
.mg_auto {
  width: 95%;
  margin: 0 auto;
}
// 顶部 用户头像部分
.user_part {
  display: flex;
  padding: 0 .1rem;
  background: #fff;
  box-sizing: border-box;
  .user_avatar {
    width: 100%;
    display: flex;
    padding: .04rem 0 .02rem;
    align-items: center;
    justify-content: space-between;
    img {
      width: .35rem;
      height: .35rem;
      border-radius: 50%;
    }
    .tips {
      font-size: .18rem;
    }
  }
}

</style>
