<template>
    <div class='search'>
        <form class="search_part" action="" @submit.prevent="searchMat">
            <input class="srh_inp" type="search" autocomplete="off" v-model="srhInpTx">
            <div class="pop_cancel" @click="searchMat">搜索</div>
            <x-icon class="serach_icon" type="ios-search" size="20"></x-icon>
            <icon class="clear_icon" type="clear" v-if="srhInpTx" @click.native="clear"></icon>
        </form>
    </div>
</template>

<script>
import {Icon} from 'vux'
export default {
    data(){
        return {
            srhInpTx :''
        }        
    },
    components:{
        Icon
    },
    methods:{
        searchMat(){
            this.$emit('search',this.srhInpTx);
        },
        clear(){
            this.srhInpTx = '';
            this.$emit('search',this.srhInpTx);
        }
    }
    

}
</script>

<style lang='scss' scoped>
.search_part {
      width: 100%;
      display: flex;
      height: .3rem;
      padding: 0 .08rem;
      line-height: .3rem;
      position: relative;
      box-sizing: border-box;
      // 搜索输入框
      .srh_inp {
        flex: 5;
        outline: none;
        border: none;
        color: #2D2D2D;
        font-size: .16rem;
        padding: 0 .3rem 0 .4rem;
        background: #F3F1F2;
        border-top-left-radius: .3rem;
        border-bottom-left-radius: .3rem;
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
        font-size: .14rem;
        text-align: center;
        background: #3f72af;
        border-top-right-radius: .3rem;
        border-bottom-right-radius: .3rem;
      }
      // 搜索icon
      .serach_icon {
        top: 50%;
        left: .14rem;
        fill: #2D2D2D;
        position: absolute;
        transform: translate(0, -50%);
      }
      // 清除icon
      .clear_icon {
        top: 50%;
        right: 14%;
        width: .3rem;
        height: .3rem;
        z-index: 100;
        display: block;
        font-size: .12rem;
        line-height: .3rem;
        text-align: center;
        position: absolute;
        transform: translate(0, -50%);
      }
    }

</style>
