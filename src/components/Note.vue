<template>
  <div @click.prevent.stop class="draggable note" :style="{height: `${height}px`, left: `${value.left}%`, top: `${value.top}%`, 'box-shadow': boxShadow}">
    <div class="colors">
      <div class="color"></div>
      <div class="color"></div>
    </div>
    <!-- needed for textarea sizing bug -->
    <div class="text-box">
      <textarea placeholer="text" @click.prevent.stop ref="textarea" class="text" v-model="value.text" @blur="handleBlur" @keyup="handleKeyUp($event)" :style="{'font-size': `${fontSize}px`}"></textarea>
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
      x: 0,
      y: 0,
      height: 40,
      fontSize: 40,
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
        autoScroll: false,
        onstart: () => {
          this.x = this.$el.offsetLeft;
          this.y = this.$el.offsetTop;
          // TODO: handle z-index
        },
        onmove: (event) => {
          this.x += event.dx;
          this.y += event.dy;
          const left = (parseFloat(this.x) / this.$el.parentElement.offsetWidth) * 100;
          const top = (parseFloat(this.y) / this.$el.parentElement.offsetHeight) * 100;
          this.$store.dispatch('NOTE_MOVE', { note: this.value, left, top });
        },
        onend: (event) => {
          let type = '';
          if (event.relatedTarget) {
            type = event.relatedTarget.getAttribute('id');
          } else {
            type = this.$el.parentElement.getAttribute('data-none');
          }
          this.$store.dispatch('NOTE_UPDATE', {
            note: this.value,
            changes: {
              text: type,
              type,
            },
          });
        },
      })
      .gesturable({
        onmove: (event) => {
          console.log('angle', event);
        },
      });
    this.calculateFontSizeAndHeight().then(() => {
      this.$refs.textarea.focus();
    });
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
        const left = (this.$el.offsetLeft / this.$el.parentElement.offsetWidth) * 100;
        const top = ((this.$el.offsetTop + this.$el.offsetHeight + 20)
          / this.$el.parentElement.offsetHeight) * 100;
        this.$store.dispatch('NOTE_CREATE', { type: this.value.type, left, top });
        return;
      }
      if (e.keyCode === 27) {
        if (this.value.text === '') {
          this.$store.dispatch('NOTE_DELETE', this.value);
          return;
        }
      }
      this.calculateFontSizeAndHeight();
    },
    handleBlur() {
      if (this.value.text === '') {
        this.$store.dispatch('NOTE_DELETE', this.value);
      }
    },
    async calculateFontSizeAndHeight() {
      if (!this.$refs.textarea) {
        return;
      }
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
