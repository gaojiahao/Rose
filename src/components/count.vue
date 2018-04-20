<template>
  <div class="pages pd_btm">

    <group >
      <cell class="count_part" title="最终合计" :value="total4"></cell>
      <cell-form-preview class="count_dt_part" :list="list4"></cell-form-preview>
    </group>

    <load-more tip="项目类产品" :show-loading='false'></load-more>
      <form-preview 
        class="project_part"
        header-label="金额" 
        :header-value="total1" 
        :body-items="list1">
      </form-preview>

    <load-more tip="A类产品" :show-loading='false'></load-more>
      <form-preview 
        class="project_part"
        header-label="金额" 
        :header-value="total2">
      </form-preview>

    <load-more tip="B类产品" :show-loading='false'></load-more>
      <form-preview 
        class="project_part"
        header-label="金额" 
        :header-value="total3">
      </form-preview>


    <x-button 
        class="submit_button" 
        :gradients="['#B99763', '#E7D0A2']" 
        @click.native="sendOrder"
        >
        确定提交
    </x-button>
    <confirm></confirm>
  </div>
</template>

<script>
import saleRepotService from '../service/saleRepotService'
import { Alert, Cell , Group, Confirm ,  Divider,  XButton, LoadMore, FormPreview, CellFormPreview,querystring  } from 'vux'

export default {
    components:{
        Cell,
        Group,
        Divider,
        XButton,
        Confirm,
        LoadMore,
        FormPreview,
        CellFormPreview,
    },
    data(){
        return{
            list1:[],
            list2:[],
            list3:[],
            list4:[],
            total1:'',
            total2:'',
            total3:'',
            total4:'',
            childInfo:''
        }
    },
    methods:{
        /*
         * 提交数据
         */ 
        sendOrder(){
            var that=this;
             this.$vux.confirm.show({
                title: '温馨提示',
                content: '请确认提交数据是否正确？',
                confirmText:"我已确认",
                cancelText:"再去看看",
                onShow () {
                },
                onHide () {
                },
                onCancel () {
                },
                onConfirm () {
                saleRepotService.subAmount(querystring.stringify(that.childInfo)).then(data=>{
                    if(data.success){
                        that.$router.replace('/Home');
                        localStorage.removeItem('saleReport');
                        localStorage.removeItem('saleReportInfo');
                    }
                })
                }
            })
            
        },
        //获取数据
        info(){
            let total1=0;
            let total2=0;
            let total3=0;
            let jsonData=JSON.parse(this.childInfo.jsonData).transDetailUncalc;
            for(let i = 0 ;i<jsonData.length; i++){
                if(jsonData[i].containerCode=='项目类产品'){
                    this.list1.push({
                        label:jsonData[i].transObjCode,
                        value:jsonData[i].qty,
                    });
                    this.list4.push({
                        label:jsonData[i].transObjCode,
                        value:jsonData[i].qty+'件/套',
                    })
                    total1 +=jsonData[i].qty*jsonData[i].amount;

                }else if(jsonData[i].containerCode=='A'){
                    this.list2.push({
                        label:jsonData[i].transObjCode,
                        value:jsonData[i].qty,
                    });
                    //  this.list4.push({
                    //     label:jsonData[i].transObjCode,
                    //     value:'',
                    // })
                    total2 =jsonData[i].amount;
                }else if(jsonData[i].containerCode=='B'){
                    this.list3.push({
                        label:jsonData[i].transObjCode,
                        value:jsonData[i].qty,
                    });
                    //  this.list4.push({
                    //     label:jsonData[i].transObjCode,
                    //     value:'',
                    // })
                    total3 =jsonData[i].amount;
                }
            }
            this.total1='￥'+total1;
            this.total2='￥'+total2;
            this.total3='￥'+total3;
            let num=Number(total1)+Number(total2)+Number(total3);
            this.total4='￥'+num;
        }
    },
    mounted(){
        this.childInfo=JSON.parse(localStorage.getItem('saleReportInfo')).saleReportRemark
        this.info()
    }
}
</script>

<style scoped>
/* 提交订单按钮  */
.submit_button {
  border-radius: 0;
  margin-top: 10px;
  z-index: 99;
  position: fixed;
  bottom: 0;
  width: 100%;
}
.pd_btm{
    padding-bottom: 100px;
}
</style>
