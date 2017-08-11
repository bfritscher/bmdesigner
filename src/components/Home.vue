<template>
  <v-container fluid grid-list-lg>
    <v-layout row wrap>
      <v-btn v-if="$store.state.currentUser" fab primary dark class="floating-action" @click.native="createNewCanvas">
        <v-icon>add</v-icon>
      </v-btn>
      <v-flex sm6 md4 xl3 v-for="(m, key) in user.projects" :key="key">
        <v-card class="model">
          <v-card-media @click.native="$router.push({name:'bmc', params: {id: key}})" :contain="!!m.logoImage" :class="{'default-background': !m.logoImage}" :style="{'background-color': m.logoColor ? m.logoColor : colorHash(m.name)}" :src="m.logoImage ? m.logoImage : require('@/assets/default_bmc_logo_background.jpg')">
            <div class="left-icons" v-if="m.updatedAt">
              <v-icon>
                event_note
              </v-icon>
              <timeago :since="m.updatedAt"></timeago>
            </div>
            <div class="right-icons">
              <v-icon v-badge="{value: m.itemsCount || 0, overlap: true, bottom: true}">
                note
              </v-icon>
              <v-icon v-badge="{value: m.usersCount || 0, overlap: true, bottom: true}">
                account_box
              </v-icon>
            </div>
            <v-container fill-height fluid>
              <v-layout fill-height>
                <v-flex xs12 align-end flexbox>
                  <span class="headline white--text">{{m.name}}</span>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-media>
          <v-card-actions class="white">
            <v-btn icon light @click.native="toggleFav(m)">
              <v-icon :primary="m.fav">favorite</v-icon>
            </v-btn>
            <v-btn icon light>
              <v-icon>share</v-icon>
            </v-btn>
            <v-btn icon light v-if="m.public">
              <v-icon primary>public</v-icon>
            </v-btn>
            <v-btn icon light v-if="!m.public">
              <v-icon>lock</v-icon>
            </v-btn>
            <v-btn icon light>
              <v-icon>content_copy</v-icon>
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn flat primary :to="{name:'bmc', params: {id: key}}">Open</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import ColorHash from 'color-hash';
import { mapActions, mapState } from 'vuex';

const colorHash = new ColorHash({
  saturation: [0.35, 0.4],
  lightness: [0.6, 0.65],
});

export default {
  name: 'home',
  data() {
    return {
      models: [
        {
          title: 'SodaStream',
          date: '2015-08-07T08:57:28.244Z',
          nb: 4,
          users: [

          ],
        },
        {
          title: 'Cirque du Soleil',
          date: '2017-08-01',
          nb: 4,
          users: [

          ],
        },
        {
          title: 'Nespresso',
          logo: 'http://logodatabases.com/wp-content/uploads/2012/06/nespresso-logo.jpg',
          color: 'black',
          date: new Date().toISOString(),
          nb: 45,
          fav: true,
          public: true,
          users: [
            'a',
          ],
        },
        {
          title: 'AirBnb',
          date: '2017-08-06T08:57:28.244Z',
          nb: 25,
          users: [

          ],
        },
        {
          title: 'Hilti',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Hilti_logo.svg/2000px-Hilti_logo.svg.png',
          color: 'rgb(236, 28, 36)',
          date: '2017-07-07T08:57:28.244Z',
          nb: 7,
          fav: true,
          users: [

          ],
        },
      ],
    };
  },
  computed: {
    ...mapState({
      user: 'user',
    }),
  },
  methods: {
    ...mapActions(['createNewCanvas']),
    colorHash(input) {
      return colorHash.hex(input);
    },
    toggleFav(m) {
      m.fav = !m.fav;
    },
  },
};
</script>

<style>

.model .card__media {
  height: 160px !important;
}

.model .card__media__background {
  opacity: 0.8;
}

.model .default-background .card__media__background {
  opacity: 0.5;
  background-position: 0 0 !important;
}

.model .badge--overlap.badge--bottom:after {
  font-size: 12px;
  height: 18px;
  width: 18px;
}

.model .right-icons {
  position: absolute;
  top: 0px;
  right: 15px;
  display: flex;
  flex-direction: column;
}

.model .left-icons {
  position: absolute;
  top: 5px;
  left: 10px;
  color: #fff;
}

.model .card__media .icon {
  margin: 4px 0;
  color: rgba(255, 255, 255, 0.7);
}

.floating-action {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 1;
}
</style>
