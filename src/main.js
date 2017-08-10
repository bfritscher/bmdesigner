// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuetify from 'vuetify';
import VueTimeago from 'vue-timeago';
import humanFormat from 'human-format';
/*
import Raven from 'raven-js';
import RavenVue from 'raven-js/plugins/vue';
*/

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

Vue.filter('humanformat', input => (isNaN(input) ? input : humanFormat(input)));
/*
Raven
  .config('https://a3e9d60494a249d4bba6e6244380e411@sentry.j42.org/15', {
    environment: process.env.NODE_ENV,
    release: 'TODO',
    shouldSendCallback: (data) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug(data);
        return false;
      }
      return true;
    },
  })
  .addPlugin(RavenVue, Vue)
  .install();
  */

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App },
});
