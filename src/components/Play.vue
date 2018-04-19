<template>
    <div>
        <div>
            <v-btn @click.native="playGame">Nespresso</v-btn>
        </div>
        <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSfoS2yHOUHkY3J4MwaLWRRwYy2HZOWXlhIHPtpkEVvXy2W2Fw/viewform?embedded=true" style="position: absolute; top:120px; left:0; right:0; bottom:0;width:100%;height:100%;" frameborder="0" marginheight="0" marginwidth="0">Loading...</iframe>
    </div>
</template>

<script>
import * as types from '@/store/mutation-types';
import nespresso from '@/assets/nespresso.json';

export default {
  methods: {
    playGame() {
      this.$store.commit(types.LAYOUT_UPDATE, { showLoading: 'Preparing game...' });
      fetch(
        'https://us-central1-bmdesigner-50d6c.cloudfunctions.net/importJSONProject',
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify(nespresso),
        },
      )
        .then(res => res.text())
        .then((url) => {
          window.location = url;
        });
    },
  },
};
</script>

<style>

</style>
