<template>
  <div class="pages user-list-container" :class="{'no-add': !action.add}" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search='searchList'></searchIcon>
        <div class="filter_part">
          <tab :line-width='2' default-color='#757575' active-color='#2c2727'>
            <tab-item v-for="(item, index) in listStatus" :key="index" :selected="index === activeIndex"
                      @on-item-click="tabClick(item, index)">{{item.name}}
            </tab-item>
          </tab>
        </div>
      </div>
      <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <div class="each_duty" :class="{visited: item.visited}" v-for="(item, index) in listData" :key="index"
             @click='goDetail(item, index)'>
          <div class="duty-item">
            <img class="avatar" :src="item.photo" alt="头像" @error="getDefaultImg(item)">
            <div class="user-info">
              <div class="user-name">{{item.nickname}}</div>
              <div class="user-tel">手机: {{item.mobile}}</div>
            </div>
          </div>
          <div class="duty-item-bottom vux-1px-t">
            <div class="user-code">工号: {{item.userCode}}</div>
            <div class="user-status-part">
              <span class="user-status" :class="item.statusClass">{{item.status}}</span>
            </div>
          </div>
        </div>
      </r-scroll>
    </div>
    <add-btn :action="action" :goEdit="goEdit"></add-btn>  
  </div>
</template>

<script>
import {getAllUsers} from 'service/Directorys/userService'
import listCommon from 'pageMixins/bizListCommon'
export default {
  name: 'USER_List',
  data() {
    return {
      listStatus: [
        {name: '全部', status: ''},
        {name: '使用中', status: 1},
        {name: '未使用', status: 2},
        {name: '停用', status: -1},
      ],
      filterList: [ // 过滤列表
        {
          name: '工号',
          value: 'userCode',
        }, {
          name: '姓名',
          value: 'nickname',
        },
      ],
    }
  },
  mixins: [listCommon],
  methods: {
    // TODO 获取默认图片
    getDefaultImg(item, gender) {
      let url = gender === 1
        ? require('assets/ava01.png')
        : require('assets/ava02.png')
      if (item) {
        item.photo = url;
      }
      return url;
    },
    // TODO 页面跳转
    pathChange(item, index, path) {
      if (this.clickVisited) {
        return
      }
      // 交易号、应用名称等
      let { colId } = item,
          { name } = this.$route.query,
          { fileId, listId } = this.$route.params;
      // 新的路由地址
      let newPath = `${path}/${fileId}/${listId}`;
      // 高亮 点击过的数据
      this.clickVisited = true;
      item.visited = true;
      this.$set(this.listData, index, {...item});
      // 等待动画结束后跳转
      setTimeout(() => {
        this.clickVisited = false;
        this.$router.push({
          path: newPath,
          query: { name, colId }
        })
      }, 200)
    },
    // TODO 跳转到详情
    goDetail(item, index) {
      this.pathChange(item, index, `/detail`);
    },
    // TODO 跳转到编辑
    goUserEdit(item, index) {
      this.pathChange(item, index, `/fillform`);
    },
    // TODO 获取用户列表
    getList(noReset = false) {
      let filter = [];
      if (this.activeTab) {
        filter.push({
          operator: 'in',
          value: this.activeTab,
          property: 'status'
        })
      }
      if (this.serachVal) {
        filter = [
          ...filter,
          {
            operator: 'like',
            value: this.serachVal,
            property: this.filterProperty,
          },
        ];
      }
      return getAllUsers({
        limit: this.limit,
        page: this.page,
        start: (this.page - 1) * this.limit,
        filter: JSON.stringify(filter)
      }).then(({dataCount = 0, tableContent = []}) => {
        this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
        tableContent.forEach(item => {
          // 如没有头像 则指定默认头像
          if (!item.photo) {
            item.photo = this.getDefaultImg('', item.gender);
          }
          // 用户状态
          if(item.status){
            switch (item.status){
              case 1:
                item.status = '使用中';
                item.statusClass = 'inUse'
                break;
              case 2:
                item.status = '未使用';
                item.statusClass = 'unUse';
                break;
              case 3:
                item.status = '草稿';
                item.statusClass = 'offUse';
                break;
              case -1:
                item.status = '停用';
                item.statusClass = 'offUse';
                break;
            }
          }
        });
        this.listData = this.page === 1 ? tableContent : this.listData.concat(tableContent);
        if (!noReset) {
          this.$nextTick(() => {
            this.resetScroll();
          })
        }
        //判断最近有无新增数据
        let text = '';
        if (noReset && this.activeIndex === 0) {
          if (this.total) {
            text = dataCount - this.total === 0
              ? '暂无新数据'
              : text = `新增${dataCount - this.total}条数据`;
            this.$vux.toast.show({
              text: text,
              position: 'top',
              width: '50%',
              type: "text",
              time: 700
            })
          }
        }
        //列表总数据缓存
        if (this.activeIndex === 0 && this.page === 1) {
          sessionStorage.setItem(this.applyCode, dataCount);
        }
        this.$loading.hide();
      }).catch(e => {
        this.resetScroll();
      })
    }
  }
}
</script>

<style lang='scss' scoped>
  @import './../../scss/bizList';
  .user-list-container {
    .each_duty {
      padding: 0 .1rem;
      box-sizing: border-box;
      .icon-bianji {
        top: 50%;
        right: 0;
        width: .35rem;
        font-size: .24rem;
        text-align: center;
        position: absolute;
        transform: translateY(-50%);
      }
    }
    .duty-item {
      display: flex;
      padding: .1rem 0;
      line-height: .2rem;
      align-items: center;
      .avatar {
        width: .55rem;
        height: .55rem;
        margin-right: .1rem;
        border-radius: .08rem;
      }
      .user-info {
        .user-name {
          font-size: .16rem;
          font-weight: bold;
        }
        .user-tel {
          color: #757575;
          font-size: .12rem;

        }
      }
    }
    .duty-item-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .user-code {
        color: #757575;
        font-size: .14rem;
      }
      .user-status-part {
        font-size: .14rem;
        padding: .04rem 0;
        .user-status {
          color: #FFF;
          padding: 0 .04rem;
          border-radius: .12rem;
          &.inUse {
            background: #53d397;
          }
          &.unUse {
            background: #c7b198;
          }
          &.offUse {
            background: #474a56
          }
        }

      }

    }
  }
</style>
