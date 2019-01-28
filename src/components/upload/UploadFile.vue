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
          {{item.attr1}}
        </template>
        <i class="iconfont icon-shanchu" @click="deleteFile(item)" v-if="!noUpload"></i>
      </div>
      <div class="upload-file-item" v-if="!noUpload" @click="chooseImage">
        <div class="icon_container">
          <span class="icon-upload-add"></span>
          <span>添加附件</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {deleteFile} from 'service/commonService';
  import {chooseImage, uploadImage} from 'plugins/wx/api'

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
      // TODO 选择图片
      chooseImage() {
        let options = {
          count: 5, // 默认9
          defaultCameraMode: 'batch', //表示进入拍照界面的默认模式，目前有normal与batch两种选择，normal表示普通单拍模式，batch表示连拍模式，不传该参数则为normal模式。（注: 用户进入拍照界面仍然可自由切换两种模式）
        };
        chooseImage({options,}).then(async localIds => {
          for (let localId of localIds) {
            await this.upload(localId);
          }
        });
      },
      // TODO 设置默认值
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
      // TODO 判断图片类型
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
      // TODO 获取预览图片链接
      getImgUrl(item) {
        return `${location.origin}/H_roleplay-si/ds/download?url=${item.attacthment}`
      },
      // TODO 放大图片预览
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
      // TODO 删除文件
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
      // TODO 上传文件
      upload(localId) {
        return uploadImage({
          localId,
          biReferenceId: this.biReferenceId,
        }).then(data => {
          let [detail = {}] = data;
          detail.iconType = this.judgeFileType(detail.attr1);
          this.files.push(detail);
          this.$emit('on-upload', {
            biReferenceId: detail.biReferenceId,
          });
        });
      },
    },
    created() {
    }
  }
</script>

<style scoped lang="scss">
  .upload-file-container {
    margin: .1rem ;
    background: #fff;
    position: relative;
    padding: .18rem .15rem;
    box-sizing: border-box;
    font-size: .14rem;
    color: #333;
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
