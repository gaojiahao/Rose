<template>
    <div class="overdue-container">
       <div class="overdue-list">
         <div class="list-right">
          <div class="vux-1px-b title">
              <span class="list-left">
                <i class="iconfont icon-icyhbynotice" ></i>
              </span>
              <div class="title-right">
                <b>个人日结报告</b>
              </div>
              <div class="total-right">
                <p>总计：{{this.content.workingHoursTotal}}小时</p>
              </div>
          </div>
          <div class="list-content">
            <div class="header" v-for="(list,index) of project" :key="index">
              <div class="header-box">
                <span class="header-box-left">{{list.projectName}}</span>
                <span class="header-box-right">{{list.workingHoursSubtotal}}小时</span>
              </div>
              <div v-for="(item,k) of list.task" :key="k" class="header-list">
                <div><span>{{item.taskName}}/{{item.jobLogTitle}}/{{item.workingHours}}</span></div>
                <div>成果：{{item.result}}</div>
              </div>
            </div>
          </div>
         </div>
       </div>
    </div>
</template>

<script>
export default {
    name: "messageTplDayReport",
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
            content: [],
            project: [],
        }
    },
    created:function(){
        try{
            let json = JSON.parse(this.msg.content);
            this.content = json;
            this.project = this.content.project;
        }catch(e){
            console.log('msg content parse error',this.msg.content);
        }
    },
     methods:{
       goDetail(list){
         let path = `/detail/ee4ff0a1-c612-419d-afd7-471913d57a2a/0`;
          this.$router.push({
              path,
              query: {
                name: '项目任务', 
                folder: 'project',
                fileName: 'XMRW',
                transCode:list.transCode
              }
          })
       }
     }
}
</script>
<style lang="less" scoped>
.overdue-container{
  .overdue-list{
    border: 1px solid #ddd;
    padding: 0rem .1rem;
    background-color: #fff;
    border-radius: .02rem;
    text-align: left;
    .list-left{
      padding-right: .1rem;
      .icon-icyhbynotice{
        font-size: .28rem;
        color: #f90;
      }
    }
    .list-right{
      .title{
        padding: .05rem 0rem;
        display: flex;
        align-items: center;
        .title-left{
          img{
            width: .35rem;
            height: .35rem;
            border-radius: .02rem;
          }
        }
        .title-right{
            margin-left: .05rem;
           p{
            color: #333;
            font-size: .12rem;
          }
          b{
            color: #333;
            vertical-align: top;
          }
        }
        .total-right{
          right: 0;
          position: absolute;
        }
      }
      ul{
        font-size: .12rem;
        color: #333;
      }
      .list-content{
        color: #333;
        .header{
          font-size: .12rem;
          justify-content: space-between;
          border-bottom: 1px dashed #eee;
          padding: .1rem 0rem .02rem 0rem;
          .header-box{
            width: 100%;
            height: .2rem;
            .header-box-left{
              float: left;
            }
            .header-box-right{
              float: right;
            }
          }
          .header-list{
            padding: 0 .1rem;
          }
        }
        .content{
            padding: .02rem 0rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px dashed #eee;
        }
        .content:hover{
          background-color: #eee;
          cursor: pointer;
        }
        .content:last-child{
          border: none;
        }
      }
    }
  }
  .content:last-child{
    border: none;
  }
}

</style>
