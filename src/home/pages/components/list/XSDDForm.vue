<template>
    <div class="pages">
        <div class='content'>
            <div class="list_top">
                <!-- 搜索栏 -->
                <searchIcon @search='searchList'></searchIcon>
                <div class="filter_part">
                    <tab :line-width='2' default-color='#757575' active-color='#2c2727'>
                        <tab-item v-for="(item, index) in listStatus" :key="index" :selected="index === activeIndex"
                                @on-item-click="tabClick(item, index)">{{item.name}}
                        </tab-item>
                    </tab>
                </div>
            </div>
            <div class="list_wrapper" ref='list'>
                <div class='list_content'>
                    <div class="each_duty" v-for="(item, index) in listData" :key="index" @click='goDetail(item.transCode)'>
                        <div class="duty_top">
                            <p class="duty_name">
                                <span class="duty_status">
                                    <span class="duty_status_info" :class="item.biStatus === '已生效' ? 'duty_process_c' : 'duty_wait_c'">{{item.biStatus}}</span>
                                </span>                                
                            </p>
                        </div>
                        <div class="duty_btm">
                            <p class="duty_code">
                                {{item.transCode}}
                                <span class="duty_crt_man">{{item.creatorName}}</span>
                            </p>
                            <p class="duty_time">{{item.crtTime | filterTime}}</p>
                        </div>
                    </div>
                    <load-more tip="加载中" v-show="hasNext"></load-more>
                    <load-more :show-loading="false" tip="暂无数据" v-show="!listData.length && !hasNext"></load-more>
                </div>
                <spinner class="pullDownRefresh" type="android" :style="{top: pullDownTop + 'px'}"></spinner>
            </div>
        </div>        
    </div>
</template>

<script>
import {Tab, Icon, TabItem,LoadMore,numberPad,Spinner} from 'vux'
import { getList } from '../../../service/listService.js'
import searchIcon from '../search.vue'
import BScroll from 'better-scroll'
const PULL_DOWN_REFRESH_HEIGHT = 30;
export default {
    data(){
        return{
            listBscrol:null,
            page : 1,
            limit :20,
            hasNext :true,
            pullDownTop: -PULL_DOWN_REFRESH_HEIGHT,
            listStatus :[{name:'全部',status:''},{name:'已生效',status:1},{name:'进行中',status:2}],
            activeIndex : 0,
            serachVal : '',
            listData : [],
            activeTab : ''

        }
    },
    components:{
        Tab, Icon, TabItem,LoadMore,searchIcon,Spinner
    },
    methods:{
        goDetail(code){
            this.$router.push({
                path:'/detail',
                query:{
                    transCode : code
                }
            })
        },
        // TODO 重置列表条件
        resetCondition() {
            this.listData = [];
            this.page = 1;
            this.hasNext = true;
            this.pullDownTop = -PULL_DOWN_REFRESH_HEIGHT;
        },
        ///tab切换
        tabClick(item,index){
            this.activeIndex = index;
            this.activeTab = item.status;
            this.resetCondition();
            this.listBscrol.scrollTo(0, 0);
            this.getOrderList();
        },
        searchList(val){
            console.log(val);
            this.serachVal  = val;
            this.resetCondition();
            this.getOrderList();
        },
        //获取销售订单数据
        getOrderList(){
            let filter = [
                {
                    operator: 'eq',
                    value: this.activeTab,
                    property: 'biStatus',
                }
            ];
            if (!this.activeIndex) {
                filter[0].operator = 'like';
            }
            if (this.serachVal) {
                filter[0].attendedOperation = 'and (';
                filter = [
                    ...filter,
                    {
                    operator: 'like',
                    value: this.serachVal,
                    property: 'transCode',
                    attendedOperation: 'or'
                    },
                    {
                    operator: 'like',
                    value: this.serachVal,
                    property: 'creatorName',
                    attendedOperation: ')'
                    },
                ];
            }
            getList({
                limit : this.limit,
                page  : this.page,
                start : (this.page-1) * this.limit,
                filter: JSON.stringify(filter)
            }).then(({dataCount = 0, tableContent = []}) => {
                this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
                this.listData = this.page === 1 ? tableContent : this.listData.concat(tableContent);
                this.$nextTick(()=>{
                    this.listBscrol.refresh();
                    this.listBscrol.finishPullDown();
                    this.pullDownTop = -PULL_DOWN_REFRESH_HEIGHT;
                    if (!this.hasNext) {
                        return
                    }
                    this.listBscrol.finishPullUp();
                })
            }).catch(e=>{
                this.listBscrol.finishPullDown();
                this.pullDownTop = -PULL_DOWN_REFRESH_HEIGHT;
            })
        },
        initScroll(){
            this.$nextTick(()=>{
                this.listBscrol = new BScroll(this.$refs.list,{
                    click: true,
                    pullDownRefresh: {
                        threshold: 50,
                        stop: PULL_DOWN_REFRESH_HEIGHT
                    },
                    pullUpLoad: {
                        threshold: 20
                    },
                    
                })
                //上拉加载
                this.listBscrol.on('pullingUp', () => {
                    if (!this.hasNext) {
                    return
                    }
                    this.page++;
                    this.getOrderList();
                });
                //下拉刷新
                this.listBscrol.on('pullingDown',()=>{
                    this.page = 1;
                    this.getOrderList()

                })
                //滚动过程中文字提示
                this.listBscrol.on('scroll',({x,y})=>{
                    if(y>0){
                        if(y > PULL_DOWN_REFRESH_HEIGHT){
                            this.pullDownTop = 0
                        }
                        else{
                            this.pullDownTop = y - PULL_DOWN_REFRESH_HEIGHT;
                        }
                    }
                })
            })
        }
    },
    filters: {
      // TODO 过滤日期
      
      filterTime(val) {
        if(val){
          let date = new Date(val);
          return `${date.getFullYear()}-${numberPad(date.getMonth() + 1)}-${numberPad(date.getDate())}`;
        }
        
      }
    },
    created(){
        this.initScroll();
        this.getOrderList();

    }

}
</script>

<style lang='scss' scoped>
.content{
    width:100%;
    height:100%;
    overflow: auto;
}
.list_top {
    width: 100%;
    padding-top: .1rem;
    // 过滤
    .filter_part {
      margin-top: .04rem;
    }
  }
.list_wrapper{
    position: relative;
    width:100%;
    height: calc(100% - .52rem - 36px);
    overflow: hidden;
    box-sizing: border-box;
    .list_content{
        overflow: hidden;
        min-height: calc(100% + 1px);
        .each_duty{
            margin: .2rem auto;
            padding: .1rem ;
            position: relative;
            width: 85%;
            box-shadow: 0 0.02rem 0.2rem #e8e8e8;
            .duty_name { //任务名称
                width: 100%;
                font-size: .16rem; // 1rem=100px 手机像素2：1 这里原字体大小为16px
                font-weight: bold;
                max-height: 1rem;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                .duty_status { //任务状态
                font-size: .12rem; // 这里原字体大小为14px
                color: #fff;
                margin-right: .05rem;
                display: inline-block;
                vertical-align: middle;
                margin-top: -2px;
                .duty_status_name,
                .duty_status_info {
                    padding: 1px 4px;
                }
                .duty_status_name {
                    background: #000;
                }
                .duty_status_info { //进行中
                    border-top-right-radius: .12rem;
                    border-bottom-right-radius: .12rem;
                }
                .duty_process_c {
                    background: #26AB28;
                }
                .duty_wait_c {
                    background: #FADB51;
                    color: #000;
                }
                }
            }
            .duty_btm {
                height: .24rem;
                line-height: .24rem;

                .duty_code { //任务编码
                float: left;
                font-size: .15rem;
                color: #7D7D7D;
                font-weight: 200;

                .duty_crt_man { // 任务创建者
                    position: relative;
                    background: #333;
                    font-size: 0.12rem;
                    color: #FDF6A4;
                    padding: .02rem;

                }
                .duty_crt_man:before { //左尖角
                    position: absolute;
                    content: "";
                    width: 0;
                    height: 0;
                    top: 0;
                    left: -.03rem;
                    border-right: .04rem solid #333;
                    border-bottom: .04rem solid transparent;
                }
                }
                .duty_time { //任务创建时间
                float: right;
                font-size: .15rem;
                color: #7D7D7D;
                font-weight: 200;
                }
            }
        }
        

    }
    .pullDownRefresh {
            display: block;
            margin: 0 auto;
            height: 30px;
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            transition: top;
        }
    
}

</style>
