<template>
  <div @click.prevent.stop @wheel="handleWheel" class="draggable note" :class="{'list-mode': $store.state.layout.listMode}" :style="{'background-color': colorsBG[color], height: `${height}%`, left: `${left}%`, top: `${top}%`, transform: `rotateZ(${angle}deg)`, 'box-shadow': boxShadow, opacity}">
    <div class="colors" v-if="isEdit && !dragging">
      <color-selector :style="{transform: `rotateZ(${-angle}deg)`}" v-for="(colorIndex, i) in value.colors" :value="colorIndex" @input="setColor(i, $event)" :key="i" :small="i > 0" :canDelete="i > 0" :direction="direction"></color-selector>
      <color-selector :style="{transform: `rotateZ(${-angle}deg)`}" @input="setColor(value.colors.length, $event)" small v-show="value.colors.length < 6" :hide="value.colors" :direction="direction"></color-selector>
    </div>
    <div class="icons">
      <v-btn v-if="isEdit" flat icon primary small class="description" light @click.native.prevent.stop="showNoteOptions">
        <v-icon>description</v-icon>
      </v-btn>
      <v-btn v-if="value.type=== 'vp' || value.type=== 'cs'" flat icon primary small class="zoom" light @click.native="zoom()">
        <v-icon>zoom_in</v-icon>
      </v-btn>
    </div>
    <!-- needed for textarea sizing bug -->
    <div class="text-box" @click.prevent.stop>
      <textarea placeholer="text" @click.prevent.stop ref="textarea" class="text" :value="value.text" @input="updateText" @focus="handleFocus" @keyup="handleKeyUp($event)" :style="{'font-size': `${fontSize}px`}"></textarea>
    </div>
  </div>
</template>

<script>
import interact from 'interactjs';
import Vue from 'vue';
import ImageZone from '@/components/ImageZone';
import Note from '@/models/Note';
import ColorSelector from '@/components/ColorSelector';
import * as types from '@/store/mutation-types';
import { VPC_VP_TYPES, VPC_CS_TYPES, VPC_TYPES } from '@/store';
import { COLORS_MATERIAL_DARK, COLORS_MATERIAL } from '@/utils';

const MAX_FONT_SIZE = 30; // /2 if pic mode

export default {
  name: 'note',
  props: ['value', 'parent'],
  data() {
    return {
      x: 0,
      y: 0,
      height: 5, // TODO init with watch
      dragging: false,
      dragStartType: '',
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
          this.dragStartType = this.value.type;
          this.dragging = true;
          this.x = this.$el.offsetLeft;
          this.y = this.$el.offsetTop;
          this.$store.dispatch('NOTE_MOVE_TOP', this.value);
        },
        onmove: (event) => {
          this.x += event.dx;
          this.y += event.dy;
          const left = (parseFloat(this.x) / this.parent.offsetWidth) * 100;
          const top = (parseFloat(this.y) / this.parent.offsetHeight) * 100;

          let type = '';
          if (event.dropzone) {
            type = event.dropzone.target.getAttribute('id');
          } else {
            type = this.parent.getAttribute('data-none');
          }
          if (this.$store.state.layout.listMode) {
            this.$store.dispatch('NOTE_MOVE', { note: this.value, listLeft: left, listTop: top, type });
          } else {
            this.$store.dispatch('NOTE_MOVE', { note: this.value, left, top, type });
          }

          this.sortSortable(type, {
            exclude: this.value,
          });
        },
        onend: (event) => {
          this.dragging = false;
          let newtype = '';
          if (event.relatedTarget) {
            newtype = event.relatedTarget.getAttribute('id');
          } else {
            newtype = this.parent.getAttribute('data-none');
          }

          const payload = {
            note: this.value,
            changes: {
              type: newtype,
            },
          };
          // TODO: refactor to make note note dependent almost same as in VPC
          // ignore tmp which is at position 0
          if (VPC_VP_TYPES.indexOf(newtype) > 0) {
            payload.changes.parent = this.$store.state.layout.selectedVP.id;
          }
          if (VPC_CS_TYPES.indexOf(newtype) > 0) {
            payload.changes.parent = this.$store.state.layout.selectedCS.id;
          }
          this.$store.dispatch('NOTE_UPDATE', payload);

          // update list modes
          this.sortSortable(newtype);

          if (this.dragStartType !== newtype) {
            this.sortSortable(this.dragStartType);
          }

          // update free mode
          if (this.$store.state.layout.listMode) {
            if (this.value.left === 0 && this.value.top === 0) {
              // never been positionned in free mode take list position
              this.$store.dispatch('NOTE_MOVE', { note: this.value, left: this.value.listLeft, top: this.value.listTop });
            } else if (this.dragStartType !== newtype) {
              // ratio if zone changed
              const start = document.getElementById(this.dragStartType);
              const end = document.getElementById(newtype);
              if (start && end) {
                const left = (((this.value.left - parseFloat(start.style.left))
                  / parseFloat(start.style.width)) * parseFloat(end.style.width))
                  + parseFloat(end.style.left);

                const top = (((this.value.top - parseFloat(start.style.top))
                  / parseFloat(start.style.height)) * parseFloat(end.style.height))
                  + parseFloat(end.style.top);
                this.$store.dispatch('NOTE_MOVE', { note: this.value, left, top });
              }
            }
          }
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
    opacity() {
      // calculate visibility based on colors
      return this.$store.state.layout.colorsVisibility.reduce((totalOpacity, opacity, colorId) => {
        if (this.value.colors.includes(colorId)) {
          totalOpacity += opacity;
        }
        return Math.min(totalOpacity, 1);
      }, 0);
    },
    boxShadow() {
      return this.value.colors.reduce((shadows, colorCode, i) => {
        if (this.$store.state.layout.listMode) {
          const size = ((i + 1) * 5) + (i * 2);
          shadows.push(`-${size}px 0px ${COLORS_MATERIAL[colorCode]}`);
          shadows.push(`-${size + 2}px 0px ${this.dragging ? 'transparent' : '#fff'}`);
        } else if (i === 0) {
          shadows.push('0px 1px 2px rgba(0, 0, 0, 0.3)');
        } else {
          const size = (i * 5) + 1;
          shadows.push(`-${size}px -${size}px ${COLORS_MATERIAL[colorCode]}`);
        }
        return shadows;
      }, []).join(',');
    },
    direction() {
      return this.value.top > 70 ? 'top' : 'bottom';
    },
    isEdit() {
      return this.$store.state.layout.focusedNote === this.value;
    },
    left() {
      return this.$store.state.layout.listMode ? this.value.listLeft : this.value.left;
    },
    top() {
      return this.$store.state.layout.listMode ? this.value.listTop : this.value.top;
    },
    angle() {
      return this.$store.state.layout.listMode ? 0 : this.value.angle;
    },
  },
  watch: {
    isEdit(val) {
      if (!val) {
        this.removeIfEmpty();
        this.sortSortable(this.value.type);
      }
    },
  },
  methods: {
    showNoteOptions() {
      this.$store.commit(types.LAYOUT_UPDATE, { showNoteOptions: true });
    },
    handleKeyUp(e) {
      if ([35, 36, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        return;
      }
      if (e.keyCode === 13 && e.ctrlKey) {
        const left = (this.$el.offsetLeft / this.$el.parentElement.offsetWidth) * 100;
        const top = ((this.$el.offsetTop + this.$el.offsetHeight + 20)
          / this.parent.offsetHeight) * 100;
        this.$store.dispatch('NOTE_CREATE', { type: this.value.type, left, top, listLeft: left, listTop: top });
        return;
      }
      if (e.keyCode === 27) {
        if (this.value.text === '') {
          this.removeIfEmpty();
          return;
        }
      }
      this.calculateFontSizeAndHeight();
    },
    handleFocus() {
      this.$store.commit(types.LAYOUT_UPDATE, { focusedNote: this.value });
      this.$store.commit(types.NOTE_MOVE_TOP, this.value);
    },
    handleWheel(e) {
      if (!this.$store.state.layout.listMode) {
        const delta = (e.deltaY - (e.deltaY % 100)) / 50;
        this.$store.dispatch('NOTE_MOVE', { note: this.value, angle: this.value.angle + delta });
      }
    },
    removeIfEmpty() {
      if (this.value.text === '' && this.value.image === '') {
        this.$store.dispatch('NOTE_DELETE', this.value);
      }
    }, // TODO move?
    sortSortable(type, options) {
      let zoneTop = 0;
      let zoneLeft = -10; // for tmp outside of paper
      let zoneHeight = 100;
      let zoneWidth = 100;
      const offsetLeft = 1;
      const offsetTop = 5;
      const marginLeft = 1;
      const marginTop = 1;
      const zone = document.getElementById(type);

      if (zone) {
        zoneTop = parseFloat(zone.style.top);
        zoneLeft = parseFloat(zone.style.left);
        zoneHeight = parseFloat(zone.style.height);
        zoneWidth = parseFloat(zone.style.width);
        if (type === 'solution') {
          zoneWidth = 20;
          zoneLeft = 20;
        }
        if (type === 'pain_gain') {
          zoneWidth = 20;
          zoneLeft = 60;
        }
        if (type === 'job') {
          zoneWidth = 20;
          zoneLeft = 80;
        }
      }
      let ordered = this.$store.getters.getNotesByTypes(type);
      if (VPC_TYPES.includes(type)) {
        ordered = ordered.filter((note => note.parent === this.$store.state.layout.selectedVP.id ||
          note.parent === this.$store.state.layout.selectedCS.id
        ));
      }

      ordered.sort((a, b) => {
        if (a.listLeft - b.listLeft > 10) {
          return 1;
        }
        if (b.listLeft - a.listLeft > 10) {
          return -1;
        }
        return a.listTop - b.listTop;
      });

      let top = zoneTop + offsetTop;
      let left = zoneLeft + offsetLeft;
      ordered.forEach((note) => {
        if (top + note.height > zoneTop + zoneHeight) {
          top = zoneTop + offsetTop;
          left += (zoneWidth / 2.0) + marginLeft;
        }

        // only dispatch for notes not in the exclude list
        if (!(options && options.exclude && options.exclude === note)) {
          this.$store.dispatch('NOTE_UPDATE', {
            changes: {
              listTop: top,
              listLeft: left,
            },
            note,
          });
        }
        top += note.height + marginTop;
      });
    },
    async calculateFontSizeAndHeight() {
      if (!this.$refs.textarea) {
        return;
      }
      this.height = this.value.height;
      while ((this.$refs.textarea.scrollHeight > this.$refs.textarea.offsetHeight ||
        this.$refs.textarea.scrollWidth > this.$refs.textarea.offsetWidth) && this.fontSize > 10) {
        // eslint-disable-next-line
        await Vue.nextTick(() => {
          if (this.height < 20
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
        this.value.height = this.height;
      });
    },
    setColor(position, colorId) {
      const colors = Note.changeColor(this.value.colors, position, colorId);
      this.$store.dispatch('NOTE_UPDATE', { changes: { colors }, note: this.value });
      this.$store.commit(types.LAYOUT_UPDATE, { lastUsedColors: colors });
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
    ImageZone,
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
  /* pic mode
  background-color: transparent !important;
  background-image: url("data:image/png;base64,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");
  */
}

.note.list-mode {
  background-color: transparent !important;
}

.note .text-box {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: 4px;
  /* pic mode */
  /*
  padding-top: 100px;
  */

}

.note.list-mode .text-box {
  margin: 0 4px;
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

  text-align: left;
}

.note .icons {
  position: absolute;
  bottom: -12px;
  right: -12px;
}

.note.list-mode .icons {
  position: absolute;
  bottom: 0;
  right: -25%;
}

.note .icons .btn {
  margin: 0;
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
