<template>
  <div class="pages">
    <div class="list_top">
      <search class="search"></search>
    </div>
    <div class="todo_msg">
      <div class="msg_top">
        
      </div>
    </div>
  </div>
</template>

<script>
import search from 'components/search'
export default {
  components: {
    search
  }
}
</script>

<style lang='scss' scoped>
.list_top {
  padding: .1rem 0;
}


</style>
