<template>
  <div>
    <div class="canvas" @click.prevent.stop="addNote($event)">
      <div ref="paper" class="paper elevation-10" data-none="bmc_tmp">
        <zone dropzone-accept=".note-bmc" id="c" label="Cost Structure" style="left: 0; top: 75%; width: 50%; height: 25%"></zone>
        <zone dropzone-accept=".note-bmc" id="pn" label="Partner Network" style="left: 0; top:0; width: 20%; height: 75%"></zone>
        <zone dropzone-accept=".note-bmc" id="ka" label="Key Activities" style="left: 20%; top:0; width: 20%; height: 37.5%"></zone>
        <zone dropzone-accept=".note-bmc" id="kr" label="Key Resources" style="left: 20%; top:37.5%; width: 20%; height: 37.5%"></zone>
        <zone dropzone-accept=".note-bmc" id="vp" class="highlight" :class="{'highlight-on': selectedCS && !selectedVP, 'elevation-10': selectedCS && !selectedVP}" label="Value Proposition" style="left: 40%; top:0; width: 20%; height: 75%"></zone>
        <zone dropzone-accept=".note-bmc" id="cr" label="Customer Relationships" style="left: 60%; top:0; width: 20%; height: 37.5%"></zone>
        <zone dropzone-accept=".note-bmc" id="dc" label="Distribution Channels" style="left: 60%; top:37.5%; width: 20%; height: 37.5%"></zone>
        <zone dropzone-accept=".note-bmc" id="cs" class="highlight" :class="{'highlight-on': !selectedCS && selectedVP, 'elevation-10': !selectedCS && selectedVP}" label="Customer Segments" style="left: 80%; top:0; width: 20%; height: 75%"></zone>
        <zone dropzone-accept=".note-bmc" id="r" label="Revenue Streams" style="left: 50%; top: 75%; width: 50%; height: 25%"></zone>
        <transition-group name="note-transition" tag="div">
          <note v-for="(note, i) in notesBMC" :value="note" :key="note.id" class="note-bmc highlight" :class="{'highlight-on': (selectedCS && !selectedVP && note.type==='vp') || (!selectedCS && selectedVP && note.type==='cs')}" :parent="$refs.paper"></note>
        </transition-group>
      </div>
    </div>
    <vpc></vpc>
  </div>
</template>

<script>
import Note from '@/components/Note';
import Zone from '@/components/Zone';
import Vpc from '@/components/VPC';
import { mapGetters, mapState } from 'vuex';
import { totalOffset } from '@/utils';

export default {
  name: 'bmc',
  computed: {
    ...mapGetters(['notesBMC']),
    ...mapState({
      selectedVP: state => state.layout.selectedVP,
      selectedCS: state => state.layout.selectedCS,
    }),
  },
  methods: {
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
        type: 'bmc_tmp',
      };

      if (e.target.classList.contains('zone')) {
        note.type = e.target.getAttribute('id');
      }
      this.$store.dispatch('NOTE_CREATE', note);
    },
  },
  components: {
    Note,
    Zone,
    Vpc,
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

.highlight {
  z-index: 0;
  transition: z-index 0.5s step-end !important;
}

.highlight-on {
  z-index: 1;
  transition: z-index 0.5s step-start !important;
}
</style>
