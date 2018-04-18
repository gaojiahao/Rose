<template>
  <div class="pages">
    <tab :line-width=2 active-color='#B99763'>
        <tab-item 
            class="vux-center" 
            :selected="demo2 === item" 
            v-for="(item, index) in listTab" 
            @click.native="mylist(index)" 
            :key="index"
            >
            {{item}}
        </tab-item>
    </tab>
    <div class="my_info_part">
        <divider>项目类产品</divider>
        <form-preview 
            class="project_part"
            header-label="金额" 
            :header-value="'￥'+list1Total" 
            :body-items="list1">
        </form-preview>

        <divider>A类产品</divider>
        <form-preview 
            class="project_part"
            header-label="金额" 
            :header-value="'￥'+list2Total" 
            :body-items="list2">
        </form-preview>
        <divider>B类产品</divider>
        <form-preview 
            class="project_part"
            header-label="金额" 
            :header-value="'￥'+list3Total" 
            :body-items="list3">
        </form-preview>

    </div>
   </div>
</template>

<script>
import { Tab, TabItem, Divider, SwiperItem, FormPreview, CellFormPreview } from 'vux'
import myReportService from '../service/myReportService'
const list = () => ['本日', '本周', '本月', '本年']
export default {
    components:{
        Tab,
        TabItem,
        Divider,
        SwiperItem,
        FormPreview,
        CellFormPreview
    },
    data(){
        return{
            listTab: list(),
            demo2: '本日',
            list1:[],
            list2:[],
            list3:[],
            list1Total:0,
            list2Total:0,
            list3Total:0,
            list4:[
                    { label: '足金999',value: '20000 件/套' }, 
                    { label: '千金888',value: '12312 件/套' }, 
                    { label: '千足金666',value: '4232 件/套' }
                ],
            remark:'',
        }
    },
    methods:{
        mylist(tab){
            if(tab==0){
                this.listpanl(this.remark.days)
            }else if(tab==1){
                this.listpanl(this.remark.weeks)
            }else if(tab==2){
                this.listpanl(this.remark.months)
            }else if(tab==3){
                this.listpanl(this.remark.years)
            }
        },
        detaList(){
             myReportService.myRepotList().then(data=>{
                this.remark=data;
            });
        },
        listpanl(m){
            if(m==undefined||m.length==0){
                this.list1Total=0;
                this.list2Total=0;
                this.list3Total=0;
                this.list1.length=0;
            }else{
                this.list1Total=m[0].amount;
                this.list2Total=m[0].aProduct;
                this.list3Total=m[0].bProduct;
                this.list1[0]={
                        label:'数量',
                        value:m[0].qty,
                    }
            }
        }
    },
    created(){
    },
    mounted(){
        this.detaList();
        this.mylist(0);
    }
}
</script>

<style lang="less" scoped>
@import '~vux/src/styles/1px.less';
@import '~vux/src/styles/center.less';
.tab-swiper {
  background-color: #fff;
  height: 100%;
}
</style>
