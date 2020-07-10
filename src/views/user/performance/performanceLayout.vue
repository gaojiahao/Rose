<template>
    <div  class="page-hasTab me">
        <slot name="nav" ></slot>
      <router-view></router-view>
    </div>
</template>

<script>
export default {
    name:"PerformanceLayout",
}
</script>
<style>
.me .scroll-container{
    height: 100%;
}
</style>