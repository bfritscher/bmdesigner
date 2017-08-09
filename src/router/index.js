import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import Learn from '@/components/Learn';
import Play from '@/components/Play';
import About from '@/components/About';
import BMC from '@/components/BMC';

Vue.use(Router);

function makeTitle(route) {
  console.log('TODO title from route', route);
  return 'test';
}

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { title: 'Home' },
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: Home,
      meta: { title: 'Favorites' },
    },
    {
      path: '/inspire',
      name: 'inspire',
      component: Home,
      meta: { title: 'Inspire' },
    },
    {
      path: '/learn',
      name: 'learn',
      component: Learn,
      meta: { title: 'Learn' },
    },
    {
      path: '/play',
      name: 'play',
      component: Play,
      meta: { title: 'Play' },
    },
    {
      path: '/about',
      name: 'about',
      component: About,
      meta: { title: 'Ideas & Feedback' },
    },
    {
      path: '/bmc',
      name: 'bmc',
      component: BMC,
      meta: { title: makeTitle },
    },
  ],
});

router.beforeEach((to, from, next) => {
  let title = 'BM|Designer';
  const subTitle = typeof to.meta.title === 'string' ? to.meta.title : to.meta.title(to);
  if (subTitle) {
    title += ` | ${subTitle}`;
  }
  document.title = title;
  next();
});

export default router;
