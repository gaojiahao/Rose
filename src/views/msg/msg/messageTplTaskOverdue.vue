<template>
    <div class="overdue-container">
       <div class="overdue-list">
         <div class="list-left">
           <img src="https://lab.roletask.com/resource/app-icon/project-task.png" />
         </div>
         <div class="list-right">
            <h2>任务逾期提醒</h2>
            <p>重要事件，您今天有{{content.length}}个任务需要完成！！！</p>
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
    padding: .2rem .1rem;
    background-color: #fff;
    border-radius: .05rem;
    text-align: left;
    display: flex;
    h2{
      color: #333;
    }
    .list-left{
      flex: .5;
      padding-top: .09rem;
      margin-right: .1rem;
      img{
        width: .2rem;
        height: .2rem;
      }
    }
    .list-right{
      padding-right: .1rem;
      p{
        color: #333;
        font-size: .16rem;
      }
      ul{
        font-size: .16rem;
        color: #333;
      }
      .list-content{
        color: #333;
        .header{
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #ddd;
          padding: .1rem 0rem .05rem 0rem;
        }
        .content{
            padding: .05rem 0rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #ddd;
        }
      }
    }
  }
}
</style>
