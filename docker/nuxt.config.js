export default {
  mode: 'spa',
  modules: [
    '@nuxtjs/proxy',
  ],
  proxy: {
    // '/graphql': process.env.NUXT_ENV_MAIN_HTTP_ENDPOINT,
  },
}
