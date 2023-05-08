import errorDigest from './errorDigest'
import {makeLogger} from '@applitools/logger'
import getErrorsAndDiffs from './getErrorsAndDiffs'
import fs from 'fs'
import {formatters} from '@applitools/core'
import {resolve} from 'path'

function printTestResults(testResultsArr: any) {
  const logger = makeLogger({
    level: testResultsArr.resultConfig.showLogs ? 'info' : 'silent',
    label: 'eyes',
  })
  if (!testResultsArr.testResults) return
  const {passed, failed, diffs} = getErrorsAndDiffs(testResultsArr.testResults)
  if ((failed.length || diffs.length) && !!testResultsArr.resultConfig.eyesFailCypressOnDiff) {
    throw new Error(
      errorDigest({
        passed,
        failed,
        diffs,
        logger,
        isInteractive: !testResultsArr.resultConfig.isTextTerminal,
      }),
    )
  }
}
function handleBatchResultsFile(results: any, tapFileConfig: any) {
  const fileName = tapFileConfig.tapFileName || `${new Date().toISOString()}-eyes.tap`
  const tapFile = resolve(tapFileConfig.tapDirPath, fileName)
  return fs.writeFile(
    tapFile,
    formatters.toHierarchicTAPString(results, {includeSubTests: false, markNewAsPassed: true}),
    {},
    (err: any) => {
      if (err) throw err
    },
  )
}

export default {printTestResults, handleBatchResultsFile}
