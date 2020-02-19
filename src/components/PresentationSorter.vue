<template>
  <v-navigation-drawer
    app
    @scroll="scroll"
    right
    temporary
    absolute
    disable-route-watcher
    :value="$store.state.layout.showPresentationSorter"
    @input="layoutUpdate({ showPresentationSorter: $event })"
  >
    <ul ref="list" class="presentation-sorter-list">
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
      <li class="note-item last"></li>
      <li ref="placeholder" class="placeholder" style="display:none">
        Drop here
      </li>
    </ul>
  </v-navigation-drawer>
</template>
<script>
import Vue from "vue";
import interact from "interactjs";
import { mapActions } from "vuex";
import { COLORS_MATERIAL, totalOffset, ICONS, TYPE_NAMES } from "@/utils";

export default {
  data() {
    return {
      x: 0,
      y: 0,
      top: 0,
      ICONS,
      TYPE_NAMES
    };
  },
  mounted() {
    interact(".note-item", {
      context: this.$el
    })
      .draggable({
        inertia: true,
        autoScroll: {
          container: this.$el
        },
        onstart: event => {
          this.offset = totalOffset(this.$el);
          this.top = this.$el.scrollTop;
          this.x = event.target.offsetLeft;
          this.y = event.target.offsetTop;
          event.target.style.position = "absolute";
          this.$refs.placeholder.style.display = "flex";
          this.$refs.placeholder.style.height = `${event.target.offsetHeight}px`;
        },
        onmove: event => {
          this.x += event.dx;
          this.y += event.dy;
          event.target.style.left = `${this.x}px`;
          event.target.style.top = `${this.y}px`;
        },
        onend: event => {
          event.target.style.position = "relative";
          this.$refs.placeholder.style.display = "none";
        }
      })
      .dropzone({
        overlap: 0.1,
        ondragenter: event => {
          const draggableElement = event.relatedTarget;
          draggableElement.classList.add("can-drop");
          // get correct dropzone insteand of event.target, fix if scrolled
          const dropzoneElement = document.elementFromPoint(
            this.x + this.offset.left,
            this.y + this.offset.top - this.top
          );
          if (
            dropzoneElement &&
            dropzoneElement.classList.contains("note-item")
          ) {
            dropzoneElement.parentNode.insertBefore(
              this.$refs.placeholder,
              dropzoneElement
            );
          }
        },
        ondragleave: event => {
          // remove the drop feedback style
          event.relatedTarget.classList.remove("can-drop");
        },
        ondrop: event => {
          const draggableElement = event.relatedTarget;
          draggableElement.style.left = 0;
          draggableElement.style.top = 0;
          this.$refs.list.insertBefore(
            draggableElement,
            this.$refs.placeholder
          );
          this.$refs.placeholder.style.display = "none";
          draggableElement.classList.remove("can-drop");
          Vue.nextTick(() => {
            const newList = [
              ...document.getElementsByClassName("note-item")
            ].map(d => d.getAttribute("data-key"));
            // remove last which is null
            newList.pop();
            this.$store.dispatch("setNotesPresentationOrder", newList);
          });
        }
      });
  },
  computed: {
    notes() {
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
    },
    scroll() {
      this.y -= this.top - this.$el.scrollTop;
      this.top = this.$el.scrollTop;
    }
  }
};
</script>

<style>
.placeholder {
  border: 2px dashed #455a64;
  margin-right: 4px;
  color: #455a64;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}

.last {
  opacity: 0;
}

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
}

.note-item .v-icon {
  position: absolute;
  top: 2px;
  right: 4px;
}

.note-item.can-drop {
  pointer-events: none;
  z-index: 3;
}
</style>
