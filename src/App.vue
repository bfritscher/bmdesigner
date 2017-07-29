<template>
  <div id="app">
    <div>
      <div style="height: 100px">

      </div>
      <div id="vpc_cs" class="canvas" @click.prevent.stop="addNote($event)">
        <div class="paper">
          <zone id="features" label="Products & Services" style="left: 0; top: 0; width: 20%; height: 100%"></zone>
          <zone id="solution" label="Solutions" style="left: 20%; top: 0; width: 20%; height: 100%"></zone>
          <zone id="pain_gain" label="Pains & Gains" style="left: 60%; top: 0; width: 20%; height: 100%"></zone>
          <zone id="job" label="Job to be done" style="left: 80%; top: 0; width: 20%; height: 100%"></zone>
          <note v-for="(n, i) in notes" :value="n" :key="i"></note>
        </div>
      </div>
    </div>
      <div>
        <div id="canvas" class="canvas" @click.prevent.stop="addNote($event)">
          <div class="paper">
            <zone id="c" label="Cost Structure" style="left: 0; top: 75%; width: 50%; height: 25%"></zone>
            <zone id="pn" label="Partner Network" style="left: 0; top:0; width: 20%; height: 75%"></zone>
            <zone id="ka" label="Key Activities" style="left: 20%; top:0; width: 20%; height: 37.5%"></zone>
            <zone id="kr" label="Key Resources" style="left: 20%; top:37.5%; width: 20%; height: 37.5%"></zone>
            <zone id="vp" label="Value Proposition" style="left: 40%; top:0; width: 20%; height: 75%"></zone>
            <zone id="cr" label="Customer Relationships" style="left: 60%; top:0; width: 20%; height: 37.5%"></zone>
            <zone id="dc" label="Distribution Channels" style="left: 60%; top:37.5%; width: 20%; height: 37.5%"></zone>
            <zone id="cs" label="Customer Segments" style="left: 80%; top:0; width: 20%; height: 75%"></zone>
            <zone id="r" label="Revenue Streams" style="left: 50%; top: 75%; width: 50%; height: 25%"></zone>
            <note v-for="(n, i) in notes" :value="n" :key="i"></note>
          </div>
        </div>
      </div>

      <router-view></router-view>
  </div>
</template>

<script>
import Note from './components/Note';
import Zone from './components/Zone';

export default {
  name: 'app',
  data() {
    return {
      notes: [{
        x: 0,
        y: 0,
        left: 0,
        top: 0,
      }],
    };
  },
  mounted() {
    this.$root.$on('addNote', (arg) => {
      this.notes.push(arg);
    });
  },
  methods: {
    addNote(e) {
      console.log(e);
      const c = document.getElementById('canvas');
      const x = e.x - 100 - c.offsetLeft;
      const y = e.y - 20 - c.offsetTop;
      this.notes.push({
        x: 0,
        y: 0,
        left: x / (c.offsetWidth / 100),
        top: y / (c.offsetHeight / 100),
      });
    },
  },
  components: {
    Note,
    Zone,
  },
};
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

.paper {
  width: 100vw;
  height: 68.60vw; /* height:width ratio = 9/16 = .5625  */
  max-height: 100vh;
  max-width: 145.7vh; /* 16/9 = 1.778 */
  margin: auto;
  position: relative;
  border: 2px solid blue;
}

.paper {
  width: 100vw;
  height: 68.60vw; /* height:width ratio = 9/16 = .5625  */
  max-height: 100vh;
  max-width: 145.7vh; /* 16/9 = 1.778 */
  margin: auto;
  position: relative;
  border: 2px solid blue;
}

.canvas {
  border: 1px solid red;
  position: relative;
  min-width: 100%;
  min-height: 100%;
}

</style>
