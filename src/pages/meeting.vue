<template>
    <div class="pages">
        <h1 class="m_title">
            会议立项
            <span class="m_user" @click="goMylist">我的提交<x-icon class="right_arrow" type="ios-arrow-forward" size="16" ></x-icon></span>
        </h1>
        <div class="m_main">
            <group title="请填写会议安排明细">
                <datetime v-model="minuteListValue" format="YYYY-MM-DD HH:mm" :minute-list="['00', '15', '30', '45']" title="时间段"></datetime>
                <x-input 
                :title='item'
                :key="index"
                text-align='right' 
                v-for="(item, index) in meetList"
                ></x-input>
            </group>
            <group title="费用合计">
                <cell title="金额合计" value='￥1,000'></cell>
            </group>
        </div>
        <div class="m_btm vux-1px-t">
            <span class="count_part">合计:￥1,000</span>
            <span class="m_button" @click="goflow">确定</span>
        </div>
    </div>
    
</template>

<script>
import { Cell, Group, XInput, Datetime } from 'vux'
export default {
    components:{
        Cell,
        Group,
        XInput,
        Datetime
    },
    data(){
        return{
            minuteListValue:'',
            meetList:['省份','城市','酒店名称','住宿均价','房间数量','总人数','场地费用合计','路费合计','餐饮合计']
        }
    },
    methods:{
        goMylist(){ //我的提交
            this.$router.push({ path:'/myList' })
        },
        goflow(){
            this.$router.push({ path:'/flow' })
        }
    }
}
</script>

<style lang='scss' scoped>
.m_title {  //标题
    width: 100%;
    height: 120px;
    line-height: 80px;
    font-size: 34px;
    text-align: center;
    color: #fff;
    font-weight: 200;
    background: #5077AA;
    position: relative;
    .m_user {
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
.m_main {
    width: 90%;
    background: #fff;
    max-width: 600px;
    position: absolute;
    top: 110px;
    left: 50%;
    transform: translate(-50%,0);
    border-radius: 4px;
    z-index: 100;
    // padding-bottom: 50px;
    box-shadow: 0 2px 10px #e8e8e8;
}
.m_btm {
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
    .m_button {
        flex: 1;
        color: #fff;
        background: #5077AA;
        display: inline-block;
        text-align: center;
    }
}

</style>
