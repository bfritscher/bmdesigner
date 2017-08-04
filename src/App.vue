<template>
  <v-app dark toolbar>
    <v-navigation-drawer light class="drawer" persistent enable-resize-watcher clipped v-model="drawer">
      <v-list dense>
        <v-list-tile v-for="item in items" :key="item.text">
          <v-list-tile-action>
            <v-icon light>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              {{ item.text }}
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-divider
            class="my-2"
          ></v-divider>

        <v-subheader class="mt-2 grey--text text--darken-1">SUBSCRIPTIONS</v-subheader>

        <v-list>
          <v-list-tile v-for="item in items2" :key="item.text" avatar>
            <v-list-tile-avatar>
              <img :src="`https://randomuser.me/api/portraits/men/${item.picture}.jpg`" alt="">
            </v-list-tile-avatar>
            <v-list-tile-title v-text="item.text"></v-list-tile-title>
          </v-list-tile>
        </v-list>

          <v-divider
            class="my-2"
          ></v-divider>

        <v-list-tile class="mt-2">
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
    </v-navigation-drawer>
    <!--
    <v-navigation-drawer
        right
        persistent
        clipped
        v-model="right"
      ></v-navigation-drawer>
      -->
    <v-toolbar fixed>
      <v-toolbar-side-icon @click.native.stop.prevent="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>BM|DESIGNER</v-toolbar-title>
      <v-spacer></v-spacer>
      <transition name="title-fade-transition" mode="out-in"><v-toolbar-title :key="title">{{title}}</v-toolbar-title></transition>
      <v-spacer></v-spacer>
      <v-btn icon>
        <v-icon>more_vert</v-icon>
      </v-btn>
    </v-toolbar>
    <main>
      <v-container fluid style="position: relative">
        <bmc></bmc>
        <vpc></vpc>
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
      right: true,
      items: [
        { icon: 'trending_up', text: 'Most Popular' },
        { icon: 'subscriptions', text: 'Subscriptions' },
        { icon: 'history', text: 'History' },
        { icon: 'featured_play_list', text: 'Playlists' },
        { icon: 'watch_later', text: 'Watch Later' },
      ],
      items2: [
        { picture: 28, text: 'Joseph' },
        { picture: 38, text: 'Apple' },
        { picture: 48, text: 'Xbox Ahoy' },
        { picture: 58, text: 'Nokia' },
        { picture: 78, text: 'MKBHD' },
      ],
    };
  },
  computed: {
    title() {
      const type = this.$store.state.layout.showVPC ? 'Value Proposition Canvas' : 'Business Model Canvas';
      return `Test 123 - ${type}`;
    },
  },
  components: {
    Bmc,
    Vpc,
  },
};
</script>

<style lang="stylus">
@import './stylus/main'

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

.title-fade-transition-enter-active {
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

.title-fade-transition-leave-active {
  transition: all 0.3s cubic-bezier(0.755, 0.05, 0.855, 0.06);
}

.title-fade-transition-enter,
.title-fade-transition-leave-to {
  opacity: 0;
}
</style>
