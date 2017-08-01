<template>
  <div ref="canvas" class="canvas overlay overlay--active" @click.prevent.stop="addNote($event)">
    <div class="paper" id="paper">
      <v-card class="elevation-10" style="position:absolute; left: 0; top:0; width: 40%; min-width:408px; bottom: 0">
        <v-toolbar class="grey darken-1" dark dense style="left: 0; top: -48px; position: absolute;">
          <v-menu :nudge-width="100" offset-y>
            <v-toolbar-title slot="activator">
              <span>All</span>
              <v-icon dark>arrow_drop_down</v-icon>
            </v-toolbar-title>
            <v-list>
              <v-list-tile v-for="item in ['test', 'test2']" :key="item">
                <v-list-tile-title v-text="item"></v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
          <v-spacer></v-spacer>
          <v-btn icon>
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <zone id="features" label="Products & Services" style="left: 0; top: 0; width: 50%; height: 100%; background-color: white;"></zone>
        <zone id="solution" label="Solutions" style="left: 50%; top: 0; width: 50%; height: 100%; background-color: white;"></zone>
      </v-card>

      <v-card class="elevation-10" style="position:absolute; left: 60%; top:0; width: 40%; min-width:408px; bottom: 0">
        <v-toolbar class="grey darken-1" dark dense style="left: 0; top: -48px; position: absolute;">
          <v-menu :nudge-width="100" offset-y>
            <v-toolbar-title slot="activator">
              <span>All</span>
              <v-icon dark>arrow_drop_down</v-icon>
            </v-toolbar-title>
            <v-list>
              <v-list-tile v-for="item in ['test', 'test2']" :key="item">
                <v-list-tile-title v-text="item"></v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
          <v-spacer></v-spacer>
          <v-btn icon>
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <zone id="pain_gain" label="Pains & Gains" style="left: 0; top: 0; width: 50%; height: 100%;  background-color: white;"></zone>
        <zone id="job" label="Job to be done" style="left: 50%; top: 0; width: 50%; height: 100%;  background-color: white;"></zone>
      </v-card>
      <note v-for="(n, i) in notes" :value="n" :key="i"></note>
    </div>
  </div>
</template>

<script>
import Note from '@/components/Note';
import Zone from '@/components/Zone';

export default {
  name: 'vpc',
  components: {
    Note,
    Zone,
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

</style>
