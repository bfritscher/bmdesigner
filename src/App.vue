<template>
  <v-app dark toolbar>
    <v-navigation-drawer class="drawer" persistent enable-resize-watcher clipped v-model="drawer">
      <!--
                      <v-list dense>
                        <v-list-tile v-for="item in items" :key="item.text">
                          <v-list-tile-action>
                            <v-icon>{{ item.icon }}</v-icon>
                          </v-list-tile-action>
                          <v-list-tile-content>
                            <v-list-tile-title>
                              {{ item.text }}
                            </v-list-tile-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-subheader class="mt-3 grey--text text--darken-1">SUBSCRIPTIONS</v-subheader>
                        <v-list>
                          <v-list-tile v-for="item in items2" :key="item.text" avatar>
                            <v-list-tile-avatar>
                              <img :src="`https://randomuser.me/api/portraits/men/${item.picture}.jpg`" alt="">
                            </v-list-tile-avatar>
                            <v-list-tile-title v-text="item.text"></v-list-tile-title>
                          </v-list-tile>
                        </v-list>
                        <v-list-tile class="mt-3">
                          <v-list-tile-action>
                            <v-icon class="grey--text text--darken-1">add_circle_outline</v-icon>
                          </v-list-tile-action>
                          <v-list-tile-title class="grey--text text--darken-1">Browse Channels</v-list-tile-title>
                        </v-list-tile>
                        <v-list-tile>
                          <v-list-tile-action>
                            <v-icon class="grey--text text--darken-1">settings</v-icon>
                          </v-list-tile-action>
                          <v-list-tile-title class="grey--text text--darken-1">Manage Subscriptions</v-list-tile-title>
                        </v-list-tile>
                      </v-list>
                      -->
    </v-navigation-drawer>
    <v-toolbar fixed>
      <v-toolbar-side-icon @click.native.stop.prevent="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>BM|DESIGNER</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-title>Value Proposition Canvas</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon>
        <v-icon>more_vert</v-icon>
      </v-btn>
    </v-toolbar>
    <main>
      <v-container fluid style="position: relative">

        <div id="canvas" class="canvas vertical-center absolute" @click.prevent.stop="addNote($event)">
          <div class="paper elevation-10" id="paper">
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

        <div id="canvas" class="canvas vertical-center absolute overlay overlay--active" @click.prevent.stop="addNote($event)">
          <div class="paper2" id="paper">
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

        <router-view></router-view>
        </v-layout>
      </v-container>
    </main>
  </v-app>
</template>

<script>
import Note from './components/Note';
import Zone from './components/Zone';

function totalOffset(node) {
  const offsetTotal = {
    top: 0,
    left: 0,
  };
  while (node) {
    offsetTotal.top += node.offsetTop;
    offsetTotal.left += node.offsetLeft;
    // eslint-disable-next-line
    node = node.offsetParent;
  }
  return offsetTotal;
}

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
      drawer: true,
    };
  },
  mounted() {
    this.$root.$on('addNote', (arg) => {
      this.notes.push(arg);
    });
    this.$root.$on('removeNote', (arg) => {
      const index = this.notes.indexOf(arg);
      if (index > -1) {
        this.notes.splice(index, 1);
      }
    });
  },
  methods: {
    addNote(e) {
      const c = document.getElementById('paper');
      const offset = totalOffset(c);
      const noteCenter = {
        x: 100,
        y: 20,
      };
      const x = e.x - noteCenter.x - offset.left;
      const y = e.y - noteCenter.y - offset.top;

      const note = {
        x: 0,
        y: 0,
        left: x / (c.offsetWidth / 100),
        top: y / (c.offsetHeight / 100),
        text: '',
      };

      if (e.target.classList.contains('zone')) {
        note.text = e.target.getAttribute('id');
      }
      this.notes.push(note);
    },
  },
  components: {
    Note,
    Zone,
  },
};
</script>

<style>
html {
  overflow-y: auto;
}

body {
  font-family: 'Open Sans';
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
  background-color: white;
}

.paper2 {
  width: 82vw;
  height: calc(54.88vw - 96px);
  min-width: 1024px;
  min-height: 560px;
  max-width: calc(145.7vh);
  max-height: calc(100vh - 196px);
  margin: 48px auto 0 auto;
  position: relative;
}


.canvas {
  position: relative;
}

.vertical-center {
  flex: 1;
  display: flex;
  align-content: center;
  justify-content: center;
  flex-direction: column;
}

.vertical-center>* {
  flex-shrink: 0;
}

.navigation-drawer {
  width: 240px;
}


.absolute {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
}

.navigation-drawer--permanent.navigation-drawer--open:not(.navigation-drawer--right):not(.navigation-drawer--clipped):not(.navigation-drawer--floating)~.toolbar,
.navigation-drawer--permanent.navigation-drawer--open:not(.navigation-drawer--right)~.footer:not(.footer--fixed):not(.footer--absolute),
.navigation-drawer--permanent.navigation-drawer--open:not(.navigation-drawer--right)~main,
.navigation-drawer--persistent:not(.navigation-drawer--is-mobile).navigation-drawer--open:not(.navigation-drawer--right):not(.navigation-drawer--clipped):not(.navigation-drawer--floating)~.toolbar,
.navigation-drawer--persistent:not(.navigation-drawer--is-mobile).navigation-drawer--open:not(.navigation-drawer--right)~.footer:not(.footer--fixed):not(.footer--absolute),
.navigation-drawer--persistent:not(.navigation-drawer--is-mobile).navigation-drawer--open:not(.navigation-drawer--right)~main {
  padding-left: 240px;
}
</style>
