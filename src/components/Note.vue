<template>
  <div @click.prevent.stop class="draggable note" :style="{height: `${height}px`, left: `${value.left}%`, top: `${value.top}%`, 'box-shadow': boxShadow}">
    <div class="colors">
      <div class="color"></div>
      <div class="color"></div>
    </div>
    <!-- needed for textarea sizing bug -->
    <div class="text-box">
      <textarea placeholer="text" @click.prevent.stop ref="textarea" class="text" v-model="text" @keyup="handleKeyUp($event)" :style="{'font-size': `${fontSize}px`}"></textarea>
    </div>
  </div>
</template>

<script>
import interact from 'interactjs';
import Vue from 'vue';

export default {
  name: 'note',
  props: ['value'],
  data() {
    return {
      text: '',
      height: 40,
      fontSize: 40,
      x: 0,
      y: 0,
      colors: ['#yellow', 'red', 'blue', 'green'],
    };
  },
  mounted() {
    window.addEventListener('resize', this.calculateFontSizeAndHeight);
    interact(this.$el)
      .draggable({
        inertia: true,
        restrict: {
          restriction: '.canvas',
          endOnly: true,
          elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
        },
        autoScroll: true,
        onstart: () => {
          this.value.x = this.$el.offsetLeft;
          this.value.y = this.$el.offsetTop;
        },
        onmove: (event) => {
          this.value.x += event.dx;
          this.value.y += event.dy;
          this.value.left = parseFloat(this.value.x) / (document.getElementById('canvas').offsetWidth / 100);
          this.value.top = parseFloat(this.value.y) / (document.getElementById('canvas').offsetHeight / 100);
          console.log(this.value);
        },
        onend: (event) => {
          if (event.relatedTarget) {
            this.text = event.relatedTarget.getAttribute('id');
          }
        },
      })
      .gesturable({
        onmove: (event) => {
          console.log('angle', event);
        },
      });
    this.calculateFontSizeAndHeight();
    this.$refs.textarea.focus();
  },
  computed: {
    boxShadow() {
      return this.colors.slice(1).reduce((shadows, color, i) => {
        const size = (i + 1) * 4;
        shadows.push(`-${size}px -${size}px ${color}`);
        return shadows;
      }, ['0px 1px 2px rgba(0, 0, 0, 0.3)']).join(',');
    },
  },
  methods: {
    handleKeyUp(e) {
      console.log(e);
      if ([35, 36, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        return;
      }
      if (e.keyCode === 13 && e.ctrlKey) {
        this.$root.$emit('addNote', { x: this.value.x, y: this.value.y + this.height });
      }
      this.calculateFontSizeAndHeight();
    },
    async calculateFontSizeAndHeight() {
      while ((this.$refs.textarea.scrollHeight > this.$refs.textarea.offsetHeight ||
        this.$refs.textarea.scrollWidth > this.$refs.textarea.offsetWidth) && this.fontSize > 10) {
        // eslint-disable-next-line
        await Vue.nextTick(() => {
          if (this.height < 200
            && this.$refs.textarea.scrollWidth <= this.$refs.textarea.offsetWidth) {
            this.height += 1;
          } else {
            this.fontSize -= 1;
          }
        });
      }
      while (this.$refs.textarea.scrollWidth === this.$refs.textarea.offsetWidth
      && this.$refs.textarea.scrollHeight === this.$refs.textarea.offsetHeight) {
        // eslint-disable-next-line
        await Vue.nextTick(() => {
          if (this.fontSize > 40) {
            this.height -= 1;
          } else {
            this.fontSize += 1;
          }
        });
      }
      Vue.nextTick(() => {
        this.fontSize -= 2; // should be 1 but with 2 works better for width scroll overflow
        this.height += 1;
      });
    },
  },
};
</script>

<style>
.draggable {
  transform: translate(0px, 0px);
}

.note {
  border: 0px;
  margin: 0px;
  width: 15%;
  height: 40px;
  position: absolute;
  top:0;
  left: 0;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 127, 1);
  background: -moz-linear-gradient(-45deg, rgba(255, 255, 127, 1) 0%, rgba(255, 255, 188, 1) 100%);
  background: -webkit-gradient(left top, right bottom, color-stop(0%, rgba(255, 255, 127, 1)), color-stop(100%, rgba(255, 255, 188, 1)));
  background: -webkit-linear-gradient(-45deg, rgba(255, 255, 127, 1) 0%, rgba(255, 255, 188, 1) 100%);
  background: -o-linear-gradient(-45deg, rgba(255, 255, 127, 1) 0%, rgba(255, 255, 188, 1) 100%);
  background: -ms-linear-gradient(-45deg, rgba(255, 255, 127, 1) 0%, rgba(255, 255, 188, 1) 100%);
  background: linear-gradient(135deg, rgba(255, 255, 127, 1) 0%, rgba(255, 255, 188, 1) 100%);
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ffff7f', endColorstr='#ffffbc', GradientType=1);
}
.note .text-box {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: 4px;
}
.note textarea {
  overflow-wrap: normal;
  overflow: hidden;
  text-align: center;
  resize: none;
  padding: 0;
  margin: 0;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  border: none;
  outline: none;
  background-color:  transparent;
}

.colors {
  position: absolute;
  top: -50px;
  background-color: rgba(0, 0, 0, 0.7);
  width: 100%;
  display: flex;
}

.color {
  width: 30px;
  height: 30px;
  background-color: red;
  margin: 4px;
}

</style>
