<template>
  <div class="esign">
    <div class="effective">
      <!-- pdf文件显示 -->
      <div id="pdf-viewer"></div>
      <div class="loading">
        <div class="go-esign" @click="go_sign">一键签名</div>
      </div>
      <!-- 签名弹出框 -->
      <div class="sign-popup" v-if="show">
        <div class="qs-desc">
          <van-icon
            name="arrow-left"
            color="#666"
            size="18"
            style="margin-right: 14px"
            @click="show = false"
          />手绘签名
        </div>
        <div class="btn-box">
          <div class="notice">
            <van-icon
              name="warning"
              style="position: relative; top: 2px; margin-right: 3px"
            />请正确签署您的姓名，避免错别字或过于潦草
          </div>
          <div class="btn">
            <div class="reset" @click="handleReset">重写</div>
            <div class="reset finish" @click="handleGenerate">确定</div>
          </div>
        </div>
        <vue-esign
          id="canvas"
          ref="esign"
          :width="c_width"
          :height="c_height"
          :isCrop="isCrop"
          :lineWidth="lineWidth"
          :lineColor="lineColor"
          :bgColor.sync="bgColor"
        />
      </div>
    </div>
    <div class="resultImg" v-if="resultImg">
      <img :src="resultImg" alt="" />
    </div>
  </div>
</template>
<script>
import { Dialog } from "vant";
import vueEsign from "@/components/esign.vue";
export default {
  components: { vueEsign, [Dialog.Component.name]: Dialog.Component },
  data() {
    return {
      show: false,
      lineWidth: 10,
      lineColor: "#000000",
      bgColor: "",
      resultImg: "",
      isCrop: false,
      agreement_url:
        "https://resource.xdfgaokao.cn/3fede1e79b822d038c4217b82dee8379.pdf",
      c_width: null,
      c_height: null,
    };
  },
  mounted() {
    this.viewAgreement();
  },
  methods: {
    go_sign() {
      this.show = true;
      let width = window.$(window).width() - 85;
      let height = window.$(window).height();
      this.c_width = width;
      this.c_height = height;
      setTimeout(() => {
        this.transform_count("qs-desc", "right");
        this.transform_count("btn-box", "left");
      }, 100);
    },
    // 旋转偏移量
    transform_count(class_name, direction) {
      let height = window.$(window).height();
      let width = window.$("." + class_name).height();
      let offset = (height - width) / 2 - 6;
      window.$("." + class_name).css({
        width: height + "px",
        top: offset + "px",
        [direction]: -offset + "px",
      });
    },
    handleReset() {
      this.$refs.esign.reset();
    },
    handleGenerate() {
      // on confirm
      this.$refs.esign
        .generate()
        .then((res) => {
          this.show = false;
          this.rotateBase64(res);
        })
        .catch((err) => {
          console.log(err);
          this.$toast("请输入签名！");
          // alert(err); // 画布没有签字时会执行这里 'Not Signned'
        });
    },
    close_popup() {
      this.show = false;
    },
    // pdfjs
    viewAgreement() {
      // pdf解析器
      var url = this.agreement_url;
      var pdfjsLib = window.pdfjsLib;
      // The workerSrc property shall be specified.
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://resource.xdfgk.cn/pdf.worker.min.js";
      // Asynchronous download of PDF
      var loadingTask = pdfjsLib.getDocument(url);
      loadingTask.promise.then(
        (pdf) => {
          for (let i = 1; i <= pdf.numPages; i++) {
            pdf.getPage(i).then((page) => {
              // console.log("Page loaded");
              var scale = 1.2;
              var viewport = page.getViewport({ scale: scale });
              // console.log("viewport---------", viewport);
              var outputScale = window.devicePixelRatio || 1;
              // console.log("outputScale---------", outputScale);
              var canvas = document.createElement("canvas");
              document.getElementById("pdf-viewer").appendChild(canvas);
              var context = canvas.getContext("2d");
              canvas.height = Math.floor(viewport.height * outputScale);
              canvas.width = Math.floor(viewport.width * outputScale);
              // canvas.style.width = Math.floor(viewport.width) + "px";
              // canvas.style.height = Math.floor(viewport.height) + "px";
              var transform =
                outputScale !== 1
                  ? [outputScale, 0, 0, outputScale, 0, 0]
                  : null;
              var renderContext = {
                transform,
                canvasContext: context,
                viewport: viewport,
              };
              var renderTask = page.render(renderContext);
              renderTask.promise.then(() => {
                // console.log("Page rendered");
                // 滚动条滚动到底部
                if (this.is_scroll) {
                  window.scrollTo(
                    0,
                    document.documentElement.scrollHeight - window.innerHeight
                  );
                }
              });
            });
          }
        },
        function (reason) {
          console.error(reason);
        }
      );
    },
    // 将base64图片旋转90度
    rotateBase64(imgBase64) {
      const imgView = new Image();
      imgView.src = imgBase64;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const cutCoor = {
        sx: 0,
        sy: 0,
        ex: 0,
        ey: 0,
      };
      // 裁剪坐标
      imgView.onload = () => {
        const imgW = imgView.width;
        const imgH = imgView.height;
        const size = imgH;
        //   常量大小 = imgH;
        canvas.width = size * 2;
        canvas.height = size * 2;
        cutCoor.sx = size;
        cutCoor.sy = size - imgW;
        cutCoor.ex = size + imgH;
        cutCoor.ey = size + imgW;
        context.translate(size, size);
        context.rotate((Math.PI / 2) * 3);
        context.drawImage(imgView, 0, 0);
        const imgData = context.getImageData(
          cutCoor.sx,
          cutCoor.sy,
          cutCoor.ex,
          cutCoor.ey
        );
        canvas.width = imgH;
        canvas.height = imgW;
        context.putImageData(imgData, 0, 0);
        let res = canvas.toDataURL("image/png");
        console.log(res, "----=========");
        this.resultImg = res;
      };
    },
  },
};
</script>
<style>
#pdf-viewer canvas {
  width: 100%;
}
.van-dialog {
  transform: rotate(90deg);
  left: 10%;
  top: 40%;
  /* margin-right: 40px; */
}
</style>
<style lang="less" scoped>
.esign {
  padding-bottom: 200px;
  .go-esign {
    width: 232px;
    height: 45px;
    background: #1fb895;
    border-radius: 29px;
    z-index: 2;
    text-align: center;
    position: fixed;
    color: #fff;
    bottom: 30px;
    left: -116px;
    margin-left: 50%;
    font-size: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.sign-popup {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  background: #fff;
  width: 100vw;
  height: 100vh;
  .close {
    position: absolute;
    top: 9px;
    right: -50px;
  }
  .qs-desc {
    padding-left: 20px;
    position: absolute;
    width: 667px;
    height: 20px;
    transform: rotate(90deg);
    transform-origin: 50% 50%;
    color: #000;
    vertical-align: middle;
    font-size: 13px;
    // text-align: center;
    font-weight: 700;
    top: 323.5px; //偏移量 (width-height)/2
    right: -323.5px; //偏移量 -(width-height)/2
    display: flex;
    align-items: center;
  }
  .btn-box {
    padding: 0 40px 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: absolute;
    width: 667px;
    height: 35px;
    transform: rotate(90deg);
    transform-origin: 50% 50%;
    color: #000;
    font-size: 13px;
    text-align: center;
    font-weight: 700;
    top: 316px; //偏移量 (width-height)/2
    left: -316px; //偏移量 -(width-height)/2
    .notice {
      font-size: 12px;
      color: #666;
      font-weight: 500;
    }
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .reset {
      width: 88px;
      height: 33px;
      background: linear-gradient(90deg, #53d484, #28cfb9);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #fff;
    }
    .finish {
      margin-left: 20px;
      background: #ff870f;
    }
  }
}
#canvas {
  top: 0px;
  right: 34px;
  position: absolute;
  margin: 0 auto;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
}
.resultImg {
  // width: 100%;
  border: 1px solid #1fb895;
  max-width: 100%;
}
</style>
