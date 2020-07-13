// import path from 'path'
// import dotenv from 'dotenv'

// if (process.env.NODE_ENV === 'development') {
//   dotenv.config({path: path.join(__dirname, '.env.development')})
// }

export default {
  srcDir: 'client/',
  mode: 'spa',
  head: {
    title: '个人中心',
    meta: [
      {charset: 'utf-8'},
      {httpEquiv: 'X-UA-Compatible', content: 'IE=edge'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1'},
    ],
    link: [
      {rel: 'icon', type: 'image/png', href: '/favicon.png'},
    ],
  },
  loading: {color: '#fff', duration: 2000},
  css: [
    'element-ui/lib/theme-chalk/index.css',
    '~/assets/css/base.scss',
  ],
  router: {
    middleware: 'auth',
  },
  plugins: [
    '@/plugins/element-ui',
    {src: '@/plugins/svg4everybody', mode: 'client'},
  ],
  buildModules: [
    '@nuxtjs/eslint-module',
  ],
  modules: [
    '@nuxtjs/router',
    // '@nuxtjs/proxy',
    '@ej/app-nuxt-module',
    '~/modules/runtime-args',
  ],
  // proxy: {
  //   '/graphql': {
  //     target: process.env.NUXT_ENV_MAIN_HTTP_ENDPOINT,
  //     changeOrigin: true,
  //     pathRewrite: {
  //       '^/graphql': '/graphql',
  //     },
  //   },
  // },
  apollo: {
    defaultOptions: {
      httpLinkOptions: {
        includeExtensions: true,
        credentials: 'include', // 作用：每个请求都携带cookie
      },
    },
    clientConfigs: {
      default: '~/plugins/client-config-default.js', // '~/schema',
      ucClient: '~/plugins/auth-config.js',
      mds: '~/plugins/mds-config.js',
    },
  },
  serverMiddleware: [
    {
      path: '/runtime-args.json',
      handler (req, res, next) {
        res.end(JSON.stringify(require('./runtime-args.dev')))
      },
    },
  ],
  build: {
    postcss: {
      plugins: {
        tailwindcss: './tailwind.config.js',
        autoprefixer: {}
        ,
      },
      transpile: [
        /^element-ui/,
        /^@ej\//,
      ],
      extend (config, {isDev}) {
        config.devtool = isDev ? 'cheap-module-eval-source-map' : false
      },
    },
  },
}
