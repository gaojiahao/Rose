<template>    
    <div class="pages2">
        <!-- 头部 -->
        <div class="header">
            <div class="header-container">
                <div class="center">xxx项目</div>
            </div>
        </div>
        <!-- banner -->
        <div class="avatar-part"></div>
        <!-- 目标详情 -->
        <div class="dashboard-container-part">
          <div class="place-holder"></div>
          <div class="top-part">
            <div>
              <div class="date-part">
                <span>jiahao</span> 
                <span>xxx人民币项目</span>
              </div>
              <!-- <div class="tips-title">
                <div >欢迎,111</div>
                <div >距离完成 1111111</div>
              </div> -->
            </div>
          </div>
          <div class="dashboard-part">
            <div class="each-dashboard least-num">
              <div class="dashboard_title">销售目标</div>
              <div class="dashboard_count">xxx<span>/套</span></div>
            </div>
            <div class="each-dashboard when-today">
              <div class="dashboard_title">月收入目标</div>
              <div class="dashboard_count"><span>￥</span>222</div>
            </div>
          </div>
          <div class="place-holder"></div>
        </div>
        <div class="main-container-part">
            <div class="main-container-part-bg">
                <div v-for="(item,index) in list" :key="index" class="detail">
                        <div class='title' @click="toggleClass(index,item)">
                            {{item.title}}
                            <div style="float:right">↓</div>
                        </div>
                        <div class="content" :class="{'open':item.showContent}">
                            <div class="button">
                                <div class="left"><x-button mini type="primary" @click.native="clickProject()">新增</x-button></div>
                                <div class="left"><x-button mini type="warn">管理</x-button></div>
                            </div>
                            <div class="list">
                                <div>product1</div>  
                                <div>product1</div> 
                                <div>product1</div>         
                            </div>
                        </div>
                </div>
            </div>   
        </div>
        <popup-income-calc :show="showPopupIncomeCalc" v-model="showPopupIncomeCalc" ref="PopupIncomeCalc"></popup-income-calc>
    </div>
</template>

<script>
import {XButton, Confirm, querystring} from 'vux'
import PopupIncomeCalc from 'components/popup/PopupIncomeCalc'
export default {
  data(){
    return{
        list:[{title:'四月第一周',showContent:true},{title:'四月第二周',showContent:false},{title:'四月第二周',showContent:false},
        {title:'四月第二周',showContent:false},{title:'四月第二周',showContent:false},{title:'四月第二周',showContent:false}],
        showDetail:0,
        showPopupIncomeCalc:false,
    }
  },
  components: {
    XButton,
    Confirm,
    PopupIncomeCalc
  },
  methods:{
    changeContent(index){                       //通过index拿到当前值
        this.list[index].showContent=!this.list[index].showContent;
    },
    toggleClass(index,item){
        this.list[index]['showContent'] =  this.list[index]['showContent'] ? false : true;
    },
    clickProject() {
      this.showPopupIncomeCalc = true;
    },
  }
  

}
</script>

<style lang="scss" scoped>
.pages2 {
    left: 0;
    width: 100%;
    background: #f5f5f5;
    height: 100%;
    .header {
        width: 100%;
        height: .4rem;
        background-color: #3296fa;
        color: #fff;
        .header-container {
            width: 100%;
            display: flex;
            height: .4rem;
            position: relative;
            line-height: .4rem;
            box-sizing: border-box;
            .center {
                text-align: center;
                width: 33.33%;
                margin-left: 33.33%;
            }
        }
    }
    .avatar-part{
        top: .4rem;
        width: 100%;
        height: 2rem;
        position: absolute;
        background: #111 url(/static/img/bg01.281c29d.jpeg) top/cover no-repeat;
    }
    .dashboard-container-part {
        width: 100%;
        position: relative;
        background: #FFF;
        box-sizing: border-box;
        padding: 0 .1rem .04rem;
        top:2rem;
        .place-holder {
            left: 0;
            top: -10px;
            z-index: 10;
            width: 100%;
            height: .12rem;
            position: absolute;
            background: #FFF;
            border-top-left-radius: .1rem;
            border-top-right-radius: .1rem;
        }
        .user-info-container {
            top: -40px;
            left: 20px;
            z-index: 20;
            color: #FFF;
            display: flex;
            font-size: .14rem;
            position: absolute;
            align-items: center;
            .user-avatar {
                width: .6rem;
                height: .6rem;
                img {
                width: 100%;
                border-radius: 50%;
                }
            }
            .user-info {
                margin-left: .1rem;
                .user-name {
                    font-size: .16rem;
                    font-weight: bold;
                    margin-bottom: .06rem;
                }
                .user-from {
                    font-size: .12rem;
                    .each-form-msg {
                        border-radius: .12rem;
                        background: #5077aa;
                        padding: .01rem .04rem;
                        box-shadow: 0 2px 2px #5077aa;
                    }
                    .each-form-msg + .each-form-msg {
                        margin-left: .04rem;
                    }
                }
            }

        }
        .top-part {
            display: flex;
            align-items: center;
            margin-bottom: .1rem;
            justify-content: space-between;
            .tips-title {
                color: #111;
                font-size: .26rem;
                font-weight: bold;
                line-height: .32rem;
                .when_finished {
                    color: #D2AD6B;
                }      
            }
        }
        .date-part {
            color: #8A8A8E;
            font-size: .14rem;
            font-weight: bold;
        }
        .dashboard-part {
            display: flex;
            .each-dashboard {
                flex: 1;
                color: #FFF;
                font-weight: bold;
                line-height: .22rem;
                border-radius: .08rem;
                padding: .06rem .04rem;
                .dashboard_title {
                font-size: .12rem;
                }
                .dashboard_count {
                font-size: .22rem;
                }
                &.when-today {
                // $bgColor: #2366FF;
                $bgColor: #111;
                color: $bgColor;
                // background: $bgColor;
                // box-shadow: 0 2px 5px $bgColor;
                }
                &.when-month {
                // $bgColor: #00C5C3;
                $bgColor: #111;
                color: $bgColor;
                // background: $bgColor;
                // box-shadow: 0 2px 5px $bgColor;
                }
                &.least-num {
                // margin-right: unset;
                $bgColor: #D2AD6B;
                color: $bgColor;
                // background: $bgColor;
                // box-shadow: 0 2px 5px $bgColor;
                }
            }
            .each-dashboard  + .each-dashboard  {
                margin-left: .1rem;
            }
        }
    }
    .main-container-part {
        width: 100%;
        //background: #FFF;
        box-sizing: border-box;
        position: relative;
        top: 2rem;
        height: 100%;
        background-color: #f5f5f5;
        .main-container-part-bg{
            padding: 0rem .1rem .1rem .1rem;
            background-color: #f5f5f5;
            .detail{
                width: 100%;
                border-radius: 5px;
                background: white;
                margin-top: .1rem;
                .title{
                    padding: .05rem;
                    font-size: .14rem;
                }
                .content{
                    // max-height: 0;
                    // transition: max-height .3s;
                    display: none;
                    .button{
                        width: 100%;
                        height: .3rem;
                        .left{
                            float: right;
                            margin: 0 .05rem;
                            .weui-btn_mini {
                                display: inline-block;
                                padding: 0 1.32em;
                                line-height: 2.3;
                                font-size: 12px;
                            }
                        }
                    }
                    .list{

                    }
                }
                .open {
                    // max-height: 600px;
                    // transition: max-height .5s;
                    display: block;
                    
                }
            }
            .list{
                padding: 0 .05rem;
            }     
        }
    }
}
</style>
