<template>
    <div class="pages">
        <tab bar-active-color="#5077AA" active-color="#5077AA">
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
.m_list {
    width: 90%;
    margin: 10px auto;
    .each_list {
        width: 100%;
        padding: 4px;
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
