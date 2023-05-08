import type {CypressEyesConfig} from '../expose'
import type {SpecType, Config} from '@applitools/core'
import {transformBrowsers, transformAccessibilityValidation} from './utils'

export function transformCypressConfig(config: CypressEyesConfig): Config<SpecType, 'ufg'> {
  return {
    open: {
      apiKey: config.apiKey,
      serverUrl: config.serverUrl,
      proxy: config.proxy,
      appName: config.appName,
      testName: config.testName,
      displayName: config.displayName,
      batch: {
        ...config.batch,
        id: config.batchId ?? config.batch?.id,
        name: config.batchName ?? config.batch?.name,
        sequenceName: config.batchSequenceName ?? config.batch?.sequenceName,
        notifyOnCompletion: config.notifyOnCompletion ?? config.batch?.notifyOnCompletion,
      },
      keepBatchOpen: !config.shouldUseBrowserHooks,
      environmentName: config.envName,
      baselineBranchName: config.baselineBranchName,
      branchName: config.branchName,
      parentBranchName: config.parentBranchName,
      compareWithParentBranch: config.compareWithParentBranch,
      ignoreBaseline: config.ignoreBaseline,
      ignoreGitBranching: config.ignoreGitMergeBase,
      saveDiffs: config.saveDiffs,
      properties: config.properties,
      environment: {
        viewportSize: config.viewportSize,
      },
    },
    check: {
      renderers: transformBrowsers(config.browser),
      matchLevel: config.matchLevel,
      ignoreCaret: config.ignoreCaret,
      ignoreDisplacements: config.ignoreDisplacements,
      accessibilitySettings: transformAccessibilityValidation(config.accessibilityValidation),
      layoutBreakpoints: config.layoutBreakpoints,
      sendDom: config.sendDom,
      useDom: config.useDom,
      enablePatterns: config.enablePatterns,
      ufgOptions: config.visualGridOptions,
      disableBrowserFetching: config.disableBrowserFetching,
      hooks: config.scriptHooks,
    },
    screenshot: {
      waitBeforeCapture: config.waitBeforeCapture,
    },
    close: {
      updateBaselineIfNew: config.saveNewTests,
    },
  }
}
