<template>
    <div class="pages">
        <div class="m_top">
            <img class="user_img" src="../assets/ts.png" alt="">
            <div class="user_part">
                <div class="user_name_part">
                    <span class="user_name">刘治增</span>
                    <span class="user_level">省长</span>
                </div>
                <div class="user_info_part">
                    <span class="user_bank">中国银行</span>
                    <span class="user_dp">中行华北事业部</span>
                </div>
            </div>
        </div>
        <tab bar-active-color="#5077AA" active-color="#5077AA" :line-width=1>
            <tab-item selected @on-item-click="selStatus">待审批</tab-item>
            <tab-item @on-item-click="selStatus">进行中</tab-item>
            <tab-item @on-item-click="selStatus">已完成</tab-item>
        </tab>
        <div class="m_list">
            <div class="each_list" v-if="!whichIndex || whichIndex === 0">
                <div class="e_top">
                    <span class="e_status" :class="{wait_c:!whichIndex ||whichIndex===0}">待审批</span><span class="e_name">市场宣传费用申请</span>
                </div>
                <div class="e_main">
                    <span class="e_code">
                        SCXC_1806_0001 
                        <span class="e_crtname">刘治增</span>
                    </span>
                    <span class="e_time">2018-06-06</span>
                </div>
            </div>
            <div class="each_list" v-if="!whichIndex || whichIndex === 0">
                <div class="e_top">
                    <span class="e_status" :class="{wait_c:!whichIndex ||whichIndex===0}">待审批</span><span class="e_name">市场宣传费用申请</span>
                </div>
                <div class="e_main">
                    <span class="e_code">
                        SCXC_1806_0001 
                        <span class="e_crtname">刘治增</span>
                    </span>
                    <span class="e_time">2018-06-06</span>
                </div>
            </div>
            <div class="each_list" v-if="whichIndex === 1">
                <div class="e_top">
                    <span class="e_status" :class="{ing_c:whichIndex===1}">进行中</span><span class="e_name">市场宣传费用申请</span>
                </div>
                <div class="e_main">
                    <span class="e_code">
                        SCXC_1806_0001 
                        <span class="e_crtname">刘治增</span>
                    </span>
                    <span class="e_time">2018-06-06</span>
                </div>
            </div>
            <div class="each_list" v-if="whichIndex === 1">
                <div class="e_top">
                    <span class="e_status" :class="{ing_c:whichIndex===1}">进行中</span><span class="e_name">市场宣传费用申请</span>
                </div>
                <div class="e_main">
                    <span class="e_code">
                        SCXC_1806_0001 
                        <span class="e_crtname">刘治增</span>
                    </span>
                    <span class="e_time">2018-06-06</span>
                </div>
            </div>
            <div class="each_list" v-if="whichIndex === 2">
                <div class="e_top">
                    <span class="e_status" :class="{done_c:whichIndex===2}">进行中</span><span class="e_name">市场宣传费用申请</span>
                </div>
                <div class="e_main">
                    <span class="e_code">
                        SCXC_1806_0001 
                        <span class="e_crtname">刘治增</span>
                    </span>
                    <span class="e_time">2018-06-06</span>
                </div>
            </div>
            <div class="each_list" v-if="whichIndex === 2">
                <div class="e_top">
                    <span class="e_status" :class="{done_c:whichIndex===2}">进行中</span><span class="e_name">市场宣传费用申请</span>
                </div>
                <div class="e_main">
                    <span class="e_code">
                        SCXC_1806_0001 
                        <span class="e_crtname">刘治增</span>
                    </span>
                    <span class="e_time">2018-06-06</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Tab, TabItem } from 'vux'
export default {
    components:{
        Tab, 
        TabItem
    },
    data(){
        return{
            whichIndex:''
        }
    },
    methods:{
        selStatus(val){
            this.whichIndex = val;
        }
    }
}
</script>

<style lang='scss' scoped>
.m_top {
    width: 100%;
    height: 100px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    background: #5077AA;
    // background: #f1b841 url('../assets/bg-header-618.png') no-repeat ;
    background-size: contain;    
    .user_img {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        margin-right: 10px;
    }
    .user_name {
        color: #fff;
        font-weight: bold;
    }
    .user_level {
        font-size: 10px;
        background: #fff;
        color: #333;
        border-radius: 24px;
        padding: 0 6px;
        display: inline-block;
        vertical-align: middle;
        margin-top: -4px;
    }
    .user_bank,
    .user_dp {
        font-size: 12px;
        background: rgba(17, 17, 17, 0.5);
        color: #fff;
        border-radius: 24px;
        padding: 1px 6px;
    }
}
.m_list {
    width: 90%;
    margin: 10px auto;
    .each_list {
        width: 100%;
        padding: 4px 10px;
        margin-bottom: 20px;
        box-sizing: border-box;
        box-shadow: 0 2px 10px #e8e8e8;
        border-radius: 4px;
        .e_top {
            .e_status {     //审批状态
                color: #fff;
                padding: 0 2px;
                border-radius: 4px;
                font-size: 12px;
                display: inline-block;
                vertical-align: middle;
                margin-top: -2px;
            }
            .e_name {       //审批名字
                margin-left: 4px;
                font-weight: bold;
            }
            .wait_c {
                background: #E34E43;
            }
            .ing_c {
                background: #5077AA;
            }
            .done_c {
                background: #26AB28;
            }
        }
        .e_main {
            height: 24px;
            line-height: 24px;
            .e_code {
                float: left;
                font-size: 14px;
                color: #7D7D7D;
                .e_crtname {
                    position: relative;
                    background: #333;
                    font-size: 12px;
                    color: #FDF6A4;
                    padding: 2px;
                }
                .e_crtname:before {
                    position: absolute;
                    content: "";
                    width: 0;
                    height: 0;
                    top: 0;
                    left: -3px;
                    border-right: 4px solid #333;
                    border-bottom: 4px solid transparent;
                }
            }
            .e_time {
                float: right;
                font-size: 14px;
                color: #7D7D7D;
                font-weight: 200;
            }
        }
    }
}
</style>
