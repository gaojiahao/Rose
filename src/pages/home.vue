<template>
    <div class="pages">
        <div class="h_title">
            立项申请
            <span class="username">欢迎,刘治增</span>   
        </div>
        <div class="h_main">
            <ul class="sel_list">
                <li class="each_part" 
                v-for=" (item, index) in sel_list" 
                :key="index"
                @click="goForward(item.path)"
                >
                    {{item.name}}
                    <x-icon class="right_arrow" type="ios-arrow-forward" size="16" ></x-icon>
                </li>
            </ul>
        </div>
        <h2 class="tech_bottom">
            Proudly presented by <span class="cp_name">Refordom</span>
        </h2>
    </div>
</template>

<script>
export default {
    data(){
        return{
            sel_list:[ 
                { name:'市场宣传', path:'/spread'},
                { name:'会务立项申请', path:'/meeting'},
                { name:'房屋立项申请', path:'/house'},
                { name:'固定资产', path:'/assets'}
            ]
        }
    },
    methods:{
        goForward(path){
            this.$router.push({ path })
        }
    }
}
</script>

<style lang='scss' scoped>
.h_title {
    width: 100%;
    height: 150px;
    line-height: 120px;
    text-align: center;
    font-size: 50px;
    font-weight: 200;
    color: #CDCED3;
    position: relative;
    .username {
        line-height: initial;
        font-size: 16px;
        font-weight: normal;
        position: absolute;
        left: 50%;
        bottom: 20%;
        transform: translate(-50%);
    }
}
.h_main {
    width: 90%;
    max-width: 640px;
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    .each_part {
        width: 100%;
        height: 44px;
        line-height: 44px;
        padding: 0 8px;
        text-align: center;
        box-sizing: border-box;
        color: #fff;
        font-weight: 600;
        // background: -webkit-linear-gradient(left bottom, rgba(29,101,240,1), rgba(25,211,253,1));
        background: #5077AA;
        margin-top: 20px;
        border-radius: 4px;
        position: relative;
        .right_arrow {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translate(0,-50%);
            fill: #fff;
        }
    }
}
/* 技术支持公司名  */
.tech_bottom {
    width: 100%;
    text-align: center;
    position: fixed;
    bottom: 0;
    font-size: 16px;
    color: #CDCED3;
    font-weight: 200;
}

.cp_name {
    color: dodgerblue;
}

</style>
