import {InMemoryCache} from 'apollo-cache-inmemory'
import runtimeArgs from '@/runtime-args'

import {errorLink, addDatesLink} from '@/utils/http'

// Name of the localStorage item
// const AUTH_TOKEN = 'apollo-token'

export default () => {
  return {
    httpEndpoint: runtimeArgs.NUXT_ENV_MAIN_HTTP_ENDPOINT, // process.env.NUXT_ENV_MAIN_HTTP_ENDPOINT,
    // tokenName: AUTH_TOKEN,
    persisting: false,
    websocketsOnly: false,
    ssr: false,
    link: errorLink.concat(addDatesLink),
    httpLinkOptions: {
      includeExtensions: true,
      credentials: 'include', // 作用：每个请求都携带cookie
    },
    cache: new InMemoryCache({freezeResults: false}),
  }
}
