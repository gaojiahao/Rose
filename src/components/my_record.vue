<template>
  <div class="pages">
    <tab :line-width=2 active-color='#B99763' v-model="index">
        <tab-item 
            class="vux-center" 
            :selected="demo2 === item" 
            v-for="(item, index) in list5" 
            @click.native="onItemClick(index)" 
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
            header-value="¥330000.00" 
            :body-items="list1">
        </form-preview>
        <form-preview 
            class="project_part"
            header-label="金额" 
            header-value="¥240000.00" 
            :body-items="list2">
        </form-preview>
        <form-preview 
            class="project_part"
            header-label="金额" 
            header-value="¥230000.00" 
            :body-items="list3">
        </form-preview>

        <divider>A类产品</divider>
        <form-preview 
            class="project_part"
            header-label="金额" 
            header-value="¥230000.00" 
            :body-items="list3">
        </form-preview>
        <divider>B类产品</divider>
        <form-preview 
            class="project_part"
            header-label="金额" 
            header-value="¥230000.00" 
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
            index: 0,
            list5: list(),
            demo2: '本日',
            list1: 
                [ 
                    { label: '产品',value: '足金999' }, 
                    { label: '数量',value: '10000件' }
                ],
            list2: 
                [ 
                    { label: '产品',value: '千金888' },
                    { label: '数量',value: '10888件' }, 
                ],
            list3: 
                [ 
                    { label: '产品',value: '千足金666' }, 
                    { label: '数量',value: '10666件' } 
                ],
            list4: 
                [
                    { label: '足金999',value: '20000 件/套' }, 
                    { label: '千金888',value: '12312 件/套' }, 
                    { label: '千足金666',value: '4232 件/套' }
                ],
        }
    },
    methods:{
        onItemClick (index) {
            console.log('on item click:', index)
        },
        mylist(){
            myReportService.myRepotList();
        }
    },
    mounted(){
        this.mylist();
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
