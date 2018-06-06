<template>
    <div class="pages">
        <h1 class="s_title">
            市场宣传
            <span class="s_user" @click="goMylist">我的提交<x-icon class="right_arrow" type="ios-arrow-forward" size="16" ></x-icon></span>
        </h1>
        <div class="s_main">
            <div class="s_main_part" v-for="(item, index) in s_list_num" :key='index'>
                    <group title="请选择您申请的类型">
                        <popup-picker 
                        title="宣品类型"
                        :data="s_list"
                        v-model="s_type"
                        @on-change="changeType"
                        ></popup-picker>
                    </group>
                    <group title="请填写明细" v-if="s_type[0]">
                        <x-input 
                        :title='item'
                        :key="index"
                        text-align='right' 
                        v-for="(item, index) in xp_list"
                        ></x-input>
                    </group>
                    <group title="金额" v-if="s_type[0]">
                        <cell title='合计'></cell>
                    </group>
            </div>
            <p class="note_tx" v-if="s_type.length > 0" @click="plusType">添加另一个 <span class="plus_tx">类型</span> ?</p>
        </div>
        <div class="s_btm vux-1px-t" v-if="s_type[0]">
            <span class="count_part">合计:￥1,000</span>
            <span class="s_button" @click="goflow">确定</span>
        </div>
    </div>
</template>

<script>
import { Cell, Group, XInput, PopupPicker} from 'vux'
export default {
    components:{
        Cell,
        Group,
        XInput,
        PopupPicker
    },
    data(){
        return{
            s_list:[['单页','三折页','X展架','易拉宝','三角牌','海报','吊旗','地贴','道具']],      // 市场宣传 种类选择
            s_list_num:['1'],                        // 种类 数量 (添加一个则多一个选择,删除则反之)
            s_type:[],                               // 市场宣传 选中
            xp_list:['单价','数量'],  // 宣品 填写内容
        }
    },
    methods:{
        goMylist(){ //我的提交
            this.$router.push({ path:'/myList' })
        },
        changeType(val){
            console.log(val);
        },
        plusType(){ //添加新的选择
            this.s_list_num.push('2');
        },
        goflow(){
            this.$router.push({ path:'/flow' })
        }
    }
}
</script>

<style lang='scss' scoped>
.pages {
    overflow: auto;
    -webkit-overflow-scrolling: auto;
}
.s_title {  //标题
    width: 100%;
    height: 120px;
    line-height: 80px;
    font-size: 34px;
    text-align: center;
    color: #fff;
    font-weight: 200;
    background: #5077AA;
    position: relative;
    .s_user {
        line-height: initial;
        font-size: 16px;
        font-weight: normal;
        position: absolute;
        left: 50%;
        bottom: 20%;
        transform: translate(-50%);
        display: flex;
        align-items: center;
        .right_arrow {
            fill: #fff;
        }
    }
}
.s_main {
    width: 90%;
    max-width: 600px;
    position: absolute;
    top: 90px;
    left: 50%;
    transform: translate(-50%,0);
    border-radius: 4px;
    z-index: 100;
    padding-bottom: 56px;
    .s_main_part {
        background: #fff;
        margin-top: 20px;
        border-radius: 4px;
        box-shadow: 0 2px 10px #e8e8e8;
    }
    .note_tx {
        width: 100%;
        margin-top: 6px;
        text-align: center;
        font-size: 12px;
        .plus_tx {
            color: #5077AA;
        }
    }
}
.s_btm {
    width: 100%;
    height: 44px;
    line-height: 44px;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 101;
    margin-top: 20px;
    box-sizing: border-box;
    display: flex;
    .count_part {
        flex: 2.5;
        background: #fff;
        color: #000;
        display: inline-block;
        text-align: center;
    }
    .s_button {
        flex: 1;
        color: #fff;
        background: #5077AA;
        display: inline-block;
        text-align: center;
    }
}

</style>
