// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuetify from 'vuetify';
import VueTimeago from 'vue-timeago';

import App from './App';
import router from './router';
import store from './store';

Vue.use(Vuetify);
Vue.use(VueTimeago, {
  locale: 'en-US',
  locales: {
    // you will need json-loader in webpack 1
    // eslint-disable-next-line
    'en-US': require('vue-timeago/locales/en-US.json'),
  },
});
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App },
});
