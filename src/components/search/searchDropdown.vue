<template>
  <div class="r-dropdown" :class="{'type':showMore}">
    <ul class="r-dropdown-list" :class="{'height':showMore}" ref="fill">
      <template v-for="(item, index) in list">
        <li class="r-dropdown-item" :class="{'selected': selItem[item.value]&&(selItem[item.value]['value']==item.value)}"
            @click.stop="dropItemClick(item)" :key="index" v-show="index < 5">
          <span>{{item.name}}</span>
          <span class="icon-check icon-selected" v-show="selItem[item.value]&&(selItem[item.value]['value']==item.value)"></span>
        </li>
      </template>
      <template v-for="(item, index) in list">
        <li class="r-dropdown-item" :class="{'selected': selItem[item.value]&&(selItem[item.value]['value']==item.value)}"
            @click.stop="dropItemClick(item)" :key="`m${index}`" v-show="showMore && (index > 4)">
          <span>{{item.name}}</span>
          <span class="icon-check icon-selected" v-show="selItem[item.value]&&(selItem[item.value]['value']==item.value)"></span>
        </li>
      </template>
      <li class="r-dropdown-item r-dropdown-more" v-show="list.length > 4">
        <span class="text" @click="clickMore()">{{showMore ? '收起' : '更多'}}</span>
      </li>
    </ul>
  </div>
</template>

<script>
  import {Icon} from 'vux'
  import Bscroll from "better-scroll";

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
        showMore: false,
      }
    },
    watch: {
      list: {
        handler() {
          if(this.list[0]&&this.list[0].value){
            this.selItem[this.list[0].value] = this.list[0];
            this.$emit('on-selected', this.selItem);
          }
        },
        immediate: true
      },
    },
    methods: {
      // 选择单条记录
      dropItemClick(item) {
        if(this.selItem[item.value]&&(this.selItem[item.value]['value']==item.value)){
          this.$delete(this.selItem,item.value);
          this.$emit('on-selected', this.selItem);
          return ;
        }
        this.$set(this.selItem,item.value,item);
        this.$emit('on-selected', this.selItem);
      },
      clickMore(){
        this.$nextTick(() => {
          debugger
          this.showMore = this.showMore ? false:true;
        });  
      }
    },
    created() {
      this.$nextTick(() => {
        this.fillBscroll = new Bscroll(this.$refs.fill, {
          click: true
        });
      });  
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
    overflow-y: scroll;
    .height{
      height:calc(100% - 1.02rem)
    }
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
  .type{
    height: 100%;
  }
</style>
