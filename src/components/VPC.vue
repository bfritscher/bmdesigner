<template>
  <transition name="vpc-overlay-transition">
    <image-zone ref="vpc" key="vpc" :allow-click="false" @image-drop="addNote" class="canvas overlay-vpc" v-show="showVPC" @click.native.prevent.stop="addNote($event)">
      <div class="paper" ref="paper" data-none="vpc_tmp">
        <transition name="vpc-vp-transition" appear>
          <v-card v-if="vp" class="vpc-vp elevation-10" :class="{'vpc-both': cs && vp}">
            <v-toolbar dense style="left: 0; top: -48px; position: absolute;" :class="COLORS_MATERIAL_DARK[vp.colors[0]]">
              <v-menu :nudge-width="100"  @click.native.prevent.stop>
                <v-toolbar-title slot="activator">
                  <span>{{vp.text}}</span>
                  <v-icon>arrow_drop_down</v-icon>
                </v-toolbar-title>
                <v-list>
                  <v-list-tile v-for="note in notesVP" :key="note.id" @click.native.prevent="LAYOUT_UPDATE({selectedVP: note})" :class="COLORS_MATERIAL_DARK[note.colors[0]]">
                    <v-list-tile-title v-text="note.text"></v-list-tile-title>
                  </v-list-tile>
                </v-list>
              </v-menu>
              <v-spacer></v-spacer>
              <v-btn icon @click.native.prevent.stop="LAYOUT_UPDATE({selectedVP: null})">
                <v-icon>close</v-icon>
              </v-btn>
            </v-toolbar>
            <zone dropzone-accept=".note-vpc" id="features" label="Products & services" style="left: 0; top: 0; width: 50%; height: 100%; background-color: white;">
              <v-icon light slot="icon">extension</v-icon>
            </zone>
            <zone dropzone-accept=".note-vpc" id="solution" label="Solutions" style="left: 50%; top: 0; width: 50%; height: 100%; background-color: white;">
              <v-icon light slot="icon">done_all</v-icon>
            </zone>
          </v-card>
        </transition>
<!--
   <v-progress-circular
      v-show="vp && cs"
      class="fit"
      :size="160"
      :width="30"
      :value="75">
      Fit<br>
      {{ 50 }} %
    </v-progress-circular>
-->
        <transition name="vpc-cs-transition" appear>
          <v-card v-if="cs" class="vpc-cs elevation-10" :class="{'vpc-both': cs && vp}">
            <v-toolbar dark dense style="left: 0; top: -48px; position: absolute;" :class="COLORS_MATERIAL_DARK[cs.colors[0]]">
              <v-menu :nudge-width="100" @click.native.prevent.stop>
                <v-toolbar-title slot="activator">
                  <span>{{cs.text}}</span>
                  <v-icon dark>arrow_drop_down</v-icon>
                </v-toolbar-title>
                <v-list>
                  <v-list-tile v-for="note in notesCS" :key="note.id" @click.native.prevent="LAYOUT_UPDATE({selectedCS: note})" :class="COLORS_MATERIAL_DARK[note.colors[0]]">
                    <v-list-tile-title v-text="note.text"></v-list-tile-title>
                  </v-list-tile>
                </v-list>
              </v-menu>
              <v-spacer></v-spacer>
              <v-btn icon @click.native.stop.prevent="LAYOUT_UPDATE({selectedCS: null})">
                <v-icon>close</v-icon>
              </v-btn>
            </v-toolbar>
            <zone dropzone-accept=".note-vpc" id="pain_gain" label="Gains & pains" style="left: 0; top: 0; width: 50%; height: 100%;  background-color: white;">
              <v-icon light slot="icon">thumbs_up_down</v-icon>
            </zone>
            <zone dropzone-accept=".note-vpc" id="job" label="Job to be done" style="left: 50%; top: 0; width: 50%; height: 100%;  background-color: white;">
              <v-icon light slot="icon">list</v-icon>
            </zone>
          </v-card>
        </transition>
        <transition-group name="note-transition" tag="div">
          <note v-for="n in notesVPC" :value="n" :key="n.id" class="note-vpc"  :class="{'vpc-both': cs && vp}" :parent="$refs.paper"></note>
        </transition-group>
      </div>
    </image-zone>
  </transition>
</template>

<script>
import Vue from 'vue';
import { mapState, mapMutations } from 'vuex';
import { totalOffset, COLORS_MATERIAL_DARK } from '@/utils';
import { VPC_VP_TYPES, VPC_CS_TYPES } from '@/store';
import Note from '@/components/Note';
import Zone from '@/components/Zone';
import ImageZone from '@/components/ImageZone';

export default {
  name: 'vpc',
  data() {
    return {
      COLORS_MATERIAL_DARK,
    };
  },
  computed: {
    notesVPC() {
      let notes = [];
      if (this.vp && this.cs) {
        notes = this.$store.getters.notesVPC.filter(
          note => note.parent === this.vp.id
            || note.parent === this.cs.id
            || !note.parent);
      } else if (this.cs) {
        notes = this.$store.getters.notesVPCcs.filter(
          note => note.parent === this.cs.id
            || !note.parent);
      } else if (this.vp) {
        notes = this.$store.getters.notesVPCvp.filter(
          note => note.parent === this.vp.id
            || !note.parent);
      }
      return notes;
    },
    notesCS() {
      const list = this.$store.getters.getNotesByTypes('cs');
      return [this.cs].concat(list.filter(note => note !== this.cs));
    },
    notesVP() {
      const list = this.$store.getters.getNotesByTypes('vp');
      return [this.vp].concat(list.filter(note => note !== this.vp));
    },
    ...mapState({
      vp: state => state.layout.selectedVP,
      cs: state => state.layout.selectedCS,
      vpcSourceX: state => state.layout.vpcSourceX,
      showVPC: state => state.layout.showVPC,
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
        listLeft: x / (this.$refs.paper.offsetWidth / 100),
        listTop: y / (this.$refs.paper.offsetHeight / 100),
        type: 'vpc_tmp',
        colors: this.$store.getters.lastUsedColors,
        image: e.image,
      };

      if (e.target.classList.contains('zone')) {
        note.type = e.target.getAttribute('id');
        // ignore tmp which is at position 0
        if (VPC_VP_TYPES.indexOf(note.type) > 0) {
          note.parent = this.vp.id;
        }
        if (VPC_CS_TYPES.indexOf(note.type) > 0) {
          note.parent = this.cs.id;
        }
      }
      this.$store.dispatch('NOTE_CREATE', note);
    },
    ...mapMutations(['LAYOUT_UPDATE']),
  },
  watch: {
    // TODO: refactor?
    vp(val, oldVal) {
      if (val) {
        this.$refs.vpc.$el.style.setProperty('--vpc-source-x', `${val.left}%`);
        this.$refs.vpc.$el.style.setProperty('--vpc-source-y', `${val.top}%`);
        this.LAYOUT_UPDATE({ showVPC: true });
      } else {
        this.$refs.vpc.$el.style.setProperty('--vpc-source-x', `${oldVal.left}%`);
        this.$refs.vpc.$el.style.setProperty('--vpc-source-y', `${oldVal.top}%`);
        if (!this.cs && this.showVPC) {
          Vue.nextTick(() => {
            this.LAYOUT_UPDATE({ showVPC: false });
          });
        }
      }
    },
    cs(val, oldVal) {
      console.log(val, 'cs');
      if (val) {
        this.$refs.vpc.$el.style.setProperty('--vpc-source-x', `${val.left}%`);
        this.$refs.vpc.$el.style.setProperty('--vpc-source-y', `${val.top}%`);
        this.LAYOUT_UPDATE({ showVPC: true });
      } else {
        this.$refs.vpc.$el.style.setProperty('--vpc-source-x', `${oldVal.left}%`);
        this.$refs.vpc.$el.style.setProperty('--vpc-source-y', `${oldVal.top}%`);
        if (!this.vp && this.showVPC) {
          Vue.nextTick(() => {
            this.LAYOUT_UPDATE({ showVPC: false });
          });
        }
      }
    },
  },
  components: {
    Note,
    Zone,
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
}

.paper {
  width: 82vw;
  height: calc(54.88vw - 96px);
  min-width: 1024px;
  min-height: 560px;
  max-width: calc(145.7vh);
  max-height: calc(100vh - 196px);
  margin: 48px auto 0 auto;
  position: relative;
}

.overlay-vpc:before {
  background-color: #212121;
  content: "";
  -webkit-filter: blur(10%);
  filter: blur(10%);
  transition: .5s ease;
  opacity: .46;
  left: 0;
  bottom: 0;
  right: 0;
  top: 0;
  position: absolute;
  transition: all 1s ease;
}

.vpc-vp {
  position: absolute;
  left: 0;
  top: 0;
  width: 40%;
  min-width: 408px;
  bottom: 0;
}

.vpc-cs {
  position: absolute;
  left: 60%;
  top: 0;
  width: 40%;
  min-width: 408px;
  bottom: 0;
}

.vpc-both {
  z-index: 2;
}

.vpc-cs-transition-enter-active,
.vpc-cs-transition-leave-active,
.vpc-vp-transition-enter-active,
.vpc-vp-transition-leave-active,
.vpc-overlay-transition-enter-active,
.vpc-overlay-transition-leave-active {
  transition: all 0.5s ease;
}

.vpc-overlay-transition-enter:before,
.vpc-overlay-transition-leave-to:before {
  opacity: 0;
}

.vpc-vp-transition-enter,
.vpc-vp-transition-leave-to,
.vpc-cs-transition-enter,
.vpc-cs-transition-leave-to {
  left: var(--vpc-source-x);
  top: var(--vpc-source-y);
  width: 15%;
  min-width: 0;
  bottom: calc(95% - var(--vpc-source-y));
}

.fit {
  position: absolute;
  left: calc(50% - 80px);
  top: calc(50% - 120px);
}

.vpc .menu .list {
  padding: 0;
}
</style>
