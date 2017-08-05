import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import BMC from '@/components/BMC';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/about',
      name: 'about',
      component: Home,
    },
    {
      path: '/inspire',
      name: 'inspire',
      component: Home,
    },
    {
      path: '/learn',
      name: 'learn',
      component: Home,
    },
    {
      path: '/bmc',
      name: 'bmc',
      component: BMC,
    },
  ],
});
