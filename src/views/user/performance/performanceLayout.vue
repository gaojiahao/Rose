<template>
    <div  style="height:100%;">
        <slot name="nav" ></slot>
      <router-view></router-view>

    </div>
</template>

<script>
export default {
    name:"PerformanceLayout",
}
</script>