import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../views/MainLayout.vue';
import EditorView from '../views/EditorView.vue';
import PlayerView from '../views/PlayerView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'editor',
          component: EditorView,
        },
        {
          path: 'player',
          name: 'player',
          component: PlayerView,
        },
      ],
    },
  ],
});

export default router;
