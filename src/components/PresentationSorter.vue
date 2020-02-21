<template>
  <v-navigation-drawer
    app
    right
    temporary
    disable-route-watcher
    :value="$store.state.layout.showPresentationSorter"
    @input="layoutUpdate({ showPresentationSorter: $event })"
  >
    <draggable
      v-model="notes"
      tag="ul"
      ghost-class="ghost"
      animation="200"
      draggable=".note-item"
      class="presentation-sorter-list"
    >
      <li
        class="note-item"
        v-for="note in notes"
        :data-key="note['.key']"
        :key="note['.key']"
        :style="{ 'box-shadow': boxShadow(note) }"
      >
        {{ note.text }}
        <v-icon :title="TYPE_NAMES[note.type]">{{ ICONS[note.type] }}</v-icon>
      </li>
    </draggable>
  </v-navigation-drawer>
</template>
<script>
import Vue from "vue";
import { mapActions } from "vuex";
import draggable from "vuedraggable";
import { COLORS_MATERIAL, totalOffset, ICONS, TYPE_NAMES } from "@/utils";

export default {
  data() {
    return {
      ICONS,
      TYPE_NAMES
    };
  },
  computed: {
    notes: {
      get() {
        if (
          !this.$store.state.canvas ||
          !this.$store.state.canvas.notesPresentationOrder ||
          !this.$store.state.canvas.notes
        ) {
          return [];
        }
        return this.$store.state.canvas.notesPresentationOrder
          .filter(key => key in this.$store.state.canvas.notes)
          .map(key => this.$store.state.canvas.notes[key]);
      },
      set(notes) {
        this.$store.dispatch(
          "setNotesPresentationOrder",
          notes.map(n => n[".key"])
        );
      }
    }
  },
  methods: {
    ...mapActions(["layoutUpdate"]),
    boxShadow(note) {
      if (!note || !note.colors) {
        return "";
      }
      return note.colors
        .reduce((shadows, colorCode, i) => {
          const size = (i + 1) * 5 + i * 2;
          shadows.push(`-${size}px 0px ${COLORS_MATERIAL[colorCode]}`);
          return shadows;
        }, [])
        .join(",");
    }
  },
  components: {
    draggable
  }
};
</script>

<style>
.presentation-sorter-list {
  list-style-type: none;
}

.note-item {
  padding: 2px 24px 2px 4px;
  margin: 4px 0;
  min-height: 20px;
  font-size: 18px;
  font-family: "Itim", cursive, sans-serif;
  position: relative;
  background-color: #fff;
  cursor: move;
}

.ghost {
  padding: 0;
  color: transparent;
  box-shadow: none !important;
  margin-right: 4px;
  border: 2px dashed #455a64;
}

.note-item.ghost .v-icon {
  display: none;
}

.ghost::before {
  content: "Drop here";
  color: #455a64;
  font-weight: bold;
  margin-bottom: -20px;
  margin-left: 4px;
}

.note-item .v-icon {
  position: absolute;
  top: 2px;
  right: 4px;
}
</style>
