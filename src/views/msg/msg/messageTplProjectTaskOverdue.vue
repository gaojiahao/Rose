<template>
    <div class="overdue-container">
       <div class="overdue-list">
         <div class="list-right">
          <div class="vux-1px-b title">
              <span class="list-left">
                <img src="https://lab.roletask.com/resource/app-icon/project-task.png" />
              </span>
              <div class="title-right">
                <b>任务逾期通知</b>
              </div>
          </div>
          <div class="list-content">
            <div class="header">
              <div class="header-list">
                <div class="flexbox">
                  <div class="flexitem">任务名称</div>
                  <div class="flexitem">执行者</div>
                  <div class="flexitem">计划结束日期</div>
                  <div class="flexitem">逾期天数</div>
                </div>
              </div>
            </div>
            <div class="header" v-for="(list,index) of content" :key="index">
              <div v-for="(item,k) of list.content" :key="k" class="header-list">
                <div class="flexbox">
                  <div class="flexitem">{{item.taskName}}</div>
                  <div class="flexitem">{{item.executor}}</div>
                  <div class="flexitem">{{item.endTime}}</div>
                  <div class="flexitem red">{{item.overdueDays}}</div>
                </div>
              </div>
            </div>
          </div>
         </div>
       </div>
    </div>
</template>

<script>
export default {
    name: "messageTplProjectTaskOverdue",
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
            let json = this.msg.content;
            this.content = json;
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
      img{
        width: .35rem;
        height: .35rem;
        border-radius: .02rem;
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
            .flexbox{
              display: flex;
              .flexitem{
                flex:1;
              }
              .red{
                color: brown;
              }
            }
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
