<template>
  <div class="upload-image-container vux-1px-l">
    <input type="file" name="file" id="upload-image" @change="uploadFile" accept="image/*" style="display:none;"/>
    <label class="label" for="upload-image"></label>
    <!-- 没有选中图片 -->
    <div class="upload" v-if="!imgSrc">
      <span class="iconfont icon-icon"></span>
      <span class="add_text">增加图片</span>
    </div>
    <!-- 选中图片 -->
    <img :src="imgSrc" class="upload" @load="imgLoad" @error="getDefaultImg()" v-else/>
    <!-- loading图标 -->
    <spinner type="circles" class="loading vux-1px-l" v-show="showLoading"></spinner>
  </div>
</template>

<script>
  import {Spinner} from 'vux'
  import {upload,} from 'service/commonService';
  import Exif from 'exif-js'

  export default {
    name: "UploadImage",
    props: {
      // 初始图片路径
      src: {
        type: String,
        default: ''
      }
    },
    components: {
      Spinner,
    },
    data() {
      return {
        imgSrc: '', // 图片地址
        imgFile: '', // 上传的图片file
        showLoading: false, // 是否展示loading
      }
    },
    watch: {
      src: {
        handler(val) {
          this.imgSrc = val;
        }
      }
    },
    methods: {
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
      // TODO 选择、预览图片
      uploadFile(e) {
        let files = [...e.target.files];
        if (!files.length) return;
        this.imgFile = files[0];
        e.target.value = '';
        this.imgPreview();
      },
      imgPreview() {
        this.showLoading = true;
        let file = this.imgFile;
        let Orientation;
        //去获取拍照时的信息，解决拍出来的照片旋转问题
        Exif.getData(file, () => {
          Orientation = Exif.getTag(file, 'Orientation');
        });
        // 看支持不支持FileReader
        if (!file || !window.FileReader) return;

        if (/^image/.test(file.type)) {
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
              this.postImg(result);
            } else {
              img.onload = () => {
                this.postImg(this.compress(img, Orientation));
              }
            }
          }
        }
      },
      // TODO 上传图片
      postImg(img) {
        let file = this.dataURLtoFile(img, this.imgFile.name);
        upload({
          file: file,
        }).then(res => {
          let {success = false, message = '上传失败', data} = res;
          let [detail = {}] = data;
          this.imgSrc = `/H_roleplay-si/ds/download?url=${detail.attacthment}&width=400&height=400`;
          this.$emit('on-upload', {
            src: detail.attacthment
          })
        }).catch(e => {
          this.$vux.alert.show({
            content: e.message,
          })
        });;
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
      // TODO 获取默认图片
      getDefaultImg(e) {
        this.showLoading = false;
        this.$emit('on-error', e);
      },
      // TODO 加载图片成功
      imgLoad() {
        this.showLoading = false;
      },
    },
    created() {
      this.imgSrc = this.src;
    }
  }
</script>

<style scoped lang="scss">
  .upload-image-container {
    position: relative;
    // z-index: 1;
    // width: 100rem;
    // height: 1.2rem;
    width:100%;
    height: 100%;
    > .label {
      display: block;
      width: 100%;
      height: 100%;
    }
    .upload {
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -999;
      display: flex;
      background: #fff;
      position: absolute;
      align-items: center;
      align-content: center;
      flex-direction: column;
      justify-content: center;
      .iconfont {
        font-size: 0.24rem;
      }
    }
    .loading {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 99;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      background-color: #fff;
      box-sizing: border-box;
    }
  }
</style>
