<template>
  <div @click.prevent.stop @wheel="handleWheel" class="draggable note" :class="{'list-mode': listMode, dragging: dragging, 'no-sticky': !value.showAsSticky}" :style="{'background-color': colorsBG[color], height: `${height}%`, left: `${left}%`, top: `${top}%`, 'box-shadow': boxShadow, opacity, transform}">
    <div class="colors" v-if="isEdit && $store.state.isEditable">
      <color-selector :style="{transform: `rotateZ(${-angle}deg)`}" v-for="(colorIndex, i) in value.colors" :value="colorIndex" @input="setColor(i, $event)" :key="i" :small="i > 0" :canDelete="i > 0" :direction="direction"></color-selector>
      <color-selector :style="{transform: `rotateZ(${-angle}deg)`}" @input="setColor(value.colors.length, $event)" small v-show="value.colors.length < 6" :hide="value.colors" :direction="direction"></color-selector>
    </div>
    <div class="icons">
      <v-spacer v-if="listMode"></v-spacer>
      <v-btn @mouseover="moveToTop" v-tooltip:bottom="{ html: value.description }" v-if="value.description" flat icon primary small class="description" light @click.native.prevent.stop="showNoteOptions">
        <v-icon>description</v-icon>
      </v-btn>
      <v-spacer v-if="!listMode"></v-spacer>
      <v-btn v-if="isEdit" flat icon primary small class="show-detail" light @click.native.prevent.stop="showNoteOptions()">
        <v-icon>mode_edit</v-icon>
      </v-btn>
      <v-btn v-if="value.type=== 'vp' || value.type=== 'cs'" flat icon primary small class="zoom" light @click.native="zoom()">
        <v-icon>zoom_in</v-icon>
      </v-btn>
    </div>
    <!-- needed for textarea sizing bug -->
    <div class="text-box" @click.prevent.stop :style="{'background-image': `url(${value.image})`}" :class="{image: value.image}">
      <textarea placeholer="text" @click.prevent.stop ref="textarea" class="text" :class="{'hide-label': !value.showLabel}" :value="value.text" @input="updateText" @focus="handleFocus" @keyup="handleKeyUp($event)" :style="{'font-size': `${fontSize}px`}"></textarea>
    </div>
    <div class="calcvar-display">
      <div class="calcvar-display-b" @click.prevent.stop="showNoteOptions(true)" v-if="calcResults[value.calcId] && value.calcDisplayB" v-tooltip:bottom="{ html: value.calcDisplayB }">
        {{this.calcResults[value.calcId][value.calcDisplayB] | humanformat}}
      </div>
      <div class="calcvar-display-r" @click.prevent.stop="showNoteOptions(true)" v-if="calcResults[value.calcId] && value.calcDisplayR" v-tooltip:bottom="{ html: value.calcDisplayR }">
        {{this.calcResults[value.calcId][value.calcDisplayR] | humanformat}}
      </div>
      <div class="calcvar-display-g" @click.prevent.stop="showNoteOptions(true)" v-if="calcResults[value.calcId] && value.calcDisplayG" v-tooltip:bottom="{ html: value.calcDisplayG }">
        {{this.calcResults[value.calcId][value.calcDisplayG] | humanformat}}
      </div>
    </div>

  </div>
</template>

<script>
import debounce from 'lodash.debounce';
import isEqual from 'lodash.isequal';
import interact from 'interactjs';
import Vue from 'vue';
import { mapState, mapGetters } from 'vuex';
import ImageZone from '@/components/ImageZone';
import Note from '@/models/Note';
import ColorSelector from '@/components/ColorSelector';
import * as types from '@/store/mutation-types';
import { VPC_VP_TYPES, VPC_CS_TYPES, VPC_TYPES } from '@/store';
import { COLORS_MATERIAL_DARK, COLORS_MATERIAL } from '@/utils';


const MAX_FONT_SIZE = 22;
const MAX_HEIGHT = 20;

export default {
  name: 'note',
  props: ['value', 'parent'],
  data() {
    return {
      x: 0,
      y: 0,
      dx: 0,
      height: MAX_HEIGHT,
      dragging: false,
      dragStartType: '',
      fontSize: MAX_FONT_SIZE,
      colorList: COLORS_MATERIAL_DARK,
      colorsBG: COLORS_MATERIAL,
      opacity: 1,
      boxShadow: '',
    };
  },
  mounted() {
    this.debouncedCalculateFontSizeAndHeight = this.createDebouncedCalculateFontSizeAndHeight();
    window.addEventListener('resize', this.debouncedCalculateFontSizeAndHeight);
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
          this.dragStartType = this.value.type;
          this.dragging = true;
          this.x = this.$el.offsetLeft;
          this.y = this.$el.offsetTop;
          this.moveToTop();
        },
        onmove: (event) => {
          this.x += event.dx;
          this.y += event.dy;
          this.dx = event.dx;
          const left = (parseFloat(this.x) / this.parent.offsetWidth) * 100;
          const top = (parseFloat(this.y) / this.parent.offsetHeight) * 100;

          let type = '';
          if (event.dropzone) {
            type = event.dropzone.target.getAttribute('id');
          } else {
            type = this.parent.getAttribute('data-none');
          }
          if (this.listMode) {
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
          if (this.$store.state.layout.selectedVP && VPC_VP_TYPES.indexOf(newtype) > 0) {
            payload.changes.parent = this.$store.state.layout.selectedVP.id;
          }
          if (this.$store.state.layout.selectedCS && VPC_CS_TYPES.indexOf(newtype) > 0) {
            payload.changes.parent = this.$store.state.layout.selectedCS.id;
          }
          this.$store.dispatch('NOTE_UPDATE', payload);

          // update list modes
          this.sortSortable(newtype);

          if (this.dragStartType !== newtype) {
            this.sortSortable(this.dragStartType);
          }

          // update free mode
          if (this.listMode) {
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
      });
    /*
    .gesturable({
      onmove: (event) => {
        // TODO: support angle?
        const angle = this.value.angle || 0;
        this.$store.dispatch('NOTE_MOVE', { note: this.value, angle: angle + event.da });
        console.log('TODO support angle touch', event);
      },
    });
    */
    Vue.nextTick(() => {
      this.calculateFontSizeAndHeight().then(() => {
        this.$refs.textarea.focus();
      });
      this.setBoxShadow();
      this.setOpacity();
    });
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.debouncedCalculateFontSizeAndHeight);
  },
  computed: {
    ...mapGetters(['canvasSettings']),
    ...mapState({
      calcResults: 'calcResults',
    }),
    colorsVisibility() {
      return this.canvasSettings.colorsVisibility;
    },
    listMode() {
      return this.canvasSettings.listMode;
    },
    colors() {
      return this.value.colors;
    },
    color() {
      return this.value.colors[0];
    },
    direction() {
      return this.value.top > 70 ? 'top' : 'bottom';
    },
    isEdit() {
      return this.$store.state.layout.focusedNote && this.value &&
        this.$store.state.layout.focusedNote.id === this.value.id;
    },
    left() {
      return this.listMode ? this.value.listLeft : this.value.left;
    },
    top() {
      return this.listMode ? this.value.listTop : this.value.top;
    },
    angle() {
      return this.listMode ? 0 : this.value.angle;
    },
    transform() {
      if (this.dragging) {
        return `rotateZ(${this.angle - (this.dx > 0 ? Math.min(this.dx, 8) : Math.max(this.dx, -8))}deg)`;
      }
      return `rotateZ(${this.angle}deg)`;
    },
    showAsSticky() {
      return this.value.showAsSticky;
    },
  },
  watch: {
    isEdit(val) {
      if (!val) {
        this.removeIfEmpty();
        this.sortSortable(this.value.type);
      }
    },
    colors(after, before) {
      if (!isEqual(after, before)) {
        this.setOpacity();
        this.setBoxShadow();
      }
    },
    colorsVisibility(after, before) {
      if (!isEqual(after, before)) {
        this.setOpacity();
      }
    },
    showAsSticky(after, before) {
      if (after !== before) {
        this.setBoxShadow();
      }
    },
    listMode(after, before) {
      if (after !== before) {
        this.setBoxShadow();
      }
    },
  },
  methods: {
    setOpacity() {
      // calculate visibility based on colors
      this.opacity = this.colorsVisibility.reduce((totalOpacity, opacity, colorId) => {
        if (this.value.colors.includes(colorId)) {
          totalOpacity += opacity;
        }
        return Math.min(totalOpacity, 1);
      }, 0);
    },
    setBoxShadow() {
      this.boxShadow = this.value.colors.reduce((shadows, colorCode, i) => {
        if (this.listMode || !this.value.showAsSticky) {
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
    showNoteOptions(showNoteOptionsCalc) {
      const payload = {
        showNoteOptions: true,
        focusedNote: this.value,
      };
      if (typeof showNoteOptionsCalc !== 'undefined') {
        payload.showNoteOptionsCalc = showNoteOptionsCalc;
      }
      this.$store.commit(types.LAYOUT_UPDATE, payload);
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
      this.debouncedCalculateFontSizeAndHeight();
    },
    moveToTop() {
      this.$store.dispatch('NOTE_MOVE_TOP', this.value['.key']);
    },
    handleFocus() {
      this.$store.commit(types.LAYOUT_UPDATE, { focusedNote: this.value });
      this.moveToTop();
    },
    handleWheel(e) {
      if (!this.listMode) {
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
        ordered = ordered.filter(((note) => {
          let matched = false;
          if (this.$store.state.layout.selectedVP) {
            matched = note.parent === this.$store.state.layout.selectedVP.id;
          }
          if (!matched && this.$store.state.layout.selectedCS) {
            matched = note.parent === this.$store.state.layout.selectedCS.id;
          }
          return matched;
        }));
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
        if (!(options && options.exclude && options.exclude.id === note.id)) {
          this.$store.dispatch('NOTE_MOVE', {
            listTop: top,
            listLeft: left,
            note,
          });
        }
        top += note.height + marginTop;
      });
    },
    createDebouncedCalculateFontSizeAndHeight() {
      return debounce(this.calculateFontSizeAndHeight, 300);
    },
    async calculateFontSizeAndHeight() {
      if (!this.$refs.textarea) {
        return;
      }
      let notMaxedOut = true;
      this.height = MAX_HEIGHT;
      // if scrollWidth > width > && font-size limit not reached shrink
      while ((this.$refs.textarea.scrollWidth > this.$refs.textarea.offsetWidth)
        && this.fontSize > 10) {
        // eslint-disable-next-line
        await Vue.nextTick(() => {
          this.fontSize -= 1;
        });
      }
      // if scrollHeight > height && font-size limit not reached shrink
      while ((this.$refs.textarea.scrollHeight > this.$refs.textarea.offsetHeight) && notMaxedOut) {
        // eslint-disable-next-line
        await Vue.nextTick(() => {
          if (this.height < 15) {
            this.height += 0.1;
          } else if (this.fontSize > 10) {
            this.fontSize -= 1;
          } else {
            notMaxedOut = false;
          }
        });
      }
      // expand
      notMaxedOut = true;
      while (this.$refs.textarea.scrollWidth === this.$refs.textarea.offsetWidth
        && this.$refs.textarea.scrollHeight === this.$refs.textarea.offsetHeight && notMaxedOut) {
        // eslint-disable-next-line
        await Vue.nextTick(() => {
          if (this.fontSize < MAX_FONT_SIZE) {
            this.fontSize += 1;
          } else {
            if (this.value.image && this.height < 6.5 && this.listMode) {
              notMaxedOut = false;
            }
            if (this.value.image && this.height < 15 && !this.listMode) {
              notMaxedOut = false;
            }
            this.height -= 0.1;
          }
        });
      }
      Vue.nextTick(() => {
        this.fontSize -= 2; // should be 1 but 2 works better
        this.$store.dispatch('NOTE_MOVE_LOCAL', { note: this.value, height: this.height });
        if (this.listMode) {
          this.sortSortable(this.value.type);
        }
      });
    },
    setColor(position, colorId) {
      const colors = Note.changeColor(this.value.colors, position, colorId);
      this.$store.dispatch('NOTE_UPDATE', { changes: { colors }, note: this.value });
      this.$store.dispatch('canvasUserSettingsUpdate', { lastUsedColors: colors });
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
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease, background-color 0.2s ease;
}

.note.dragging {
  box-shadow: 0px 3px 4px rgba(0, 0, 0, 0.4) !important;
}

.note.list-mode.dragging {
  background-color: #fff !important;
}

.note.dragging .colors {
  opacity: 0;
}

.note:not(.list-mode).no-sticky {
  background-color: transparent !important;
}

.note.list-mode {
  background-color: transparent !important;
  width: 18%;
}

.note .text-box {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: 4px;
}

.note .text-box.image {
  background-position: 50% 50%;
  background-size: contain;
}

.note .text-box.image textarea {
  text-shadow: 1px 1px 1px #b5b5b5;
}

.note.list-mode .text-box.image {
  background-position: 100% 50%;
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
  font-family: 'Itim', cursive, sans-serif;
  color: #333;
}

.note:not(.list-mode) textarea.hide-label {
  opacity: 0;
}

.note.list-mode textarea {
  text-align: left;
}

.note .icons {
  position: absolute;
  bottom: -12px;
  right: -12px;
  left: -12px;
  z-index: 1;
  display: flex;
  pointer-events: none;
}

.note.list-mode .icons {
  position: absolute;
  bottom: 0;
}

.note .icons .btn {
  margin: 0;
  pointer-events: all;
}

.colors {
  position: absolute;
  top: -50px;
  left: -40px;
  display: flex;
  align-items: flex-start;
  opacity: 1;
  transition: opacity 0.1s ease;
}

.colors .btn {
  margin: 4px;
}

.btn--floating.btn--small .icon:not(:only-of-type):last-of-type {
  left: calc(50% - 9px);
  top: calc(50% - 9px);
}


.note .calcvar-display {
  position: absolute;
  top: -20px;
  right: -20px;
  display: flex;
}

.note .calcvar-display>div {
  box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 2px;
  border-radius: 255px 15px 225px 15px/15px 225px 15px 255px;
  padding: 4px;
  font-family: 'Itim', cursive;
  font-weight: bold;
  margin: 0 4px;
}

.note .calcvar-display-r {
  color: #D32F2F;
  background-color: rgba(229, 115, 115, 0.7);
}

.note .calcvar-display-g {
  color: #558B2F;
  background-color: rgba(139, 195, 74, 0.7);
}

.note .calcvar-display-b {
  color: #2196F3;
  background-color: rgba(144, 202, 249, 0.7);
}
</style>
