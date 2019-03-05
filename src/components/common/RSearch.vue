<template>
  <div class='search'>
    <form class="search_part" :class="{'has-filter': filterList.length}" action=""
          @submit.prevent="searchMat(srhInpTx)">
      <x-icon class="serach_icon" type="ios-search" size="20"></x-icon>
      <r-dropdown :list="filterList" @on-selected="popSelected" v-if="filterList.length"></r-dropdown>
      <input class="srh_inp" type="search" autocomplete="off" @input='getValue($event)' :value='srhInpTx'>
      <div class="pop_cfm" v-if='isFill'
           :class='{ pop_cancel : !srhInpTx.length }'
           @click="searchMat(srhInpTx)">{{srhInpTx.length>0 ? '搜索' : '返回'}}
      </div>
      <div class="pop_cfm" v-else @click="searchMat(srhInpTx)">搜索</div>
      <icon class="clear_icon" type="clear" v-if="srhInpTx" @click.native="clear"></icon>
    </form>
  </div>
</template>

<script>
  import {Icon} from "vux";
  import RDropdown from 'components/common/RDropdown'

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
      }
    },
    data() {
      return {
        srhInpTx: "",
        timer: null,
        property: '',
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
          if (!this.srhInpTx) {
            this.$emit("search", {
              val: this.srhInpTx,
              property: this.property,
            });
          }
        }, 0)
      },
      searchMat(val) {
        // 如果 输入框没有值 则点击关闭popup
        if (!val) {
          this.$emit('turn-off', false);
          return;
        }
        this.$emit("search", {
          val: this.srhInpTx,
          property: this.property,
        });
        // 点击'搜索' 关闭输入框
        document.activeElement.blur();
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
      },
    },
    created() {
    }
  };
</script>

<style lang='scss' scoped>
  .search_part {
    width: 100%;
    display: flex;
    height: 0.3rem;
    padding: 0 0.08rem;
    line-height: 0.3rem;
    position: relative;
    box-sizing: border-box;
    &.has-filter {
      .srh_inp {
        padding-left: 1.05rem;
      }
    }
    /* 下拉框 */
    .r-dropdown {
      top: 0;
      width: .75rem;
      left: .07rem;
      position: absolute;
      padding-left: .25rem;
      background: #dbe2ef;
      border-top-left-radius: .3rem;
      border-bottom-left-radius: .3rem;    
    }
    // 搜索输入框
    .srh_inp {
      /*flex: 5;*/
      width: calc(100% - .5rem);
      outline: none;
      border: none;
      color: #2d2d2d;
      font-size: 0.16rem;
      padding: 0 0.3rem 0 .4rem;
      background: #f3f1f2;
      border-top-left-radius: 0.3rem;
      border-bottom-left-radius: 0.3rem;
      -webkit-appearance: none;
      appearance: none;
      &::-webkit-search-cancel-button {
        display: none;
      }
    }
    // 搜索 按钮
    .pop_cfm {
      /*flex: 1;*/
      width: .5rem;
      color: #fff;
      font-size: 0.14rem;
      text-align: center;
      background: #3f72af;
      border-top-right-radius: 0.3rem;
      border-bottom-right-radius: 0.3rem;
    }
    // 返回 按钮
    .pop_cancel {
      background: #fc3c3c;
    }
    // 搜索icon
    .serach_icon {
      position: absolute;
      left: 0.14rem;
      top: 50%;
      z-index: 1;
      fill: #2d2d2d;
      transform: translate(0, -50%);
    }
    // 清除icon
    .clear_icon {
      top: 50%;
      right: .55rem;
      width: 0.3rem;
      height: 0.3rem;
      z-index: 100;
      display: block;
      font-size: 0.12rem;
      line-height: 0.3rem;
      text-align: center;
      position: absolute;
      transform: translate(0, -50%);
    }
  }
</style>
