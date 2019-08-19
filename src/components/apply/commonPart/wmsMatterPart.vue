<template>
     <div class="materiel-wrapper">
        <div class="header" >
            <div>{{title}}</div>
            <div>
                <span v-if="!matterModifyClass" @click="handlerChangeState">编辑</span>
                <span v-if="matterModifyClass" @click="handlerChangeState">完成</span>
                <x-icon type="ios-arrow-up" v-if="allExpend &&matters.length>0" size="28" @click.native="handlerChangeExpendState"></x-icon>
                <x-icon type="ios-arrow-down" v-if="!allExpend &&matters.length>0" size="28" @click.native="handlerChangeExpendState"></x-icon>
            </div>
        </div>
        <r-scroll  class="materiel-item-wrapper">
            <ul class="materiels" >
                <li class="materiel-item" 
                    v-for="(mat,matIdx) in matters" 
                    :key="matIdx">
                        <div class="materiel-info">
                            <flexbox justify="space-between">
                                <flexbox-item :span="5"><div >{{mat.inventoryName}}({{mat.inventoryCode}})</div></flexbox-item>
                                <flexbox-item :span="2"><div >{{getGroupInfo(mat).all}}</div></flexbox-item>
                                <flexbox-item :span="2"><div >{{getGroupInfo(mat).done}}</div></flexbox-item>
                                <flexbox-item :span="2" @click.native="mat.expend=!mat.expend" style="text-align: right;">
                                    <x-icon type="ios-arrow-up" v-if="mat.expend && mat.boxCodes.length>0" size="28" ></x-icon>
                                    <x-icon type="ios-arrow-down" v-if="!mat.expend && mat.boxCodes.length>0" size="28" ></x-icon>
                                </flexbox-item>
                            </flexbox>
                        </div>
                    <ul class="box-codes" v-if="mat.expend">
                        <li class="box-code"  
                            :class="{mater_delete : matterModifyClass}"
                            v-for="(box,boxIdx) in mat.boxCodes" 
                            :key="boxIdx">
                            <div class="matter-img">
                                <img  src='/static/img/wl_default03.5d8842b.png'>
                            </div>
                            <div class="matter-info">
                                <div >{{box.boxCode}}</div>
                                <div class="other" v-for="(value,key) in  matterInfoConfig" :key="key">
                                    {{value}}:{{box[key]}} &nbsp;
                                </div>
                                <div class="box-operate">
                                    <div  >
                                        <div v-if="getSpecialInfo" v-html="getSpecialInfo(box)"></div>
                                    </div>
                                    <div v-if="!inputDisable">
                                        <r-number :num="box.tdQty" v-model="box.tdQty"></r-number>
                                    </div>
                                </div>
                            </div>

                            <div class='delete_icon' 
                                @click="handlerSelectItem(box, matIdx+'_'+ boxIdx)" 
                                v-if='matterModifyClass'>
                                <x-icon 
                                    type="ios-checkmark" 
                                    size="24" 
                                    class="checked" 
                                    v-show="showSelIcon( matIdx+'_'+ boxIdx)"></x-icon>
                                <x-icon 
                                    type="ios-circle-outline" 
                                    size="24" 
                                    v-show="!showSelIcon( matIdx+'_'+ boxIdx)"></x-icon>
                            </div>
        
                        </li>
                    </ul>
                </li>
            </ul>
        </r-scroll>
    </div>
</template>
<script>
import { Flexbox, FlexboxItem} from 'vux'
import RNumber from 'components/public/RNumber'
  import RScroll from 'plugins/scroll/RScroll'
// 插件引入
import Bscroll from 'better-scroll'
export default {
    name:'WmsMatterPart',
    props:{
        title:{
            type:String,
            default:''
        },
        matterInfoConfig:{
            type:Object,
            default(){
                return {
                    warehouseName:"仓库名称",
                    storehouseInCode:"库位编码",
                    specification:"规格"
                }
            }
        },
        // 是否处于编辑物料状态
        matterModifyClass: {
            type: Boolean,
            default: false
        },
        //是否显示数量输入框
        inputDisable:{
            type:Boolean,
            default:false
        },
        //物料以及箱码数据
        matters:{
            type:Array,
            default:[]
        },
        //选中物料
        handlerSelectItem: {
            type: Function,
            required: true
        },
        // 编辑时显示图标
        showSelIcon: {
            type: Function,
            required: true
        },
        handlerChangeState:{
            type:Function,
            required: true
        },
        getGroupInfo:{
            type:Function
        },
        getSpecialInfo:{
            type:Function
        } 
    },
    components:{
        RNumber,
        Flexbox, 
        FlexboxItem,
        RScroll
    },
    data(){
        return {
            allExpend:true
        }
    },
    methods:{
        handlerChangeExpendState(){
            this.allExpend = !this.allExpend;
            this.matters.map(mat=>{
                mat.expend = this.allExpend;
            });
        }
    }
}
</script>


<style lang='scss' scoped>

.materiel-wrapper{
    font-size: .14rem;
    position: relative;
    background: #FFF;
    margin-bottom: .1rem;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    height: 100%;
    .header{
        font-size: 18px;
        height: .4rem;
        line-height: .4rem;
        color: #696969;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        -webkit-box-pack: justify;
        -ms-flex-pack: justify;
        justify-content: space-between;
        padding: 0 .15rem;
        border-bottom: 1px solid #e8e8e8;
    }

    .materiel-item-wrapper{
        overflow: hidden;
        position: relative;
        background: #FFF;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        height: calc(100% - .50rem);
        padding: 0 .15rem;
        .materiels{
            padding: .05rem;
            font-size: 14px;
            height: 100%;
            .materiel-item{
                .materiel-info{
                    font-weight: 600;
                }
                .box-codes{
                    font-size: 12px;
                    color: #696969;
                    .mater_delete{
                        position: relative;
                        padding-left: 0.3rem;
                    }
                    .box-code{
                        width: 100%;
                        display: -webkit-box;
                        display: -ms-flexbox;
                        display: flex;
                        padding-top: .05rem;
                        -webkit-box-sizing: border-box;
                        box-sizing: border-box;
                        -webkit-box-pack: justify;
                        -ms-flex-pack: justify;
                        justify-content: space-between;
                        
                        .matter-img {
                            width: .75rem;
                            height: .75rem;
                            display: inline-block;
                            img {
                                width: 100%;
                                max-height: 100%;
                            }
                        }
                        .matter-info{
                            -webkit-box-flex: 1;
                            -ms-flex: 1;
                            flex: 1;
                            position: relative;
                            margin-left: .12rem;
                            padding-bottom: .05rem;
                            .other{
                                display: inline-block;
                            }
                            .box-operate{
                                display: flex;
                                -webkit-box-sizing: border-box;
                                box-sizing: border-box;
                                -webkit-box-pack: justify;
                                -ms-flex-pack: justify;
                                justify-content: space-between;
                            }
                        }
                    }
                }
                .delete_icon{
                    left: 0;
                    top: 30%;
                    height: 20px;
                    fill: #999;
                    position: absolute;
                    transform: translateY(-50%);
                    .checked{
                        fill: #FA7138;
                    }
                }
            }
        }
    }
}
</style>

