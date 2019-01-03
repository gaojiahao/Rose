<template>
  <div class="pages user-list-container" :class="{'no-add': !action.add}" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search='searchList'></searchIcon>
        <div class="filter_part">
          <tab :line-width='2' default-color='#333' active-color='#3296FA'>
            <tab-item v-for="(item, index) in listStatus" :key="index" :selected="index === activeIndex"
                      @on-item-click="tabClick(item, index)">{{item.name}}
            </tab-item>
          </tab>
        </div>
      </div>
      <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <div class="list-item-wrapper" :class="{visited: item.visited}" v-for="(item, index) in listData" :key="index"
             @click='goDetail(item, index)'>
          <div class="list-img-wrapper">
            <img class="list_item_img" :src="item.photo" alt="user-img" @error="getDefaultImg(item)">
            <i class="icon" :class="[item.gender === 1 ? 'icon-male' : 'icon-female']"></i>
          </div>
          <div class="list_info_wrapper">
            <div class="list_header">
              <div class="list_header_left">
                <span class="list_name">{{item.nickname}}</span>
                <span class="list_type" :class="{temporary: item.userType === 0}">{{item.userTypeText}}</span>
              </div>
              <span class="list_status" :class="item.statusClass">{{item.status}}</span>
            </div>
            <div class="list_detail">
              <div class="list_detail_item">
                <span class="list_detail_title">手机：</span>
                <span class="list_detail_value">{{item.mobile}}</span>
              </div>
              <div class="list_detail_item">
                <span class="list_detail_title">工号：</span>
                <span class="list_detail_value">{{item.userCode}}</span>
              </div>
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
          : require('assets/ava02.png');
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
        let {colId} = item,
          {name} = this.$route.query,
          {fileId, listId} = this.$route.params;
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
            query: {name, colId}
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
            let genders = ['女', '男'];
            let status = ['', '使用中', '未使用', '草稿'];
            let userTypes = ['临时账户', '长期有效'];
            item.genderText = genders[item.gender] || '未知';
            item.status = status[item.status] || '停用';
            item.userTypeText = userTypes[item.userType];
            this.setStatus(item);
            // 如没有头像 则指定默认头像
            if (!item.photo) {
              item.photo = this.getDefaultImg('', item.gender);
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
      },
      // TODO 设置状态的class
      setStatus(item) {
        switch (item.status) {
          case '使用中':
            item.statusClass = 'duty_done_c';
            break;
          default:
            item.statusClass = 'duty_fall_c';
        }
      },
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizList';
  @import '~@/scss/color';

  .list-item-wrapper {
    display: flex;
    margin: .1rem;
    padding: .15rem;
    width: calc(100% - .2rem);
    border-radius: 4px;
    background-color: #fff;
    color: #333;
    transition: background-color 200ms linear;
    box-sizing: border-box;
    box-shadow: 0 2px 10px 0 rgba(228, 228, 232, 0.5);
    &.visited {
      background-color: $list_visited;
    }
    .duty_done_c {
      color: #333;
    }
    .duty_fall_c {
      color: #999;
    }

    .list-img-wrapper {
      position: relative;
      width: .5rem;
      height: .5rem;
      .list_item_img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
      .icon {
        position: absolute;
        top: 100%;
        right: 0;
        z-index: 1;
        display: inline-block;
        width: .14rem;
        height: .14rem;
        transform: translate(0, -70%);
      }
    }

    .list_info_wrapper {
      flex: 1;
      margin-left: .13rem;
    }
    .list_header {
      display: flex;
      justify-content: space-between;
      .list_header_left {
        display: flex;
        align-items: center;
      }
      .list_name {
        line-height: .14rem;
        font-size: .14rem;
        font-weight: 600;
      }
      .list_type {
        display: inline-block;
        margin-left: .08rem;
        padding: .04rem .05rem;
        line-height: .12rem;
        border-radius: .1rem;
        background-color: rgba(41, 157, 255, .1);
        color: rgba(41, 157, 255, 1);
        font-size: .12rem;
        /* 临时有效 */
        &.temporary {
          background-color: rgba(250, 113, 56, .1);
          color: rgba(250, 113, 56, 1);
        }
      }
      .list_status {
        line-height: .12rem;
        font-size: .12rem;
      }
    }
    .list_detail {
      margin-top: .12rem;
      line-height: .12rem;
      font-size: .12rem;
    }
    .list_detail_item {
      margin-top: .12rem;
      & + .list_detail_item {
        margin-top: .08rem;
      }
    }
    .list_detail_title {
      color: #999;
    }
  }
</style>
