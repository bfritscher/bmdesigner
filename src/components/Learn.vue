<template>
  <v-container class="container fluid grid-list-lg">
    <v-layout row wrap>
      <v-flex xs12 md6 xl4>
        <v-card>
          <v-card-media>
            <iframe :src="asyncLinks[0]" style="border:none;width:100%;height:460px" allowfullscreen="" webkitallowfullscreen="" mozallowfullscreen="" msallowfullscreen=""></iframe>
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
            <iframe  min-width="560"  width="100%"  height="315" :src="asyncLinks[1]" frameborder="0" allowfullscreen></iframe>
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
            <iframe class="mb-5" min-width="560"  width="100%" height="315" :src="asyncLinks[2]" frameborder="0" allowfullscreen></iframe>
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
    setTimeout(() => {
      this.asyncLinks = [
        'https://e.issuu.com/issuu-reader3-embed-files/stable/embed.html?t=17385#iargs=eyJkb2N1bWVudElkIjoiMDkwOTA5MjAyODAzLWYyNTZiZTU2MWNlODQ3NGQ4MWVlM2I1YmQ0NzM4ODc4IiwidXNlcm5hbWUiOiJidXNpbmVzcy5tb2RlbC5pbm5vdmF0aW9uIiwiZG9jdW1lbnROYW1lIjoiYnVzaW5lc3NfbW9kZWxfZ2VuZXJhdGlvbl9ib29rX3ByZXZpZXdfZW1iZWQiLCJpbml0aWFsUGFnZU51bWJlciI6IjEiLCJlbWJlZElkIjoiMTMzMDAyNi8zODkyOTYzNCIsImVtYmVkQ29uZmlnIjp7Imhvc3RVcmwiOiJodHRwczovL3N0cmF0ZWd5emVyLmNvbS9ib29rcy9idXNpbmVzcy1tb2RlbC1nZW5lcmF0aW9uIiwiaG9zdFJlZmVycmVyIjoiaHR0cHM6Ly9zdHJhdGVneXplci5jb20vYm9va3MiLCJlbWJlZElkIjoiMTMzMDAyNi8zODkyOTYzNCIsImVtYmVkVHlwZSI6InNjcmlwdCIsInZpZXdNb2RlIjoiRE9VQkxFX1BBR0VfU1BSRUFEIiwiYXV0b0ZsaXAiOmZhbHNlLCJiYWNrZ3JvdW5kQ29sb3IiOiIjMzczZTQ2IiwibG9nbyI6IiIsImJhY2tncm91bmRJbWFnZSI6IiIsImJhY2tncm91bmRTdHJldGNoIjp0cnVlLCJ0aXRsZUJhckVuYWJsZWQiOmZhbHNlLCJzaGFyZU1lbnVFbmFibGVkIjpmYWxzZSwic2hhcmVCdXR0b25FbmFibGVkIjpmYWxzZSwicHJvU2lkZWJhckVuYWJsZWQiOmZhbHNlfSwibG9hZFN0YXJ0VGltZXN0YW1wIjoxNTAyMTE1MTgwMTEwLCJmZWF0dXJlcyI6eyJzaG93SXNzdXVCcmFuZGluZyI6ZmFsc2UsImZvcmNlUGFnZUZsaXAiOmZhbHNlfSwiaWRlbnRpZmllciI6IjEzMzAwMjYvMzg5Mjk2MzQtMCJ9',
        'https://www.youtube.com/embed/wwShFsSFb-Y?list=PLBh9h0LWoawphbpUvC1DofjagNqG1Qdf3',
        'https://www.youtube.com/embed/ReM1uqmVfP0',
      ];
    }, 300);
  },
};
</script>

<style>

</style>
