<template>
     <div class="materiel-wrapper">
        <div class="header" @click="handlerChangeState">
            <div>{{title}}</div>
            <div v-if="!matterModifyClass">编辑</div>
            <div v-if="matterModifyClass">完成</div>
        </div>
        <ul class="materiels">
            <li class="materiel-item" 
                v-for="(mat,matIdx) in matters" 
                :key="matIdx">
                    <div class="materiel-info">
                        <flexbox justify="space-between">
                            <flexbox-item :span="6"><div >{{mat.inventoryName}}({{mat.inventoryCode}})</div></flexbox-item>
                            <flexbox-item ><div >{{getGroupInfo(mat).all}}</div></flexbox-item>
                            <flexbox-item ><div >{{getGroupInfo(mat).done}}</div></flexbox-item>
                            <x-icon type="ios-arrow-up" v-if="mat.expend && mat.boxCodes.length>0" size="24" @click.native="mat.expend=!mat.expend"></x-icon>
                            <x-icon type="ios-arrow-down" v-if="!mat.expend && mat.boxCodes.length>0" size="24" @click.native="mat.expend=!mat.expend"></x-icon>
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
                            <span>{{box.warehouseName}}/{{box.storehouseInCode}}</span>
                            <span>{{box.specification}}</span>
                            <div >{{box.postCode}}</div>
                            <div class="box-operate">
                                <div></div>
                                <div></div>
                                <div>
                                    <r-number :num="box.tdQty" v-model="box.tdQty"></r-number>
                                </div>
                            </div>
                        </div>

                        <div class='delete_icon' 
                            @click="handlerSelectItem(box, matIdx+'_'+ boxIdx)" 
                            v-if='matterModifyClass'>
                            <x-icon 
                                type="ios-checkmark" 
                                size="20" 
                                class="checked" 
                                v-show="showSelIcon( matIdx+'_'+ boxIdx)"></x-icon>
                            <x-icon 
                                type="ios-circle-outline" 
                                size="20" 
                                v-show="!showSelIcon( matIdx+'_'+ boxIdx)"></x-icon>
                        </div>
    
                    </li>
                </ul>
            </li>
        </ul>
    </div>
</template>
<script>
import { Flexbox, FlexboxItem} from 'vux'
import RNumber from 'components/public/RNumber'
export default {
    name:'WmsMatterPart',
    props:{
        title:{
            type:String,
            default:''
        },
        // 是否处于编辑物料状态
        matterModifyClass: {
            type: Boolean,
            default: false
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
        }
    },
    components:{
        RNumber,
        Flexbox, 
        FlexboxItem
    },
    // methods:{
    //     getGroupInfo(mat){
    //         return {
    //             todo:30000
    //         }
    //     }
    // }
}
</script>


<style lang='scss' scoped>
.materiel-wrapper{
    padding: 0 .15rem;
    font-size: .14rem;
    position: relative;
    background: #FFF;
    margin-bottom: .1rem;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    .header{
        height: .30rem;
        margin: .15rem 0 0 0;
        line-height: .30rem;
        color: #696969;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        -webkit-box-pack: justify;
        -ms-flex-pack: justify;
        justify-content: space-between;
    }
    .materiels{
        padding: 0.2em;
        font-size: 14px;
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
                        padding-bottom: .15rem;
                        .box-operate{
                            display: flex;
                            padding-top: .10rem;
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
</style>

