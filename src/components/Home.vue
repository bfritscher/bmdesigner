<template>
  <v-container fluid grid-list-lg>
    <v-layout row wrap>
      <v-flex sm6 md4 xl3 v-for="(m, i) in models" :key="i">
        <v-card hover class="model">
          <v-card-media  :contain="!!m.logo" :class="{'default-background': !m.logo}" :style="{'background-color': m.color ? m.color : colorHash(m.title)}" :src="m.logo ? m.logo : 'http://www.leanpump.com/wp-content/uploads/2015/03/IMG_8493-1080x675.jpg'" height="200px">
            <!-- :src="'http://lorempixel.com/400/200/?' + i" -->
            <v-container fill-height fluid>
              <v-layout fill-height>
                <v-flex xs12 align-end flexbox>
                  <span class="headline white--text">{{m.title}}</span>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-media>
          <v-card-actions class="white">
            <v-spacer></v-spacer>
            <v-btn icon>
              <v-icon>favorite</v-icon>
            </v-btn>
            <v-btn icon>
              <v-icon>bookmark</v-icon>
            </v-btn>
            <v-btn icon>
              <v-icon>share</v-icon>
            </v-btn>
            <v-btn flat>Share</v-btn>
            <v-btn>Duplicate</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import ColorHash from 'color-hash';

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
          date: '',
          nb: 4,
          users: [

          ],
        },
        {
          title: 'Cirque du Soleil',
          date: '',
          nb: 4,
          users: [

          ],
        },
        {
          title: 'Nespresso',
          logo: 'http://logodatabases.com/wp-content/uploads/2012/06/nespresso-logo.jpg',
          color: 'black',
          date: '',
          nb: 0,
          users: [

          ],
        },
        {
          title: 'AirBnb',
          date: '',
          nb: 25,
          users: [

          ],
        },
        {
          title: 'Hilti',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Hilti_logo.svg/2000px-Hilti_logo.svg.png',
          color: 'rgb(236, 28, 36)',
          date: '',
          nb: 7,
          users: [

          ],
        },
      ],
    };
  },
  methods: {
    colorHash(input) {
      return colorHash.hex(input);
    },
  },
};
</script>

<style>

.model .card__media__background {
  opacity: 0.8;
}
.model .default-background .card__media__background {
  opacity: 0.5;
  background-position: 0 0;
}
</style>
