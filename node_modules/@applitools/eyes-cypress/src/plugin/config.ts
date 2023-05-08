import * as utils from '@applitools/utils'
import configParams from './configParams'
const DEFAULT_TEST_CONCURRENCY = 5
import * as uuid from 'uuid'
import {type EyesPluginConfig} from './'

export default function makeConfig(): {config: any; eyesConfig: EyesPluginConfig} {
  const config = utils.config.getConfig({
    params: [
      ...configParams,
      'failCypressOnDiff',
      'tapDirPath',
      'tapFileName',
      'disableBrowserFetching',
      'testConcurrency',
      'removeDuplicateTests',
      'eyesFetchConcurrency',
      'universalDebug',
    ],
  })

  if ((!config.batch || !config.batch.id) && !config.batchId) {
    config.batch = {id: uuid.v4(), ...config.batch}
  }

  if (config.failCypressOnDiff === '0') {
    config.failCypressOnDiff = false
  }

  if (utils.types.isString(config.showLogs)) {
    config.showLogs = config.showLogs === 'true' || config.showLogs === '1'
  }

  if (utils.types.isString(config.testConcurrency)) {
    config.testConcurrency = Number(config.testConcurrency)
  }

  if (config.accessibilityValidation) {
    config.accessibilitySettings = config.accessibilityValidation
    delete config.accessiblityValidation
  }

  const eyesConfig = {
    tapDirPath: config.tapDirPath,
    tapFileName: config.tapFileName,
    eyesIsDisabled: !!config.isDisabled,
    eyesBrowser: JSON.stringify(config.browser),
    eyesLayoutBreakpoints: JSON.stringify(config.layoutBreakpoints),
    eyesFailCypressOnDiff: config.failCypressOnDiff === undefined ? true : !!config.failCypressOnDiff,
    eyesDisableBrowserFetching: !!config.disableBrowserFetching,
    eyesTestConcurrency: config.testConcurrency || DEFAULT_TEST_CONCURRENCY,
    eyesWaitBeforeCapture: config.waitBeforeCapture,
    eyesRemoveDuplicateTests: !!config.removeDuplicateTests,
    universalDebug: !!config.universalDebug,
  }

  return {config, eyesConfig}
}
