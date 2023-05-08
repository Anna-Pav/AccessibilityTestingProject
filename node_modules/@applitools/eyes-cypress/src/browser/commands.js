/* global Cypress,cy,after */
'use strict'
const spec = require('../../dist/browser/spec-driver')
const Refer = require('./refer')
const Socket = require('./socket')
const {socketCommands} = require('./socketCommands')
const {TestResultsSummary} = require('@applitools/eyes-api')
const refer = new Refer()
const socket = new Socket()
const throwErr = Cypress.config('failCypressOnDiff')
const {transformCypressConfig} = require('../../dist/browser/transformCypressConfig')
const {mergeCypressConfigs} = require('../../dist/browser/mergeCypressConfigs')
const {transformCypressCheckSettings} = require('../../dist/browser/transformCypressCheckSettings')
socketCommands(socket, refer)

let manager,
  eyes,
  closePromiseArr = [],
  _summary,
  connectedToUniversal,
  openAndGlobalConfig

async function getSummary() {
  if (_summary) return _summary
  await Promise.all(closePromiseArr)
  const removeDuplicateTests = Cypress.config('eyesRemoveDuplicateTests')
  _summary = socket
    .request('EyesManager.getResults', {manager, settings: {throwErr, removeDuplicateTests}})
    .catch(err => {
      return {results: [{result: err.info.result}]}
    })
  _summary = await _summary

  return _summary
}

function getGlobalConfigProperty(prop) {
  const property = Cypress.config(prop)
  const shouldParse = ['eyesBrowser', 'eyesLayoutBreakpoints']
  return property ? (shouldParse.includes(prop) ? JSON.parse(property) : property) : undefined
}

const shouldUseBrowserHooks =
  !getGlobalConfigProperty('eyesIsDisabled') &&
  (getGlobalConfigProperty('isInteractive') || !getGlobalConfigProperty('eyesIsGlobalHooksSupported'))

Cypress.Commands.add('eyesGetAllTestResults', () => {
  Cypress.log({name: 'Eyes: getAllTestResults'})
  return cy.then({timeout: 86400000}, async () => {
    if (isCurrentTestDisabled) {
      isCurrentTestDisabled = false
      return
    }

    const deleteTest = ({settings: {testId, batchId, secretToken}}) => {
      const {serverUrl, proxy, apiKey} = Cypress.config('appliConfFile')
      return socket.request('Core.deleteTest', {
        settings: {
          testId,
          batchId,
          secretToken,
          serverUrl,
          proxy,
          apiKey,
        },
      })
    }
    const summary = await getSummary()
    return new TestResultsSummary({summary, deleteTest})
  })
})

if (shouldUseBrowserHooks || Cypress.config('eyesFailCypressOnDiff')) {
  after(() => {
    if (!manager) return
    return cy.then({timeout: 86400000}, async () => {
      if (isCurrentTestDisabled) {
        isCurrentTestDisabled = false
        return
      }
      const resultConfig = {
        showLogs: Cypress.config('appliConfFile').showLogs,
        eyesFailCypressOnDiff: Cypress.config('eyesFailCypressOnDiff'),
        isTextTerminal: Cypress.config('isTextTerminal'),
        tapDirPath: Cypress.config('appliConfFile').tapDirPath,
        tapFileName: Cypress.config('appliConfFile').tapFileName,
        shouldCreateTapFile: shouldUseBrowserHooks,
      }

      const summary = await getSummary()
      const testResults = summary.results.map(({result}) => result)
      const message = await socket.request('Test.printTestResults', {testResults, resultConfig})
      if (
        !!getGlobalConfigProperty('eyesFailCypressOnDiff') &&
        message &&
        message.includes('Eyes-Cypress detected diffs or errors')
      ) {
        throw new Error(message)
      }
    })
  })
}

let isCurrentTestDisabled

Cypress.Commands.add('eyesOpen', function (args = {}) {
  Cypress.log({name: 'Eyes: open'})
  Cypress.config('eyesOpenArgs', args)
  const {title: testName} = this.currentTest || this.test || Cypress.currentTest

  if (Cypress.config('eyesIsDisabled') && args.isDisabled === false) {
    throw new Error(
      `Eyes-Cypress is disabled by an env variable or in the applitools.config.js file, but the "${testName}" test was passed isDisabled:false. A single test cannot be enabled when Eyes.Cypress is disabled through the global configuration. Please remove "isDisabled:false" from cy.eyesOpen() for this test, or enable Eyes.Cypress in the global configuration, either by unsetting the APPLITOOLS_IS_DISABLED env var, or by deleting 'isDisabled' from the applitools.config.js file.`,
    )
  }
  isCurrentTestDisabled = getGlobalConfigProperty('eyesIsDisabled') || args.isDisabled
  if (isCurrentTestDisabled) return

  return cy.then({timeout: 86400000}, async () => {
    setRootContext()
    const target = refer.ref(cy.state('window').document)

    if (!connectedToUniversal) {
      socket.connect(`wss://localhost:${Cypress.config('eyesPort')}/eyes`)
      connectedToUniversal = true
      socket.emit('Core.makeCore', {
        agentId: `eyes.cypress/${require('../../package.json').version}`,
        cwd: Cypress.config('projectRoot'),
        spec: Object.keys(spec).concat(['isSelector', 'isDriver', 'isElement']), // TODO fix spec.isSelector and spec.isDriver and spec.isElement in driver
      })

      manager =
        manager ||
        (await socket.request('Core.makeManager', {
          settings: {
            concurrency: Cypress.config('eyesTestConcurrency'),
            fetchConcurrency: Cypress.config('appliConfFile').eyesFetchConcurrency,
          },
          type: 'ufg',
        }))
    }

    const appliConfFile = Cypress.config('appliConfFile')
    const mergedConfig = mergeCypressConfigs({globalConfig: appliConfFile, openConfig: {testName, ...args}})
    openAndGlobalConfig = transformCypressConfig({...mergedConfig, shouldUseBrowserHooks})

    eyes = await socket.request('EyesManager.openEyes', {manager, target, config: openAndGlobalConfig})
  })
})

Cypress.Commands.add('eyesCheckWindow', (args = {}) =>
  cy.then({timeout: 86400000}, () => {
    if (isCurrentTestDisabled) return

    setRootContext()
    const target = refer.ref(cy.state('window').document)

    Cypress.log({name: 'Eyes: check window'})

    const settings = transformCypressCheckSettings(args, refer)

    return socket.request('Eyes.check', {
      eyes,
      settings,
      target,
      config: openAndGlobalConfig,
    })
  }),
)

Cypress.Commands.add('eyesClose', () => {
  return cy.then({timeout: 86400000}, () => {
    if (isCurrentTestDisabled) return

    Cypress.log({name: 'Eyes: close'})
    if (isCurrentTestDisabled) {
      isCurrentTestDisabled = false
      return
    }

    // Eyes.close in core is not waiting on results anymore. So we should return it in order to await it
    const p = socket.request('Eyes.close', {eyes, config: openAndGlobalConfig}).catch(err => {
      console.log('Error in cy.eyesClose', err)
    })
    closePromiseArr.push(p)
    return p
  })
})

// internal command //
Cypress.Commands.add('debugHistory', async function () {
  Cypress.log({name: 'Debug: history'})
  const history = await socket.request('Debug.getHistory')

  return history
})

function setRootContext() {
  cy.state('window').document['applitools-marker'] = 'root-context'
}
