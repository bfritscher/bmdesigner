<template>
  <div class="image-zone" :class="{'drop-target': dropTarget}" :style="{'background-color': color, 'background-image': `url(${image})`}" @dragleave.prevent="dropTarget=false" @dragexit.prevent="dropTarget=false" @dragover.prevent="dropTarget=true" @dragenter.prevent="dropTarget=true" @click.stop="handleClick" @drop.prevent.stop="handleChange">
    <v-alert error v-model="hasError">
      {{ errorMsg}}
    </v-alert>
    <div v-show="!image"><v-icon light>file_upload</v-icon>{{ lang.hint }}</div>
    <input style="display:none" type="file" @click.stop @change="handleChange" ref="fileinput">
    <canvas style="display:none" :width="width" :height="height" ref="canvas"></canvas>
  </div>
</template>

<script>
import Vue from 'vue';
// eslint-disable-next-line
const colorThief = new ColorThief();

export default {
  name: 'image-zone',
  props: {
    maxWidth: {
      default: 200,
      type: Number,
    },
    maxHeight: {
      default: 200,
      type: Number,
    },
    value: {
      default: '',
      type: String,
    },
    color: {
      default: 'transparent',
      type: String,
    },
  },
  data() {
    return {
      hasError: false,
      dropTarget: false,
      errorMsg: '',
      maxSize: 10240,
      width: 0,
      height: 0,
      image: '',
      lang: {
        hint: 'Drop image here or click to upload.',
        error: {
          notSupported: 'Browser not supported, please use IE10+ or other browsers',
          onlyImg: 'Only images are supported',
          outOfSize: 'Image exceeds size limit: ',
        },
      },
    };
  },
  watch: {
    value(val) {
      this.image = val;
    },
  },
  methods: {
    handleClick() {
      this.$refs.fileinput.click();
    },
    handleChange(e) {
      this.dropTarget = false;
      const files = e.target.files || e.dataTransfer.files;
      if (files.length > 0 && this.checkFile(files[0])) {
        this.reset();
        this.setSourceImg(files[0]);
      } else {
        const imageUrl = e.dataTransfer.getData('text/html');
        const extracSrc = /src="?([^"\s]+)"?\s*/;
        const url = extracSrc.exec(imageUrl);
        console.log(e, url);
        if (url) {
          this.loadImage(url[1]);
        }
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
        this.loadImage(e.target.result);
      };
      fr.readAsDataURL(file);
    },
    loadImage(src) {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        this.width = img.naturalWidth;
        this.height = img.naturalHeight;
        const [r, g, b] = colorThief.getColor(img);
        this.color = `rgb(${r}, ${g}, ${b})`;
        this.$emit('color', this.color);
        if (this.width <= this.maxWidth && this.height <= this.maxHeight) {
          this.image = src;
          this.$emit('input', this.image);
        } else {
          this.resize(img);
        }
      };
      img.src = src;
    },
    resize(img) {
      const maxRatio = this.maxWidth / this.maxHeight;
      const ratio = this.width / this.height;
      if ((ratio > 1 && maxRatio > 1) ||
        (ratio > 1 && maxRatio < 1) ||
        (ratio === 1 && maxRatio < 1) ||
        (ratio > 1 && maxRatio === 1)) {
        this.width = this.maxWidth;
        this.height = this.maxWidth / ratio;
      } else if ((ratio < 1 && maxRatio < 1) ||
        (ratio < 1 && maxRatio > 1) ||
        (ratio === 1 && maxRatio > 1) ||
        (ratio < 1 && maxRatio === 1)) {
        this.width = this.maxHeight * ratio;
        this.height = this.maxHeight;
      } else {
        this.width = this.maxWidth;
        this.height = this.maxHeight;
      }
      Vue.nextTick(() => {
        const canvas = this.$refs.canvas;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.drawImage(img, 0, 0, this.width, this.height);
        this.image = canvas.toDataURL();
        this.$emit('input', this.image);
      });
    },
    reset() {
      this.hasError = false;
      this.errorMsg = '';
      this.image = '';
      this.color = '';
      this.$emit('input', this.image);
      this.$emit('color', this.color);
      if (typeof FormData !== 'function') {
        this.hasError = true;
        this.errorMsg = this.lang.error.notSupported;
      }
    },
  },
};

</script>

<style>
.image-zone {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-position: 50% 50%;
  background-size: contain;
  flex-direction: column;
}

.image-zone.drop-target {
  background-color: #dcedc8 !important;
  opacity: 0.6;
}
</style>
