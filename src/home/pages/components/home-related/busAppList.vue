<template>
  <div class="app-part">
      <app-folder :item="item" v-for="(item, inx) in BusApps" :key='inx'/>
  </div>
</template>
<script>
import appFolder from './appFolder';
let swiper;
export default {
  components: {appFolder},
  props:{
    BusApps: {
      type: Array,
      default: []
    }
  }
}
</script>
