<template>
  <div @click.prevent.stop class="draggable note" :style="{'background-color': colorsBG[color], height: `${height}px`, left: `${value.left}%`, top: `${value.top}%`, 'box-shadow': boxShadow}">
    <div class="colors" v-if="isEdit">
      <color-selector v-for="(colorIndex, i) in value.colors" :value="colorIndex" @input="setColor(i, $event)" :key="i" :small="i > 0" :canDelete="i > 0" :direction="direction"></color-selector>
      <color-selector @input="setColor(value.colors.length, $event)" small v-show="value.colors.length < 6" :hide="value.colors" :direction="direction"></color-selector>
    </div>
    <v-btn v-if="value.type=== 'vp' || value.type=== 'cs'" flat icon primary small class="zoom" light @click.native="zoom()">
      <v-icon>zoom_in</v-icon>
    </v-btn>
    <v-btn v-if="isEdit" flat icon primary small class="description" light>
      <v-icon>description</v-icon>
    </v-btn>
    <!-- needed for textarea sizing bug -->
    <div class="text-box">
      <textarea placeholer="text" @click.prevent.stop ref="textarea" class="text" :value="value.text" @input="updateText" @blur="handleBlur" @focus="handleFocus" @keyup="handleKeyUp($event)" :style="{'font-size': `${fontSize}px`}"></textarea>
    </div>
  </div>
</template>

<script>
import interact from 'interactjs';
import Vue from 'vue';
import Note from '@/models/Note';
import ColorSelector from '@/components/ColorSelector';
import * as types from '@/store/mutation-types';
import { VPC_VP_TYPES, VPC_CS_TYPES } from '@/store';
import { COLORS_MATERIAL_DARK, COLORS_MATERIAL } from '@/utils';

const MAX_FONT_SIZE = 30;

export default {
  name: 'note',
  props: ['value', 'parent'],
  data() {
    return {
      x: 0,
      y: 0,
      height: MAX_FONT_SIZE,
      fontSize: MAX_FONT_SIZE,
      colorList: COLORS_MATERIAL_DARK,
      colorsBG: COLORS_MATERIAL,
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
          this.$store.dispatch('NOTE_MOVE_TOP', this.value);
        },
        onmove: (event) => {
          this.x += event.dx;
          this.y += event.dy;
          const left = (parseFloat(this.x) / this.parent.offsetWidth) * 100;
          const top = (parseFloat(this.y) / this.parent.offsetHeight) * 100;
          this.$store.dispatch('NOTE_MOVE', { note: this.value, left, top });
        },
        onend: (event) => {
          let type = '';
          if (event.relatedTarget) {
            type = event.relatedTarget.getAttribute('id');
          } else {
            type = this.parent.getAttribute('data-none');
          }
          const payload = {
            note: this.value,
            changes: {
              type,
            },
          };
          // TODO: refactor to make note note dependent almost same as in VPC
          // ignore tmp which is at position 0
          if (VPC_VP_TYPES.indexOf(type) > 0) {
            payload.changes.parent = this.$store.state.layout.selectedVP.id;
          }
          if (VPC_CS_TYPES.indexOf(type) > 0) {
            payload.changes.parent = this.$store.state.layout.selectedCS.id;
          }
          this.$store.dispatch('NOTE_UPDATE', payload);
        },
      })
      .gesturable({
        onmove: (event) => {
          // TODO: support angle?
          console.log('angle', event);
        },
      });
    this.calculateFontSizeAndHeight().then(() => {
      this.$refs.textarea.focus();
    });
  },
  computed: {
    color() {
      return this.value.colors[0];
    },
    boxShadow() {
      return this.value.colors.slice(1).reduce((shadows, colorCode, i) => {
        let size = (i + 1) * 5;
        if (i === 0) {
          size += 0.5;
        }
        shadows.push(`-${size}px -${size}px ${COLORS_MATERIAL[colorCode]}`);
        return shadows;
      }, ['0px 1px 2px rgba(0, 0, 0, 0.3)']).join(',');
    },
    direction() {
      return this.value.top > 70 ? 'top' : 'bottom';
    },
    isEdit() {
      return this.$store.state.layout.focusedNote === this.value;
    },
  },
  methods: {
    handleKeyUp(e) {
      if ([35, 36, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        return;
      }
      if (e.keyCode === 13 && e.ctrlKey) {
        const left = (this.$el.offsetLeft / this.$el.parentElement.offsetWidth) * 100;
        const top = ((this.$el.offsetTop + this.$el.offsetHeight + 20)
          / this.parent.offsetHeight) * 100;
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
    handleFocus() {
      this.$store.commit(types.LAYOUT_UPDATE, { focusedNote: this.value });
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
          if (this.fontSize > MAX_FONT_SIZE) {
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
    setColor(position, colorId) {
      this.$store.dispatch('NOTE_UPDATE', { changes: { colors: Note.changeColor(this.value.colors, position, colorId) }, note: this.value });
    },
    zoom() {
      const payload = {};
      payload[`selected${this.value.type.toUpperCase()}`] = this.value;
      this.$store.commit(types.LAYOUT_UPDATE, payload);
    },
    updateText(e) {
      this.$store.dispatch('NOTE_UPDATE', { changes: { text: e.target.value }, note: this.value });
    },
  },
  components: {
    ColorSelector,
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
  top: 0;
  left: 0;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.3);
  line-height: 1.1;
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
  background-color: transparent;
  font-family: 'Itim', cursive;
  color: #333;
}

.note .zoom {
  position: absolute;
  bottom: -30px;
  right: -25px;
}

.note .description {
  position: absolute;
  bottom: -30px;
  right: 10px;
}


.colors {
  position: absolute;
  top: -50px;
  left: -40px;
  display: flex;
  align-items: flex-start;
}

.colors .btn {
  margin: 4px;
}

.btn--floating.btn--small .icon:not(:only-of-type):last-of-type {
  left: calc(50% - 9px);
  top: calc(50% - 9px);
}

.note-transition-enter-active {
  transition: opacity 0.2s ease-in;
}

.note-transition-leave-active {
  transition: opacity 0.2s ease-out;
  ;
}

.note-transition-enter,
.note-transition-leave-to {
  opacity: 0;
}
</style>
