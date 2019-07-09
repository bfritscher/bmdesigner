<template>
  <div class="draw-surface">
    <canvas ref="canvas"></canvas>
    <div>
      <v-btn
        class="color"
        @click="color(c)"
        v-for="c in COLORS_GESTURE"
        :key="c"
        :style="{ 'background-color': c }"
      >
        <v-icon v-if="penColor === c">check</v-icon>
      </v-btn>
      <v-btn small @click="signaturePad.clear()">clear</v-btn>
    </div>
  </div>
</template>

<script>
import { COLORS_GESTURE } from "@/utils";
import SignaturePad from "signature_pad/dist/signature_pad";

export default {
  data() {
    return {
      signaturePad: null,
      data: [],
      width: 0,
      height: 0,
      COLORS_GESTURE,
      penColor: "#F00"
    };
  },
  mounted() {
    const canvas = this.$refs.canvas;
    this.signaturePad = new SignaturePad(this.$refs.canvas, {
      backgroundColor: "rgba(255, 255, 255, 0)",
      penColor: this.penColor,
      maxWidth: 3,
      minWidth: 1,
      onEnd: () => {
        this.data = this.signaturePad.toData();
        this.width = canvas.width;
        this.height = canvas.height;
      }
    });
    window.addEventListener("resize", this.resizeCanvas);
    this.resizeCanvas();
  },
  watch: {
    "$store.state.layout.showDrawSurface": function show(val) {
      if (val) {
        this.resizeCanvas();
      }
    }
  },
  methods: {
    color(color) {
      this.penColor = color;
      this.signaturePad.penColor = color;
    },
    resizeCanvas() {
      const canvas = this.$refs.canvas;
      if (this.data && canvas) {
        const ratio = 1; // Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        /*
        canvas.getContext('2d').scale(ratio, ratio);
        */
        this.signaturePad.fromData(
          this.data.map(s => {
            return {
              color: s.color,
              points: s.points.map(p => {
                p.x = (p.x / this.width) * canvas.width;
                p.y = (p.y / this.height) * canvas.height;
                return p;
              })
            };
          })
        );
        this.width = canvas.width;
        this.height = canvas.height;
      } else {
        this.signaturePad.clear(); // otherwise isEmpty() might return incorrect value
      }
    }
  }
};
</script>

<style>
.draw-surface {
  width: 100%;
  height: 100%;
  display: block;
  position: absolute;
  z-index: 10;
}

.draw-surface canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.draw-surface .color {
  min-width: 36px;
  max-width: 36px;
}

.draw-surface .color .v-btn__content {
  padding: 0;
}
</style>
