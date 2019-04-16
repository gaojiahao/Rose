<template>
  <div class="app-part">
    <div class="each_part" v-for="(item, inx) in BusApps" :key='inx'>
      <template v-if="Object.values(item.appList).length > 0">
        <div class="app-container defalut_bg">
          <div class="app_classify_name">
            <p>{{item.name}}</p>
          </div>
          <div class="app-list">
            <div v-if="app.text" class="indval_app" 
              @click='goList(item.folder, app.packagePath, app.text, app.listId )'
              v-for="(app, index) of item.appList" :key='index'>
                <template>
                  <div class="app_img">
                    <img :src='app.icon' @error="getDefaultIcon(app)">
                  </div>
                  <div class="app_info vux-1px-b">
                    <div class="app_name">{{app.text}}</div>
                    <div class="app_detail_btn" @click.stop="goAppDetail(app.listId)">应用详情</div>
                  </div>
                </template>
            </div>
          </div>
          <div class="child-list">
            <div v-if="app.childName" class="each_child" 
              v-for="(app, index) of item.appList" :key='index'>
              <div class="child_name">
                <span class="circle"></span>
                <span>{{app.childName}}</span>
              </div>
              <div class="child_apps_list">
                <div class="child_apps" @click='goList(item.folder, child.packagePath, child.text, child.listId)'
                v-for="(child, inx) of app.childList" :key="inx">
                  <div class="app_img">
                    <img :src='child.icon' @error="getDefaultIcon(child)">
                  </div>
                  <div class="app_info vux-1px-b">
                    <div class="app_name">{{child.text}}</div>
                    <div class="app_detail_btn" @click.stop="goAppDetail(child.listId)">应用详情</div>
                  </div>
                </div>
              </div>
            </div>            
          </div>
        </div>
      </template>
    </div>  
  </div>
</template>

<script>
let swiper;
export default {
  props:{
    BusApps: {
      type: Array,
      default: []
    },
    goList: {
      type: Function,
      require: true
    },
    getDefaultIcon: {
      type: Function,
      require: true
    },
    goAppDetail: {
      type: Function,
      require : true
    }
  }
}
</script>

<style lang='scss' scoped>
@import "~scss/home/homeCommon.scss";
.child-list {
  width: 100%;
  .each_child {
    width: 100%;
    .child_name {
      width: 100%;
      display: flex;
      padding: 0 .1rem;
      color: #757575;
      font-size: .18rem;
      font-weight: bold;
      align-items: center;
      box-sizing: border-box;
      .circle {
        width: .06rem;
        height: .06rem;
        border-radius: 50%;
        background: #757575;
      }
      span + span {
        margin-left: .06rem;
      }
    }
    .child_apps_list {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      padding-top: .08rem; 
      .child_apps {
        width: 50%;
        display: flex;
        margin-bottom: .1rem;
        border-radius: .08rem;
        box-sizing: border-box;
        padding: .06rem .1rem 0;
        .app_img {
          width: .5rem;
          height: .5rem;
          margin-right: .1rem;
          img {
            width: 100%;
            border-radius: .08rem;
          }
        }
        .app_info {
          flex: 1;
          padding-bottom: .1rem;
          .app_name {
            width: 1rem;
            overflow: hidden;
            font-size: .14rem;          
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          .app_intro {
            color: #757575;
            font-size: .12rem;
          }
          .app_detail_btn {
            color: #006DFF;
            font-size: .1rem;
            font-weight: bold;
            margin-top: .06rem;
            width: fit-content;
            box-sizing: border-box;
            background: #EEEEF6;
            border-radius: 0.12rem;
            padding: .02rem .04rem;
            
          }
        }
        // 应用名称
        .app_intro {
          overflow: hidden;
          font-size: .14rem;
          max-height: .46rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          text-overflow: ellipsis;
          -webkit-box-orient: vertical;
        }    
      }
    }
  }
}
</style>
