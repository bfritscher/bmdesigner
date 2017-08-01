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
        <bmc></bmc>
        <!-- <vpc></vpc> -->
        <router-view></router-view>
        </v-layout>
      </v-container>
    </main>
  </v-app>
</template>

<script>
import Bmc from './components/BMC';
import Vpc from './components/VPC';

export default {
  name: 'app',
  data() {
    return {
      drawer: true,
    };
  },
  components: {
    Bmc,
    Vpc,
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


.navigation-drawer {
  width: 240px;
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
