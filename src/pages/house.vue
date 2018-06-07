<template>
    <div class="pages">    
        <h1 class="h_title">
            房屋立项
            <span class="h_user" @click="goMylist">我的提交<x-icon class="right_arrow" type="ios-arrow-forward" size="16" ></x-icon></span>
        </h1>
        <div class="h_main">
            <group title="请选择地点类型">
                <popup-picker 
                title="地点类型"
                :data="h_type"
                v-model="type_value"
                @on-change="changeType"
                ></popup-picker>
                <popup-picker 
                title="处理类型"
                :data="h_hdtype"
                v-model="hd_value"
                @on-change="changeType"
                ></popup-picker>
            </group>
            <group title="请填写明细" v-if="hd_value[0]">
                <x-input 
                :title='item'
                :key="index"
                text-align='right' 
                v-if="hd_value[0] === '新增'"
                v-for="(item, index) in xz_list"
                ></x-input>
                <x-input 
                :title='item'
                :key="index"
                text-align='right' 
                v-else-if="hd_value[0] === '搬家'"
                v-for="(item, index) in bj_list"
                ></x-input>
                <datetime v-model="minuteListValue1" format="YYYY-MM-DD" title="租期开始时间"></datetime>
                <datetime v-model="minuteListValue2" format="YYYY-MM-DD" title="租期结束时间"></datetime>
            </group>
        </div>
        <div class="h_btm vux-1px-t">
            <span class="count_part">合计:￥1,000</span>
            <span class="h_button" @click="goflow">确定</span>
        </div>
    </div>
</template>

<script>
import { Cell, Group, XInput, Datetime, PopupPicker} from 'vux'
export default {
    components:{
        Cell, 
        Group, 
        XInput,
        Datetime,
        PopupPicker
    },
    data(){
        return{
            h_type:[['省仓','办事处']],
            type_value:[],
            h_hdtype:[['新增','搬家']],
            hd_value:[],
            xz_list:['新增原因'],
            bj_list:['搬家原因','入驻人数','房屋面积','月租','付款方式'],
            minuteListValue1:'',
            minuteListValue2:''
        }
    },
    methods:{
        goMylist(){ //我的提交
            this.$router.push({ path:'/myList' })
        },
        goflow(){
            this.$router.push({ path:'/flow' })
        },
        changeType(){

        }
    }
}
</script>

<style lang='scss' scoped>
.h_title {  //标题
    width: 100%;
    height: 120px;
    line-height: 80px;
    font-size: 34px;
    text-align: center;
    color: #fff;
    font-weight: 200;
    background: #5077AA;
    position: relative;
    .h_user {
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
.h_main {
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
.h_btm {
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
        font-weight: bold;
    }
    .h_button {
        flex: 1;
        color: #fff;
        background: #5077AA;
        display: inline-block;
        text-align: center;
    }
}
</style>
