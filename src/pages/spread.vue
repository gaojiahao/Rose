<template>
    <div class="pages">
        <h1 class="s_title">
            市场宣传
            <span class="s_user" @click="goMylist">我的提交<x-icon class="right_arrow" type="ios-arrow-forward" size="16" ></x-icon></span>
        </h1>
        <div class="s_main">
            <div class="s_main_part">
                <!-- 表单基本信息 -->
                <!-- <group title="表单基本信息">

                    <x-input 
                    title='交易类型'
                    ></x-input>

                    <x-input 
                    title='经办主体'
                    ></x-input>

                    <popup-picker 
                    title="经办人"
                    :data="s_list"
                    v-model="s_type"
                    @on-change="changeType"
                    ></popup-picker>

                    <popup-picker 
                    title="所属区域"
                    :data="s_list"
                    v-model="s_type"
                    @on-change="changeType"
                    ></popup-picker>

                    <popup-picker 
                    title="经办部门"
                    :data="s_list"
                    v-model="s_type"
                    @on-change="changeType"
                    ></popup-picker>

                    <popup-picker 
                    title="经办角色"
                    :data="s_list"
                    v-model="s_type"
                    @on-change="changeType"
                    ></popup-picker>

                </group> -->
                <spreadBaseInfo :info="baseinfo" :user="userinfo" :operatorlist="operatorlist"></spreadBaseInfo>
            </div>
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
import spreadService from '../service/spreadService.js'
import createService from '../service/createService.js'
import spreadBaseInfo from './components/spreadBaseInfo'
export default {
    components:{
        Cell,
        Group,
        XInput,
        PopupPicker,
        XTextarea,
        spreadBaseInfo
    },
    filters:{
        numberComma
    },
    data(){
        return{
            baseinfo:[],//表单基本信息
            userinfo:'',//当前用户
            operatorlist:[],//经办人列表
            deptList:[],
            roleList:[],
            PublicityDetail:[],//宣传明细
            Remarks:[],//备注
            attachment:[],//附件
            ReviewerInfo:[],//复核人信息
            s_list:[],      // 市场宣传 种类选择
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
        //获取当前用户
        User(){
            let that=this;
            createService.getUser().then(res=>{
                that.UserRemark(res.nickname);
            })
        },
        //获取当前用户信息
        UserRemark(name){
            let that=this,
            url='/H_roleplay-si/ds/listUsers',
            data={
                page: 1,
                start: 0,
                limit: 25,
            };
            createService.getCurrentUser(name).then(res=>{
                that.userinfo=res.tableContent;
                //经办人列表
                createService.getRemoteData(url,data).then(res=>{
                    for(let i = 0 ; i< res.tableContent.length ; i++){
                        res.tableContent[i].name=res.tableContent[i].nickname;
                        res.tableContent[i].value=res.tableContent[i].nickname;
                    }
                    that.operatorlist=res.tableContent;
                    that.formInfo();
                })
            });
        },
        //表单信息
        formInfo(){
            let that=this,
            data={
                _dc:Date.parse(new Date()),
                uniqueId:'a9238c91-36f3-4b09-9705-9d50870b3c46'
            }
            spreadService.getFormView(data).then(res=>{
                for(let i = 0 ; i<res.length; i++){
                    let config=JSON.parse(res[i].config);
                    for(let j = 0 ; j<config.items.length ; j++){
                        // 表单基本信息
                        if(config.items[j].title=='表单基本信息'){
                            for(let k = 0 ; k<config.items[j].items.length ; k++){
                                let defaultValue=config.items[j].items[k].defaultValue;
                                if(defaultValue!=''){
                                    config.items[j].items[k].defaultValue=JSON.parse(defaultValue);
                                    if(config.items[j].items[k].fieldLabel=="经办人"){
                                        //经办人
                                        config.items[j].items[k].defaultValue.data=[that.userinfo[0].nickname];
                                        config.items[j].items[k].defaultValue.PopupPicker=[that.operatorlist];
                                    }else if(config.items[j].items[k].fieldLabel=="所属区域"){
                                        //所属区域
                                        config.items[j].items[k].defaultValue.data=[that.userinfo[0].area];
                                        config.items[j].items[k].defaultValue.PopupPicker=[[{
                                            name:that.userinfo[0].area,
                                            value:that.userinfo[0].area
                                        }]];
                                    }else if(config.items[j].items[k].fieldLabel=="经办部门"){
                                        //经办部门
                                        config.items[j].items[k].defaultValue.data=[that.userinfo[0].dept];
                                       config.items[j].items[k].defaultValue.PopupPicker=[[{
                                           name:that.userinfo[0].dept,
                                           value:that.userinfo[0].dept
                                        }]];
                                    }else if(config.items[j].items[k].fieldLabel=="经办角色"){
                                        //经办角色
                                        config.items[j].items[k].defaultValue.data=[that.userinfo[0].role];
                                       config.items[j].items[k].defaultValue.PopupPicker=[[{
                                           name:that.userinfo[0].role,
                                           value:that.userinfo[0].role
                                        }]];
                                    }
                                }
                            }
                            that.baseinfo.push(config.items[j])
                        }else if(config.items[j].title=='宣传明细'){
                            that.PublicityDetail.push(config.items[j])
                        }else if(config.items[j].title=='备注'){
                            that.Remarks.push(config.items[j])
                        }else if(config.items[j].title=='附件'){
                            that.attachment.push(config.items[j])
                        }else if(config.items[j].title=='复核人信息'){
                            that.ReviewerInfo.push(config.items[j])
                        }
                    }
                }
            })
        },
        //费用所属事业部
        buAll(){
            let that=this,
            data={
                _dc: Date.parse(new Date()),
                key: 'N1',
                parentId: '60d2cb55-8066-4c85-b8ea-60bde9be641b',
                name1: 111,
                name2: 111,
                name3: 111,
                page: 1,
                start: 0,
                limit: 10000,
            },
            arr=[];
            spreadService.getAccounting(data).then(res =>{
                for(let i = 0 ; i<res.tableContent.length; i++){
                    arr.push(res.tableContent[i].unitName)
                };
                that.s_list.push(arr);
            });
        }
    },
    mounted(){
        this.User();
        this.buAll();
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
