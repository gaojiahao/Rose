<template>
  <div class="upload-file-container" :class="{'no-upload': noUpload}" :style="containStyle" v-if="(noUpload && defaultValue.length) || !noUpload">
    <p class="title" :style="titleStyle">附件</p>
    <div class="upload-file-list">
      <div class="upload-file-item" v-for="(item, index) in files"  :key="index">
        <!-- <img :src='item'> -->
        <template v-if="item.iconType === 'image'">
          <img @click.stop="preview(item)" class="img" :src="`/H_roleplay-si/ds/download?url=${item.attacthment}&width=400&height=400`">
        </template>
        <template v-else>
          {{item.attr1}}
        </template>
        <i class="iconfont icon-shanchu" @click="deleteFile(item)" v-if="!noUpload"></i>
      </div>
      <div class="upload-file-item" v-if="!noUpload">
        <input class="upload-file" type="file" :id="id" name="upload-file" @change="uploadFile"/>
        <label class="upload-file-add" :for="id"></label>
        <div class="icon_container">
          <span class="iconfont icon-fujian"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {upload, deleteFile,} from 'service/commonService';
  import Exif from 'exif-js'

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
        showLoading: false
      }
    },
    watch: {
      defaultValue: {
        handler() {
          this.setDefault();
        }
      },
    },
    methods: {
      chooseImage(){
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            defaultCameraMode: "batch", //表示进入拍照界面的默认模式，目前有normal与batch两种选择，normal表示普通单拍模式，batch表示连拍模式，不传该参数则为normal模式。（注: 用户进入拍照界面仍然可自由切换两种模式）
            success: function (res) {
              var localIds = res.localIds; // 返回选定照片的本地ID列表，
                        // andriod中localId可以作为img标签的src属性显示图片；
                        // 而在IOS中需通过上面的接口getLocalImgData获取图片base64数据，从而用于img标签的显示
              wx.getLocalImgData({
                  localId: localIds, // 图片的localID
                  success: function (res) {
                      alert(res);
                      var localData = res.localData; // localData是图片的base64数据，可以用img标签显示
                      let files = [...localData];
                      let [file] = files;
                      this.file = file;
                  }
              });
            }
        });

      },
      uploadFile(e) {
        let files = [...e.target.files];
        if (!files.length) return;
        let [file] = files;
        this.file = file;
        e.target.value = '';
        this.imgPreview();

      },
      imgPreview() {
        this.showLoading = true;
        let file = this.file;
        let Orientation;
        //去获取拍照时的信息，解决拍出来的照片旋转问题
        Exif.getData(file, () => {
          Orientation = Exif.getTag(file, 'Orientation');
        });
        // 看支持不支持FileReader
        if (!file || !window.FileReader) return;

        if (/^image/.test(this.file.type)) {
          // 创建一个reader
          let reader = new FileReader();
          // 将图片2将转成 base64 格式
          reader.readAsDataURL(file);
          // 读取成功后的回调
          reader.onloadend = (e) => {
            let result = e.target.result;
            let img = new Image();
            img.src = result;
            //判断图片是否小于100K,是就直接上传，反之压缩图片
            if (result.length <= (100 * 1024)) {
              this.postFile(result);
            } else {
              img.onload = () => {
                this.postFile(this.compress(img, Orientation));
              }
            }
          }
        } else {
          this.postFile();
        }
      },
      // TODO 将base64转为file
      dataURLtoFile(dataurl, filename) {//将base64转换为文件
        let arr = dataurl.split(',');
        let bstr = window.atob(arr[1]);
        let len = bstr.length;
        let u8arr = new Uint8Array(len);
        let mime = arr[0].match(/:(.*?);/)[1];

        while (len--) {
          u8arr[len] = bstr.charCodeAt(len);
        }
        return new File([u8arr], filename, {type: mime});
      },
      // TODO 上传图片
      postFile(img) {
        let file = null;
        if (/^image/.test(this.file.type)) {
          file = this.dataURLtoFile(img, this.file.name);
        } else {
          file = this.file;
        }
        upload({
          file: file,
          biReferenceId: this.biReferenceId,
        }).then(res => {
          let {success = false, message = '上传失败', data} = res;
          let [detail = {}] = data;
          detail.iconType = this.judgeFileType(detail.attr1);
          this.files.push(detail);
          if (!this.biReferenceId) {
            this.biReferenceId = detail.biReferenceId;
            this.$emit('on-upload', {
              biReferenceId: this.biReferenceId
            })
          }
        }).catch(e => {
          this.$vux.alert.show({
            content: e.message,
          })
        });
      },
      // TODO 压缩图片
      compress(img, Orientation) {
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext('2d');
        //瓦片canvas
        let tCanvas = document.createElement("canvas");
        let tctx = tCanvas.getContext("2d");
        let initSize = img.src.length;
        let width = img.width;
        let height = img.height;
        //如果图片大于四百万像素，计算压缩比并将大小压至400万以下
        let ratio;
        if ((ratio = width * height / 4000000) > 1) {
          console.log("大于400万像素");
          ratio = Math.sqrt(ratio);
          width /= ratio;
          height /= ratio;
        } else {
          ratio = 1;
        }
        canvas.width = width;
        canvas.height = height;
        // 铺底色
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // 如果图片像素大于100万则使用瓦片绘制
        let count;
        if ((count = width * height / 1000000) > 1) {
          console.log("超过100W像素");
          count = ~~(Math.sqrt(count) + 1); //计算要分成多少块瓦片
          // 计算每块瓦片的宽和高
          let nw = ~~(width / count);
          let nh = ~~(height / count);
          tCanvas.width = nw;
          tCanvas.height = nh;
          for (let i = 0; i < count; i++) {
            for (let j = 0; j < count; j++) {
              tctx.drawImage(img, i * nw * ratio, j * nh * ratio, nw * ratio, nh * ratio, 0, 0, nw, nh);
              ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
            }
          }
        } else {
          ctx.drawImage(img, 0, 0, width, height);
        }
        //修复ios上传图片的时候 被旋转的问题
        if (Orientation !== "" && Orientation !== 1) {
          switch (Orientation) {
            case 6://需要顺时针（向左）90度旋转
              this.rotateImg(img, 'left', canvas);
              break;
            case 8://需要逆时针（向右）90度旋转
              this.rotateImg(img, 'right', canvas);
              break;
            case 3://需要180度旋转
              this.rotateImg(img, 'right', canvas);//转两次
              this.rotateImg(img, 'right', canvas);
              break;
          }
        }
        //进行最小压缩
        let ndata = canvas.toDataURL('image/jpeg/gif', 0.5);
        console.log('压缩前: ' + initSize);
        console.log('压缩后: ' + ndata.length);
        console.log('压缩率: ' + ~~(100 * (initSize - ndata.length) / initSize) + "%");
        tCanvas.width = tCanvas.height = canvas.width = canvas.height = 0;
        return ndata;
      },
      // TODO 旋转图片
      rotateImg(img, direction, canvas) {
        //最小与最大旋转方向，图片旋转4次后回到原方向
        const min_step = 0;
        const max_step = 3;
        if (img == null) return;
        //img的高度和宽度不能在img元素隐藏后获取，否则会出错
        let height = img.height;
        let width = img.width;
        let step = 2;
        if (step == null) {
          step = min_step;
        }
        if (direction === 'right') {
          step++;
          //旋转到原位置，即超过最大值
          step > max_step && (step = min_step);
        } else {
          step--;
          step < min_step && (step = max_step);
        }
        //旋转角度以弧度值为参数
        let degree = step * 90 * Math.PI / 180;
        let ctx = canvas.getContext('2d');
        switch (step) {
          case 0:
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0);
            break;
          case 1:
            canvas.width = height;
            canvas.height = width;
            ctx.rotate(degree);
            ctx.drawImage(img, 0, -height);
            break;
          case 2:
            canvas.width = width;
            canvas.height = height;
            ctx.rotate(degree);
            ctx.drawImage(img, -width, -height);
            break;
          case 3:
            canvas.width = height;
            canvas.height = width;
            ctx.rotate(degree);
            ctx.drawImage(img, -width, 0);
            break;
        }
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
      // TODO 放大图片预览
      preview(item) {
        if (item.iconType === 'image') {
          let imgUrl = `${location.origin}/H_roleplay-si/ds/download?url=${item.attacthment}&width=400&height=400`;
          wx.previewImage({
            current: imgUrl, // 当前显示图片的http链接
            urls: [imgUrl] // 需要预览的图片http链接列表
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
    },
    created() {
      this.setDefault();
    }
  }
</script>

<style scoped lang="scss">
  .upload-file-container {
    width: 95%;
    z-index: -20;
    margin: .1rem auto;
    background: #fff;
    position: relative;
    padding: .06rem .1rem;
    box-sizing: border-box;
    &.no-upload {
      .upload-file-item {
        margin: 0 .08rem .08rem 0;
      }
    }
    .title {
      color: #757575;
      font-size: .12rem;
    }
    .upload-file-list {
      display: flex;
      flex-wrap: wrap;
      padding: 0.05rem 0;
    }
    .upload-file-item {
      width: .6rem;
      height: .6rem;
      position: relative;
      margin-bottom: .3rem;
      display: inline-block;
      margin: 0 .3rem .3rem 0;
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
    .upload-file-add {
      width: .6rem;
      height: .6rem;
      display: block;
      position: relative;
      box-sizing: border-box;
      border-radius: 0.05rem;
      border: 1px solid #ccc;
      .add_text {
        font-size: 0.12rem;
      }
    }
    .icon_container {
      background: #fff;
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      z-index: -10;
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;
      align-content: center;
      .icon-fujian {
        color: #c5c5c5;
        font-size: .18rem;
        line-height: .18rem;
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
