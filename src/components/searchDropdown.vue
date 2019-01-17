<template>
  <div class="r-dropdown">
    <!-- <div class="r-dropdown-value">
      <span class="value">{{selItem.name}}</span>
      <x-icon type="ios-arrow-down" :class="{'arrow-up': showDrop}" size="14"></x-icon>
    </div> -->
    <ul class="r-dropdown-list">
       <li class="r-dropdown-item" :class="{'selected': selItem.value === item.value}" v-for="(item, index) in list"
          @click.stop="dropItemClick(item)" :key="index">
        <span>{{item.name}}</span>
        <span class="icon-check icon-selected" v-show="selItem.value === item.value"></span>
      </li>
      <!-- <li class="r-dropdown-item" :class="{'vux-1px-b': index !== list.length - 1}" v-for="(item, index) in list"
          @click.stop="dropItemClick(item)" :key="index">
        <span>{{item.name}}</span>
        <icon class="icon-selected" type="success-no-circle" v-show="selItem.value === item.value"></icon>
      </li> -->
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
    },
    components: {
      Icon,
    },
    data() {
      return {
        selItem: {},
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
      // TODO 选择单条记录
      dropItemClick(item) {
        this.selItem = {...item};
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
    width: 100%;
    padding: .05rem .15rem;
    background: #fff;
    box-sizing: border-box;
    opacity: 1;
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
        color: #3296FA;
      }
    }
  }
</style>
