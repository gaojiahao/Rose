<template>
    <div class="pages">
        <h1 class="s_title">
            市场宣传 费用申请
            <span class="s_user" @click="goMylist">我的提交<x-icon class="right_arrow" type="ios-arrow-forward" size="16" ></x-icon></span>
        </h1>
        <div class="s_main">
            <div class="s_main_part" v-for="(item, index) in s_list_num" :key='index'>
                    <group title="请选择您申请的类型">
                        <popup-picker 
                        title="类型"
                        :data="s_list"
                        v-model="s_type"
                        @on-change="changeType"
                        ></popup-picker>
                    </group>
                    <group title="请填写宣品的内容" v-if="s_type[0] === '宣品'">
                        <x-input 
                        :title='item'
                        :key="index"
                        text-align='right' 
                        v-for="(item, index) in xp_list"
                        ></x-input>
                    </group>
                    <group title="请填写市场部的内容" v-else-if="s_type[0] === '市场部'">
                        <x-input 
                        :title='item'
                        :key="index"
                        text-align='right' 
                        v-for="(item, index) in mk_list"
                        ></x-input>
                    </group>
                    <group title="请填写市场活动的内容" v-else-if="s_type[0] === '市场活动'">
                        <x-input 
                        :title='item'
                        :key="index"
                        text-align='right' 
                        v-for="(item, index) in hd_list"
                        ></x-input>
                    </group>
                    <group title="金额" v-if="s_type[0]">
                        <cell title='合计'></cell>
                    </group>
            </div>
            <p class="note_tx" v-if="s_type.length > 0 && s_list_num.length < 3" @click="plusType">添加另一个 <span class="plus_tx">类型</span>?</p>
        </div>
        <div class="s_button" v-if="s_type[0]">提交</div>
    </div>
</template>

<script>
import { Cell, Group, XInput, PopupPicker, CellFormPreview } from 'vux'
export default {
    components:{
        Cell,
        Group,
        XInput,
        PopupPicker,
        CellFormPreview
    },
    data(){
        return{
            s_list:[['宣品','市场部','市场活动']],      // 市场宣传 种类选择
            s_list_num:['1'],                        // 种类 数量 (添加一个则多一个选择，删除则反之)
            s_type:[],                               // 市场宣传 选中
            xp_list:['单据','展架','赠品','其他物料'],  // 宣品 填写内容
            mk_list:['照相','视频'],                  // 市场部 填写内容
            hd_list:['场地','其他']                   // 市场活动 填写内容
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
    height: 150px;
    line-height: 120px;
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
    top: 120px;
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
.s_button {
    width: 100%;
    height: 44px;
    line-height: 44px;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 101;
    text-align: center;
    color: #fff;
    background: #5077AA;
    margin-top: 20px;
}

</style>
