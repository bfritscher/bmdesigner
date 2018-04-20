<template>
  <v-container class="container fluid grid-list-lg">
    <v-layout row wrap>
      <v-flex xs12 md6 xl4>
        <v-card>
          <v-card-media>
            <div ref="issue" data-configid="1330026/38929634" style="width:100%;height:460px;" class="issuuembed"></div>
          </v-card-media>
          <v-card-title primary-title>
            <div>
              <h2 class="headline">Business Model Canvas</h2>
              <p class="black--text">
                Free Book Preview, more on
                <a href="https://strategyzer.com/books/business-model-generation">Strategyzer's Book Page</a>
              </p>
            </div>
          </v-card-title>
        </v-card>
      </v-flex>

      <v-flex xs12 md6 xl4>
        <v-card>
          <v-card-media>
            <iframe  min-width="560"  width="100%"  height="315" :src="asyncLinks[0]" frameborder="0" allowfullscreen></iframe>
          </v-card-media>
          <v-card-title primary-title>
            <h2 class="headline">From Idea to Business</h2>
            <p class="black--text">6 video episodes by Strategyzer & The Kauffman Foundation</p>
          </v-card-title>
        </v-card>
      </v-flex>

      <v-flex xs12 md6 xl4>
        <v-card>
          <v-card-media>
            <iframe class="mb-5" min-width="560"  width="100%" height="315" :src="asyncLinks[1]" frameborder="0" allowfullscreen></iframe>
          </v-card-media>
          <v-card-title primary-title>
            <h2 class="headline">Value Proposition Canvas Explained</h2>
          </v-card-title>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      asyncLinks: [],
    };
  },
  mounted() {
    const s = document.createElement('script');
    s.src = '//e.issuu.com/embed.js';
    s.async = true;
    this.$refs.issue.append(s);
    setTimeout(() => {
      this.asyncLinks = [
        'https://www.youtube.com/embed/wwShFsSFb-Y?list=PLBh9h0LWoawphbpUvC1DofjagNqG1Qdf3',
        'https://www.youtube.com/embed/ReM1uqmVfP0',
      ];
    }, 300);
  },
};
</script>

<style>

</style>
