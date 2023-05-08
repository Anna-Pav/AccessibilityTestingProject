import isGlobalHooksSupported from './isGlobalHooksSupported'
// @ts-ignore
import {presult} from '@applitools/functional-commons'
import makeGlobalRunHooks from './hooks'
import {type EyesPluginConfig} from './'
import {type StartServerReturn} from './server'

export default function makePluginExport({
  startServer,
  eyesConfig,
}: {
  startServer: (options?: Cypress.PluginConfigOptions) => Promise<StartServerReturn>
  eyesConfig: EyesPluginConfig
}) {
  return function pluginExport(pluginInitArgs: Cypress.ConfigOptions | NodeJS.Module) {
    let eyesServer: any, pluginModuleExports: any, pluginExportsE2E: any, pluginExportsComponent: any
    let pluginExports
    if ((pluginInitArgs as NodeJS.Module).exports) {
      const pluginAsNodeJSModule = pluginInitArgs as NodeJS.Module
      pluginExports =
        pluginAsNodeJSModule.exports && pluginAsNodeJSModule.exports.default
          ? pluginAsNodeJSModule.exports.default
          : pluginAsNodeJSModule.exports

      if (pluginExports.component) {
        pluginExportsComponent = pluginExports.component.setupNodeEvents
      }
      if (pluginExports.e2e) {
        pluginExportsE2E = pluginExports.e2e.setupNodeEvents
      }
      if (!pluginExports.e2e && !pluginExports.component) {
        pluginModuleExports = pluginExports
      }
      if (pluginExports?.component) {
        pluginExports.component.setupNodeEvents = setupNodeEvents
      }
      if (pluginExports?.e2e) {
        pluginExports.e2e.setupNodeEvents = setupNodeEvents
      }
      if (!pluginExports.component && !pluginExports.e2e) {
        if (pluginAsNodeJSModule.exports.default) {
          pluginAsNodeJSModule.exports.default = setupNodeEvents
        } else {
          pluginAsNodeJSModule.exports = setupNodeEvents
        }
      }
    } else {
      // this is required because we are currently support cypress < 10
      // in the version before 10 the `e2e.setupNodeEvents` and `component.setupNodeEvents` were not supported
      const pluginAsCypress10PluginOptions = pluginInitArgs as {e2e: {setupNodeEvents: any}; component: {setupNodeEvents: any}}
      if (pluginAsCypress10PluginOptions.component) {
        pluginExportsComponent = pluginAsCypress10PluginOptions.component.setupNodeEvents
        pluginAsCypress10PluginOptions.component.setupNodeEvents = setupNodeEvents
      }
      if (pluginAsCypress10PluginOptions.e2e) {
        pluginExportsE2E = pluginAsCypress10PluginOptions.e2e.setupNodeEvents
        pluginAsCypress10PluginOptions.e2e.setupNodeEvents = setupNodeEvents
      }
    }

    if (!(pluginInitArgs as NodeJS.Module).exports) {
      return pluginInitArgs
    }
    return function getCloseServer() {
      return new Promise<void>(res => eyesServer.close(() => res()))
    }

    async function setupNodeEvents(
      origOn: Cypress.PluginEvents,
      cypressConfig: Cypress.PluginConfigOptions,
    ): Promise<EyesPluginConfig> {
      const {server, port, closeManager, closeBatches, closeUniversalServer} = await startServer(cypressConfig)
      eyesServer = server

      const globalHooks: any = makeGlobalRunHooks({
        closeManager,
        closeBatches,
        closeUniversalServer,
      })

      if (!pluginModuleExports) {
        pluginModuleExports = cypressConfig.testingType === 'e2e' ? pluginExportsE2E : pluginExportsComponent
      }

      const isGlobalHookCalledFromUserHandlerMap = new Map()
      eyesConfig.eyesIsGlobalHooksSupported = isGlobalHooksSupported(cypressConfig)
      let moduleExportsResult = {}
      // in case setupNodeEvents is not defined in cypress.config file
      if (typeof pluginModuleExports === 'function') {
        moduleExportsResult = await pluginModuleExports(onThatCallsUserDefinedHandler, cypressConfig)
      }
      if (eyesConfig.eyesIsGlobalHooksSupported) {
        for (const [eventName, eventHandler] of Object.entries(globalHooks)) {
          if (!isGlobalHookCalledFromUserHandlerMap.get(eventName)) {
            origOn.call(this, eventName, eventHandler)
          }
        }
      }

      return Object.assign({}, eyesConfig, {eyesPort: port}, moduleExportsResult)

      // This piece of code exists because at the point of writing, Cypress does not support multiple event handlers:
      // https://github.com/cypress-io/cypress/issues/5240#issuecomment-948277554
      // So we wrap Cypress' `on` function in order to wrap the user-defined handler. This way we can call our own handler
      // in addition to the user's handler
      function onThatCallsUserDefinedHandler(eventName: string, handler: any) {
        const isRunEvent = eventName === 'before:run' || eventName === 'after:run'
        let handlerToCall = handler
        if (eyesConfig.eyesIsGlobalHooksSupported && isRunEvent) {
          handlerToCall = handlerThatCallsUserDefinedHandler
          isGlobalHookCalledFromUserHandlerMap.set(eventName, true)
        }
        return origOn.call(this, eventName, handlerToCall)

        async function handlerThatCallsUserDefinedHandler(...args: any[]) {
          const [err] = await presult(Promise.resolve(globalHooks[eventName].apply(this, args)))
          await handler.apply(this, args)
          if (err) {
            throw err
          }
        }
      }
    }
  }
}
