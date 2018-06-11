<template>
    <div class="pages">
        <h1 class="s_title">
            市场宣传
            <span class="s_user" @click="goMylist">我的提交<x-icon class="right_arrow" type="ios-arrow-forward" size="16" ></x-icon></span>
        </h1>
        <div class="s_main">
            <div class="s_main_part" v-for="(item, index) in s_list_num" :key='index'>
                    <group title="请选择您申请的项目名称">
                        <x-input 
                        title='项目名称'
                        ></x-input>
                    </group>
                    <group title="请选择您申请的市场宣传">
                       <x-input 
                        title='市场宣传'
                        ></x-input>
                    </group>
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
                        :title='xp_list[0].name'
                        text-align='right'
                        :value="xp_list[0].val"
                        @on-change="detail(0,$event)" 
                        ></x-input>
                        <x-input 
                        :title='xp_list[1].name'
                        text-align='right'
                        :value="xp_list[1].val"
                        @on-change="detail(1,$event)" 
                        ></x-input>
                    </group>
                    <group title="金额" v-if="s_type[0]">
                        <cell title='合计'>{{'￥'+total | numberComma}}</cell>
                    </group>
                    <group title="请选择费用所属事业部">
                        <popup-picker 
                        title="费用所属事业部"
                        :data="bu_list"
                        v-model="bu_type"
                        @on-change="changeType"
                        ></popup-picker>
                    </group>
                    <group title="请选择费用所属部门">
                        <popup-picker 
                        title="费用所属部门"
                        :data="department_list"
                        v-model="department_type"
                        @on-change="changeType"
                        ></popup-picker>
                    </group>
                    <group title="请选择核算归属省份">
                        <popup-picker 
                        title="核算归属省份"
                        :data="province_list"
                        v-model="province_type"
                        @on-change="changeType"
                        ></popup-picker>
                    </group>
                    <group title="请选择费用所属银行">
                        <popup-picker 
                        title="费用所属银行"
                        :data="bank_list"
                        v-model="bank_type"
                        @on-change="changeType"
                        ></popup-picker>
                    </group>
                    <group title="要说写什么吗？">
                        <x-textarea :max="20" placeholder="说明" ></x-textarea>
                    </group>
            </div>
            <p class="note_tx" v-if="s_type.length > 0" @click="plusType">添加另一个 <span class="plus_tx">类型</span> ?</p>
        </div>
        <div class="s_btm vux-1px-t" v-if="s_type[0]">
            <span class="count_part"><span v-if="total!=''">合计:{{'￥'+total | numberComma}}</span></span>
            <span class="s_button" @click="goflow">确定</span>
        </div>
    </div>
</template>

<script>
import { Cell, Group, XInput, PopupPicker, XTextarea, numberComma } from 'vux'
import spread from '../service/spread.js'
export default {
    components:{
        Cell,
        Group,
        XInput,
        PopupPicker,
        XTextarea,
    },
    filters:{
        numberComma
    },
    data(){
        return{
            s_list:[['单页','三折页','X展架','易拉宝','三角牌','海报','吊旗','地贴','道具']],      // 市场宣传 种类选择
            s_list_num:['1'],                        // 种类 数量 (添加一个则多一个选择,删除则反之)
            s_type:[],                               // 市场宣传 选中
            xp_list:[
                {
                    name:'单价',
                    val:''
                },{
                    name:'数量',
                    val:''
                }
            ],  // 宣品 填写内容
            total:'',
            bu_list:[['财务部','开发部','销售部']], //事业部picker
            bu_type:[], //事业部选择项
            department_list:[['国防部','外交部','科研部']], //部门picker
            department_type:[], //部门选择项
            province_list:[['北京','上海','广州','深圳']], //省份picker
            province_type:[], //省份选择项
            bank_list:[['中国银行','建设银行','招商银行']], //银行picker
            bank_type:[], //银行选择项
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
        },
        //明细
        detail(idx,e){
            let num=1;
            this.xp_list[idx].val=e;
            for(let i = 0 ; i<this.xp_list.length ; i++){
                num*=this.xp_list[i].val
            }
            this.total=num;
            // this.$refs.xp_input[idx].currentValue=numberComma(this.$refs.xp_input[idx].currentValue,3);
        },
        //费用所属事业部
        buAll(){
            let data={
                _dc: Date.parse(new Date()),
                key: 'N1',
                parentId: '60d2cb55-8066-4c85-b8ea-60bde9be641b',
                name1: 111,
                name2: 111,
                name3: 111,
                page: 1,
                start: 0,
                limit: 10000,
            };
            spread.getAccounting(data).then(res =>{
                
            })
        }
    },
    mounted(){
        
    },
    computed:{
        detail_val(e){
            console.log(e)
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
        font-weight: bold;
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
