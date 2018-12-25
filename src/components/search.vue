<template>
  <div class='search'>
    <form class="search_part" :class="{'has-filter': filterList.length}" action=""
          @submit.prevent="searchMat(srhInpTx)">
      <div class="icon-search serach_icon"></div>
      <input class="srh_inp" type="search" autocomplete="off" @input='getValue($event)' :value='srhInpTx' @focus="isShowDrop = true">
      <div class="pop_cfm" v-if='isFill'
           :class='{ pop_cancel : !srhInpTx.length }'
           @click="searchMat(srhInpTx)">{{srhInpTx.length>0 ? '搜索' : '返回'}}
      </div>
      <div class="pop_cfm" v-else @click="searchMat(srhInpTx)">搜索</div>
      <div class="icon-clear clear_icon" v-if="srhInpTx" @click="clear"></div>
    </form>
    <div class="search_filter" v-show="isShowDrop">
      <r-dropdown :list="filterList" @on-selected="popSelected" v-if="filterList.length"></r-dropdown>
      <div class="layer" @click="isShowDrop = false"></div>
    </div>
    
  </div>
</template>

<script>
  import {Icon} from "vux";
  import {setTimeout} from 'timers';
  import RDropdown from 'components/searchDropdown'

  export default {
    name: 'RSearch',
    props: {
      isFill: {//是否为提交页面
        type: Boolean,
        default: false
      },
      filterList: {
        type: Array,
        default() {
          return []
        }
      },
    },
    data() {
      return {
        srhInpTx: "",
        timer: null,
        property: '',
        isShowDrop: false,
      };
    },
    components: {
      Icon,
      RDropdown,
    },
    methods: {
      getValue(e) {
        // 解决iOS原生输入法在input框输入文字之后一瞬间为空的坑
        setTimeout(() => {
          this.srhInpTx = e.target.value;
          // 提交页面输入框内容为空时 按钮会变成“返回” 此时让列表重新请求数据 
          if(this.isFill && !this.srhInpTx) {
            this.$emit("search", {
              val: this.srhInpTx,
              property: this.property,
            });
          }
        }, 0)
      },
      searchMat(val) {
        // 如果 输入框没有值 则点击关闭popup
        if (this.isFill && !val) {
          this.$emit('turn-off', false);
          return;
        }
        this.$emit("search", {
          val: this.srhInpTx,
          property: this.property,
        });
        // 点击'搜索' 关闭输入框
        document.activeElement.blur();
        this.isShowDrop = false;
      },
      clear() {
        this.srhInpTx = "";
        this.$emit("search", {
          val: this.srhInpTx,
          property: this.property,
        });
      },
      // TODO 选择过滤条件
      popSelected(item) {
        this.property = item.value;
      },
      // 过滤时清除搜索
      clearVal(){
        this.srhInpTx = ''
      }
    },
    created() {
    }
  };
</script>

<style lang='scss' scoped>
  .search_part {
    width: 100%;
    display: flex;
    height: 0.34rem;
    // padding: 0 0.08rem;
    line-height: 0.34rem;
    position: relative;
    box-sizing: border-box;
    &.has-filter {
      .srh_inp {
        padding-left: .35rem;
      }
    }
    // 搜索输入框
    .srh_inp {
      /*flex: 5;*/
      width: 3.06rem;
      height: .34rem;
      margin-left: 0.15rem;
      outline: none;
      border: none;
      color: #333;
      font-size: 0.14rem;
      background: #F6F6F6;
      line-height: .34rem;
      border-radius: .2rem;
      -webkit-appearance: none;
      appearance: none;
      &::-webkit-search-cancel-button {
        display: none;
      }
    }
    // 搜索 按钮
    .pop_cfm {
      color: #999;
      font-size: .12rem;
      margin-left: .15rem;
    }
    // 返回 按钮
    .pop_cancel {
      color: #fc3c3c;
    }
    // 搜索icon
    .serach_icon {
      position: absolute;
      left: .25rem;
      top: 50%;
      z-index: 1;
      fill: #2d2d2d;
      transform: translate(0, -50%);
      width: 0.14rem;
      height: 0.16rem;
    }
    // 清除icon
    .clear_icon {
      top: 50%;
      right: .64rem;
      width: .18rem;
      height: .18rem;
      z-index: 100;
      display: block;
      font-size: 0.12rem;
      line-height: 0.3rem;
      text-align: center;
      position: absolute;
      transform: translate(0, -50%);
    }
  }
  .search_filter {
    top: .49rem;
    width: 100%;
    left: 0;
    bottom: 0;
    position: absolute;
    z-index: 100;
    font-size: .14rem;
    .layer {
      background: #000;
      opacity: 0.5;
      height: calc(100% - 1.46rem);
    }
  }
</style>
