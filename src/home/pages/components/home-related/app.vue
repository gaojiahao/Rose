 <template>
   <div v-if="app.text" :class="cls" @click="$emit('app-click')">
        <div class="app_img">
        <img :src='app.icon' @error="getDefaultIcon(app)">
        </div>
        <div class="app_info vux-1px-b">
        <div class="app_name">{{app.text}}</div>
        <div class="app_detail_btn" @click.stop="goAppDetail(app.listId)">应用详情</div>
        </div>
    </div>
</template>
<script>
export default {
    props:['app','cls'],
    methods:{
        // 设置默认图片
        getDefaultIcon(app) {
            let url = require("assets/defaultApp.png");
            if (app) {
                app.icon = url;
            }
            return url;
        },
        goAppDetail(listId) {
            this.$router.push({ path: `/appDetail/${listId}` });
        }
    }
}
</script>