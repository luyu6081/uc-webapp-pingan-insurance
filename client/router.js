import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

function esm (routes) {
  for (const r of routes) {
    if (typeof r.component === 'function') {
      const _component = r.component
      r.component = () => _component().then(m => m.default || m)
    }
    if (r.children) {
      esm(r.children)
    }
  }

  return routes
}

export function createRouter () {
  return new VueRouter({
    mode: 'history',
    routes: esm([
      {
        path: '/',
        name: 'uc',
        component: () => import('./pages/index.vue'),
      },
    ]),
  })
}
