<template>
    <div class='search'>
        <form class="search_part" action="" @submit.prevent="searchMat">
            <input class="srh_inp" type="search" autocomplete="off" v-model="srhInpTx" @input='LiveSearchMat'>
            <div class="pop_cancel" @click="searchMat">搜索</div>
            <x-icon class="serach_icon" type="ios-search" size="20"></x-icon>
            <icon class="clear_icon" type="clear" v-if="srhInpTx" @click.native="clear"></icon>
        </form>
    </div>
</template>

<script>
import { Icon } from "vux";
export default {
  data() {
    return {
      srhInpTx: "",
      timer: null,
    };
  },
  components: {
    Icon
  },
  methods: {
    LiveSearchMat(){
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.$emit('search',this.srhInpTx);
        }, 1000);        
    },
    searchMat() {      
      this.$emit('search',this.srhInpTx);
    },
    clear() {
        this.srhInpTx = "";     
        this.$emit("search", this.srhInpTx);
    }
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
  // 搜索输入框
  .srh_inp {
    flex: 5;
    outline: none;
    border: none;
    color: #2d2d2d;
    font-size: 0.16rem;
    padding: 0 0.3rem 0 0.4rem;
    background: #f3f1f2;
    border-top-left-radius: 0.3rem;
    border-bottom-left-radius: 0.3rem;
    -webkit-appearance: none;
    appearance: none;
    &::-webkit-search-cancel-button {
      display: none;
    }
  }
  // 取消 按钮
  .pop_cancel {
    flex: 1;
    color: #fff;
    font-size: 0.14rem;
    text-align: center;
    background: #3f72af;
    border-top-right-radius: 0.3rem;
    border-bottom-right-radius: 0.3rem;
  }
  // 搜索icon
  .serach_icon {
    top: 50%;
    left: 0.14rem;
    fill: #2d2d2d;
    position: absolute;
    transform: translate(0, -50%);
  }
  // 清除icon
  .clear_icon {
    top: 50%;
    right: 14%;
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
