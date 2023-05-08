'use strict'
import makePluginExport from './pluginExport'
import makeConfig from './config'
import makeStartServer from './server'
import {makeLogger} from '@applitools/logger'

// DON'T REMOVE
//
// if remove the `ttsc` will compile the absolute path
//
// the absolute path is added because api-extractor goes over the `eyesPlugin`
// declaration before it goes over the `EyesConfig` definition, and this is why
// it's important to reverse the order
export type EyesPluginConfig = {
  tapDirPath: string
  tapFileName: string
  eyesIsDisabled: boolean
  eyesBrowser: any
  eyesLayoutBreakpoints: any
  eyesFailCypressOnDiff: boolean
  eyesDisableBrowserFetching: boolean
  eyesTestConcurrency: number
  eyesWaitBeforeCapture: number
  eyesPort?: number
  eyesIsGlobalHooksSupported?: boolean
  eyesRemoveDuplicateTests?: boolean
  universalDebug?: boolean
}

const {config, eyesConfig} = makeConfig()
const logger = makeLogger({level: config.showLogs ? 'info' : 'silent', label: 'eyes'})

const startServer = makeStartServer({logger, eyesConfig})

const pluginExport = makePluginExport({
  startServer,
  eyesConfig: Object.assign({}, eyesConfig, {appliConfFile: config}),
})

export default pluginExport
