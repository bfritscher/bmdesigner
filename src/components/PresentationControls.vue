<template>
  <div class="presentation-controls">
    <div class="presentation-nav">
      <v-btn icon @click="presentationPrevious">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <v-btn icon @click="presentationNext">
        <v-icon>arrow_forward</v-icon>
      </v-btn>
      <v-btn
        icon
        :class="{ 'white--text': $store.state.layout.showDrawSurface }"
        @click="
          $store.dispatch('layoutUpdate', {
            showDrawSurface: !$store.state.layout.showDrawSurface
          })
        "
      >
        <v-icon>gesture</v-icon>
      </v-btn>
      <v-btn icon @click="toggleFullscreen">
        <v-icon>
          {{ isFullscreen ? "fullscreen_exit" : "fullscreen" }}
        </v-icon>
      </v-btn>
    </div>
    <span
      v-if="canvas && canvas.notesPresentationOrder"
      class="presentation-index"
    >
      {{
        canvas.notesPresentationOrder.indexOf(canvas.currentPresentationKey) + 1
      }}
      / {{ canvas.notesPresentationOrder.length }}
    </span>
    <v-btn icon @click="presentationExit" class="presentation-exit">
      <v-icon>close</v-icon>
    </v-btn>
  </div>
</template>

<script>
import fscreen from "fscreen"; // TODO #77: remove when vendor prefix no longer required
import { mapActions, mapState } from "vuex";

export default {
  name: "PresentationControls",
  data() {
    return {
      isFullscreen: false
    };
  },
  computed: {
    ...mapState({
      canvas: state => state.canvas
    })
  },
  methods: {
    ...mapActions([
      "presentationNext",
      "presentationPrevious",
      "presentationExit"
    ]),
    toggleFullscreen() {
      if (fscreen.fullscreenElement) {
        fscreen.exitFullscreen();
        this.isFullscreen = false;
      } else {
        fscreen.requestFullscreen(document.body);
        this.isFullscreen = true;
      }
    }
  }
};
</script>

<style>
.presentation-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  top: 0;
  right: 0;
  pointer-events: none;
}

.presentation-controls .presentation-index {
  position: absolute;
  left: 0;
  bottom: 8px;
  right: 0;
  text-align: center;
}

.presentation-controls .presentation-exit {
  position: absolute;
  top: 4px;
  right: 0;
}

.presentation-controls .presentation-nav {
  position: absolute;
  bottom: 0;
  left: 44px;
}

.presentation-controls .v-btn--icon {
  pointer-events: auto;
}

.presentation-controls .v-btn--icon:hover {
  color: white;
}
</style>
