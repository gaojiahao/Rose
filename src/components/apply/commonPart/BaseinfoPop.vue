<template>
  <div class="baseinfo_wrapper">
    <div class="baseinfo_content">
      <div class="each_info" @click="showPop = true">
        <div class="title">经办人</div>
        <div class="mode">
          <span class="mode_content">{{selItems.nickname}}</span>
          <x-icon class="r_arrow" type="ios-arrow-forward" size="18"></x-icon>
        </div>
      </div>
      <popup-picker title="经办组织" :data="groupList" :columns="1" v-model="group" @on-change="changeGroup"
                    ref="groupPicker">
        <template slot="title">
          <span class="title" :class="{required : isRequired}">经办组织
          </span>
        </template>
      </popup-picker>
      <popup-picker title="经办职位" :data="roleList" :columns="1" v-model="role" @on-change="changeRole"
                    ref="rolePicker"></popup-picker>
    </div>
    <div v-transfer-dom>
      <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
        <div class="trade_pop">
          <d-search @search="searchList" @turn-off="onHide" :isFill="true"></d-search>
          <!-- 经理列表 -->
          <r-scroll class="pop-list-container" :options="scrollOptions" :has-next="hasNext"
                    :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" ref="bScroll">
            <div class="pop-mater-list-item" :class="{selected: showSelIcon(item)}"
                 v-for="(item, index) in listData" :key='index' @click.stop="selThis(item,index)">
              <div class="pop-list-main ">
                <!-- 头像 -->
                <div class="user-photo">
                  <img :src="item.photo" alt="mater_img" @error="getDefaultImg(item)">
                </div>
                <div class="pop-list-info">
                  <!-- 名字 -->
                  <div class="user_name">{{item.nickname}}</div>
                  <!-- 用户id -->
                  <div class="user_code" v-if="item.userCode">{{item.userCode}}</div>
                </div>
              </div>
            </div>
          </r-scroll>
        </div>
      </popup>
    </div>

  </div>
</template>

<script>
  // vux 引入
  import {Icon, Popup, TransferDom, LoadMore, PopupPicker} from 'vux'
  // 请求 引入
  import {listUsers, getGroupByUserId, getRoleByUserId} from 'service/commonService'
  // 组件 引入
  import RScroll from 'components/RScroll'
  import DSearch from 'components/search'

  export default {
    name: 'BaseInfo',
    props: {
      // 默认值
      defaultValue: {
        type: Object,
        default() {
          return {}
        }
      },
      handleOrgList: {
        type: Array,
        default() {
          return []
        },
        required: true
      },
      userRoleList: {
        type: Array,
        default() {
          return []
        },
        required: true
      },
      //是否为必填项
      isRequired: {
        type: Boolean,
        default: true
      }
    },
    directives: {TransferDom},
    components: {
      Icon, Popup, RScroll, DSearch, LoadMore, PopupPicker
    },
    data() {
      return {
        page: 1,
        limit: 50,
        hasNext: true,
        scrollOptions: {
          click: true,
          pullUpLoad: true,
        },
        srhInpTx: '', // 搜索框内容
        showPop: false,
        isSetInitial: false, // 用于判断经办组织和经办部门是否设置初始值
        selItems: {}, // 哪些被选中了
        currentUser: {},
        role: [], // 选中的职位
        group: [], // 选中的组织
        listData: [], // 经办人列表
        roleList: [], // 职位列表
        groupList: [], // 组织列表
      }
    },
    watch: {
      defaultValue(val) {
        this.setDefaultValue();
      },
    },
    methods: {
      // 弹窗展示时调用
      onShow() {
        this.$nextTick(() => {
          if (this.$refs.bScroll) {
            this.$refs.bScroll.refresh();
          }
        })
      },
      // 弹窗隐藏时调用
      onHide() {
        this.showPop = false;
      },

      // 上拉加载
      onPullingUp() {
        this.page++;
        this.getlistUsers();
      },
      // 判断是否展示选中图标
      showSelIcon(sItem) {
        return `${this.selItems.userId}` === `${sItem.userId}`;
      },
      // 获取 默认图片
      getDefaultImg(item) {
        let url = item.gender === '男'
          ? require('assets/ava01.png')
          : require('assets/ava02.png');
        if (item) {
          item.photo = url;
        }
        ;
        return url;
      },
      // 选择 组织
      changeGroup(val) {
        this.selItems.handlerUnitName = val[0];
        this.groupList.forEach(item => {
          if (item.name === val[0]) {
            this.selItems.handlerUnit = item.userGroupId;
            return false;
          }
        });
        let emitObj = {
          handler: this.selItems.userId,
          handlerName: this.selItems.nickname,
          handlerUnit: this.selItems.handlerUnit,
          handlerUnitName: this.selItems.handlerUnitName,
          handlerRole: this.selItems.handlerRole,
          handlerRoleName: this.selItems.handlerRoleName,
        };
        this.$emit('sel-item', emitObj);
      },
      // 选择 职位
      changeRole(val) {
        this.selItems.handlerRoleName = val[0];
        this.roleList.forEach(item => {
          if (item.name === val[0]) {
            this.selItems.handlerRole = item.userGroupId;
            return false;
          }
        });
        let emitObj = {
          handler: this.selItems.userId,
          handlerName: this.selItems.nickname,
          handlerUnit: this.selItems.handlerUnit,
          handlerUnitName: this.selItems.handlerUnitName,
          handlerRole: this.selItems.handlerRole,
          handlerRoleName: this.selItems.handlerRoleName,
        };
        this.$emit('sel-item', emitObj);
      },
      // 选择 经办人
      selThis(sItem, sIndex) {
        this.isSetInitial = true;
        this.showPop = false;
        this.selItems = sItem;
        this.getNewHandleORG();
        this.getNewUserRole();
      },
      // 搜索 经办人
      searchList({val = ''}) {
        this.srhInpTx = val;
        this.listData = [];
        this.page = 1;
        this.hasNext = true;
        this.getlistUsers();
      },
      // 请求 经办人列表
      getlistUsers() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: 'nickname',
            }
          ];
        }
        ;
        return listUsers({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
        }).then(({dataCount = 0, tableContent = []}) => {
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.listData = this.page === 1 ? tableContent : [...this.listData, ...tableContent];
          this.$nextTick(() => {
            this.$refs.bScroll.finishPullUp();
          })
        });
      },
      // 设置默认值
      setDefaultValue() {
        this.selItems = this.defaultValue
          ? {
            ...this.defaultValue,
            userId: this.defaultValue.handler,
            nickname: this.defaultValue.handlerName
          }
          : {};
        this.group = [this.selItems.handlerUnitName];
        this.role = [this.selItems.handlerRoleName];
        this.defaultORG();  // 默认 经办组织
        this.defaultUserRole(); // 默认 经办职位
      },
      // 默认（传入）经办组织
      defaultORG() {
        this.groupList = [];
        this.handleOrgList.forEach(item => {
          this.groupList.push({
            ...item,
            name: item.userGroupName,
            value: item.userGroupName,
          })
        });
      },
      // 默认（传入）经办职位
      defaultUserRole() {
        this.roleList = [];
        this.userRoleList.forEach(item => {
          this.roleList.push({
            ...item,
            name: item.userGroupName,
            value: item.userGroupName,
          })
        });
      },
      // 当经办人更换时，重新请求 经办组织
      getNewHandleORG() {
        return getGroupByUserId(this.selItems.userId).then(({tableContent = []}) => {
          this.group = [];
          this.groupList = [];
          tableContent.forEach(item => {
            this.groupList.push({
              ...item,
              name: item.userGroupName,
              value: item.userGroupName,
            })
          });
          if (tableContent.length && this.isSetInitial) {
            this.group = [tableContent[0].userGroupName];
            this.selItems.handlerUnit = tableContent[0].userGroupId;
          }
          ;
        })
      },
      // 当经办人更换时，重新请求 经办职位
      getNewUserRole() {
        return getRoleByUserId(this.selItems.userId).then(({tableContent = []}) => {
          this.role = [];
          this.roleList = [];
          tableContent.forEach(item => {
            this.roleList.push({
              ...item,
              name: item.userGroupName,
              value: item.userGroupName,
            })
          });
          if (tableContent.length && this.isSetInitial) {
            this.role = [tableContent[0].userGroupName];
            this.selItems.handlerRole = tableContent[0].userGroupId;
          }
          ;
        })
      }
    },
    created() {
      this.getlistUsers();
      this.setDefaultValue();
    }
  }
</script>

<style scoped lang="scss">
  @import '~@/scss/color';

  .baseinfo_wrapper {
    width: 95%;
    margin: .1rem auto;
    background: #fff;
    box-sizing: border-box;
    padding: .06rem .1rem;
    .baseinfo_content {
      .each_info {
        display: flex;
        font-size: .14rem;
        align-items: center;
        justify-content: space-between;
        padding: .05rem 0;
        .title {
          font-weight: bold;
          color: #5077aa;
        }
        .mode {
          font-weight: 500;
          display: flex;
          align-items: center;
          position: relative;
          .mode_content {
            color: #111;
            margin-right: 13px;
          }
          .iconfont {
            font-weight: bold;
            font-size: .14rem;
          }
          .r_arrow {
            right: -5px;
            fill: #C8C8CD;
            position: absolute;
            top: .02rem;
          }
        }
      }
      /deep/ .weui-cell {
        display: flex;
        padding: .05rem 0;
        position: relative;
        align-items: center;
        .title {
          font-size: .14rem;
          color: #757575;
          &.required {
            font-weight: bold;
            color: #5077aa;
          }
        }
        &.before {
          border: none;
        }
        .weui-label {
          color: #757575;
          font-size: .14rem;
        }
        .vux-cell-value {
          color: #111;
          font-size: .14rem;
        }
        .weui-cell__ft {
          padding-right: 13px;
          position: relative;
          &:after {
            content: " ";
            display: inline-block;
            height: 6px;
            width: 6px;
            border-width: 2px 2px 0 0;
            border-color: #C8C8CD;
            border-style: solid;
            -webkit-transform: matrix(0.71, 0.71, -0.71, 0.71, 0, 0);
            -ms-transform: matrix(0.71, 0.71, -0.71, 0.71, 0, 0);
            transform: matrix(0.71, 0.71, -0.71, 0.71, 0, 0);
            position: absolute;
            top: 50%;
            margin-top: -4px;
            right: 2px;
          }
        }
      }
      .vux-cell-box:not(:first-child):before {
        border: none;
      }
    }
  }

  // 弹出层
  .trade_pop_part {
    background: #fff;
    .trade_pop {
      height: 100%;
      overflow: hidden;
      // 顶部
      .title {
        position: relative;
        margin: .08rem 0;
        font-size: .2rem;
      }
      .each_mode {
        margin-right: .1rem;
        display: inline-block;
        padding: .04rem .2rem;
      }
      // 列表容器
      .pop-list-container {
        width: 100%;
        overflow: hidden;
        box-sizing: border-box;
        height: calc(100% - .46rem);
        /deep/ .scroll-wrapper {
          padding: .05rem .15rem 0;
        }
        // 列表项
        .pop-mater-list-item {
          position: relative;
          display: flex;
          padding: .15rem;
          margin-bottom: .2rem;
          border-radius: .04rem;
          color: #333;
          box-sizing: border-box;
          box-shadow: 0 2px 10px 0 rgba(228, 228, 232, 0.5);
          &.selected {
            border: 1px solid $main_color;
          }
          // 列表主体
          .pop-list-main {
            flex: 1;
            box-sizing: border-box;
            display: flex;
            //头像
            .user-photo {
              width: .4rem;
              height: .4rem;
              margin-right: .12rem;
              img {
                border-radius: 50%;
                width: 100%;
                height: 100%;
              }
            }
            .user_name {
              line-height: .16rem;
              font-size: .16rem;
              font-weight: 600;
            }
            .user_code {
              margin-top: .12rem;
              line-height: .12rem;
              color: #999;
              font-size: .12rem;
            }
          }
        }
      }

    }
  }

</style>
