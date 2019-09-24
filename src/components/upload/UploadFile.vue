<template>
  <div class="upload-file-container" :class="{'no-upload': noUpload, 'vux-1px-t': noUpload}" :style="containStyle"
       v-if="(noUpload && defaultValue.length) || !noUpload">
    <p class="title" :style="titleStyle">附件</p>
    <div class="upload-file-list">
      <div class="upload-file-item" v-for="(item, index) in files" :key="index">
        <template v-if="item.iconType === 'image'">
          <img @click.stop="preview(item)" class="img"
               :src="`/H_roleplay-si/ds/download?url=${item.attacthment}&width=400&height=400`">
        </template>
        <template v-else>
          <div class="text">{{item.attr1}}</div>
        </template>
        <i class="iconfont icon-shanchu" @click="deleteFile(item)" v-if="!noUpload"></i>
      </div>
      <input @change="commUploadFile()" type="file" ref="uFile" v-show="false" multiple/>
      <div class="upload-file-item" v-if="!noUpload" @click="dealUploadDev">
        <div class="icon_container">
          <span class="icon-upload-add"></span>
          <span>添加附件</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {deleteFile,upload} from 'service/commonService';
  import {chooseImage, uploadImage} from 'plugins/wx/api'
  import {isIOS,isIPhone,isIPad,isAndroid,isPC,isQYWX} from '@/plugins/platform/index'

  export default {
    name: "UploadFile",
    props: {
      // input框的Id
      id: {
        type: String,
        default: 'upload-file'
      },
      // 默认值
      defaultValue: {
        type: Array,
        default() {
          return []
        }
      },
      noUpload: {
        type: Boolean,
        default: false
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
      // 表单提交id
      biReferenceId: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        files: [],
        file: null,
        showLoading: false,
      }
    },
    watch: {
      defaultValue: {
        handler() {
          this.setDefault();
        },
        immediate: true
      },
    },
    methods: {
      dealUploadDev() {
        if(isQYWX) {
          this.chooseFile();
        } else if (isIOS || isIPhone || isIPad || isAndroid || isPC) {
          this.clickUpload();
        } else this.clickUpload();
      },
      // 选择图片
      chooseFile() {
        let options = {
          count: 5, // 默认9
          defaultCameraMode: 'batch', //表示进入拍照界面的默认模式，目前有normal与batch两种选择，normal表示普通单拍模式，batch表示连拍模式，不传该参数则为normal模式。（注: 用户进入拍照界面仍然可自由切换两种模式）
        };
        chooseImage(options).then(async localIds => {
          var l = localIds.length,
              i,
              localId;

          if(l) {
            this.upload(localIds[0],()=>{
              for(i = 1;i < l; i++){
                localId = localIds[i];
                this.upload(localId);
              }
            });
          }
        });
      },
      //模拟文件上传事件
      clickUpload() {
        this.$refs.uFile.dispatchEvent(new MouseEvent('click'));
      },
      // 设置默认值
      setDefault() {
        let files = [];
        let [first = {}] = this.defaultValue;
        files = this.defaultValue.map(item => {
          return {
            ...item,
            iconType: this.judgeFileType(item.attr1),
          }
        });
        this.files = files;
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
          },
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
      preview(item) {
        if (item.iconType === 'image') {
          let images = this.files.reduce((arr, image) => {
            if (image.iconType === 'image') {
              arr.push(this.getImgUrl(image));
            }
            return arr
          }, []);
          let imgUrl = this.getImgUrl(item);
          wx.previewImage({
            current: imgUrl, // 当前显示图片的http链接
            urls: images // 需要预览的图片http链接列表
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
                let idx = this.files.findIndex(fItem => fItem.id === item.id);
                if (idx !== -1) {
                  this.files.splice(idx, 1);
                }
              }
            })
          },
        })
      },
      // 上传文件
      upload(localId,cb) {
        return uploadImage({
          localId,
          referenceId: this.biReferenceId,
        }).then(data => {
          let [detail = {}] = data;
          detail.iconType = this.judgeFileType(detail.attr1);
          this.uploadSuccess(detail);
          if(cb)cb();
        });
      },
      uploadSuccess:function(detail){
        this.files.push(detail);
        this.$emit('on-upload', {
          biReferenceId: detail.biReferenceId,
        });
      },
      //通用上传文件
      commUploadFile() {
        let files = this.$refs.uFile.files,
            l = files.length,
            file,
            vm = this,
            i;
            
        if(!files.length) {
          return false;
        }
        if(l) {
          handler(files[0],function(){
            for(i = 1;i < l; i++){
              if(!checkType(files[i].name)) {
                vm.$vux.toast.text(files[i].name + '不符合的文件上传格式！')
                continue;
              }
              if(!checkFileSize(files[i].size)) {
                vm.$vux.toast.text(files[i].name + '上传大小不能超过10M！') 
                continue;  
              }
              file = files[i];
              handler(file);
            }
          });
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
          if(filesize > 10485760) {
            return false
          } else return true;
        }
      }
    },
    created() {
    }
  }
</script>

<style scoped lang="scss">
  .upload-file-container {
    padding: .15rem;
    background-color: #fff;
    color: #333;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
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
      // padding: 0.05rem 0;
    }
    .upload-file-item {
      width: .78rem;
      height: .78rem;
      position: relative;
      margin: .15rem .1rem 0 0;
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
      }
    }
    .upload-file {
      display: none;
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
        margin-bottom: .15rem;
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
