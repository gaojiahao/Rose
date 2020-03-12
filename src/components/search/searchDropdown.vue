<template>
  <div class="r-dropdown">
    <ul class="r-dropdown-list">
      <li class="r-dropdown-item" :class="{'selected': selItem.value === item.value}" v-for="(item, index) in list"
          @click.stop="dropItemClick(item)" :key="index" v-show="index < 5">
        <span>{{item.name}}</span>
        <span class="icon-check icon-selected" v-show="selItem.value === item.value"></span>
      </li>
      <li class="r-dropdown-item" :class="{'selected': selItem.value === item.value}" v-for="(item, index) in list"
          @click.stop="dropItemClick(item)" :key="`m${index}`" v-show="showMore && (index > 4)">
        <span>{{item.name}}</span>
        <span class="icon-check icon-selected" v-show="selItem.value === item.value"></span>
      </li>
      <li class="r-dropdown-item r-dropdown-more" v-show="list.length > 4">
        <span class="text" @click="clickMore()">{{showMore ? '收起' : '更多'}}</span>
      </li>
    </ul>
  </div>
</template>

<script>
  import {Icon} from 'vux'

  export default {
    name: "search-dropdown",
    props: {
      list: {
        type: Array,
        default() {
          return []
        }
      },
    },
    components: {
      Icon,
    },
    data() {
      return {
        selItem: {},
        showMore: 0,
      }
    },
    watch: {
      list: {
        handler() {
          this.selItem = this.list[0];
          this.$emit('on-selected', this.selItem);
        },
        immediate: true
      },
    },
    methods: {
      // 选择单条记录
      dropItemClick(item) {
        this.selItem = {...item};
        this.$emit('on-selected', this.selItem);
      },
      clickMore(){
        this.showMore = this.showMore ? 0:1;
      }
    },
  }
</script>

<style scoped lang="scss">
  .vux-1px-b:after {
    border-color: #e8e8e8;
  }
  .r-dropdown {
    width: 100%;
    padding: .05rem .15rem;
    background: #fff;
    box-sizing: border-box;
    opacity: 1;
    overflow-y: scroll;
    /* 选中值 */
    .r-dropdown-value {
      width: 100%;
      display: flex;
      color: #454545;
      font-size: .12rem;
      font-weight: bold;
      align-items: center;
      box-sizing: border-box;
      justify-content: center;
    }

    /* 倒三角 */
    .vux-x-icon-ios-arrow-down {
      transition: transform 200ms linear;
      &.arrow-up {
        transform: rotate(-180deg);
      }
    }
    /* 列表项 */
    .r-dropdown-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      line-height: .34rem;
      color: #696969;
      // 选中的icon
      .icon-check {
        width: .14rem;
        height: .14rem;
      }
      // 选中状态
      &.selected {
        @include font_color();
      }
    }
    .r-dropdown-more{
      width: 100%;
      .text{
        width: 33.33333%;
        text-align: center;
        margin-left: 33.33333%;
        font-size: .12rem;
      }
    }
  }
</style>
