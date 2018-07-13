<template>
    <div class='pages'>
        <div class='content'>
            <div class='mater_baseinfo vux-1px-b'>
                <div class='mater_property'>
                    <div class='each_property vux-1px-b'>
                        <label>物料编码:</label>
                        <input type='text' v-model="MatCode" class='property_val' />
                    </div>
                    <div class='each_property'>
                        <label>物料名称:</label>
                        <input type='text' v-model="MatName" class='property_val' />
                    </div>
                </div>
                <div class='mater_pic vux-1px-l'>
                    <input type="file" name="file" id='file' @change="uploadFile($event)"  accept="image/*"  style="display:none;"/>
                    <div class='add_icon' v-if='!picShow'>
                        <label for="file" ></label>
                        <div class='upload'>
                            <span class='iconfont icon-icon'></span>
                            <span class='add_text'>增加图片</span>
                        </div>  
                    </div>
                    <div class='add_icon' v-else>
                        <label for="file" ></label> 
                        <img :src='MatPic' class='upload'/>
                    </div>
                </div>    
            </div>
            <div class='each_property vux-1px-b'  @click='showTransPop = !showTransPop'>
                <label>加工属性:</label>
                <div class='picker'>
                    <span class='mater_nature'>{{MatNature}}</span>
                    <span class='iconfont icon-gengduo'></span>
                </div>
                <div v-transfer-dom >
                    <popup v-model="showTransPop"  id="trade_pop_part">
                        <div>
                            <div class='popup_header vux-1px-b'>
                                <span class='cancel' @click="showTransPop = false">取消</span>
                                <span class='confirm' @click="confirm">确认</span>
                            </div>
                            <picker :data='MatNatureList' v-model="popVal"  @on-change='change'></picker>
                        </div>
                        
                    </popup>
                </div>
            </div>
             <div class='each_property vux-1px-b'>
                <label>材料大类:</label>
                <div class='picker'>
                    <span class='mater_nature'>{{MatBigtype}}</span>
                    <span class='iconfont icon-gengduo'></span>
                </div>
            </div>
             <div class='each_property vux-1px-b'>
                <label>材料子类:</label>
                <div class='picker'>
                    <span class='mater_nature'>{{MatSmltype}}</span>
                    <span class='iconfont icon-gengduo'></span>
                </div>
            </div>
            <div class='each_property vux-1px-b'>
                <label>型号规格:</label>
                <input type='text' v-model="size" class='property_val' />
            </div>
            <div class='each_property vux-1px-b'>
                <label>颜色:</label>
                <input type='text' v-model="color" class='property_val' />
            </div>
            <div class='each_property vux-1px-b'>
                <label>主材质:</label>
                <input type='text' v-model="MajorComp" class='property_val' />
            </div>
             <div class='each_property vux-1px-b'>
                <label>主计量单位:</label>
                <input type='text' v-model="MajorUnit" class='property_val' />
            </div>
        </div>
        <div class='btn vux-1px-t'>
            <div class="cfm_btn">提交</div>
        </div>

    </div> 
</template>
<script>
import { TransferDom, Picker , Popup ,Group} from 'vux'
export default {
    data(){
        return {
            MatCode : '',
            MatName : '',
            MatPic : '',
            MatNature : '',
            MatBigtype : '',
            MatSmltype  : '',
            size : '',
            color : '',
            MajorComp : '',
            MajorUnit : '',
            MatNatureList:[['原料', '半成品', '成品', '商品', '服务', '虚拟件', '客供原料']],
            picShow: false,
            showTransPop : false,
            popVal : ['原料']

        }
    },
    directives: {
        TransferDom
    },
    components:{
        Picker ,
        Popup,
        Group
    },
    methods:{
        uploadFile(e){
            console.log('触发了')
            this.picShow = true;
            var reader = new FileReader();
            reader.onload = (evt) =>{
                this.MatPic = evt.target.result;
            }
            reader.readAsDataURL(e.target.files[0]);
        },
        change(value){
            this.popVal = value;
        },
        confirm(){
            this.MatNature = this.popVal[0];
            this.showTransPop = false;
        },
    }
    
}
</script>
<style lang="scss" scoped>
    .vux-1px-b:after, .vux-1px-l:before{
        border-color:#FBFBFB ;
        color: #FBFBFB ;
    }
    .content{
        height: 90%;
        overflow-y: auto;
        input{
            border:none;
        }
        .mater_baseinfo{
            display: flex;
            align-items:flex-end;
            .mater_property{ 
                flex:1;
            }
            .mater_pic{
                .add_icon{
                    position: relative;
                    label{
                        display: block;
                        width:1.2rem;
                        height:1.2rem;
                    }
                    .upload{
                        width:1.2rem;
                        height:1.2rem;
                        position: absolute;
                        left:0;
                        top:0;
                        z-index:-999;                                  
                        span{
                            display: block;
                            text-align: center;
                        }
                        .iconfont{
                            font-size:0.24rem;
                            margin-top:0.24rem;
                        }
                    }
                    
                }
                
                .pic{
                    width:1.2rem;
                    height:1.2rem;
                    border:0;
                }
            }
        }
        .each_property{
            padding: 0.05rem 0.08rem;
            label{
                color:#6d6d6d;
                font-size:0.12rem;
                display: block;
                line-height: 0.2rem;
            }
            .picker{
                display: flex;
                justify-content: space-between;
                align-items: center;
                .mater_nature{
                    font-size:0.16rem;
                    line-height: 0.2rem;
                }
                .iconfont {
                    font-size:0.24rem;
                }
            }
            .property_val{
                display: block;
                font-size:0.16rem;
                line-height: 0.24rem;
            }
        }
    }
    //确认框
    .popup_header{
        display: flex;
        justify-content: space-between;
        height: 44px;
        line-height: 44px;
        font-size: 16px;
        background-color: #fbf9fe;
        padding: 0 15px;
        .cancel{
            color: #828282;
        }
        .confirm{
            color: #FF9900;

        }
    }
    // 确定
    .btn {
    left: 0;
    bottom: 0;
    width: 100%;
    height: 10%;
    position: fixed;
    background: #fff;
    .cfm_btn {
        top: 50%;
        left: 50%;
        width: 2.8rem;
        color: #fff;
        height: .44rem;
        line-height: .44rem;
        position: absolute;
        text-align: center;
        background: #5077aa;
        border-radius: .4rem;
        transform: translate(-50%, -50%);
        box-shadow: 0 2px 5px #5077aa;
    }
    }

</style>


