<template>
  <div class='childPage'>
    <div class='detail_content'>
      <div class='mater_baseinfo vux-1px-b'>
        <div class='mater_property'>
          <div class='each_property vux-1px-b'>
            <label>公司名称:</label>
            <div class='property_val'>{{CompanyInfo.groupName}}</div>
          </div>
          <div class='each_property'>
            <label>公司简称:</label>
            <div class='property_val'>{{CompanyInfo.groupShortName}}</div>
          </div>
        </div>
        <div class='mater_pic vux-1px-l'>
          <div class='add_icon'>
            <label for="file"></label>
            <img :src='CompanyInfo.groupPic' class='upload' @error="getDefaultImg"/>
          </div>
        </div>
      </div>
      <div class='each_property vux-1px-b'>
        <label>公司类型:</label>
        <div class='property_val'>{{CompanyInfo.companyType}}</div>
      </div>
      <div class='each_property vux-1px-b'>
        <label>公司状态:</label>
        <div class='property_val'>
           {{CompanyInfo.status}}
        </div>
      </div>
      <div class='each_property vux-1px-b'>
        <label>创建者:</label>
        <div class='property_val'>
           {{CompanyInfo.creator || "无"}}
        </div>
      </div>
      <div class='each_property vux-1px-b'>
        <label>创建时间:</label>
        <div class='property_val'>
           {{CompanyInfo.crtTime || "无"}}
        </div>
      </div>
      <div class='each_property vux-1px-b' v-if="CompanyInfo.modifier">
        <label>修改者:</label>
        <div class='property_val'>
           {{CompanyInfo.modifier || "无"}}
        </div>
      </div>
      <div class='each_property vux-1px-b' v-if="CompanyInfo.modTime">
        <label>修改时间:</label>
        <div class='property_val'>
           {{CompanyInfo.modTime || "无"}}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 接口引入
import { CompanyInfo } from 'service/Directorys/companyService'
// mixins 引入
import detailCommon from 'components/mixins/detailCommon'
export default {
  data(){
    return{
      MatPic: '',
      CompanyInfo: {}
    }
  },
  mixins: [detailCommon],
  methods: {
    // 默认图片
    getDefaultImg() {
      this.CompanyInfo.groupPic = require('assets/contact_default02.png');
    },
    loadPage() {
      let {groupId = ''} = this.$route.query;
      if(!groupId){
        this.$vux.alert.show({
          content: '抱歉，有误，请尝试刷新之后再次进入'
        });
        return;      
      }
      this.$loading.show();
      return CompanyInfo(groupId).then( data => {
        let [info = {}] = data;
        let status = ['', '使用中', '未使用', '草稿'];
        info.status = status[info.status] || '停用';
        this.CompanyInfo = info;
        this.$loading.hide();
      })    
    }
  }
}
</script>

<style lang='scss' scoped>
@import './../../scss/bizDetail';
</style>
