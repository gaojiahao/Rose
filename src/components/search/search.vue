<template>
  <div class='search'>
    <form class="search_part" :class="{'has-filter': filterList.length}" action=""
          @submit.prevent="searchMat(srhInpTx)" v-show="searchBoxShows">
      <i class="icon icon-search"></i>
      <input ref="searchInp" class="srh_inp" type="search" autocomplete="off"
            :placeholder="placeHolder" @input='getValue($event)' :value='srhInpTx' @focus="isShowDrop = true">
      <div class="pop_cfm" v-if='isFill'
           :class='{ pop_cancel : !srhInpTx.length }'
           @click="searchMat(srhInpTx)">{{srhInpTx.length>0 ? '搜索' : '返回'}}
      </div>
      <div class="pop_cfm" v-else @click="searchMat(srhInpTx)">搜索</div>
      <i class="icon-clear clear_icon" v-if="srhInpTx" @click="clear"></i>
    </form>
    <div class="search_filter" v-show="isShowDrop" v-if="filterList.length">
      <r-dropdown :list="filterList" @on-selected="popSelected"></r-dropdown>
      <div class="layer" @click="isShowDrop = false"></div>
    </div>

  </div>
</template>

<script>
  import {Icon} from "vux";
  import {setTimeout} from 'timers';
  import RDropdown from 'components/search/searchDropdown'

  export default {
    name: 'RSearch',
    props: {
      defaultValue:{
        type:String
      },
      isFill: {//是否为提交页面
        type: Boolean,
        default: false
      },
      searchBoxShows:{
        type: Boolean,
        default: true  
      },
      filterList: {
        type: Array,
        default() {
          return []
        }
      },
      placeHolder: {
        type: String,
        default: ''
      }
    },
    watch: {
      isShowDrop: {
        handler(status) {
          this.$event.$on('shut-down-filter', (val) => {
            this.isShowDrop = val;
            this.$event.$off('shut-down-filter');
          })
        }
      }
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
    // created(){
    //   var defaultValue = this.defaultValue;
    //   if(defaultValue)this.srhInpTx = defaultValue;
    // },
    mounted() {
      this.clear();
    },
    methods: {
      getValue(e) {
        setTimeout(function(){
          console.log('a')
          e.target.scrollIntoView(true);
          // true:元素的顶端将和其所在滚动区的可视区域的顶端对齐; false:底端对齐。
        },100);  // 延时 == 键盘弹起需要时间
        // 解决iOS原生输入法在input框输入文字之后一瞬间为空的坑
        setTimeout(() => {
          this.srhInpTx = e.target.value;
          // 提交页面输入框内容为空时 按钮会变成“返回” 此时让列表重新请求数据
          if (this.isFill && !this.srhInpTx) {
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
          this.isShowDrop = false;
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
      // 选择过滤条件
      popSelected(item) {
        this.property = item.value;
        this.$refs.searchInp.focus();
      },
      // 过滤时清除搜索
      clearVal() {
        this.srhInpTx = ''
      }
    }
  };
</script>

<style lang='scss' scoped>
  .search {
    width: 100%;
    padding: .08rem 0;
    .search_part {
      width: 100%;
      display: flex;
      height: .34rem;
      position: relative;
      line-height: .34rem;
      box-sizing: border-box;
      // 搜索输入框
      .srh_inp {
        flex: 1;
        border: none;
        outline: none;
        color: #333;
        appearance: none;
        font-size: .14rem;
        margin-left: .15rem;
        padding-left: .35rem;
        border-radius: .2rem;
        background: #F6F6F6;
        -webkit-appearance: none;
        &::-webkit-search-cancel-button {
          display: none;
        }
      }
      // 搜索 按钮
      .pop_cfm {
        color: #999;
        font-size: .14rem;
        margin: 0 .15rem 0 .12rem;
      }
      // 返回 按钮
      .pop_cancel {
        color: #fc3c3c;
      }
      // 搜索icon
      .icon {
        top: 50%;
        z-index: 1;
        left: .25rem;
        width: .14rem;
        height: .16rem;
        fill: #2d2d2d;
        position: absolute;
        transform: translate(0, -50%);
      }
      // 清除icon
      .clear_icon {
        top: 50%;
        right: .64rem;
        width: .18rem;
        height: .18rem;
        display: block;
        font-size: .12rem;
        line-height: .3rem;
        text-align: center;
        position: absolute;
        transform: translate(0, -50%);
      }
    }
    .search_filter {
      left: 0;
      bottom: 0;
      top: .8rem;
      width: 100%;
      z-index: 100;
      font-size: .14rem;
      position: absolute;
      overflow: hidden;
      .layer {
        opacity: .5;
        height: 100%;
        background: #000;
      }
    }
  }
</style>
