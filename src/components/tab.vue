<template>
  <div class='tab'>
    <!-- 收起状态-->
    <div class='only_tab_item' @click="tabShow = !tabShow">
      <div class='tab_item_name'>{{choicedTab}}
        <p class="arrow" v-if='!tabShow'>
          <x-icon type="ios-arrow-down" size="24" ></x-icon>  
        </p>
        <p class="arrow" v-else>
          <x-icon type="ios-arrow-up" size="24" ></x-icon>  
        </p>         
      </div>  
    </div>
    <!--展开状态 -->
    <div class='all_tab_item' ref='tabItem' v-show='tabShow'> 
      <div class='tab_wrapper'>
        <div class='tab_item_name' v-for='(item,index) in tabVal' :class='{active : index===activeTabIndex}'
            :key='index'  @click="switchTab(item,index)">
            {{item.view_name}}
        </div>         
      </div>                      
    </div>
  </div>
</template>
<script>
import Bscroll from 'better-scroll'
export default {
  data(){
    return{
      tabShow : false,
      choicedTab :'', //选中的值
      activeTabIndex:0,
      tabScroll : null,
    }
  },
  props:{
    tabVal:{ //所有tab值
      type : Array,
      default:[]
    }
  },
  methods:{
    //切换tab传值
    switchTab(item,index){
      this.choicedTab = item.view_name;
      this.activeTabIndex = index;
      this.tabShow = false;
      this.$emit('tab-click',item)
    }
  },
  watch:{
    tabVal:{//监听父组件的传值，赋初始值
      handler(val){
        if(val.length){
          this.choicedTab = val[0].view_name;
        }
      }
    },
    tabShow:{ //监听展开tab列表展开状态，创建bscroll
      handler(val){
        if(val){
          this.$nextTick(()=>{          
            this.tabScroll = new Bscroll(this.$refs.tabItem,{
              click:true
            })           
          })

        }
      }
    }
  },
  created(){//当页面刷新时重新赋值
    if(this.tabVal.length){
      this.choicedTab = this.tabVal[0].view_name;
    }
  }
}
</script>

<style lang="scss" scoped>
  //修改vux箭头
  .vux-x-icon {
    fill: rgb(117, 117, 117);
    vertical-align: middle;
  }
  .tab{
    width: 100%;
    border-bottom: 1px solid #e8e8e8;
    color: rgb(117, 117, 117);
    position: relative;
    //收起的tab
    .only_tab_item{
      text-align: center;
      position: relative;
      .tab_item_name{
        line-height: 44px;
        .arrow{
          display: inline-block;
        }
      }
    }
    //展开的tab
    .all_tab_item{
      position: absolute;
      left:0;
      top:45px;
      z-index: 10;
      width: 100%;
      text-align: center;
      background: rgba(245,245,245,0.95);
      height:132px;
      overflow: hidden;
      opacity: 0.95;
      border-bottom: 1px solid #e8e8e8;
      .tab_item_name{
        line-height: 44px;
      }
      .active{
        background: #ddd;
      }
    }
  }
</style>

