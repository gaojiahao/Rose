 <template>
   <div v-if="app.text" :class="cls" @click="goList()">
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
import basicMap from "homePage/apps/basicApp/maps/basic";
export default {
    props:['app','cls','folder'],
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
        },
        goList() {
            var folder = this.folder||null,
                app = this.app,
                fileName = app.packagePath||null,
                name = app.text||null,
                listId = app.listId,
                url = app.url||'',
                path;

            if(listId == null && url.indexOf('list/') == 0){
                listId = url.substr(5);
            }
            path = basicMap[listId];
            if(path){
                this.$router.push({ name: path,params: {listId:listId}});
            } else{
                this.$router.push({
                    path: `/list/${folder}/${fileName}`,
                    query: { name, listId }
                });
            }
        }
    }
}
</script>