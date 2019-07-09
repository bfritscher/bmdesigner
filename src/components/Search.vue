<template>
  <div class="search-frame"></div>
</template>

<script>
import { mapGetters } from "vuex";
import { COLORS_MATERIAL_DARK, TYPE_NAMES, ICONS } from "@/utils";

export default {
  data() {
    return {
      displayResults: false,
      COLORS_MATERIAL_DARK,
      TYPE_NAMES,
      showResults: false,
      ICONS
    };
  },
  computed: {
    ...mapGetters(["userSettings"])
  },
  methods: {}
};
</script>

<style></style>
