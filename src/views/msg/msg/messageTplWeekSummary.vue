<template>
    <div class="week-container">
       <div class="week-list">
         一周小结 {{`${startDate.replace('-','.')}~${endDate.replace('-','.')}`}}
         <div class="list-right">
            <div class="title">
              <span class="title-left">
                <img :src="getDefaultPhoto()" />
              </span>
              <div class="title-right">
                <p>
                  您本周总工作<b>{{content.workingHoursSubtotal | numberComma}}</b>小时，
                  产生<b>{{content.benefitSubtotal | numberComma}}</b>绩效收入
                </p>
              </div>
            </div>
            <div class="list-content">
              <div class="content">
                <span>计件绩效</span>
                <span>{{content.pieceBenefit | numberComma}}</span>
              </div>
              <div class="content">
                <span>工时绩效</span>
                <span>{{content.workBenefit | numberComma}}</span>
              </div>
              <div class="content">
                <span>销售佣金绩效</span>
                <span>{{content.saleBenefit | numberComma}}</span>
              </div>
              <div class="content">
                <span>项目利润分配</span>
                <span>{{content.projectBenefit | numberComma}}</span>
              </div>
              <div class="content">
                <span>组织利润分配</span>
                <span>{{content.groupBenefit | numberComma}}</span>
              </div>
            </div>
         </div>
       </div>
    </div>
</template>

<script>
import { numberComma } from 'vux'
export default {
    name: "MessageTplWeekSummary",
    props:{
        msg:{
            type:Object,
            default(){
                return {}
            }
        }
    },
    data(){
        return {
            content: {}
        }
    },
    filters: {
      numberComma
    },
    computed: {
      startDate: function(){
        let startDate = new Date(this.content && this.content.startDate);
        return `${startDate.getMonth()}-${startDate.getDate()}`;
      },
      endDate: function(){
        let endDate = new Date(this.content && this.content.endDate);
        return `${endDate.getMonth()}-${endDate.getDate()}`;
      }
    },
    created:function(){
        try{
            let json = JSON.parse(this.msg.content);
            this.content = json.content;
        }catch(e){
            console.log('msg content parse error',this.msg.content);
        }
    },
    methods:{
      getDefaultPhoto() {
          let url = require("assets/ava01.png");
          if (this.content.photo) {
              url = this.content.photo;
          }
          return url;
        }
    }
}
</script>
<style lang="less" scoped>
.week-container{
  .week-list{
    border: 1px solid #ddd;
    padding: 0rem .1rem;
    background-color: #fff;
    border-radius: .02rem;
    text-align: left;
    .list-right{
      padding-right: .1rem;
      .title{
        color: #333;
        padding: .05rem 0rem;
        display: flex;
        align-items: center;
        &-left{
          img{
            width: .4rem;
            height: .4rem;
            border-radius: .02rem;
          }
        }
        &-right{
          margin-left: .05rem;
          span{
            vertical-align: top;
          }
          p{
            color: #333;
            font-size: .14rem;
          }
        }
      }
      .list-content{
        .content{
            padding: .02rem 0rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: .12rem;
        }
      }
    }
  }
}
</style>
