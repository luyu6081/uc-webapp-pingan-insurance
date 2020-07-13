import {resolve} from 'path'

export default async function () {
  this.addPlugin(resolve(__dirname, '../plugins/runtime-args.js'))
}
