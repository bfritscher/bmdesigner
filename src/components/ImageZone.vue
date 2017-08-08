<template>
  <div :style="{'background-color': color, 'background-image': createImgUrl}">
    <div class="vicp-drop-area" @dragleave="preventDefault" @dragover="preventDefault" @dragenter="preventDefault" @click="handleClick" @drop="handleChange">
      <i class="vicp-icon1" v-show="loading != 1">
        <i class="vicp-icon1-arrow"></i>
        <i class="vicp-icon1-body"></i>
        <i class="vicp-icon1-bottom"></i>
      </i>
      <span class="vicp-hint" v-show="loading !== 1">{{ lang.hint }}</span>
      <span class="vicp-no-supported-hint" v-show="!isSupported">{{ lang.noSupported }}</span>
      <input style="display:none" type="file" @click.stop @change="handleChange" ref="fileinput">
    </div>
    <div class="vicp-error" v-show="hasError">
      <i class="vicp-icon2"></i> {{ errorMsg }}
    </div>
    <canvas style="display:none" :width="width" :height="height" ref="canvas"></canvas>
  </div>
</template>

<script>
import Vue from 'vue';
// eslint-disable-next-line
const colorThief = new ColorThief();

export default {
  data() {
    return {
      color: 'transparent',
      loading: 0,
      hasError: false,
      errorMsg: '',
      progress: 0,
      maxSize: 10240,
      width: 0,
      height: 0,
      maxHeight: 168,
      maxWidth: 400,
      sourceImgUrl: '',
      createImgUrl: '',
      lang: {
        hint: 'Drag an image here or click',
        loading: 'Uploading...',
        noSupported: 'Browser not supported, please use IE10+ or other browsers',
        error: {
          onlyImg: 'Only images are supported',
          outOfSize: 'Image exceeds size limit: ',
        },
      },
      isSupported: typeof FormData === 'function',
    };
  },
  methods: {
    preventDefault(e) {
      e.preventDefault();
      return false;
    },
    handleClick() {
      this.$refs.fileinput.click();
    },
    handleChange(e) {
      e.preventDefault();
      const files = e.target.files || e.dataTransfer.files;
      this.reset();
      if (this.checkFile(files[0])) {
        this.setSourceImg(files[0]);
      }
    },
    checkFile(file) {
      if (file.type.indexOf('image') === -1) {
        this.hasError = true;
        this.errorMsg = this.lang.error.onlyImg;
        return false;
      }

      if (file.size / 1024 > this.maxSize) {
        this.hasError = true;
        this.errorMsg = `${this.lang.error.outOfSize} ${this.maxSize}kb`;
        return false;
      }
      return true;
    },
    setSourceImg(file) {
      const fr = new FileReader();
      fr.onload = (e) => {
        this.sourceImgUrl = e.target.result;
        this.loadImage();
      };
      fr.readAsDataURL(file);
    },
    loadImage() {
      const img = new Image();
      img.onload = () => {
        this.width = img.naturalWidth;
        this.height = img.naturalHeight;
        const [r, g, b] = colorThief.getColor(img);
        this.color = `rgb(${r}, ${g}, ${b})`;
        this.resize(img);
      };
      img.src = this.sourceImgUrl;
    },
    resize(img) {
      if (this.width <= this.maxWidth && this.height <= this.maxHeight) {
        this.createImgUrl = this.sourceImgUrl;
      } else {
        const maxRatio = this.maxWidth / this.maxHeight;
        let ratio = this.width / this.height;
        if (ratio === 1) {
          ratio = maxRatio;
        }
        if ((ratio > 1 && maxRatio > 1) || (ratio > 1 && maxRatio < 1)) {
          this.height = this.maxWidth / ratio;
          this.width = this.maxWidth;
        } else if ((ratio > 1 && maxRatio < 1) || (ratio < 1 && maxRatio > 1)) {
          this.width = this.maxHeight * ratio;
          this.height = this.maxHeight;
        } else if (ratio === 1) {
          this.width = this.maxWidth;
          this.height = this.maxHeight;
        }

        this.width = this.width > this.maxWidth ? this.maxWidth : this.width;
        this.height = this.height > this.maxHeight ? this.maxHeight : this.height;
        Vue.nextTick(() => {
          const canvas = this.$refs.canvas;
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, this.width, this.height);
          ctx.drawImage(img, 0, 0, this.width, this.height);
          this.createImgUrl = canvas.toDataURL();
        });
      }
    },
    reset() {
      this.loading = 0;
      this.hasError = false;
      this.errorMsg = '';
      this.progress = 0;
    },
  },
};

</script>

<style>

</style>
