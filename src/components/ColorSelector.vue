<template>
  <v-speed-dial
    class="color-selector"
    :class="{ 'top-index': isOpen }"
    :direction="direction"
    v-model="isOpen"
    :transition="transition"
  >
    <template v-slot:activator>
      <v-btn
        :class="[
          { 'color-selector-bg': value === -1 },
          COLORS_MATERIAL_DARK[value]
        ]"
        text
        outline
        fab
        :light="value === -1"
        v-model="isOpen"
        :small="small"
      >
        <v-icon>{{ value > -1 ? (small ? "" : "color_lens") : "add" }}</v-icon>
        <v-icon>close</v-icon>
      </v-btn>
    </template>
    <v-btn
      v-for="(colorCode, colorId) in COLORS_MATERIAL_DARK"
      :class="colorCode"
      fab
      small
      @click="setColor(colorId)"
      v-show="value !== colorId && hide.indexOf(colorId) === -1"
      :key="colorId"
    ></v-btn>
    <v-btn
      class="color-selector-bg"
      text
      outline
      fab
      small
      light
      :class="'direction-' + direction"
      v-if="canDelete"
      @click="setColor(value)"
    >
      <v-icon>format_color_reset</v-icon>
    </v-btn>
  </v-speed-dial>
</template>

<script>
import Vue from "vue";
import { COLORS_MATERIAL_DARK } from "@/utils";

export default {
  name: "color-selector",
  props: {
    canDelete: {
      default: false,
      type: Boolean
    },
    value: {
      default: -1,
      type: Number
    },
    small: {
      default: false,
      type: Boolean
    },
    hide: {
      default: () => [],
      type: Array
    },
    direction: {
      default: "bottom",
      type: String
    }
  },
  data() {
    return {
      isOpen: false,
      COLORS_MATERIAL_DARK
    };
  },
  computed: {
    transition() {
      return this.direction === "top"
        ? "slide-y-transition"
        : "slide-y-reverse-transition";
    }
  },
  methods: {
    setColor(colorId) {
      this.$emit("input", colorId);
    }
  },
  watch: {
    isOpen(val) {
      if (val && this.hide.length === 5) {
        let last = 0;
        while (this.hide.indexOf(last) > -1) {
          last += 1;
        }
        this.$emit("input", last);
        Vue.nextTick(() => {
          this.isOpen = false;
        });
      }
    }
  }
};
</script>

<style>
.color-selector.top-index {
  z-index: 99;
}

.color-selector-bg {
  background-color: rgba(255, 255, 255, 0.8) !important;
}

.color-selector .direction-top {
  position: absolute;
  left: 0;
  bottom: -96px;
}

.color-selector .direction-bottom {
  position: absolute;
  left: 0;
  top: -96px;
}
</style>
