import {getRuntimeArgs} from '~/runtime-args'

export default async function ({env}) {
  const args = await getRuntimeArgs()
  Object.assign(env, args)
}
