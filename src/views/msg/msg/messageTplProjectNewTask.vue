<template>
    <div class="overdue-container">
       <div class="overdue-list">
         <div class="list-right">
          <div class="vux-1px-b title">
              <span class="title-left">
                <img src="https://lab.roletask.com/resource/app-icon/project-task.png" />
              </span>
              <div class="title-right">
                  <b>你有新的任务：</b>
                  <div class="title-right-content">
                    <div class="title-right-content-left">{{content.projectName}}/{{content.taskName}}</div>
                    <div class="title-right-content-right">{{content.startTime}}至{{content.endTime}}</div>
                  </div>
              </div>
          </div>
         </div>
       </div>
    </div>
</template>

<script>
export default {
    name: "messageTplProjectNewTask",
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
            let json = this.msg.content;
            this.content = JSON.parse(json);
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
            width: 100%;
           .title-right-content{
            color: #333;
            font-size: .12rem;
            width: 100%;
            position: relative;
            .title-right-content-left{
              width: 50%;
              float: left;
            }
            .title-right-content-right{
                width: 50%;
                float: right;
                text-align: right;
            }
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
