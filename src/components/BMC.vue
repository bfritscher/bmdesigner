<template>
  <div>
    <div class="credits caption" ><a href="https://strategyzer.com/canvas/business-model-canvas" target="_blank">The Business Model Canvas</a> by <a href="http://strategyzer.com" target="_blank">Strategyzer AG</a> is licensed under <a href="http://creativecommons.org/licenses/by-sa/3.0" target="_blank">CC BY-SA 3.0</a></div>
    <image-zone :allow-click="false" @image-drop="addNote" class="canvas" @click.native.prevent.stop="addNote($event)">
      <div ref="paper" class="paper elevation-10" data-none="bmc_tmp">

        <v-progress-linear transition="slide-y-transition" class="ma-0" v-if="isLoading" :indeterminate="true"></v-progress-linear>

        <zone dropzone-accept=".note-bmc" id="c" label="Cost Structure" style="left: 0; top: 75%; width: 40%; height: 25%">
          <v-icon light slot="icon">account_balance</v-icon>
        </zone>
        <zone dropzone-accept=".note-bmc" id="pn" label="Partner Network" style="left: 0; top:0; width: 20%; height: 75%">
          <v-icon light slot="icon">share</v-icon>
        </zone>
        <zone dropzone-accept=".note-bmc" id="ka" label="Key Activities" style="left: 20%; top:0; width: 20%; height: 37.5%">
          <v-icon light slot="icon">settings</v-icon>
        </zone>
        <zone dropzone-accept=".note-bmc" id="kr" label="Key Resources" style="left: 20%; top:37.5%; width: 20%; height: 37.5%">
          <v-icon light slot="icon">store</v-icon>
        </zone>
        <zone dropzone-accept=".note-bmc" id="vp" class="zone-highlight" :class="{'highlight-on': selectedCS && !selectedVP, 'elevation-10': selectedCS && !selectedVP}" label="Value Proposition" style="left: 40%; top:0; width: 20%; height: 75%">
          <v-icon light slot="icon">group_work</v-icon>
        </zone>
        <zone dropzone-accept=".note-bmc" id="cr" label="Customer Relationships" style="left: 60%; top:0; width: 20%; height: 37.5%">
          <v-icon light slot="icon">favorite</v-icon>
        </zone>
        <zone dropzone-accept=".note-bmc" id="dc" label="Distribution Channels" style="left: 60%; top:37.5%; width: 20%; height: 37.5%">
          <v-icon light slot="icon">local_shipping</v-icon>
        </zone>
        <zone dropzone-accept=".note-bmc" id="cs" class="zone-highlight" :class="{'highlight-on': !selectedCS && selectedVP, 'elevation-10': !selectedCS && selectedVP}" label="Customer Segments" style="left: 80%; top:0; width: 20%; height: 75%">
          <v-icon light slot="icon">people</v-icon>
        </zone>
        <zone dropzone-accept=".note-bmc" id="r" label="Revenue Streams" style="left: 60%; top: 75%; width: 40%; height: 25%">
          <v-icon light slot="icon">attach_money</v-icon>
        </zone>
        <div class="logo" light :style="{'background-color': canvas.info.logoColor}">
          <image-zone :allow-click="$store.state.layout.isEditable" :image="canvas.info.logoImage" @update:image="canvasInfoUpdate({logoImage: $event})" :color="canvas.info.logoColor" @update:color="canvasInfoUpdate({logoColor: $event})"></image-zone>
        </div>
        <div>
          <note v-for="(note, i) in notesBMC" :value="note" :key="note.id" class="note-bmc" :class="{'highlight-on': (selectedCS && !selectedVP && note.type==='vp') || (!selectedCS && selectedVP && note.type==='cs')}" :parent="$refs.paper"></note>
        </div>
      </div>
    </image-zone>
    <vpc></vpc>
  </div>
</template>

<script>
import debounce from 'lodash.debounce';
import Note from '@/components/Note';
import Zone from '@/components/Zone';
import Vpc from '@/components/VPC';
import ImageZone from '@/components/ImageZone';
import { mapGetters, mapState, mapActions } from 'vuex';
import { totalOffset } from '@/utils';
import { db } from '@/utils/firebase';

let resizeHandler;

export default {
  name: 'bmc',
  data() {
    return {
      isLoading: false,
    };
  },
  mounted() {
    this.fetchData();
  },
  beforeDestroy() {
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler);
    }
    this.$store.dispatch('unbindCanvas');
  },
  computed: {
    ...mapGetters(['notesBMC', 'canvasSettings']),
    ...mapState({
      selectedVP: state => state.layout.selectedVP,
      selectedCS: state => state.layout.selectedCS,
      canvas: state => state.canvas,
    }),
    listMode() {
      return this.canvasSettings.listMode;
    },
  },
  watch: {
    listMode() {
      // triggers heigh calculations
      window.dispatchEvent(new Event('resize'));
    },
    // call again the method if the route changes
    $route: 'fetchData',
  },
  methods: {
    ...mapActions(['setCanvasRef', 'canvasInfoUpdate']),
    fetchData() {
      this.isLoading = true;
      this.setCanvasRef(db.child('projects').child(this.$route.params.id)).then(() => {
        this.isLoading = false;
      });
      resizeHandler = debounce(this.handleWindowResize, 300);
      window.addEventListener('resize', resizeHandler);
      this.handleWindowResize();
    },
    handleWindowResize() {
      if (!this.$refs.paper) {
        return;
      }
      this.$el.style.setProperty('--zoneLabelFontSize', `${this.$refs.paper.offsetHeight * 0.02}px`);
      this.$el.style.setProperty('--zoneLabelIconFontSize', `${this.$refs.paper.offsetHeight * 0.03}px`);
    },
    addNote(e) {
      const offset = totalOffset(this.$refs.paper);
      const noteCenter = {
        x: this.$refs.paper.offsetWidth / 15,
        y: 20,
      };
      const x = e.x - noteCenter.x - offset.left;
      const y = e.y - noteCenter.y - offset.top;

      const note = {
        left: x / (this.$refs.paper.offsetWidth / 100),
        top: y / (this.$refs.paper.offsetHeight / 100),
        listLeft: x / (this.$refs.paper.offsetWidth / 100),
        listTop: y / (this.$refs.paper.offsetHeight / 100),
        type: 'bmc_tmp',
        colors: this.$store.getters.canvasSettings.lastUsedColors,
        image: e.image,
      };

      if (e.target.classList.contains('zone')) {
        note.type = e.target.getAttribute('id');
      }
      // TODO: keep previous setting?
      if (e.image) {
        note.showAsSticky = false;
      }

      this.$store.dispatch('NOTE_CREATE', note);
    },
  },
  components: {
    Note,
    Zone,
    Vpc,
    ImageZone,
  },
};
</script>

<style scoped>
.canvas {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  display: flex;
  align-content: center;
  justify-content: center;
  flex-direction: column;
  overflow: auto;
}

.paper {
  width: 80vw;
  height: 54.88vw;
  /* height:width ratio = 9/16 = .5625  */
  max-height: calc(100vh - 100px);
  max-width: calc(145.7vh - 100px);
  /* 16/9 = 1.778 */
  min-width: 1024px;
  min-height: 560px;
  margin: auto;
  position: relative;
}

.zone-highlight {
  z-index: 0;
  transition: z-index 0.5s step-end !important;
}

.highlight-on {
  z-index: 1;
  transition: z-index 0.5s step-start !important;
}

.logo {
  position: absolute;
  top: 75%;
  left: 40%;
  width: 20%;
  height: 25%;
  box-shadow: inset 0 0 0px 1px #818181;
  background-color: #fff;
  color: #333;
}

.logo>div {
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
}

.credits {
  position: absolute;
  bottom: 8px;
  right: 8px;
}

.credits a{
  text-decoration: none;
}

@media (max-width: 1024px) {
  .highlight-on{
    z-index: 0;
  }
}
</style>
