<template>
    <div class="overdue-container">
       <div class="overdue-list">
         <div class="list-right">
          <div class="vux-1px-b title">
              <span class="title-left">
                <img src="https://lab.roletask.com/resource/app-icon/project-task.png" />
              </span>
              <div class="title-right">
                <b>任务逾期提醒</b>
                <p>重要事件，您今天有{{content.length}}个任务需要完成！！！</p>
              </div>
          </div>
          <div class="list-content">
            <div class="header">
              <span>项目</span>
              <span>计划/申报工时</span>
            </div>
            <div class="content" v-for="(list,index) of content" :key="index">
              <ul>
                <li>{{list.projectName}}</li>
                <li>{{list.projectManager}}</li>
                <li>{{list.taskName}}</li>
              </ul>
              <div>{{`${list.declareWorkingHoursSubtotal}/${list.standardWorkingHours}`}}</div>
            </div>
          </div>
         </div>
       </div>
    </div>
</template>

<script>
export default {
    name: "MessageTplTaskOverdue",
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
            content: []
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
    .list-right{
      padding-right: .1rem;
      .title{
        padding: .05rem 0rem;
        display: flex;
        align-items: center;
        .title-left{
          img{
            width: .4rem;
            height: .4rem;
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
      }
      ul{
        font-size: .12rem;
        color: #333;
      }
      .list-content{
        color: #333;
        .header{
          display: flex;
          font-size: .12rem;
          justify-content: space-between;
          border-bottom: 1px dashed #eee;
          padding: .1rem 0rem .02rem 0rem;
        }
        .content{
            padding: .02rem 0rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px dashed #eee;
        }
      }
    }
  }
  .content:last-child{
    border: none;
  }
}

</style>
