<template>
  <div id="app">
    <header>
      <span>Vue.js PWA</span>
    </header>
    <main>
      <div class="canvas" @click.prevent.stop="addNote($event)">
        <zone id="vp"></zone>
        <zone id="cs"></zone>

        <note v-for="(n, i) in notes" :value="n" :key="i"></note>
      </div>
      <img src="./assets/logo.png" alt="Vue.js PWA">
      <router-view></router-view>
    </main>
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
      this.notes.push({
        x: e.layerX - 100,
        y: e.layerY - 20,
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

.canvas {
  border: 1px solid red;
  position: relative;
}

body {
  margin: 0;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

main {
  text-align: center;
  margin-top: 40px;
}

header {
  margin: 0;
  height: 56px;
  padding: 0 16px 0 24px;
  background-color: #35495E;
  color: #ffffff;
}

header span {
  display: block;
  position: relative;
  font-size: 20px;
  line-height: 1;
  letter-spacing: .02em;
  font-weight: 400;
  box-sizing: border-box;
  padding-top: 16px;
}
</style>
