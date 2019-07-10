<template>
  <!--工作日志-->
  <div class="task_log">
      <search-selector :title="'员工'"></search-selector>
  </div>
</template>

<script>
import SearchSelector from './FormSearchSelector'
export default {
  data() {
    return {
    }
  },
  components: { SearchSelector },
  methods: {
  },
  created() {
  }
}
</script>

<style lang='scss' scoped>
  
</style>
