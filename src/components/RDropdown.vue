<template>
  <div class="r-dropdown" @click.stop="dropClick">
    <div class="r-dropdown-value">
      <span class="value">{{selItem.name}}</span>
      <x-icon type="ios-arrow-down" :class="{'arrow-up': showDrop}" size="14"></x-icon>
    </div>
    <ul class="r-dropdown-list" v-show="showDrop">
      <li class="r-dropdown-item" :class="{'vux-1px-b': index !== list.length - 1}" v-for="(item, index) in list"
          @click.stop="dropItemClick(item)" :key="index">
        <span>{{item.name}}</span>
        <icon class="icon-selected" type="success-no-circle" v-show="selItem.value === item.value"></icon>
      </li>
    </ul>
  </div>
</template>

<script>
  import {Icon} from 'vux'

  export default {
    name: "RDropdown",
    props: {
      list: {
        type: Array,
        default() {
          return []
        }
      },
      show: {
        type: Boolean,
        default: false
      }
    },
    components: {
      Icon,
    },
    data() {
      return {
        showDrop: false,
        selItem: {},
      }
    },
    watch: {
      show: {
        handler(val) {
          this.showDrop = val;
        },
        immediate: true
      },
      list: {
        handler() {
          this.selItem = this.list[0];
          this.$emit('on-selected', this.selItem);
        },
        immediate: true
      },
    },
    methods: {
      // TODO 点击展示下拉框
      dropClick() {
        this.showDrop = !this.showDrop;
      },
      // TODO 选择单条记录
      dropItemClick(item) {
        this.selItem = {...item};
        this.showDrop = false;
        this.$emit('on-selected', this.selItem);
      },
    },
    created() {
    }
  }
</script>

<style scoped lang="scss">
  .vux-1px-b:after {
    border-color: #e8e8e8;
  }

  .r-dropdown {
    position: relative;
    width: 100%;
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

    /* 列表容器 */
    .r-dropdown-list {
      position: absolute;
      left: 0;
      top: 100%;
      z-index: 100;
      padding: 0 .1rem;
      width: 1.2rem;
      // text-align: center;
      border-bottom-left-radius: .08rem;
      border-bottom-right-radius: .08rem;
      background-color: #FFF;
      box-shadow: 0 2px 10px #e8e8e8;
      box-sizing: border-box;
    }
    /* 列表项 */
    .r-dropdown-item {
      position: relative;
      line-height: .4rem;
      font-size: .16rem;
      .weui_icon_success-no-circle {
        top: 50%;
        right: 0;
        font-size: .16rem;
        position: absolute;
        transform: translateY(-50%);
      }
    }
  }
</style>
