<template>
  <div class='tab' v-if='choicedTab'>
    <!-- 收起状态-->
    <div class='only_tab_item' @click="tabShow = !tabShow">
      <div class='tab_item_name'>{{choicedTab}}
        <x-icon type="ios-arrow-down" size="24" class="arrow"></x-icon>        
      </div>  
    </div>
    <!--展开状态 -->
    <div class='all_tab_item' v-show="tabShow"> 
      <div class='tab_item_name' v-for='(item,index) in tabVal' 
          :key='index'  @click="switchTab(item)">
          {{item.view_name}}
      </div>                  
    </div>
  </div>
</template>
<script>
export default {
  data(){
    return{
      tabShow : false,
      choicedTab :''

    }
  },
  props:{
    tabVal:{
      type : Array,
      default:[]
    }
  },
  methods:{
    switchTab(item){
      this.choicedTab = item.view_name;
      this.tabShow = false;
      this.$emit('tab-click',item)
    }
  },
  watch:{
    tabVal:{
      handler(val){
        if(val.length){
          this.choicedTab = val[0].view_name;
        }
      }
    }
  },
  created(){
    if(this.tabVal.length){
      this.choicedTab = this.tabVal[0].view_name;
    }
  }

}
</script>

<style lang="scss" scoped>
  .vux-x-icon {
    fill: rgb(117, 117, 117);
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
          vertical-align: middle;
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
      overflow: auto;
      opacity: 0.95;
      border-bottom: 1px solid #e8e8e8;
      .tab_item_name{
        line-height: 44px;
      }
    }
  }
</style>

