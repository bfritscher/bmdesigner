<template>
  <div
    class="image-zone"
    :class="{ 'drop-target': dropTarget }"
    @dragleave.prevent.stop="dropTarget = false"
    @dragexit.prevent.stop="dropTarget = false"
    @dragover.prevent.stop="dropTarget = true"
    @dragenter.prevent.stop="dropTarget = true"
    @drop.prevent.stop="handleChange"
    @click="handleClick"
  >
    <v-alert type="error" :value="hasError">
      {{ errorMsg }}
    </v-alert>
    <slot>
      <div
        class="image-display"
        :style="{
          'background-color': showCanvas ? previewColor : color,
          'background-image': showCanvas ? 'none' : `url(${image})`
        }"
      >
        <div v-show="!image && allowClick">
          <v-icon light>file_upload</v-icon>{{ lang.hint }}
        </div>
      </div>
    </slot>
    <v-btn
      icon
      @click.prevent.stop="displayColorPicker"
      v-if="image && allowClick"
      class="color white--text"
    >
      <v-icon>colorize</v-icon>
    </v-btn>
    <v-btn
      icon
      @click.prevent.stop="reset"
      v-if="image && allowClick"
      class="delete white--text"
    >
      <v-icon>delete_forever</v-icon>
    </v-btn>
    <input
      style="display: none"
      type="file"
      @click.stop
      @change="handleChange"
      ref="fileinput"
    />
    <canvas
      v-show="showCanvas"
      @mousemove.prevent.stop="pickColor($event, false)"
      @click.prevent.stop="pickColor($event, true)"
      :style="{ top, left }"
      :width="width"
      :height="height"
      ref="canvas"
    ></canvas>
  </div>
</template>

<script>
import Vue from "vue";
import ColorThief from "colorthief";
import { totalOffset } from "@/utils";

export default {
  name: "image-zone",
  props: {
    maxWidth: {
      default: 400,
      type: Number
    },
    maxHeight: {
      default: 300,
      type: Number
    },
    image: {
      default: "",
      type: String
    },
    color: {
      default: "transparent",
      type: String
    },
    allowClick: {
      default: true,
      type: Boolean
    }
  },
  data() {
    return {
      hasError: false,
      dropTarget: false,
      errorMsg: "",
      maxSize: 10240,
      width: 0,
      height: 0,
      left: "",
      top: "",
      previewColor: "transparent",
      lastEvent: null,
      showCanvas: false,
      lang: {
        hint: "Drop image here or click to upload.",
        error: {
          notSupported:
            "Browser not supported, please use IE10+ or other browsers",
          onlyImg: "Only images are supported",
          outOfSize: "Image exceeds size limit: "
        }
      }
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
        const imageUrl = e.dataTransfer.getData("text/html");
        const extracSrc = /src="?([^"\s]+)"?\s*/;
        const url = extracSrc.exec(imageUrl);
        if (url) {
          this.loadImage(url[1]);
        }
      }
    },
    checkFile(file) {
      if (file.type.indexOf("image") === -1) {
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
      fr.onload = e => {
        this.loadImage(e.target.result);
      };
      fr.readAsDataURL(file);
    },
    loadImage(src) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        this.width = img.naturalWidth;
        this.height = img.naturalHeight;
        const colorThief = new ColorThief();
        const [r, g, b] = colorThief.getColor(img);
        this.$emit("update:color", `rgb(${r}, ${g}, ${b})`);
        this.resize(img);
      };
      img.src = src;
    },
    displayColorPicker() {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        this.width = img.naturalWidth;
        this.height = img.naturalHeight;
        Vue.nextTick(() => {
          const canvas = this.$refs.canvas;
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, this.width, this.height);
          ctx.drawImage(img, 0, 0, this.width, this.height);
          this.showCanvas = true;
          this.left = `calc(50% - ${this.width / 2}px)`;
          this.top = `calc(50% - ${this.height / 2}px)`;
        });
      };
      img.src = this.image;
    },
    pickColor(e, save) {
      // getting user coordinates
      const offset = totalOffset(this.$refs.canvas);
      const x = e.pageX - offset.left;
      const y = e.pageY - offset.top;
      // getting image data and RGB values
      const [r, g, b] = this.$refs.canvas
        .getContext("2d")
        .getImageData(x, y, 1, 1).data;
      const rgb = `rgb(${r}, ${g}, ${b})`;
      this.previewColor = rgb;
      if (save) {
        this.$emit("update:color", rgb);
        this.showCanvas = false;
      }
    },
    resize(img) {
      const maxRatio = this.maxWidth / this.maxHeight;
      const ratio = this.width / this.height;
      if (this.width <= this.maxWidth && this.height <= this.maxHeight) {
        this.width += 20;
        this.height += 20;
      }
      if (
        (ratio > 1 && maxRatio > 1) ||
        (ratio > 1 && maxRatio < 1) ||
        (ratio === 1 && maxRatio < 1) ||
        (ratio > 1 && maxRatio === 1)
      ) {
        this.width = this.maxWidth;
        this.height = this.maxWidth / ratio;
      } else if (
        (ratio < 1 && maxRatio < 1) ||
        (ratio < 1 && maxRatio > 1) ||
        (ratio === 1 && maxRatio > 1) ||
        (ratio < 1 && maxRatio === 1)
      ) {
        this.width = this.maxHeight * ratio;
        this.height = this.maxHeight;
      } else {
        this.width = this.maxWidth;
        this.height = this.maxHeight;
      }
      Vue.nextTick(() => {
        const canvas = this.$refs.canvas;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.drawImage(img, 10, 10, this.width - 20, this.height - 20);
        this.setNewImage(canvas.toDataURL());
      });
    },
    setNewImage(src) {
      this.$emit("update:image", src);
      if (this.lastEvent && this.lastEvent.type === "drop") {
        this.lastEvent.image = src;
        this.$emit("image-drop", this.lastEvent);
      }
    },
    reset() {
      this.hasError = false;
      this.errorMsg = "";
      this.lastEvent = null;
      this.$emit("update:image", null);
      this.$emit("update:color", null);
      if (typeof FormData !== "function") {
        this.hasError = true;
        this.errorMsg = this.lang.error.notSupported;
      }
    }
  }
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

.image-zone {
  position: relative;
}

.image-zone > .delete {
  position: absolute;
  display: none;
  bottom: 0;
  right: 0;
  text-shadow: 0px 0px 4px rgba(0, 0, 0, 0.86);
}

.image-zone > .color {
  position: absolute;
  display: none;
  bottom: 0;
  left: 0;
  text-shadow: 0px 0px 4px rgba(0, 0, 0, 0.86);
}

.image-zone:hover > .delete,
.image-zone:hover > .color {
  display: block;
}

.image-zone > canvas {
  position: absolute;
  cursor: crosshair;
}

.drop-target {
  background-color: #dcedc8 !important;
  opacity: 0.6;
}
</style>
