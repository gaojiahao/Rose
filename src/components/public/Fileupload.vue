<template>
  <div class="upload-file-container" :class="{'no-upload vux-1px-t':cfg.readOnly}" :style="containStyle"
       v-if="values.length|| cfg.readOnly == false" ref="uContainer">
    <header class="upload-file-header">
      <div class="upload-file-title vux-1px-l">附件</div>
    </header>
    <div class="upload-file-list">
      <div class="upload-file-text" v-for="(item, index) in comFiles" :key="item.attr1+index">
        <template v-if="item.iconType != 'image'&&item.iconType != 'video'&&item.iconType != 'music'">
          <div class="text" @click="downLoadFile(item)">{{item.attr1}}</div>
          <i class="iconfont icon-shanchu" @click="deleteFile(item)" v-if="cfg.readOnly == false"></i>
        </template>
        <template v-else-if="item.iconType == 'video'||item.iconType == 'music'">
          <div class="text" @click="playVideo(item)">{{item.attr1}}</div>
          <i class="iconfont icon-shanchu" @click="deleteFile(item)" v-if="cfg.readOnly == false"></i>
        </template>  
      </div>
      <div class="upload-file-item" v-for="(item, index) in imgFiles" :key="item.attr1+index">
        <template v-if="item.iconType === 'image'">
          <img preview="1"  @click="downLoadFile(item)" @click.stop="preview(item,index)" class="img"
               :src="formatImgUrl(item)">
        </template>
        <i class="iconfont icon-shanchu" @click="deleteFile(item)" v-if="cfg.readOnly == false"></i>
      </div>
      <input @change="commUploadFile()" type="file" ref="uFile" accept="*/*" v-show="false" multiple/>
      <div class="upload-file-item" @click="dealUploadDev" v-show="cfg.readOnly == false">
        <div class="icon_container">
          <span class="icon-upload-add"></span>
          <span>添加附件</span>
        </div>
      </div>
    </div>
    <div class="grid-detail-wrapper" v-if="playerShow">
      <player-pop v-model="playerShow" :playerSrc="`/H_roleplay-si/ds/download?url=${playerSrc}`"></player-pop>
    </div>
    <div class="zhezhao-wrapper" v-show="uploadStatus">
      <div class="zhezhao-wrapper-container" ref="zContainer">
        <load-more :tip="`上传中`"></load-more>
      </div>
    </div>

  </div>
</template>

<script>
  import Vue from 'vue';
  import {deleteFile,upload} from 'service/commonService';
  import {chooseImage, uploadImage} from 'plugins/wx/api'
  import {isIOS,isIPhone,isIPad,isAndroid,isPC,isQYWX} from '@/plugins/platform/index'
  import { debug } from 'util';
  import util from '@/common/util';
  import { LoadMore } from 'vux'

  var component = {
    props: {
      // input框的Id
      id: {
        type: String,
        default: 'upload-file'
      },
      containStyle: {//容器样式
        type: Object,
        default() {
          return {}
        }
      },
      titleStyle: {//标题样式
        type: Object,
        default() {
          return {}
        }
      },
      values: {
        type: Array,
        default() {
          return {}
        }
      },
      cfg: {
        type: Object,
        default() {
          return {}
        }
      },
    },
    computed: {
      // 计算属性的 getter
      imgList: function () {
        var a = [];
        this.imgFiles.map(i=>{
          var baseUrl = window.baseURL||'',
            url =`${baseUrl}/H_roleplay-si/ds/download?url=${i.attacthment}&width=800&height=400`;
          a.push({
            src:url,
            title:i.attacthment
          });
        });
        return a;
      }
    },
    components: { LoadMore },
    data() {
      return {
        files: [],
        file: null,
        biReferenceId:null,
        showLoading: false,
        imgFiles:[],
        comFiles:[],
        playerShow: false,
        playerSrc:'',
        uploadStatus:false,
      }
    },
    watch: {
      values: {
        handler(val){
          var arr = [];
          arr = val.map(item => {
            return {
              ...item,
              iconType: this.judgeFileType(item.attr1),
            }
          });
          this.dealFilesType(arr);
          this.biReferenceId = this.$parent.$parent.biReferenceId;
        }
      }
    },
    methods: {
      formatImgUrl(item){
         var baseUrl = window.baseURL||'',
            url =`${baseUrl}/H_roleplay-si/ds/download?url=${item.attacthment}&width=400&height=400`;
          return url;
      },
      dealUploadDev() {
        if(isQYWX) {
          //this.chooseFile();
          this.clickUpload();
        } else if (isIOS || isIPhone || isIPad || isAndroid || isPC) {
          this.clickUpload();
        } else this.clickUpload();
      },
      // 选择图片
      chooseFile() {
        let me = this,
          options = {
          count: 5, // 默认9
          defaultCameraMode: 'batch', //表示进入拍照界面的默认模式，目前有normal与batch两种选择，normal表示普通单拍模式，batch表示连拍模式，不传该参数则为normal模式。（注: 用户进入拍照界面仍然可自由切换两种模式）
        };
        chooseImage(options).then(async localIds => {
          var l = localIds.length,
              i,
              localId;

          if(l) {
            me.upload(localIds[0],()=>{
              for(i = 1;i < l; i++){
                localId = localIds[i];
                me.upload(localId);
              }
            });
          }
        });
      },
      // 设置默认值
      setDefault() {
        let files = [];
        files = this.values.map(item => {
          return {
            ...item,
            iconType: this.judgeFileType(item.attr1),
          }
        });
        this.dealFilesType(files);
      },
      // 判断图片类型
      judgeFileType(url) {
        let type = 'other';
        let typeList = [
          {
            reg: /\.(png|jpg|jpeg|gif|bmp|)$/gi,
            type: 'image'
          }, {
            reg: /\.xlsx$/gi,
            type: 'excel'
          }, {
            reg: /\.(doc|docx)$/gi,
            type: 'word'
          }, {
            reg: /\.(ppt|pptx)$/gi,
            type: 'ppt'
          }, {
            reg: /\.txt$/gi,
            type: 'txt'
          }, {
            reg: /\.(mp4|webm|ogg|avi|bmp|)$/gi,
            type: 'video'  
          },
          {
            reg: /\.(mp3)$/gi,
            type: 'music'  
          }
        ];
        typeList.every(item => {
          if (item.reg.test(url)) {
            type = item.type;
            return false
          }
          return true
        });
        return type
      },
      // 获取预览图片链接
      getImgUrl(item) {
        return `${location.origin}/H_roleplay-si/ds/download?url=${item.attacthment}`
      },
      // 放大图片预览
      preview(item,index) {
        if (item.iconType === 'image') {
          // this.$refs.previewer.show(index)
          // let images = this.files.reduce((arr, image) => {
          //   if (image.iconType === 'image') {
          //     arr.push(this.getImgUrl(image));
          //   }
          //   return arr
          // }, []);
          // let imgUrl = this.getImgUrl(item);
          // wx.previewImage({
          //   current: imgUrl, // 当前显示图片的http链接
          //   urls: images // 需要预览的图片http链接列表
          // });
        }
      },
      //下载文件
      downLoadFile(item){
        if(item.iconType != 'image'){
           util.down({
             id:item.id,
             content:item.attr1
           },(isLoaded,percent)=>{
              if(isLoaded == true){
                  this.loading = false;
                  this.percent = 100;
              } else {
                  this.percent = percent;
              }
          });
        }
      },
      // 删除文件
      deleteFile(item) {
        this.$vux.confirm.show({
          content: '确定删除？',
          onConfirm: () => {
            deleteFile(item.id).then(({success = true, message = ''}) => {
              if (success) {
                if(item.iconType=='image'){
                  let idx = this.imgFiles.findIndex(fItem => fItem.id === item.id);
                  if (idx !== -1) {
                    this.imgFiles.splice(idx, 1);
                  }
                } else {
                  let idx = this.comFiles.findIndex(fItem => fItem.id === item.id);
                  if (idx !== -1) {
                    this.comFiles.splice(idx, 1);
                  }
                }
              }
            })
          },
        })
      },
      //模拟文件上传事件
      clickUpload() {
        this.$refs.uFile.dispatchEvent(new MouseEvent('click'));
      },
      //通用上传文件
      commUploadFile() {
        var files = this.$refs.uFile.files,
            l = files.length,
            file,
            vm = this,
            i,
            textBlankType='',
            textBlankSize='',
            arrFiles = [];

        if(!files.length) {
          return false;
        }
        if(l) {
          for(i = 0;i < l; i++){
            if(!checkType(files[i].name)) {
              textBlankType = textBlankType + files[i].name + ',' + '</br>';
              vm.$vux.toast.show({
                text:textBlankType + '不符合的文件上传格式！',
                position:'middle',
                type:'warn',
                width:'15em',
                time:3000
              })
              continue;
            }
            if(!checkFileSize(files[i].size)) {
              textBlankSize = textBlankSize + files[i].name + ',' + '</br>';
              vm.$vux.toast.show({
                text:textBlankSize + '上传大小不能超过1G！',
                position:'middle',
                type:'warn',
                width:'15em',
                time:3000
              })
              continue;  
            }
            arrFiles.push(files[i]);
          }
          if(arrFiles.length){
            var height = (this.$refs.uContainer.clientHeight);
            height = height+(height/2);
            this.$refs.zContainer.style.marginTop = `${height}px`;
            this.uploadStatus = true;
            handler(arrFiles[0],function(){
              for(i = 1;i < arrFiles.length; i++){
                file = arrFiles[i];
                handler(file);
              }
            });
          }
          this.uploadSuccess();
        }

        function handler(file,cb){
          upload({
              file: file,
              biReferenceId: vm.biReferenceId,
          }).then(({data = [], success = true, message = ''}) => {
            if(success) {
              let detail = {
                    attacthment: data[0].attacthment,
                    attr1: data[0].attr1,
                    attr2: data[0].attr2,
                    iconType: vm.judgeFileType(data[0].attr1),
                    id: data[0].id,
                    biReferenceId: data[0].biReferenceId,
                    status: 1,
                  };
              vm.uploadSuccess(detail);
              vm.uploadStatus = false;
              if(cb)cb();
            }
          });
        }
        //文件类型校验
        function checkType(fileName) {
          var reg = /\.(png|jpg|jpeg|gif|bmp|xlsx|xls|doc|docx|ppt|pptx|txt|psd|mp3|mp4|rar|zip|pdf|)$/gi;
          if (reg.test(fileName)) {     
            return true;
          } else {
            return false;
          }
        }
        //文件大小校验
        function checkFileSize(filesize) {
          if(filesize > 1073741824) {
            return false
          } else return true;
        }
      },
      // 上传文件
      upload(localId,cb) {
        return uploadImage({
          localId,
          biReferenceId: this.biReferenceId,
        }).then(data => {
          let [detail = {}] = data;
          detail.iconType = this.judgeFileType(detail.attr1);
          this.uploadSuccess(detail);
          if(cb)cb();
        });
      },
      uploadSuccess:function(detail){
        if(detail){
          if(detail.iconType == 'image'){
            this.imgFiles.push(detail);
          } else {
            this.comFiles.push(detail);
          }
          this.biReferenceId = this.biReferenceId ? this.biReferenceId:detail.biReferenceId;
          this.form.$emit('on-upload', {
            biReferenceId: detail.biReferenceId,
          });
        }
        this.$refs.uFile.value = '';
      },
      dealFilesType(files){
        for(var i = 0; i < files.length; i++){
          if(files[i].iconType == 'image') {
            this.imgFiles.push(files[i]);
          } else {
            this.comFiles.push(files[i]);
          }
        }
      },
      playVideo(item){
        if(item){
          this.playerSrc = item.attacthment;
          this.playerShow = true;
        } else {
          console.log('播放地址不存在！')
        }
      }
    },
    created() {
      this.defaultValue = this.values
      this.form = this.$parent.form;
      this.biReferenceId = this.form.biReferenceId;
      this.setDefault();
    },
    mounted() {
      //图片游览按返回键退出游览
      this.$preview.on('imageLoadComplete', (e, item) =>{
          let _preview = this.$preview.self;
          let lookUrl = window.location.href + '&look';
          window.history.pushState(null, null, lookUrl);
          _preview.listen('close',
          function() {
              if (window.location.href.indexOf('&look') !== -1) {
                  window.history.back();
              }
          });
          window.onhashchange = function() {
              if (_preview !== null && _preview !== undefined) {
                  _preview.close();
                  _preview = null;
              }
          };
      });
    }
  }
  export default Vue.component('Fileupload',component)
</script>

<style scoped lang="scss">
  .upload-file-container {
    padding: .15rem;
    background-color: #fff;
    color: #333;
    box-sizing: border-box;
    .zhezhao-wrapper{
      display: block;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      .zhezhao-wrapper-container{
        //margin-bottom: 20%;
        .weui-loadmore {
          width: 65%;
          margin: 1.5em auto;
          line-height: 1.6em;
          font-size: 14px;
          text-align: center;
          color: white
        }
      }
    }
    .upload-file-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .upload-file-title {
        line-height: .16rem;
        font-size: 16px;
        font-weight: 600;
        &:before {
          left: -.15rem;
          width: .08rem;
          border-left: .08rem solid;
          @include boder_color();
        }
      }
    }
    &.no-upload {
      padding: .24rem .15rem .15rem;
      &:before {
        border-color: #ECEDEC;
      }
      .title {
        line-height: .14rem;
      }
      .upload-file-list {
        padding: 0;
      }
      .upload-file-item {
        margin: .15rem .1rem 0 0;
        width: .78rem;
        height: .78rem;
      }
    }
    .upload-file-list {
      display: flex;
      flex-wrap: wrap;
      margin-top: .1rem;
      // padding: 0.05rem 0;
    }
    .upload-file-item {
      width: .78rem;
      height: .78rem;
      position: relative;
      /* margin: .15rem .1rem 0 0; */
      margin: .1rem;
      display: inline-block;
      .img {
        width: 100%;
        height: 100%;
        border-radius: .04rem;
      }
      .icon-shanchu {
        top: 0;
        right: 0;
        z-index: 5;
        font-size: .2rem;
        color: #ea5455;
        // background: #000;
        position: absolute;
        transform: translate(50%, -50%);
      }
      .text {
        width: 95%;
        height: 100%;
        font-size: .12rem;
        overflow: hidden; 
        word-break: break-all;  
      }
    }
    .upload-file-text {
      width: 100%;
      height: 100%;
      position: relative;
      margin: .1rem;
      display: inline-block;
      .icon-shanchu {
        top: 0;
        right: 0;
        z-index: 5;
        font-size: .2rem;
        color: #ea5455;
        // background: #000;
        position: absolute;
        transform: translate(50%, -50%);
      }
      .text {
        width: 95%;
        height: 100%;
        font-size: .12rem;
        overflow: hidden; 
        word-break: break-all;  
      }
    }
    .upload-file {
      display: none;
    }
    .upload-file-item-bottom {
      width: 100%;
      height: .3rem;
      position: relative;
      margin: .1rem;
      display: inline-block;
    }
    .icon_container {
      background: #F7F7F7;
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;
      align-content: center;
      border-radius: 0.04rem;
      span {
        line-height: .12rem;
        color: #999;
        font-size: .12rem;
      }
      .icon-upload-add {
        // margin-bottom: .15rem;
        width: .16rem;
        height: .16rem;
      }
    }
    // .icon-fujian {
    //   top: 47%;
    //   left: 16%;
    //   // z-index: -999;
    //   color: #c5c5c5;
    //   font-size: .2rem;
    //   position: absolute;
    //   transform: translate(50%, -50%);
    // }
  }
</style>
