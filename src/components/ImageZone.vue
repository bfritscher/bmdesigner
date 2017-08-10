<template>
  <div class="image-zone" :class="{'drop-target': dropTarget}" @dragleave.prevent.stop="dropTarget=false" @dragexit.prevent.stop="dropTarget=false" @dragover.prevent.stop="dropTarget=true" @dragenter.prevent.stop="dropTarget=true" @drop.prevent.stop="handleChange" @click="handleClick">
    <v-alert error v-model="hasError">
      {{ errorMsg}}
    </v-alert>
    <slot>
      <div class="image-display" :style="{'background-color': color, 'background-image': `url(${image})`}">
        <div v-show="!image"><v-icon light>file_upload</v-icon>{{ lang.hint }}</div>
      </div>
    </slot>
    <input style="display:none" type="file" @click.stop @change="handleChange" ref="fileinput">
    <canvas style="display:none" :width="width" :height="height" ref="canvas"></canvas>
  </div>
</template>

<script>
import Vue from 'vue';

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
    image: {
      default: '',
      type: String,
    },
    color: {
      default: 'transparent',
      type: String,
    },
    allowClick: {
      default: true,
      type: Boolean,
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
      lastEvent: null,
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
  methods: {
    handleClick(e) {
      if (this.allowClick) {
        e.preventDefault();
        e.stopPropagation();
        this.$refs.fileinput.click();
      }
      return true;
    },
    handleChange(e) {
      const files = e.target.files || e.dataTransfer.files;
      this.reset();
      this.dropTarget = false;
      this.lastEvent = e;
      if (files.length > 0 && this.checkFile(files[0])) {
        this.setSourceImg(files[0]);
      } else if (e.dataTransfer) {
        const imageUrl = e.dataTransfer.getData('text/html');
        const extracSrc = /src="?([^"\s]+)"?\s*/;
        const url = extracSrc.exec(imageUrl);
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
        // eslint-disable-next-line
        const colorThief = new ColorThief();
        const [r, g, b] = colorThief.getColor(img);
        this.$emit('update:color', `rgb(${r}, ${g}, ${b})`);
        if (this.width <= this.maxWidth && this.height <= this.maxHeight) {
          this.setNewImage(src);
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
        this.setNewImage(canvas.toDataURL());
      });
    },
    setNewImage(src) {
      this.$emit('update:image', src);
      if (this.lastEvent && this.lastEvent.type === 'drop') {
        this.lastEvent.image = src;
        this.$emit('image-drop', this.lastEvent);
      }
    },
    reset() {
      this.hasError = false;
      this.errorMsg = '';
      this.lastEvent = null;
      this.$emit('update:image', '');
      this.$emit('update:color', '');
      if (typeof FormData !== 'function') {
        this.hasError = true;
        this.errorMsg = this.lang.error.notSupported;
      }
    },
  },
};
</script>

<style>
.image-display {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-position: 50% 50%;
  background-size: contain;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.drop-target {
  background-color: #dcedc8 !important;
  opacity: 0.6;
}
</style>
