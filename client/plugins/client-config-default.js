import Vue from 'vue'
import {onError} from 'apollo-link-error'
import runtimeArgs from '@/runtime-args'

const httpLogin = runtimeArgs.NUXT_ENV_LOGIN_URL // process.env.NUXT_ENV_LOGIN_URL //'http://login.demo.jinxin.cloud/'

function goto () {
  let url = `${httpLogin}?redirect_url=${encodeURIComponent(location.href)}`
  console.log(url)
  location.href = url
}


export default () => {
  const link = onError(({graphQLErrors, networkError}) => {
    if (graphQLErrors) {
      let extensions = graphQLErrors[0].extensions
      if (extensions) {
        let code = graphQLErrors[0].extensions.code
        console.log(code)
        if (code === '401'){
          goto()
        } else {
          let message = ''
          if (code === '400') {
            message = '参数错误'
          } else if (code === '500') {
            message = '后端服务不可用，请联系管理员'
          }
          Vue.prototype.$message({
            type: 'error',
            message,
          })
          console.log(extensions)
        }
      } else {
        // 其他的错误 去单独的接口中处理
      }
    }
    if (networkError) {
      console.log(`[Network error]: ${networkError}`)
      throw Error(networkError.message)
    }
  })

  return {
    link,
    httpEndpoint: '/graphql',
  }
}
