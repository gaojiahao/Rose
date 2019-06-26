<template>
  <div class="each_part">
    <div class="app-container defalut_bg" v-if="Object.values(item.appList).length > 0">
      <div class="app_classify_name">
        <p>{{item.name}}</p>
      </div>
      <div class="app-list">
        <app
          :app="app"
          cls="indval_app"
          @app-click="goList(item.folder, app.packagePath, app.text, app.listId )"
          v-for="(app, index) of item.appList"
          :key="index"
        />
      </div>
      <div class="child-list">
        <div
          v-if="app.childName"
          class="each_child"
          v-for="(app, index) of item.appList"
          :key="index"
        >
          <div class="child_name">
            <span class="circle"></span>
            <span>{{app.childName}}</span>
          </div>
          <div class="child_apps_list">
            <app
              :app="child"
              cls="child_apps"
              @app-click="goList(item.folder, child.packagePath, child.text, child.listId)"
              v-for="(child, inx) of app.childList"
              :key="inx"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import app from "./app";
export default {
  components: { app },
  props: {
    item: Object
  },
  methods: {
    // 前往列表
    goList(folder, fileName, name, listId) {
      this.$router.push({
        path: `/list/${folder}/${fileName}`,
        query: { name, listId }
      });
    }
  }
};
</script>
<style lang='scss'>
@import "~scss/home/homeCommon.scss";
.child-list {
  width: 100%;
  .each_child {
    width: 100%;
    .child_name {
      width: 100%;
      display: flex;
      padding: 0 0.1rem;
      color: #757575;
      font-size: 0.18rem;
      font-weight: bold;
      align-items: center;
      box-sizing: border-box;
      .circle {
        width: 0.06rem;
        height: 0.06rem;
        border-radius: 50%;
        background: #757575;
      }
      span + span {
        margin-left: 0.06rem;
      }
    }
    .child_apps_list {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      padding-top: 0.08rem;
      .child_apps {
        width: 50%;
        display: flex;
        margin-bottom: 0.1rem;
        border-radius: 0.08rem;
        box-sizing: border-box;
        padding: 0.06rem 0.1rem 0;
        .app_img {
          width: 0.5rem;
          height: 0.5rem;
          margin-right: 0.1rem;
          img {
            width: 100%;
            border-radius: 0.08rem;
          }
        }
        .app_info {
          flex: 1;
          padding-bottom: 0.1rem;
          .app_name {
            width: 1rem;
            overflow: hidden;
            font-size: 0.14rem;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          .app_intro {
            color: #757575;
            font-size: 0.12rem;
          }
          .app_detail_btn {
            color: #006dff;
            font-size: 0.1rem;
            font-weight: bold;
            margin-top: 0.06rem;
            width: fit-content;
            box-sizing: border-box;
            background: #eeeef6;
            border-radius: 0.12rem;
            padding: 0.02rem 0.04rem;
          }
        }
        // 应用名称
        .app_intro {
          overflow: hidden;
          font-size: 0.14rem;
          max-height: 0.46rem;
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